import type { model as seedModel, limits as seedLimits, source as seedSource } from "@/data/aiReadiness";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";
import type { CountMethod } from "@/lib/tools/listing-text";

/** The stored scoring model (its shape matches src/data/aiReadiness.ts). */
export type Model = typeof seedModel;
export type Limits = typeof seedLimits;
export type Source = typeof seedSource;
export type Content = { model: Model; limits: Limits; source: Source; counting: CountMethod };

export type CheckId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export const checkIds: CheckId[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Stored figures the tool reads. */
/** The title limit and counting method are shared with the Airbnb title checker, so both tools agree. */
export const figureKeys = ["aiReadiness.model", "aiReadiness.limits", "aiReadiness.source", "titleChecker.limit", "titleChecker.counting", "rulesLastChecked"];

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`AI-readiness model: ${what} is missing or malformed.`);
};

/** Read and sanity-check the stored content. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const model = jsonFigure<Model>(figures, "aiReadiness.model");
  const limits = jsonFigure<Limits>(figures, "aiReadiness.limits");
  const source = jsonFigure<Source>(figures, "aiReadiness.source");
  need(typeof model.version === "number", "version");
  for (const k of ["units", "vague", "needs", "guestTypes", "checks", "bands", "amenities", "fixPriority"] as const) need(Array.isArray(model[k]), k);
  need(model.points && model.fixes && model.simulator && Array.isArray(model.simulator.triggers), "points, fixes or simulator");
  need(typeof limits.title === "number" && Array.isArray(limits.sections), "limits");
  // Use the title checker's stored limit and counting method when present.
  const title = figures["titleChecker.limit"] ? numberFigure(figures, "titleChecker.limit") : limits.title;
  const counting: CountMethod = figures["titleChecker.counting"]?.value === "codepoints" ? "codepoints" : "graphemes";
  return { model, limits: { ...limits, title }, source, counting };
}

/** Replace {tokens}. Unknown tokens are left as they are, so a missing one is easy to spot. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
