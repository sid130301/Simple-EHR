"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarPlus, ClipboardList, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import type { OpdVisit, PageResult, Patient } from "@/types/api";

type VisitForm = {
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  followUpAt: string;
};

const nowForInput = () => new Date().toISOString().slice(0, 16);

export default function OpdPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<OpdVisit[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<VisitForm>({
    patientId: "",
    date: nowForInput(),
    symptoms: "",
    diagnosis: "",
    prescription: "",
    followUpAt: ""
  });
  const { token } = useAuth();
  const { showToast } = useToast();

  function loadVisits(patientId = selectedPatientId) {
    if (!token) {
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ page: "1", limit: "20" });
    if (patientId) {
      params.set("patientId", patientId);
    }

    apiFetch<PageResult<OpdVisit>>(`/opd?${params.toString()}`, { token })
      .then((result) => setVisits(result.items))
      .catch((error) => showToast({ title: error.message, tone: "error" }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    Promise.all([
      apiFetch<PageResult<Patient>>("/patients?limit=50", { token }),
      apiFetch<PageResult<OpdVisit>>("/opd?limit=20", { token })
    ])
      .then(([patientResult, visitResult]) => {
        setPatients(patientResult.items);
        setVisits(visitResult.items);
      })
      .catch((error) => showToast({ title: error.message, tone: "error" }))
      .finally(() => setLoading(false));
  }, [token, showToast]);

  function openCreate() {
    setForm({
      patientId: selectedPatientId || patients[0]?.id || "",
      date: nowForInput(),
      symptoms: "",
      diagnosis: "",
      prescription: "",
      followUpAt: ""
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    try {
      await apiFetch<OpdVisit>("/opd", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          followUpAt: form.followUpAt ? form.followUpAt : null
        })
      });
      showToast({ title: "OPD visit recorded", tone: "success" });
      setModalOpen(false);
      loadVisits(selectedPatientId);
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Unable to save OPD visit", tone: "error" });
    }
  }

  return (
    <div className="animate-fade space-y-5">
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>OPD</CardTitle>
            <CardDescription>Create visits, record prescriptions, and track patient follow-ups.</CardDescription>
          </div>
          <Button onClick={openCreate} disabled={!patients.length}>
            <Plus className="mr-2 h-4 w-4" />
            New OPD visit
          </Button>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Select
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              loadVisits(event.target.value);
            }}
          >
            <option value="">All patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={() => loadVisits(selectedPatientId)}>
            View history
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </Card>
      ) : (
        <div className="grid gap-4">
          {visits.map((visit) => (
            <Card key={visit.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{visit.patient?.name ?? "Patient"}</h2>
                    <Badge tone="blue">{formatDate(visit.date)}</Badge>
                    {visit.followUpAt ? <Badge tone="amber">Follow-up {formatDate(visit.followUpAt)}</Badge> : null}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <VisitBlock title="Symptoms" value={visit.symptoms} />
                    <VisitBlock title="Diagnosis" value={visit.diagnosis} />
                    <VisitBlock title="Prescription" value={visit.prescription} />
                  </div>
                </div>
                <div className="rounded-2xl bg-stone-100 px-4 py-3 text-sm dark:bg-white/10">
                  <p className="font-bold">{visit.clinician?.name ?? "Care team"}</p>
                  <p className="text-stone-500 dark:text-stone-400">{visit.clinician?.role ?? "Clinician"}</p>
                </div>
              </div>
            </Card>
          ))}
          {!visits.length ? (
            <Card className="grid place-items-center py-12 text-center">
              <ClipboardList className="h-10 w-10 text-stone-400" />
              <p className="mt-3 font-bold">No OPD records found</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">Create a visit to start this patient history.</p>
            </Card>
          ) : null}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create OPD Visit" description="Capture the visit in the smallest safe number of fields.">
        <form className="grid gap-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select required value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })}>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input required type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <Textarea required value={form.symptoms} onChange={(event) => setForm({ ...form, symptoms: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea required value={form.diagnosis} onChange={(event) => setForm({ ...form, diagnosis: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Prescription</Label>
              <Textarea required value={form.prescription} onChange={(event) => setForm({ ...form, prescription: event.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Follow-up scheduling</Label>
            <Input type="datetime-local" value={form.followUpAt} onChange={(event) => setForm({ ...form, followUpAt: event.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Save visit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function VisitBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">{title}</p>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}
