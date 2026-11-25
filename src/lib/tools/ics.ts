/**
 * Calendar files (.ics, RFC 5545) for all-day events, made on the visitor's
 * device. Reusable by any tool (certificate reminders, the UK event calendar).
 * Works with Google, Apple and Outlook calendars:
 * CRLF line endings, VERSION 2.0, PRODID, stable UIDs, DTSTAMP,
 * all-day DTSTART/DTEND (VALUE=DATE), escaped text and lines folded at 75 octets.
 */
import { addDays } from "./dates";

export type IcsEvent = {
  /** Stable id: the same thing gets the same UID, so a re-import can update it. */
  uid: string;
  /** All-day date, YYYY-MM-DD. */
  date: string;
  /** Last day for a multi-day all-day event (inclusive). Defaults to `date`. */
  endDate?: string;
  title: string;
  description?: string;
  url?: string;
  /** Alerts, in whole days before the event (e.g. [30, 7]). */
  alarmsDaysBefore?: number[];
};

export type IcsOptions = {
  prodId: string;
  calendarName?: string;
  /** When the file was made (DTSTAMP). Passed in so tests can fix it. */
  now: Date;
};

const CRLF = "\r\n";

/** Escape text values: backslash, semicolon, comma and new lines. */
export const escapeIcsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export const unescapeIcsText = (s: string) => s.replace(/\\(n|N|\\|;|,)/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c));

const encoder = new TextEncoder();
const octets = (s: string) => encoder.encode(s).length;

/** Fold a line so no line is over 75 octets; never splits a character. */
export function foldIcsLine(line: string): string {
  if (octets(line) <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  let limit = 75;
  for (const ch of line) {
    const n = octets(ch);
    if (size + n > limit) {
      out.push(current);
      current = " ";
      size = 1;
      limit = 75;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join(CRLF);
}

const icsDate = (iso: string) => iso.replace(/-/g, "");
const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Build the whole calendar file. */
export function buildIcs(events: IcsEvent[], opts: IcsOptions): string {
  const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:${opts.prodId}`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  if (opts.calendarName) lines.push(`X-WR-CALNAME:${escapeIcsText(opts.calendarName)}`);
  const stamp = icsStamp(opts.now);
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(e.date)}`,
      `DTEND;VALUE=DATE:${icsDate(addDays(e.endDate && e.endDate > e.date ? e.endDate : e.date, 1))}`,
      `SUMMARY:${escapeIcsText(e.title)}`,
    );
    if (e.description) lines.push(`DESCRIPTION:${escapeIcsText(e.description)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push("TRANSP:TRANSPARENT");
    for (const days of e.alarmsDaysBefore ?? []) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeIcsText(e.title)}`, `TRIGGER:-P${days}D`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}

export type ParsedIcsEvent = { uid: string; date: string; end: string; title: string; description: string; triggers: string[] };

/** Read events back from a calendar file (unfolds lines, unescapes text). */
export function parseIcs(text: string): ParsedIcsEvent[] {
  const lines = text.replace(/\r\n[ \t]/g, "").split(/\r\n/);
  const events: ParsedIcsEvent[] = [];
  let cur: ParsedIcsEvent | null = null;
  let inAlarm = false;
  const toIso = (v: string) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = { uid: "", date: "", end: "", title: "", description: "", triggers: [] };
    else if (line === "END:VEVENT" && cur) {
      events.push(cur);
      cur = null;
    }
    else if (line === "BEGIN:VALARM") inAlarm = true;
    else if (line === "END:VALARM") inAlarm = false;
    else if (cur) {
      const i = line.indexOf(":");
      const name = line.slice(0, i).split(";")[0];
      const value = line.slice(i + 1);
      if (inAlarm) {
        if (name === "TRIGGER") cur.triggers.push(value);
      } else if (name === "UID") cur.uid = value;
      else if (name === "DTSTART") cur.date = toIso(value);
      else if (name === "DTEND") cur.end = toIso(value);
      else if (name === "SUMMARY") cur.title = unescapeIcsText(value);
      else if (name === "DESCRIPTION") cur.description = unescapeIcsText(value);
    }
  }
  return events;
}

/** Google Calendar "add event" link for an all-day event. */
export function googleCalendarUrl(e: Pick<IcsEvent, "title" | "date" | "description">): string {
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${icsDate(e.date)}/${icsDate(addDays(e.date, 1))}` });
  if (e.description) p.set("details", e.description);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
