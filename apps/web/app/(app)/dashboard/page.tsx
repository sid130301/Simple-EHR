"use client";

import { useEffect, useState } from "react";
import { Ambulance, CalendarClock, HeartPulse, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardStats } from "@/types/api";

const defaultStats: DashboardStats = {
  totalPatients: 0,
  activeCases: 0,
  emergencyCases: 0,
  criticalEmergencyCases: 0,
  todaysOpdVisits: 0,
  pendingFollowUps: 0
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch<DashboardStats>("/dashboard/stats", { token })
      .then(setStats)
      .catch((error) => showToast({ title: error.message, tone: "error" }))
      .finally(() => setLoading(false));
  }, [token, showToast]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-[#103d37] p-6 text-white shadow-2xl shadow-teal-950/20">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <Badge className="bg-teal-200 text-teal-950">Live clinic overview</Badge>
            <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
              Good care starts with a calm dashboard.
            </h1>
            <p className="mt-4 max-w-xl text-teal-50/80">
              Welcome back, {user?.name}. Your OPD, emergency, patient registry, and follow-ups are organized for speed.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm text-teal-100">Today</p>
            <p className="mt-2 text-3xl font-black">{stats.todaysOpdVisits} OPD visits</p>
            <p className="mt-2 text-sm text-teal-100">{stats.pendingFollowUps} upcoming follow-ups</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total patients" value={stats.totalPatients} icon={UsersRound} />
        <StatCard title="Active cases" value={stats.activeCases} icon={HeartPulse} tone="green" />
        <StatCard title="Emergency cases" value={stats.emergencyCases} icon={Ambulance} tone="amber" />
        <StatCard title="Critical triage" value={stats.criticalEmergencyCases} icon={CalendarClock} tone="red" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Clinical Flow</CardTitle>
              <CardDescription>Designed for high-signal decisions, not clutter.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Register patient", "Create OPD visit", "Schedule follow-up"].map((step, index) => (
              <div key={step} className="rounded-2xl border border-stone-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Step {index + 1}</p>
                <p className="mt-3 font-bold">{step}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Emergency Watch</CardTitle>
              <CardDescription>Critical cases stay visible until discharged.</CardDescription>
            </div>
          </CardHeader>
          <div className="rounded-3xl bg-rose-50 p-5 text-rose-950 dark:bg-rose-400/10 dark:text-rose-100">
            <p className="text-4xl font-black">{stats.criticalEmergencyCases}</p>
            <p className="mt-2 text-sm font-semibold">critical patients need immediate attention</p>
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "blue"
}: {
  title: string;
  value: number;
  icon: typeof UsersRound;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
    red: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200"
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{title}</p>
          <p className="mt-3 text-4xl font-black">{value}</p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${colors[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
