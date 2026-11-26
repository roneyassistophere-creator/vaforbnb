import { addDays, dayNumber, daysInMonth, isValidDate } from "@/lib/tools/dates";
import type { Content } from "./content";

/**
 * Occupancy, ADR and RevPAR: plain functions returning plain data, at full
 * precision. Dates are plain calendar dates (YYYY-MM-DD); a night belongs to
 * its date, so a 5–8 March stay has the nights of 5, 6 and 7 March.
 */

export type QuickIn = { nights: number; booked: number; blocked: number; revenue: number; cleaning: number; feePercent: number; bookings: number };

export type Kpis = {
  periodNights: number;
  blocked: number;
  available: number;
  booked: number;
  revenue: number;
  cleaning: number;
  occupancy: number;
  /** null when nothing was booked (shown as "–"). */
  adr: number | null;
  revpar: number;
  trevpar: number | null;
  netRevpar: number | null;
  alos: number | null;
};

export type Errors = Partial<Record<string, string>>;
const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export function validateQuick(q: QuickIn, prefix = ""): Errors {
  const e: Errors = {};
  const k = (s: string) => prefix + s;
  if (!finite(q.nights) || q.nights < 1 || q.nights > 366 || !Number.isInteger(q.nights)) e[k("nights")] = "Enter the nights in the period: a whole number from 1 to 366.";
  if (!finite(q.blocked) || q.blocked < 0) e[k("blocked")] = "Enter blocked nights of 0 or more.";
  else if (finite(q.nights) && q.blocked > q.nights) e[k("blocked")] = "Blocked nights can’t be more than the nights in the period.";
  if (!finite(q.booked) || q.booked < 0 || !Number.isInteger(q.booked)) e[k("booked")] = "Enter booked nights as a whole number.";
  else if (finite(q.nights) && finite(q.blocked) && q.booked > q.nights - q.blocked) e[k("booked")] = "Booked nights can’t be more than available nights.";
  if (!finite(q.revenue) || q.revenue < 0) e[k("revenue")] = "Revenue can’t be negative.";
  if (!finite(q.cleaning) || q.cleaning < 0) e[k("cleaning")] = "Revenue can’t be negative.";
  if (!finite(q.feePercent) || q.feePercent < 0 || q.feePercent >= 100) e[k("feePercent")] = "Enter a fee from 0% to 99%.";
  if (!finite(q.bookings) || q.bookings < 0) e[k("bookings")] = "Enter bookings of 0 or more.";
  if (finite(q.nights) && finite(q.blocked) && q.nights > 0 && q.blocked === q.nights) e[k("available")] = "Every night is blocked. There’s nothing to measure.";
  return e;
}

/** The three KPIs (and the optional ones) from nights and revenue. */
export function kpis(q: QuickIn): Kpis {
  const available = q.nights - q.blocked;
  const occupancy = available > 0 ? q.booked / available : 0;
  const revpar = available > 0 ? q.revenue / available : 0;
  return {
    periodNights: q.nights,
    blocked: q.blocked,
    available,
    booked: q.booked,
    revenue: q.revenue,
    cleaning: q.cleaning,
    occupancy,
    adr: q.booked > 0 ? q.revenue / q.booked : null,
    revpar,
    trevpar: q.cleaning > 0 && available > 0 ? (q.revenue + q.cleaning) / available : null,
    netRevpar: q.feePercent > 0 ? revpar * (1 - q.feePercent / 100) : null,
    alos: q.bookings > 0 ? q.booked / q.bookings : null,
  };
}

/* ---- Comparisons ---------------------------------------------------------------------- */

export type Change = { abs: number; pct: number | null };
export type Comparison = { occPoints: number; adr: Change | null; revpar: Change };
const change = (now: number, before: number): Change => ({ abs: now - before, pct: before !== 0 ? (now - before) / before : null });

export function compare(now: Kpis, before: Kpis): Comparison {
  return {
    occPoints: (now.occupancy - before.occupancy) * 100,
    adr: now.adr !== null && before.adr !== null ? change(now.adr, before.adr) : null,
    revpar: change(now.revpar, before.revpar),
  };
}

