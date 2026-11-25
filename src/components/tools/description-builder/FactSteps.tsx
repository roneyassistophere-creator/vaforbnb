"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { copy, options, steps } from "@/content/tools/descriptionBuilder";
import { cn } from "@/lib/cn";
import { LIMITS, sizeBedrooms, vagueHits, type Content, type Facts, type Place } from "@/lib/tools/description-builder";
import { ChoiceChips } from "../ChoiceChips";
import { MultiChips } from "../MultiChips";
import { NumberField } from "../NumberField";
import { Toggle } from "../Toggle";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

/** Live vague-word check under a field: amber underline plus the suggestion (never colour alone). */
function Vague({ text, content, id }: { text: string; content: Content; id: string }) {
  const hits = vagueHits(text, content);
  if (!hits.length) return null;
  return (
    <ul id={id} className="m-0 grid list-none gap-1 p-0" role="status" data-vague>
      {hits.map((h) => (
        <li key={h.start} className="text-[13px] leading-[1.5] text-amber">
          <span aria-hidden="true">⚠ </span>
          {copy.vagueLabel} <span className="font-bold underline decoration-[#E0A800] decoration-wavy underline-offset-4">{h.text}</span>. {fill(copy.vagueInstead, { suggestion: h.suggestion })}
        </li>
      ))}
    </ul>
  );
}

function TextField({ id, label, hint, placeholder, value, onChange, max, content, vague, type = "text", required }: { id: string; label: string; hint?: string; placeholder?: string; value: string; onChange: (v: string) => void; max: number; content?: Content; vague?: boolean; type?: string; required?: boolean }) {
  const desc = [hint && `${id}-hint`, vague && content && vagueHits(value, content).length ? `${id}-vague` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[15px] font-bold text-ink">
          {label}
          {required && <span className="ml-1.5 text-[13px] font-semibold text-muted">({copy.required})</span>}
        </label>
        {type === "text" && max <= 120 && (
          <span className="text-[12px] font-bold text-muted tabular-nums" aria-hidden="true">
            {[...value].length} / {max}
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-[13px] text-muted">
          {hint}
        </p>
      )}
      <input id={id} type={type} className="field min-h-12" value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-describedby={desc} autoComplete="off" required={required} />
      {vague && content && <Vague text={value} content={content} id={`${id}-vague`} />}
    </div>
  );
}

function OptionalNumber({ label, hint, name, value, onChange, min = 1, max }: { label: string; hint?: string; name: string; value: number | null; onChange: (v: number | null) => void; min?: number; max: number }) {
  return (
    <NumberField
      label={label}
      hint={hint}
      name={name}
      value={value === null ? "" : String(value)}
      onChange={(v) => {
        const t = v.trim();
        if (t === "") onChange(null);
        else if (/^\d+$/.test(t)) onChange(Math.min(max, Math.max(min, Number(t))));
      }}
      min={min}
      max={max}
      placeholder="–"
    />
  );
}

/** A jump target for the guest-needs panel's "Add it" links. */
const Target = ({ id, children }: { id: string; children: ReactNode }) => (
  <div id={id} tabIndex={-1} className="scroll-mt-24 rounded-[12px] outline-none focus:ring-2 focus:ring-violet-100">
    {children}
  </div>
);

