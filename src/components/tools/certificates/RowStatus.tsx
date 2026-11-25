import { cn } from "@/lib/cn";
import { statusLabel, type ScheduleRow, type Status } from "@/lib/tools/certificates";
import { pillTones, type PillTone } from "../StatusPill";

export const statusTone: Record<Status, PillTone> = { overdue: "over", soon: "notYet", ok: "pass", missing: "neutral" };
export const statusIcon: Record<Status, string> = { overdue: "!", soon: "!", ok: "✓", missing: "…" };
/** Marker colours on the timeline (AA on white). */
export const statusColour: Record<Status, string> = { overdue: "#B8383A", soon: "#9A6A00", ok: "#1F6B45", missing: "#5F6B75" };

/** Small status pill: always a word, never colour alone. */
export function RowStatus({ row, className }: { row: ScheduleRow; className?: string }) {
  const t = pillTones[row.error ? "over" : statusTone[row.status]];
  return (
    <span
      className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-extrabold whitespace-nowrap", className)}
      style={{ background: t.bg, color: t.fg }}
    >
      <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full text-[10px] text-white" style={{ background: t.fg }}>
        {row.error ? "!" : statusIcon[row.status]}
      </span>
      {statusLabel(row)}
    </span>
  );
}
