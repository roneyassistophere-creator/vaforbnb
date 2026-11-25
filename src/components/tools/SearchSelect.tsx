"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A searchable dropdown (ARIA combobox with a listbox). Type to filter
 * ("fr" finds France), arrows to move, Enter to choose, Escape to close.
 * Common choices can sit at the top.
 */
export function SearchSelect({
  id,
  label,
  options,
  value,
  onChange,
  common = [],
  error,
  hint,
  placeholder = "Start typing to search",
}: {
  id: string;
  label: string;
  /** code → name */
  options: Record<string, string>;
  value: string;
  onChange: (code: string) => void;
  common?: string[];
  error?: string;
  hint?: string;
  placeholder?: string;
}) {
  const auto = useId();
  const listId = `${auto}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => Object.entries(options), [options]);
  const items = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) {
      const top = common.filter((c) => options[c]).map((c) => [c, options[c]] as const);
      const rest = all.filter(([c]) => !common.includes(c)).sort((a, b) => a[1].localeCompare(b[1]));
      return [...top, ...rest];
    }
    const starts = all.filter(([, n]) => n.toLowerCase().startsWith(q) || n.toLowerCase().split(/[\s(]+/).some((w) => w.startsWith(q)));
    const has = all.filter(([, n]) => !starts.some(([, s]) => s === n) && n.toLowerCase().includes(q));
    return [...starts, ...has];
  }, [query, all, common, options]);

  const choose = (code: string) => {
    onChange(code);
    setQuery(null);
    setOpen(false);
  };

  const shown = query ?? (value ? (options[value] ?? value) : "");
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className="relative grid gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-[13px] text-muted">
          {hint}
        </p>
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && items[active] ? `${listId}-${items[active][0]}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        placeholder={placeholder}
        value={shown}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => (setOpen(false), setQuery(null)), 150)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(items.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && open && items[active]) {
            e.preventDefault();
            choose(items[active][0]);
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery(null);
          } else if (e.key === "Tab" && open && query && items[0]) {
            choose(items[active]?.[0] ?? items[0][0]);
          }
        }}
        className={cn("field min-h-12", error && "border-coral")}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="absolute top-full right-0 left-0 z-30 m-0 mt-1 max-h-64 list-none overflow-y-auto rounded-[12px] border border-line-strong bg-white p-1 shadow-[0_12px_32px_rgba(20,33,43,0.14)]">
          {items.length === 0 && <li className="px-3 py-2.5 text-sm text-muted">No matches</li>}
          {items.map(([code, name], i) => (
            <li
              key={code}
              id={`${listId}-${code}`}
              role="option"
              aria-selected={code === value}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(code);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn("flex min-h-11 cursor-pointer items-center rounded-[8px] px-3 text-[15px]", i === active && "bg-sand", code === value && "font-bold")}
            >
              {name}
              {!query && i === common.filter((c) => options[c]).length - 1 && <span className="sr-only-label"> (end of common choices)</span>}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p id={`${id}-error`} className="m-0 text-sm font-bold text-brand" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
