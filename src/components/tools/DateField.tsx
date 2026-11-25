"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatDmy, parseTypedDate } from "@/lib/tools/dates";

/**
 * A date the host can type as DD/MM/YYYY (in any browser language) or pick
 * from the browser's calendar. `value` is ISO (YYYY-MM-DD) or "".
 * Half-typed dates count as empty until they're a real date.
 */
export function DateField({
  label,
  value,
  onChange,
  error,
  hint,
  id,
  className,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  hint?: string;
  id?: string;
  className?: string;
}) {
  const auto = useId();
  const inputId = id ?? `date-${auto}`;
  const [text, setText] = useState(value ? formatDmy(value) : "");
  const [shown, setShown] = useState(value);
  const [typingError, setTypingError] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  // Follow outside changes (example data, clear all) without fighting the typing.
  if (value !== shown) {
    setShown(value);
    if ((parseTypedDate(text) ?? "") !== value) {
      setText(value ? formatDmy(value) : "");
      setTypingError(false);
    }
  }

  const type = (t: string) => {
    setText(t);
    const iso = parseTypedDate(t);
    setTypingError(false);
    const next = iso ?? "";
    setShown(next);
    if (next !== value) onChange(next);
  };

  const openPicker = () => {
    const el = picker.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  const shownError = typingError ? "Enter the date as DD/MM/YYYY." : error;
  const describedBy = [hint && `${inputId}-hint`, shownError && `${inputId}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${inputId}-hint`} className="m-0 text-[13px] leading-[1.45] text-muted">
          {hint}
        </p>
      )}
      <div className="relative flex max-w-[260px] items-stretch">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD/MM/YYYY"
          value={text}
          onChange={(e) => type(e.target.value)}
          onBlur={() => setTypingError(text.trim() !== "" && !parseTypedDate(text))}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field min-h-12 min-w-0 flex-1 rounded-r-none border-r-0 tabular-nums", shownError && "border-coral")}
        />
        <button
          type="button"
          onClick={openPicker}
          aria-label={`Choose “${label}” from a calendar`}
          className="flex min-h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-r-[12px] border border-line-strong bg-white text-ink hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>
        <input
          ref={picker}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          onChange={(e) => type(e.target.value ? formatDmy(e.target.value) : "")}
          className="pointer-events-none absolute right-0 bottom-0 size-px opacity-0"
        />
      </div>
      {shownError && (
        <p id={`${inputId}-error`} className="m-0 text-sm font-bold text-brand" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}
