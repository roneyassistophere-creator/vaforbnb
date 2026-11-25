/**
 * Long-stay discount maths. Full precision throughout; rounding happens only
 * for display. Fee, discount and occupancy are decimals (15.5% = 0.155).
 * Neutral by design: it reports what the numbers say, never what to do.
 */

import type { Content } from "./content";

export type Inputs = {
  /** R, £ per night. */
  nightlyRate: number;
  /** N, nights. */
  periodNights: number;
  /** d. */
  discount: number;
  /** occ. */
  occupancy: number;
  /** avg, nights (decimals allowed). */
  averageStay: number;
  /** T, £ per changeover. */
  turnoverCost: number;
  /** f. */
  fee: number;
  /** u, £ per occupied night. */
  runningCost: number;
  /** m. */
  midCleans: number;
  /** c, £ per mid-stay clean. */
  midCleanCost: number;
  /** fL (defaults to f). */
  longFee: number;
  /** The property is in London (imported from the 90-night counter, or ticked). */
  london: boolean;
};

export type Better = "long" | "short" | "same";
export type ThresholdLabel = "weekly" | "monthly" | "tooShort";
export type NoteId = "london90" | "londonCounts" | "tenancy" | "occupancyAboveBreakEven";

export type Result = {
  shortNights: number;
  shortStays: number;
  shortNet: number;
  longNet: number;
  /** longNet − shortNet: positive means the long stay earns more. */
  difference: number;
  better: Better;
  /** Clamped to 0–1. `edge` labels the clamped ends. */
  breakEvenDiscount: { value: number; edge: "none" | "shortAlways" | "longAlways" };
  /** null when short stays lose money at this rate. `edge` labels the special cases. */
  breakEvenOccupancy: { value: number | null; edge: "none" | "shortLoses" | "cannotBeat" };
  /** shortStays − 1, never below 0. */
  turnoversSaved: number;
  guestNightly: number;
  guestTotal: number;
  thresholdLabel: ThresholdLabel;
  /** Discount at or above the stored "highlighted to guests" threshold. */
  highlighted: boolean;
  notes: NoteId[];
  /** Long-stay net at the break-even discount (for the chart line). */
  longNetAtBreakEven: number;
};

/** The long stay's net income at a given discount. */
export function longNetAt(i: Inputs, d: number): number {
  return i.periodNights * i.nightlyRate * (1 - d) * (1 - i.longFee) - i.turnoverCost - i.midCleans * i.midCleanCost - i.periodNights * i.runningCost;
}

export function thresholdFor(nights: number, c: Pick<Content, "weeklyMin" | "monthlyMin">): ThresholdLabel {
  return nights >= c.monthlyMin ? "monthly" : nights >= c.weeklyMin ? "weekly" : "tooShort";
}

