import { formatLong } from "../dates";
import { londonToday, numberFigure, type Figures } from "../figures";
import { buildIcs, googleCalendarUrl, type IcsEvent } from "../ics";
import { reminderDays } from "./schedule";
import type { ScheduleRow, Settings } from "./types";

export type Site = { url: string; toolPath: string; rulesPath: string };

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const uidPart = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x";

/** Same item and property → same UID, so a re-import can update instead of duplicating. */
export const eventUid = (r: ScheduleRow, site: Site) => `${uidPart(r.propertyId)}-${uidPart(r.key)}@${host(site.url)}`;

/**
 * The calendar event for one row, or null if it has no due date (or it's
 * overdue and overdue items are left out).
 */
export function eventFor(r: ScheduleRow, settings: Settings, figures: Figures, today: string, site: Site): IcsEvent | null {
  if (!r.due) return null;
  const overdue = r.status === "overdue";
  if (overdue && !settings.includeOverdue) return null;

  const lines = [r.todo];
  if (r.lastDone) lines.push(`Last done: ${formatLong(r.lastDone)}`);
  else if (r.fixed) lines.push(`Renewal or expiry date: ${formatLong(r.due)}`);
  if (overdue) lines.push(`Was due: ${formatLong(r.due)}`);
  if (r.anchor) lines.push(`The rules: ${site.url}${site.rulesPath}#${r.anchor}`);
  lines.push(`When it’s done, update the date at ${host(site.url)}${site.toolPath} and download a new file.`);

  const first = reminderDays(figures, settings.remindDays);
  const second = numberFigure(figures, "cert.secondReminderDays");
  const alarms = overdue ? [] : [...new Set([first, ...(settings.secondReminder ? [second] : [])])];

  return {
    uid: eventUid(r, site),
    date: overdue ? today : r.due,
    title: overdue ? `OVERDUE: ${r.name} – ${r.propertyName}` : `${r.name} due – ${r.propertyName}`,
    description: lines.join("\n"),
    alarmsDaysBefore: alarms,
  };
}

/** The .ics file for these rows: one all-day event per dated item, no repeats. */
export function buildCalendarFile(rows: ScheduleRow[], settings: Settings, now: Date, figures: Figures, site: Site): string {
  const today = londonToday(now);
  const events = rows.map((r) => eventFor(r, settings, figures, today, site)).filter((e): e is IcsEvent => e !== null);
  return buildIcs(events, { prodId: "-//VA for BnB//Certificate reminders//EN", calendarName: "Holiday let checks", now });
}

/** Number of events the file would hold. */
export const eventCount = (rows: ScheduleRow[], settings: Settings) => rows.filter((r) => r.due && (r.status !== "overdue" || settings.includeOverdue)).length;

export function googleLinkFor(r: ScheduleRow, settings: Settings, figures: Figures, today: string, site: Site): string | null {
  const e = eventFor(r, { ...settings, includeOverdue: true }, figures, today, site);
  return e ? googleCalendarUrl(e) : null;
}

const fileSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "property";

/** "vaforbnb-reminders-flat-2-2026-11-25.ics" */
export const calendarFileName = (propertyName: string | null, today: string) => `vaforbnb-reminders-${propertyName ? fileSlug(propertyName) : "all-properties"}-${today}.ics`;
