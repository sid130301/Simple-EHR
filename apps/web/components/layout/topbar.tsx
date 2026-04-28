"use client";

import Link from "next/link";
import { Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useThemeMode } from "@/lib/theme-context";

export function Topbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-900/10 bg-[#f5f1e8]/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0e1514]/85 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="hidden flex-1 items-center rounded-2xl border border-stone-200 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5 md:flex">
          <Search className="mr-2 h-4 w-4 text-stone-400" />
          <span className="text-sm text-stone-500 dark:text-stone-400">Search patients, cases, visits...</span>
        </div>
        <Link href="/dashboard" className="mr-auto text-lg font-black text-teal-900 dark:text-teal-100 md:hidden">
          HealthNest
        </Link>
        <Button variant="secondary" className="h-10 w-10 rounded-full p-0" onClick={toggleTheme} aria-label="Toggle dark mode">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold">{user?.name}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{user?.email}</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
      <nav className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1 lg:hidden">
        {[
          ["Dashboard", "/dashboard"],
          ["OPD", "/opd"],
          ["Emergency", "/emergency"],
          ["Patients", "/patients"],
          ["Settings", "/settings"]
        ].map(([label, href]) => (
          <Link
            key={href}
            className="rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
            href={href}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
