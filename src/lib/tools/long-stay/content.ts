import type { settings as seedSettings } from "@/data/longStay";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";

export type Settings = typeof seedSettings;

/** Everything the calculator reads from stored figures. Percentages are decimals (15.5% = 0.155). */
export type Content = {
  weeklyMin: number;
  monthlyMin: number;
  /** Discounts at or above this are highlighted to guests. VERIFY. */
  highlightMin: number;
  fees: { airbnb: number; direct: number };
  /** London: stays of this many consecutive nights or more aren't short stays (shared with the 90-night counter). */
  londonLongStay: number;
  settings: Settings;
  /** "2026-11-17". */
  lastChecked: string;
};

export const figureKeys = [
  "platform.weeklyDiscountMinNights",
  "platform.monthlyDiscountMinNights",
  "platform.discountHighlightMinPercent",
  "fees.airbnbHostOnlyPercent",
  "fees.directCardPercent",
  "london.longStayMinNights",
  "longStay.settings",
  "rulesLastChecked",
];

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`Long-stay calculator figures: ${what} is missing or malformed.`);
};

/** Read and sanity-check the stored figures. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const settings = jsonFigure<Settings>(figures, "longStay.settings");
  need(settings.defaults && Array.isArray(settings.sensitivitySteps) && Array.isArray(settings.periodPresets), "settings");
  const lastChecked = figures.rulesLastChecked?.value;
  return {
    weeklyMin: numberFigure(figures, "platform.weeklyDiscountMinNights"),
    monthlyMin: numberFigure(figures, "platform.monthlyDiscountMinNights"),
    highlightMin: numberFigure(figures, "platform.discountHighlightMinPercent") / 100,
    fees: { airbnb: numberFigure(figures, "fees.airbnbHostOnlyPercent") / 100, direct: numberFigure(figures, "fees.directCardPercent") / 100 },
    londonLongStay: numberFigure(figures, "london.longStayMinNights"),
    settings,
    lastChecked: typeof lastChecked === "string" ? lastChecked : "",
  };
}
