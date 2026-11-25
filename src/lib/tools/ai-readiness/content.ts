import type { model as seedModel, limits as seedLimits, source as seedSource } from "@/data/aiReadiness";
import { jsonFigure, type Figures } from "@/lib/tools/figures";

/** The stored scoring model (its shape matches src/data/aiReadiness.ts). */
export type Model = typeof seedModel;
export type Limits = typeof seedLimits;
export type Source = typeof seedSource;
export type Content = { model: Model; limits: Limits; source: Source };

export type CheckId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export const checkIds: CheckId[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Stored figures the tool reads. */
export const figureKeys = ["aiReadiness.model", "aiReadiness.limits", "aiReadiness.source", "rulesLastChecked"];

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
  return { model, limits, source };
}

/** Replace {tokens}. Unknown tokens are left as they are, so a missing one is easy to spot. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
