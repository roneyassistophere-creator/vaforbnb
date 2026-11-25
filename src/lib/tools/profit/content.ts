import type { ExampleFigures, insights, leverText, model, shapes } from "@/data/profitCalculator";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";

export type Model = typeof model;
export type Shape = (typeof shapes)[number];
export type InsightRules = typeof insights;
export type LeverText = typeof leverText;
export type Example = { id: string; label: string; note: string; figures: ExampleFigures };
export type { ExampleFigures };

export type TaxRates = { basic: number; higher: number; additional: number };
export type ScottishBand = { id: string; label: string; rate: number };

/**
 * Everything the profit model reads from stored figures. Percentages here
 * are decimals (15.5% = 0.155); money is in £.
 */
export type Content = {
  model: Model;
  defaults: ExampleFigures;
  examples: Example[];
  shapes: Shape[];
  insights: InsightRules;
  leverText: LeverText;
  fees: { airbnbHostOnly: number; airbnbSplit: number; directPercent: number; directFixed: number };
  vatRate: number;
  tax: { current: TaxRates; from2027: TaxRates; from2027Date: string; credit: { current: number; from2027: number } };
  scotland: { taxYear: string; bands: ScottishBand[]; credit: number };
  rentARoom: number;
  vatThreshold: number;
  vatClose: number;
  mtd: { min: number; from: string }[];
  /** "2026-11-26": the newest last-checked date of the figures used. */
  lastChecked: string;
};

export const figureKeys = [
  "profit.model",
  "profit.content",
  "fees.airbnbHostOnlyPercent",
  "fees.airbnbSplitHostPercent",
  "fees.directCardPercent",
  "fees.directFixedPerBooking",
  "vat.standardRate",
  "vat.registrationThreshold",
  "vat.closePercent",
  "tax.propertyIncome",
  "tax.scotland",
  "tax.rentARoomThreshold",
  "tax.mtdThresholds",
];

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`Profit calculator figures: ${what} is missing or malformed.`);
};
const pct = (n: number) => n / 100;
const rates = (r: TaxRates): TaxRates => ({ basic: pct(r.basic), higher: pct(r.higher), additional: pct(r.additional) });

/** Read and sanity-check the stored figures. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const m = jsonFigure<Model>(figures, "profit.model");
  need(m.daysPerMonth > 0 && m.levers && m.version, "profit.model");
  const c = jsonFigure<{ defaults: ExampleFigures; examples: Example[]; shapes: Shape[]; insights: InsightRules; leverText: LeverText }>(figures, "profit.content");
  need(c.defaults && Array.isArray(c.examples) && Array.isArray(c.shapes) && c.insights?.rules, "profit.content");
  const t = jsonFigure<{ current: TaxRates; from2027: TaxRates; from2027Date: string; financeCredit: { current: number; from2027: number } }>(figures, "tax.propertyIncome");
  need(t.current && t.from2027 && t.financeCredit, "tax.propertyIncome");
  const sc = jsonFigure<{ taxYear: string; bands: ScottishBand[]; financeCredit: number }>(figures, "tax.scotland");
  need(Array.isArray(sc.bands) && sc.bands.length, "tax.scotland");
  const mtd = jsonFigure<{ min: number; from: string }[]>(figures, "tax.mtdThresholds");
  need(Array.isArray(mtd), "tax.mtdThresholds");
  const dates = figureKeys.map((k) => figures[k]?.lastChecked ?? "").filter(Boolean).sort();
  return {
    model: m,
    defaults: c.defaults,
    examples: c.examples,
    shapes: c.shapes,
    insights: c.insights,
    leverText: c.leverText,
    fees: {
      airbnbHostOnly: pct(numberFigure(figures, "fees.airbnbHostOnlyPercent")),
      airbnbSplit: pct(numberFigure(figures, "fees.airbnbSplitHostPercent")),
      directPercent: pct(numberFigure(figures, "fees.directCardPercent")),
      directFixed: numberFigure(figures, "fees.directFixedPerBooking"),
    },
    vatRate: pct(numberFigure(figures, "vat.standardRate")),
    tax: { current: rates(t.current), from2027: rates(t.from2027), from2027Date: t.from2027Date, credit: { current: pct(t.financeCredit.current), from2027: pct(t.financeCredit.from2027) } },
    scotland: { taxYear: sc.taxYear, bands: sc.bands.map((b) => ({ ...b, rate: pct(b.rate) })), credit: pct(sc.financeCredit) },
    rentARoom: numberFigure(figures, "tax.rentARoomThreshold"),
    vatThreshold: numberFigure(figures, "vat.registrationThreshold"),
    vatClose: pct(numberFigure(figures, "vat.closePercent")),
    mtd: [...mtd].sort((a, b) => b.min - a.min),
    lastChecked: dates[dates.length - 1] ?? "",
  };
}
