/**
 * Guest search simulator: an ILLUSTRATION of whether the listing states the
 * facts a guest is asking for. It maps the guest's words to needs with the
 * stored trigger dictionary; it doesn't reproduce Airbnb's search.
 */

import { analyseText, evaluateNeed, findPhrases, normalise, snippet, words, type Analysis, type NeedResult } from "@/lib/tools/listing-text";
import { joinList } from "@/lib/tools/format";
import { fill, type Content } from "./content";
import { fullTextOf, type Inputs } from "./inputs";
import { exampleVars } from "./score";

export type SimRow = {
  id: string;
  label: string;
  covered: boolean;
  /** "Found: …" text: a snippet with the match, or an amenity note. */
  found: { before: string; match: string; after: string } | string | null;
  /** "Missing. Add: …" */
  suggestion: string;
};

export type Simulation = {
  query: string;
  rows: SimRow[];
  notChecked: string[];
  covered: number;
  total: number;
  verdict: "all" | "some" | "none" | "nothing";
  summary: string;
  verdictText: string;
  notCheckedText: string;
};

function foundText(r: NeedResult, text: string, i: Inputs, content: Content): SimRow["found"] {
  const { model } = content;
  const L = model.simulator.labels;
  const e = r.evidence;
  if (!e) return null;
  if (e.kind === "text") return snippet(text, e.span, 60);
  if (e.kind === "beds") return L.foundBeds;
  if (e.kind === "parking") return fill(L.foundParking, { label: model.parkingOptions.find((o) => o.id === i.parking)?.label ?? "" });
  const am = model.amenities.find((x) => x.id === e.amenity);
  return fill(L.foundAmenity, { amenity: am?.label ?? e.amenity });
}

export function simulateSearch(query: string, i: Inputs, content: Content, analysis?: Analysis, now: Date = new Date()): Simulation {
  const { model } = content;
  const S = model.simulator;
  const text = fullTextOf(i);
  const a = analysis ?? analyseText(text, model);
  const facts = { amenities: i.amenities, parkingStated: !!i.parking, bedSizes: i.bedSizes };
  const q = query.trim().slice(0, 200);
  const vars = exampleVars(i, model, content.limits.title, now);

  // 1. Query words → needs (longest trigger phrases first).
  const triggerWords = S.triggers.flatMap((t) => t.words);
  const hits = findPhrases(q, triggerWords);
  const needIds: string[] = [];
  for (const h of hits) {
    const key = normalise(h.text).replace(/ /g, "");
    const t = S.triggers.find((x) => x.words.some((w) => normalise(w).replace(/ /g, "") === key));
    for (const n of t?.needs ?? []) if (!needIds.includes(n)) needIds.push(n);
  }
  const used = (at: number) => hits.some((h) => at >= h.start && at < h.end);

  // 2. Words left over: a place the host named (station or landmark), or "not checked".
  const ignore = new Set(S.ignore.map((w) => w.toLowerCase()));
  const leftovers: string[] = [];
  const re = /[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu;
  for (const m of q.matchAll(re)) if (!used(m.index) && !ignore.has(m[0].toLowerCase()) && !leftovers.includes(m[0].toLowerCase())) leftovers.push(m[0].toLowerCase());

  const rows: SimRow[] = [];
  for (const id of needIds) {
    const need = model.needs.find((n) => n.id === id);
    if (!need) continue;
    const r = evaluateNeed(need, a, facts);
    rows.push({ id, label: need.label, covered: r.covered, found: foundText(r, text, i, content), suggestion: fill(need.suggestion, vars) });
  }

  const notChecked: string[] = [];
  const places = [i.station, i.landmark, i.town].map((p) => p.trim()).filter(Boolean);
  for (const w of leftovers) {
    const place = w.length >= 3 ? places.find((p) => words(p).some((x) => x.toLowerCase() === w)) : undefined;
    if (!place) {
      notChecked.push(w);
      continue;
    }
    const p = a.phrases.find((ph) => findPhrases(ph.sentence.text, [w]).length > 0);
    rows.push({
      id: `place:${w}`,
      label: fill(S.labels.place, { place }),
      covered: !!p,
      found: p ? snippet(text, p, 60) : null,
      suggestion: fill(S.labels.placeSuggestion, { n: 8, place }),
    });
  }

  const covered = rows.filter((r) => r.covered).length;
  const total = rows.length;
  const verdict: Simulation["verdict"] = !total ? "nothing" : covered === total ? "all" : covered ? "some" : "none";
  return {
    query: q,
    rows,
    notChecked,
    covered,
    total,
    verdict,
    summary: total ? fill(S.labels.summary, { covered, total }) : "",
    verdictText: S.labels[verdict],
    notCheckedText: notChecked.length ? fill(S.labels.notChecked, { words: joinList(notChecked) }) : "",
  };
}
