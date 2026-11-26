"use client";

import { useRef, useState } from "react";
import { DateField } from "@/components/tools/DateField";
import { Chips, Num } from "@/components/tools/profit/Fields";
import { Toggle } from "@/components/tools/Toggle";
import { cn } from "@/lib/cn";
import { parseCsv } from "@/lib/tools/csv";
import { daysInMonth, formatMedium, parseTypedDate } from "@/lib/tools/dates";
import { readFileText } from "@/lib/tools/download";
import { money } from "@/lib/tools/format";
import { parseMonthPaste, previewBookingCsv, type Booking, type Errors, type MonthRow, type MonthlyState, type ListState, type QuickState, type Target } from "@/lib/tools/booking-performance";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---- Quick ----------------------------------------------------------------------------- */

export function QuickInputs({ q, set, errors, targets, setTargets }: { q: QuickState; set: (p: Partial<QuickState>) => void; errors: Errors; targets: Target; setTargets: (t: Target) => void }) {
  return (
    <div className="grid gap-5" data-quick>
      <Chips
        legend="Period"
        name="q-kind"
        value={q.periodKind}
        onChange={(periodKind) => set({ periodKind })}
        options={[
          { value: "nights", label: "Number of nights" },
          { value: "dates", label: "Dates" },
        ]}
      />
      {q.periodKind === "nights" ? (
        <Num id="q-nights" label="Nights in the period" value={q.nights} onChange={(nights) => set({ nights })} hint="1 to 366, e.g. 30 for a month." error={errors.nights} className="sm:max-w-[260px]" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField id="q-start" label="First night" value={q.start} onChange={(start) => set({ start })} />
          <DateField id="q-end" label="End date (not counted)" value={q.end} onChange={(end) => set({ end })} hint="A stay of 1–31 March is 30 nights." error={errors.nights} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Num id="q-booked" label="Nights booked" value={q.booked} onChange={(booked) => set({ booked })} error={errors.booked} />
        <Num id="q-blocked" label="Nights blocked by you" value={q.blocked} onChange={(blocked) => set({ blocked })} hint="Optional: your own use or maintenance." error={errors.blocked ?? errors.available} />
        <Num id="q-revenue" label="Accommodation revenue" prefix="£" value={q.revenue} onChange={(revenue) => set({ revenue })} hint="Excluding cleaning fees." error={errors.revenue} />
      </div>
      <details className="rounded-[14px] bg-cloud-2 p-4">
        <summary className="min-h-11 cursor-pointer font-bold">More (optional): cleaning income, platform fee, bookings</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Num id="q-cleaning" label="Cleaning fee income" prefix="£" value={q.cleaning} onChange={(cleaning) => set({ cleaning })} hint="For TRevPAR." error={errors.cleaning} />
          <Num id="q-fee" label="Platform fee" suffix="%" value={q.feePercent} onChange={(feePercent) => set({ feePercent })} hint="For net RevPAR." error={errors.feePercent} />
          <Num id="q-bookings" label="Number of bookings" value={q.bookings} onChange={(bookings) => set({ bookings })} hint="For average stay." error={errors.bookings} />
        </div>
      </details>
      <div className="grid gap-4 rounded-[14px] border border-line p-4">
        <Toggle label="Compare with last year" checked={q.compareOn} onChange={(compareOn) => set({ compareOn })} hint="The same period last year." />
        {q.compareOn && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Num id="ly-nights" label="Nights" value={q.lastYear.nights} onChange={(nights) => set({ lastYear: { ...q.lastYear, nights } })} error={errors["ly.nights"]} />
            <Num id="ly-booked" label="Booked" value={q.lastYear.booked} onChange={(booked) => set({ lastYear: { ...q.lastYear, booked } })} error={errors["ly.booked"]} />
            <Num id="ly-blocked" label="Blocked" value={q.lastYear.blocked} onChange={(blocked) => set({ lastYear: { ...q.lastYear, blocked } })} error={errors["ly.blocked"] ?? errors["ly.available"]} />
            <Num id="ly-revenue" label="Revenue" prefix="£" value={q.lastYear.revenue} onChange={(revenue) => set({ lastYear: { ...q.lastYear, revenue } })} error={errors["ly.revenue"]} />
          </div>
        )}
      </div>
      <TargetInputs targets={targets} setTargets={setTargets} />
    </div>
  );
}

/** Targets (blank = no target). Shared by every mode. */
export function TargetInputs({ targets, setTargets }: { targets: Target; setTargets: (t: Target) => void }) {
  const field = (k: keyof Target, label: string, unit: { prefix?: string; suffix?: string }) => (
    <Blankable id={`t-${k}`} label={label} value={targets[k]} onChange={(v) => setTargets({ ...targets, [k]: v })} {...unit} />
  );
  return (
    <details className="rounded-[14px] border border-line p-4">
      <summary className="min-h-11 cursor-pointer font-bold">Targets (optional)</summary>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {field("occupancy", "Occupancy target", { suffix: "%" })}
        {field("adr", "ADR target", { prefix: "£" })}
        {field("revpar", "RevPAR target", { prefix: "£" })}
      </div>
    </details>
  );
}

/** A number field where empty means “not set”. */
function Blankable({ id, label, value, onChange, prefix, suffix, compact, hideLabel, error }: { id: string; label: string; value: number | null; onChange: (v: number | null) => void; prefix?: string; suffix?: string; compact?: boolean; hideLabel?: boolean; error?: string }) {
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [last, setLast] = useState(value);
  if (value !== last) {
    setLast(value);
    setDraft(value === null ? "" : String(value));
  }
  return (
    <div className="grid min-w-0 content-start gap-1.5">
      <label htmlFor={id} className={hideLabel ? "sr-only-label" : "text-[15px] font-bold"}>
        {label}
      </label>
      <div className={cn("flex items-center rounded-[12px] border-[1.5px] bg-white focus-within:border-ink", error ? "border-brand" : "border-line", compact ? "min-h-11" : "min-h-11")}>
        {prefix && <span className="pl-2.5 text-sm font-bold text-muted">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className="min-h-11 w-full min-w-0 bg-transparent px-2.5 text-base tabular-nums outline-none"
          value={draft}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const t = e.target.value.replace(/[£,%\s]/g, "");
            setDraft(t);
            const v = t === "" ? null : Number(t);
            setLast(v);
            onChange(v === null || Number.isFinite(v) ? v : Number.NaN);
          }}
        />
        {suffix && <span className="pr-2.5 text-sm font-bold text-muted">{suffix}</span>}
      </div>
      {error && <p className="m-0 text-[12px] font-bold text-brand">{error}</p>}
    </div>
  );
}

