"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  hint?: string;
  /** Longer "what to count" help, shown from the "?" button. */
  tip?: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  error?: string;
  name: string;
  placeholder?: string;
};

/**
 * Whole-number input with − and + buttons, a visible label and hint, and a
 * "?" tip. Accepts typing freely; the tool decides what's valid and shows the
 * error, so the field never shows NaN.
 */
export function NumberField({ label, hint, tip, value, onChange, min = 0, max = 366, error, name, placeholder = "Days" }: Props) {
  const id = useId();
  const [tipOpen, setTipOpen] = useState(false);
  const hintId = `${id}-hint`;
  const tipId = `${id}-tip`;
  const errorId = `${id}-error`;

  const current = /^\d+$/.test(value.trim()) ? Number(value) : null;
  const step = (d: number) => {
    const next = Math.min(max, Math.max(min, (current ?? (d > 0 ? min - 1 : min + 1)) + d));
    onChange(String(next));
  };

  return (
    <div className="grid gap-1.5">
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={id} className="text-[15px] leading-[1.35] font-bold text-ink">
          {label}
        </label>
        {tip && (
          <button
            type="button"
            aria-label={`What to count: ${label}`}
            aria-expanded={tipOpen}
            aria-controls={tipId}
            onClick={() => setTipOpen((o) => !o)}
            onKeyDown={(e) => e.key === "Escape" && setTipOpen(false)}
            className="-my-2.5 -mr-2.5 flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0"
          >
            <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-fog text-[13px] font-extrabold text-ink">
              ?
            </span>
          </button>
        )}
      </div>
      {tip && (
        <p id={tipId} hidden={!tipOpen} className="m-0 rounded-[10px] bg-steel-50 px-3.5 py-2.5 text-[13px] leading-[1.55] text-ink-copy">
          {tip}
        </p>
      )}
      {hint && (
        <p id={hintId} className="m-0 text-[13px] leading-[1.5] text-muted">
          {hint}
        </p>
      )}
      <div className={cn("flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] bg-white", error ? "border-brand" : "border-line-strong focus-within:border-ink")}>
        <button type="button" aria-label={`Decrease: ${label}`} onClick={() => step(-1)} className="flex w-12 flex-none cursor-pointer items-center justify-center border-none bg-fog text-xl font-bold text-ink hover:bg-line">
          −
        </button>
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined}
          placeholder={placeholder}
          className="min-h-12 w-full min-w-0 border-none bg-transparent px-3 text-center text-lg font-bold text-ink tabular-nums outline-none"
        />
        <button type="button" aria-label={`Increase: ${label}`} onClick={() => step(1)} className="flex w-12 flex-none cursor-pointer items-center justify-center border-none bg-fog text-xl font-bold text-ink hover:bg-line">
          +
        </button>
      </div>
      {error && (
        <p id={errorId} className="m-0 text-sm font-bold text-brand">
          {error}
        </p>
      )}
    </div>
  );
}
