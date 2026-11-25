import { isValidDate } from "../dates";
import { emptyInputs, type LevyInputs } from "./calculate";

/** One saved stay in the levy log (this device only). */
export type LogEntry = {
  id: string;
  reference: string;
  areaId: string;
  areaName: string;
  checkIn: string;
  nights: number;
  /** Per-person areas only. */
  guests: number | null;
  chargeableNights: number;
  levyPence: number;
  /** The inputs, so the stay can be opened again to edit. */
  inputs: LevyInputs;
};

export type Store = { version: 1; areaId: string; inputs: LevyInputs; log: LogEntry[]; logOpen: boolean };

export const emptyStore = (areaId = "edinburgh"): Store => ({ version: 1, areaId, inputs: emptyInputs(), log: [], logOpen: false });

let counter = 0;
export const newId = () => `s${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QUARTERS = ["Jan–Mar", "Apr–Jun", "Jul–Sep", "Oct–Dec"];

export type Total = { key: string; label: string; stays: number; levyPence: number };

/** Totals by month and by quarter, grouped by check-in date, oldest first. */
export function logTotals(entries: LogEntry[]): { months: Total[]; quarters: Total[] } {
  const add = (map: Map<string, Total>, key: string, label: string, e: LogEntry) => {
    const t = map.get(key) ?? { key, label, stays: 0, levyPence: 0 };
    t.stays += 1;
    t.levyPence += e.levyPence;
    map.set(key, t);
  };
  const months = new Map<string, Total>();
  const quarters = new Map<string, Total>();
  for (const e of entries) {
    const [y, m] = e.checkIn.split("-").map(Number);
    add(months, `${y}-${String(m).padStart(2, "0")}`, `${MONTHS[m - 1]} ${y}`, e);
    const q = Math.floor((m - 1) / 3);
    add(quarters, `${y}-Q${q + 1}`, `${QUARTERS[q]} ${y}`, e);
  }
  const sorted = (m: Map<string, Total>) => [...m.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
  return { months: sorted(months), quarters: sorted(quarters) };
}

const csvCell = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** CSV: reference, area, check-in, nights, guests, chargeable nights, levy (£). */
export function logCsv(entries: LogEntry[]): string {
  const head = ["Reference", "Area", "Check-in", "Nights", "Guests", "Chargeable nights", "Levy (£)"];
  const rows = entries.map((e) => [
    e.reference,
    e.areaName,
    e.checkIn,
    String(e.nights),
    e.guests === null ? "" : String(e.guests),
    String(e.chargeableNights),
    `${Math.floor(e.levyPence / 100)}.${String(e.levyPence % 100).padStart(2, "0")}`,
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/* ---- Reading saved data safely ----------------------------------------- */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

function cleanInputs(x: unknown): LevyInputs {
  const base = emptyInputs();
  if (!x || typeof x !== "object") return base;
  const o = x as Record<string, unknown>;
  return {
    checkIn: isValidDate(o.checkIn as string) ? (o.checkIn as string) : "",
    nights: str(o.nights, 4) || base.nights,
    priceMode: o.priceMode === "byNight" ? "byNight" : "same",
    price: str(o.price, 12),
    prices: Array.isArray(o.prices) ? o.prices.slice(0, 365).map((p) => str(p, 12)) : [],
    includesVat: o.includesVat === true,
    fees: str(o.fees, 12),
    bookedPaidBefore: o.bookedPaidBefore === true,
    guests: str(o.guests, 3) || base.guests,
    accommodation: o.accommodation === "lower" ? "lower" : "standard",
  };
}

function cleanEntry(x: unknown): LogEntry | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null);
  if (typeof o.id !== "string" || typeof o.areaId !== "string" || !isValidDate(o.checkIn as string)) return null;
  const nights = num(o.nights);
  const chargeable = num(o.chargeableNights);
  const levy = num(o.levyPence);
  if (!nights || chargeable === null || levy === null) return null;
  return {
    id: o.id.slice(0, 64),
    reference: str(o.reference, 80),
    areaId: o.areaId.slice(0, 64),
    areaName: str(o.areaName, 80) || o.areaId,
    checkIn: o.checkIn as string,
    nights,
    guests: num(o.guests),
    chargeableNights: chargeable,
    levyPence: levy,
    inputs: cleanInputs(o.inputs),
  };
}

/** Turn saved JSON into a valid store, or null. */
export function cleanStore(x: unknown): Store | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  return {
    version: 1,
    areaId: typeof o.areaId === "string" ? o.areaId.slice(0, 64) : "edinburgh",
    inputs: cleanInputs(o.inputs),
    log: Array.isArray(o.log) ? (o.log.map(cleanEntry).filter(Boolean) as LogEntry[]).slice(0, 2000) : [],
    logOpen: o.logOpen === true,
  };
}
