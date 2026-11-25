"use client";

import type { ReactNode } from "react";
import { copy, options, steps } from "@/content/tools/photoShotList";
import { cn } from "@/lib/cn";
import { LIMITS, sizeBedrooms, standoutOptions, type Content, type Place, type Setup } from "@/lib/tools/photo-shot-list";
import { ChoiceChips } from "../ChoiceChips";
import { MultiChips } from "../MultiChips";
import { NumberField } from "../NumberField";
import { Toggle } from "../Toggle";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

function TextField({ id, label, hint, value, onChange, max = LIMITS.text, inputMode }: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; max?: number; inputMode?: "numeric" }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-[13px] text-muted">
          {hint}
        </p>
      )}
      <input id={id} type="text" inputMode={inputMode} className="field min-h-12" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} autoComplete="off" />
    </div>
  );
}

/** A number field that accepts typing freely and stores null when empty. */
function OptionalNumber({ label, hint, name, value, onChange, max }: { label: string; hint?: string; name: string; value: number | null; onChange: (v: number | null) => void; max: number }) {
  return (
    <NumberField
      label={label}
      hint={hint}
      name={name}
      value={value === null ? "" : String(value)}
      onChange={(v) => {
        const t = v.trim();
        if (t === "") onChange(null);
        else if (/^\d+$/.test(t)) onChange(Math.min(max, Math.max(1, Number(t))));
      }}
      min={1}
      max={max}
      placeholder="–"
    />
  );
}

const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="m-0 grid min-w-0 gap-3 border-none p-0">
    <legend className="mb-1 p-0 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">{title}</legend>
    {children}
  </fieldset>
);

