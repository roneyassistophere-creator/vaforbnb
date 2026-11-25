"use client";

import { useState } from "react";
import { copy } from "@/content/tools/visitorLevy";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import { formatPence, logTotals, type LogEntry, type Total } from "@/lib/tools/visitor-levy";

const L = copy.log;

function Totals({ title, totals }: { title: string; totals: Total[] }) {
  return (
    <div className="min-w-0">
      <h4 className="m-0 mb-2 text-sm font-extrabold">
        {title} <span className="font-semibold text-muted">({L.byCheckIn})</span>
      </h4>
      <table className="w-full border-collapse text-sm">
        <thead className="sr-only-label">
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Stays</th>
            <th scope="col">Levy</th>
          </tr>
        </thead>
        <tbody>
          {totals.map((t) => (
            <tr key={t.key} className="border-t border-line">
              <th scope="row" className="py-2 text-left font-bold">
                {t.label}
              </th>
              <td className="py-2 text-muted">
                {t.stays} {t.stays === 1 ? "stay" : "stays"}
              </td>
              <td className="py-2 text-right font-extrabold tabular-nums">{formatPence(t.levyPence)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Saved stays with totals by month and quarter (collapsed by default). */
export function LevyLog({
  log,
  open,
  onToggle,
  onEdit,
  onDelete,
  onCsv,
  onClear,
  undo,
  onUndo,
}: {
  log: LogEntry[];
  open: boolean;
  onToggle: () => void;
  onEdit: (e: LogEntry) => void;
  onDelete: (e: LogEntry) => void;
  onCsv: (entries: LogEntry[]) => void;
  onClear: () => void;
  undo: LogEntry | null;
  onUndo: () => void;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const areas = [...new Map(log.map((e) => [e.areaId, e.areaName])).entries()];
  const shown = (filter ? log.filter((e) => e.areaId === filter) : log).slice().sort((a, b) => (a.checkIn < b.checkIn ? -1 : a.checkIn > b.checkIn ? 1 : 0));
  const totals = logTotals(shown);
  const sum = shown.reduce((a, e) => a + e.levyPence, 0);

  return (
    <section aria-labelledby="levy-log" className="rounded-[20px] border border-line bg-white">
      <h2 id="levy-log" className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="levy-log-body"
          className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent px-5 text-left text-lg font-extrabold text-ink md:px-6"
        >
          <span>
            {L.title} <span className="text-sm font-semibold text-muted">({log.length} {log.length === 1 ? "stay" : "stays"})</span>
          </span>
          <span aria-hidden="true" className={cn("text-xl transition-transform", open && "rotate-180")}>
            ⌄
          </span>
        </button>
      </h2>
      <div id="levy-log-body" hidden={!open} className="border-t border-line px-5 pt-4 pb-5 md:px-6">
        <p className="m-0 mb-4 text-sm text-ink-copy">{L.intro}</p>
        <div aria-live="polite">
          {undo && (
            <p className="m-0 mb-3 flex flex-wrap items-center gap-3 text-sm font-bold">
              Deleted the stay from {formatMedium(undo.checkIn)}.
              <button type="button" onClick={onUndo} className="btn btn-outline min-h-11">
                {L.undo}
              </button>
            </p>
          )}
        </div>
        {log.length === 0 ? (
          <p className="m-0 text-sm text-muted">{L.empty}</p>
        ) : (
          <>
            {areas.length > 1 && (
              <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter by area">
                {[[null, L.filterAll] as const, ...areas].map(([id, name]) => (
                  <button
                    key={id ?? "all"}
                    type="button"
                    aria-pressed={filter === id}
                    onClick={() => setFilter(id)}
                    className={cn("min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-sm font-bold", filter === id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink")}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            <ul className="m-0 grid list-none gap-2 p-0">
              {shown.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[14px] border border-line px-4 py-3">
                  <div className="min-w-0 text-sm">
                    <p className="m-0 font-extrabold text-ink">
                      {formatMedium(e.checkIn)} · {e.nights} {e.nights === 1 ? "night" : "nights"} · {e.areaName}
                    </p>
                    <p className="m-0 text-muted">
                      {e.guests !== null && <>{e.guests} {e.guests === 1 ? "guest" : "guests"} · </>}
                      charged on {e.chargeableNights}
                      {e.reference && <> · {e.reference}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold tabular-nums">{formatPence(e.levyPence)}</span>
                    <button type="button" onClick={() => onEdit(e)} aria-label={`Edit the stay from ${formatMedium(e.checkIn)}`} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-ink underline underline-offset-2">
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(e)} aria-label={`Delete the stay from ${formatMedium(e.checkIn)}`} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-3 text-right text-sm font-bold">
              Total: <span className="text-base font-extrabold tabular-nums">{formatPence(sum)}</span>
            </p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <Totals title={L.quarters} totals={totals.quarters} />
              <Totals title={L.months} totals={totals.months} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => onCsv(shown)} className="btn btn-outline min-h-11">
                {L.csv}
              </button>
              {confirm ? (
                <span className="flex flex-wrap items-center gap-2 text-sm font-bold" role="alert">
                  {L.clearConfirm}
                  <button type="button" onClick={() => (onClear(), setConfirm(false), setFilter(null))} className="btn btn-coral min-h-11">
                    {L.clearYes}
                  </button>
                  <button type="button" onClick={() => setConfirm(false)} className="btn btn-outline min-h-11">
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirm(true)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                  {L.clear}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
