"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Gender, PatientCreateInput } from "@ehr/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PageResult, Patient } from "@/types/api";

const emptyForm: PatientCreateInput = {
  name: "",
  age: 0,
  gender: "OTHER",
  contact: "",
  address: "",
  medicalHistory: ""
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientCreateInput>(emptyForm);
  const { token, user } = useAuth();
  const { showToast } = useToast();

  function load(page = meta.page) {
    if (!token) {
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(meta.limit)
    });
    if (search) {
      params.set("search", search);
    }
    if (gender) {
      params.set("gender", gender);
    }

    apiFetch<PageResult<Patient>>(`/patients?${params.toString()}`, { token })
      .then((result) => {
        setPatients(result.items);
        setMeta(result.meta);
      })
      .catch((error) => showToast({ title: error.message, tone: "error" }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1);
  }, [token]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(patient: Patient) {
    setEditing(patient);
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
      address: patient.address,
      medicalHistory: patient.medicalHistory
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    try {
      if (editing) {
        await apiFetch<Patient>(`/patients/${editing.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(form)
        });
        showToast({ title: "Patient updated", tone: "success" });
      } else {
        await apiFetch<Patient>("/patients", {
          method: "POST",
          token,
          body: JSON.stringify(form)
        });
        showToast({ title: "Patient created", tone: "success" });
      }
      setModalOpen(false);
      load(1);
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Unable to save patient", tone: "error" });
    }
  }

  async function remove(patient: Patient) {
    if (!token || !confirm(`Delete ${patient.name}?`)) {
      return;
    }

    try {
      await apiFetch(`/patients/${patient.id}`, { method: "DELETE", token });
      showToast({ title: "Patient deleted", tone: "success" });
      load(meta.page);
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Unable to delete patient", tone: "error" });
    }
  }

  async function exportPdf(patient: Patient) {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/patients/${patient.id}/export/pdf`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Unable to export PDF");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${patient.name.replace(/\s+/g, "-")}-summary.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      showToast({ title: "Patient PDF exported", tone: "success" });
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Unable to export PDF", tone: "error" });
    }
  }

  return (
    <div className="animate-fade space-y-5">
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Search, filter, register, edit, delete, and export patient summaries.</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New patient
          </Button>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
            <Input className="pl-10" placeholder="Search name, contact, history..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={gender} onChange={(event) => setGender(event.target.value as Gender | "")}>
            <option value="">All genders</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </Select>
          <Button variant="secondary" onClick={() => load(1)}>
            Apply filters
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/70 text-xs uppercase tracking-[0.16em] text-stone-500 dark:border-white/10 dark:bg-white/5">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Age</th>
                  <th className="px-5 py-4">Gender</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">History</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-stone-100 last:border-0 dark:border-white/10">
                    <td className="px-5 py-4 font-bold">{patient.name}</td>
                    <td className="px-5 py-4">{patient.age}</td>
                    <td className="px-5 py-4">
                      <Badge>{patient.gender.toLowerCase()}</Badge>
                    </td>
                    <td className="px-5 py-4">{patient.contact}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-stone-500 dark:text-stone-400">{patient.medicalHistory || "None"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => exportPdf(patient)} aria-label="Export PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => openEdit(patient)} aria-label="Edit patient">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user?.role !== "NURSE" ? (
                          <Button variant="ghost" className="h-9 w-9 p-0 text-rose-600" onClick={() => remove(patient)} aria-label="Delete patient">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span>
          Page {meta.page} of {meta.totalPages} · {meta.total} patients
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>
            Previous
          </Button>
          <Button variant="secondary" disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Patient" : "Create Patient"}
        description="Keep this fast and focused. More clinical detail can live in OPD notes."
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Age</Label>
            <Input required type="number" min={0} value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Contact</Label>
            <Input required value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Medical history</Label>
            <Textarea value={form.medicalHistory} onChange={(event) => setForm({ ...form, medicalHistory: event.target.value })} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Create patient"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
