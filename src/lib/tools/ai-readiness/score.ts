/**
 * AI-readiness score (model v3). Pure and testable: every word list, point
 * value, band and template comes from the stored model. Scores readiness
 * (clear, specific facts), not ranking.
 */

import { joinList } from "@/lib/tools/format";
import {
  analyseText,
  capsWords,
  containsPhrase,
  evaluateNeeds,
  findEvidence,
  findPhrases,
  needsFor,
  sentences,
  words,
  type Analysis,
  type NeedResult,
  type Span,
  countChars,
  unitsRegex,
} from "@/lib/tools/listing-text";
import { capitalise, checkIds, fill, type CheckId, type Content, type Model } from "./content";
import { descriptionOf, fullTextOf, sectionIds, type Inputs } from "./inputs";

export type Reason = { text: string; points: number };
export type CheckResult = { id: CheckId; name: string; points: number; max: number; reasons: Reason[] };
export type Fix = { check: CheckId; name: string; points: number; action: string; example: string; needs?: string[] };
export type QuickWin = { id: string; text: string };
export type Band = Model["bands"][number];

export type Score = {
  version: number;
  total: number;
  band: Band;
  checks: CheckResult[];
  fixes: Fix[];
  quickWins: QuickWin[];
  needs: NeedResult[];
  /** True when no guest type was picked and the core needs were used. */
  coreNeeds: boolean;
  analysis: Analysis;
  descriptionLength: number;
};

const quote = (s: string) => `‘${s}’`;
const list = (spans: Span[], n = 4) => spans.slice(0, n).map((s) => quote(s.text)).join(", ") + (spans.length > n ? "…" : "");

export const bandFor = (total: number, model: Model): Band => [...model.bands].sort((a, b) => a.min - b.min).filter((b) => total >= b.min).pop() ?? model.bands[0];

/** Station or landmark in the title (a trailing transport word such as "station" is optional). The town doesn't count: search already shows it. */
function placeInTitle(title: string, i: Inputs, model: Model): Span | null {
  for (const v of [i.station, i.landmark]) {
    const value = v.trim();
    if (!value) continue;
    const hit = containsPhrase(title, value);
    if (hit) return hit;
    const tail = findPhrases(value, model.location.transportWords).find((s) => s.end === value.length && s.start > 0);
    if (tail) {
      const short = value.slice(0, tail.start).trim();
      const h = short && containsPhrase(title, short);
      if (h) return h;
    }
  }
  return null;
}

/** Tokens for fix examples, with bracketed placeholders for missing details. */
export function exampleVars(i: Inputs, model: Model, limit: number, now?: Date) {
  const p = model.placeholders;
  const type = model.propertyTypeWords.includes(i.propertyType) ? i.propertyType : p.type;
  return {
    station: i.station.trim() || p.station,
    landmark: i.landmark.trim() || p.landmark,
    place: i.station.trim() || i.landmark.trim() || p.place,
    town: i.town.trim() || p.town,
    type,
    Type: capitalise(type),
    limit,
    month: now ? now.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" }) : "[month]",
    n: 8,
  };
}

