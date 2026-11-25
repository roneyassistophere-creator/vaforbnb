/**
 * Listing text analyser, shared by the AI-readiness scorer, the title checker
 * and the description builder. Pure functions: every word list comes from the
 * stored model, and every match keeps its position so it can be highlighted.
 *
 * Matching ignores case. Phrases match whole words, and a space or hyphen
 * inside a phrase also matches the other ("self check-in" = "self-check-in").
 */

export type Span = { start: number; end: number; text: string };
export type VagueHit = Span & { term: string; suggestion: string };
export type LocationPhrase = Span & {
  /** The word after "to/from [the]", e.g. "Piccadilly". */
  place: string;
  /** The sentence the phrase is in. */
  sentence: Span;
  /** The first transport word in that sentence, if any. */
  transport: string | null;
};

/** The parts of the stored model the analyser needs. */
export type TextRules = {
  units: string[];
  location: { minuteWords: string[]; modes: string[]; joiners: string[]; transportWords: string[] };
  vague: { term: string; variants: string[]; suggestion: string }[];
  /** Evidence straight after one of these words doesn't count ("no lift"). */
  negations?: string[];
  /** Words allowed between the negation and the evidence ("not a desk"). */
  negationFillers?: string[];
};

export type Analysis = {
  text: string;
  /** Number + unit, e.g. "300 Mbps", "12-minute", "45 m²". */
  units: (Span & { unit: string })[];
  /** Number + Mbps. */
  mbps: Span[];
  /** "8 min walk to Piccadilly", "5 mins from the beach". */
  phrases: LocationPhrase[];
  vague: VagueHit[];
  sentences: Span[];
  negations: string[];
  negationFillers: string[];
};

