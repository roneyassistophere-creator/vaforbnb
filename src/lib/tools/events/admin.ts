/**
 * Admin rules for the event calendar, as pure functions: validation in plain
 * English, duplicate warnings, next year's copy, the dashboard queues,
 * coverage and launch readiness, CSV import and export, and audit records.
 */

import { addDays, dayNumber, daysInMonth, isValidDate } from "@/lib/tools/dates";
import { slugify } from "@/lib/slug";
import { toCsv } from "@/lib/tools/csv";
import { normalise } from "./search";
import type { Category, City, DateStatus, Demand, EventStatus, Settings } from "./types";

/** An event as the admin area edits it (dates YYYY-MM-DD; empty strings for blanks). */
export type AdminEvent = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  dateStatus: DateStatus;
  city: string;
  venue: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  demand: Demand;
  demandReason: string;
  shortDescription: string;
  sourceTitle: string;
  sourceUrl: string;
  secondSourceUrl: string;
  lastChecked: string | null;
  checkedBy: string;
  status: EventStatus;
  recurrence: "none" | "annual";
  usualMonth: number | null;
  usualWeek: number | null;
  featured: boolean;
  internalNotes: string;
  isSample?: boolean;
};

export const emptyEvent = (): AdminEvent => ({
  slug: "",
  name: "",
  category: "",
  startDate: "",
  endDate: "",
  startTime: "",
  dateStatus: "confirmed",
  city: "",
  venue: "",
  address: "",
  latitude: null,
  longitude: null,
  demand: "medium",
  demandReason: "",
  shortDescription: "",
  sourceTitle: "",
  sourceUrl: "",
  secondSourceUrl: "",
  lastChecked: null,
  checkedBy: "",
  status: "draft",
  recurrence: "none",
  usualMonth: null,
  usualWeek: null,
  featured: false,
  internalNotes: "",
});

export const MAX_DESCRIPTION = 160;
export const isHttpsUrl = (u: string) => {
  try {
    return new URL(u.trim()).protocol === "https:";
  } catch {
    return false;
  }
};

export type FieldErrors = Partial<Record<keyof AdminEvent, string>>;

/**
 * Plain-English validation. `publishing` adds the checks needed before an
 * event can show publicly (an official https source is always required).
 */
export function validateEvent(e: AdminEvent, cities: City[], categories: Category[], publishing = e.status === "published"): FieldErrors {
  const err: FieldErrors = {};
  if (!e.name.trim()) err.name = "Add the event name.";
  if (!categories.some((c) => c.slug === e.category)) err.category = "Pick a category from the list.";
  if (!isValidDate(e.startDate)) err.startDate = "Add a start date.";
  if (e.endDate && !isValidDate(e.endDate)) err.endDate = "Enter a real end date.";
  else if (isValidDate(e.startDate) && e.endDate && e.endDate < e.startDate) err.endDate = "End date can’t be before the start date.";
  if (e.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.startTime)) err.startTime = "Enter a time like 19:30, or leave it empty.";
  if (!cities.some((c) => c.slug === e.city)) err.city = "Pick a city from the list.";
  if ((e.latitude === null) !== (e.longitude === null)) err.latitude = "Add both latitude and longitude, or neither.";
  if (e.latitude !== null && (e.latitude < 49 || e.latitude > 61)) err.latitude = "That latitude isn’t in the UK.";
  if (e.longitude !== null && (e.longitude < -9 || e.longitude > 2.5)) err.longitude = "That longitude isn’t in the UK.";
  if (e.shortDescription.length > MAX_DESCRIPTION) err.shortDescription = `Keep the description to ${MAX_DESCRIPTION} characters.`;
  if (!e.sourceTitle.trim()) err.sourceTitle = "Add the source’s name, for example “Official festival website”.";
  if (!isHttpsUrl(e.sourceUrl)) err.sourceUrl = "Add an official source link (starting https://).";
  if (e.secondSourceUrl.trim() && !isHttpsUrl(e.secondSourceUrl)) err.secondSourceUrl = "The second source link must start https://.";
  if (e.recurrence === "annual" && e.usualMonth !== null && (e.usualMonth < 1 || e.usualMonth > 12)) err.usualMonth = "Pick a month from 1 to 12.";
  if (e.usualWeek !== null && (e.usualWeek < 1 || e.usualWeek > 5)) err.usualWeek = "Pick a week from 1 to 5.";
  if (publishing && (!e.sourceUrl || !isHttpsUrl(e.sourceUrl))) err.sourceUrl = "Add an official source link (starting https://) before publishing.";
  return err;
}

