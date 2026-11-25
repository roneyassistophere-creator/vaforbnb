/**
 * The 12 title checks. Pure and testable: the limit, every word list,
 * pattern, separator and message comes from the stored rules. Checks clarity
 * and Airbnb's published guidance, not ranking.
 */

import { containsLoose, countChars as countShared, findLoose, graphemes, within, type Span } from "@/lib/tools/listing-text";
import { fill, type Content, type Rules } from "./content";

/** Optional details the host adds for smarter checks. `bedrooms` null = not entered; 0 = studio. */
export type Details = { town: string; place: string; propertyType: string; bedrooms: number | null };
export const noDetails = (): Details => ({ town: "", place: "", propertyType: "", bedrooms: null });

export type Status = "pass" | "fix" | "tip";
export type CheckId = "length" | "caps" | "punctuation" | "symbols" | "city" | "bedrooms" | "contact" | "vague" | "feature" | "location" | "claims" | "repeats";
export type CheckResult = {
  id: CheckId;
  name: string;
  /** What a failure is: fix = breaks guidance or rules, tip = could be stronger. */
  kind: "fix" | "tip";
  status: Status;
  reason: string;
  /** Matched text in the title, to highlight (start/end are string positions). */
  matches: Span[];
};
export type VerdictId = "strong" | "good" | "fixes";
export type CounterState = "empty" | "ok" | "warn" | "over";

export type TitleResult = {
  title: string;
  /** Characters as counted by the stored method. */
  length: number;
  limit: number;
  counter: CounterState;
  /** Where the title would be cut off (string position), or null when it fits. */
  cutAt: number | null;
  checks: CheckResult[];
  /** Extra tips that aren't one of the 12 checks ("There's room for one more selling point"). */
  extraTips: string[];
  passed: number;
  total: number;
  fixes: number;
  tips: number;
  verdict: { id: VerdictId; label: string };
};

const span = (text: string, start: number, end: number): Span => ({ start, end, text: text.slice(start, end) });
const reMatches = (text: string, re: RegExp): Span[] => [...text.matchAll(re)].map((m) => span(text, m.index, m.index + m[0].length));
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byStart = (a: Span, b: Span) => a.start - b.start;
const L = "\\p{L}\\p{N}";

/** Characters as people see them: an emoji or accented letter counts as 1 (or code points, if the stored method says so). */
export function countChars(title: string, counting: Content["counting"] = "graphemes"): number {
  return countShared(title, counting);
}

/** String position after the first `limit` characters (where a search card cuts the title), or null if it fits. */
export function cutPosition(title: string, limit: number, counting: Content["counting"] = "graphemes"): number | null {
  if (counting === "codepoints") {
    const cps = [...title];
    return cps.length > limit ? cps.slice(0, limit).join("").length : null;
  }
  const g = graphemes(title);
  return g.length > limit ? g[limit].index : null;
}

/* ---- Pattern helpers (exported for the builder and tests) --------------- */

/** Bedroom counts: "2 bed", "2-bed", "2bed", "2 bedrooms", "2BR", "two-bedroom". */
export function bedroomMatches(title: string, r: Rules["bedrooms"]): Span[] {
  const num = ["\\d+", ...r.numberWords.map(escape)].join("|");
  const units = [...r.units].sort((a, b) => b.length - a.length).map(escape).join("|");
  return reMatches(title, new RegExp(`(?<![${L}])(?:${num})[\\s\\-]?(?:${units})(?![\\p{L}])`, "giu"));
}

/** Phone numbers, email addresses, web addresses and @handles. */
export function contactMatches(title: string, r: Rules["contact"]): Span[] {
  const out: Span[] = [];
  const emails = r.emails ? reMatches(title, /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu) : [];
  out.push(...emails);
  for (const m of reMatches(title, /\+?\d(?:[\s\-]?\d)*/g)) if ((m.text.match(/\d/g) ?? []).length >= r.phoneMinDigits) out.push(m);
  if (r.webMarkers.length) {
    const marker = r.webMarkers.map(escape).join("|");
    for (const m of reMatches(title, new RegExp(`[^\\s]*(?:${marker})[^\\s]*`, "giu"))) if (!within(m, emails)) out.push(m);
  }
  if (r.handles) for (const m of reMatches(title, /(?<![\p{L}\p{N}._%+-])@[\p{L}\p{N}_.]{2,}/gu)) if (!within(m, emails)) out.push(m);
  // Drop overlaps (an email is also a ".com" address), keeping the first, longest match.
  const sorted = out.sort((a, b) => a.start - b.start || b.end - a.end);
  return sorted.filter((s, i) => !sorted.slice(0, i).some((p) => s.start < p.end));
}

