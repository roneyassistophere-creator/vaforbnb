import type { rules as seedRules, source as seedSource } from "@/data/photoShotList";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";
import { renderTemplate } from "@/lib/tools/listing-text";

/** The stored rules (shape matches src/data/photoShotList.ts). The caption limit and photo count are separate rows. */
export type Rules = Omit<typeof seedRules, "captionLimit" | "photoCount">;
export type PhotoCount = (typeof seedRules)["photoCount"];
export type Source = typeof seedSource;

export type Content = {
  rules: Rules;
  /** Caption counter limit. VERIFY. */
  captionLimit: number;
  /** Recommended range, Airbnb's minimum and the typical range. VERIFY. */
  photoCount: PhotoCount;
  source: Source;
};

/** Stored figures the tool reads. */
export const figureKeys = ["photoShotList.rules", "photoShotList.captionLimit", "photoShotList.photoCount", "photoShotList.source"];

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`Photo shot list rules: ${what} is missing or malformed.`);
};

/** Read and sanity-check the stored content. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const rules = jsonFigure<Rules>(figures, "photoShotList.rules");
  const captionLimit = numberFigure(figures, "photoShotList.captionLimit");
  const photoCount = jsonFigure<PhotoCount>(figures, "photoShotList.photoCount");
  const source = jsonFigure<Source>(figures, "photoShotList.source");
  need(typeof rules.version === "number", "version");
  need(rules.firstFive && Array.isArray(rules.firstFive.slots) && Array.isArray(rules.firstFive.fill), "firstFive");
  need(Array.isArray(rules.tourOrder) && rules.shots && rules.shots.default, "tourOrder or shots");
  need(rules.templates && rules.captions && rules.labels && rules.words, "templates, captions, labels or words");
  need(rules.light && rules.seasons && rules.prep && Array.isArray(rules.prep.wholeHome), "light, seasons or prep");
  need(typeof photoCount.min === "number" && typeof photoCount.max === "number", "photoCount");
  return { rules, captionLimit, photoCount, source };
}

/** Replace {tokens}. Unknown tokens are left as they are, so a missing one is easy to spot. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Caption templates use the shared renderer: [bracketed] parts drop when a fact is missing. */
export const renderCaption = renderTemplate;

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
