import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { groupMeta, statusMeta, type BadgeTone, type GroupKey, type StatusKey } from "./styles";

/** Small coloured label. */
export function Badge({ tone, children, className }: { tone: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-extrabold tracking-[0.3px] whitespace-nowrap uppercase", className)}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {children}
    </span>
  );
}

/** Law now / Coming / Platform rule / Contract. */
export function StatusBadge({ status }: { status: StatusKey }) {
  const m = statusMeta[status];
  return <Badge tone={m}>{m.label}</Badge>;
}

/** Must do now / Coming soon / Check your contract. */
export function GroupBadge({ group, className }: { group: GroupKey; className?: string }) {
  const m = groupMeta[group];
  return (
    <Badge tone={m} className={className}>
      {m.label}
    </Badge>
  );
}

/** Rounded count chip, e.g. "11 Must do now". */
export function Chip({ tone, count, label, className }: { tone: BadgeTone; count?: number; label: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-sm font-bold", className)}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {count !== undefined && <span className="text-base font-extrabold">{count}</span>}
      {label}
    </span>
  );
}

/** Pill-style info badge for page heroes ("New host kit · step 1"). */
export function InfoBadge({ children, dot, className }: { children: ReactNode; dot?: string; className?: string }) {
  return (
    <span className={cn("inline-flex min-h-8 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-bold text-ink shadow-[inset_0_0_0_1px_#E6E8EB]", className)}>
      {dot && <span className="size-[7px] rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  );
}
