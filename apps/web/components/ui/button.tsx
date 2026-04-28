import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-teal-700 text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800 dark:bg-teal-400 dark:text-teal-950 dark:hover:bg-teal-300",
  secondary: "border border-stone-200 bg-white/70 text-stone-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-100",
  ghost: "text-stone-600 hover:bg-stone-900/5 dark:text-stone-300 dark:hover:bg-white/10",
  danger: "bg-rose-600 text-white hover:bg-rose-700"
};

export function Button({ className, variant = "primary", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