/** Is the match at `start` straight after a negation ("no lift", "not a desk")? Only looks within the same line. */
export function isNegated(text: string, start: number, negations: string[], fillers: string[] = []): boolean {
  if (!negations.length) return false;
  const before = text.slice(Math.max(0, start - 40), start).split("\n").pop() ?? "";
  const w = (before.match(/[\p{L}'’]+/gu) ?? []).map((x) => x.toLowerCase());
  const neg = new Set(negations.map((n) => n.toLowerCase()));
  const last = w[w.length - 1];
  if (!last) return false;
  if (neg.has(last)) return true;
  return fillers.map((f) => f.toLowerCase()).includes(last) && neg.has(w[w.length - 2] ?? "");
}

/** Like findPhrases, but skips negated matches ("no lift" isn't evidence of a lift). */
export function findEvidence(a: Pick<Analysis, "text" | "negations" | "negationFillers">, phrases: string[]): Span[] {
  return findPhrases(a.text, phrases).filter((s) => !isNegated(a.text, s.start, a.negations, a.negationFillers));
}

const L = "\\p{L}\\p{N}";
const SEP = "[\\s\\-\\u2010-\\u2014]";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byLength = (a: string, b: string) => b.length - a.length;

/** Regex source for a phrase: spaces and hyphens inside it match either (or nothing). */
export function phraseSource(phrase: string): string {
  return phrase
    .trim()
    .split(/[\s\-‐-—]+/)
    .filter(Boolean)
    .map((w) => escape(w).replace(/['’]/g, "['’]"))
    .join(`${SEP}*`);
}

/** A whole-word, case-insensitive regex for any of the phrases (longest first). */
export function phrasesRegex(phrases: string[]): RegExp | null {
  const list = [...new Set(phrases.map((p) => p.trim().toLowerCase()).filter(Boolean))].sort(byLength);
  if (!list.length) return null;
  return new RegExp(`(?<![${L}])(?:${list.map(phraseSource).join("|")})(?![${L}])`, "giu");
}

/** Every whole-word match of any phrase, left to right, not overlapping. */
export function findPhrases(text: string, phrases: string[]): Span[] {
  const re = phrasesRegex(phrases);
  if (!re || !text) return [];
  return [...text.matchAll(re)].map((m) => ({ start: m.index, end: m.index + m[0].length, text: m[0] }));
}

/** Normalise a phrase for lookups: lower case, single spaces, hyphens as spaces. */
export const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s\-‐-—]+/g, " ")
    .trim();

/** Which listed phrase a match came from (for mapping a match back to its entry). */
export function whichPhrase(match: string, phrases: string[]): string | undefined {
  const m = normalise(match).replace(/ /g, "");
  return phrases.find((p) => normalise(p).replace(/ /g, "") === m);
}

const NUMBER = `(?<![${L}.,])\\d+(?:[.,]\\d+)?`;

export function unitsRegex(units: string[]): RegExp {
  const u = [...units].sort(byLength).map(phraseSource).join("|");
  return new RegExp(`${NUMBER}[\\s\\-]?(${u})(?![${L}²])`, "giu");
}

export function locationRegex(rules: TextRules["location"]): RegExp {
  const mins = [...rules.minuteWords].sort(byLength).map(escape).join("|");
  const modes = [...rules.modes].sort(byLength).map(escape).join("|");
  const joiners = rules.joiners.map(escape).join("|");
  return new RegExp(
    `${NUMBER}[\\s\\-]?(?:${mins})['’]?(?:[\\s\\-]+(?:${modes})(?:ing)?)?\\s+(?:${joiners})\\s+(?:the\\s+)?([${L}][${L}'’\\-]*)`,
    "giu",
  );
}

/** Sentence spans: split at . ! ? followed by a space or the end, and at line breaks. */
export function sentences(text: string): Span[] {
  const out: Span[] = [];
  let start = 0;
  const push = (end: number) => {
    let s = start;
    let e = end;
    while (s < e && /\s/.test(text[s])) s++;
    while (e > s && /\s/.test(text[e - 1])) e--;
    if (e > s) out.push({ start: s, end: e, text: text.slice(s, e) });
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "\n") {
      push(i);
      start = i + 1;
    } else if (c === "." || c === "!" || c === "?") {
      let j = i;
      while (j + 1 < text.length && /[.!?)"'’”]/.test(text[j + 1])) j++;
      if (j + 1 >= text.length || /\s/.test(text[j + 1])) {
        push(j + 1);
        start = j + 1;
        i = j;
      }
    }
  }
  push(text.length);
  return out;
}

export const words = (text: string) => text.match(new RegExp(`[${L}][${L}'’\\-]*`, "gu")) ?? [];

/** ALL-CAPS words of at least `minLetters` letters. */
export const capsWords = (text: string, minLetters: number) => text.match(new RegExp(`(?<![\\p{L}])\\p{Lu}{${minLetters},}(?![\\p{L}])`, "gu")) ?? [];

export const sentenceOf = (all: Span[], at: number) => all.find((s) => at >= s.start && at < s.end) ?? { start: at, end: at, text: "" };

/** Everything the scorer, highlighter and simulator need from the text. */
export function analyseText(text: string, rules: TextRules): Analysis {
  const units = [...text.matchAll(unitsRegex(rules.units))].map((m) => ({ start: m.index, end: m.index + m[0].length, text: m[0], unit: m[1].toLowerCase() }));
  const mbps = units.filter((u) => u.unit === "mbps").map(({ start, end, text: t }) => ({ start, end, text: t }));
  const sents = sentences(text);
  const phrases: LocationPhrase[] = [...text.matchAll(locationRegex(rules.location))].map((m) => {
    const sentence = sentenceOf(sents, m.index);
    const t = findPhrases(sentence.text, rules.location.transportWords)[0];
    return { start: m.index, end: m.index + m[0].length, text: m[0], place: m[1], sentence, transport: t ? t.text : null };
  });
  const variants = rules.vague.flatMap((v) => v.variants.map((x) => ({ x, v })));
  const vague = findPhrases(
    text,
    variants.map((p) => p.x),
  ).map((s) => {
    const key = whichPhrase(s.text, variants.map((p) => p.x));
    const v = variants.find((p) => p.x === key)?.v ?? rules.vague[0];
    return { ...s, term: v.term, suggestion: v.suggestion };
  });
  return { text, units, mbps, phrases, vague, sentences: sents, negations: rules.negations ?? [], negationFillers: rules.negationFillers ?? [] };
}

/** Does `text` contain `value` as whole words (ignoring case)? Returns the match. */
export function containsPhrase(text: string, value: string): Span | null {
  const v = value.trim();
  if (!v) return null;
  return findPhrases(text, [v])[0] ?? null;
}

/** Up to `max` characters around a match, with the match itself kept whole where possible. */
export function snippet(text: string, span: Span, max = 60): { before: string; match: string; after: string } {
  const match = text.slice(span.start, span.end).slice(0, max);
  const room = Math.max(0, max - match.length);
  let s = Math.max(0, span.start - Math.floor(room / 2));
  const e = Math.min(text.length, s + max);
  if (e - s < max) s = Math.max(0, e - max);
  const before = text.slice(s, span.start).replace(/\s+/g, " ");
  const after = text.slice(span.start + match.length, e).replace(/\s+/g, " ");
  return { before: (s > 0 ? "…" : "") + before, match, after: after + (e < text.length ? "…" : "") };
}
