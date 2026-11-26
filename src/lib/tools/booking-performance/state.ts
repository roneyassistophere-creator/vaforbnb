import { dayNumber, isValidDate } from "@/lib/tools/dates";
import { blankMonth, type BlockRange, type Booking, type MonthRow, type QuickIn, type Target } from "./calc";
import type { Content } from "./content";

/** Everything for one property, per mode (kept on the device only). */
export type QuickState = QuickIn & { periodKind: "nights" | "dates"; start: string; end: string; compareOn: boolean; lastYear: { nights: number; booked: number; blocked: number; revenue: number } };
export type MonthlyState = { year: number; thisYear: MonthRow[]; lastYear: MonthRow[] };
export type ListState = { start: string; end: string; bookings: Booking[]; blocks: BlockRange[] };
export type BeforeAfterState = { before: QuickIn; after: QuickIn };
export type Property = { id: string; name: string; quick: QuickState; monthly: MonthlyState; list: ListState; targets: Target; ba: BeforeAfterState };
export type Mode = "quick" | "monthly" | "list";
export type Saved = { v: 1; mode: Mode; activeId: string; properties: Property[]; example: boolean };

const emptyQuick = (): QuickIn => ({ nights: 30, booked: 0, blocked: 0, revenue: 0, cleaning: 0, feePercent: 0, bookings: 0 });

export function newProperty(id: string, name: string, c: Content): Property {
  const e = c.examples;
  return {
    id,
    name,
    quick: { ...emptyQuick(), periodKind: "nights", start: e.bookings.start, end: e.bookings.end, compareOn: false, lastYear: { nights: 30, booked: 0, blocked: 0, revenue: 0 } },
    monthly: { year: Number(c.model.versionDate.slice(0, 4)), thisYear: Array.from({ length: 12 }, blankMonth), lastYear: Array.from({ length: 12 }, blankMonth) },
    list: { start: e.bookings.start, end: e.bookings.end, bookings: [], blocks: [] },
    targets: { occupancy: null, adr: null, revpar: null },
    ba: { before: emptyQuick(), after: emptyQuick() },
  };
}

/** Nights in the Quick period: entered, or end − start (the start night counts, the end date doesn’t). */
export function quickInput(q: QuickState): QuickIn {
  const nights = q.periodKind === "dates" ? (isValidDate(q.start) && isValidDate(q.end) ? dayNumber(q.end) - dayNumber(q.start) : Number.NaN) : q.nights;
  return { nights, booked: q.booked, blocked: q.blocked, revenue: q.revenue, cleaning: q.cleaning, feePercent: q.feePercent, bookings: q.bookings };
}

const toRows = (list: number[][]): MonthRow[] => list.map(([blocked, booked, revenue]) => ({ blocked, booked, revenue, cleaning: null }));

/** "Try an example" for one mode (other modes keep their data). */
export function withExample(p: Property, mode: Mode, c: Content): Property {
  const e = c.examples;
  if (mode === "quick")
    return { ...p, quick: { ...p.quick, ...e.quick, periodKind: "nights", compareOn: true, lastYear: { ...e.quick.lastYear } } };
  if (mode === "monthly") {
    const rows = toRows(e.monthly.thisYear).map((r, i) => (i < e.monthly.filledMonths ? r : blankMonth()));
    return { ...p, monthly: { year: e.monthly.year, thisYear: rows, lastYear: toRows(e.monthly.lastYear) } };
  }
  return { ...p, list: { start: e.bookings.start, end: e.bookings.end, bookings: e.bookings.rows.map((b, i) => ({ id: `ex${i}`, ...b })), blocks: [] } };
}

/** Saved data read back from the device, or null if unusable. */
export function restore(raw: unknown, c: Content): Saved | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<Saved>;
  if (s.v !== 1 || !Array.isArray(s.properties) || !s.properties.length) return null;
  const properties = s.properties
    .filter((p): p is Property => !!p && typeof p.id === "string" && typeof p.name === "string")
    .map((p) => {
      const base = newProperty(p.id, p.name, c);
      return {
        ...base,
        ...p,
        quick: { ...base.quick, ...p.quick, lastYear: { ...base.quick.lastYear, ...p.quick?.lastYear } },
        monthly: { ...base.monthly, ...p.monthly, thisYear: p.monthly?.thisYear?.length === 12 ? p.monthly.thisYear : base.monthly.thisYear, lastYear: p.monthly?.lastYear?.length === 12 ? p.monthly.lastYear : base.monthly.lastYear },
        list: { ...base.list, ...p.list, bookings: Array.isArray(p.list?.bookings) ? p.list.bookings : [], blocks: Array.isArray(p.list?.blocks) ? p.list.blocks : [] },
        targets: { ...base.targets, ...p.targets },
        ba: { before: { ...base.ba.before, ...p.ba?.before }, after: { ...base.ba.after, ...p.ba?.after } },
      };
    });
  if (!properties.length) return null;
  const mode: Mode = s.mode === "monthly" || s.mode === "list" ? s.mode : "quick";
  return { v: 1, mode, activeId: properties.some((p) => p.id === s.activeId) ? s.activeId! : properties[0].id, properties, example: s.example === true };
}
