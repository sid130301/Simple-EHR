"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { EmergencyStatus, Gender, Triage } from "@ehr/shared";
import { Ambulance, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import type { EmergencyCase, PageResult } from "@/types/api";

const emptyForm = {
  patientName: "",
  age: "",
  gender: "OTHER" as Gender,
  contact: "",
  chiefComplaint: "",
  triage: "MEDIUM" as Triage
};

const statusOptions: EmergencyStatus[] = ["WAITING", "IN_TRIAGE", "IN_TREATMENT", "OBSERVATION", "DISCHARGED"];

export default function EmergencyPage() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  function load(showLoading = true) {
    if (!token) {
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    apiFetch<PageResult<EmergencyCase>>("/emergency?limit=30", { token })
      .then((result) => setCases(result.items))
      .catch((error) => showToast({ title: error.message, tone: "error" }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const interval = window.setInterval(() => load(false), 10000);
    return () => window.clearInterval(interval);
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setSaving(true);
    try {
      await apiFetch<EmergencyCase>("/emergency", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null
        })
      });
      setForm(emptyForm);
      showToast({ title: "Emergency case registered", tone: "success" });
      load(false);
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Unable to register emergency case", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(item: EmergencyCase, status: EmergencyStatus) {
    if (!token) {
      return;
    }

    try {
      const updated = await apiFetch<EmergencyCase>(`/emergency/${item.id}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status, triage: item.triage })
      });
      setCases((current) => current.map((caseItem) => (caseItem.id === updated.id ? updated : caseItem)));
      showToast({ title: "Emergency status updated", tone: "success" });
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Unable to update status", tone: "error" });
    }
  }

  const criticalCount = cases.filter((item) => item.triage === "CRITICAL" && item.status !== "DISCHARGED").length;
  const activeCount = cases.filter((item) => item.status !== "DISCHARGED").length;

  return (
    <div className="animate-fade grid gap-5 xl:grid-cols-[0.85fr_1.25fr]">
      <div className="space-y-5">
        <Card className="bg-[#103d37] text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="bg-teal-200 text-teal-950">Emergency</Badge>
              <h1 className="mt-4 text-3xl font-black">Triage-first intake</h1>
              <p className="mt-2 text-sm text-teal-50/80">Register quickly, update status instantly, and keep critical patients visible.</p>
            </div>
            <Ambulance className="h-10 w-10 text-teal-200" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{activeCount}</p>
              <p className="text-sm text-teal-100">active</p>
            </div>
            <div className="rounded-2xl bg-rose-400/20 p-4">
              <p className="text-3xl font-black">{criticalCount}</p>
              <p className="text-sm text-rose-100">critical</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick Registration</CardTitle>
              <CardDescription>Minimal fields for speed. A patient record is created automatically.</CardDescription>
            </div>
          </CardHeader>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Patient name</Label>
              <Input required value={form.patientName} onChange={(event) => setForm({ ...form, patientName: event.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" min={0} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Chief complaint</Label>
              <Textarea value={form.chiefComplaint} onChange={(event) => setForm({ ...form, chiefComplaint: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Triage</Label>
              <Select value={form.triage} onChange={(event) => setForm({ ...form, triage: event.target.value as Triage })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            <Button className="w-full" disabled={saving}>
              {saving ? "Registering..." : "Register emergency case"}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Emergency Case Dashboard</CardTitle>
            <CardDescription>Auto-refreshes every 10 seconds for near real-time status.</CardDescription>
          </div>
          <Button variant="secondary" onClick={() => load()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((item) => (
              <div key={item.id} className="rounded-3xl border border-stone-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black">{item.patientName}</h2>
                      <Badge tone={triageTone(item.triage)}>{item.triage.toLowerCase()}</Badge>
                      <Badge tone={statusTone(item.status)}>{item.status.replaceAll("_", " ").toLowerCase()}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                      {item.chiefComplaint || "No complaint recorded"} · {formatDate(item.updatedAt)}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">{item.contact || "Contact pending"}</p>
                  </div>
                  <Select className="lg:w-56" value={item.status} onChange={(event) => updateStatus(item, event.target.value as EmergencyStatus)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
            {!cases.length ? (
              <div className="grid place-items-center rounded-3xl border border-dashed border-stone-300 py-12 text-center dark:border-white/10">
                <p className="font-bold">No emergency cases yet</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">The board is clear. Quiet is good.</p>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}

function triageTone(triage: Triage) {
  if (triage === "CRITICAL") {
    return "red";
  }
  if (triage === "MEDIUM") {
    return "amber";
  }
  return "green";
}

function statusTone(status: EmergencyStatus) {
  if (status === "DISCHARGED") {
    return "green";
  }
  if (status === "IN_TREATMENT" || status === "OBSERVATION") {
    return "blue";
  }
  return "amber";
}
