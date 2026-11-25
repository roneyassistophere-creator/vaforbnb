"use client";

import { useState } from "react";
import { copy } from "@/content/tools/certificateReminders";
import { isValidDate } from "@/lib/tools/dates";
import type { CustomItem } from "@/lib/tools/certificates";
import { DateField } from "../DateField";

/** Add or edit a host's own reminder. */
export function CustomForm({ initial, today, onSave, onCancel }: { initial?: CustomItem; today: string; onSave: (c: Omit<CustomItem, "id">) => void; onCancel: () => void }) {
  const C = copy.custom;
  const [name, setName] = useState(initial?.name ?? "");
  const [mode, setMode] = useState<CustomItem["mode"]>(initial?.mode ?? "interval");
  const [last, setLast] = useState(initial?.last ?? "");
  const [months, setMonths] = useState(String(initial?.months ?? 12));
  const [due, setDue] = useState(initial?.due ?? "");
  const [tried, setTried] = useState(false);

  const m = Number(months);
  const errors = {
    name: !name.trim() ? C.nameError : undefined,
    months: mode === "interval" && !(Number.isInteger(m) && m >= 1 && m <= 120) ? C.monthsError : undefined,
    last: mode === "interval" && isValidDate(last) && last > today ? "This date can’t be in the future." : undefined,
  };
  const ok = !errors.name && !errors.months && !errors.last;

  return (
    <form
      aria-label={initial ? `Edit ${initial.name}` : C.add}
      className="grid gap-4 rounded-[18px] border-2 border-ink bg-white p-4 md:p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!ok) return;
        const base = { name: name.trim().slice(0, 80), mode };
        onSave(mode === "interval" ? { ...base, months: m, ...(last ? { last } : {}) } : { ...base, ...(due ? { due } : {}) });
      }}
    >
      <h3 className="m-0 text-[17px] font-extrabold">{initial ? `Edit “${initial.name}”` : C.add}</h3>
      <label className="grid gap-1.5 text-sm font-bold">
        {C.nameLabel}
        <input
          autoFocus
          className="field min-h-12"
          value={name}
          maxLength={80}
          placeholder={C.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={tried && errors.name ? true : undefined}
        />
        {tried && errors.name && (
          <span className="text-sm font-bold text-brand" role="alert">
            {errors.name}
          </span>
        )}
      </label>
      <fieldset className="m-0 min-w-0 border-none p-0">
        <legend className="mb-2 p-0 text-sm font-bold">{C.modeLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {(["interval", "fixed"] as const).map((v) => (
            <label
              key={v}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
            >
              <input type="radio" name="custom-mode" checked={mode === v} onChange={() => setMode(v)} className="size-4 accent-ink" />
              {v === "interval" ? C.interval : C.fixed}
            </label>
          ))}
        </div>
      </fieldset>
      {mode === "interval" ? (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <DateField label={C.last} value={last} onChange={setLast} error={tried ? errors.last : undefined} />
          <label className="grid gap-1.5 text-sm font-bold">
            {C.months}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              className="field min-h-12 w-32"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              aria-invalid={tried && errors.months ? true : undefined}
            />
            {tried && errors.months && (
              <span className="text-sm font-bold text-brand" role="alert">
                {errors.months}
              </span>
            )}
          </label>
        </div>
      ) : (
        <DateField label={C.due} value={due} onChange={setDue} />
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-ink min-h-11">
          {initial ? C.saveEdit : C.save}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline min-h-11">
          Cancel
        </button>
      </div>
    </form>
  );
}
