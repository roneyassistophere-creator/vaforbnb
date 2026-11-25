/**
 * The public event search: location (with town aliases), distance, dates,
 * categories, demand and date status, plus bank holidays for the city's
 * nation. Pure and deterministic: "today" is passed in (London date), and
 * every threshold comes from the stored settings. Runs on the visitor's
 * device: their location never leaves it.
 */

import { addDays, daysInMonth, dayNumber } from "@/lib/tools/dates";
import { milesBetween } from "./geo";
import { BANK_HOLIDAY, type BankHoliday, type City, type PublicEvent, type Settings } from "./types";

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * The city a typed town means: an exact city name or slug, then an alias
 * ("Salford" → Manchester), then a city whose name starts with the text.
 */
export function findCity(query: string, cities: City[]): City | null {
  const q = normalise(query);
  if (!q) return null;
  const covered = cities.filter((c) => c.covered);
  return (
    covered.find((c) => normalise(c.name) === q || c.slug === q.replace(/ /g, "-")) ??
    covered.find((c) => c.aliases.some((a) => normalise(a) === q)) ??
    covered.find((c) => normalise(c.name).startsWith(q)) ??
    null
  );
}

/** Picker suggestions: cities and their aliases matching the text (city first). */
export function suggestCities(query: string, cities: City[], max = 8): { label: string; city: City }[] {
  const q = normalise(query);
  const covered = cities.filter((c) => c.covered).sort((a, b) => a.name.localeCompare(b.name));
  if (!q) return covered.slice(0, max).map((c) => ({ label: c.name, city: c }));
  const out: { label: string; city: City }[] = [];
  for (const c of covered) if (normalise(c.name).includes(q)) out.push({ label: c.name, city: c });
  for (const c of covered) for (const a of c.aliases) if (normalise(a).includes(q)) out.push({ label: `${a} (${c.name} area)`, city: c });
  return out.slice(0, max);
}

/** The nearest covered city to a point (the visitor's location, worked out on their device). */
export function nearestCity(point: { latitude: number; longitude: number }, cities: City[]): { city: City; miles: number } | null {
  let best: { city: City; miles: number } | null = null;
  for (const c of cities.filter((x) => x.covered)) {
    const miles = milesBetween(point, c);
    if (!best || miles < best.miles) best = { city: c, miles };
  }
  return best ? { city: best.city, miles: Math.round(best.miles) } : null;
}

/* ---- Dates ------------------------------------------------------------------ */

export type RangeKind = "next30" | "next90" | "thisMonth" | "nextMonth" | "custom";
export type DateRange = { from: string; to: string };

/** The dates a range covers, inclusive. "Next 90 days" from 26 Nov 2026 runs to 24 Feb 2027. */
export function rangeFor(kind: RangeKind, today: string, s: Pick<Settings, "defaultRangeDays">, custom?: Partial<DateRange>): DateRange {
  const [y, m] = today.split("-").map(Number);
  switch (kind) {
    case "next30":
      return { from: today, to: addDays(today, 30) };
    case "thisMonth":
      return { from: today, to: `${today.slice(0, 7)}-${String(daysInMonth(y, m)).padStart(2, "0")}` };
    case "nextMonth": {
      const ny = m === 12 ? y + 1 : y;
      const nm = m === 12 ? 1 : m + 1;
      const mm = String(nm).padStart(2, "0");
      return { from: `${ny}-${mm}-01`, to: `${ny}-${mm}-${String(daysInMonth(ny, nm)).padStart(2, "0")}` };
    }
    case "custom": {
      const from = custom?.from && custom.from >= today ? custom.from : today;
      const to = custom?.to && custom.to >= from ? custom.to : addDays(from, s.defaultRangeDays);
      return { from, to };
    }
    default:
      return { from: today, to: addDays(today, s.defaultRangeDays) };
  }
}

/** Still showing today? An event disappears after its end date (London time). */
export const isCurrent = (e: Pick<PublicEvent, "endDate">, today: string) => e.endDate >= today;

/** Does the event fall in the range (it starts in it, or is already running)? */
export const overlaps = (e: Pick<PublicEvent, "startDate" | "endDate">, r: DateRange) => e.startDate <= r.to && e.endDate >= r.from;

/** Each day an event is on (for the calendar grid). TBA events aren't on the grid. */
export function eventDays(e: Pick<PublicEvent, "startDate" | "endDate" | "dateStatus">): string[] {
  if (e.dateStatus === "tba") return [];
  const n = Math.max(0, dayNumber(e.endDate) - dayNumber(e.startDate));
  return Array.from({ length: n + 1 }, (_, i) => addDays(e.startDate, i));
}

/* ---- The search ---------------------------------------------------------------- */

export type Filters = { categories: string[]; highOnly: boolean; confirmedOnly: boolean };
export const noFilters = (): Filters => ({ categories: [], highOnly: false, confirmedOnly: false });

export type Found = PublicEvent & { miles: number };
export type FoundHoliday = BankHoliday & { category: typeof BANK_HOLIDAY };
export type SearchResult = {
  events: Found[];
  bankHolidays: FoundHoliday[];
  /** Count per category for the chips (after location, dates, demand and date status; before the category filter). */
  counts: Record<string, number>;
  total: number;
  high: number;
  /** Events starting within `thisWeekDays`. */
  thisWeek: Found[];
};

