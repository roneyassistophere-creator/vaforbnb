"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { copy } from "@/content/tools/londonNights";
import { cn } from "@/lib/cn";
import {
  checkOutFromNights,
  draftToBooking,
  findDuplicate,
  isValidDate,
  nightsBetween,
  platformLabels,
  validateDraft,
  type Booking,
  type Draft,
  type DraftErrors,
  type Platform,
} from "@/lib/tools/london-nights";

const C = copy.form;
const empty: Draft = { checkIn: "", checkOut: "", platform: "", otherPlatform: "", reference: "", note: "" };

const toDraft = (b: Booking): Draft => ({
  checkIn: b.checkIn,
  checkOut: b.checkOut,
  platform: b.platform,
  otherPlatform: b.otherPlatform ?? "",
  reference: b.reference ?? "",
  note: b.note ?? "",
});

const field = "field min-h-12";
const labelCls = "grid gap-1.5 text-sm font-bold text-ink";
const errCls = "m-0 text-sm font-bold text-brand";

/** Add or edit a booking. */
export function BookingForm({
  editing,
  bookings,
  onSave,
  onCancelEdit,
}: {
  editing: Booking | null;
  bookings: Booking[];
  onSave: (b: Booking, isEdit: boolean) => void;
  onCancelEdit: () => void;
}) {
  const [d, setD] = useState<Draft>(editing ? toDraft(editing) : empty);
  const [nightsText, setNightsText] = useState(editing ? String(nightsBetween(editing.checkIn, editing.checkOut)) : "");
  const [errors, setErrors] = useState<DraftErrors>({});
  const [dupe, setDupe] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  // Load a booking into the form when Edit is pressed.
  useEffect(() => {
    if (!editing) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setD(toDraft(editing));
    setNightsText(String(nightsBetween(editing.checkIn, editing.checkOut)));
    setErrors({});
    setDupe(false);
    firstRef.current?.focus();
  }, [editing]);

  const set = (patch: Partial<Draft>) => {
    const next = { ...d, ...patch };
    setD(next);
    if (("checkIn" in patch || "checkOut" in patch) && isValidDate(next.checkIn) && isValidDate(next.checkOut)) {
      const n = nightsBetween(next.checkIn, next.checkOut);
      setNightsText(n > 0 ? String(n) : "");
    }
    setDupe(false);
  };

  const onNights = (v: string) => {
    const clean = v.replace(/[^\d]/g, "").slice(0, 3);
    setNightsText(clean);
    const n = Number(clean);
    if (clean && n > 0) setD({ ...d, checkOut: checkOutFromNights(d.checkIn, n) || d.checkOut });
    setDupe(false);
  };

  const submit = (e?: FormEvent, force = false) => {
    e?.preventDefault();
    const errs = validateDraft(d);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!force && findDuplicate(d, bookings, editing?.id)) {
      setDupe(true);
      return;
    }
    onSave(draftToBooking(d, editing?.id), !!editing);
    setD({ ...empty, platform: d.platform, otherPlatform: d.otherPlatform });
    setNightsText("");
    setDupe(false);
    firstRef.current?.focus();
  };

  const cancel = () => {
    setD(empty);
    setNightsText("");
    setErrors({});
    setDupe(false);
    onCancelEdit();
  };

  return (
    <form onSubmit={submit} className="grid gap-4" aria-label={editing ? C.editTitle : C.addTitle} noValidate>
      <h2 className="m-0 text-xl font-extrabold tracking-[-0.4px]">{editing ? C.editTitle : C.addTitle}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_96px]">
        <label className={labelCls}>
          {C.checkIn}
          <input ref={firstRef} type="date" className={field} value={d.checkIn} onChange={(e) => set({ checkIn: e.target.value })} aria-invalid={!!errors.checkIn} />
          {errors.checkIn && <span className={errCls}>{errors.checkIn}</span>}
        </label>
        <label className={labelCls}>
          {C.checkOut}
          <input type="date" className={field} value={d.checkOut} min={d.checkIn || undefined} onChange={(e) => set({ checkOut: e.target.value })} aria-invalid={!!errors.checkOut} />
          {errors.checkOut && <span className={errCls}>{errors.checkOut}</span>}
        </label>
        <label className={labelCls}>
          {C.nights}
          <input type="text" inputMode="numeric" className={cn(field, "text-center font-bold")} value={nightsText} onChange={(e) => onNights(e.target.value)} aria-describedby="nights-hint" />
        </label>
      </div>
      <p id="nights-hint" className="-mt-2 m-0 text-[13px] text-muted">
        {C.nightsHint}
      </p>

      <fieldset className="m-0 min-w-0 border-none p-0">
        <legend className="mb-2 p-0 text-sm font-bold text-ink">{C.platform}</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(platformLabels) as Platform[]).map((p) => (
            <label
              key={p}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
            >
              <input type="radio" name="platform" value={p} checked={d.platform === p} onChange={() => set({ platform: p })} className="size-4 accent-ink" />
              {platformLabels[p]}
            </label>
          ))}
        </div>
        {errors.platform && <p className={cn(errCls, "mt-2")}>{errors.platform}</p>}
      </fieldset>

      {d.platform === "other" && (
        <label className={labelCls}>
          {C.otherName}
          <input type="text" className={field} value={d.otherPlatform} maxLength={60} onChange={(e) => set({ otherPlatform: e.target.value })} />
        </label>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          {C.reference}
          <input type="text" className={field} value={d.reference} maxLength={120} autoComplete="off" onChange={(e) => set({ reference: e.target.value })} aria-describedby="ref-hint" />
          <span id="ref-hint" className="text-[13px] font-normal text-muted">
            {C.referenceHint}
          </span>
        </label>
        <label className={labelCls}>
          {C.note}
          <input type="text" className={field} value={d.note} maxLength={300} autoComplete="off" onChange={(e) => set({ note: e.target.value })} />
        </label>
      </div>

      {dupe && (
        <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold text-amber" role="alert">
          <span className="flex-1">{C.duplicate}</span>
          <button type="button" onClick={() => submit(undefined, true)} className="btn btn-outline min-h-11 bg-white">
            {C.addAnyway}
          </button>
          <button type="button" onClick={() => setDupe(false)} className="btn btn-outline min-h-11 bg-white">
            {C.cancel}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button type="submit" className="btn btn-ink">
          {editing ? C.save : C.add}
        </button>
        {editing && (
          <button type="button" onClick={cancel} className="btn btn-outline">
            {C.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