/** "edinburgh-festival-fringe-2027". */
export const slugFor = (name: string, startDate: string) => `${slugify(name)}-${startDate.slice(0, 4)}`;

/** A slug not already used (adds -2, -3…). */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const STOP = new Set(["the", "and", "of", "at", "in", "a", "uk", "festival", "event", "2026", "2027", "2028"]);
const words = (s: string) => new Set(normalise(s).split(" ").filter((w) => w.length > 1 && !STOP.has(w) && !/^\d{4}$/.test(w)));

/** Similar names: most of the distinctive words in common (or one name inside the other). */
export function similarNames(a: string, b: string): boolean {
  const na = normalise(a).replace(/\b\d{4}\b/g, "").trim();
  const nb = normalise(b).replace(/\b\d{4}\b/g, "").trim();
  if (!na || !nb) return false;
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return false;
  const common = [...A].filter((w) => B.has(w)).length;
  return common / Math.min(A.size, B.size) >= 0.6;
}

/** Duplicate warning: same city, similar name, starting within `days` of each other. */
export function findDuplicates<T extends Pick<AdminEvent, "id" | "slug" | "name" | "city" | "startDate">>(e: Pick<AdminEvent, "id" | "slug" | "name" | "city" | "startDate">, existing: T[], days: number): T[] {
  if (!isValidDate(e.startDate)) return [];
  return existing.filter((x) => (x.id ? x.id !== e.id : x.slug !== e.slug) && x.city === e.city && Math.abs(dayNumber(x.startDate) - dayNumber(e.startDate)) <= days && similarNames(x.name, e.name));
}

/** The n-th `weekday` (0 = Sunday) of a month, or the last one if there are fewer. */
function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  let day = 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  while (day > daysInMonth(year, month)) day -= 7;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * "Create next year's copy": a new draft a year later (the same weekday in
 * the usual week of the month, when set; otherwise the same date), with the
 * date "expected" and no last check, flagged for confirmation.
 */
export function nextYearCopy(e: AdminEvent): AdminEvent {
  const [y, m, d] = e.startDate.split("-").map(Number);
  const length = dayNumber(e.endDate || e.startDate) - dayNumber(e.startDate);
  let start: string;
  if (e.usualWeek) {
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    start = nthWeekday(y + 1, e.usualMonth ?? m, weekday, e.usualWeek);
  } else {
    start = `${y + 1}-${String(m).padStart(2, "0")}-${String(Math.min(d, daysInMonth(y + 1, m))).padStart(2, "0")}`;
  }
  return {
    ...e,
    id: undefined,
    slug: slugFor(e.name, start),
    startDate: start,
    endDate: addDays(start, length),
    dateStatus: "expected",
    lastChecked: null,
    checkedBy: "",
    status: "draft",
    featured: false,
    internalNotes: [`Copied from ${e.slug}: confirm the date with the organiser.`, e.internalNotes].filter(Boolean).join(" "),
  };
}

/* ---- Dashboard queues -------------------------------------------------------- */

type QueueEvent = Pick<AdminEvent, "startDate" | "endDate" | "status" | "dateStatus" | "lastChecked" | "city" | "sourceUrl"> & { isSample?: boolean };

/** Published events starting within the horizon whose last check is older than the re-check interval. */
export const recheckDue = <T extends QueueEvent>(list: T[], today: string, s: Pick<Settings, "recheckDays" | "recheckHorizonDays">) =>
  list.filter((e) => e.status === "published" && e.startDate >= today && e.startDate <= addDays(today, s.recheckHorizonDays) && (!e.lastChecked || dayNumber(today) - dayNumber(e.lastChecked) > s.recheckDays));

