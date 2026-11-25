"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A slider with a matching number field, kept in step. Shared by the tools.
 * The number field accepts typing freely; the tool decides what's valid and
 * shows the error, so neither control ever shows NaN.
 */
export function SliderField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "%",
  error,
  name,
  children,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
  name: string;
  /** Extra lines under the control (e.g. the guest rate). */
  children?: React.ReactNode;
}) {
  const id = useId();
  const n = Number(value);
  const sliderValue = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={`${id}-n`} className="text-[15px] leading-[1.35] font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-[13px] leading-[1.5] text-muted">
          {hint}
        </p>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} (slider)`}
          aria-describedby={describedBy}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-coral"
          data-slider={name}
        />
        <div className={cn("flex w-[112px] flex-none items-center overflow-hidden rounded-[12px] border-[1.5px] bg-white", error ? "border-brand" : "border-line-strong focus-within:border-ink")}>
          <input
            id={`${id}-n`}
            name={name}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="min-h-12 w-full min-w-0 border-none bg-transparent px-3 text-right text-lg font-bold text-ink tabular-nums outline-none"
          />
          <span className="pr-3 text-[15px] font-bold text-muted" aria-hidden="true">
            {unit}
          </span>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="m-0 text-sm font-bold text-brand">
          {error}
        </p>
      )}
      {children}
    </div>
  );
}
