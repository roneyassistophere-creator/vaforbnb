"use client";

import { useId } from "react";

/** A labelled group of chip-style radio buttons. Shared by the builder tools. */
export function ChoiceChips<T extends string>({
  legend,
  value,
  options,
  onChange,
  name,
  hint,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  name?: string;
  hint?: string;
}) {
  const auto = useId();
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
            <input type="radio" name={name ?? auto} checked={value === o.value} onChange={() => onChange(o.value)} className="size-4 accent-ink" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
