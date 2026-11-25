"use client";

import type { ReactNode } from "react";
import { copy, propertyTypes, questions, steps } from "@/content/tools/aiReadiness";
import { cn } from "@/lib/cn";
import { LIMITS, sectionIds, type Content, type Inputs, type SectionId } from "@/lib/tools/ai-readiness";
import { ChoiceChips } from "../ChoiceChips";
import { MultiChips } from "../MultiChips";
import { NumberField } from "../NumberField";
import { Toggle } from "../Toggle";

const len = (s: string) => [...s].length;

/** Label, live counter against a stored limit, and the over-limit note. */
function Counted({ id, label, tag, value, limit, children, note }: { id: string; label: string; tag?: string; value: string; limit?: number; children: ReactNode; note?: string }) {
  const n = len(value);
  const over = limit !== undefined && n > limit;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[15px] font-bold text-ink">
          {label}
          {tag && <span className="ml-1.5 text-[13px] font-semibold text-muted">({tag})</span>}
        </label>
        {limit !== undefined && (
          <span id={`${id}-count`} className={cn("rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums", over ? "bg-[#FFF2CC] text-[#6B4A00]" : "text-muted")} data-counter={id}>
            {copy.counter.replace("{n}", String(n)).replace("{limit}", String(limit))}
            {over && <span className="sr-only-label"> (over the limit)</span>}
          </span>
        )}
      </div>
      {children}
      {over && note && (
        <p className="m-0 rounded-[10px] bg-[#FFF2CC] px-3 py-2 text-[13px] font-bold text-[#6B4A00]" role="status">
          ⚠ {note}
        </p>
      )}
    </div>
  );
}

function TextInput({ id, label, hint, value, onChange, max }: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; max: number }) {
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
      <input id={id} type="text" className="field min-h-12" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} autoComplete="off" />
    </div>
  );
}

