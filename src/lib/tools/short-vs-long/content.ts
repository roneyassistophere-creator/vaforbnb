import type { defaults, example, model, weigh, whoPays, wording } from "@/data/shortVsLong";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";

export type Model = typeof model;
export type Defaults = typeof defaults;
export type Example = typeof example;
export type WhoPays = (typeof whoPays)[number];
export type Weigh = (typeof weigh)[number] & { tool?: string; linkLabel?: string; rules?: string[] };
export type Wording = typeof wording;
type Rates = { basic: number; higher: number; additional: number };

/** Everything the comparison reads from stored figures. Percentages are decimals. */
export type Content = {
  model: Model;
  defaults: Defaults;
  example: Example;
  whoPays: WhoPays[];
  weigh: Weigh[];
  wording: Wording;
  vatRate: number;
  eicrMonths: number;
  epcMonths: number;
  tax: { current: Rates; from2027: Rates; from2027Date: string };
  scotland: { taxYear: string; bands: { id: string; label: string; rate: number }[] };
  rulesLastChecked: string;
};

export const figureKeys = ["shortVsLong.content", "vat.standardRate", "longLet.eicrMonths", "longLet.epcMonths", "tax.propertyIncome", "tax.scotland", "rulesLastChecked"];

const pct = (n: number) => n / 100;

export function readContent(figures: Figures): Content {
  const c = jsonFigure<{ model: Model; defaults: Defaults; example: Example; whoPays: WhoPays[]; weigh: Weigh[]; wording: Wording }>(figures, "shortVsLong.content");
  if (!c.model || !c.defaults || !c.example || !Array.isArray(c.whoPays) || !Array.isArray(c.weigh) || !c.wording) throw new Error("Short vs long figures: shortVsLong.content is missing or malformed.");
  const t = jsonFigure<{ current: Rates; from2027: Rates; from2027Date: string }>(figures, "tax.propertyIncome");
  const sc = jsonFigure<{ taxYear: string; bands: { id: string; label: string; rate: number }[] }>(figures, "tax.scotland");
  const r = (x: Rates): Rates => ({ basic: pct(x.basic), higher: pct(x.higher), additional: pct(x.additional) });
  const rl = figures.rulesLastChecked?.value;
  return {
    ...c,
    vatRate: pct(numberFigure(figures, "vat.standardRate")),
    eicrMonths: numberFigure(figures, "longLet.eicrMonths"),
    epcMonths: numberFigure(figures, "longLet.epcMonths"),
    tax: { current: r(t.current), from2027: r(t.from2027), from2027Date: t.from2027Date },
    scotland: { taxYear: sc.taxYear, bands: sc.bands.map((b) => ({ ...b, rate: pct(b.rate) })) },
    rulesLastChecked: typeof rl === "string" ? rl : "",
  };
}
