"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getGoogleIdToken } from "@/lib/firebase";
import type { ApiUser } from "@/types/api";
import type { StaffSignupRole } from "@ehr/shared";

type AuthPayload = {
  token: string;
  user: ApiUser;
};

type AuthContextValue = {
  token: string | null;
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; role: StaffSignupRole }) => Promise<void>;
  loginWithGoogle: (role?: StaffSignupRole) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = window.localStorage.getItem("ehr.token");
    const savedUser = window.localStorage.getItem("ehr.user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  function persist(payload: AuthPayload) {
    window.localStorage.setItem("ehr.token", payload.token);
    window.localStorage.setItem("ehr.user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }

  async function login(email: string, password: string) {
    const payload = await apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    persist(payload);
    router.replace("/dashboard");
  }

  async function signup(payload: { name: string; email: string; password: string; role: StaffSignupRole }) {
    const response = await apiFetch<AuthPayload>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    persist(response);
    router.replace("/dashboard");
  }

  async function loginWithGoogle(role: StaffSignupRole = "NURSE") {
    const idToken = await getGoogleIdToken();
    const payload = await apiFetch<AuthPayload>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, role })
    });
    persist(payload);
    router.replace("/dashboard");
  }

  function logout() {
    window.localStorage.removeItem("ehr.token");
    window.localStorage.removeItem("ehr.user");
    setToken(null);
    setUser(null);
    router.replace("/login");
  }

  const value = useMemo(
    () => ({ token, user, loading, login, signup, loginWithGoogle, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
