import type { Result } from "./calc";
import type { Content } from "./content";
import type { Inputs } from "./inputs";

/**
 * Tax ESTIMATE for individual owners (annual). Mortgage interest isn't a
 * deduction for residential lets: it's added back, then a basic-rate finance
 * cost credit is taken off the tax. Personal allowance and other income are
 * not included.
 */
export type TaxColumn = {
  id: "current" | "from2027";
  label: string;
  bandRate: number;
  creditRate: number;
  taxAtBand: number;
  credit: number;
  tax: number;
  afterTaxProfit: number;
  afterTaxCash: number;
};

export type RentARoom = { threshold: number; receipts: number } & ({ kind: "taxFree" } | { kind: "compare"; rentARoomTaxable: number; normalTaxable: number; better: "rentARoom" | "normal" });

export type TaxEstimate =
  | { available: false; reason: string }
  | {
      available: true;
      share: number;
      annualInterest: number;
      taxable: number;
      bandLabel: string;
      columns: TaxColumn[];
      /** Scotland: no 2027 column yet. */
      note2027: string | null;
      rentARoom: RentARoom | null;
    };

export const UK_BANDS = [
  { id: "basic", label: "Basic rate" },
  { id: "higher", label: "Higher rate" },
  { id: "additional", label: "Additional rate" },
] as const;

export function bandsFor(nation: Inputs["tax"]["nation"], c: Content): { id: string; label: string }[] {
  return nation === "scotland" ? c.scotland.bands.map((b) => ({ id: b.id, label: `${b.label} rate` })) : [...UK_BANDS];
}

export function taxEstimate(inp: Inputs, r: Result, c: Content): TaxEstimate {
  const t = inp.tax;
  if (t.ownership === "company") return { available: false, reason: "Tax estimate not available for companies in this tool." };
  const share = t.ownership === "joint" ? 0.5 : 1;
  const annualInterest = r.fixed.interest * 12;
  const taxable = Math.max(0, (r.annual.profit + annualInterest) * share);
  const interestShare = annualInterest * share;
  const col = (id: TaxColumn["id"], label: string, bandRate: number, creditRate: number): TaxColumn => {
    const taxAtBand = taxable * bandRate;
    const credit = creditRate * Math.min(interestShare, taxable);
    const tax = Math.max(0, taxAtBand - credit);
    return { id, label, bandRate, creditRate, taxAtBand, credit, tax, afterTaxProfit: r.annual.profit * share - tax, afterTaxCash: r.annual.cash * share - tax };
  };
  let columns: TaxColumn[];
  let bandLabel: string;
  let note2027: string | null = null;
  if (t.nation === "scotland") {
    const band = c.scotland.bands.find((b) => b.id === t.band) ?? c.scotland.bands.find((b) => b.id === "basic") ?? c.scotland.bands[0];
    bandLabel = `Scottish ${band.label.toLowerCase()} rate (${c.scotland.taxYear})`;
    columns = [col("current", "Current rates", band.rate, c.scotland.credit)];
    note2027 = "From April 2027: check Scottish rates. Scotland sets its own property income rates.";
  } else {
    const id = (UK_BANDS.find((b) => b.id === t.band) ?? UK_BANDS[0]).id;
    bandLabel = (UK_BANDS.find((b) => b.id === id) ?? UK_BANDS[0]).label;
    columns = [col("current", "Current rates", c.tax.current[id], c.tax.credit.current), col("from2027", "From 6 April 2027", c.tax.from2027[id], c.tax.credit.from2027)];
  }
  let rentARoom: RentARoom | null = null;
  if (t.roomInHome) {
    const threshold = c.rentARoom * share;
    const receipts = r.annual.booking * share;
    rentARoom =
      receipts <= threshold
        ? { kind: "taxFree", threshold, receipts }
        : { kind: "compare", threshold, receipts, rentARoomTaxable: receipts - threshold, normalTaxable: taxable, better: receipts - threshold < taxable ? "rentARoom" : "normal" };
  }
  return { available: true, share, annualInterest, taxable, bandLabel, columns, note2027, rentARoom };
}

/* ---- Notices (not tax calculations) ---------------------------------------------------- */

export type Notices = { vat: "over" | "close" | null; mtd: string | null; annualBooking: number; mtdIncome: number };

export function notices(inp: Inputs, r: Result, c: Content): Notices {
  const annualBooking = r.annual.booking;
  const vat = inp.vatRegistered ? null : annualBooking >= c.vatThreshold ? "over" : annualBooking >= c.vatThreshold * c.vatClose ? "close" : null;
  const share = inp.tax.ownership === "joint" ? 0.5 : 1;
  const mtdIncome = annualBooking * share;
  const mtd = inp.tax.ownership === "company" ? null : (c.mtd.find((x) => mtdIncome >= x.min)?.from ?? null);
  return { vat, mtd, annualBooking, mtdIncome };
}
