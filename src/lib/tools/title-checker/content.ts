import type { rules as seedRules, source as seedSource, contactSource as seedContactSource } from "@/data/titleChecker";
import { jsonFigure, numberFigure, type Figures } from "@/lib/tools/figures";
import type { CountMethod } from "@/lib/tools/listing-text";

/** The stored rules (their shape matches src/data/titleChecker.ts). The limit and counting method are separate rows. */
export type Rules = Omit<typeof seedRules, "limit" | "counting">;
export type Source = typeof seedSource;
export type ContactSource = typeof seedContactSource;

export type Content = {
  rules: Rules;
  /** Airbnb's recommended maximum title length. VERIFY. */
  limit: number;
  /** How characters are counted. VERIFY. */
  counting: CountMethod;
  source: Source;
  contactSource: ContactSource;
};

/** Stored figures the tool reads. */
export const figureKeys = ["titleChecker.limit", "titleChecker.counting", "titleChecker.rules", "titleChecker.source", "titleChecker.contactSource"];

const need = (ok: unknown, what: string) => {
  if (!ok) throw new Error(`Title checker rules: ${what} is missing or malformed.`);
};

/** Read and sanity-check the stored content. Throws loudly on a bad edit. */
export function readContent(figures: Figures): Content {
  const rules = jsonFigure<Rules>(figures, "titleChecker.rules");
  const limit = numberFigure(figures, "titleChecker.limit");
  const counting = figures["titleChecker.counting"]?.value === "codepoints" ? "codepoints" : "graphemes";
  const source = jsonFigure<Source>(figures, "titleChecker.source");
  const contactSource = jsonFigure<ContactSource>(figures, "titleChecker.contactSource");
  need(typeof rules.version === "number", "version");
  need(limit > 0, "limit");
  for (const k of ["vagueStart", "features", "claims", "checks"] as const) need(Array.isArray(rules[k]), k);
  need(rules.caps && rules.punctuation && rules.symbols && rules.bedrooms && rules.contact && rules.location && rules.repeats, "a check's settings");
  need(rules.messages && rules.verdicts && rules.builder && Array.isArray(rules.builder.templates), "messages, verdicts or builder");
  return { rules, limit, counting, source, contactSource };
}

/** Replace {tokens}. Unknown tokens are left as they are, so a missing one is easy to spot. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
