import type { templates as seedTemplates } from "@/data/descriptionBuilder";
import { figureKeys as scorerFigureKeys, readContent as readScorer, type Content as ScorerContent } from "@/lib/tools/ai-readiness/content";
import { jsonFigure, type Figures } from "@/lib/tools/figures";

/** The stored templates (shape matches src/data/descriptionBuilder.ts). */
export type Templates = typeof seedTemplates;
export type SectionId = "listing" | "space" | "access" | "notes";
export const sectionIds: SectionId[] = ["listing", "space", "access", "notes"];

/**
 * Everything the builder reads: its templates, plus the AI-readiness
 * scorer's stored model (analyser rules, needs dictionary, vague list) and
 * section limits. One copy of each, shared by both tools.
 */
export type Content = {
  templates: Templates;
  scorer: ScorerContent;
  /** Character limit per section (from the scorer's stored limits). VERIFY. */
  limits: Record<SectionId, number>;
  /** Section names (from the scorer's stored limits). VERIFY. */
  names: Record<SectionId, string>;
};

/** Stored figures the tool reads (its templates plus the scorer's model and limits). */
export const figureKeys = ["descriptionBuilder.templates", ...scorerFigureKeys];

const SCORER_IDS: Record<SectionId, string> = { listing: "description", space: "space", access: "access", notes: "notes" };

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`Description builder templates: ${what} is missing or malformed.`);
};

/** Read and sanity-check the stored content. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const templates = jsonFigure<Templates>(figures, "descriptionBuilder.templates");
  need(typeof templates.version === "number", "version");
  need(templates.listing?.hooks && templates.space && templates.access && templates.notes, "section templates");
  need(Array.isArray(templates.honest) && Array.isArray(templates.fitSteps) && Array.isArray(templates.warm), "honest notes, fit steps or tone swaps");
  need(templates.minutes && templates.minutesShort && templates.words, "minutes or words");
  const scorer = readScorer(figures);
  const limits = {} as Record<SectionId, number>;
  const names = {} as Record<SectionId, string>;
  for (const id of ["listing", "space", "access", "notes"] as SectionId[]) {
    const s = scorer.limits.sections.find((x) => x.id === SCORER_IDS[id]);
    need(s && typeof s.limit === "number", `the scorer's ${id} limit`);
    limits[id] = s!.limit;
    names[id] = s!.label || templates.sectionNames[id];
  }
  return { templates, scorer, limits, names };
}

/** Replace {tokens}. Unknown tokens are left as they are, so a missing one is easy to spot. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
