"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useThemeMode } from "@/lib/theme-context";
import { formatDate, roleLabel } from "@/lib/utils";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  actor?: {
    name: string;
    email: string;
    role: string;
  } | null;
};

export default function SettingsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { user, token } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const { showToast } = useToast();

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      return;
    }

    setLoadingLogs(true);
    apiFetch<{ items: AuditLog[] }>("/audit?limit=12", { token })
      .then((result) => setLogs(result.items))
      .catch((error) => showToast({ title: error.message, tone: "error" }))
      .finally(() => setLoadingLogs(false));
  }, [token, user?.role, showToast]);

  return (
    <div className="animate-fade grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Profile, display preferences, and security visibility.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-5">
          <div className="rounded-3xl border border-stone-200 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black">{user?.name}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="blue">{roleLabel(user?.role)}</Badge>
              <Badge tone="green">JWT protected</Badge>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="font-black">Appearance</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Switch between light and dark clinical modes.</p>
            <Button className="mt-4" variant="secondary" onClick={toggleTheme}>
              Use {isDark ? "light" : "dark"} mode
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Admins can review sensitive access and record changes.</CardDescription>
          </div>
        </CardHeader>
        {user?.role !== "ADMIN" ? (
          <div className="rounded-3xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-white/10 dark:text-stone-400">
            Audit logs are available to admins only.
          </div>
        ) : loadingLogs ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-stone-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{log.action}</Badge>
                  <p className="font-bold">{log.entity}</p>
                  <p className="text-xs text-stone-400">{formatDate(log.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  {log.actor?.name ?? "System"} {log.entityId ? `· ${log.entityId}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
