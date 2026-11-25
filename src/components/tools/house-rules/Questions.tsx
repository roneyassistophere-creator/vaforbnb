"use client";

import { useState, type ReactNode } from "react";
import { copy, homeToggles, presetLocations, presetTasks, sectionTitles } from "@/content/tools/houseRules";
import { cn } from "@/lib/cn";
import { LIMITS, type Answers, type Rules, type Warning } from "@/lib/tools/house-rules";
import { ChoiceChips } from "../ChoiceChips";
import { NumberField } from "../NumberField";
import { Toggle } from "../Toggle";
import { WarningNote } from "./WarningNote";

const lockNote = (label: string, why: string) => (
  <p className="m-0 flex items-start gap-2 rounded-[12px] bg-cloud px-3.5 py-2.5 text-sm text-ink">
    <span aria-hidden="true">🔒</span>
    <span>
      <strong>Always included:</strong> “{label}” <span className="text-ink-copy">{why}</span>
    </span>
  </p>
);

function Field({ id, label, hint, children, count }: { id: string; label: string; hint?: string; children: ReactNode; count?: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[15px] font-bold text-ink">
          {label}
        </label>
        {count && <span className="text-[12px] font-bold text-muted tabular-nums">{count}</span>}
      </div>
      {hint && <p className="m-0 text-[13px] text-muted">{hint}</p>}
      {children}
    </div>
  );
}

function TimeInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field id={id} label={label}>
      <input id={id} type="time" step={900} className="field min-h-12 max-w-[180px]" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </Field>
  );
}

/** Chips you can toggle, plus a custom one. */
function ChipPicker({ legend, presets, value, onChange, max, addLabel, id }: { legend: string; presets: string[]; value: string[]; onChange: (v: string[]) => void; max: number; addLabel: string; id: string }) {
  const [custom, setCustom] = useState("");
  const custom_ = value.filter((v) => !presets.includes(v));
  const full = value.length >= max;
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : full ? value : [...value, v]);
  return (
    <fieldset className="m-0 min-w-0 border-none p-0">
      <legend className="mb-2 p-0 text-[15px] font-bold text-ink">
        {legend} <span className="font-semibold text-muted">({value.length} of {max})</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {[...presets, ...custom_].map((p) => {
          const on = value.includes(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => toggle(p)}
              className={cn("min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40", on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink")}
            >
              {on ? "✓ " : "+ "}
              {p}
            </button>
          );
        })}
      </div>
      <form
        className="mt-2 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = custom.trim();
          if (v && !value.includes(v) && !full) onChange([...value, v.slice(0, LIMITS.shortText)]);
          setCustom("");
        }}
      >
        <label className="grid min-w-[180px] flex-1 gap-1 text-[13px] font-bold">
          {addLabel}
          <input id={id} className="field min-h-11" value={custom} maxLength={LIMITS.shortText} disabled={full} onChange={(e) => setCustom(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-outline min-h-11" disabled={full || !custom.trim()}>
          Add
        </button>
      </form>
    </fieldset>
  );
}

