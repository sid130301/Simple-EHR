"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { loading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, token, pathname, router]);

  if (loading || !token) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-80" />
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
