"use client";

import { useEffect, useRef, useState } from "react";
import { copy } from "@/content/tools/guestRegister";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import { fillTemplate, type Figures } from "@/lib/tools/figures";
import {
  copyNextDestination,
  countryName,
  guestMessages,
  guestNeedsExtra,
  keepUntil,
  platformLabels,
  resizeGuests,
  validateStay,
  type Draft,
  type Guest,
  type Lists,
  type Platform,
  type Property,
  type Stay,
} from "@/lib/tools/guest-register";
import { DateField } from "../DateField";
import { NumberField } from "../NumberField";
import { PropertyPicker } from "../PropertyPicker";
import { StepProgress } from "../StepProgress";
import { Toggle } from "../Toggle";
import { fieldId, GuestCard } from "./GuestCard";

const card = "rounded-[20px] border border-line bg-white p-4 md:p-6";
const linkBtn = "min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold underline underline-offset-2";

type Problem = { id: string; text: string; step: 1 | 2 };

/** Every problem in the stay, in page order, with the field to jump to. */
function problems(stay: Stay, lists: Lists): Problem[] {
  const e = validateStay(stay, lists);
  const out: Problem[] = [];
  if (e.stay.propertyId) out.push({ id: "stay-property", text: e.stay.propertyId, step: 1 });
  if (e.stay.arrival) out.push({ id: "stay-arrival", text: e.stay.arrival, step: 1 });
  if (e.stay.departure) out.push({ id: "stay-departure", text: e.stay.departure, step: 1 });
  if (e.stay.guests) out.push({ id: "stay-adults", text: e.stay.guests, step: 1 });
  stay.guests.forEach((g, i) => {
    const ge = e.guests[g.id];
    if (!ge) return;
    for (const k of ["fullName", "nationality", ...lists.extraFields.map((f) => f.key)] as const) {
      if (ge[k]) out.push({ id: fieldId(g.id, k), text: `Guest ${i + 1}: ${guestMessages[k].replace(/^Add the guest’s /, "add their ").replace(/^Add /, "add ").replace(/^Choose /, "choose ")}`, step: 2 });
    }
  });
  return out;
}

const focusField = (id: string) =>
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  });

