/**
 * Live checks around the output, reusing the AI-readiness scorer's own
 * scoring, analyser, needs dictionary and vague list (never a copy).
 */

import { defaultInputs, scoreListing, type CheckId, type Inputs } from "@/lib/tools/ai-readiness";
import { analyseText, evaluateNeeds, needsFor, type NeedResult, type VagueHit } from "@/lib/tools/listing-text";
import { fill, type Content, type SectionId } from "./content";
import type { Built } from "./build";
import { validPlaces } from "./build";
import type { Facts } from "./facts";

/** The scorer checks the mini score uses: B, C, D, E and H (65 points). */
export const MINI_CHECKS: CheckId[] = ["B", "C", "D", "E", "H"];

const SCORER_TYPES = ["flat", "house", "cottage", "studio", "room", "other"];
const PARKING: Record<string, string> = { drivewayFree: "free", streetFree: "free", permit: "permit", paidNearby: "paid", none: "none" };

/** The scorer's amenities that the host's facts tick. */
export function amenitiesFrom(f: Facts): string[] {
  const a = new Set<string>();
  if (f.wifiMbps) a.add("wifi");
  if (f.workspace !== "none") a.add("workspace");
  if (f.laundry.includes("washer")) a.add("washer");
  if (["keypad", "keySafe", "smartLock"].includes(f.checkIn)) a.add("selfCheckin");
  if (f.kitchen.length) a.add("kitchen");
  if (f.parking && f.parking !== "none") a.add("parking");
  if (f.outdoor.includes("Garden") || f.outdoor === "patio") a.add("garden");
  if (f.family.includes("travelCot") || f.beds.includes("cot")) a.add("cot");
  if (f.family.includes("highChair")) a.add("highChair");
  if (f.dogs) a.add("pets");
  if (f.lift === true) a.add("lift");
  if (f.floor === "ground") a.add("stepFree");
  return [...a];
}

/** The four sections and the host's details, as the AI-readiness scorer's inputs. */
export function toScorerInputs(f: Facts, sections: Record<SectionId, string>, title = ""): Inputs {
  const places = validPlaces(f);
  const station = places.find((p) => p.type === "station")?.name ?? "";
  const landmark = places.find((p) => p.type !== "station")?.name ?? "";
  return {
    ...defaultInputs(),
    title,
    sections: { description: sections.listing, space: sections.space, access: sections.access, notes: sections.notes },
    oneBox: false,
    town: f.town,
    station,
    landmark,
    propertyType: SCORER_TYPES.includes(f.propertyType) ? f.propertyType : f.bedrooms === 0 ? "studio" : "other",
    bedrooms: f.bedrooms,
    maxGuests: f.maxGuests ?? defaultInputs().maxGuests,
    guestTypes: f.guestTypes.slice(0, 3),
    amenities: amenitiesFrom(f),
    parking: PARKING[f.parking] ?? "",
    captions: false,
    bedSizes: f.bedrooms === 0 ? !!f.beds[0] : f.beds.slice(0, f.bedrooms).every(Boolean),
    wifiSpeed: f.wifiMbps ? true : null,
    honest: f.honest.length > 0 || !!f.honestCustom.trim(),
  };
}

export type Readiness = { points: number; max: number; checks: { id: CheckId; name: string; points: number; max: number }[] };

/** The mini readiness score: the scorer's B, C, D, E and H checks on all four sections combined. */
export function readiness(f: Facts, built: Built, c: Content): Readiness {
  const s = scoreListing(toScorerInputs(f, built.sections), c.scorer);
  const checks = s.checks.filter((x) => MINI_CHECKS.includes(x.id)).map((x) => ({ id: x.id, name: x.name, points: x.points, max: x.max }));
  return { points: checks.reduce((n, x) => n + x.points, 0), max: checks.reduce((n, x) => n + x.max, 0), checks };
}

/** Guest-needs panel: for each selected guest type, its needs with covered or not (scorer's dictionary and evidence). */
export function needsPanel(f: Facts, built: Built, c: Content): { guest: string; label: string; needs: NeedResult[] }[] {
  const M = c.scorer.model;
  const text = [built.sections.listing, built.sections.space, built.sections.access, built.sections.notes].filter(Boolean).join("\n");
  const a = analyseText(text, M);
  const inputs = toScorerInputs(f, built.sections);
  const facts = { amenities: inputs.amenities, parkingStated: ["free", "paid", "permit", "none"].includes(inputs.parking), bedSizes: inputs.bedSizes };
  return f.guestTypes
    .map((g) => M.guestTypes.find((x) => x.id === g))
    .filter((g): g is (typeof M.guestTypes)[number] => !!g)
    .map((g) => ({ guest: g.id, label: g.label, needs: evaluateNeeds(needsFor([g.id], M.guestTypes, M.coreNeeds), M.needs, a, facts) }));
}

/** Vague words in what the host typed (standout, custom honest note, parking note, sign-off), with suggestions. */
export function vagueHits(text: string, c: Content): VagueHit[] {
  return analyseText(text, c.scorer.model).vague;
}

/** "What this means": two sentences chosen by state. */
export function whatThisMeans(built: Built, r: Readiness, panel: ReturnType<typeof needsPanel>, c: Content): string {
  const M = c.templates.meaning;
  if (built.overLimitBy > 0) return fill(M.over, { n: built.overLimitBy });
  for (const g of panel) {
    const miss = g.needs.find((n) => !n.covered);
    if (miss) return fill(M.missing, { need: miss.label.toLowerCase(), guest: g.label.toLowerCase() });
  }
  return r.points >= M.goodFrom ? M.good : M.building;
}
