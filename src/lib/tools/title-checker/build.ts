/**
 * Title builder: ready-made titles from the stored templates. Every
 * suggestion is passed through checkTitle and kept only if it has no fixes,
 * fits the limit, and has no town or bedroom count. Same inputs, same list.
 */

import { squash } from "@/lib/tools/listing-text";
import { checkTitle, type Details, type TitleResult } from "./check";
import { fill, type Content } from "./content";

export type FeatureChoice = { id: string } | { custom: string };
export type HookChoice = { kind: "minutes"; minutes: number; mode: string } | { kind: "near" } | { kind: "none" };

export type BuilderChoices = {
  /** Up to `maxFeatures`, from the stored list or the host's own (max `customMax` characters). */
  features: FeatureChoice[];
  /** A stored benefit id, or the host's own text; null = none. */
  benefit: { id: string } | { custom: string } | null;
  hook: HookChoice;
  /** Separator style id from the stored list. */
  separator: string;
  /** For "sleeps {maxGuests}". */
  maxGuests: number | null;
};

export type Suggestion = { title: string; length: number; result: TitleResult };
export type BuildResult = { suggestions: Suggestion[]; few: boolean; hint: string | null };

export const defaultChoices = (): BuilderChoices => ({ features: [], benefit: null, hook: { kind: "none" }, separator: "dot", maxGuests: null });

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

type Forms = { before: string; after: string; alone: string };

function featureForms(f: FeatureChoice, content: Content): Forms | null {
  const B = content.rules.builder;
  if ("custom" in f) {
    const t = f.custom.trim().slice(0, B.customMax);
    return t ? { before: t, after: t, alone: t } : null;
  }
  const s = B.features.find((x) => x.id === f.id);
  return s ? { before: s.before ?? "", after: s.after ?? "", alone: s.alone } : null;
}

function benefitText(c: BuilderChoices, content: Content): string {
  if (!c.benefit) return "";
  if ("custom" in c.benefit) return c.benefit.custom.trim().slice(0, content.rules.builder.customMax);
  const id = c.benefit.id;
  const b = content.rules.builder.benefits.find((x) => x.id === id);
  if (!b) return "";
  if (b.text.includes("{maxGuests}") && !(c.maxGuests && c.maxGuests > 0)) return "";
  return fill(b.text, { maxGuests: c.maxGuests ?? "" });
}

function hookText(c: BuilderChoices, place: string, content: Content): string {
  const H = content.rules.builder.hooks;
  if (!place || c.hook.kind === "none") return "";
  if (c.hook.kind === "near") return fill(H.near, { place });
  if (!(c.hook.minutes > 0)) return "";
  return fill(H.minutes, { n: c.hook.minutes, mode: c.hook.mode, place });
}

/** Fill one template; null if a token it needs is empty. */
function render(template: string, tokens: Record<string, string>): string | null {
  let missing = false;
  const out = template.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => {
    if (!(k in tokens)) return m;
    if (!tokens[k]) missing = true;
    return tokens[k];
  });
  return missing ? null : cap(out.replace(/\s{2,}/g, " ").trim());
}

/** Up to `maxSuggestions` titles that pass every fix check and fit. Strong first, then length closest to `target`. */
export function buildTitles(choices: BuilderChoices, details: Details, content: Content): BuildResult {
  const B = content.rules.builder;
  const sep = (B.separators.find((s) => s.id === choices.separator) ?? B.separators.find((s) => s.id === B.defaultSeparator) ?? B.separators[0]).text;
  const type = B.typeWords[details.propertyType] ?? "";
  const place = choices.hook.kind === "none" ? "" : details.place.trim();
  const benefit = benefitText(choices, content);
  const hook = hookText(choices, place, content);
  const features = choices.features.slice(0, B.maxFeatures).map((f) => featureForms(f, content)).filter((f): f is Forms => !!f);

  const seen = new Set<string>();
  const out: (Suggestion & { order: number })[] = [];
  let order = 0;
  for (const f of features) {
    // The same idea twice ("free parking · free parking") isn't a suggestion.
    const ben = benefit && [f.alone, f.after, f.before].some((x) => x && squash(x) === squash(benefit)) ? "" : benefit;
    for (const t of B.templates) {
      order++;
      const title = render(t, { featureBefore: f.before, featureAfter: f.after, feature: f.alone, type, benefit: ben, hook, place, sep });
      if (!title || seen.has(title.toLowerCase())) continue;
      seen.add(title.toLowerCase());
      const result = checkTitle(title, details, content);
      const bedrooms = result.checks.find((c) => c.id === "bedrooms")!;
      const city = result.checks.find((c) => c.id === "city")!;
      if (result.fixes > 0 || result.length > content.limit || bedrooms.status !== "pass" || city.status !== "pass") continue;
      out.push({ title, length: result.length, result, order });
    }
  }
  const rank = (s: Suggestion) => (s.result.verdict.id === "strong" ? 0 : 1);
  const suggestions = out
    .sort((a, b) => rank(a) - rank(b) || Math.abs(a.length - B.target) - Math.abs(b.length - B.target) || a.order - b.order)
    .slice(0, B.maxSuggestions)
    .map(({ title, length, result }) => ({ title, length, result }));
  const few = features.length > 0 && suggestions.length < B.minShown;
  return { suggestions, few, hint: few ? B.fewHint : null };
}
