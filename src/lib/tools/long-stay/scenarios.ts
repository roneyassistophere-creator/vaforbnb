/**
 * Saved scenarios, the copyable result, "What this means" and imports from
 * the shared device format. Everything stays on the visitor's device.
 */

import { formatDate } from "@/lib/tools/figures";
import { money, percent } from "@/lib/tools/format";
import { compareStays, parseForm, type Better, type Form, type Inputs, type Result } from "./calc";
import type { Content } from "./content";

export type Scenario = {
  id: string;
  name: string;
  savedAt: string;
  form: Form;
  /** Key results when saved (recomputed from `form` when shown, so stored figures stay current). */
  summary: { shortNet: number; longNet: number; difference: number; better: Better; breakEvenDiscount: number };
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Save a scenario (newest last). When the list is full, the oldest drops off. */
export function addScenario(list: Scenario[], name: string, form: Form, c: Content, now: Date = new Date()): Scenario[] {
  const { inputs } = parseForm(form, c);
  if (!inputs) return list;
  const r = compareStays(inputs, c);
  const s: Scenario = {
    id: `s-${now.getTime().toString(36)}-${list.length}`,
    name: name.trim().slice(0, 40) || `Scenario ${list.length + 1}`,
    savedAt: now.toISOString(),
    form: { ...form },
    summary: { shortNet: r.shortNet, longNet: r.longNet, difference: r.difference, better: r.better, breakEvenDiscount: r.breakEvenDiscount.value },
  };
  return [...list, s].slice(-c.settings.maxScenarios);
}

export const removeScenario = (list: Scenario[], id: string) => list.filter((s) => s.id !== id);

/** Make saved scenarios safe to use (drops anything malformed). */
export function cleanScenarios(x: unknown, c: Content, clean: (f: unknown) => Form): Scenario[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter(isObj)
    .map((s) => {
      const form = clean(s.form);
      const { inputs } = parseForm(form, c);
      if (!inputs || typeof s.id !== "string") return null;
      const r = compareStays(inputs, c);
      return {
        id: s.id.slice(0, 40),
        name: typeof s.name === "string" ? s.name.slice(0, 40) : "Scenario",
        savedAt: typeof s.savedAt === "string" ? s.savedAt : "",
        form,
        summary: { shortNet: r.shortNet, longNet: r.longNet, difference: r.difference, better: r.better, breakEvenDiscount: r.breakEvenDiscount.value },
      } satisfies Scenario;
    })
    .filter((s): s is Scenario => !!s)
    .slice(-c.settings.maxScenarios);
}

/** The headline: "Long stay earns £703 more", "Short stays earn £57 more", "About the same". */
export function headline(r: Pick<Result, "better" | "difference">): string {
  if (r.better === "same") return "About the same";
  return r.better === "long" ? `Long stay earns ${money(r.difference, 0)} more` : `Short stays earn ${money(-r.difference, 0)} more`;
}

/** "What this means": 2–3 sentences chosen by the result, always "On these numbers…". */
export function whatThisMeans(r: Result, inKit: boolean): string {
  const be = (r.breakEvenDiscount.value * 100).toFixed(1);
  let s: string;
  if (r.better === "long") s = `On these numbers, one long stay earns ${money(r.difference, 0)} more and saves about ${Math.round(r.turnoversSaved)} turnovers. A discount up to ${be}% would still beat short stays.`;
  else if (r.better === "short") {
    const occ = r.breakEvenOccupancy.value === null ? "" : ` or short-stay occupancy is under ${(Math.min(1, r.breakEvenOccupancy.value) * 100).toFixed(1)}%`;
    s = `On these numbers, short stays earn ${money(-r.difference, 0)} more. A long stay only wins if your discount is below ${be}%${occ}.`;
  } else s = "It’s close. A long stay gives you steadier income and fewer turnovers for about the same money.";
  return inKit ? `${s} That’s your Get more bookings kit done.` : s;
}

/** "Break-even discount: 49.7%. …" line, with the clamped edges in words. */
export function breakEvenDiscountText(r: Result): string {
  if (r.breakEvenDiscount.edge === "shortAlways") return "Short stays earn more even with no discount.";
  if (r.breakEvenDiscount.edge === "longAlways") return "A long stay earns more at any discount.";
  return `Break-even discount: ${percent(r.breakEvenDiscount.value)}. You could discount up to this and still match short stays.`;
}

export function breakEvenOccupancyText(r: Result): string {
  if (r.breakEvenOccupancy.edge === "shortLoses") return "Short stays lose money at this rate, so any long stay beats them.";
  if (r.breakEvenOccupancy.edge === "cannotBeat") return "Short stays can’t beat this long stay, even fully booked.";
  return `Short stays would need ${percent(r.breakEvenOccupancy.value ?? 0)} occupancy to beat this discount.`;
}

export function turnoversText(r: Result): string {
  return r.turnoversSaved <= 0 ? "Turnovers saved: none." : `Turnovers saved: ${r.turnoversSaved.toFixed(1)} (about ${Math.round(r.turnoversSaved)} fewer cleans)`;
}

/** "Copy result": the inputs, both nets, the difference, the break-even figures, the date and the disclaimer. */
export function resultText(i: Inputs, r: Result, c: Content, disclaimer: string): string {
  return [
    "Long-stay discount check (VA for BnB)",
    "",
    `Nightly rate: ${money(i.nightlyRate)} · Period: ${i.periodNights} nights · Discount: ${percent(i.discount)}`,
    `Short-stay occupancy: ${percent(i.occupancy)} · Average stay: ${i.averageStay} nights · Turnover: ${money(i.turnoverCost)} · Platform fee: ${percent(i.fee)}`,
    ...(i.runningCost || i.midCleans || i.longFee !== i.fee ? [`Running cost: ${money(i.runningCost)} a night · Mid-stay cleans: ${i.midCleans} at ${money(i.midCleanCost)} · Long-stay fee: ${percent(i.longFee)}`] : []),
    "",
    `Short stays: ${r.shortNights.toFixed(1)} nights, ${r.shortStays.toFixed(1)} stays, net ${money(r.shortNet)}`,
    `One long stay: ${i.periodNights} nights at ${money(r.guestNightly)} a night, net ${money(r.longNet)}`,
    `${headline(r)} (difference ${money(r.difference)})`,
    breakEvenDiscountText(r),
    breakEvenOccupancyText(r),
    turnoversText(r),
    "",
    c.lastChecked ? `Figures last checked ${formatDate(c.lastChecked)}.` : "",
    disclaimer,
  ]
    .filter((l, n, a) => !(l === "" && a[n - 1] === ""))
    .join("\n")
    .trim();
}

/* ---- Imports ------------------------------------------------------------------ */

/** The nightly rate from the Short-let profit calculator's hand-off ("profit-inputs"), if any. */
export function rateFromProfit(data: unknown): number | null {
  if (!isObj(data)) return null;
  const r = data.nightlyRate;
  return typeof r === "number" && Number.isFinite(r) && r >= 1 ? Math.round(r * 100) / 100 : null;
}

/** Everything the long-stay form can take from the profit calculator's hand-off: rate, turnover cost, platform fee, occupancy and stay. */
export function formFromProfit(data: unknown): Partial<Record<"nightlyRate" | "turnoverCost" | "feePercent" | "occupancyPercent" | "averageStay", string>> {
  if (!isObj(data)) return {};
  const out: Partial<Record<"nightlyRate" | "turnoverCost" | "feePercent" | "occupancyPercent" | "averageStay", string>> = {};
  const rate = rateFromProfit(data);
  if (rate !== null) out.nightlyRate = String(rate);
  const ok = (v: unknown, lo: number, hi: number) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
  const r2 = (v: number) => String(Math.round(v * 100) / 100);
  if (ok(data.turnoverCost, 0, 10000)) out.turnoverCost = r2(data.turnoverCost as number);
  if (ok(data.platformFeePercent, 0, 100)) out.feePercent = r2(data.platformFeePercent as number);
  if (ok(data.occupancyPercent, 0, 100)) out.occupancyPercent = r2(data.occupancyPercent as number);
  if (ok(data.averageStay, 1, 365)) out.averageStay = r2(data.averageStay as number);
  return out;
}

/** The London flag from the London 90-night counter's hand-off ("london-flag"). */
export const londonFromCounter = (data: unknown): boolean => isObj(data) && data.london === true;