/** ΔRevPAR = Δocc × ADR_before + occ_now × ΔADR (an exact identity). */
export function revparBreakdown(now: Kpis, before: Kpis) {
  const adrB = before.adr ?? 0;
  const adrN = now.adr ?? adrB;
  const occEffect = (now.occupancy - before.occupancy) * adrB;
  const priceEffect = now.occupancy * (adrN - adrB);
  return { occEffect, priceEffect, total: occEffect + priceEffect };
}

export type Target = { occupancy: number | null; adr: number | null; revpar: number | null };
export type TargetGap = { occPoints: number | null; adr: number | null; revpar: number | null; needOcc: { ok: boolean; value: number } | null; needAdr: number | null };

export function vsTarget(k: Kpis, t: Target): TargetGap {
  const needOcc = t.revpar !== null && k.adr ? t.revpar / k.adr : null;
  return {
    occPoints: t.occupancy !== null ? k.occupancy * 100 - t.occupancy : null,
    adr: t.adr !== null && k.adr !== null ? k.adr - t.adr : null,
    revpar: t.revpar !== null ? k.revpar - t.revpar : null,
    needOcc: needOcc !== null ? { ok: needOcc <= 1, value: needOcc } : null,
    needAdr: t.revpar !== null && k.occupancy > 0 ? t.revpar / k.occupancy : null,
  };
}

export type BeforeAfter = { delta: number; pct: number | null; verdict: "worked" | "didnt" | "none" };

export function beforeAfter(before: Kpis, after: Kpis, c: Content): BeforeAfter {
  const delta = after.revpar - before.revpar;
  const pct = before.revpar !== 0 ? delta / before.revpar : null;
  const small = pct !== null ? Math.abs(pct) * 100 < c.model.noChangePercent : Math.abs(delta) < 1e-9;
  return { delta, pct, verdict: small ? "none" : delta > 0 ? "worked" : "didnt" };
}

/* ---- Monthly tracker ----------------------------------------------------------------- */

/** A month row: null = left blank (future months), excluded from totals. */
export type MonthRow = { blocked: number | null; booked: number | null; revenue: number | null; cleaning: number | null };
export const blankMonth = (): MonthRow => ({ blocked: null, booked: null, revenue: null, cleaning: null });
export const isBlank = (r: MonthRow) => r.booked === null && r.revenue === null;

/** Totals from sums, never by averaging percentages. */
export function fromSums(list: Kpis[]): Kpis {
  const s = (k: "periodNights" | "blocked" | "booked" | "revenue" | "cleaning") => list.reduce((t, x) => t + x[k], 0);
  const bookings = list.reduce((t, x) => t + (x.alos ? x.booked / x.alos : 0), 0);
  const fee = list.length && list.every((x) => x.netRevpar !== null && x.revpar > 0) ? 1 - list[0].netRevpar! / list[0].revpar : 0;
  return kpis({ nights: s("periodNights"), blocked: s("blocked"), booked: s("booked"), revenue: s("revenue"), cleaning: s("cleaning"), feePercent: fee * 100, bookings });
}

export function validateMonths(rows: MonthRow[], year: number, prefix = "m"): Errors {
  const e: Errors = {};
  rows.forEach((r, i) => {
    if (isBlank(r)) return;
    const days = daysInMonth(year, i + 1);
    const blocked = r.blocked ?? 0;
    const k = `${prefix}.${i}`;
    if (!finite(blocked) || blocked < 0) e[`${k}.blocked`] = "Enter 0 or more.";
    else if (blocked > days) e[`${k}.blocked`] = "Blocked nights can’t be more than the nights in the period.";
    if (r.booked === null || !finite(r.booked) || r.booked < 0) e[`${k}.booked`] = "Enter booked nights.";
    else if (r.booked > days - blocked) e[`${k}.booked`] = "Booked nights can’t be more than available nights.";
    if (r.revenue !== null && (!finite(r.revenue) || r.revenue < 0)) e[`${k}.revenue`] = "Revenue can’t be negative.";
    if (r.cleaning !== null && (!finite(r.cleaning) || r.cleaning < 0)) e[`${k}.cleaning`] = "Revenue can’t be negative.";
    if (blocked === days) e[`${k}.blocked`] = "Every night is blocked. There’s nothing to measure.";
  });
  return e;
}