/** `now` fills the month in example sentences; without it a "[month]" placeholder is used (keeps the server render stable). */
export function scoreListing(i: Inputs, content: Content, now?: Date): Score {
  const { model, limits } = content;
  const len = (s: string) => countChars(s, content.counting);
  const P = model.points;
  const R = model.reasons;
  const text = fullTextOf(i);
  const a = analyseText(text, model);
  const desc = descriptionOf(i);
  const title = i.title.trim();
  const checkMax = (id: CheckId) => model.checks.find((c) => c.id === id)?.max ?? 0;
  const checkName = (id: CheckId) => model.checks.find((c) => c.id === id)?.name ?? id;
  const missedParts: Partial<Record<CheckId, string[]>> = {};
  const results: Record<CheckId, CheckResult> = {} as Record<CheckId, CheckResult>;
  const put = (id: CheckId, reasons: Reason[], cap?: number) => {
    const raw = reasons.reduce((s, r) => s + r.points, 0);
    const max = checkMax(id);
    results[id] = { id, name: checkName(id), points: Math.max(0, Math.min(cap ?? max, raw)), max, reasons };
  };
  const miss = (id: CheckId, part: string) => (missedParts[id] ??= []).push(part);

  /* A. Title */
  {
    const n = len(title);
    const reasons: Reason[] = [];
    if (n >= 1 && n <= limits.title) reasons.push({ text: fill(R.titleLength, { n, limit: limits.title }), points: P.A.length });
    else {
      reasons.push({ text: n === 0 ? R.titleEmpty : fill(R.titleTooLong, { n, limit: limits.title }), points: 0 });
      miss("A", "length");
    }
    const type = findPhrases(title, model.propertyTypeWords)[0];
    reasons.push(type ? { text: fill(R.titleType, { word: type.text }), points: P.A.type } : { text: R.titleNoType, points: 0 });
    if (!type) miss("A", "type");
    const place = placeInTitle(title, i, model);
    reasons.push(place ? { text: fill(R.titlePlace, { word: place.text }), points: P.A.place } : { text: R.titleNoPlace, points: 0 });
    if (!place) miss("A", "place");
    // A key amenity, or a number with a unit ("8 min", "45 m²"). A bare number such as "2-bed" doesn't count.
    const feature = findPhrases(title, model.titleFeatureWords)[0]?.text ?? title.match(unitsRegex(model.units))?.[0];
    reasons.push(feature ? { text: fill(R.titleFeature, { word: feature }), points: P.A.feature } : { text: R.titleNoFeature, points: 0 });
    if (!feature) miss("A", "feature");
    put("A", reasons);
  }

  /* B. Facts with units */
  {
    const n = a.units.length;
    const pts = P.B.steps[Math.min(n, P.B.steps.length - 1)];
    put("B", [{ text: n ? fill(R.units, { n, list: list(a.units) }) : R.noUnits, points: pts }]);
  }

  /* C. Location precision */
  {
    const n = a.phrases.length;
    const reasons: Reason[] = [{ text: n ? fill(R.phrases, { n, list: list(a.phrases, 3) }) : R.noPhrases, points: P.C.steps[Math.min(n, P.C.steps.length - 1)] }];
    const t = a.phrases.find((p) => p.transport);
    if (t) reasons.push({ text: fill(R.transport, { word: t.transport! }), points: P.C.transportBonus });
    else if (n) reasons.push({ text: R.noTransport, points: 0 });
    if (n < P.C.steps.length - 1) miss("C", "phrases");
    if (!t) miss("C", "transport");
    put("C", reasons, P.C.max);
  }

  /* D. Guest-needs coverage */
  const ids = needsFor(i.guestTypes, model.guestTypes, model.coreNeeds);
  const needs = evaluateNeeds(ids, model.needs, a, { amenities: i.amenities, parkingStated: !!i.parking, bedSizes: i.bedSizes });
  {
    const covered = needs.filter((x) => x.covered).length;
    const total = needs.length;
    const pts = total ? Math.floor((P.D.max * covered) / total + 0.5 + 1e-9) : P.D.max;
    const source = i.guestTypes.length ? "your guest types" : "core needs";
    put("D", [
      { text: fill(R.needsCovered, { covered, total, source }), points: pts },
      ...needs.map((x) => ({ text: fill(x.covered ? R.needCovered : R.needMissing, { label: x.label }), points: 0 })),
    ]);
  }

  /* E. Vague words */
  {
    const counts = new Map<string, number>();
    for (const v of a.vague) counts.set(v.term, (counts.get(v.term) ?? 0) + 1);
    const reasons: Reason[] = [{ text: a.vague.length ? `${a.vague.length} vague word${a.vague.length === 1 ? "" : "s"}` : R.vagueNone, points: P.E.max }];
    for (const [term, n] of counts) reasons.push({ text: fill(R.vagueHit, { word: term, n }), points: -P.E.perHit * n });
    put("E", reasons);
  }

  /* F. Key amenities stated */
  {
    const reasons: Reason[] = P.F.amenities.map((id) => {
      const label = model.amenities.find((x) => x.id === id)?.label ?? id;
      const on = i.amenities.includes(id);
      return { text: fill(on ? R.amenityYes : R.amenityNo, { label }), points: on ? P.F.each : 0 };
    });
    if (P.F.parkingStated) {
      const opt = model.parkingOptions.find((o) => o.id === i.parking);
      reasons.push(opt ? { text: fill(R.parkingYes, { label: opt.label }), points: P.F.each } : { text: R.parkingNo, points: 0 });
    }
    put("F", reasons);
  }

  /* G. Room details */
  put("G", [
    { text: i.captions ? R.captionsYes : R.captionsNo, points: i.captions ? P.G.captions : 0 },
    { text: i.bedSizes ? R.bedsYes : R.bedsNo, points: i.bedSizes ? P.G.beds : 0 },
  ]);
  if (!i.captions) miss("G", "captions");
  if (!i.bedSizes) miss("G", "beds");

  /* H. Clarity and honesty */
  {
    const H = P.H;
    const reasons: Reason[] = [{ text: i.honest ? R.honestYes : R.honestNo, points: i.honest ? H.honest : 0 }];
    if (!i.honest) miss("H", "honest");
    const n = len(desc);
    if (n < H.minChars) {
      reasons.push({ text: fill(R.tooShort, { n, minChars: H.minChars }), points: 0 });
      miss("H", "length");
    } else {
      const para = /\n/.test(desc);
      reasons.push({ text: para ? R.paragraphsYes : R.paragraphsNo, points: para ? H.paragraphs : 0 });
      if (!para) miss("H", "paragraphs");
      const s = Math.max(1, sentences(desc).length);
      const avg = Math.round((words(desc).length / s) * 10) / 10;
      const short = words(desc).length / s <= H.maxSentenceWords;
      reasons.push({ text: fill(short ? R.sentencesYes : R.sentencesNo, { n: avg, max: H.maxSentenceWords }), points: short ? H.sentences : 0 });
      if (!short) miss("H", "sentences");
      const caps = capsWords(desc, H.capsMinLetters).length;
      const marks = (desc.match(/!/g) ?? []).length;
      const calm = caps <= H.maxCapsWords && marks <= H.maxExclamations;
      reasons.push({ text: fill(calm ? R.shoutingYes : R.shoutingNo, { caps, marks, maxCaps: H.maxCapsWords, maxMarks: H.maxExclamations }), points: calm ? H.shouting : 0 });
      if (!calm) miss("H", "shouting");
    }
    put("H", reasons);
  }

  const checks = checkIds.map((id) => results[id]);
  const total = checks.reduce((s, c) => s + c.points, 0);
  const vars = exampleVars(i, model, limits.title, now);
  const fixes = topFixes(checks, missedParts, needs, a, i, model, vars);
  return {
    version: model.version,
    total,
    band: bandFor(total, model),
    checks,
    fixes,
    quickWins: quickWins(i, a, content),
    needs,
    coreNeeds: !i.guestTypes.length,
    analysis: a,
    descriptionLength: len(desc),
  };
}

