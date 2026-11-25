"use client";

import { copy } from "@/content/tools/longStay";
import { cn } from "@/lib/cn";
import { money } from "@/lib/tools/format";
import { thresholdFor, type Content, type FieldErrors, type Form, type Result } from "@/lib/tools/long-stay";
import { MoneyField } from "../MoneyField";
import { NumberField } from "../NumberField";
import { SliderField } from "../SliderField";
import { Toggle } from "../Toggle";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

function Chips<T extends string>({ legend, value, options, onChange, name }: { legend: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; name: string }) {
  return (
    <fieldset className="m-0 min-w-0 border-none p-0">
      <legend className="mb-2 p-0 text-[15px] font-bold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
          >
            <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} className="size-4 accent-ink" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Inputs({
  f,
  set,
  errors,
  content,
  result,
  moreOpen,
  setMoreOpen,
}: {
  f: Form;
  set: (patch: Partial<Form>) => void;
  errors: FieldErrors;
  content: Content;
  result: Result | null;
  moreOpen: boolean;
  setMoreOpen: (v: boolean) => void;
}) {
  const S = content.settings;
  const presets = S.periodPresets.map(String);
  const isPreset = presets.includes(f.periodNights.trim());
  const nights = Number(f.periodNights);
  const label = Number.isInteger(nights) && nights >= 1 ? copy.threshold[thresholdFor(nights, content)] : "";
  const feeNum = (x: number) => String(+(x * 100).toFixed(2));

  return (
    <div className="grid gap-5 rounded-[20px] border border-line bg-white p-5 md:p-6" data-inputs>
      <MoneyField label={copy.rate.label} hint={copy.rate.hint} value={f.nightlyRate} onChange={(v) => set({ nightlyRate: v })} error={errors.nightlyRate} placeholder="100" />

      <div className="grid gap-2">
        <Chips
          legend={copy.period.legend}
          value={isPreset ? f.periodNights.trim() : "custom"}
          options={[...presets.map((p) => ({ value: p, label: fill(copy.period.nights, { n: p }) })), { value: "custom", label: copy.period.custom }]}
          onChange={(v) => set({ periodNights: v === "custom" ? (isPreset ? "" : f.periodNights) : v })}
          name="ls-period"
        />
        {!isPreset && (
          <div className="max-w-[260px]">
            <NumberField
              label={fill(copy.period.customLabel, { max: S.periodMax })}
              name="ls-nights"
              value={f.periodNights}
              onChange={(v) => set({ periodNights: v })}
              min={1}
              max={S.periodMax}
              error={errors.periodNights}
              placeholder="Nights"
            />
          </div>
        )}
        {isPreset && errors.periodNights && <p className="m-0 text-sm font-bold text-brand">{errors.periodNights}</p>}
        {label && (
          <p className="m-0 inline-flex items-center gap-2 text-sm font-bold text-ink-copy" data-threshold aria-live="polite">
            <span aria-hidden="true" className="size-2 rounded-full bg-coral" />
            {label}
          </p>
        )}
      </div>

      <SliderField label={copy.discount.label} value={f.discountPercent} onChange={(v) => set({ discountPercent: v })} min={0} max={S.discountMax} step={1} error={errors.discountPercent} name="ls-discount">
        {result && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-sm text-ink-copy" data-guest-rate>
              {fill(copy.discount.guest, { nightly: money(result.guestNightly), total: money(result.guestTotal) })}
            </p>
            {result.highlighted && (
              <span className="rounded-md bg-green-100 px-2 py-[3px] text-[12px] font-extrabold text-green" data-highlight-badge>
                ✓ {copy.discount.badge}
              </span>
            )}
          </div>
        )}
      </SliderField>

      <SliderField label={copy.occupancy.label} hint={copy.occupancy.hint} value={f.occupancyPercent} onChange={(v) => set({ occupancyPercent: v })} min={0} max={100} error={errors.occupancyPercent} name="ls-occupancy" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="ls-avg" className="text-[15px] font-bold text-ink">
            {copy.avg.label}
          </label>
          <p id="ls-avg-hint" className="m-0 text-[13px] text-muted">
            {copy.avg.hint}
          </p>
          <input
            id="ls-avg"
            type="text"
            inputMode="decimal"
            className={cn("field min-h-12", errors.averageStay && "border-brand")}
            value={f.averageStay}
            onChange={(e) => set({ averageStay: e.target.value })}
            aria-invalid={!!errors.averageStay}
            aria-describedby={`ls-avg-hint${errors.averageStay ? " ls-avg-err" : ""}`}
            autoComplete="off"
          />
          {errors.averageStay && (
            <p id="ls-avg-err" className="m-0 text-sm font-bold text-brand">
              {errors.averageStay}
            </p>
          )}
        </div>
        <MoneyField label={copy.turnover.label} hint={copy.turnover.hint} value={f.turnoverCost} onChange={(v) => set({ turnoverCost: v })} error={errors.turnoverCost} placeholder="50" />
      </div>

      <div className="grid gap-2">
        <Chips
          legend={copy.fee.legend}
          value={f.feePreset}
          options={[
            { value: "airbnb", label: fill(copy.fee.airbnb, { n: feeNum(content.fees.airbnb) }) },
            { value: "direct", label: fill(copy.fee.direct, { n: feeNum(content.fees.direct) }) },
            { value: "custom", label: copy.fee.custom },
          ]}
          onChange={(v) => set({ feePreset: v, feePercent: v === "airbnb" ? feeNum(content.fees.airbnb) : v === "direct" ? feeNum(content.fees.direct) : f.feePercent })}
          name="ls-fee-preset"
        />
        <div className="grid max-w-[260px] gap-1.5">
          <label htmlFor="ls-fee" className="text-[15px] font-bold text-ink">
            {copy.fee.label}
          </label>
          <p id="ls-fee-hint" className="m-0 text-[13px] text-muted">
            {copy.fee.hint}
          </p>
          <input
            id="ls-fee"
            type="text"
            inputMode="decimal"
            className={cn("field min-h-12", errors.feePercent && "border-brand")}
            value={f.feePercent}
            onChange={(e) => set({ feePercent: e.target.value, feePreset: "custom" })}
            aria-invalid={!!errors.feePercent}
            aria-describedby="ls-fee-hint"
            autoComplete="off"
          />
          {errors.feePercent && <p className="m-0 text-sm font-bold text-brand">{errors.feePercent}</p>}
        </div>
      </div>

      <Toggle label={copy.london} checked={f.london} onChange={(v) => set({ london: v })} />

      <div className="border-t border-line pt-3">
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          aria-controls="ls-more"
          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-[15px] font-bold text-ink"
        >
          <span>
            {copy.more.toggle}
            <span className="block text-[13px] font-semibold text-muted">{copy.more.hint}</span>
          </span>
          <span aria-hidden="true" className={cn("text-lg transition-transform", moreOpen && "rotate-180")}>
            ⌄
          </span>
        </button>
        <div id="ls-more" hidden={!moreOpen} className="mt-3 grid gap-4">
          <MoneyField label={copy.running.label} hint={copy.running.hint} value={f.runningCost} onChange={(v) => set({ runningCost: v })} error={errors.runningCost} placeholder="0" />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label={copy.midCleans.label} hint={copy.midCleans.hint} name="ls-cleans" value={f.midCleans} onChange={(v) => set({ midCleans: v })} min={0} max={30} error={errors.midCleans} placeholder="0" />
            <MoneyField label={copy.midCleanCost.label} hint={copy.midCleanCost.hint} value={f.midCleanCost} onChange={(v) => set({ midCleanCost: v })} error={errors.midCleanCost} placeholder={f.turnoverCost || "50"} />
          </div>
          <div className="grid max-w-[260px] gap-1.5">
            <label htmlFor="ls-long-fee" className="text-[15px] font-bold text-ink">
              {copy.longFee.label}
            </label>
            <p id="ls-long-fee-hint" className="m-0 text-[13px] text-muted">
              {copy.longFee.hint}
            </p>
            <input id="ls-long-fee" type="text" inputMode="decimal" className="field min-h-12" value={f.longFeePercent} placeholder={f.feePercent} onChange={(e) => set({ longFeePercent: e.target.value })} aria-describedby="ls-long-fee-hint" autoComplete="off" />
            {errors.longFeePercent && <p className="m-0 text-sm font-bold text-brand">{errors.longFeePercent}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