export function monthly(rows: MonthRow[], year: number): { months: (Kpis | null)[]; total: Kpis | null; filled: number; partial: boolean } {
  const months = rows.slice(0, 12).map((r, i) => (isBlank(r) ? null : kpis({ nights: daysInMonth(year, i + 1), blocked: r.blocked ?? 0, booked: r.booked ?? 0, revenue: r.revenue ?? 0, cleaning: r.cleaning ?? 0, feePercent: 0, bookings: 0 })));
  const list = months.filter((m): m is Kpis => m !== null);
  return { months, total: list.length ? fromSums(list) : null, filled: list.length, partial: list.length > 0 && list.length < 12 };
}

/** "Paste from spreadsheet": rows of numbers (tab, comma or spaces). Columns: blocked, booked, revenue, [cleaning]. */
export function parseMonthPaste(text: string): { rows: MonthRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: MonthRow[] = [];
  const errors: string[] = [];
  for (const [i, line] of lines.slice(0, 12).entries()) {
    const cells = line.split(/\t|,|;|\s{2,}|\s/).map((x) => x.replace(/[£,]/g, "")).filter((x) => x !== "");
    const nums = cells.map(Number);
    if (cells.length < 3 || nums.some((n) => !Number.isFinite(n))) {
      errors.push(`Row ${i + 1}: expected 3 or 4 numbers (blocked, booked, revenue, cleaning).`);
      rows.push(blankMonth());
      continue;
    }
    rows.push({ blocked: nums[0], booked: nums[1], revenue: nums[2], cleaning: nums.length > 3 ? nums[3] : null });
  }
  while (rows.length < 12) rows.push(blankMonth());
  if (lines.length > 12) errors.push("Only the first 12 rows were used.");
  return { rows, errors };
}

/* ---- Booking list --------------------------------------------------------------------- */

export type Booking = { id: string; checkIn: string; checkOut: string; revenue: number; channel: string; bookedOn: string; cleaning: number };
export type BlockRange = { id: string; from: string; to: string };
export type Period = { start: string; end: string };

export type DayInfo = { kind: "booked" | "blocked" | "gap" | "overlap" | "free"; detail: string };

export type BookingResult = {
  kpis: Kpis;
  alos: number | null;
  leadTime: number | null;
  weekend: { available: number; booked: number; revenue: number; occupancy: number; adr: number | null };
  weekday: { available: number; booked: number; revenue: number; occupancy: number; adr: number | null };
  gaps: { count: number; nights: number; runs: string[][] };
  channelMix: { channel: string; nights: number; revenue: number; nightShare: number; revenueShare: number }[];
  flags: { id: string; message: string }[];
  days: Record<string, DayInfo>;
};

const nightsOf = (from: string, to: string): string[] => {
  const n = dayNumber(to) - dayNumber(from);
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(from, i));
};

export function validateBookings(bookings: Booking[], period: Period, blocks: BlockRange[]): Errors {
  const e: Errors = {};
  if (!isValidDate(period.start) || !isValidDate(period.end)) e.period = "Choose a start and end date.";
  else if (dayNumber(period.end) <= dayNumber(period.start)) e.period = "The end date must be after the start date.";
  for (const b of bookings) {
    if (!isValidDate(b.checkIn) || !isValidDate(b.checkOut)) e[`b.${b.id}`] = "Enter check-in and check-out dates.";
    else if (dayNumber(b.checkOut) <= dayNumber(b.checkIn)) e[`b.${b.id}`] = "Check-out must be after check-in.";
    else if (!finite(b.revenue) || b.revenue < 0 || !finite(b.cleaning) || b.cleaning < 0) e[`b.${b.id}`] = "Revenue can’t be negative.";
  }
  for (const r of blocks) if (!isValidDate(r.from) || !isValidDate(r.to) || dayNumber(r.to) < dayNumber(r.from)) e[`k.${r.id}`] = "The last blocked night must be on or after the first.";
  return e;
}