/** Expected or TBA events starting within the confirm window. */
export const confirmDue = <T extends QueueEvent>(list: T[], today: string, s: Pick<Settings, "confirmWindowDays">) =>
  list.filter((e) => e.status !== "archived" && e.dateStatus !== "confirmed" && e.endDate >= today && e.startDate <= addDays(today, s.confirmWindowDays));

export const startingSoon = <T extends QueueEvent>(list: T[], today: string, s: Pick<Settings, "startingSoonDays">) =>
  list.filter((e) => e.status === "published" && e.startDate >= today && e.startDate <= addDays(today, s.startingSoonDays));

export const missingSource = <T extends QueueEvent>(list: T[]) => list.filter((e) => e.status !== "archived" && !isHttpsUrl(e.sourceUrl));

/** Published events that ended in the last 7 days (now hidden from the public page). */
export const recentlyEnded = <T extends QueueEvent>(list: T[], today: string) => list.filter((e) => e.status !== "draft" && e.endDate < today && e.endDate >= addDays(today, -7));

/** Upcoming published, sourced, non-sample events per covered city within `coverageDays`, and launch readiness. */
export function coverage(list: QueueEvent[], cities: City[], today: string, s: Pick<Settings, "coverageDays" | "launchCities" | "launchEventsPerCity">) {
  const until = addDays(today, s.coverageDays);
  const rows = cities
    .filter((c) => c.covered)
    .map((c) => {
      const count = list.filter((e) => e.city === c.slug && e.status === "published" && !e.isSample && isHttpsUrl(e.sourceUrl) && e.endDate >= today && e.startDate <= until).length;
      return { city: c, count, ready: count >= s.launchEventsPerCity };
    })
    .sort((a, b) => b.count - a.count || a.city.name.localeCompare(b.city.name));
  const ready = rows.filter((r) => r.ready).length;
  return { rows, ready, needed: s.launchCities, launchReady: ready >= s.launchCities };
}

/** After a bulk "Mark as checked": does it cover enough upcoming published events to move "Events last reviewed" on? */
export function reviewCovers(checkedIds: string[], upcomingPublishedIds: string[], s: Pick<Settings, "reviewCoverage">): boolean {
  if (!upcomingPublishedIds.length) return false;
  const set = new Set(checkedIds);
  return upcomingPublishedIds.filter((id) => set.has(id)).length / upcomingPublishedIds.length >= s.reviewCoverage;
}

/* ---- CSV import and export ---------------------------------------------------- */

export const CSV_COLUMNS = [
  "name",
  "category",
  "startDate",
  "endDate",
  "dateStatus",
  "city",
  "venue",
  "postcode",
  "latitude",
  "longitude",
  "demand",
  "demandReason",
  "shortDescription",
  "sourceTitle",
  "sourceUrl",
  "secondSourceUrl",
  "recurrence",
  "status",
] as const;

/** Parse CSV text (quoted fields, doubled quotes, CRLF or LF; a leading BOM is ignored). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (quoted) {
      if (ch === '"' && t[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

export type ImportRow = { line: number; event: AdminEvent | null; errors: string[]; duplicateOf: string | null; updatesSlug: string | null };

const pickEnum = <T extends string>(v: string, allowed: readonly T[], d: T) => (allowed.includes(v.trim().toLowerCase() as T) ? (v.trim().toLowerCase() as T) : d);
const num = (v: string) => (v.trim() === "" ? null : Number(v));

/**
 * Check every row of an import, without saving anything. Rows matching an
 * existing slug update it; similar events (same city, similar name, close
 * dates) are flagged as possible duplicates. City and category match by slug
 * or name.
 */
