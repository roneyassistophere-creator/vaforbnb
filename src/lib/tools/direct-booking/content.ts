import type { checklist, defaults, example, model, wording } from "@/data/directBooking";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";

export type Model = typeof model;
export type Defaults = typeof defaults;
export type Example = typeof example;
export type ChecklistItem = (typeof checklist)[number];
export type Wording = typeof wording;

/** Everything the calculator reads from stored figures. Percentages are decimals (15.5% = 0.155). */
export type Content = {
  model: Model;
  defaults: Defaults;
  example: Example;
  checklist: ChecklistItem[];
  wording: Wording;
  fees: { airbnbHostOnly: number; airbnbSplitHost: number; airbnbSplitGuest: number; cardPercent: number; cardFixed: number };
  vatRate: number;
  vatOnFeeDefault: boolean;
  daysPerYear: number;
  offPlatformUrl: string;
  /** "2026-11-26" */
  feesLastChecked: string;
};

export const figureKeys = [
  "directBooking.content",
  "fees.airbnbHostOnlyPercent",
  "fees.airbnbSplitHostPercent",
  "fees.airbnbSplitGuestPercent",
  "fees.platformFeeVatDefault",
  "fees.directCardPercent",
  "fees.directFixedPerBooking",
  "vat.standardRate",
  "general.daysPerYear",
  "platform.offPlatformPolicyUrl",
  "feesLastChecked",
];

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`Direct booking calculator figures: ${what} is missing or malformed.`);
};
const pct = (n: number) => n / 100;
const str = (f: Figures, k: string) => (typeof f[k]?.value === "string" ? (f[k].value as string) : "");

/** Read and sanity-check the stored figures. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const c = jsonFigure<{ model: Model; defaults: Defaults; example: Example; checklist: ChecklistItem[]; wording: Wording }>(figures, "directBooking.content");
  need(c.model?.worthItMonths > 0 && c.defaults && c.example && Array.isArray(c.checklist) && c.wording?.verdict, "directBooking.content");
  return {
    model: c.model,
    defaults: c.defaults,
    example: c.example,
    checklist: c.checklist,
    wording: c.wording,
    fees: {
      airbnbHostOnly: pct(numberFigure(figures, "fees.airbnbHostOnlyPercent")),
      airbnbSplitHost: pct(numberFigure(figures, "fees.airbnbSplitHostPercent")),
      airbnbSplitGuest: pct(numberFigure(figures, "fees.airbnbSplitGuestPercent")),
      cardPercent: pct(numberFigure(figures, "fees.directCardPercent")),
      cardFixed: numberFigure(figures, "fees.directFixedPerBooking"),
    },
    vatRate: pct(numberFigure(figures, "vat.standardRate")),
    vatOnFeeDefault: str(figures, "fees.platformFeeVatDefault").toLowerCase() === "on",
    daysPerYear: numberFigure(figures, "general.daysPerYear"),
    offPlatformUrl: str(figures, "platform.offPlatformPolicyUrl"),
    feesLastChecked: str(figures, "feesLastChecked"),
  };
}
