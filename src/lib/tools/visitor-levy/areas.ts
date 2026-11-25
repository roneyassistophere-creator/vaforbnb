import { isValidDate } from "../dates";
import type { Figures } from "../figures";

/**
 * Levy areas, read from stored figures (`levy.calc.<id>`). Adding a row adds
 * an area: no code change, as long as it's a "percent" or "perPersonNight" levy.
 */

export type LevyType = "percent" | "perPersonNight";
export type LevyNation = "scotland" | "wales" | "england";

export type Area = {
  id: string;
  name: string;
  nation: LevyNation;
  order: number;
  type: LevyType;
  /** Percent areas: basis points (5% = 500). Per-person areas: pence. */
  rate: number;
  /** Per-person areas: pence for hostels and campsites (null if none). */
  lowerRate: number | null;
  /** Nights charged per stay ("first 5 nights"); null = no cap. */
  nightCap: number | null;
  start: string;
  /** Exempt if booked and paid before this date (null = no such exemption). */
  exemptBookedPaidBefore: string | null;
  feesIncluded: boolean;
  /** Per-person areas: most nights charged per stay, once confirmed (null = none). */
  maxNightsCharged: number | null;
  url: string | null;
  sourceTitle: string;
  lastChecked: string;
  verify: boolean;
};

const PREFIX = "levy.calc.";

/** "5" → 500, "3.5" → 350. */
const basisPoints = (s: string) => Math.round(Number(s) * 100);
/** "1.30" → 130. */
const pence = (s: string) => Math.round(Number(s) * 100);
const posInt = (s: string | undefined) => {
  const n = Number(s);
  return s && s.trim() !== "" && Number.isInteger(n) && n > 0 ? n : null;
};

/** One area from its stored row, or null if the row is incomplete (so a bad edit can't break the page). */
export function parseArea(id: string, figures: Figures): Area | null {
  const f = figures[PREFIX + id];
  const v = f?.value;
  if (!f || !v || typeof v !== "object" || Array.isArray(v)) return null;
  const r = v as Record<string, string>;
  const type = r.type === "percent" || r.type === "perPersonNight" ? r.type : null;
  const nation = r.nation === "scotland" || r.nation === "wales" || r.nation === "england" ? r.nation : null;
  const rateOk = r.rate && Number.isFinite(Number(r.rate)) && Number(r.rate) > 0;
  if (!type || !nation || !r.name || !rateOk || !isValidDate(r.start)) return null;
  return {
    id,
    name: r.name,
    nation,
    order: Number(r.order) || 99,
    type,
    rate: type === "percent" ? basisPoints(r.rate) : pence(r.rate),
    lowerRate: type === "perPersonNight" && r.lowerRate && Number(r.lowerRate) > 0 ? pence(r.lowerRate) : null,
    nightCap: posInt(r.nightCap),
    start: r.start,
    exemptBookedPaidBefore: isValidDate(r.exemptBookedPaidBefore) ? r.exemptBookedPaidBefore : null,
    feesIncluded: r.feesIncluded === "yes",
    maxNightsCharged: posInt(r.maxNightsCharged),
    url: r.url || null,
    sourceTitle: f.sourceTitle,
    lastChecked: f.lastChecked,
    verify: f.verify,
  };
}

/** Every area with stored figures, in display order. */
export function listAreas(figures: Figures): Area[] {
  return Object.keys(figures)
    .filter((k) => k.startsWith(PREFIX))
    .map((k) => parseArea(k.slice(PREFIX.length), figures))
    .filter((a): a is Area => a !== null)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/** Choices with no stored levy: they show a message instead of the calculator. */
export const otherChoices = [
  { id: "scotland-other", name: "Another Scottish council", nation: "scotland" as const },
  { id: "wales-other", name: "Another Welsh council", nation: "wales" as const },
  { id: "england", name: "England (no levies in force yet)", nation: "england" as const },
];

export const nationNames: Record<LevyNation, string> = { scotland: "Scotland", wales: "Wales", england: "England" };

/** "5%", "£1.30" */
export const rateText = (a: Area, lower = false) =>
  a.type === "percent" ? `${a.rate / 100}%` : formatPence(lower && a.lowerRate !== null ? a.lowerRate : a.rate);

/** Short form for chips: "5% · first 5 nights", "£1.30 per person per night". */
export function rateShort(a: Area): string {
  if (a.type === "percent") return `${rateText(a)}${a.nightCap ? ` · first ${a.nightCap} nights` : ""}`;
  return `${rateText(a)} per person per night`;
}

/** "£1,234.50" from pence. */
export function formatPence(p: number): string {
  const sign = p < 0 ? "-" : "";
  const abs = Math.abs(p);
  return `${sign}£${Math.floor(abs / 100).toLocaleString("en-GB")}.${String(abs % 100).padStart(2, "0")}`;
}

export type Choice = { kind: "area"; area: Area } | { kind: "other"; id: string; name: string } | { kind: "unknown" };

/** What a choice (or a ?area= value) means: an area to calculate, a "no levy data" choice, or unknown. */
export function resolveChoice(id: string | null | undefined, figures: Figures): Choice {
  if (!id) return { kind: "unknown" };
  const area = parseArea(id, figures);
  if (area) return { kind: "area", area };
  const other = otherChoices.find((o) => o.id === id);
  return other ? { kind: "other", id: other.id, name: other.name } : { kind: "unknown" };
}

/** Which input groups an area needs. */
export const fieldsFor = (a: Area) =>
  a.type === "percent"
    ? { price: true, vat: true, fees: true, exemption: a.exemptBookedPaidBefore !== null, guests: false, accommodation: false }
    : { price: false, vat: false, fees: false, exemption: a.exemptBookedPaidBefore !== null, guests: true, accommodation: a.lowerRate !== null };
