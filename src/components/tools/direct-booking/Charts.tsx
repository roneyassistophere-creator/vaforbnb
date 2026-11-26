"use client";

import { cn } from "@/lib/cn";
import { money } from "@/lib/tools/format";

/** "You keep" per booking, one bar per channel on the same £ scale. A table carries the same figures. */
export function KeepBars({ items }: { items: { id: string; label: string; value: number; highlight?: boolean }[] }) {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <div className="grid gap-2">
      <figure className="m-0 grid gap-2" aria-hidden="true" data-keep-chart>
        {items.map((i) => (
          <div key={i.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2" data-keep={i.id}>
            <span className="truncate text-[13px] font-bold text-ink">{i.label}</span>
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("h-6 rounded-[4px]", i.highlight ? "bg-green" : "bg-ink/70")} style={{ width: `${Math.max(1, (Math.abs(i.value) / max) * 72)}%` }} />
              <span className="text-[13px] font-extrabold whitespace-nowrap tabular-nums">{money(i.value)}</span>
            </span>
          </div>
        ))}
      </figure>
      <table className="sr-only-label">
        <caption>You keep per booking</caption>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <th scope="row">{i.label}</th>
              <td>{money(i.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const COLOURS: Record<string, string> = { airbnb: "#F0595A", booking: "#14212B", vrbo: "#5B3FA0", other: "#8A949C", direct: "#1F6B45" };

/** Yearly fees by channel: Now vs Target, stacked. */
export function StackedFees({ rows }: { rows: { id: string; label: string; feeNow: number; feeTarget: number }[] }) {
  const totalNow = rows.reduce((t, r) => t + r.feeNow, 0);
  const totalTarget = rows.reduce((t, r) => t + r.feeTarget, 0);
  const max = Math.max(1, totalNow, totalTarget);
  const bar = (key: "feeNow" | "feeTarget", label: string, total: number) => (
    <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-2" data-stack={key === "feeNow" ? "now" : "target"}>
      <span className="text-[13px] font-extrabold">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 overflow-hidden rounded-[6px]" style={{ width: `${Math.max(1, (total / max) * 74)}%` }}>
          {rows.map((r) => (r[key] > 0 ? <span key={r.id} style={{ width: `${(r[key] / total) * 100}%`, background: COLOURS[r.id] }} /> : null))}
        </span>
        <span className="text-[13px] font-extrabold whitespace-nowrap tabular-nums">{money(total, 0)}</span>
      </span>
    </div>
  );
  return (
    <div className="grid gap-3">
      <figure className="m-0 grid gap-2" aria-hidden="true" data-fee-chart>
        {bar("feeNow", "Now", totalNow)}
        {bar("feeTarget", "Target", totalTarget)}
        <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          {rows.map((r) => (
            <span key={r.id}>
              <span className="mr-1 inline-block size-2.5 rounded-[2px]" style={{ background: COLOURS[r.id] }} />
              {r.label}
              {r.id === "direct" ? " (payment costs)" : ""}
            </span>
          ))}
        </figcaption>
      </figure>
      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer py-2 font-bold">Show as a table</summary>
        <table className="w-full border-collapse" data-fee-table>
          <caption className="sr-only-label">Yearly fees and costs by channel, now and at your target</caption>
          <thead className="text-[12px] text-muted uppercase">
            <tr>
              <th className="py-1.5 text-left">Channel</th>
              <th className="py-1.5 pl-4 text-right">Now</th>
              <th className="py-1.5 pl-4 text-right">Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <th scope="row" className="py-1.5 text-left font-normal">
                  {r.label}
                  {r.id === "direct" ? " (payment costs)" : " fees"}
                </th>
                <td className="py-1.5 pl-4 text-right tabular-nums">{money(r.feeNow, 0)}</td>
                <td className="py-1.5 pl-4 text-right tabular-nums">{money(r.feeTarget, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
