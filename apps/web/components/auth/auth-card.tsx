"use client";

import Link from "next/link";
import { useState } from "react";
import type { StaffSignupRole } from "@ehr/shared";
import { Activity, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";

type AuthCardProps = {
  mode: "login" | "signup";
};

export function AuthCard({ mode }: AuthCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "doctor@healthnest.test" : "");
  const [password, setPassword] = useState(mode === "login" ? "Password123!" : "");
  const [role, setRole] = useState<StaffSignupRole>("NURSE");
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const isSignup = mode === "signup";

  async function submit() {
    setLoading(true);
    try {
      if (isSignup) {
        await signup({ name, email, password, role });
        showToast({ title: "Account created", tone: "success" });
      } else {
        await login(email, password);
        showToast({ title: "Welcome back", tone: "success" });
      }
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Authentication failed", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function googleSubmit() {
    setLoading(true);
    try {
      await loginWithGoogle(role);
      showToast({ title: "Signed in with Google", tone: "success" });
    } catch (error) {
      showToast({ title: error instanceof Error ? error.message : "Google sign-in failed", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.24),transparent_32rem)]" />
      <Card className="animate-rise relative w-full max-w-md p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">HealthNest EHR</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {isSignup ? "Create your care team account" : "Sign in to the clinical workspace"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {isSignup ? (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Dr. Mira Shah" />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          {isSignup ? (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" value={role} onChange={(event) => setRole(event.target.value as StaffSignupRole)}>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
              </Select>
            </div>
          ) : null}

          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </Button>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
            <span className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
            or
            <span className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
          </div>

          <Button className="w-full" variant="secondary" onClick={googleSubmit} disabled={loading || !isFirebaseConfigured()}>
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          {!isFirebaseConfigured() ? (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
              Add Firebase env values to enable Google OAuth.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-bold text-teal-700 dark:text-teal-300" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </Card>
    </main>
  );
}
