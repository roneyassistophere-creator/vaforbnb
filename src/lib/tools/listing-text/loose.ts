/**
 * Loose phrase matching for short text such as titles: ignores case, and a
 * space or hyphen anywhere in a word or phrase matches either, or nothing,
 * so "Wi-Fi" = "wifi" = "wi fi" and "canal view" = "canal-view" = "canalview".
 * Matches are still whole words: "pool" doesn't match "Liverpool".
 */

import type { Span } from "./analyse";

const SEP = "[\\s\\-\\u2010-\\u2014]?";
const B = "\\p{L}\\p{N}";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Lower case with spaces, hyphens and dashes removed, and ’ as '. */
export const squash = (s: string) => s.toLowerCase().replace(/[\s\-‐-—]+/g, "").replace(/’/g, "'");

function source(phrase: string): string {
  return [...squash(phrase)].map((c) => (c === "'" ? "['’]" : escape(c))).join(SEP);
}

/** Every whole-word loose match of any phrase, left to right, longest phrase first where they overlap. */
export function findLoose(text: string, phrases: string[]): (Span & { phrase: string })[] {
  const list = [...new Set(phrases.map((p) => p.trim()).filter(Boolean))].sort((a, b) => squash(b).length - squash(a).length);
  if (!list.length || !text) return [];
  const re = new RegExp(`(?<![${B}])(?:${list.map((p) => `(${source(p)})`).join("|")})(?![${B}])`, "giu");
  return [...text.matchAll(re)].map((m) => {
    const n = m.slice(1).findIndex((g) => g !== undefined);
    return { start: m.index, end: m.index + m[0].length, text: m[0], phrase: list[n] };
  });
}

/** Does `text` loosely contain `phrase` as whole words? */
export const containsLoose = (text: string, phrase: string) => findLoose(text, [phrase])[0] ?? null;

/** Is the span inside one of `outer`? */
export const within = (s: Span, outer: Span[]) => outer.some((o) => s.start >= o.start && s.end <= o.end);