/** "england-and-wales" etc., as GOV.UK groups bank holidays. */
export const holidayNation = (n: City["nation"]) => (n === "scotland" ? "scotland" : n === "northern-ireland" ? "northern-ireland" : "england-and-wales");

export function search(
  data: { events: PublicEvent[]; cities: City[]; bankHolidays: BankHoliday[] },
  q: { center: { latitude: number; longitude: number }; nation: City["nation"]; distance: number; range: DateRange; filters: Filters; today: string },
  s: Pick<Settings, "thisWeekDays">,
): SearchResult {
  const cityBySlug = new Map(data.cities.map((c) => [c.slug, c]));
  const located = data.events
    .filter((e) => isCurrent(e, q.today) && overlaps(e, q.range))
    .map((e) => {
      const c = cityBySlug.get(e.city);
      const point = e.latitude !== null && e.longitude !== null ? { latitude: e.latitude, longitude: e.longitude } : c;
      return { ...e, miles: point ? Math.round(milesBetween(q.center, point)) : Number.POSITIVE_INFINITY };
    })
    .filter((e) => e.miles <= q.distance);
  const byStatus = located.filter((e) => (!q.filters.highOnly || e.demand === "high") && (!q.filters.confirmedOnly || e.dateStatus === "confirmed"));
  const hn = holidayNation(q.nation);
  const holidays = q.filters.highOnly ? [] : data.bankHolidays.filter((b) => b.nations.includes(hn) && b.date >= q.range.from && b.date <= q.range.to && b.date >= q.today);

  const counts: Record<string, number> = {};
  for (const e of byStatus) counts[e.category] = (counts[e.category] ?? 0) + 1;
  counts[BANK_HOLIDAY] = holidays.length;

  const want = new Set(q.filters.categories);
  const events = byStatus.filter((e) => !want.size || want.has(e.category)).sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));
  const bankHolidays = !want.size || want.has(BANK_HOLIDAY) ? holidays.map((b) => ({ ...b, category: BANK_HOLIDAY as typeof BANK_HOLIDAY })) : [];
  const weekEnd = addDays(q.today, s.thisWeekDays);
  return {
    events,
    bankHolidays,
    counts,
    total: events.length,
    high: events.filter((e) => e.demand === "high").length,
    thisWeek: events.filter((e) => e.dateStatus !== "tba" && e.startDate <= weekEnd),
  };
}

/** Events grouped by month of their start date (the list view), in order. */
export function groupByMonth<T extends { startDate: string }>(items: T[]): { month: string; items: T[] }[] {
  const out: { month: string; items: T[] }[] = [];
  for (const it of items) {
    const m = it.startDate.slice(0, 7);
    const g = out[out.length - 1];
    if (g && g.month === m) g.items.push(it);
    else out.push({ month: m, items: [it] });
  }
  return out;
}

/** The month grid: weeks (Monday first) of YYYY-MM-DD, with "" for padding days. */
export function monthGrid(month: string): string[][] {
  const [y, m] = month.split("-").map(Number);
  const first = `${month}-01`;
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = [...Array(lead).fill(""), ...Array.from({ length: daysInMonth(y, m) }, (_, i) => addDays(first, i))];
  while (days.length % 7) days.push("");
  return Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7));
}

/** Events on each day of the grid (multi-day events on every day; TBA events nowhere). */
export function eventsByDay<T extends Pick<PublicEvent, "startDate" | "endDate" | "dateStatus">>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const e of items) for (const d of eventDays(e)) map.set(d, [...(map.get(d) ?? []), e]);
  return map;
}

/** "What this means": 1–2 sentences chosen by the results. */
export function whatThisMeans(r: Pick<SearchResult, "events" | "total">, today: string, s: Pick<Settings, "highDemandSoonDays">): string {
  if (!r.total) return "No big events found for these dates. Quiet periods can suit longer stays: try the Long-stay discount calculator.";
  const main = `${r.total} ${r.total === 1 ? "event" : "events"} could raise demand near you. Star the ones that matter and set reminders, so you can review prices and minimum stays a few weeks before.`;
  const soon = r.events.find((e) => e.demand === "high" && e.dateStatus !== "tba" && e.startDate < addDays(today, s.highDemandSoonDays));
  return soon ? `${main} ${soon.name} is less than a month away. Check your price and availability now.` : main;
}

/**
 * What a typed town means: a covered city (or its alias), an uncovered town
 * we know with the nearest covered city, or unknown.
 */
export function lookupTown(query: string, cities: City[]): { kind: "covered"; city: City } | { kind: "uncovered"; town: City; nearest: { city: City; miles: number } | null } | { kind: "unknown" } {
  const covered = findCity(query, cities);
  if (covered) return { kind: "covered", city: covered };
  const q = normalise(query);
  const town = q ? cities.find((c) => !c.covered && (normalise(c.name) === q || c.aliases.some((a) => normalise(a) === q))) : undefined;
  if (town) return { kind: "uncovered", town, nearest: nearestCity(town, cities) };
  return { kind: "unknown" };
}

/** The public tool's starting values, from the stored settings. */
export function publicDefaults(s: Pick<Settings, "defaultDistance" | "distances" | "defaultRangeDays" | "defaultReminderWeeks">) {
  return { distance: s.distances.includes(s.defaultDistance) ? s.defaultDistance : s.distances[0], range: (s.defaultRangeDays <= 30 ? "next30" : "next90") as RangeKind, reminderWeeks: s.defaultReminderWeeks };
}
