"use client";

import { cn } from "@/lib/cn";
import { money } from "@/lib/tools/format";
import { MON, type FlowStep } from "@/lib/tools/profit";

const signed = (n: number) => (n < 0 ? `−${money(-n, 0)}` : money(n, 0));

/**
 * Money flow (waterfall), drawn as horizontal bars so it fits a phone. Each
 * step floats from the running total; totals start at zero. The table below
 * carries the same figures for screen readers.
 */
export function Waterfall({ steps }: { steps: FlowStep[] }) {
  const rows: (FlowStep & { from: number; to: number })[] = [];
  for (const s of steps) {
    const running = rows.length ? rows[rows.length - 1].to : 0;
    const from = s.kind === "minus" ? running : 0;
    rows.push({ ...s, from, to: s.kind === "minus" ? running + s.amount : s.amount });
  }
  const lo = Math.min(0, ...rows.map((r) => Math.min(r.from, r.to)));
  const hi = Math.max(1, ...rows.map((r) => Math.max(r.from, r.to)));
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <figure className="m-0 grid gap-1.5" aria-hidden="true" data-waterfall>
      {rows.map((r) => {
        const left = x(Math.min(r.from, r.to));
        const width = Math.max(0.6, Math.abs(x(r.to) - x(r.from)));
        const tone = r.kind === "start" ? "bg-ink" : r.kind === "total" ? (r.amount >= 0 ? "bg-green" : "bg-brand") : "bg-coral-100";
        return (
          <div key={r.id} className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] items-center gap-2 md:grid-cols-[13rem_minmax(0,1fr)]" data-flow={r.id}>
            <span className={cn("truncate text-[13px]", r.kind === "minus" ? "text-ink-copy" : "font-extrabold text-ink")}>
              {r.kind === "minus" ? "− " : ""}
              {r.label}
            </span>
            <span className="relative h-7">
              <span className="absolute inset-y-0 border-l border-dashed border-line-strong" style={{ left: `${x(0)}%` }} />
              <span className={cn("absolute inset-y-1 rounded-[4px]", tone)} style={{ left: `${left}%`, width: `${width}%` }} />
              <span className={cn("absolute top-1/2 -translate-y-1/2 text-[12px] font-bold whitespace-nowrap tabular-nums", left + width > 70 ? "pr-1.5 text-ink" : "pl-1.5 text-ink")} style={left + width > 70 ? { right: `${100 - left}%` } : { left: `${left + width}%` }}>
                {signed(r.amount)}
              </span>
            </span>
          </div>
        );
      })}
    </figure>
  );
}

/** Horizontal bars (sorted), each labelled in £ a year. */
export function Bars({ items }: { items: { id: string; label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <figure className="m-0 grid gap-3" aria-hidden="true" data-lever-chart>
      {items.map((i) => (
        <div key={i.id} className="grid gap-1" data-lever={i.id}>
          <span className="text-sm font-bold text-ink">{i.label}</span>
          <span className="flex items-center gap-2">
            <span className={cn("h-6 rounded-[4px]", i.value >= 0 ? "bg-green" : "bg-brand")} style={{ width: `${Math.max(1, (Math.abs(i.value) / max) * 78)}%` }} />
            <span className="text-[13px] font-extrabold whitespace-nowrap tabular-nums">{signed(i.value)} / yr</span>
          </span>
        </div>
      ))}
    </figure>
  );
}

/** 12 monthly profit bars (losses in coral) with a cumulative cash line. */
export function MonthChart({ profit, cash }: { profit: number[]; cash: number[] }) {
  const cumulative = cash.reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 0) + v], []);
  const lo = Math.min(0, ...profit, ...cumulative);
  const hi = Math.max(1, ...profit, ...cumulative);
  const W = 600;
  const H = 220;
  const pad = 22;
  const y = (v: number) => pad + ((hi - v) / (hi - lo)) * (H - pad * 2);
  const bw = W / 12;
  return (
    <figure className="m-0" aria-hidden="true" data-month-chart>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="presentation">
        <line x1="0" x2={W} y1={y(0)} y2={y(0)} stroke="#C9CED3" strokeDasharray="4 4" />
        {profit.map((p, i) => (
          <rect key={i} x={i * bw + bw * 0.18} width={bw * 0.64} y={Math.min(y(p), y(0))} height={Math.max(1, Math.abs(y(p) - y(0)))} rx="3" fill={p < 0 ? "#F0595A" : "#1F6B45"} />
        ))}
        <polyline fill="none" stroke="#14212B" strokeWidth="2.5" points={cumulative.map((v, i) => `${i * bw + bw / 2},${y(v)}`).join(" ")} />
        {MON.map((m, i) => (
          <text key={m} x={i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize="13" fill="#5F6B75">
            {m.slice(0, 1)}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-[2px] bg-green" />
          Profit
        </span>
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-[2px] bg-brand" />
          Loss month
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-4 bg-ink align-middle" />
          Cumulative cash
        </span>
      </figcaption>
    </figure>
  );
}

/** A tiny line for the month table (rate or occupancy across the year). */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const W = 120;
  const H = 28;
  const y = (v: number) => (hi === lo ? H / 2 : 3 + ((hi - v) / (hi - lo)) * (H - 6));
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-muted">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <polyline fill="none" stroke="#F0595A" strokeWidth="2" points={values.map((v, i) => `${(i / 11) * (W - 4) + 2},${y(v)}`).join(" ")} />
      </svg>
      <span className="sr-only-label">{label}</span>
    </span>
  );
}
