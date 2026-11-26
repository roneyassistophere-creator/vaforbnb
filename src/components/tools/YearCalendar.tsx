"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Twelve small month grids for one year (weeks start on Monday).
 * Reusable: pass marks per date and the kinds of mark with their look.
 * Marked days are buttons: hover shows a tooltip, tap or Enter shows the
 * detail under the calendar. It's a visual summary; tools must also give the
 * same information as text.
 */

export type DayKindStyle = {
  label: string;
  /** Classes for the day cell. */
  cell: string;
  /** Small dot marker (so colour isn't the only signal). */
  dot?: boolean;
  /** Swatch classes for the legend (defaults to `cell`). */
  swatch?: string;
};

export type DayMark = { kind: string; detail: string };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
/** 0 = Monday … 6 = Sunday */
const firstWeekday = (y: number, m: number) => (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;

export function YearCalendar({
  year,
  marks,
  kinds,
  today,
  label,
  months,
}: {
  year: number;
  /** Only these months (1–12); all 12 when left out. */
  months?: number[];
  marks: Record<string, DayMark>;
  kinds: Record<string, DayKindStyle>;
  /** YYYY-MM-DD, outlined if in this year. */
  today?: string;
  label: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = selected ? marks[selected] : null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3" role="group" aria-label={label}>
        {MONTHS.map((name, i) => {
          const m = i + 1;
          if (months && !months.includes(m)) return null;
          const blanks = firstWeekday(year, m);
          return (
            <div key={name} className="min-w-0">
              <p className="m-0 mb-1 text-xs font-extrabold text-ink">{name}</p>
              <div className="grid grid-cols-7 gap-[2px] text-center" aria-hidden={false}>
                {WEEKDAYS.map((w, k) => (
                  <span key={k} aria-hidden="true" className="text-[9px] font-bold text-faint">
                    {w}
                  </span>
                ))}
                {Array.from({ length: blanks }, (_, k) => (
                  <span key={`b${k}`} aria-hidden="true" />
                ))}
                {Array.from({ length: daysIn(year, m) }, (_, k) => {
                  const iso = `${year}-${pad(m)}-${pad(k + 1)}`;
                  const mark = marks[iso];
                  const style = mark ? kinds[mark.kind] : null;
                  const isToday = iso === today;
                  const cls = cn(
                    "relative flex aspect-square min-w-0 items-center justify-center rounded-[4px] text-[10px] leading-none tabular-nums",
                    style ? style.cell : "text-subtle",
                    isToday && "outline-2 -outline-offset-1 outline-coral",
                  );
                  if (!mark || !style)
                    return (
                      <span key={iso} className={cls} aria-hidden="true">
                        {k + 1}
                      </span>
                    );
                  return (
                    <button
                      key={iso}
                      type="button"
                      title={`${k + 1} ${name}: ${mark.detail}`}
                      aria-label={`${k + 1} ${name}: ${style.label}. ${mark.detail}`}
                      aria-pressed={selected === iso}
                      onClick={() => setSelected(selected === iso ? null : iso)}
                      className={cn(cls, "cursor-pointer border-none p-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink")}
                    >
                      {k + 1}
                      {style.dot && <span aria-hidden="true" className="absolute top-[2px] right-[2px] size-[4px] rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="m-0 mt-3 min-h-5 text-[13px] text-ink-copy" aria-live="polite">
        {sel && selected ? (
          <>
            <strong>{`${Number(selected.slice(8))} ${MONTHS[Number(selected.slice(5, 7)) - 1]}`}:</strong> {sel.detail}
          </>
        ) : (
          <span className="text-muted">Tap a marked day to see its bookings.</span>
        )}
      </p>

      <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-xs text-ink-copy">
        {Object.entries(kinds).map(([k, s]) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("relative inline-block size-3.5 rounded-[3px]", s.swatch ?? s.cell)}>
              {s.dot && <span className="absolute top-[2px] right-[2px] size-[3px] rounded-full bg-white" />}
            </span>
            {s.label}
          </li>
        ))}
        {today && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block size-3.5 rounded-[3px] outline-2 -outline-offset-1 outline-coral" />
            Today
          </li>
        )}
      </ul>
    </div>
  );
}
