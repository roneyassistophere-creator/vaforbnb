"use client";

import { useState } from "react";
import { copy } from "@/content/tools/certificateReminders";
import { cn } from "@/lib/cn";
import { addMonths, daysBetween, formatMedium, formatShort } from "@/lib/tools/dates";
import { counts, nextRow, statusLabel, whenText, type ScheduleRow, type Status } from "@/lib/tools/certificates";
import { Chip } from "../Badges";
import { pillTones } from "../StatusPill";
import { RowStatus, statusColour, statusTone } from "./RowStatus";

/* ---- Summary --------------------------------------------------------- */

export function SummaryPanel({ rows, propertyName }: { rows: ScheduleRow[]; propertyName: string }) {
  const c = counts(rows);
  const next = nextRow(rows);
  const chips: [Status, number, string][] = [
    ["overdue", c.overdue, "overdue"],
    ["soon", c.soon, "due soon"],
    ["ok", c.ok, "OK"],
    ["missing", c.missing, "to add"],
  ];
  return (
    <section aria-labelledby="cert-summary" className="rounded-[20px] border border-line bg-white p-5 md:p-6" data-result-panel>
      <h2 id="cert-summary" className="m-0 mb-3 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">
        {copy.summary.title} · {propertyName}
      </h2>
      <div aria-live="polite" aria-atomic="true">
        <p className="m-0 flex flex-wrap gap-2">
          {chips.map(([s, n, label]) => (
            <Chip key={s} tone={pillTones[statusTone[s]]} count={n} label={label} className={cn(n === 0 && "opacity-70")} />
          ))}
        </p>
        <p className="m-0 mt-4 text-[22px] leading-[1.25] font-extrabold tracking-[-0.4px] text-ink md:text-[24px]">
          {next ? (
            <>
              <span className="block text-xs font-extrabold tracking-[1.2px] text-muted uppercase">{next.status === "overdue" ? "Overdue first" : "Next"}</span>
              {next.name}, {formatMedium(next.due!)}, {whenText(next)}
            </>
          ) : (
            <span className="text-base font-semibold text-muted">{copy.summary.empty}</span>
          )}
        </p>
      </div>
    </section>
  );
}

/* ---- 12-month timeline ----------------------------------------------- */

const ZONE = 14; // % of the width for the overdue zone

type Marker = { row: ScheduleRow; left: number; lane: number };

function layout(rows: ScheduleRow[], today: string) {
  const end = addMonths(today, 12);
  const span = daysBetween(today, end);
  const dated = rows.filter((r) => r.due && r.days !== null);
  const overdue = dated.filter((r) => r.status === "overdue");
  const within = dated.filter((r) => r.status !== "overdue" && r.days! <= span).sort((a, b) => a.days! - b.days!);
  const later = dated.filter((r) => r.status !== "overdue" && r.days! > span);
  const markers: Marker[] = [];
  overdue.forEach((row, i) => markers.push({ row, left: ((i + 1) / (overdue.length + 1)) * ZONE, lane: 0 }));
  const lastInLane: number[] = [];
  for (const row of within) {
    const left = ZONE + (row.days! / span) * (100 - ZONE);
    let lane = lastInLane.findIndex((x) => left - x >= 7);
    if (lane === -1) lane = lastInLane.length < 3 ? lastInLane.length : lastInLane.indexOf(Math.min(...lastInLane));
    lastInLane[lane] = left;
    markers.push({ row, left, lane });
  }
  // Quarter ticks.
  const ticks = [0, 3, 6, 9, 12].map((m) => {
    const d = addMonths(today, m);
    return { label: m === 0 ? "Today" : formatShort(d).split(" ")[1], left: ZONE + (daysBetween(today, d) / span) * (100 - ZONE) };
  });
  return { markers, later, ticks, lanes: Math.max(1, ...markers.map((m) => m.lane + 1)) };
}