export function compareStays(i: Inputs, c: Content): Result {
  const N = i.periodNights;
  const R = i.nightlyRate;
  const shortNights = N * i.occupancy;
  const shortStays = shortNights / i.averageStay;
  const shortNet = shortNights * R * (1 - i.fee) - shortStays * i.turnoverCost - shortNights * i.runningCost;
  const longNet = longNetAt(i, i.discount);
  const difference = longNet - shortNet;
  const better: Better = Math.abs(difference) < c.settings.aboutSameMargin ? "same" : difference > 0 ? "long" : "short";

  const longGross = N * R * (1 - i.longFee);
  const rawBe = longGross > 0 ? 1 - (shortNet + i.turnoverCost + i.midCleans * i.midCleanCost + N * i.runningCost) / longGross : 0;
  const breakEvenDiscount = rawBe <= 0 ? { value: 0, edge: "shortAlways" as const } : rawBe >= 1 ? { value: 1, edge: "longAlways" as const } : { value: rawBe, edge: "none" as const };

  const denom = N * (R * (1 - i.fee) - i.turnoverCost / i.averageStay - i.runningCost);
  const occ = denom > 0 ? longNet / denom : null;
  const breakEvenOccupancy = occ === null ? { value: null, edge: "shortLoses" as const } : occ > 1 ? { value: occ, edge: "cannotBeat" as const } : { value: Math.max(0, occ), edge: "none" as const };

  const notes: NoteId[] = [];
  if (N >= c.londonLongStay) notes.push("london90");
  else if (i.london) notes.push("londonCounts");
  if (N >= c.settings.tenancyNoteMinNights) notes.push("tenancy");
  if (breakEvenOccupancy.edge === "none" && breakEvenOccupancy.value !== null && i.occupancy >= breakEvenOccupancy.value) notes.push("occupancyAboveBreakEven");

  return {
    shortNights,
    shortStays,
    shortNet,
    longNet,
    difference,
    better,
    breakEvenDiscount,
    breakEvenOccupancy,
    turnoversSaved: Math.max(0, shortStays - 1),
    guestNightly: R * (1 - i.discount),
    guestTotal: N * R * (1 - i.discount),
    thresholdLabel: thresholdFor(N, c),
    highlighted: i.discount >= c.highlightMin - 1e-9,
    notes,
    longNetAtBreakEven: longNetAt(i, breakEvenDiscount.value),
  };
}

export type SensitivityRow = { discount: number; longNet: number; difference: number; better: Better; own: boolean };

/** Net income at each stored discount step, plus the host's own discount (highlighted), in order. */
export function sensitivity(i: Inputs, steps: number[], c: Pick<Content, "settings">): SensitivityRow[] {
  const r = compareStays(i, c as Content);
  const ds = [...new Set([...steps.map((s) => s / 100), i.discount].map((d) => Math.round(d * 10000) / 10000))].sort((a, b) => a - b);
  return ds.map((d) => {
    const longNet = longNetAt(i, d);
    const difference = longNet - r.shortNet;
    const better: Better = Math.abs(difference) < c.settings.aboutSameMargin ? "same" : difference > 0 ? "long" : "short";
    return { discount: d, longNet, difference, better, own: Math.abs(d - i.discount) < 1e-9 };
  });
}

/* ---- The form: what the host types, checked into Inputs ------------------------ */

/** Number fields are strings so typing is never blocked; percentages are whole numbers here. */
export type Form = {
  nightlyRate: string;
  periodNights: string;
  discountPercent: string;
  occupancyPercent: string;
  averageStay: string;
  turnoverCost: string;
  feePreset: "airbnb" | "direct" | "custom";
  feePercent: string;
  runningCost: string;
  midCleans: string;
  /** "" = same as the turnover cost. */
  midCleanCost: string;
  /** "" = same as the platform fee. */
  longFeePercent: string;
  london: boolean;
};

export type FieldErrors = Partial<Record<keyof Form, string>>;

export function defaultForm(c: Content): Form {
  const D = c.settings.defaults;
  return {
    nightlyRate: String(D.nightlyRate),
    periodNights: String(D.periodNights),
    discountPercent: String(D.discountPercent),
    occupancyPercent: String(D.occupancyPercent),
    averageStay: String(D.averageStay),
    turnoverCost: String(D.turnoverCost),
    feePreset: "airbnb",
    feePercent: String(+(c.fees.airbnb * 100).toFixed(2)),
    runningCost: "0",
    midCleans: "0",
    midCleanCost: "",
    longFeePercent: "",
    london: false,
  };
}

/** "Try an example": test 1 (rate 100, 28 nights, 60%, 3 nights, £50, fee 15.5%, 20%). */
export const exampleForm = (c: Content): Form => ({ ...defaultForm(c), nightlyRate: "100", periodNights: "28", discountPercent: "20", occupancyPercent: "60", averageStay: "3", turnoverCost: "50", feePreset: "airbnb", feePercent: String(+(c.fees.airbnb * 100).toFixed(2)) });