export function previewImport(
  text: string,
  ctx: { cities: City[]; categories: Category[]; existing: Pick<AdminEvent, "id" | "slug" | "name" | "city" | "startDate">[]; settings: Pick<Settings, "duplicateDays">; publish: boolean },
): { rows: ImportRow[]; headerError: string | null } {
  const all = parseCsv(text);
  if (!all.length) return { rows: [], headerError: "The file is empty." };
  const header = all[0].map((h) => h.trim());
  const missing = ["name", "category", "startDate", "city", "sourceTitle", "sourceUrl"].filter((h) => !header.includes(h));
  if (missing.length) return { rows: [], headerError: `Missing columns: ${missing.join(", ")}. Use the CSV template.` };
  const col = (r: string[], k: (typeof CSV_COLUMNS)[number]) => (header.indexOf(k) >= 0 ? (r[header.indexOf(k)] ?? "").trim() : "");
  const findCityRef = (v: string) => ctx.cities.find((c) => c.slug === v.toLowerCase() || normalise(c.name) === normalise(v))?.slug ?? "";
  const findCat = (v: string) => ctx.categories.find((c) => c.slug === v.toLowerCase() || normalise(c.name) === normalise(v))?.slug ?? "";
  const bySlug = new Map(ctx.existing.map((e) => [e.slug, e]));
  const seenSlugs = new Set<string>();
  const rows: ImportRow[] = all.slice(1).map((r, i) => {
    const errors: string[] = [];
    const cityRaw = col(r, "city");
    const catRaw = col(r, "category");
    const start = col(r, "startDate");
    const lat = num(col(r, "latitude"));
    const lng = num(col(r, "longitude"));
    const e: AdminEvent = {
      ...emptyEvent(),
      name: col(r, "name"),
      category: findCat(catRaw),
      startDate: start,
      endDate: col(r, "endDate") || start,
      dateStatus: pickEnum(col(r, "dateStatus") === "to be announced" ? "tba" : col(r, "dateStatus"), ["confirmed", "expected", "tba"] as const, "confirmed"),
      city: findCityRef(cityRaw),
      venue: col(r, "venue"),
      address: col(r, "postcode"),
      latitude: lat !== null && Number.isFinite(lat) ? lat : null,
      longitude: lng !== null && Number.isFinite(lng) ? lng : null,
      demand: pickEnum(col(r, "demand"), ["high", "medium", "low"] as const, "medium"),
      demandReason: col(r, "demandReason"),
      shortDescription: col(r, "shortDescription"),
      sourceTitle: col(r, "sourceTitle"),
      sourceUrl: col(r, "sourceUrl"),
      secondSourceUrl: col(r, "secondSourceUrl"),
      recurrence: pickEnum(col(r, "recurrence"), ["none", "annual"] as const, "none"),
      status: ctx.publish ? "published" : "draft",
    };
    // Specific messages first, then the general validation for any field not already reported.
    const reported = new Set<keyof AdminEvent>();
    const report = (k: keyof AdminEvent, msg: string) => {
      errors.push(msg);
      reported.add(k);
    };
    if (catRaw && !e.category) report("category", `Unknown category “${catRaw}”.`);
    if (cityRaw && !e.city) report("city", `Unknown city “${cityRaw}”.`);
    if (start && !isValidDate(start)) report("startDate", `Bad start date “${start}” (use YYYY-MM-DD).`);
    const endRaw = col(r, "endDate");
    if (endRaw && !isValidDate(endRaw)) report("endDate", `Bad end date “${endRaw}” (use YYYY-MM-DD).`);
    if (!e.sourceUrl) report("sourceUrl", "Missing source link.");
    else if (!isHttpsUrl(e.sourceUrl)) report("sourceUrl", `Source link must start https:// (“${e.sourceUrl}”).`);
    for (const [k, msg] of Object.entries(validateEvent(e, ctx.cities, ctx.categories, ctx.publish)) as [keyof AdminEvent, string][]) if (msg && !reported.has(k)) report(k, msg);
    let updatesSlug: string | null = null;
    let duplicateOf: string | null = null;
    if (!errors.length) {
      const base = slugFor(e.name, e.startDate);
      if (bySlug.has(base)) {
        updatesSlug = base;
        e.slug = base;
        e.id = bySlug.get(base)!.id;
      } else {
        e.slug = uniqueSlug(base, new Set([...bySlug.keys(), ...seenSlugs]));
        const d = findDuplicates(e, ctx.existing, ctx.settings.duplicateDays)[0];
        if (d) duplicateOf = `${d.name} (${d.startDate})`;
      }
      if (seenSlugs.has(e.slug)) errors.push("This row repeats an earlier row in the file.");
      seenSlugs.add(e.slug);
    }
    return { line: i + 2, event: errors.length ? null : e, errors, duplicateOf, updatesSlug };
  });
  return { rows, headerError: null };
}