/** Everything from a booking list (bookings are assumed valid: run validateBookings first). */
export function fromBookings(bookings: Booking[], blocks: BlockRange[], period: Period, c: Content): BookingResult {
  const periodNights = nightsOf(period.start, period.end);
  const inPeriod = new Set(periodNights);
  const blocked = new Set<string>();
  for (const r of blocks) for (const d of nightsOf(r.from, addDays(r.to, 1))) blocked.add(d);
  const allBooked = new Set<string>();
  const nights = new Map<string, { revenue: number; cleaning: number; ids: string[] }>();
  const flags = new Map<string, string>();
  const perChannel = new Map<string, { nights: number; revenue: number }>();
  for (const b of bookings) {
    const ns = nightsOf(b.checkIn, b.checkOut);
    const rate = b.revenue / ns.length;
    const clean = b.cleaning / ns.length;
    for (const d of ns) {
      allBooked.add(d);
      if (!inPeriod.has(d)) continue;
      const cur = nights.get(d) ?? { revenue: 0, cleaning: 0, ids: [] };
      cur.revenue += rate;
      cur.cleaning += clean;
      cur.ids.push(b.id);
      nights.set(d, cur);
      const ch = b.channel.trim() || "Not set";
      const pc = perChannel.get(ch) ?? { nights: 0, revenue: 0 };
      pc.nights += 1;
      pc.revenue += rate;
      perChannel.set(ch, pc);
      if (blocked.has(d)) flags.set(b.id, "Booking overlaps a blocked night");
    }
  }
  for (const v of nights.values()) if (v.ids.length > 1) for (const id of v.ids) flags.set(id, "Possible double booking");

  const blockedInPeriod = periodNights.filter((d) => blocked.has(d) && !nights.has(d)).length;
  const revenue = [...nights.values()].reduce((t, v) => t + v.revenue, 0);
  const cleaning = [...nights.values()].reduce((t, v) => t + v.cleaning, 0);
  const starting = bookings.filter((b) => inPeriod.has(b.checkIn));
  const alos = starting.length ? starting.reduce((t, b) => t + (dayNumber(b.checkOut) - dayNumber(b.checkIn)), 0) / starting.length : null;
  const withLead = starting.filter((b) => isValidDate(b.bookedOn) && dayNumber(b.bookedOn) <= dayNumber(b.checkIn));
  const leadTime = withLead.length ? withLead.reduce((t, b) => t + (dayNumber(b.checkIn) - dayNumber(b.bookedOn)), 0) / withLead.length : null;
  const k = kpis({ nights: periodNights.length, blocked: blockedInPeriod, booked: nights.size, revenue, cleaning, feePercent: 0, bookings: 0 });

  // Weekend vs weekday, each from its own available nights.
  const wk = new Set(c.model.weekendNights);
  const side = { weekend: { available: 0, booked: 0, revenue: 0 }, weekday: { available: 0, booked: 0, revenue: 0 } };
  for (const d of periodNights) {
    if (blocked.has(d) && !nights.has(d)) continue;
    const s = wk.has(new Date(`${d}T12:00:00Z`).getUTCDay()) ? side.weekend : side.weekday;
    s.available += 1;
    const n = nights.get(d);
    if (n) {
      s.booked += 1;
      s.revenue += n.revenue;
    }
  }
  const finish = (s: { available: number; booked: number; revenue: number }) => ({ ...s, occupancy: s.available ? s.booked / s.available : 0, adr: s.booked ? s.revenue / s.booked : null });

  // Gap nights: short unbooked, unblocked runs between two bookings.
  const runs: string[][] = [];
  let run: string[] = [];
  const free = (d: string) => !allBooked.has(d) && !blocked.has(d);
  for (const d of periodNights) {
    if (free(d)) run.push(d);
    else {
      if (run.length) runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  const gapRuns = runs.filter((r) => r.length <= c.model.gapMaxNights && allBooked.has(addDays(r[0], -1)) && allBooked.has(addDays(r[r.length - 1], 1)));

  const days: Record<string, DayInfo> = {};
  const label = (ids: string[]) => ids.map((id) => bookings.find((b) => b.id === id)).filter(Boolean).map((b) => `${b!.checkIn} to ${b!.checkOut}${b!.channel ? ` (${b!.channel})` : ""}`).join("; ");
  for (const d of periodNights) {
    const n = nights.get(d);
    if (n && n.ids.length > 1) days[d] = { kind: "overlap", detail: `Possible double booking: ${label(n.ids)}` };
    else if (n) days[d] = { kind: "booked", detail: `Booked: ${label(n.ids)}${blocked.has(d) ? " (overlaps a blocked night)" : ""}` };
    else if (blocked.has(d)) days[d] = { kind: "blocked", detail: "Blocked by you" };
  }
  for (const r of gapRuns) for (const d of r) days[d] = { kind: "gap", detail: `Gap night (${r.length} ${r.length === 1 ? "night" : "nights"} between bookings)` };

  const totalNights = [...perChannel.values()].reduce((t, v) => t + v.nights, 0);
  const totalRevenue = [...perChannel.values()].reduce((t, v) => t + v.revenue, 0);
  return {
    kpis: { ...k, alos },
    alos,
    leadTime,
    weekend: finish(side.weekend),
    weekday: finish(side.weekday),
    gaps: { count: gapRuns.length, nights: gapRuns.reduce((t, r) => t + r.length, 0), runs: gapRuns },
    channelMix: [...perChannel.entries()].map(([channel, v]) => ({ channel, ...v, nightShare: totalNights ? v.nights / totalNights : 0, revenueShare: totalRevenue ? v.revenue / totalRevenue : 0 })).sort((a, b) => b.revenue - a.revenue),
    flags: [...flags.entries()].map(([id, message]) => ({ id, message })),
    days,
  };
}

/** "Import CSV": check-in, check-out, revenue, channel, booked-on, cleaning. A header row is optional. */
export function previewBookingCsv(rows: string[][], parseDate: (s: string) => string | null): { line: number; booking: Omit<Booking, "id"> | null; errors: string[] }[] {
  const body = rows.length && /check/i.test(rows[0][0] ?? "") ? rows.slice(1) : rows;
  const offset = body === rows ? 1 : 2;
  return body
    .filter((r) => r.some((x) => x.trim()))
    .map((r, i) => {
      const errors: string[] = [];
      const ci = parseDate(r[0] ?? "");
      const co = parseDate(r[1] ?? "");
      const rev = Number((r[2] ?? "").replace(/[£,\s]/g, ""));
      const bookedOn = (r[4] ?? "").trim() ? parseDate(r[4]) : "";
      const cleaning = (r[5] ?? "").trim() ? Number(r[5].replace(/[£,\s]/g, "")) : 0;
      if (!ci) errors.push("Check-in isn’t a date.");
      if (!co) errors.push("Check-out isn’t a date.");
      if (ci && co && dayNumber(co) <= dayNumber(ci)) errors.push("Check-out must be after check-in.");
      if (!Number.isFinite(rev) || (r[2] ?? "").trim() === "") errors.push("Revenue is missing.");
      else if (rev < 0) errors.push("Revenue can’t be negative.");
      if (bookedOn === null) errors.push("Booked-on isn’t a date.");
      if (!Number.isFinite(cleaning) || cleaning < 0) errors.push("Cleaning fee isn’t a valid amount.");
      return { line: i + offset, booking: errors.length ? null : { checkIn: ci!, checkOut: co!, revenue: rev, channel: (r[3] ?? "").trim(), bookedOn: bookedOn || "", cleaning }, errors };
    });
}

/* ---- Portfolio ------------------------------------------------------------------------ */

export function portfolio(list: { id: string; name: string; kpis: Kpis }[]) {
  const rows = [...list].sort((a, b) => b.kpis.revpar - a.kpis.revpar);
  return { rows, total: list.length ? fromSums(list.map((x) => x.kpis)) : null };
}
