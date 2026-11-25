/**
 * Guest needs dictionary, shared by the AI-readiness scorer, the simulator and
 * the description builder. A need is covered when the text has evidence for
 * it, or when its linked amenity is ticked.
 */

import { findEvidence, type Analysis, type Span } from "./analyse";

export type Need = {
  id: string;
  label: string;
  /** Phrases, or "@mbps" (a number + Mbps) or "@transport" (a minutes-to phrase in a sentence with a transport word). */
  evidence: string[];
  /** Amenity ids, or "@parkingStated" / "@bedSizes". */
  amenities: string[];
  suggestion: string;
};

export type GuestType = { id: string; label: string; needs: string[] };

/** What the host told us besides the text. */
export type NeedFacts = { amenities: string[]; parkingStated: boolean; bedSizes: boolean };

export type NeedEvidence =
  | { kind: "text"; span: Span }
  | { kind: "amenity"; amenity: string }
  | { kind: "parking" }
  | { kind: "beds" };

export type NeedResult = { id: string; label: string; covered: boolean; evidence: NeedEvidence | null; suggestion: string };

/** Needs for the chosen guest types (union, in order, no duplicates), or the core needs if none are chosen. */
export function needsFor(guestTypes: string[], types: GuestType[], coreNeeds: string[]): string[] {
  const chosen = types.filter((t) => guestTypes.includes(t.id));
  if (!chosen.length) return [...coreNeeds];
  return [...new Set(chosen.flatMap((t) => t.needs))];
}

/** Is this need covered? Text evidence is preferred (it gives a snippet), then the linked amenity. */
export function evaluateNeed(need: Need, a: Analysis, facts: NeedFacts): NeedResult {
  const base = { id: need.id, label: need.label, suggestion: need.suggestion };
  for (const e of need.evidence) {
    if (e === "@mbps") {
      if (a.mbps[0]) return { ...base, covered: true, evidence: { kind: "text", span: a.mbps[0] } };
    } else if (e === "@transport") {
      const p = a.phrases.find((x) => x.transport);
      if (p) return { ...base, covered: true, evidence: { kind: "text", span: p } };
    }
  }
  const phrases = need.evidence.filter((e) => !e.startsWith("@"));
  const hit = findEvidence(a, phrases)[0];
  if (hit) return { ...base, covered: true, evidence: { kind: "text", span: hit } };
  for (const am of need.amenities) {
    if (am === "@parkingStated" && facts.parkingStated) return { ...base, covered: true, evidence: { kind: "parking" } };
    if (am === "@bedSizes" && facts.bedSizes) return { ...base, covered: true, evidence: { kind: "beds" } };
    if (facts.amenities.includes(am)) return { ...base, covered: true, evidence: { kind: "amenity", amenity: am } };
  }
  return { ...base, covered: false, evidence: null };
}

export function evaluateNeeds(ids: string[], needs: Need[], a: Analysis, facts: NeedFacts): NeedResult[] {
  return ids.map((id) => needs.find((n) => n.id === id)).filter((n): n is Need => !!n).map((n) => evaluateNeed(n, a, facts));
}
