"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/** A pounds amount with a £ prefix. Text in, text out: the tool decides what's valid. */
export function MoneyField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = "0.00",
  className,
  compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className={cn("font-bold text-ink", compact ? "text-[13px]" : "text-[15px]")}>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-[13px] leading-[1.45] text-muted">
          {hint}
        </p>
      )}
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] font-bold text-muted">
          £
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field min-h-12 pl-8 tabular-nums", error && "border-coral")}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="m-0 text-sm font-bold text-brand" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