export function RecordStay({
  draft,
  setDraft,
  lists,
  figures,
  properties,
  onSelectProperty,
  onAddProperty,
  onRenameProperty,
  onDeleteProperty,
  onSave,
  onDelete,
  onPrint,
  onCsv,
  onStartOver,
  saved,
  draftSaved,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  lists: Lists;
  figures: Figures;
  properties: Property[];
  onSelectProperty: (id: string) => void;
  onAddProperty: (name: string) => void;
  onRenameProperty: (name: string) => void;
  onDeleteProperty: () => void;
  onSave: (andAnother: boolean) => void;
  onDelete: () => void;
  onPrint: () => void;
  onCsv: () => void;
  onStartOver: () => void;
  saved: React.ReactNode;
  draftSaved: boolean;
}) {
  const S = copy.stay;
  const { stay, step } = draft;
  const [tried, setTried] = useState<Set<number>>(new Set());
  const [sameDest, setSameDest] = useState(false);
  const [removed, setRemoved] = useState<{ guest: Guest; index: number } | null>(null);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [list, setList] = useState<Problem[]>([]);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const setStay = (patch: Partial<Stay>) => {
    let next = { ...stay, ...patch };
    if (sameDest && patch.guests) next = { ...next, guests: copyNextDestination(next.guests, lists) };
    setDraft({ ...draft, stay: next });
  };
  const go = (s: 1 | 2 | 3) => {
    setDraft({ ...draft, step: s });
    setList([]);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const all = problems(stay, lists);
  const forStep = (s: 1 | 2 | 3) => all.filter((p) => s === 3 || p.step === s);

  const next = (from: 1 | 2) => {
    const p = forStep(from);
    setTried((t) => new Set(t).add(from));
    if (p.length) {
      setList(p);
      focusField(p[0].id);
      return;
    }
    go((from + 1) as 2 | 3);
  };

  const save = (andAnother: boolean) => {
    setTried(new Set([1, 2, 3]));
    if (all.length) {
      setList(all);
      const first = all[0];
      if (first.step !== step) setDraft({ ...draft, step: first.step });
      focusField(first.id);
      return;
    }
    setTried(new Set());
    setSameDest(false);
    onSave(andAnother);
  };

  const stayErr = validateStay(stay, lists);
  const showStayErr = tried.has(1) || tried.has(3);

  const removeGuest = (index: number) => {
    const g = stay.guests[index];
    setStay({ guests: stay.guests.filter((_, i) => i !== index) });
    setRemoved({ guest: g, index });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRemoved(null), 5000);
  };
  const undoRemove = () => {
    if (!removed) return;
    const guests = [...stay.guests];
    guests.splice(Math.min(removed.index, guests.length), 0, removed.guest);
    setStay({ guests });
    setRemoved(null);
  };

  const needExtra = stay.guests.filter((g) => guestNeedsExtra(g, lists)).length;
  const property = properties.find((p) => p.id === stay.propertyId);

  const problemList = list.length > 0 && (
    <div className="rounded-[14px] border-2 border-coral bg-coral-25 p-4" role="alert">
      <p className="m-0 mb-2 text-[15px] font-extrabold text-brand">
        {list.length === 1 ? "1 thing to fix" : `${list.length} things to fix`}
      </p>
      <ul className="m-0 grid list-none gap-1 p-0">
        {list.map((p) => (
          <li key={p.id}>
            <a
              href={`#${p.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                if (p.step !== step) setDraft({ ...draft, step: p.step });
                focusField(p.id);
              }}
              className="inline-flex min-h-9 items-center text-sm font-bold text-ink underline underline-offset-2"
            >
              {p.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid gap-5">
      {saved}
      <div className={card}>
        <StepProgress steps={copy.steps} current={step - 1} onStep={(i) => go((i + 1) as 1 | 2 | 3)} />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 ref={headingRef} tabIndex={-1} className="m-0 text-xl font-extrabold outline-none">
            {draft.editingId ? "Edit stay: " : ""}
            {copy.steps[step - 1]}
          </h2>
          <span aria-live="polite" className="min-h-5 text-[13px] font-bold text-green">
            {draftSaved && <>✓ {copy.draftSaved}</>}
          </span>
        </div>
        {stay.example && (
          <p className="m-0 mb-4 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-bold text-ink" role="status">
            {S.exampleBanner}
          </p>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <div id="stay-property" tabIndex={-1}>
              <PropertyPicker
                properties={properties}
                activeId={stay.propertyId}
                onSelect={onSelectProperty}
                onAdd={onAddProperty}
                onRename={onRenameProperty}
                onDelete={onDeleteProperty}
                deleteText={`Delete “${property?.name ?? ""}” from this device? Saved stays for it keep their records.`}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="stay-reference" className="text-[15px] font-bold">
                {S.reference}
              </label>
              <p id="stay-reference-hint" className="m-0 text-[13px] text-muted">
                {S.referenceHint}
              </p>
              <input id="stay-reference" aria-describedby="stay-reference-hint" className="field min-h-12" value={stay.reference} maxLength={60} autoComplete="off" onChange={(e) => setStay({ reference: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <DateField id="stay-arrival" label={S.arrival} value={stay.arrival} onChange={(v) => setStay({ arrival: v })} error={showStayErr ? stayErr.stay.arrival : undefined} />
              <DateField
                id="stay-departure"
                label={S.departure}
                hint={S.departureHint}
                value={stay.departure ?? ""}
                onChange={(v) => setStay({ departure: v || undefined })}
                error={showStayErr ? stayErr.stay.departure : undefined}
              />
            </div>
            <fieldset className="m-0 min-w-0 border-none p-0">
              <legend className="mb-2 p-0 text-[15px] font-bold">{S.platform}</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(platformLabels) as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={stay.platform === p}
                    onClick={() => setStay({ platform: stay.platform === p ? undefined : p })}
                    className={cn("min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-sm font-bold", stay.platform === p ? "border-ink bg-ink text-white" : "border-line bg-white text-ink")}
                  >
                    {platformLabels[p]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <div id="stay-adults" tabIndex={-1}>
                <NumberField
                  name="adults"
                  label={fillTemplate(S.adults, figures)}
                  value={String(stay.guests.length)}
                  onChange={(v) => {
                    const n = Number(v);
                    if (Number.isInteger(n) && n >= 1 && n <= 30) setStay({ guests: resizeGuests(stay.guests, n) });
                  }}
                  min={1}
                  max={30}
                  error={showStayErr ? stayErr.stay.guests : undefined}
                />
              </div>
              <NumberField
                name="under16"
                label={fillTemplate(S.under16, figures)}
                hint={fillTemplate(S.under16Hint, figures)}
                value={String(stay.under16)}
                onChange={(v) => {
                  const n = Number(v);
                  setStay({ under16: Number.isInteger(n) && n >= 0 && n <= 30 ? n : 0 });
                }}
                min={0}
                max={30}
              />
            </div>
            {problemList}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={() => next(1)} className="btn btn-ink min-h-12 px-8">
                Next: guests →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            {needExtra >= 2 && <Toggle label={copy.guest.sameDestination} checked={sameDest} onChange={(v) => (setSameDest(v), v && setDraft({ ...draft, stay: { ...stay, guests: copyNextDestination(stay.guests, lists) } }))} />}
            {stay.guests.map((g, i) => (
              <GuestCard
                key={g.id}
                guest={g}
                index={i}
                total={stay.guests.length}
                lists={lists}
                errors={validateStay(stay, lists).guests[g.id] ?? {}}
                showErrors={tried.has(2) || tried.has(3)}
                onChange={(ng) => setStay({ guests: stay.guests.map((x) => (x.id === g.id ? ng : x)) })}
                onRemove={() => removeGuest(i)}
                canRemove={stay.guests.length > 1}
              />
            ))}
            <div aria-live="polite">
              {removed && (
                <p className="m-0 flex flex-wrap items-center gap-3 text-sm font-bold">
                  Removed {removed.guest.fullName.trim() || "a guest"}.
                  <button type="button" onClick={undoRemove} className="btn btn-outline min-h-11">
                    Undo
                  </button>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setStay({ guests: resizeGuests(stay.guests, stay.guests.length + 1) })}
              className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-line-strong bg-transparent text-[15px] font-bold text-ink hover:border-ink"
            >
              + {copy.guest.add}
            </button>
            {problemList}
            <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-5 py-3 backdrop-blur md:static md:mx-0 md:border-none md:bg-transparent md:p-0">
              <button type="button" onClick={() => go(1)} className="btn btn-outline min-h-12">
                ← Back
              </button>
              <button type="button" onClick={() => next(2)} className="btn btn-ink min-h-12 px-8">
                Next: review →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <dl className="m-0 grid gap-x-6 gap-y-2 rounded-[14px] bg-cloud p-4 text-sm sm:grid-cols-2">
              {[
                ["Property", property?.name ?? "—", "stay-property"],
                ["Booking reference", stay.reference || "—", "stay-reference"],
                ["Arrival", stay.arrival ? formatMedium(stay.arrival) : "—", "stay-arrival"],
                ["Departure", stay.departure ? formatMedium(stay.departure) : "—", "stay-departure"],
                ["Booked on", stay.platform ? platformLabels[stay.platform] : "—", ""],
                ["Under 16", String(stay.under16), ""],
              ].map(([k, v, id]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <dt className="text-muted">{k}</dt>
                  <dd className="m-0 flex items-center gap-2 font-bold text-ink">
                    {v}
                    {id && (
                      <button type="button" aria-label={`Edit ${k.toLowerCase()}`} onClick={() => (setDraft({ ...draft, step: 1 }), focusField(id))} className="flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-ink hover:bg-white">
                        ✎
                      </button>
                    )}
                  </dd>
                </div>
              ))}
              {stay.arrival && (
                <div className="flex items-center justify-between gap-2 sm:col-span-2">
                  <dt className="text-muted">Keep until</dt>
                  <dd className="m-0 font-bold text-ink">{formatMedium(keepUntil(stay, figures))}</dd>
                </div>
              )}
            </dl>

            <div className="overflow-x-auto rounded-[14px] border border-line" role="region" aria-label="Guests in this stay" tabIndex={0}>
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-cloud">
                    {["Guest", "Nationality", "Extra details", ""].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2.5 text-xs font-extrabold tracking-[0.5px] text-muted uppercase">
                        {h || <span className="sr-only-label">Edit</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stay.guests.map((g) => {
                    const extra = guestNeedsExtra(g, lists);
                    return (
                      <tr key={g.id} className="border-t border-line align-top">
                        <th scope="row" className="px-3 py-2.5 font-bold">
                          {g.fullName || <span className="text-brand">Name missing</span>}
                        </th>
                        <td className="px-3 py-2.5">{[countryName(g.nationality, lists), countryName(g.nationality2, lists)].filter(Boolean).join(" / ") || "—"}</td>
                        <td className="px-3 py-2.5 text-ink-copy">
                          {extra ? [g.idNumber, countryName(g.placeOfIssue, lists), [g.nextDestination, g.nextAddress].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || "—" : copy.guest.noExtra}
                        </td>
                        <td className="px-1 py-1 text-right">
                          <button type="button" aria-label={`Edit ${g.fullName || "guest"}`} onClick={() => (setDraft({ ...draft, step: 2 }), focusField(fieldId(g.id, "fullName")))} className="flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-ink hover:bg-cloud">
                            ✎
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {problemList}
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => save(false)} className="btn btn-coral min-h-12 px-7">
                  {copy.review.save}
                </button>
                {!draft.editingId && (
                  <button type="button" onClick={() => save(true)} className="btn btn-outline min-h-12">
                    {copy.review.saveAnother}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <button type="button" onClick={() => go(2)} className={cn(linkBtn, "text-ink")}>
                  ← Back
                </button>
                <button type="button" onClick={onPrint} className={cn(linkBtn, "text-ink")}>
                  {copy.review.print}
                </button>
                <button type="button" onClick={onCsv} className={cn(linkBtn, "text-ink")}>
                  {copy.review.csv}
                </button>
                {draft.editingId ? (
                  <button type="button" onClick={() => setConfirmDelete(true)} className={cn(linkBtn, "text-brand")}>
                    {copy.review.deleteStay}
                  </button>
                ) : (
                  <button type="button" onClick={() => setConfirmStart(true)} className={cn(linkBtn, "text-brand")}>
                    {copy.review.startOver}
                  </button>
                )}
              </div>
              {(confirmStart || confirmDelete) && (
                <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
                  <span className="flex-1">{confirmDelete ? copy.review.deleteConfirm : copy.review.startOverConfirm}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDelete) onDelete();
                      else onStartOver();
                      setConfirmStart(false);
                      setConfirmDelete(false);
                      setTried(new Set());
                    }}
                    className="btn btn-coral min-h-11"
                  >
                    {confirmDelete ? "Yes, delete" : "Yes, start over"}
                  </button>
                  <button type="button" onClick={() => (setConfirmStart(false), setConfirmDelete(false))} className="btn btn-outline min-h-11">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

