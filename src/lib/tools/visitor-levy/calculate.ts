import { addDays, formatLong, isValidDate } from "../dates";
import { numberFigure, type Figures } from "../figures";
import { formatPence, rateText, type Area } from "./areas";

export type PriceMode = "same" | "byNight";
export type Accommodation = "standard" | "lower";

/** What the host types. Prices are text so half-typed values never become NaN. */
export type LevyInputs = {
  checkIn: string;
  nights: string;
  priceMode: PriceMode;
  price: string;
  /** By-night prices, one per chargeable night, in order. */
  prices: string[];
  includesVat: boolean;
  fees: string;
  bookedPaidBefore: boolean;
  guests: string;
  accommodation: Accommodation;
};

export const emptyInputs = (): LevyInputs => ({
  checkIn: "",
  nights: "1",
  priceMode: "same",
  price: "",
  prices: [],
  includesVat: false,
  fees: "",
  bookedPaidBefore: false,
  guests: "2",
  accommodation: "standard",
});

export const MAX_NIGHTS = 365;
export const MAX_GUESTS = 30;

/* ---- Money and rounding --------------------------------------------- */

/** a ÷ b rounded to the nearest whole number, half up (a ≥ 0, b > 0, integers). */
export const divRound = (a: number, b: number) => Math.floor((2 * a + b) / (2 * b));

/** "£1,200.50" / "150" → pence; "" → null; anything else → NaN. */
export function parsePounds(s: string): number | null {
  const t = s.replace(/[£,\s]/g, "");
  if (t === "") return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(t)) return NaN;
  const [whole, frac = ""] = t.replace("-", "").split(".");
  const p = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return t.startsWith("-") ? -p : p;
}

/** Remove VAT: price ÷ (1 + rate), in pence, rounded to the penny. */
export const exVat = (pricePence: number, vatPercent: number) => {
  const bp = Math.round(vatPercent * 100);
  return divRound(pricePence * 10000, 10000 + bp);
};

/* ---- Nights --------------------------------------------------------- */

/** The night dates of a stay: check-in 1 Aug for 7 nights → 1–7 Aug (checks out 8 Aug). */
export function stayNights(checkIn: string, nights: number): string[] {
  return Array.from({ length: nights }, (_, i) => addDays(checkIn, i));
}

export type NightStatus = "charged" | "capped" | "notInForce" | "exempt";
export type Night = { date: string; status: NightStatus; levyPence: number | null };

/**
 * The nights that can be charged: on or after the area's start date, then the
 * first [cap] of those (percent areas) or the first [maxNightsCharged]
 * (per-person areas, once confirmed).
 */
export function chargeableNights(area: Area, nights: string[]): { inForce: string[]; chargeable: string[]; notInForce: string[] } {
  const inForce = nights.filter((d) => d >= area.start);
  const notInForce = nights.filter((d) => d < area.start);
  const cap = area.type === "percent" ? area.nightCap : area.maxNightsCharged;
  return { inForce, chargeable: cap ? inForce.slice(0, cap) : inForce, notInForce };
}

/* ---- Result --------------------------------------------------------- */

export type LevyStatus = "inForce" | "partly" | "notInForce" | "exempt";

export type LevyErrors = Partial<Record<"checkIn" | "nights" | "price" | "prices" | "fees" | "guests", string>>;

export type LevyResult = {
  totalPence: number;
  perNightPence: number;
  nights: Night[];
  chargeable: string[];
  notInForce: string[];
  status: LevyStatus;
  /** Nights after the cap. */
  capped: boolean;
  exemptReason: string | null;
  notes: string[];
  lines: string[];
  /** Accommodation price for the whole stay (incl. fees), when every night's price is known. */
  stayPricePence: number | null;
};

export type Calc = { ok: true; result: LevyResult; missing: [] } | { ok: false; errors: LevyErrors; missing: string[] };