/** The 8 question sections (one open at a time). */
export function Questions({
  a,
  set,
  rules,
  open,
  setOpen,
  visited,
}: {
  a: Answers;
  set: (patch: Partial<Answers>) => void;
  rules: Rules;
  open: number;
  setOpen: (i: number) => void;
  visited: Set<number>;
}) {
  const warn = (source: string) => rules.warnings.filter((w) => w.source === source);
  const notes = (source: string) => rules.notes.filter((n) => n.source === source).map((n) => n.text);
  const show = (ws: Warning[]) => ws.map((w, i) => <WarningNote key={`${w.type}-${i}`} w={w} />);
  const feeNote = (source: "lateCheckout" | "petFee") =>
    notes(source).map((t) => (
      <p key={t} className="m-0 rounded-[12px] bg-amber-25 px-3.5 py-2.5 text-sm font-bold text-[#6B4A00]" role="note">
        <span className="font-extrabold">Note:</span> {t}
      </p>
    ));

  const body: ReactNode[] = [
    // 1. Your property
    <div key="1" className="grid gap-4">
      <Field id="hr-name" label="Property name (optional)" hint="Used in the heading and on the sign.">
        <input id="hr-name" className="field min-h-12" value={a.propertyName} maxLength={LIMITS.shortText} onChange={(e) => set({ propertyName: e.target.value })} placeholder="For example: Flat 2, Harbour View" />
      </Field>
      <ChoiceChips
        legend="Tone"
        hint="Changes the wording, never the meaning."
        value={a.tone}
        onChange={(tone) => set({ tone })}
        options={[
          { value: "friendly", label: "Friendly" },
          { value: "short", label: "Short and firm" },
        ]}
      />
    </div>,
    // 2. Arrival and departure
    <div key="2" className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TimeInput id="hr-checkin" label="Check-in from" value={a.checkin} onChange={(checkin) => set({ checkin })} />
        <TimeInput id="hr-checkout" label="Check-out by" value={a.checkout} onChange={(checkout) => set({ checkout })} />
      </div>
      <ChoiceChips
        legend="Self check-in"
        value={a.selfCheckIn ? "yes" : "no"}
        onChange={(v) => set({ selfCheckIn: v === "yes" })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
      <ChoiceChips
        legend="Late check-out"
        value={a.lateCheckout}
        onChange={(lateCheckout) => set({ lateCheckout })}
        options={[
          { value: "ask", label: "Ask us" },
          { value: "no", label: "Not available" },
          { value: "fee", label: "Available for a fee" },
        ]}
      />
      {feeNote("lateCheckout")}
    </div>,
    // 3. Guests
    <div key="3" className="grid gap-4">
      <div className="max-w-[260px]">
        <NumberField name="maxGuests" label="Maximum guests" hint="Match your listing and fire risk assessment." value={String(a.maxGuests)} onChange={(v) => set({ maxGuests: clampInt(v, 1, LIMITS.maxGuests, a.maxGuests) })} min={1} max={LIMITS.maxGuests} />
      </div>
      <ChoiceChips
        legend="Visitors"
        value={a.visitors}
        onChange={(visitors) => set({ visitors })}
        options={[
          { value: "none", label: "No visitors" },
          { value: "arrangement", label: "Visitors by arrangement" },
          { value: "daytime", label: "Daytime visitors welcome" },
        ]}
      />
      <ChoiceChips
        legend="Suitable for children"
        hint="Shown as information for guests, not a ban."
        value={a.children}
        onChange={(children) => set({ children })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "underAge", label: "Not under a certain age" },
          { value: "noInfants", label: "Not suitable for infants" },
        ]}
      />
      {a.children === "underAge" && (
        <div className="max-w-[260px]">
          <NumberField name="childAge" label="Not suitable for children under" value={String(a.childAge)} onChange={(v) => set({ childAge: clampInt(v, 1, 17, a.childAge) })} min={1} max={17} />
        </div>
      )}
    </div>,
    // 4. Pets
    <div key="4" className="grid gap-4">
      <ChoiceChips
        legend="Pets"
        value={a.pets}
        onChange={(pets) => set({ pets })}
        options={[
          { value: "no", label: "No pets" },
          { value: "yes", label: "Pets welcome" },
          { value: "ask", label: "Pets by arrangement" },
        ]}
      />
      {a.pets === "yes" && (
        <>
          <div className="max-w-[260px]">
            <NumberField name="maxPets" label="Maximum pets" value={String(a.maxPets)} onChange={(v) => set({ maxPets: clampInt(v, 1, LIMITS.maxPets, a.maxPets) })} min={1} max={LIMITS.maxPets} />
          </div>
          <Toggle label="Pet fee charged" checked={a.petFee} onChange={(petFee) => set({ petFee })} />
          {feeNote("petFee")}
        </>
      )}
      {lockNote("Assistance dogs are always welcome.", copy.locked.assistanceDogs)}
    </div>,
    // 5. Noise and parties
    <div key="5" className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TimeInput id="hr-quiet-from" label="Quiet hours from" value={a.quietFrom} onChange={(quietFrom) => set({ quietFrom })} />
        <TimeInput id="hr-quiet-to" label="Quiet hours to" value={a.quietTo} onChange={(quietTo) => set({ quietTo })} />
      </div>
      {lockNote("No parties or events.", copy.locked.parties)}
      <ChoiceChips
        legend="Noise monitor"
        value={a.noiseMonitor ? "yes" : "no"}
        onChange={(v) => set({ noiseMonitor: v === "yes" })}
        options={[
          { value: "no", label: "No" },
          { value: "yes", label: "Yes, a sound-level monitor (doesn’t record conversations)" },
        ]}
      />
    </div>,
    // 6. Smoking
    <div key="6" className="grid gap-4">
      <ChoiceChips
        legend="Smoking"
        value={a.smoking}
        onChange={(smoking) => set({ smoking })}
        options={[
          { value: "none", label: "No smoking or vaping anywhere" },
          { value: "outside", label: "Smoking outside only" },
        ]}
      />
      {a.smoking === "outside" && (
        <Field id="hr-smoking-area" label="Where can guests smoke?">
          <input id="hr-smoking-area" className="field min-h-12" value={a.smokingArea} maxLength={LIMITS.shortText} placeholder="For example: the back garden" onChange={(e) => set({ smokingArea: e.target.value })} />
        </Field>
      )}
      {show(warn("smokingArea"))}
      <Toggle label="No candles or open flames" hint="Fire safety." checked={a.noFlames} onChange={(noFlames) => set({ noFlames })} />
    </div>,
    // 7. Parking, rubbish and the home
    <div key="7" className="grid gap-5">
      <Field id="hr-parking" label="Parking (optional)" count={`${a.parking.length} / ${LIMITS.freeText}`}>
        <textarea id="hr-parking" rows={2} className="field min-h-20 py-3" value={a.parking} maxLength={LIMITS.freeText} placeholder="One space in bay 12. Permit in the kitchen drawer." onChange={(e) => set({ parking: e.target.value })} />
      </Field>
      {show(warn("parking"))}
      <Field id="hr-rubbish" label="Rubbish and recycling (optional)" count={`${a.rubbish.length} / ${LIMITS.freeText}`}>
        <textarea id="hr-rubbish" rows={2} className="field min-h-20 py-3" value={a.rubbish} maxLength={LIMITS.freeText} placeholder="Black bin for general waste, blue bin for recycling." onChange={(e) => set({ rubbish: e.target.value })} />
      </Field>
      {show(warn("rubbish"))}
      <Field id="hr-collection" label="Collection day (optional)">
        <select id="hr-collection" className="field min-h-12 max-w-[220px]" value={a.collectionDay} onChange={(e) => set({ collectionDay: e.target.value })}>
          <option value="">Not shown</option>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <fieldset className="m-0 grid min-w-0 gap-1 border-none p-0">
        <legend className="mb-1 p-0 text-[15px] font-bold">Looking after the home</legend>
        {homeToggles.map((t) => (
          <Toggle key={t.key} label={t.label} checked={a.home[t.key]} onChange={(v) => set({ home: { ...a.home, [t.key]: v } })} />
        ))}
      </fieldset>
      <ChipPicker legend="Check-out tasks" presets={presetTasks} value={a.checkoutTasks} onChange={(checkoutTasks) => set({ checkoutTasks })} max={LIMITS.tasks} addLabel="Add your own task" id="hr-task-custom" />
      {show([...warn("tasks"), ...a.checkoutTasks.flatMap((_, i) => warn(`task-${i}`))])}
    </div>,
    // 8. Cameras and extra rules
    <div key="8" className="grid gap-5">
      <ChoiceChips
        legend="Outdoor cameras or video doorbell"
        value={a.cameras ? "yes" : "no"}
        onChange={(v) => set({ cameras: v === "yes" })}
        options={[
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ]}
      />
      <p className="m-0 text-[13px] font-semibold text-muted">ⓘ {copy.noIndoor}</p>
      {a.cameras && (
        <>
          <ChipPicker legend="Where are they?" presets={presetLocations} value={a.cameraLocations} onChange={(cameraLocations) => set({ cameraLocations })} max={8} addLabel="Add another place" id="hr-camera-custom" />
          <ChoiceChips
            legend="Recording"
            value={a.recording}
            onChange={(recording) => set({ recording })}
            options={[
              { value: "video", label: "Video only" },
              { value: "videoSound", label: "Video and sound" },
            ]}
          />
        </>
      )}
      <fieldset className="m-0 grid min-w-0 gap-3 border-none p-0">
        <legend className="mb-1 p-0 text-[15px] font-bold">
          Extra rules <span className="font-semibold text-muted">({a.extraRules.length} of {LIMITS.extraRules})</span>
        </legend>
        {a.extraRules.map((r, i) => (
          <div key={i} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor={`hr-extra-${i}`} className="text-sm font-bold">
                Extra rule {i + 1}
              </label>
              <span className="text-[12px] font-bold text-muted tabular-nums">
                {r.length} / {LIMITS.extraRuleChars}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                id={`hr-extra-${i}`}
                className="field min-h-12 flex-1"
                value={r}
                maxLength={LIMITS.extraRuleChars}
                onChange={(e) => set({ extraRules: a.extraRules.map((x, j) => (j === i ? e.target.value.slice(0, LIMITS.extraRuleChars) : x)) })}
              />
              <button type="button" aria-label={`Remove extra rule ${i + 1}`} onClick={() => set({ extraRules: a.extraRules.filter((_, j) => j !== i) })} className="btn btn-outline min-h-12 w-12 px-0">
                ✕
              </button>
            </div>
            {show(warn(`extra-${i}`))}
          </div>
        ))}
        <button
          type="button"
          disabled={a.extraRules.length >= LIMITS.extraRules}
          onClick={() => {
            set({ extraRules: [...a.extraRules, ""] });
            requestAnimationFrame(() => document.getElementById(`hr-extra-${a.extraRules.length}`)?.focus());
          }}
          className="btn btn-outline min-h-11 justify-self-start disabled:opacity-50"
        >
          + Add a rule
        </button>
      </fieldset>
      <Field id="hr-contact" label="Contact hours (optional)" hint="Shown under “Need help?”.">
        <input id="hr-contact" className="field min-h-12" value={a.contactHours} maxLength={LIMITS.shortText} placeholder="For example: 8am to 10pm" onChange={(e) => set({ contactHours: e.target.value })} />
      </Field>
    </div>,
  ];

  return (
    <div className="grid gap-2.5">
      {sectionTitles.map((title, i) => {
        const isOpen = open === i;
        return (
          <section key={title} className={cn("rounded-[18px] border bg-white", isOpen ? "border-ink" : "border-line")}>
            <h3 className="m-0">
              <button
                type="button"
                id={`hr-section-${i}`}
                aria-expanded={isOpen}
                aria-controls={`hr-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 border-none bg-transparent px-4 text-left text-[16px] font-extrabold text-ink md:px-5"
              >
                <span
                  aria-hidden="true"
                  className={cn("flex size-7 flex-none items-center justify-center rounded-full text-[13px]", visited.has(i) ? "bg-green text-white" : "bg-fog text-ink-copy")}
                >
                  {visited.has(i) ? "✓" : i + 1}
                </span>
                <span className="flex-1">{title}</span>
                {visited.has(i) && <span className="sr-only-label">(done)</span>}
                <span aria-hidden="true" className={cn("text-lg transition-transform", isOpen && "rotate-180")}>
                  ⌄
                </span>
              </button>
            </h3>
            <div id={`hr-panel-${i}`} role="region" aria-labelledby={`hr-section-${i}`} hidden={!isOpen} className="border-t border-line px-4 pt-4 pb-5 md:px-5">
              {body[i]}
              {i < sectionTitles.length - 1 && (
                <button type="button" onClick={() => setOpen(i + 1)} className="btn btn-ink mt-5 min-h-11">
                  Next: {sectionTitles[i + 1].toLowerCase()} →
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function clampInt(v: string, min: number, max: number, fallback: number) {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}