/** The CSV template (header plus one example row, clearly marked). */
export function csvTemplate(): string {
  return toCsv(
    [...CSV_COLUMNS],
    [["EXAMPLE: delete this row", "music", "2027-06-12", "2027-06-13", "expected", "manchester", "Heaton Park", "M25 2SW", "", "", "high", "Two-day festival, city-wide demand", "Two days of live music in north Manchester.", "Official festival website", "https://example.org/", "", "annual", "draft"]],
    { bom: true },
  );
}

/** Export: the template's columns, so the file can be edited and re-imported (rows match by slug). */
export function eventsCsv(list: AdminEvent[]): string {
  return toCsv(
    [...CSV_COLUMNS, "slug"],
    list.map((e) => [
      e.name,
      e.category,
      e.startDate,
      e.endDate,
      e.dateStatus,
      e.city,
      e.venue,
      e.address,
      e.latitude === null ? "" : String(e.latitude),
      e.longitude === null ? "" : String(e.longitude),
      e.demand,
      e.demandReason,
      e.shortDescription,
      e.sourceTitle,
      e.sourceUrl,
      e.secondSourceUrl,
      e.recurrence,
      e.status,
      e.slug,
    ]),
    { bom: true },
  );
}

/* ---- Audit ------------------------------------------------------------------------ */

export type AuditRecord = { userEmail: string; action: string; entity: string; entityId: string | null; summary: string; changes: Record<string, { from: unknown; to: unknown }> | null };

/** An audit record, with only the fields that changed. */
export function auditRecord(user: string, action: string, entity: string, entityId: string | null, summary: string, before?: Record<string, unknown> | null, after?: Record<string, unknown> | null): AuditRecord {
  let changes: AuditRecord["changes"] = null;
  if (before && after) {
    changes = {};
    for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
      if (["updatedAt", "createdAt"].includes(k)) continue;
      if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) changes[k] = { from: before[k] ?? null, to: after[k] ?? null };
    }
  }
  return { userEmail: user, action, entity, entityId, summary, changes };
}

/* ---- Suggestions ------------------------------------------------------------------ */

export type Suggestion = { id: string; name: string; date: string; town: string; sourceUrl: string; email: string | null; message: string | null; status: "new" | "accepted" | "rejected"; note: string | null; closedAt: string | null };

/** "Create draft from this": the event form, prefilled from the suggestion (city matched by name or alias). */
export function draftFromSuggestion(s: Suggestion, cities: City[]): AdminEvent {
  const date = isValidDate(s.date) ? s.date : "";
  const q = normalise(s.town);
  const city = cities.find((c) => normalise(c.name) === q || c.aliases.some((a) => normalise(a) === q))?.slug ?? "";
  return { ...emptyEvent(), name: s.name, startDate: date, endDate: date, city, sourceUrl: s.sourceUrl, sourceTitle: "", internalNotes: `From a public suggestion (${s.town}).${s.message ? ` Message: ${s.message}` : ""}` };
}

/** Close a suggestion (accepted or rejected): the suggester's email is deleted (privacy). */
export function closeSuggestion(s: Suggestion, status: "accepted" | "rejected", note: string | null, now: Date = new Date()): Suggestion {
  return { ...s, status, note: note?.trim() || null, email: null, closedAt: now.toISOString() };
}
