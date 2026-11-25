"use client";

/** A labelled group of chip-style checkboxes, with an optional maximum. Shared by the tools. */
export function MultiChips({
  legend,
  hint,
  value,
  options,
  onChange,
  max,
  fullNote,
}: {
  legend: string;
  hint?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (v: string[]) => void;
  max?: number;
  fullNote?: string;
}) {
  const full = max !== undefined && value.length >= max;
  return (
    <fieldset className="m-0 min-w-0 border-none p-0">
      <legend className="mb-2 p-0 text-[15px] font-bold text-ink">{legend}</legend>
      {hint && <p className="m-0 -mt-1 mb-2 text-[13px] leading-[1.5] text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          const disabled = !on && full;
          return (
            <label
              key={o.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-disabled:cursor-not-allowed has-disabled:opacity-45 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
            >
              <input
                type="checkbox"
                checked={on}
                disabled={disabled}
                onChange={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
                className="size-4 accent-ink"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {full && fullNote && (
        <p className="m-0 mt-2 text-[13px] font-semibold text-muted" role="status">
          {fullNote}
        </p>
      )}
    </fieldset>
  );
}
