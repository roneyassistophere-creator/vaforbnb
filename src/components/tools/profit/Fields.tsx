"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const show = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "");

/**
 * A number field with a visible label, a hint, an optional £ or % and an
 * inline error. Keeps what the host types while they type (e.g. "12." or "")
 * and passes the number up.
 */
export function Num({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  error,
  className,
  hideLabel = false,
  placeholder,
  inputClassName,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  error?: string;
  className?: string;
  /** Tables: the label is for screen readers only (the column heading shows it). */
  hideLabel?: boolean;
  placeholder?: string;
  inputClassName?: string;
}) {
  const [draft, setDraft] = useState(show(value));
  const [last, setLast] = useState(value);
  if (!Object.is(value, last)) {
    setLast(value);
    if (!Object.is(Number(draft), value)) setDraft(show(value));
  }
  return (
    <div className={cn("grid min-w-0 content-start gap-1.5", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only-label" : "text-[15px] leading-[1.3] font-bold text-ink"}>
        {label}
      </label>
      {hint && !hideLabel && (
        <p className="m-0 -mt-0.5 text-[13px] leading-[1.45] text-muted" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <div className={cn("flex min-h-11 items-center rounded-[12px] border-[1.5px] bg-white focus-within:border-ink", error ? "border-brand" : "border-line")}>
        {prefix && (
          <span className="pl-3 text-[15px] font-bold text-muted" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className={cn("min-h-11 w-full min-w-0 rounded-[12px] bg-transparent px-3 text-base text-ink tabular-nums outline-none", prefix && "pl-1.5", inputClassName)}
          value={draft}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint && !hideLabel ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined}
          onChange={(e) => {
            const t = e.target.value.replace(/[£,%\s]/g, "");
            setDraft(t);
            const n = t === "" ? 0 : Number(t);
            if (Number.isFinite(n)) {
              setLast(n);
              onChange(n);
            } else onChange(Number.NaN);
          }}
          onBlur={() => setDraft(show(value))}
        />
        {suffix && (
          <span className="pr-3 text-[15px] font-bold text-muted" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="m-0 text-[13px] font-bold text-brand" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Chip-style single choice (radio buttons), with a visible legend. */
export function Chips<T extends string>({ legend, value, options, onChange, name, hint }: { legend: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; name: string; hint?: string }) {
  return (
    <fieldset className="m-0 min-w-0 border-none p-0">
      <legend className="mb-2 p-0 text-[15px] font-bold text-ink">{legend}</legend>
      {hint && <p className="m-0 -mt-1 mb-2 text-[13px] text-muted">{hint}</p>}
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

/** A collapsible input section: a tick when complete, and a £/month subtotal in the header. */
export function Section({ id, title, subtotal, complete, open, onToggle, optional, children }: { id: string; title: string; subtotal?: string; complete: boolean; open: boolean; onToggle: (open: boolean) => void; optional?: boolean; children: ReactNode }) {
  return (
    <details className="group rounded-[18px] border border-line bg-white open:border-ink" open={open} onToggle={(e) => onToggle(e.currentTarget.open)} data-section={id}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 md:px-5 [&::-webkit-details-marker]:hidden">
        <span className={cn("grid size-6 flex-none place-items-center rounded-full text-[13px] font-extrabold", complete ? "bg-green-100 text-green" : "bg-amber-50 text-amber")} aria-hidden="true">
          {complete ? "✓" : "!"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-extrabold text-ink">
            {title}
            {optional && <span className="ml-1.5 text-[13px] font-semibold text-muted">(optional)</span>}
          </span>
          <span className="sr-only-label">{complete ? "Complete" : "Needs attention"}</span>
        </span>
        {subtotal && <span className="text-sm font-bold text-ink-copy tabular-nums">{subtotal}</span>}
        <span className="text-muted transition-transform group-open:rotate-180" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="grid gap-4 border-t border-line px-4 pt-4 pb-5 md:px-5">{children}</div>
    </details>
  );
}