export function FactSteps({
  f,
  set,
  content,
  open,
  setOpen,
  done,
  onHouseRules,
  houseRulesMsg,
}: {
  f: Facts;
  set: (patch: Partial<Facts>) => void;
  content: Content;
  open: number;
  setOpen: (n: number) => void;
  done: boolean[];
  onHouseRules: () => void;
  houseRulesMsg: string;
}) {
  const T = content.templates;
  const IL = T.inputLimits;
  const studio = f.bedrooms === 0;
  const [sqft, setSqft] = useState("");
  const dragFrom = useRef<number | null>(null);
  const setIdx = <K extends "beds" | "ensuites">(k: K, i: number, v: Facts[K][number]) => set({ [k]: f[k].map((x, n) => (n === i ? v : x)) } as Partial<Facts>);
  const setPlace = (i: number, patch: Partial<Place>) => set({ places: f.places.map((p, n) => (n === i ? { ...p, ...patch } : p)) });
  const movePlace = (from: number, to: number) => {
    if (to < 0 || to >= f.places.length || from === to) return;
    const xs = [...f.places];
    const [p] = xs.splice(from, 1);
    xs.splice(to, 0, p);
    set({ places: xs });
  };

  const bodies: ReactNode[] = [
    /* Step 1: Basics */
    <div key="basics" className="grid gap-5">
      <ChoiceChips legend={copy.basics.type} value={f.propertyType} options={options.types} onChange={(v) => set({ propertyType: v })} name="db-type" />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label={copy.basics.bedrooms.label} hint={copy.basics.bedrooms.hint} name="db-bedrooms" value={String(f.bedrooms)} onChange={(v) => /^\d+$/.test(v.trim()) && set(sizeBedrooms(f, Math.min(LIMITS.bedrooms, Number(v))))} min={0} max={LIMITS.bedrooms} placeholder="0" />
        <OptionalNumber label={copy.basics.guests.label} name="db-guests" value={f.maxGuests} onChange={(v) => set({ maxGuests: v })} max={LIMITS.guests} />
      </div>
      <div className="grid gap-3">
        <OptionalNumber label={copy.basics.size.label} hint={copy.basics.size.hint} name="db-size" value={f.sizeM2} onChange={(v) => set({ sizeM2: v })} max={LIMITS.size} />
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <label htmlFor="db-sqft" className="text-sm font-bold text-ink">
              {copy.basics.sqft.label}
            </label>
            <input id="db-sqft" type="text" inputMode="numeric" className="field min-h-11 w-[140px]" value={sqft} onChange={(e) => setSqft(e.target.value.replace(/[^\d]/g, "").slice(0, 5))} autoComplete="off" />
          </div>
          <button type="button" className="btn btn-outline min-h-11" disabled={!sqft} onClick={() => (set({ sizeM2: Math.max(1, Math.round(Number(sqft) * 0.092903)) }), setSqft(""))}>
            {copy.basics.sqft.convert}
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="db-area" label={copy.basics.area.label} placeholder={copy.basics.area.placeholder} value={f.area} onChange={(v) => set({ area: v })} max={60} />
        <TextField id="db-town" label={copy.basics.town.label} hint={copy.basics.town.hint} placeholder={copy.basics.town.placeholder} value={f.town} onChange={(v) => set({ town: v })} max={60} />
      </div>
      <Target id="db-floor">
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips legend={copy.basics.floor} value={f.floor} options={options.floors} onChange={(v) => set({ floor: v })} name="db-floor-r" />
          <ChoiceChips legend={copy.basics.lift} value={f.lift === null ? "" : f.lift ? "yes" : "no"} options={options.lift} onChange={(v) => set({ lift: v === "" ? null : v === "yes" })} name="db-lift" />
        </div>
      </Target>
    </div>,

    /* Step 2: Standout and who it's for */
    <div key="standout" className="grid gap-5">
      <TextField id="db-standout" label={copy.standout.label} hint={fill(copy.standout.hint, { max: IL.standout })} placeholder={copy.standout.placeholder} value={f.standout} onChange={(v) => set({ standout: v })} max={IL.standout} content={content} vague required />
      <MultiChips legend={copy.standout.guests} value={f.guestTypes} options={content.scorer.model.guestTypes.map((g) => ({ value: g.id, label: g.label }))} onChange={(v) => set({ guestTypes: v.slice(0, 3) })} max={3} fullNote={copy.standout.guestsFull} />
    </div>,

    /* Step 3: Rooms and comfort */
    <div key="rooms" className="grid gap-5">
      <Target id="db-beds">
        <div className="grid gap-3">
          {(studio ? [0] : Array.from({ length: f.bedrooms }, (_, i) => i)).map((i) => (
            <div key={i} className="grid gap-2 rounded-[14px] bg-cloud-2 p-3.5">
              <ChoiceChips legend={studio ? copy.rooms.studioBed : fill(copy.rooms.bed, { n: i + 1 })} value={f.beds[i] ?? ""} options={options.beds} onChange={(v) => setIdx("beds", i, v)} name={`db-bed-${i}`} />
              {!studio && <Toggle label={fill(copy.rooms.ensuite, { n: i + 1 })} checked={!!f.ensuites[i]} onChange={(v) => setIdx("ensuites", i, v)} />}
            </div>
          ))}
        </div>
      </Target>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label={copy.rooms.bathrooms} name="db-bathrooms" value={String(f.bathrooms)} onChange={(v) => /^\d+$/.test(v.trim()) && set({ bathrooms: Math.min(LIMITS.bathrooms, Number(v)) })} min={0} max={LIMITS.bathrooms} placeholder="0" />
        <MultiChips legend={copy.rooms.bathTypes} value={f.bathTypes} options={options.bathTypes} onChange={(v) => set({ bathTypes: v })} />
      </div>
      <Target id="db-workspace">
        <div className="grid gap-3">
          <ChoiceChips legend={copy.rooms.workspace} value={f.workspace} options={options.workspace} onChange={(v) => set({ workspace: v as Facts["workspace"] })} name="db-ws" />
          {f.workspace !== "none" && <TextField id="db-ws-loc" label={copy.rooms.workspaceLocation.label} placeholder={copy.rooms.workspaceLocation.placeholder} value={f.workspaceLocation} onChange={(v) => set({ workspaceLocation: v })} max={60} />}
        </div>
      </Target>
      <Target id="db-wifi">
        <div className="max-w-[300px]">
          <OptionalNumber label={copy.rooms.wifi.label} hint={copy.rooms.wifi.hint} name="db-wifi-n" value={f.wifiMbps} onChange={(v) => set({ wifiMbps: v })} max={LIMITS.mbps} />
        </div>
      </Target>
      <Target id="db-kitchen">
        <MultiChips legend={copy.rooms.kitchen} value={f.kitchen} options={options.kitchen} onChange={(v) => set({ kitchen: v })} />
      </Target>
      <Target id="db-laundry">
        <MultiChips legend={copy.rooms.laundry} value={f.laundry} options={options.laundry} onChange={(v) => set({ laundry: v })} />
      </Target>
      <MultiChips legend={copy.rooms.heating} value={f.heating} options={options.heating} onChange={(v) => set({ heating: v })} />
      <Target id="db-outdoor">
        <div className="grid gap-3">
          <ChoiceChips legend={copy.rooms.outdoor} value={f.outdoor} options={options.outdoor} onChange={(v) => set({ outdoor: v })} name="db-out" />
          {f.outdoor && (
            <div className="max-w-[260px]">
              <OptionalNumber label={copy.rooms.seating.label} name="db-seating" value={f.outdoorSeating} onChange={(v) => set({ outdoorSeating: v })} max={LIMITS.seating} />
            </div>
          )}
        </div>
      </Target>
      <Target id="db-family">
        <MultiChips legend={copy.rooms.family} value={f.family} options={options.family} onChange={(v) => set({ family: v })} />
      </Target>
      <Target id="db-pets">
        <div className="grid gap-3">
          <Toggle label={copy.rooms.dogs} checked={f.dogs} onChange={(v) => set({ dogs: v })} />
          {f.dogs && (
            <div className="max-w-[260px]">
              <OptionalNumber label={copy.rooms.maxDogs.label} name="db-dogs" value={f.maxDogs} onChange={(v) => set({ maxDogs: v })} max={LIMITS.dogs} />
            </div>
          )}
        </div>
      </Target>
      <Target id="db-quiet">
        <MultiChips legend={copy.rooms.quiet} value={f.quiet} options={options.quiet} onChange={(v) => set({ quiet: v })} />
      </Target>
    </div>,

    /* Step 4: Arrival and parking */
    <div key="arrival" className="grid gap-5">
      <Target id="db-checkin">
        <ChoiceChips legend={copy.arrival.checkIn} value={f.checkIn} options={options.checkIn} onChange={(v) => set({ checkIn: v })} name="db-ci" />
      </Target>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="db-in" type="time" label={copy.arrival.checkInTime} value={f.checkInTime} onChange={(v) => set({ checkInTime: v })} max={5} />
        <TextField id="db-out-t" type="time" label={copy.arrival.checkOutTime} value={f.checkOutTime} onChange={(v) => set({ checkOutTime: v })} max={5} />
      </div>
      <Target id="db-parking">
        <div className="grid gap-3">
          <ChoiceChips legend={copy.arrival.parking} value={f.parking} options={options.parking} onChange={(v) => set({ parking: v })} name="db-park" />
          {["drivewayFree", "streetFree", "permit"].includes(f.parking) && (
            <div className="max-w-[260px]">
              <OptionalNumber label={copy.arrival.spaces.label} name="db-spaces" value={f.parkingSpaces} onChange={(v) => set({ parkingSpaces: v })} max={LIMITS.spaces} />
            </div>
          )}
          {f.parking && <TextField id="db-park-note" label={copy.arrival.note.label} placeholder={copy.arrival.note.placeholder} value={f.parkingNote} onChange={(v) => set({ parkingNote: v })} max={IL.parkingNote} content={content} vague />}
        </div>
      </Target>
      <ChoiceChips legend={copy.arrival.privacy} value={f.privacy} options={options.privacy} onChange={(v) => set({ privacy: v as Facts["privacy"] })} name="db-privacy" />
      {f.privacy === "privateRoom" && <MultiChips legend={copy.arrival.shared} value={f.sharedAreas} options={options.shared} onChange={(v) => set({ sharedAreas: v })} />}
      <Target id="db-longstays">
        <Toggle label={copy.arrival.longStays} checked={f.longStays} onChange={(v) => set({ longStays: v })} />
      </Target>
    </div>,

    /* Step 5: Places nearby */
    <div key="places" className="grid gap-4">
      <Target id="db-places">
        <p className="m-0 text-[13px] leading-[1.5] text-muted">{copy.places.hint}</p>
      </Target>
      <ol className="m-0 grid list-none gap-3 p-0">
        {f.places.map((p, i) => (
          <li
            key={i}
            className="grid gap-3 rounded-[14px] bg-cloud-2 p-3.5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom.current !== null) movePlace(dragFrom.current, i);
              dragFrom.current = null;
            }}
            data-place={i + 1}
          >
            <div className="flex items-center gap-2">
              <span draggable onDragStart={() => (dragFrom.current = i)} className="flex size-11 flex-none cursor-grab items-center justify-center rounded-[12px] bg-white text-muted" aria-hidden="true" title="Drag to reorder">
                ⋮⋮
              </span>
              <p className="m-0 flex-1 text-sm font-extrabold text-ink">
                {fill(copy.places.name.label, { n: i + 1 })}
                {i === 0 && <span className="ml-2 rounded-md bg-violet-50 px-2 py-[2px] text-[11px] font-extrabold text-violet uppercase">{copy.places.hook}</span>}
              </p>
              <button type="button" onClick={() => movePlace(i, i - 1)} disabled={i === 0} className="flex size-11 cursor-pointer items-center justify-center rounded-[12px] border border-line bg-white disabled:opacity-40" aria-label={fill(copy.places.up, { n: i + 1 })}>
                ↑
              </button>
              <button type="button" onClick={() => movePlace(i, i + 1)} disabled={i === f.places.length - 1} className="flex size-11 cursor-pointer items-center justify-center rounded-[12px] border border-line bg-white disabled:opacity-40" aria-label={fill(copy.places.down, { n: i + 1 })}>
                ↓
              </button>
            </div>
            <TextField id={`db-place-${i}`} label={fill(copy.places.name.label, { n: i + 1 })} placeholder={copy.places.name.placeholder} value={p.name} onChange={(v) => setPlace(i, { name: v })} max={60} required={i === 0} />
            <div className="grid gap-3 sm:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="grid gap-1.5">
                <label htmlFor={`db-place-min-${i}`} className="text-[15px] font-bold text-ink">
                  {copy.places.minutes}
                </label>
                <input
                  id={`db-place-min-${i}`}
                  type="text"
                  inputMode="numeric"
                  className="field min-h-12"
                  value={p.minutes === null ? "" : String(p.minutes)}
                  onChange={(e) => {
                    const t = e.target.value.trim();
                    if (t === "") setPlace(i, { minutes: null });
                    else if (/^\d+$/.test(t)) setPlace(i, { minutes: Math.min(T.inputLimits.minutes, Math.max(1, Number(t))) });
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`db-place-mode-${i}`} className="text-[15px] font-bold text-ink">
                  {copy.places.mode}
                </label>
                <select id={`db-place-mode-${i}`} className="field min-h-12" value={p.mode} onChange={(e) => setPlace(i, { mode: e.target.value })}>
                  {options.modes.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`db-place-type-${i}`} className="text-[15px] font-bold text-ink">
                  {copy.places.type}
                </label>
                <select id={`db-place-type-${i}`} className="field min-h-12" value={p.type} onChange={(e) => setPlace(i, { type: e.target.value })}>
                  {options.placeTypes.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {p.name.trim() && !p.minutes && <p className="m-0 text-[13px] font-bold text-amber">{copy.places.needMinutes}</p>}
            <button type="button" onClick={() => set({ places: f.places.filter((_, n) => n !== i) })} className="min-h-11 cursor-pointer justify-self-start border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2" aria-label={`${copy.places.remove} place ${i + 1}`}>
              {copy.places.remove}
            </button>
          </li>
        ))}
      </ol>
      {f.places.length < T.inputLimits.places && (
        <button type="button" onClick={() => set({ places: [...f.places, { name: "", minutes: null, mode: "walk", type: "station" }] })} className="btn btn-outline min-h-11 justify-self-start">
          + {copy.places.add}
        </button>
      )}
    </div>,

    /* Step 6: Honest notes and tone */
    <div key="honest" className="grid gap-5">
      <MultiChips legend={copy.honest.notes} hint={copy.honest.notesHint} value={f.honest} options={T.honest.map((h) => ({ value: h.id, label: h.label }))} onChange={(v) => set({ honest: v })} />
      <TextField id="db-honest-custom" label={copy.honest.custom.label} placeholder={copy.honest.custom.placeholder} value={f.honestCustom} onChange={(v) => set({ honestCustom: v })} max={IL.honestCustom} content={content} vague />
      <ChoiceChips legend={copy.honest.tone} hint={copy.honest.toneHint} value={f.tone} options={options.tone} onChange={(v) => set({ tone: v as Facts["tone"] })} name="db-tone" />
      <ChoiceChips legend={copy.honest.hook} value={f.hook} options={options.hook} onChange={(v) => set({ hook: v as Facts["hook"] })} name="db-hook" />
      <TextField id="db-signoff" label={copy.honest.signOff.label} placeholder={copy.honest.signOff.placeholder} value={f.signOff} onChange={(v) => set({ signOff: v })} max={IL.signOff} content={content} vague />
      <div className="grid gap-2 rounded-[14px] border border-line p-4">
        <p className="m-0 text-[15px] font-bold text-ink">{copy.honest.houseRules}</p>
        <p className="m-0 text-[13px] text-muted">{copy.honest.houseRulesHint}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline min-h-11" onClick={onHouseRules} data-import-house-rules>
            {copy.honest.houseRules}
          </button>
          {f.houseRules && (
            <button type="button" className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2" onClick={() => set({ houseRules: null })}>
              {copy.honest.houseRulesRemove}
            </button>
          )}
        </div>
        {houseRulesMsg && (
          <p className="m-0 text-sm font-semibold text-ink-copy" role="status">
            {houseRulesMsg}{" "}
            {houseRulesMsg === copy.honest.houseRulesNone && (
              <Link href="/free-tools/house-rules-generator" className="font-bold text-brand">
                House rules generator →
              </Link>
            )}
          </p>
        )}
      </div>
    </div>,
  ];

  return (
    <ol className="m-0 grid list-none gap-3 p-0">
      {steps.map((title, n) => {
        const isOpen = open === n;
        return (
          <li key={title} className={cn("rounded-[18px] border bg-white", isOpen ? "border-ink" : "border-line")}>
            <h3 className="m-0">
              <button
                type="button"
                id={`db-step-btn-${n}`}
                aria-expanded={isOpen}
                aria-controls={`db-step-${n}`}
                onClick={() => setOpen(isOpen ? -1 : n)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-[18px] border-none bg-transparent px-4 py-3 text-left text-ink md:px-5"
              >
                <span aria-hidden="true" className={cn("flex size-8 flex-none items-center justify-center rounded-full text-sm font-extrabold", done[n] && !isOpen ? "bg-green text-white" : isOpen ? "bg-ink text-white" : "bg-fog text-ink")}>
                  {done[n] && !isOpen ? "✓" : n + 1}
                </span>
                <span className="flex-1 text-[16px] font-extrabold">
                  <span className="sr-only-label">Step {n + 1}: </span>
                  {title}
                  {done[n] && <span className="sr-only-label"> (complete)</span>}
                </span>
                <span aria-hidden="true" className={cn("text-lg transition-transform", isOpen && "rotate-180")}>
                  ⌄
                </span>
              </button>
            </h3>
            <div id={`db-step-${n}`} role="region" aria-labelledby={`db-step-btn-${n}`} hidden={!isOpen} className="px-4 pb-5 md:px-5">
              {bodies[n]}
              {n < steps.length - 1 && (
                <button type="button" onClick={() => setOpen(n + 1)} className="btn btn-outline mt-5 min-h-11">
                  {fill(copy.next, { step: steps[n + 1] })}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
