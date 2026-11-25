"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChoiceOption = { value: string; label: string };

type Props = {
  name: string;
  legend: string;
  hint?: string;
  options: ChoiceOption[];
  /** Radio buttons (one answer) or checkboxes (several). */
  multi?: boolean;
  /** Selected value(s). */
  value: string | string[] | undefined;
  /** Single: the chosen value. Multi: the value and whether it's now ticked. */
  onChange: (value: string, checked: boolean) => void;
  /** Single choice only: called after a tap or click (not arrow keys), to move on. */
  onPicked?: (value: string) => void;
  /** Move keyboard focus to the legend when shown (set false on first load). */
  autoFocus?: boolean;
  error?: string;
  children?: ReactNode;
};

/**
 * One question as a real fieldset with radio buttons or checkboxes.
 * Single-choice questions move on after a pointer tap; keyboard users choose
 * with the arrow keys and press Next (or Enter), so focus never jumps away
 * while they're still choosing.
 */
export function ChoiceQuestion({ name, legend, hint, options, multi, value, onChange, onPicked, autoFocus, error, children }: Props) {
  const legendRef = useRef<HTMLLegendElement>(null);
  const pointer = useRef(false);

  useEffect(() => {
    if (autoFocus) legendRef.current?.focus();
  }, [autoFocus, name]);

  const selected = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;

  return (
    <fieldset className="m-0 min-w-0 border-none p-0" aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined}>
      <legend
        ref={legendRef}
        tabIndex={-1}
        className="mb-1.5 p-0 text-[24px] leading-[1.2] font-extrabold tracking-[-0.6px] outline-none focus-visible:underline md:text-[28px]"
      >
        {legend}
      </legend>
      {hint && (
        <p id={hintId} className="m-0 mb-5 text-[15px] text-body">
          {hint}
        </p>
      )}
      <div className={cn("grid gap-2.5", options.length > 3 && "sm:grid-cols-2")}>
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          return (
            <label
              key={o.value}
              htmlFor={id}
              onPointerDown={() => (pointer.current = true)}
              className={cn(
                "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink transition-colors",
                "hover:border-ink has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
              )}
            >
              <input
                id={id}
                type={multi ? "checkbox" : "radio"}
                name={name}
                value={o.value}
                checked={selected(o.value)}
                onChange={(e) => {
                  onChange(o.value, e.target.checked);
                  if (!multi && pointer.current) onPicked?.(o.value);
                  pointer.current = false;
                }}
                onClick={() => {
                  // Tapping the already-chosen answer (e.g. after Back) also moves on.
                  if (!multi && pointer.current && selected(o.value)) {
                    pointer.current = false;
                    onPicked?.(o.value);
                  }
                }}
                className="size-5 flex-none accent-ink"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {children}
      {error && (
        <p id={errorId} role="alert" className="m-0 mt-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}
    </fieldset>
  );
}
