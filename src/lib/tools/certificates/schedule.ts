import { addDays, addMonths, daysBetween, isValidDate } from "../dates";
import { mapFigure, numberFigure, numberListFigure, type Figures } from "../figures";
import { itemDefs, type ItemDef } from "./items";
import { tagNation, type CustomItem, type ItemKey, type PropertyData, type ScheduleRow, type Status, type Tag } from "./types";

/** "12 months", "2 years", "5 years", "18 months". */
export function monthsText(n: number): string {
  if (n % 12 === 0 && n >= 24) return `${n / 12} years`;
  return `${n} ${n === 1 ? "month" : "months"}`;
}

export const FUTURE_ERROR = "This date can’t be in the future.";

/** PAT interval: the host's choice if it's one of the stored options, otherwise the stored default. */
export function patMonths(p: Pick<PropertyData, "patMonths">, figures: Figures): number {
  const options = numberListFigure(figures, "cert.pat.monthsOptions");
  return p.patMonths && options.includes(p.patMonths) ? p.patMonths : numberFigure(figures, "cert.pat.months");
}

export type Due = { due: string | null; basis: string | null };

/** The next due date for one item. Pure date arithmetic: no "today" involved. */
export function dueDate(item: ItemKey | CustomItem, p: PropertyData, figures: Figures): Due {
  const none: Due = { due: null, basis: null };

  if (typeof item !== "string") {
    if (item.mode === "fixed") return isValidDate(item.due) ? { due: item.due, basis: "The date you entered" } : none;
    const m = item.months;
    if (!isValidDate(item.last) || !m || !Number.isInteger(m) || m < 1) return none;
    return { due: addMonths(item.last, m), basis: `Last done + ${monthsText(m)}` };
  }

  const def = itemDefs.find((d) => d.key === item)!;
  const entered = p.dates[item];

  if (def.kind === "fixed") return isValidDate(entered) ? { due: entered, basis: "The renewal or expiry date you entered" } : none;

  if (item === "eicr" && isValidDate(p.eicrNext)) return { due: p.eicrNext, basis: "The next inspection date on your report" };
  if (!isValidDate(entered)) return none;

  if (item === "gas") {
    const months = numberFigure(figures, "cert.gas.months");
    const prev = p.gasPrevDue;
    if (isValidDate(prev)) {
      const windowStart = addMonths(prev, -numberFigure(figures, "cert.gas.earlyWindowMonths"));
      if (entered >= windowStart && entered <= prev) return { due: addMonths(prev, months), basis: `Previous due date + ${monthsText(months)} (check done early)` };
    }
    return { due: addMonths(entered, months), basis: `Last check + ${monthsText(months)}` };
  }

  const months = item === "pat" ? patMonths(p, figures) : numberFigure(figures, def.monthsKey!);
  return { due: addMonths(entered, months), basis: `Last done + ${monthsText(months)}` };
}

/** Overdue, Due soon or OK, with whole days from today (negative = overdue). */
export function status(due: string | null, today: string, figures: Figures): { status: Status; days: number | null } {
  if (!due) return { status: "missing", days: null };
  const days = daysBetween(today, due);
  if (days < 0) return { status: "overdue", days };
  if (days <= numberFigure(figures, "cert.dueSoonDays")) return { status: "soon", days };
  return { status: "ok", days };
}

/** Required or recommended for this nation, or null if the check doesn't apply there. */
export function tagFor(def: ItemDef, p: PropertyData, figures: Figures): Tag | null {
  const v = mapFigure(figures, def.tagKey)[tagNation(p.nation)];
  return v === "required" || v === "recommended" ? v : null;
}

/** The built-in checks shown for this property (by nation and gas). */
export const itemsFor = (p: PropertyData, figures: Figures) => itemDefs.filter((d) => (!d.needsGas || p.hasGas) && tagFor(d, p, figures) !== null);

const rank: Record<Status, number> = { overdue: 0, soon: 1, ok: 2, missing: 3 };

/** Overdue first, then due soon, OK and missing; each by due date. Stable for ties. */
export function sortRows(rows: ScheduleRow[]): ScheduleRow[] {
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank[a.r.status] - rank[b.r.status] || (a.r.due && b.r.due ? (a.r.due < b.r.due ? -1 : a.r.due > b.r.due ? 1 : 0) : 0) || a.i - b.i)
    .map((x) => x.r);
}

export const reminderDays = (figures: Figures, chosen?: number) => {
  const options = numberListFigure(figures, "cert.reminderDaysOptions");
  return chosen && options.includes(chosen) ? chosen : numberFigure(figures, "cert.defaultReminderDays");
};

/**
 * Every item for one property: due date, days, status, tag and reminder date,
 * sorted soonest first. A "last done" date in the future gives an error and no result.
 */
export function buildSchedule(p: PropertyData, figures: Figures, today: string, remindDaysChosen?: number): ScheduleRow[] {
  const remind = reminderDays(figures, remindDaysChosen);
  const rows: ScheduleRow[] = [];
  const push = (base: Omit<ScheduleRow, "due" | "days" | "status" | "remindOn" | "basis" | "propertyId" | "propertyName" | "id">, due: Due, error?: string) => {
    const d = error ? { due: null, basis: null } : due;
    const s = status(d.due, today, figures);
    rows.push({
      ...base,
      id: `${p.id}:${base.key}`,
      propertyId: p.id,
      propertyName: p.name,
      due: d.due,
      basis: d.basis,
      days: s.days,
      status: s.status,
      remindOn: d.due ? addDays(d.due, -remind) : null,
      ...(error ? { error } : {}),
    });
  };

  for (const def of itemsFor(p, figures)) {
    const entered = p.dates[def.key];
    const lastDone = def.kind === "interval" && isValidDate(entered) ? entered : null;
    const future = lastDone !== null && lastDone > today;
    push(
      { key: def.key, builtIn: def.key, name: def.name, tag: tagFor(def, p, figures), lastDone, fixed: def.kind === "fixed", todo: def.todo, anchor: def.anchor },
      dueDate(def.key, p, figures),
      future ? FUTURE_ERROR : undefined,
    );
  }

  for (const c of p.custom) {
    const lastDone = c.mode === "interval" && isValidDate(c.last) ? c.last : null;
    push(
      { key: c.id, builtIn: null, name: c.name, tag: null, lastDone, fixed: c.mode === "fixed", todo: `${c.name}: book it or do it, then update the date.` },
      dueDate(c, p, figures),
      lastDone !== null && lastDone > today ? FUTURE_ERROR : undefined,
    );
  }

  return sortRows(rows);
}

/** Schedules for several properties, merged and sorted. */
export const buildAllSchedules = (ps: PropertyData[], figures: Figures, today: string, remindDaysChosen?: number) =>
  sortRows(ps.flatMap((p) => buildSchedule(p, figures, today, remindDaysChosen)));

export function counts(rows: ScheduleRow[]) {
  const c = { overdue: 0, soon: 0, ok: 0, missing: 0 };
  for (const r of rows) c[r.status]++;
  return c;
}
