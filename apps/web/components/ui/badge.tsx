import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
};

const tones = {
  neutral: "bg-stone-200 text-stone-700 dark:bg-white/10 dark:text-stone-200",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  red: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200",
  blue: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200"
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", tones[tone], className)}
      {...props}
    />
  );
}