const MSG = {
  number: "Enter a number.",
  rate: "Enter a nightly rate of at least £1.",
  period: "Enter between 1 and {max} nights.",
  percent: "Enter a percentage from 0 to 100.",
  avg: "Enter an average stay of at least 1 night.",
  money: "Enter £0 or more.",
  cleans: "Enter a whole number from 0 to 30.",
};

const num = (s: string) => {
  const t = s.trim().replace(/[£,%\s]/g, "");
  return t === "" || !/^-?\d*\.?\d+$/.test(t) ? NaN : Number(t);
};

/** Check the form. Returns the inputs (decimals) when valid, and an inline message per bad field. Never NaN. */
export function parseForm(f: Form, c: Content): { inputs: Inputs | null; errors: FieldErrors } {
  const e: FieldErrors = {};
  const rate = num(f.nightlyRate);
  if (!(rate >= 1)) e.nightlyRate = Number.isNaN(rate) ? MSG.number : MSG.rate;
  const n = num(f.periodNights);
  if (!(Number.isInteger(n) && n >= 1 && n <= c.settings.periodMax)) e.periodNights = MSG.period.replace("{max}", String(c.settings.periodMax));
  const pct = (k: "discountPercent" | "occupancyPercent" | "feePercent" | "longFeePercent", optional = false) => {
    if (optional && f[k].trim() === "") return null;
    const v = num(f[k]);
    if (!(v >= 0 && v <= 100)) {
      e[k] = Number.isNaN(v) ? MSG.number : MSG.percent;
      return null;
    }
    return v / 100;
  };
  const d = pct("discountPercent");
  const occ = pct("occupancyPercent");
  const fee = pct("feePercent");
  const longFee = pct("longFeePercent", true);
  const avg = num(f.averageStay);
  if (!(avg >= 1)) e.averageStay = Number.isNaN(avg) ? MSG.number : MSG.avg;
  const money = (k: "turnoverCost" | "runningCost" | "midCleanCost", optional = false) => {
    if (optional && f[k].trim() === "") return null;
    const v = num(f[k]);
    if (!(v >= 0)) {
      e[k] = Number.isNaN(v) ? MSG.number : MSG.money;
      return null;
    }
    return v;
  };
  const T = money("turnoverCost");
  const u = f.runningCost.trim() === "" ? 0 : money("runningCost");
  const c2 = money("midCleanCost", true);
  const m = f.midCleans.trim() === "" ? 0 : num(f.midCleans);
  if (!(Number.isInteger(m) && m >= 0 && m <= 30)) e.midCleans = MSG.cleans;
  if (Object.keys(e).length) return { inputs: null, errors: e };
  return {
    inputs: {
      nightlyRate: rate,
      periodNights: n,
      discount: d!,
      occupancy: occ!,
      averageStay: avg,
      turnoverCost: T!,
      fee: fee!,
      runningCost: u ?? 0,
      midCleans: m,
      midCleanCost: c2 ?? T!,
      longFee: longFee ?? fee!,
      london: f.london,
    },
    errors: {},
  };
}

const str = (v: unknown, max = 12) => (typeof v === "string" ? v.slice(0, max) : typeof v === "number" && Number.isFinite(v) ? String(v) : null);

/** Make a saved (possibly old or edited) form safe to use. */
export function cleanForm(x: unknown, c: Content): Form {
  const d = defaultForm(c);
  if (!x || typeof x !== "object") return d;
  const o = x as Record<string, unknown>;
  const out = { ...d };
  for (const k of ["nightlyRate", "periodNights", "discountPercent", "occupancyPercent", "averageStay", "turnoverCost", "feePercent", "runningCost", "midCleans", "midCleanCost", "longFeePercent"] as const) {
    const v = str(o[k]);
    if (v !== null) out[k] = v;
  }
  out.feePreset = o.feePreset === "direct" || o.feePreset === "custom" ? o.feePreset : "airbnb";
  out.london = o.london === true;
  return out;
}