export function Timeline({ rows, today }: { rows: ScheduleRow[]; today: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const { markers, later, ticks, lanes } = layout(rows, today);
  const sel = markers.find((m) => m.row.id === selected)?.row;
  const height = 44 + lanes * 40;

  return (
    <section aria-labelledby="cert-timeline" className="rounded-[20px] border border-line bg-white p-5 md:p-6">
      <h2 id="cert-timeline" className="m-0 mb-1 text-base font-extrabold">
        {copy.timeline.title}
      </h2>
      <p className="m-0 mb-4 text-[13px] text-muted">{copy.timeline.tapHint} Every date is also in the table below.</p>
      <div className="relative" style={{ height: height + 22 }}>
        {/* Overdue zone */}
        <div className="absolute top-0 left-0 rounded-l-[10px] bg-coral-50" style={{ width: `${ZONE}%`, height }} aria-hidden="true">
          <span className="absolute top-1 left-1.5 text-[11px] font-extrabold text-brand">{copy.timeline.overdue}</span>
        </div>
        {/* Line */}
        <div className="absolute h-[3px] rounded-full bg-line-strong" style={{ left: `${ZONE}%`, right: 0, top: height - 12 }} aria-hidden="true" />
        {ticks.map((t) => (
          <span key={t.left} aria-hidden="true" className="absolute text-[11px] font-bold whitespace-nowrap text-muted" style={{ left: `${t.left}%`, top: height + 2, transform: t.left > 95 ? "translateX(-100%)" : "translateX(-50%)" }}>
            <span className="absolute -top-[16px] left-1/2 h-2 w-px bg-line-box" />
            {t.label}
          </span>
        ))}
        {markers.map((m) => (
          <button
            key={m.row.id}
            type="button"
            onClick={() => setSelected(m.row.id === selected ? null : m.row.id)}
            aria-label={`${m.row.name}, ${m.row.propertyName}: ${statusLabel(m.row)}, due ${formatMedium(m.row.due!)}`}
            aria-pressed={selected === m.row.id}
            className="group absolute flex size-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-ink"
            style={{ left: `${m.left}%`, top: height - 12 - 22 - m.lane * 40 + 1 }}
          >
            <span
              aria-hidden="true"
              className={cn("block size-4 rounded-full border-[3px] border-white shadow-[0_0_0_1.5px_currentColor]", selected === m.row.id && "size-5")}
              style={{ background: statusColour[m.row.status], color: statusColour[m.row.status] }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[12px] font-bold whitespace-nowrap text-white group-hover:block group-focus-visible:block"
            >
              {m.row.name} · {formatMedium(m.row.due!)}
            </span>
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-1 text-sm text-ink-copy empty:hidden">
        {sel && (
          <p className="m-0 flex flex-wrap items-center gap-2">
            <strong className="text-ink">{sel.name}</strong> ({sel.propertyName}), due {formatMedium(sel.due!)}. <RowStatus row={sel} />
          </p>
        )}
      </div>
      {later.length > 0 && (
        <p className="m-0 mt-1 text-sm text-ink-copy">
          <strong className="text-ink">{copy.timeline.later}:</strong> {later.map((r) => `${r.name} (${formatMedium(r.due!)})`).join(", ")}
        </p>
      )}
    </section>
  );
}

/* ---- Due dates table ------------------------------------------------- */

export function DueTable({ rows, caption = copy.table.title, compact }: { rows: ScheduleRow[]; caption?: string; compact?: boolean }) {
  const T = copy.table;
  return (
    <div className="overflow-x-auto rounded-[16px] border border-line bg-white" role="region" aria-label={`${caption} table`} tabIndex={0}>
      <table className={cn("w-full min-w-[720px] border-collapse text-left text-sm", compact && "min-w-0 text-[12px]")}>
        <caption className="sr-only-label">{caption}</caption>
        <thead>
          <tr className="bg-cloud">
            {T.cols.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 text-xs font-extrabold tracking-[0.6px] text-muted uppercase">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-muted">
                {T.empty}
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line align-middle">
              <th scope="row" className="px-4 py-3 font-bold text-ink">
                {r.name}
              </th>
              <td className="px-4 py-3 text-ink-copy">{r.propertyName}</td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-copy tabular-nums">{r.lastDone ? formatMedium(r.lastDone) : "—"}</td>
              <td className="px-4 py-3 font-bold whitespace-nowrap text-ink tabular-nums">{r.due ? formatMedium(r.due) : "—"}</td>
              <td className="px-4 py-3">
                <RowStatus row={r} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-copy tabular-nums">{r.due && r.remindOn && r.status !== "overdue" ? formatMedium(r.remindOn) : r.status === "overdue" ? "Now" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
