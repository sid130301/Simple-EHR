"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, description, open, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 p-4 backdrop-blur-sm">
      <div className="animate-rise max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-[#fffdf8] p-5 shadow-2xl dark:border-white/10 dark:bg-[#15211f]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" className="h-9 w-9 rounded-full p-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