/** Sub-item points, so a check's fix leads with its biggest missed part. */
function partPoints(model: Model, check: CheckId, part: string): number {
  const P = model.points as unknown as Record<string, Record<string, number>>;
  if (check === "H" && part === "length") return P.H.paragraphs + P.H.sentences + P.H.shouting;
  if (check === "C") return part === "transport" ? model.points.C.transportBonus : model.points.C.max;
  return P[check]?.[part] ?? 0;
}

function topFixes(
  checks: CheckResult[],
  parts: Partial<Record<CheckId, string[]>>,
  needs: NeedResult[],
  a: Analysis,
  i: Inputs,
  model: Model,
  vars: Record<string, string | number>,
): Fix[] {
  const order = (id: CheckId) => {
    const n = model.fixPriority.indexOf(id);
    return n < 0 ? 99 : n;
  };
  const F = model.fixes as unknown as Record<string, Record<string, { action: string; example: string }> & { action?: string; example?: string }>;
  return checks
    .map((c) => ({ c, missed: c.max - c.points }))
    .filter((x) => x.missed > 0)
    .sort((x, y) => y.missed - x.missed || order(x.c.id) - order(y.c.id))
    .slice(0, model.topFixes)
    .map(({ c, missed }) => {
      const base = { check: c.id, name: c.name, points: missed };
      const f = F[c.id];
      if (c.id === "D") {
        const open = needs.filter((x) => !x.covered);
        const labels = open.map((x) => x.label);
        return { ...base, action: fill(f.action!, { needs: joinList(labels) }), example: fill(fill(f.example!, { suggestion: open[0]?.suggestion ?? "" }), vars), needs: labels };
      }
      if (c.id === "E") {
        const v = a.vague[0];
        return { ...base, action: f.action!, example: v ? capitalise(fill(f.example!, { word: v.text, suggestion: v.suggestion })) : "" };
      }
      if (c.id === "F") {
        const missing = model.points.F.amenities.filter((id) => !i.amenities.includes(id)).map((id) => model.amenities.find((x) => x.id === id)?.label ?? id);
        if (model.points.F.parkingStated && !i.parking) missing.push("parking situation");
        return { ...base, action: fill(f.action!, { amenities: joinList(missing) }), example: fill(f.example!, vars) };
      }
      if (typeof f.action === "string") return { ...base, action: fill(f.action, vars), example: fill(f.example ?? "", vars) };
      const open = (parts[c.id] ?? []).slice().sort((p, q) => partPoints(model, c.id, q) - partPoints(model, c.id, p));
      const part = f[open[0] ?? ""] ?? Object.values(f)[0];
      const extra = { minChars: model.points.H.minChars, maxWords: model.points.H.maxSentenceWords };
      return { ...base, action: fill(part.action, { ...vars, ...extra }), example: fill(part.example, { ...vars, ...extra }) };
    });
}