export function SetupSteps({
  s,
  set,
  content,
  open,
  setOpen,
  visited,
}: {
  s: Setup;
  set: (patch: Partial<Setup>) => void;
  content: Content;
  open: number;
  setOpen: (n: number) => void;
  visited: Set<number>;
}) {
  const R = content.rules;
  const studio = s.bedrooms === 0;
  const stand = standoutOptions(s, R);
  const setIdx = <K extends "beds" | "ensuites" | "blackout">(k: K, i: number, v: Setup[K][number]) => set({ [k]: s[k].map((x, n) => (n === i ? v : x)) } as Partial<Setup>);
  const setPlace = (i: number, patch: Partial<Place>) => set({ places: s.places.map((p, n) => (n === i ? { ...p, ...patch } : p)) });

  const bodies: ReactNode[] = [
    /* Step 1: Rooms */
    <div key="rooms" className="grid gap-6">
      <Group title="Bedrooms and bathrooms">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label={copy.rooms.bedrooms.label}
            hint={copy.rooms.bedrooms.hint}
            name="ps-bedrooms"
            value={String(s.bedrooms)}
            onChange={(v) => /^\d+$/.test(v.trim()) && set(sizeBedrooms(s, Math.min(LIMITS.bedrooms, Number(v))))}
            min={0}
            max={LIMITS.bedrooms}
            placeholder="0"
          />
          <NumberField
            label={copy.rooms.bathrooms.label}
            hint={copy.rooms.bathrooms.hint}
            name="ps-bathrooms"
            value={String(s.bathrooms)}
            onChange={(v) => /^\d+$/.test(v.trim()) && set({ bathrooms: Math.min(LIMITS.bathrooms, Number(v)) })}
            min={0}
            max={LIMITS.bathrooms}
            placeholder="0"
          />
        </div>
        {(studio ? [0] : Array.from({ length: s.bedrooms }, (_, i) => i)).map((i) => (
          <div key={i} className="grid gap-2 rounded-[14px] bg-cloud-2 p-3.5" data-bedroom={i + 1}>
            <ChoiceChips legend={studio ? copy.rooms.studioBed : fill(copy.rooms.bed, { n: i + 1 })} value={s.beds[i] ?? ""} options={options.beds} onChange={(v) => setIdx("beds", i, v)} name={`ps-bed-${i}`} />
            {!studio && <Toggle label={fill(copy.rooms.ensuite, { n: i + 1 })} checked={!!s.ensuites[i]} onChange={(v) => setIdx("ensuites", i, v)} />}
          </div>
        ))}
      </Group>

      <Group title={copy.rooms.spaces}>
        <div className="grid gap-1 sm:grid-cols-2">
          <Toggle label={copy.rooms.living} checked={s.living} onChange={(v) => set({ living: v })} />
          <Toggle label={copy.rooms.kitchenDiner} hint={copy.rooms.kitchenDinerHint} checked={s.kitchenDiner} onChange={(v) => set({ kitchenDiner: v })} />
          {!s.kitchenDiner && <Toggle label={copy.rooms.kitchen} checked={s.kitchen} onChange={(v) => set({ kitchen: v })} />}
          {!s.kitchenDiner && <Toggle label={copy.rooms.dining} checked={s.dining} onChange={(v) => set({ dining: v })} />}
        </div>
        <ChoiceChips legend={copy.rooms.workspace} value={s.workspace} options={options.workspace} onChange={(v) => set({ workspace: v as Setup["workspace"] })} name="ps-workspace" />
        {s.workspace !== "none" && <TextField id="ps-ws-loc" label={copy.rooms.workspaceLocation.label} hint={copy.rooms.workspaceLocation.hint} value={s.workspaceLocation} onChange={(v) => set({ workspaceLocation: v })} />}
        <MultiChips legend={copy.rooms.laundry} value={s.laundry} options={options.laundry} onChange={(v) => set({ laundry: v })} />
      </Group>

      <Group title="Outside, views and extras">
        <MultiChips legend={copy.rooms.outdoor} value={s.outdoor} options={options.outdoor} onChange={(v) => set({ outdoor: v })} />
        <ChoiceChips legend={copy.rooms.view} value={s.view} options={options.views} onChange={(v) => set({ view: v })} name="ps-view" />
        {s.view && <TextField id="ps-view-from" label={copy.rooms.viewFrom.label} hint={copy.rooms.viewFrom.hint} value={s.viewFrom} onChange={(v) => set({ viewFrom: v })} />}
        <MultiChips legend={copy.rooms.extras} value={s.extras} options={options.extras} onChange={(v) => set({ extras: v })} />
      </Group>

      <Group title={copy.rooms.arrival}>
        <p className="m-0 -mt-1 text-[13px] text-muted">{copy.rooms.entranceNote}</p>
        <ChoiceChips legend={copy.rooms.checkIn} value={s.checkIn} options={options.checkIn} onChange={(v) => set({ checkIn: v })} name="ps-checkin" />
        <ChoiceChips legend={copy.rooms.parking} value={s.parking} options={options.parking} onChange={(v) => set({ parking: v })} name="ps-parking" />
        <MultiChips legend={copy.rooms.access} value={s.access} options={options.access} onChange={(v) => set({ access: v })} />
        <div className="grid gap-1 sm:grid-cols-2">
          <Toggle label={copy.rooms.stairs} checked={s.stairs} onChange={(v) => set({ stairs: v })} />
          <Toggle label={copy.rooms.lift} checked={s.lift} onChange={(v) => set({ lift: v })} />
        </div>
        <ChoiceChips legend={copy.rooms.floor} value={s.floor} options={options.floor} onChange={(v) => set({ floor: v })} name="ps-floor" />
      </Group>
    </div>,

    /* Step 2: What sells it */
    <div key="sells" className="grid gap-5">
      {stand.length ? (
        <>
          <ChoiceChips
            legend={copy.sells.standout}
            hint={copy.sells.standoutHint}
            value={stand.some((o) => o.key === s.standout) ? s.standout : ""}
            options={stand.map((o) => ({ value: o.key, label: o.label }))}
            onChange={(v) => set({ standout: v, second: s.second === v ? "" : s.second })}
            name="ps-standout"
          />
          <ChoiceChips
            legend={copy.sells.second}
            value={stand.some((o) => o.key === s.second) && s.second !== s.standout ? s.second : ""}
            options={[{ value: "", label: copy.sells.secondNone }, ...stand.filter((o) => o.key !== s.standout).map((o) => ({ value: o.key, label: o.label }))]}
            onChange={(v) => set({ second: v })}
            name="ps-second"
          />
        </>
      ) : (
        <p className="m-0 rounded-[12px] bg-cloud-2 px-4 py-3 text-sm text-muted">{copy.sells.standoutEmpty}</p>
      )}
      <MultiChips
        legend={fill(copy.sells.guests, { max: R.maxGuestTypes })}
        value={s.guestTypes}
        options={R.guestTypes.map((g) => ({ value: g.id, label: g.label }))}
        onChange={(v) => set({ guestTypes: v.slice(0, R.maxGuestTypes) })}
        max={R.maxGuestTypes}
        fullNote={fill(copy.sells.guestsFull, { max: R.maxGuestTypes })}
      />
    </div>,

    /* Step 3: Details for captions */
    <div key="details" className="grid gap-5">
      <p className="m-0 text-[15px] text-ink-copy">{copy.details.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <OptionalNumber label={copy.details.mbps.label} hint={copy.details.mbps.hint} name="ps-mbps" value={s.wifiMbps} onChange={(v) => set({ wifiMbps: v })} max={LIMITS.mbps} />
        <OptionalNumber label={copy.details.size.label} hint={copy.details.size.hint} name="ps-size" value={s.sizeM2} onChange={(v) => set({ sizeM2: v })} max={LIMITS.size} />
        <TextField id="ps-checkin-time" label={copy.details.checkInTime.label} hint={copy.details.checkInTime.hint} value={s.checkInTime} onChange={(v) => set({ checkInTime: v })} max={20} />
        <OptionalNumber label={copy.details.parkingSpaces.label} name="ps-spaces" value={s.parkingSpaces} onChange={(v) => set({ parkingSpaces: v })} max={LIMITS.spaces} />
      </div>
      <MultiChips legend={copy.details.kitchenItems} value={s.kitchenItems} options={R.words.kitchenItems.map((k) => ({ value: k, label: k }))} onChange={(v) => set({ kitchenItems: v })} />
      {!studio && s.bedrooms > 0 && (
        <MultiChips
          legend={copy.details.blackout}
          value={s.blackout.map((b, i) => (b ? String(i) : "")).filter(Boolean)}
          options={Array.from({ length: s.bedrooms }, (_, i) => ({ value: String(i), label: `Bedroom ${i + 1}` }))}
          onChange={(v) => set({ blackout: s.blackout.map((_, i) => v.includes(String(i))) })}
        />
      )}
      <fieldset className="m-0 grid min-w-0 gap-3 border-none p-0">
        <legend className="mb-1 p-0 text-[15px] font-bold text-ink">{copy.details.places}</legend>
        <p className="m-0 -mt-1 text-[13px] text-muted">{copy.details.placesHint}</p>
        {s.places.map((p, i) => (
          <div key={i} className="grid gap-3 rounded-[14px] bg-cloud-2 p-3.5 sm:grid-cols-[minmax(0,1.4fr)_120px_minmax(0,1fr)] sm:items-end" data-place={i + 1}>
            <TextField id={`ps-place-${i}`} label={fill(copy.details.placeName, { n: i + 1 })} value={p.name} onChange={(v) => setPlace(i, { name: v })} />
            <TextField
              id={`ps-place-min-${i}`}
              label={copy.details.placeMinutes}
              value={p.minutes === null ? "" : String(p.minutes)}
              inputMode="numeric"
              onChange={(v) => (v.trim() === "" ? setPlace(i, { minutes: null }) : /^\d+$/.test(v.trim()) && setPlace(i, { minutes: Math.min(LIMITS.minutes, Number(v)) }))}
              max={3}
            />
            <div className="grid gap-1.5">
              <label htmlFor={`ps-place-mode-${i}`} className="text-[15px] font-bold text-ink">
                {copy.details.placeMode}
              </label>
              <select id={`ps-place-mode-${i}`} className="field min-h-12" value={p.mode} onChange={(e) => setPlace(i, { mode: e.target.value })}>
                {options.modes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => set({ places: s.places.filter((_, n) => n !== i) })} className="min-h-11 cursor-pointer justify-self-start border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2 sm:col-span-3">
              {fill(copy.details.removePlace, { n: i + 1 })}
            </button>
          </div>
        ))}
        {s.places.length < LIMITS.places && (
          <button type="button" onClick={() => set({ places: [...s.places, { name: "", minutes: null, mode: "walk" }] })} className="btn btn-outline min-h-11 justify-self-start">
            + {copy.details.addPlace}
          </button>
        )}
      </fieldset>
      <MultiChips legend={copy.details.honest} hint={copy.details.honestHint} value={s.honest} options={R.honestNotes.map((h) => ({ value: h.id, label: h.label }))} onChange={(v) => set({ honest: v })} />
    </div>,

    /* Step 4: Shoot day */
    <div key="shoot" className="grid gap-5">
      <ChoiceChips legend={copy.shoot.season} value={s.season} options={options.seasons} onChange={(v) => set({ season: v })} name="ps-season" />
      <ChoiceChips legend={copy.shoot.windows} hint={copy.shoot.windowsHint} value={s.windows} options={options.windows} onChange={(v) => set({ windows: v })} name="ps-windows" />
      <ChoiceChips legend={copy.shoot.shooter} value={s.shooter} options={options.shooter} onChange={(v) => set({ shooter: v })} name="ps-shooter" />
    </div>,
  ];

  return (
    <ol className="m-0 grid list-none gap-3 p-0">
      {steps.map((title, n) => {
        const isOpen = open === n;
        const done = visited.has(n) && !isOpen;
        return (
          <li key={title} className={cn("rounded-[18px] border bg-white", isOpen ? "border-ink" : "border-line")}>
            <h3 className="m-0">
              <button
                type="button"
                id={`ps-step-btn-${n}`}
                aria-expanded={isOpen}
                aria-controls={`ps-step-${n}`}
                onClick={() => setOpen(isOpen ? -1 : n)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-[18px] border-none bg-transparent px-4 py-3 text-left text-ink md:px-5"
              >
                <span aria-hidden="true" className={cn("flex size-8 flex-none items-center justify-center rounded-full text-sm font-extrabold", done ? "bg-green text-white" : isOpen ? "bg-ink text-white" : "bg-fog text-ink")}>
                  {done ? "✓" : n + 1}
                </span>
                <span className="flex-1 text-[16px] font-extrabold">
                  <span className="sr-only-label">Step {n + 1}: </span>
                  {title}
                  {done && <span className="sr-only-label"> (done)</span>}
                </span>
                <span aria-hidden="true" className={cn("text-lg transition-transform", isOpen && "rotate-180")}>
                  ⌄
                </span>
              </button>
            </h3>
            <div id={`ps-step-${n}`} role="region" aria-labelledby={`ps-step-btn-${n}`} hidden={!isOpen} className="px-4 pb-5 md:px-5">
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
