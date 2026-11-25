import type { rules as seedRules, source as seedSource } from "@/data/photoShotList";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";

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

/**
 * Fill a caption template. Text in [square brackets] is dropped when any
 * token inside it is empty, so a missing fact drops only its own part. A
 * token outside brackets that's empty makes the whole result "" (the caller
 * then uses a fallback template). Never adds anything that isn't in `vars`.
 */
export function renderCaption(template: string, vars: Record<string, string>): string {
  const val = (k: string) => (vars[k] ?? "").trim();
  let missingRequired = false;
  const withGroups = template.replace(/\[([^\]]*)\]/g, (_, inner: string) => {
    const keys = [...inner.matchAll(/\{([A-Za-z]+)\}/g)].map((m) => m[1]);
    return keys.every((k) => val(k)) ? inner.replace(/\{([A-Za-z]+)\}/g, (_m, k: string) => val(k)) : "";
  });
  const out = withGroups.replace(/\{([A-Za-z]+)\}/g, (_m, k: string) => {
    if (!val(k)) missingRequired = true;
    return val(k);
  });
  return missingRequired ? "" : out.replace(/\s{2,}/g, " ").replace(/\s+([,.)])/g, "$1").trim();
}

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