/** "6 min to …", "8-minute walk", "5 mins from the beach", "near …", "by the …", "opposite …", "next to …". */
export function locationMatches(title: string, r: Rules["location"]): Span[] {
  const byLen = (a: string, b: string) => b.length - a.length;
  const mins = [...r.minuteWords].sort(byLen).map(escape).join("|");
  const modes = [...r.modes].sort(byLen).map(escape).join("|");
  const joiners = r.joiners.map(escape).join("|");
  const word = `[${L}][${L}'’\\-]*`;
  const minutes = new RegExp(
    `(?<![${L}])\\d+[\\s\\-]?(?:${mins})['’]?(?:(?:[\\s\\-]+(?:${modes})(?:ing)?)(?:\\s+(?:${joiners})\\s+(?:the\\s+)?${word})?|\\s+(?:${joiners})\\s+(?:the\\s+)?${word})(?![${L}])`,
    "giu",
  );
  const near = r.near.length ? new RegExp(`(?<![${L}])(?:${[...r.near].sort(byLen).map((n) => escape(n).replace(/ /g, "\\s+")).join("|")})\\s+(?:the\\s+)?${word}`, "giu") : null;
  return [...reMatches(title, minutes), ...(near ? reMatches(title, near) : [])].sort(byStart);
}

/** Emoji and decorative symbols (★ ♥ ✓ ➤ ✨ 🌟), except the allowed separators. */
export function symbolMatches(title: string, r: Rules["symbols"]): Span[] {
  const allowed = new Set(r.allowed);
  const extra = new Set(r.alsoFlag);
  const decorative = /[\p{Extended_Pictographic}\p{So}\p{Sm}\p{Sk}\p{Co}⃣️]/u;
  return graphemes(title)
    .filter((g) => !allowed.has(g.text) && (extra.has(g.text) || decorative.test(g.text)))
    .map((g) => span(title, g.index, g.index + g.text.length));
}

/** Runs of a repeatable mark ("!!", "...", "--"), or every one of a mark used more often than `maxTotal` allows. */
export function punctuationMatches(title: string, r: Rules["punctuation"]): Span[] {
  const out: Span[] = [];
  for (const mark of r.noRepeat) out.push(...reMatches(title, new RegExp(`(?:${escape(mark)}){2,}`, "g")));
  for (const [mark, max] of Object.entries(r.maxTotal)) {
    const all = reMatches(title, new RegExp(escape(mark), "g"));
    if (all.length > max) for (const m of all) if (!out.some((o) => m.start >= o.start && m.end <= o.end)) out.push(m);
  }
  return out.sort(byStart);
}