const plural = (n: number, w: string) => `${n} ${n === 1 ? w : `${w}s`}`;
const intIn = (s: string, min: number, max: number) => {
  const n = Number(s);
  return s.trim() !== "" && Number.isInteger(n) && n >= min && n <= max ? n : null;
};

export const FEES_NOTE = "We haven’t included fees. Check your council’s guidance on whether they count.";

/** The levy for one stay. Pure: dates are calendar dates, money is whole pence. */
export function calculateLevy(area: Area, inputs: LevyInputs, figures: Figures): Calc {
  const errors: LevyErrors = {};
  const missing: string[] = [];

  if (!inputs.checkIn) missing.push("the check-in date");
  else if (!isValidDate(inputs.checkIn)) errors.checkIn = "Enter a real date as DD/MM/YYYY.";

  const nightsN = intIn(inputs.nights, 1, MAX_NIGHTS);
  if (inputs.nights.trim() === "") missing.push("the number of nights");
  else if (nightsN === null) errors.nights = `Enter a whole number of nights from 1 to ${MAX_NIGHTS}.`;

  let guestsN = 0;
  if (area.type === "perPersonNight") {
    const g = intIn(inputs.guests, 1, MAX_GUESTS);
    if (inputs.guests.trim() === "") missing.push("the number of guests");
    else if (g === null) errors.guests = `Enter a whole number of guests from 1 to ${MAX_GUESTS}.`;
    else guestsN = g;
  }

  // Percent areas: prices.
  const vat = numberFigure(figures, "vat.standardRate");
  const toExVat = (p: number) => (inputs.includesVat ? exVat(p, vat) : p);
  let feesPence = 0;
  if (area.type === "percent") {
    const fees = parsePounds(inputs.fees);
    if (fees !== null && (Number.isNaN(fees) || fees < 0)) errors.fees = "Enter fees of £0 or more, or leave it empty.";
    else if (fees) feesPence = fees;
  }

  if (missing.length || Object.keys(errors).length || nightsN === null || !isValidDate(inputs.checkIn)) {
    // Check the price fields too, so every problem shows at once.
    if (area.type === "percent" && inputs.priceMode === "same") {
      const p = parsePounds(inputs.price);
      if (p === null) missing.push("the price per night");
      else if (Number.isNaN(p) || p < 0) errors.price = "Enter a price of £0 or more.";
    }
    return { ok: false, errors, missing };
  }

  const all = stayNights(inputs.checkIn, nightsN);
  const { inForce, chargeable, notInForce } = chargeableNights(area, all);
  const exempt = !!area.exemptBookedPaidBefore && inputs.bookedPaidBefore && inForce.length > 0;

  // Prices for each chargeable night (percent areas).
  let nightPrices: number[] = [];
  let samePrice: number | null = null;
  if (area.type === "percent") {
    if (inputs.priceMode === "same") {
      const p = parsePounds(inputs.price);
      if (p === null) missing.push("the price per night");
      else if (Number.isNaN(p) || p < 0) errors.price = "Enter a price of £0 or more.";
      else samePrice = p;
      if (samePrice !== null) nightPrices = chargeable.map(() => samePrice!);
    } else {
      const parsed = chargeable.map((_, i) => parsePounds(inputs.prices[i] ?? ""));
      if (parsed.some((p) => p !== null && (Number.isNaN(p) || p < 0))) errors.prices = "Enter each price as £0 or more.";
      else if (parsed.some((p) => p === null)) missing.push(chargeable.length === 1 ? "the night’s price" : "a price for each night");
      else nightPrices = parsed as number[];
    }
    if (missing.length || Object.keys(errors).length) return { ok: false, errors, missing };
  }

  const notes: string[] = [];
  const lines: string[] = [];
  const nightsOut: Night[] = [];
  let total = 0;
  const capped = inForce.length > chargeable.length;

  if (exempt) {
    for (const d of all) nightsOut.push({ date: d, status: d < area.start ? "notInForce" : "exempt", levyPence: null });
  } else if (area.type === "percent") {
    const exPrices = nightPrices.map(toExVat);
    const sum = exPrices.reduce((a, b) => a + b, 0);
    const feesEx = toExVat(feesPence);
    const useFees = area.feesIncluded && feesEx > 0 && chargeable.length > 0;
    // Round once at the end: (sum × rate × nights + fees × chargeable × rate) ÷ (10000 × nights).
    total = divRound(sum * area.rate * all.length + (useFees ? feesEx * chargeable.length * area.rate : 0), 10000 * all.length);

    if (inputs.includesVat && samePrice !== null) notes.push(`Price excluding VAT: ${formatPence(toExVat(samePrice))}`);
    if (inputs.includesVat && samePrice === null) notes.push(`Prices excluding VAT, at ${vat}% VAT.`);
    if (chargeable.length) {
      if (samePrice !== null)
        lines.push(`${plural(chargeable.length, "night")} × ${formatPence(toExVat(samePrice))} × ${rateText(area)} = ${formatPence(divRound(sum * area.rate, 10000))}`);
      else lines.push(`${formatPence(sum)} across ${plural(chargeable.length, "night")} × ${rateText(area)} = ${formatPence(divRound(sum * area.rate, 10000))}`);
    }
    if (useFees) {
      lines.push(
        `Fees ${formatPence(feesEx)} × ${chargeable.length}/${all.length} nights × ${rateText(area)} = ${formatPence(divRound(feesEx * chargeable.length * area.rate, all.length * 10000))} (fees split evenly across nights)`,
      );
    } else if (feesPence > 0) notes.push(FEES_NOTE);

    const byDate = new Map(chargeable.map((d, i) => [d, divRound(exPrices[i] * area.rate, 10000)]));
    for (const d of all) {
      if (d < area.start) nightsOut.push({ date: d, status: "notInForce", levyPence: null });
      else if (byDate.has(d)) nightsOut.push({ date: d, status: "charged", levyPence: byDate.get(d)! });
      else nightsOut.push({ date: d, status: "capped", levyPence: null });
    }
  } else {
    const rate = inputs.accommodation === "lower" && area.lowerRate !== null ? area.lowerRate : area.rate;
    total = chargeable.length * guestsN * rate;
    if (chargeable.length) lines.push(`${plural(chargeable.length, "night")} × ${plural(guestsN, "guest")} × ${formatPence(rate)} = ${formatPence(total)}`);
    const set = new Set(chargeable);
    for (const d of all) nightsOut.push({ date: d, status: d < area.start ? "notInForce" : set.has(d) ? "charged" : "capped", levyPence: set.has(d) ? guestsN * rate : null });
  }

  const status: LevyStatus = exempt ? "exempt" : inForce.length === 0 ? "notInForce" : notInForce.length > 0 ? "partly" : "inForce";
  const exemptReason = exempt ? `Exempt: booked and paid before ${formatLong(area.exemptBookedPaidBefore!)}` : null;
  if (status === "notInForce") notes.push(`Not in force yet for these dates. ${area.name}’s levy starts ${formatLong(area.start)}.`);

  // Whole-stay price, when every night's price is known (same price for every night).
  const stayPricePence = area.type === "percent" && samePrice !== null ? samePrice * all.length + feesPence : null;

  return {
    ok: true,
    missing: [],
    result: {
      totalPence: total,
      perNightPence: divRound(total, all.length),
      nights: nightsOut,
      chargeable: exempt ? [] : chargeable,
      notInForce,
      status,
      capped: !exempt && capped,
      exemptReason,
      notes,
      lines,
      stayPricePence,
    },
  };
}

/** Words for the status pill. */
export function statusText(r: LevyResult): string {
  if (r.status === "exempt") return "Exempt";
  if (r.status === "notInForce") return "Not in force yet";
  if (r.status === "partly") return `Partly in force: ${r.nights.length - r.notInForce.length} of ${r.nights.length} nights`;
  return "In force";
}
