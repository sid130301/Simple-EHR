"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Toast = {
  id: string;
  title: string;
  tone?: "success" | "error" | "info";
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(toast: Omit<Toast, "id">) {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "animate-rise rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl",
              toast.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/20 dark:bg-rose-950 dark:text-rose-100"
                : toast.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-950 dark:text-emerald-100"
                  : "border-stone-200 bg-white text-stone-900 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100"
            )}
          >
            {toast.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