/** Mismatches between text and amenities, over-length fields and a missing Wi-Fi speed. No points. */
export function quickWins(i: Inputs, a: Analysis, content: Content): QuickWin[] {
  const { model, limits } = content;
  const len = (s: string) => countChars(s, content.counting);
  const Q = model.quickWins;
  const out: QuickWin[] = [];
  const parkingKnown = ["free", "paid", "permit"].includes(i.parking);
  for (const am of model.amenities) {
    const phrases = am.evidence.filter((e) => !e.startsWith("@"));
    const mentioned = !!findEvidence(a, phrases)[0] || (am.evidence.includes("@mbps") && a.mbps.length > 0);
    const ticked = i.amenities.includes(am.id) || (am.id === "parking" && parkingKnown);
    if (am.suggestTick && mentioned && !i.amenities.includes(am.id) && !(am.id === "parking" && i.parking === "none")) out.push({ id: `tick:${am.id}`, text: fill(Q.tick, { amenity: am.label }) });
    if (ticked && !mentioned) out.push({ id: `mention:${am.id}`, text: fill(Q.mention, { amenity: am.mention }) });
  }
  const over = len(i.title.trim()) - limits.title;
  if (over > 0) out.push({ id: "shorten:title", text: fill(Q.shorten, { field: "title", n: over }) });
  if (!i.oneBox)
    for (const id of sectionIds) {
      const s = limits.sections.find((x) => x.id === id);
      const o = s ? len(i.sections[id].trim()) - s.limit : 0;
      if (s && o > 0) out.push({ id: `shorten:${id}`, text: fill(Q.shorten, { field: `‘${s.label}’`, n: o }) });
    }
  if (i.wifiSpeed === true && !a.mbps.length) out.push({ id: "wifi-speed", text: Q.wifiSpeed });
  return out;
}

/** "What this means", chosen by band. */
export function whatThisMeans(s: Score, model: Model): string {
  const t = (model.meaning as Record<string, string>)[s.band.id] ?? "";
  return fill(t, { points: s.fixes.reduce((n, f) => n + f.points, 0) });
}

/** Wi-Fi speed answer: the host's override, or detected from the text. */
export const wifiSpeedStated = (i: Inputs, a: Analysis) => (i.wifiSpeed === null ? a.mbps.length > 0 : i.wifiSpeed);

/** Plain-text fix list for "Copy fix list". */
export function fixListText(s: Score): string {
  const lines = [`AI-readiness score: ${s.total} / 100 (${s.band.label})`, "", "Top fixes:"];
  s.fixes.forEach((f, n) => lines.push(`${n + 1}. ${f.name} (+${f.points} points available): ${f.action}`, `   Example: ${f.example}`));
  if (s.quickWins.length) {
    lines.push("", "Quick wins:");
    for (const q of s.quickWins) lines.push(`- ${q.text}`);
  }
  return lines.join("\n");
}