export function InputSteps({
  i,
  set,
  content,
  open,
  setOpen,
  visited,
  mbpsFound,
}: {
  i: Inputs;
  set: (patch: Partial<Inputs>) => void;
  content: Content;
  open: number;
  setOpen: (n: number) => void;
  visited: Set<number>;
  mbpsFound: boolean;
}) {
  const { model, limits } = content;
  const setSection = (id: SectionId, v: string) => set({ sections: { ...i.sections, [id]: v.slice(0, LIMITS.section) } });
  const sectionLimit = (id: SectionId) => limits.sections.find((s) => s.id === id);

  const bodies: ReactNode[] = [
    /* Step 1: Your listing text */
    <div key="text" className="grid gap-4">
      <Counted id="air-title" label={copy.title.label} value={i.title} limit={limits.title} note={copy.title.over.replace("{limit}", String(limits.title))}>
        <input
          id="air-title"
          type="text"
          className="field min-h-12"
          value={i.title}
          maxLength={LIMITS.title}
          onChange={(e) => set({ title: e.target.value })}
          aria-describedby="air-title-count"
          autoComplete="off"
          placeholder="Quiet 2-bed flat, 8 min walk to the station"
        />
      </Counted>
      <Toggle label={copy.oneBox.label} hint={copy.oneBox.hint} checked={i.oneBox} onChange={(v) => set({ oneBox: v, all: v && !i.all ? sectionIds.map((id) => i.sections[id].trim()).filter(Boolean).join("\n\n") : i.all })} />
      {i.oneBox ? (
        <Counted id="air-all" label={copy.allLabel} value={i.all}>
          <textarea id="air-all" rows={10} className="field min-h-[220px] p-3 leading-[1.55]" value={i.all} maxLength={LIMITS.all} onChange={(e) => set({ all: e.target.value })} />
        </Counted>
      ) : (
        sectionIds.map((id) => {
          const s = sectionLimit(id);
          if (!s) return null;
          return (
            <Counted key={id} id={`air-${id}`} label={s.label} tag={s.required ? copy.required : copy.optional} value={i.sections[id]} limit={s.limit} note={`Airbnb allows ${s.limit} characters here.`}>
              <textarea
                id={`air-${id}`}
                rows={id === "description" ? 7 : 4}
                className={cn("field p-3 leading-[1.55]", id === "description" ? "min-h-[170px]" : "min-h-[110px]")}
                value={i.sections[id]}
                onChange={(e) => setSection(id, e.target.value)}
                aria-describedby={`air-${id}-count`}
              />
            </Counted>
          );
        })
      )}
      <details className="rounded-[12px] bg-cloud px-4 py-3 text-sm">
        <summary className="min-h-6 cursor-pointer font-bold text-ink">{copy.helperLink}</summary>
        <p className="m-0 mt-2 leading-[1.6] text-ink-copy">{limits.helper}</p>
      </details>
    </div>,

    /* Step 2: About the place */
    <div key="place" className="grid gap-4">
      <TextInput id="air-town" label={copy.place.town.label} hint={copy.place.town.hint} value={i.town} onChange={(v) => set({ town: v })} max={LIMITS.place} />
      <TextInput id="air-station" label={copy.place.station.label} hint={copy.place.station.hint} value={i.station} onChange={(v) => set({ station: v })} max={LIMITS.place} />
      <TextInput id="air-landmark" label={copy.place.landmark.label} hint={copy.place.landmark.hint} value={i.landmark} onChange={(v) => set({ landmark: v })} max={LIMITS.place} />
      <ChoiceChips legend={copy.place.type} value={i.propertyType} options={propertyTypes} onChange={(v) => set({ propertyType: v })} name="air-type" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          name="air-bedrooms"
          label={copy.place.bedrooms}
          value={String(i.bedrooms)}
          onChange={(v) => /^\d+$/.test(v) && set({ bedrooms: Math.min(LIMITS.bedrooms, Number(v)) })}
          min={0}
          max={LIMITS.bedrooms}
          placeholder="0"
        />
        <NumberField
          name="air-guests"
          label={copy.place.guests}
          value={String(i.maxGuests)}
          onChange={(v) => /^\d+$/.test(v) && set({ maxGuests: Math.max(1, Math.min(LIMITS.guests, Number(v))) })}
          min={1}
          max={LIMITS.guests}
          placeholder="1"
        />
      </div>
    </div>,

    /* Step 3: Who stays */
    <div key="who">
      <MultiChips
        legend={copy.who.legend.replace("{max}", String(model.maxGuestTypes))}
        hint={copy.who.hint}
        value={i.guestTypes}
        options={model.guestTypes.map((g) => ({ value: g.id, label: g.label }))}
        onChange={(v) => set({ guestTypes: v.slice(0, model.maxGuestTypes) })}
        max={model.maxGuestTypes}
        fullNote={copy.who.full.replace("{max}", String(model.maxGuestTypes))}
      />
    </div>,

    /* Step 4: Amenities and details */
    <div key="amenities" className="grid gap-5">
      <MultiChips legend={copy.amenities.legend} value={i.amenities} options={model.amenities.map((a) => ({ value: a.id, label: a.label }))} onChange={(v) => set({ amenities: v })} />
      <ChoiceChips legend={copy.amenities.parking} hint={copy.amenities.parkingHint} value={i.parking} options={model.parkingOptions.map((o) => ({ value: o.id, label: o.label }))} onChange={(v) => set({ parking: v })} name="air-parking" />
      <div className="grid gap-1">
        <Toggle label={questions.captions} checked={i.captions} onChange={(v) => set({ captions: v })} />
        <Toggle label={questions.bedSizes} checked={i.bedSizes} onChange={(v) => set({ bedSizes: v })} />
        <Toggle
          label={questions.wifiSpeed}
          hint={i.wifiSpeed === null ? (mbpsFound ? copy.wifiAuto.yes : copy.wifiAuto.no) : "Your answer"}
          checked={i.wifiSpeed === null ? mbpsFound : i.wifiSpeed}
          onChange={(v) => set({ wifiSpeed: v })}
        />
        <Toggle label={questions.honest} checked={i.honest} onChange={(v) => set({ honest: v })} />
      </div>
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
                id={`air-step-btn-${n}`}
                aria-expanded={isOpen}
                aria-controls={`air-step-${n}`}
                onClick={() => setOpen(isOpen ? -1 : n)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-[18px] border-none bg-transparent px-4 py-3 text-left text-ink md:px-5"
              >
                <span
                  aria-hidden="true"
                  className={cn("flex size-8 flex-none items-center justify-center rounded-full text-sm font-extrabold", done ? "bg-green text-white" : isOpen ? "bg-ink text-white" : "bg-fog text-ink")}
                >
                  {done ? "✓" : n + 1}
                </span>
                <span className="flex-1 text-[16px] font-extrabold">
                  <span className="sr-only-label">Step {n + 1}: </span>
                  {title}
                </span>
                <span aria-hidden="true" className={cn("text-lg transition-transform", isOpen && "rotate-180")}>
                  ⌄
                </span>
              </button>
            </h3>
            <div id={`air-step-${n}`} role="region" aria-labelledby={`air-step-btn-${n}`} hidden={!isOpen} className="px-4 pb-5 md:px-5">
              {bodies[n]}
              {n < steps.length - 1 && (
                <button type="button" onClick={() => setOpen(n + 1)} className="btn btn-outline mt-5 min-h-11">
                  Next: {steps[n + 1]} →
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
