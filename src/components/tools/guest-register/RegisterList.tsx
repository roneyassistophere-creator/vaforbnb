"use client";

import { useState } from "react";
import { copy } from "@/content/tools/guestRegister";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import type { Figures } from "@/lib/tools/figures";
import { extraCount, filterStays, isPastRetention, keepUntil, newestFirst, type Lists, type Property, type Stay } from "@/lib/tools/guest-register";
import { DateField } from "../DateField";

export type Filters = { query: string; propertyId: string; from: string; to: string };
export const noFilters: Filters = { query: "", propertyId: "", from: "", to: "" };

/** Saved stays with search, filters, the retention panel and exports. */
export function RegisterList({
  stays,
  properties,
  lists,
  figures,
  today,
  reminder,
  onOpen,
  onCsv,
  onPrint,
  onDeletePast,
  undoCount,
  onUndo,
}: {
  stays: Stay[];
  properties: Property[];
  lists: Lists;
  figures: Figures;
  today: string;
  reminder: boolean;
  onOpen: (s: Stay) => void;
  onCsv: (s: Stay[], f: Filters) => void;
  onPrint: (s: Stay[], f: Filters) => void;
  onDeletePast: () => void;
  undoCount: number;
  onUndo: () => void;
}) {
  const R = copy.register;
  const [f, setF] = useState<Filters>(noFilters);
  const [review, setReview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const past = stays.filter((s) => isPastRetention(s, figures, today));
  const shown = newestFirst(filterStays(stays, f));
  const name = (id: string) => properties.find((p) => p.id === id)?.name ?? "Deleted property";
  const filtering = f.query || f.propertyId || f.from || f.to;

  return (
    <section aria-labelledby="register-title" className="rounded-[20px] border border-line bg-white p-5 md:p-6" id="your-register">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="register-title" className="m-0 text-xl font-extrabold">
          {R.title} <span className="text-sm font-semibold text-muted">({stays.length} {stays.length === 1 ? "stay" : "stays"})</span>
        </h2>
      </div>

      <div aria-live="polite">
        {undoCount > 0 && (
          <p className="m-0 mb-4 flex flex-wrap items-center gap-3 rounded-[12px] bg-cloud px-4 py-3 text-sm font-bold">
            Deleted {undoCount} {undoCount === 1 ? "stay" : "stays"}.
            <button type="button" onClick={onUndo} className="btn btn-outline min-h-11">
              Undo
            </button>
          </p>
        )}
      </div>

      {reminder && past.length > 0 && (
        <div className="mb-4 rounded-[14px] border border-[#C68A00] bg-amber-25 p-4" role="region" aria-label="Retention">
          <p className="m-0 text-[15px] font-bold text-ink">
            {past.length} {past.length === 1 ? "stay is" : "stays are"} past the {lists.retentionMonths}-month retention period. Delete {past.length === 1 ? "it" : "them"}?
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setReview((r) => !r)} aria-expanded={review} className="btn btn-outline min-h-11">
              {review ? "Hide" : "Review"}
            </button>
            {confirm ? (
              <span className="flex flex-wrap items-center gap-2 text-sm font-bold" role="alert">
                Delete {past.length} {past.length === 1 ? "stay" : "stays"} from this device?
                <button type="button" onClick={() => (onDeletePast(), setConfirm(false), setReview(false))} className="btn btn-coral min-h-11">
                  Yes, delete
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="btn btn-outline min-h-11">
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirm(true)} className="btn btn-coral min-h-11">
                {past.length === 1 ? "Delete this stay" : `Delete these ${past.length} stays`}
              </button>
            )}
          </div>
          {review && (
            <ul className="m-0 mt-3 grid list-none gap-1 p-0 text-sm">
              {newestFirst(past).map((s) => (
                <li key={s.id}>
                  {formatMedium(s.arrival)} · {name(s.propertyId)}
                  {s.reference && ` · ${s.reference}`} · kept until {formatMedium(keepUntil(s, figures))}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-1.5">
          <label htmlFor="register-search" className="text-sm font-bold">
            {R.search}
          </label>
          <input id="register-search" type="search" className="field min-h-12" value={f.query} autoComplete="off" onChange={(e) => setF({ ...f, query: e.target.value })} />
        </div>
        {properties.length > 1 && (
          <div className="grid gap-1.5">
            <label htmlFor="register-property" className="text-sm font-bold">
              {R.property}
            </label>
            <select id="register-property" className="field min-h-12" value={f.propertyId} onChange={(e) => setF({ ...f, propertyId: e.target.value })}>
              <option value="">All properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <details className="mb-4">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-ink">Filter by arrival date</summary>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <DateField id="register-from" label={R.from} value={f.from} onChange={(v) => setF({ ...f, from: v })} />
          <DateField id="register-to" label={R.to} value={f.to} onChange={(v) => setF({ ...f, to: v })} />
        </div>
      </details>

      {shown.length === 0 ? (
        <p className="m-0 text-sm text-muted">{R.empty}</p>
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0">
          {shown.map((s) => {
            const extra = extraCount(s, lists);
            const isPast = isPastRetention(s, figures, today);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onOpen(s)}
                  className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[14px] border border-line bg-white px-4 py-3 text-left hover:border-ink"
                  aria-label={`Open stay arriving ${formatMedium(s.arrival)}, ${s.guests.length} guests${s.reference ? `, ${s.reference}` : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-extrabold text-ink">
                      {formatMedium(s.arrival)} · {name(s.propertyId)}
                    </span>
                    <span className="block text-sm text-muted">
                      {s.reference ? `${s.reference} · ` : ""}
                      {s.guests.length} {s.guests.length === 1 ? "guest" : "guests"}
                      {s.guests.length ? ` (${s.guests.map((g) => g.fullName.split(" ")[0]).join(", ")})` : ""}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    {s.example && <span className="rounded-full bg-fog px-2.5 py-1 text-[12px] font-extrabold text-ink-copy">Example</span>}
                    {extra > 0 && <span className="rounded-full bg-amber-25 px-2.5 py-1 text-[12px] font-extrabold text-[#6B4A00]">{extra} with extra details</span>}
                    <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-extrabold", isPast ? "bg-coral-50 text-brand" : "bg-cloud text-ink-copy")}>
                      {isPast ? R.past : `${R.keepUntil} ${formatMedium(keepUntil(s, figures))}`}
                    </span>
                    <span aria-hidden="true" className="text-lg text-muted">
                      ›
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onCsv(shown, f)} className="btn btn-outline min-h-11" disabled={!shown.length}>
          {R.csv}
          {filtering ? ` (${shown.length})` : ""}
        </button>
        <button type="button" onClick={() => onPrint(shown, f)} className="btn btn-outline min-h-11" disabled={!shown.length}>
          {R.print}
        </button>
      </div>
    </section>
  );
}
