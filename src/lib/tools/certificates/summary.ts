import { formatLong, formatMedium } from "../dates";
import { numberFigure, type Figures } from "../figures";
import { counts } from "./schedule";
import type { ScheduleRow } from "./types";

const plural = (n: number, w: string) => `${n} ${n === 1 ? w : `${w}s`}`;

/** Words for the status pill (never colour alone). */
export function statusLabel(r: ScheduleRow): string {
  if (r.error) return "Check the date";
  if (r.status === "missing" || r.days === null) return "Add a date";
  if (r.status === "overdue") return `Overdue by ${plural(-r.days, "day")}`;
  if (r.status === "soon") return r.days === 0 ? "Due today" : `Due in ${plural(r.days, "day")}`;
  return `Due ${formatMedium(r.due!)}`;
}

/** "in 25 days", "today", "overdue by 55 days". */
export function whenText(r: ScheduleRow): string {
  if (r.days === null) return "";
  if (r.days < 0) return `overdue by ${plural(-r.days, "day")}`;
  if (r.days === 0) return "today";
  return `in ${plural(r.days, "day")}`;
}

/** "2 overdue · 1 due soon · 3 OK · 1 to add" */
export function countsLine(rows: ScheduleRow[]): string {
  const c = counts(rows);
  return `${c.overdue} overdue · ${c.soon} due soon · ${c.ok} OK · ${c.missing} to add`;
}

/** The first dated item after sorting (the most overdue, or the next due). */
export const nextRow = (rows: ScheduleRow[]) => rows.find((r) => r.due);

/** "What this means": 2–3 sentences chosen by the result. */
export function whatThisMeans(rows: ScheduleRow[], figures: Figures): string {
  if (!rows.length) return "Choose your nation and add the dates from your certificates to see what’s due.";
  const c = counts(rows);
  const out: string[] = [];
  const dated = rows.length - c.missing;
  if (c.overdue > 0) out.push(`${plural(c.overdue, "check")} ${c.overdue === 1 ? "is" : "are"} overdue. Book ${c.overdue === 1 ? "it" : "them"} as soon as you can, and keep the new certificates. Guests and insurers may ask for them.`);
  else if (c.soon > 0) out.push(`${plural(c.soon, "check")} ${c.soon === 1 ? "is" : "are"} due in the next ${numberFigure(figures, "cert.dueSoonDays")} days. Book now so there’s time to fix anything the engineer finds.`);
  else if (dated > 0) out.push("Nothing is due soon. Add the reminders to your calendar so you don’t miss the next ones.");
  if (c.missing > 0) out.push("Add the dates you’re missing. Your certificates show the date of the last check.");
  return out.join(" ");
}

/** Plain-text summary for Copy. */
export function summaryText(rows: ScheduleRow[], o: { title: string; rulesChecked: string; disclaimer: string }): string {
  const lines = [o.title, countsLine(rows), ""];
  for (const r of rows) {
    const due = r.due ? formatLong(r.due) : "no date yet";
    lines.push(`- ${r.name} (${r.propertyName}): ${due}. ${statusLabel(r)}.`);
  }
  lines.push("", `Rules last checked ${o.rulesChecked}.`, o.disclaimer);
  return lines.join("\n");
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** The due dates table as CSV: Item, Property, Last done, Due date, Status, Remind on. */
export function scheduleCsv(rows: ScheduleRow[]): string {
  const head = ["Item", "Property", "Last done", "Due date", "Status", "Remind on"];
  const body = rows.map((r) => [r.name, r.propertyName, r.lastDone ?? "", r.due ?? "", statusLabel(r), r.due && r.status !== "overdue" ? (r.remindOn ?? "") : ""]);
  return [head, ...body].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
