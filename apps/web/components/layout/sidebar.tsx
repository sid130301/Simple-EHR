"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Ambulance, LayoutDashboard, Settings, Stethoscope, UsersRound } from "lucide-react";
import { cn, roleLabel } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opd", label: "OPD", icon: Stethoscope },
  { href: "/emergency", label: "Emergency", icon: Ambulance },
  { href: "/patients", label: "Patients", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-stone-900/10 bg-[#103d37] p-4 text-white lg:block dark:border-white/10">
      <div className="flex h-full flex-col">
        <Link href="/dashboard" className="mb-8 rounded-3xl bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-300 text-teal-950">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">HealthNest</p>
              <p className="text-xs text-teal-100">Clinical command center</p>
            </div>
          </div>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-teal-50/80 transition hover:bg-white/10 hover:text-white",
                  active && "bg-white text-teal-950 shadow-xl shadow-black/10 hover:bg-white hover:text-teal-950"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/10 p-4">
          <p className="text-sm font-bold">{user?.name}</p>
          <p className="mt-1 text-xs text-teal-100">{roleLabel(user?.role)}</p>
        </div>
      </div>
    </aside>
  );
}
