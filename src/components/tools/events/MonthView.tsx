"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { addDays, addMonths, formatLong, monthName } from "@/lib/tools/dates";
import { eventDays, monthGrid, type DateRange, type Found, type FoundHoliday } from "@/lib/tools/events";
import type { ListItem } from "./EventCalendarTool";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabel = (ym: string) => new Date(`${ym}-01T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Month calendar. Arrow keys move between days (Home/End: start/end of the
 * week, Page Up/Down: month); Enter or click shows that day's events below the
 * grid on phones and beside it on wider screens.
 */
export function MonthView({ items, range, today, renderEvent, renderHoliday }: { items: ListItem[]; range: DateRange; today: string; renderEvent: (e: Found) => ReactNode; renderHoliday: (h: FoundHoliday) => ReactNode }) {
  const first = range.from.slice(0, 7);
  const last = range.to.slice(0, 7);
  const [month, setMonth] = useState(first);
  const [selected, setSelected] = useState<string>(range.from);
  const [focusDay, setFocusDay] = useState<string>(range.from);
  const [sheet, setSheet] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!sheet) return;
    panelHeading.current?.focus();
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [sheet]);
  const closeSheet = () => {
    setSheet(false);
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${selected}"]`)?.focus();
  };
  // Keep the month inside the searched range when the range changes.
  const [lastRange, setLastRange] = useState(range.from + range.to);
  if (lastRange !== range.from + range.to) {
    setLastRange(range.from + range.to);
    setMonth(first);
    setSelected(range.from);
    setFocusDay(range.from);
  }

  const byDay = new Map<string, ListItem[]>();
  const tba: Found[] = [];
  for (const it of items) {
    if (it.kind === "holiday") byDay.set(it.h.date, [...(byDay.get(it.h.date) ?? []), it]);
    else if (it.e.dateStatus === "tba") tba.push(it.e);
    else for (const d of eventDays(it.e)) byDay.set(d, [...(byDay.get(d) ?? []), it]);
  }
  const weeks = monthGrid(month);
  const canPrev = month > first;
  const canNext = month < last;
  const dayItems = byDay.get(selected) ?? [];

  const move = (day: string) => {
    const m = day.slice(0, 7);
    if (m < first || m > last) return;
    setMonth(m);
    setFocusDay(day);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${day}"]`)?.focus());
  };
  const onKey = (e: React.KeyboardEvent, day: string) => {
    const wd = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    const to: Record<string, () => string> = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => addDays(day, -wd),
      End: () => addDays(day, 6 - wd),
      PageUp: () => addMonths(day, -1),
      PageDown: () => addMonths(day, 1),
    };
    if (to[e.key]) {
      e.preventDefault();
      move(to[e.key]());
    }
  };
  const focusable = focusDay.slice(0, 7) === month ? focusDay : `${month}-01`;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start" data-month-view>
      <div className="rounded-[18px] border border-line bg-white p-3 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" className="btn btn-outline min-h-11 px-3" disabled={!canPrev} onClick={() => move(`${addMonths(`${month}-01`, -1).slice(0, 7)}-01`)} aria-label="Previous month">
            ‹
          </button>
          <h3 className="m-0 text-lg font-extrabold" aria-live="polite" data-month-label>
            {monthLabel(month)}
          </h3>
          <button type="button" className="btn btn-outline min-h-11 px-3" disabled={!canNext} onClick={() => move(`${addMonths(`${month}-01`, 1).slice(0, 7)}-01`)} aria-label="Next month">
            ›
          </button>
        </div>
        <div role="grid" aria-label={monthLabel(month)} ref={gridRef} className="grid gap-1">
          <div role="row" className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <span key={d} role="columnheader" className="text-center text-[12px] font-bold text-muted">
                {d}
              </span>
            ))}
          </div>
          {weeks.map((w, i) => (
            <div key={i} role="row" className="grid grid-cols-7 gap-1">
              {w.map((day, j) => {
                if (!day) return <span key={j} role="gridcell" />;
                const list = byDay.get(day) ?? [];
                const events = list.filter((x) => x.kind === "event").length;
                const holiday = list.some((x) => x.kind === "holiday");
                const highCount = list.filter((x) => x.kind === "event" && x.e.demand === "high").length;
                const high = highCount > 0;
                const inRange = day >= range.from && day <= range.to;
                const label = `${Number(day.slice(8))} ${monthName(Number(day.slice(5, 7)))}, ${events ? `${events} ${events === 1 ? "event" : "events"}` : "no events"}${highCount ? `, ${highCount} high demand` : ""}${holiday ? ", bank holiday" : ""}`;
                return (
                  <span key={day} role="gridcell">
                    <button
                      type="button"
                      tabIndex={day === focusable ? 0 : -1}
                      aria-label={label}
                      aria-pressed={day === selected}
                      disabled={!inRange}
                      onClick={() => {
                        setSelected(day);
                        setFocusDay(day);
                        setSheet(true);
                      }}
                      onKeyDown={(e) => onKey(e, day)}
                      className={cn(
                        "flex aspect-square w-full min-h-11 flex-col items-center justify-center gap-0.5 rounded-[10px] text-sm font-bold tabular-nums disabled:opacity-35",
                        day === selected ? "bg-ink text-white" : holiday ? "bg-amber-50 text-ink hover:bg-amber-25" : events ? "bg-sand text-ink hover:bg-cloud-2" : "text-ink hover:bg-cloud-2",
                        day === today && day !== selected && "ring-2 ring-brand ring-inset",
                      )}
                      data-day={day}
                    >
                      {Number(day.slice(8))}
                      <span className="flex h-1.5 gap-0.5" aria-hidden="true">
                        {events > 0 && <span className={cn("size-1.5 rounded-full", high ? "bg-brand" : day === selected ? "bg-white" : "bg-ink")} />}
                        {events > 1 && <span className={cn("size-1.5 rounded-full", day === selected ? "bg-white" : "bg-ink")} />}
                      </span>
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <p className="m-0 mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-brand" aria-hidden="true" />
            High demand
          </span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-ink" aria-hidden="true" />
            Event
          </span>
          <span>
            <span className="mr-1 inline-block size-3 rounded-[3px] bg-amber-50 align-[-1px]" aria-hidden="true" />
            Bank holiday (shaded)
          </span>
          <span>Use the arrow keys to move between days.</span>
        </p>
      </div>

      {sheet && <button type="button" aria-label="Close" tabIndex={-1} className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={closeSheet} />}
      <div
        className={cn(
          "gap-3 md:static md:grid md:max-h-none md:overflow-visible md:rounded-none md:bg-transparent md:p-0 md:shadow-none",
          sheet ? "fixed inset-x-0 bottom-0 z-50 grid max-h-[78vh] overflow-y-auto rounded-t-[22px] bg-cream p-4 pb-8 shadow-[0_-8px_30px_rgba(20,33,43,0.25)]" : "hidden",
        )}
        role="region"
        aria-label="Events on the chosen day"
        data-day-panel
        data-sheet={sheet ? "open" : undefined}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 ref={panelHeading} tabIndex={-1} className="m-0 text-lg font-extrabold outline-none">
            {formatLong(selected)}
          </h3>
          <button type="button" className="btn btn-outline min-h-11 px-3 md:hidden" onClick={closeSheet} data-sheet-close>
            Close
          </button>
        </div>
        {dayItems.length === 0 ? (
          <p className="m-0 rounded-[14px] bg-white px-4 py-3 text-sm text-muted">Nothing listed on this day. Pick a day with a dot.</p>
        ) : (
          dayItems.map((it) => (it.kind === "event" ? renderEvent(it.e) : renderHoliday(it.h)))
        )}
      </div>
      {tba.length > 0 && (
        <details className="rounded-[14px] border border-line bg-white p-4 md:col-span-2" data-tba>
          <summary className="min-h-11 cursor-pointer font-bold">Date to be announced ({tba.length})</summary>
          <div className="mt-2 grid gap-3">{tba.map((e) => renderEvent(e))}</div>
        </details>
      )}
    </div>
  );
}
