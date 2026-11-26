import type { examples, insights, model, wording } from "@/data/bookingPerformance";
import { jsonFigure, type Figures } from "@/lib/tools/figures";

export type Model = typeof model;
export type InsightRules = typeof insights;
export type Wording = typeof wording;
export type Examples = typeof examples;
export type Content = { model: Model; insights: InsightRules; wording: Wording; examples: Examples; lastChecked: string };

export const figureKeys = ["bookingPerformance.content"];

/** Read and sanity-check the stored content. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const c = jsonFigure<{ model: Model; insights: InsightRules; wording: Wording; examples: Examples }>(figures, "bookingPerformance.content");
  if (!c.model || !Array.isArray(c.model.weekendNights) || !(c.model.gapMaxNights >= 0) || !c.insights?.rules || !c.wording || !c.examples) {
    throw new Error("Booking performance figures: bookingPerformance.content is missing or malformed.");
  }
  return { ...c, lastChecked: figures["bookingPerformance.content"]?.lastChecked ?? "" };
}