/* ---- Monthly tracker ------------------------------------------------------------------- */

export function MonthlyInputs({ m, set, errors, targets, setTargets }: { m: MonthlyState; set: (p: Partial<MonthlyState>) => void; errors: Errors; targets: Target; setTargets: (t: Target) => void }) {
  const [which, setWhich] = useState<"thisYear" | "lastYear">("thisYear");
  const [paste, setPaste] = useState("");
  const preview = paste.trim() ? parseMonthPaste(paste) : null;
  const rows = m[which];
  const setRow = (i: number, patch: Partial<MonthRow>) => set({ [which]: rows.map((r, k) => (k === i ? { ...r, ...patch } : r)) });
  const year = which === "thisYear" ? m.year : m.year - 1;
  return (
    <div className="grid gap-5" data-monthly>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="m-year" className="text-[15px] font-bold">
            Year
          </label>
          <select id="m-year" className="field min-h-11" value={m.year} onChange={(e) => set({ year: Number(e.target.value) })}>
            {[m.year - 2, m.year - 1, m.year, m.year + 1, m.year + 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex rounded-full border border-line bg-white p-1" role="group" aria-label="Which year to edit">
          {(["thisYear", "lastYear"] as const).map((w) => (
            <button key={w} type="button" aria-pressed={which === w} onClick={() => setWhich(w)} className={cn("min-h-11 rounded-full px-4 text-sm font-bold", which === w ? "bg-ink text-white" : "text-ink")} data-which={w}>
              {w === "thisYear" ? `This year (${m.year})` : `Last year (${m.year - 1})`}
            </button>
          ))}
        </div>
      </div>
      <p className="m-0 -mt-2 text-[13px] text-muted">Leave future months blank: they’re left out, and totals show as year to date.</p>
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0" data-month-scroll>
        <table className="w-full min-w-[540px] border-collapse text-sm" data-month-table={which}>
          <caption className="sr-only-label">Blocked nights, booked nights, revenue and cleaning income for each month of {year}</caption>
          <thead className="text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th scope="col" className="px-1 py-2 text-left">Month</th>
              <th scope="col" className="px-1 py-2 text-left">Available</th>
              <th scope="col" className="px-1 py-2 text-left">Blocked</th>
              <th scope="col" className="px-1 py-2 text-left">Booked</th>
              <th scope="col" className="px-1 py-2 text-left">Revenue £</th>
              <th scope="col" className="px-1 py-2 text-left">Cleaning £</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const days = daysInMonth(year, i + 1);
              return (
                <tr key={i} className="border-t border-line" data-row={i}>
                  <th scope="row" className="px-1 py-1 text-left font-bold">
                    {MONTHS[i]}
                  </th>
                  <td className="px-1 py-1 text-ink-copy tabular-nums" data-available>
                    {r.booked === null && r.revenue === null ? <span className="text-muted">{days}</span> : days - (r.blocked ?? 0)}
                  </td>
                  <td className="px-1 py-1">
                    <Blankable id={`${which}-${i}-blocked`} label={`${MONTHS[i]} ${year} blocked nights`} hideLabel value={r.blocked} onChange={(blocked) => setRow(i, { blocked })} error={errors[`${which === "thisYear" ? "m" : "l"}.${i}.blocked`]} />
                  </td>
                  <td className="px-1 py-1">
                    <Blankable id={`${which}-${i}-booked`} label={`${MONTHS[i]} ${year} nights booked`} hideLabel value={r.booked} onChange={(booked) => setRow(i, { booked })} error={errors[`${which === "thisYear" ? "m" : "l"}.${i}.booked`]} />
                  </td>
                  <td className="px-1 py-1">
                    <Blankable id={`${which}-${i}-revenue`} label={`${MONTHS[i]} ${year} revenue`} hideLabel value={r.revenue} onChange={(revenue) => setRow(i, { revenue })} error={errors[`${which === "thisYear" ? "m" : "l"}.${i}.revenue`]} />
                  </td>
                  <td className="px-1 py-1">
                    <Blankable id={`${which}-${i}-cleaning`} label={`${MONTHS[i]} ${year} cleaning income`} hideLabel value={r.cleaning} onChange={(cleaning) => setRow(i, { cleaning })} error={errors[`${which === "thisYear" ? "m" : "l"}.${i}.cleaning`]} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <details className="rounded-[14px] bg-cloud-2 p-4">
        <summary className="min-h-11 cursor-pointer font-bold">Paste from a spreadsheet</summary>
        <div className="mt-2 grid gap-3">
          <label htmlFor="m-paste" className="text-sm font-bold">
            Paste up to 12 rows: blocked, booked, revenue, and optionally cleaning ({which === "thisYear" ? `this year, ${m.year}` : `last year, ${m.year - 1}`})
          </label>
          <textarea id="m-paste" rows={5} className="field p-3 font-mono text-[13px]" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"0\t17\t1870\n0\t15\t1590"} />
          {preview && (
            <div className="grid gap-2 text-sm" data-paste-preview>
              <p className="m-0 font-bold">{preview.rows.filter((r) => r.booked !== null).length} months ready.</p>
              {preview.errors.map((x) => (
                <p key={x} className="m-0 font-bold text-brand">
                  {x}
                </p>
              ))}
              <button
                type="button"
                className="btn btn-coral min-h-11 justify-self-start"
                onClick={() => {
                  set({ [which]: preview.rows });
                  setPaste("");
                }}
                data-paste-confirm
              >
                Fill the table
              </button>
            </div>
          )}
        </div>
      </details>
      <TargetInputs targets={targets} setTargets={setTargets} />
    </div>
  );
}

/* ---- Booking list ------------------------------------------------------------------------ */

const blankBooking = { checkIn: "", checkOut: "", revenue: 0, channel: "", bookedOn: "", cleaning: 0 };

export function ListInputs({ l, set, errors, flags, onImported }: { l: ListState; set: (p: Partial<ListState>) => void; errors: Errors; flags: Record<string, string>; onImported: () => void }) {
  const [draft, setDraft] = useState<Omit<Booking, "id">>(blankBooking);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftError, setDraftError] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof previewBookingCsv> | null>(null);
  const [block, setBlock] = useState({ from: "", to: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  const save = () => {
    if (!draft.checkIn || !draft.checkOut) return setDraftError("Enter check-in and check-out dates.");
    if (draft.checkOut <= draft.checkIn) return setDraftError("Check-out must be after check-in.");
    if (!(draft.revenue >= 0) || !(draft.cleaning >= 0)) return setDraftError("Revenue can’t be negative.");
    setDraftError("");
    if (editing) set({ bookings: l.bookings.map((b) => (b.id === editing ? { ...draft, id: editing } : b)) });
    else set({ bookings: [...l.bookings, { ...draft, id: uid() }] });
    setDraft(blankBooking);
    setEditing(null);
  };

  return (
    <div className="grid gap-5" data-list>
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="l-start" label="Period start (first night)" value={l.start} onChange={(start) => set({ start })} />
        <DateField id="l-end" label="Period end (not counted)" value={l.end} onChange={(end) => set({ end })} error={errors.period} hint="For March, 1 March to 1 April." />
      </div>

      <form
        className="grid gap-3 rounded-[14px] bg-cloud-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        data-booking-form
      >
        <p className="m-0 font-extrabold">{editing ? "Edit booking" : "Add a booking"}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <DateField id="bf-in" label="Check-in" value={draft.checkIn} onChange={(checkIn) => setDraft({ ...draft, checkIn })} />
          <DateField id="bf-out" label="Check-out" value={draft.checkOut} onChange={(checkOut) => setDraft({ ...draft, checkOut })} />
          <Num id="bf-rev" label="Revenue for the whole booking" prefix="£" value={draft.revenue} onChange={(revenue) => setDraft({ ...draft, revenue })} hint="Excluding cleaning." />
        </div>
        <details>
          <summary className="min-h-11 cursor-pointer text-sm font-bold">Optional: channel, booked-on date, cleaning fee</summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <label htmlFor="bf-channel" className="text-[15px] font-bold">
                Channel
              </label>
              <input id="bf-channel" className="field min-h-11" value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })} placeholder="Airbnb" />
            </div>
            <DateField id="bf-booked" label="Booked on" value={draft.bookedOn} onChange={(bookedOn) => setDraft({ ...draft, bookedOn })} />
            <Num id="bf-clean" label="Cleaning fee" prefix="£" value={draft.cleaning} onChange={(cleaning) => setDraft({ ...draft, cleaning })} />
          </div>
        </details>
        {draftError && (
          <p className="m-0 text-sm font-bold text-brand" role="alert">
            {draftError}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-coral min-h-11" data-add-booking>
            {editing ? "Save booking" : "Add booking"}
          </button>
          {editing && (
            <button type="button" className="btn btn-outline min-h-11" onClick={() => (setEditing(null), setDraft(blankBooking))}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 mr-auto font-extrabold">Bookings ({l.bookings.length})</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only-label"
            id="l-import"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setPreview(previewBookingCsv(parseCsv(await readFileText(f)), parseTypedDate));
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <label htmlFor="l-import" className="btn btn-outline min-h-11 cursor-pointer">
            Import CSV
          </label>
        </div>
        <p className="m-0 text-[13px] text-muted">CSV columns: check-in, check-out, revenue, channel, booked-on, cleaning. Dates as DD/MM/YYYY or YYYY-MM-DD.</p>
        {preview && (
          <div className="grid gap-2 rounded-[14px] border border-ink bg-white p-3" data-import-preview>
            <p className="m-0 text-sm font-bold" data-import-counts>
              {preview.filter((r) => r.booking).length} ready to import, {preview.filter((r) => !r.booking).length} with problems (skipped).
            </p>
            <ul className="m-0 grid max-h-48 list-none gap-1 overflow-auto p-0 text-[13px]">
              {preview.map((r) => (
                <li key={r.line} className={r.booking ? "" : "font-bold text-brand"} data-import-row={r.line}>
                  Line {r.line}: {r.booking ? `${formatMedium(r.booking.checkIn)} to ${formatMedium(r.booking.checkOut)}, ${money(r.booking.revenue)}` : r.errors.join(" ")}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-coral min-h-11"
                disabled={!preview.some((r) => r.booking)}
                onClick={() => {
                  set({ bookings: [...l.bookings, ...preview.flatMap((r) => (r.booking ? [{ ...r.booking, id: uid() }] : []))] });
                  setPreview(null);
                  onImported();
                }}
                data-import-confirm
              >
                Import {preview.filter((r) => r.booking).length} bookings
              </button>
              <button type="button" className="btn btn-outline min-h-11" onClick={() => setPreview(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {l.bookings.length > 0 && (
          <ul className="m-0 grid list-none gap-1.5 p-0" data-booking-list>
            {[...l.bookings]
              .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
              .map((b) => (
                <li key={b.id} className={cn("flex flex-wrap items-center gap-2 rounded-[12px] border px-3 py-1.5 text-sm", flags[b.id] || errors[`b.${b.id}`] ? "border-coral-100 bg-coral-25" : "border-line bg-white")} data-booking={b.id}>
                  <span className="min-w-0 flex-1">
                    <span className="font-bold tabular-nums">
                      {b.checkIn ? formatMedium(b.checkIn) : "?"} → {b.checkOut ? formatMedium(b.checkOut) : "?"}
                    </span>{" "}
                    · {money(b.revenue)}
                    {b.channel && ` · ${b.channel}`}
                    {(flags[b.id] || errors[`b.${b.id}`]) && <span className="block text-[12px] font-bold text-brand">{errors[`b.${b.id}`] ?? flags[b.id]}</span>}
                  </span>
                  <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => (setEditing(b.id), setDraft({ checkIn: b.checkIn, checkOut: b.checkOut, revenue: b.revenue, channel: b.channel, bookedOn: b.bookedOn, cleaning: b.cleaning }))} aria-label={`Edit booking ${b.checkIn} to ${b.checkOut}`}>
                    Edit
                  </button>
                  <button type="button" className="min-h-11 px-2 font-bold text-brand underline" onClick={() => set({ bookings: l.bookings.filter((x) => x.id !== b.id) })} aria-label={`Delete booking ${b.checkIn} to ${b.checkOut}`}>
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3 rounded-[14px] border border-line p-4" data-blocks>
        <p className="m-0 font-extrabold">Nights you blocked</p>
        <div className="flex flex-wrap items-end gap-3">
          <DateField id="k-from" label="First blocked night" value={block.from} onChange={(from) => setBlock({ ...block, from })} className="w-[180px]" />
          <DateField id="k-to" label="Last blocked night" value={block.to} onChange={(to) => setBlock({ ...block, to })} className="w-[180px]" />
          <button
            type="button"
            className="btn btn-outline min-h-11"
            disabled={!block.from || !block.to || block.to < block.from}
            onClick={() => {
              set({ blocks: [...l.blocks, { id: uid(), ...block }] });
              setBlock({ from: "", to: "" });
            }}
            data-add-block
          >
            Add blocked nights
          </button>
        </div>
        {l.blocks.length > 0 && (
          <ul className="m-0 grid list-none gap-1 p-0 text-sm">
            {l.blocks.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="flex-1 tabular-nums">
                  {formatMedium(r.from)} to {formatMedium(r.to)}
                  {errors[`k.${r.id}`] && <span className="block font-bold text-brand">{errors[`k.${r.id}`]}</span>}
                </span>
                <button type="button" className="min-h-11 px-2 font-bold text-brand underline" onClick={() => set({ blocks: l.blocks.filter((x) => x.id !== r.id) })}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