/** Meaningful words (min letters, not a stop-word) that appear more than once: every occurrence, and the first such word. */
export function repeatedWords(title: string, r: Rules["repeats"]): { word: string | null; matches: Span[] } {
  const stop = new Set(r.stopWords.map((w) => w.toLowerCase()));
  const seen = new Map<string, Span[]>();
  for (const m of reMatches(title, /[\p{L}'’]+/gu)) {
    const w = m.text.toLowerCase().replace(/’/g, "'");
    if ([...w.replace(/'/g, "")].length < r.minLetters || stop.has(w)) continue;
    seen.set(w, [...(seen.get(w) ?? []), m]);
  }
  const repeated = [...seen.entries()].filter(([, v]) => v.length > 1);
  if (!repeated.length) return { word: null, matches: [] };
  return { word: repeated[0][1][0].text.toLowerCase(), matches: repeated.flatMap(([, v]) => v).sort(byStart) };
}

/* ---- The checker --------------------------------------------------------- */

/** Check a title against the 12 stored checks. */
export function checkTitle(rawTitle: string, details: Details, content: Content): TitleResult {
  const { rules, limit, counting } = content;
  const M = rules.messages;
  const title = rawTitle.trim();
  const n = countChars(title, counting);
  const results: Partial<Record<CheckId, Omit<CheckResult, "id" | "name" | "kind">>> = {};
  const pass = (id: CheckId, reason: string, matches: Span[] = []) => (results[id] = { status: "pass", reason, matches });
  const fail = (id: CheckId, status: Status, reason: string, matches: Span[]) => (results[id] = { status, reason, matches });
  const town = details.town.trim();
  const place = details.place.trim();
  const placeHits = place ? findLoose(title, [place]) : [];

  /* 1. Length */
  const cutAt = cutPosition(title, limit, counting);
  if (n === 0) fail("length", "fix", M.length.empty, []);
  else if (n > limit) fail("length", "fix", n - limit === 1 ? fill(M.length.fixOne, { limit }) : fill(M.length.fix, { n: n - limit, limit }), cutAt === null ? [] : [span(title, cutAt, title.length)]);
  else pass("length", fill(M.length.pass, { n, limit }));

  /* 2. All-caps words */
  const allow = new Set(rules.caps.allow.map((w) => w.toUpperCase()));
  const capsRe = new RegExp(`(?<![\\p{L}])\\p{Lu}{${rules.caps.minLetters},}(?![\\p{L}])`, "gu");
  const caps = reMatches(title, capsRe).filter((m) => !allow.has(m.text.toUpperCase()));
  if (caps.length) fail("caps", "fix", fill(M.caps.fix, { words: caps.map((c) => c.text).join(", ") }), caps);
  else pass("caps", M.caps.pass);

  /* 3. Repeated punctuation */
  const punct = punctuationMatches(title, rules.punctuation);
  if (punct.length) fail("punctuation", "fix", M.punctuation.fix, punct);
  else pass("punctuation", M.punctuation.pass);

  /* 4. Emoji and symbols */
  const symbols = symbolMatches(title, rules.symbols);
  if (symbols.length) fail("symbols", "fix", fill(M.symbols.fix, { chars: [...new Set(symbols.map((s) => s.text))].join(" ") }), symbols);
  else pass("symbols", M.symbols.pass);

  /* 5. City: a whole-word match of the town, unless it's part of the station or landmark in the title */
  if (!town) pass("city", M.city.skipped);
  else {
    const hits = findLoose(title, [town]).filter((h) => !within(h, placeHits));
    if (hits.length) fail("city", "fix", fill(M.city.fix, { town }), hits);
    else pass("city", M.city.pass);
  }

  /* 6. Bedroom count: a fix when bedrooms are entered, a tip when they aren't */
  const beds = bedroomMatches(title, rules.bedrooms);
  if (details.bedrooms === 0) beds.push(...findLoose(title, rules.bedrooms.studioWords));
  beds.sort(byStart);
  if (beds.length) fail("bedrooms", details.bedrooms === null ? "tip" : "fix", details.bedrooms === null ? M.bedrooms.tip : M.bedrooms.fix, beds);
  else pass("bedrooms", M.bedrooms.pass);

  /* 7. Contact details and links */
  const contact = contactMatches(title, rules.contact);
  if (contact.length) fail("contact", "fix", M.contact.fix, contact);
  else pass("contact", M.contact.pass);

  /* 8. Vague first word */
  const first = title.match(/^[^\p{L}]*([\p{L}'’]+)/u);
  const firstWord = first?.[1] ?? "";
  const vagueHit = firstWord && rules.vagueStart.some((v) => containsLoose(firstWord, v)?.text.length === firstWord.length);
  if (vagueHit) {
    const start = first!.index! + first![0].length - firstWord.length;
    fail("vague", "tip", fill(M.vague.tip, { word: firstWord }), [span(title, start, start + firstWord.length)]);
  } else pass("vague", M.vague.pass);

  /* 9. Standout feature */
  const feature = findLoose(title, rules.features)[0];
  if (feature) pass("feature", fill(M.feature.pass, { word: feature.text }), [feature]);
  else fail("feature", "tip", M.feature.tip, []);

  /* 10. Location hook: the station or landmark entered, or a "minutes to" / "near" phrase */
  const hook = placeHits[0] ?? locationMatches(title, rules.location)[0];
  if (hook) pass("location", fill(M.location.pass, { word: hook.text }), [hook]);
  else fail("location", "tip", M.location.tip, []);

  /* 11. Unprovable claims */
  const claims = rules.claims
    .filter((c) => !(c.unless ?? []).some((u) => containsLoose(title, u)))
    .flatMap((c) => findLoose(title, [c.word]))
    .sort(byStart);
  if (claims.length) fail("claims", "tip", M.claims.tip, claims);
  else pass("claims", M.claims.pass);

  /* 12. Repeated words */
  const rep = repeatedWords(title, rules.repeats);
  if (rep.word) fail("repeats", "tip", fill(M.repeats.tip, { word: rep.word }), rep.matches);
  else pass("repeats", M.repeats.pass);

  const checks: CheckResult[] = rules.checks.map((c) => ({ id: c.id as CheckId, name: c.name, kind: c.kind, ...results[c.id as CheckId]! }));
  const extraTips = n > 0 && n < rules.shortUnder ? [M.short] : [];
  const fixes = checks.filter((c) => c.status === "fix").length;
  const tips = checks.filter((c) => c.status === "tip").length + extraTips.length;
  const id: VerdictId = fixes > 0 ? "fixes" : tips > 0 ? "good" : "strong";
  const counter: CounterState = n === 0 ? "empty" : n > limit ? "over" : n >= rules.warnFrom ? "warn" : "ok";
  return {
    title,
    length: n,
    limit,
    counter,
    cutAt,
    checks,
    extraTips,
    passed: checks.filter((c) => c.status === "pass").length,
    total: checks.length,
    fixes,
    tips,
    verdict: { id, label: rules.verdicts[id].label },
  };
}

/** "What this means": two sentences chosen by the verdict. */
export function whatThisMeans(r: TitleResult, rules: Rules): string {
  return fill(rules.verdicts[r.verdict.id].meaning, { n: r.fixes });
}

/** "9 of 12 checks passed". */
export const passedText = (r: TitleResult, rules: Rules) => fill(rules.verdicts.passed, { n: r.passed, total: r.total });

const STATUS_TEXT: Record<Status, string> = { pass: "Pass", fix: "Fix", tip: "Tip" };

/** "Copy checklist": plain text with each check and its status. Contains the host's own title (copied on their device only). */
export function checklistText(r: TitleResult, rules: Rules, credit: string): string {
  return [
    `Title: ${r.title}`,
    `${r.length} / ${r.limit} characters · ${r.verdict.label} · ${passedText(r, rules)}`,
    "",
    ...r.checks.map((c) => `${STATUS_TEXT[c.status]}: ${c.name}. ${c.reason}`),
    ...r.extraTips.map((t) => `Tip: ${t}`),
    "",
    credit,
  ].join("\n");
}
