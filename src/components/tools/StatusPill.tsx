import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const pillTones = {
  pass: { bg: "#E3F2EA", fg: "#1F6B45", icon: "✓" },
  notYet: { bg: "#FFF2CC", fg: "#6B4A00", icon: "!" },
  over: { bg: "#FDECEC", fg: "#B8383A", icon: "!" },
  neutral: { bg: "#F2F4F6", fg: "#46525C", icon: "…" },
  info: { bg: "#E8EEF3", fg: "#14212B", icon: "i" },
} as const;

export type PillTone = keyof typeof pillTones;

/** Big result status, e.g. "Meets the tests" / "Not yet". */
export function StatusPill({ tone, children, className }: { tone: PillTone; children: ReactNode; className?: string }) {
  const t = pillTones[tone];
  return (
    <p className={cn("m-0 inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 text-lg font-extrabold", className)} style={{ background: t.bg, color: t.fg }}>
      <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full text-sm text-white" style={{ background: t.fg }}>
        {t.icon}
      </span>
      {children}
    </p>
  );
}
