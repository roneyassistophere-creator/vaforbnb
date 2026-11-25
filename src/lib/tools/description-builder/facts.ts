/** The host's facts from the 6-step form. Saved on their device only; never sent anywhere. */

import type { Templates } from "./content";

export type Place = { name: string; minutes: number | null; mode: string; type: string };
export type HouseRuleHighlights = { checkin: string; checkout: string; pets: string; maxPets: number | null; parties: boolean };

export type Facts = {
  /* Step 1: basics */
  propertyType: string;
  /** 0 = studio. */
  bedrooms: number;
  maxGuests: number | null;
  sizeM2: number | null;
  area: string;
  town: string;
  /** "", ground, 1, 2, 3 (3 = third or above). */
  floor: string;
  /** null = not answered. */
  lift: boolean | null;
  /* Step 2 */
  standout: string;
  guestTypes: string[];
  /* Step 3 */
  beds: string[];
  ensuites: boolean[];
  bathrooms: number;
  bathTypes: string[];
  workspace: "none" | "desk" | "deskChair" | "full";
  workspaceLocation: string;
  wifiMbps: number | null;
  kitchen: string[];
  laundry: string[];
  heating: string[];
  outdoor: string;
  outdoorSeating: number | null;
  family: string[];
  dogs: boolean;
  maxDogs: number | null;
  quiet: string[];
  /* Step 4 */
  checkIn: string;
  /** "HH:MM" (24-hour) or "". */
  checkInTime: string;
  checkOutTime: string;
  parking: string;
  parkingSpaces: number | null;
  parkingNote: string;
  privacy: "whole" | "privateRoom";
  sharedAreas: string[];
  longStays: boolean;
  /* Step 5 */
  places: Place[];
  /* Step 6 */
  honest: string[];
  honestCustom: string;
  tone: "plain" | "warm";
  hook: "feature" | "place" | "guest";
  signOff: string;
  /** Imported from the House rules generator, if chosen. */
  houseRules: HouseRuleHighlights | null;
};

export const LIMITS = { bedrooms: 20, guests: 30, size: 2000, bathrooms: 10, mbps: 10000, seating: 40, dogs: 5, spaces: 20, minutes: 120, places: 5, text: 80 };

export const defaultFacts = (): Facts => ({
  propertyType: "flat",
  bedrooms: 1,
  maxGuests: null,
  sizeM2: null,
  area: "",
  town: "",
  floor: "",
  lift: null,
  standout: "",
  guestTypes: [],
  beds: [""],
  ensuites: [false],
  bathrooms: 1,
  bathTypes: [],
  workspace: "none",
  workspaceLocation: "",
  wifiMbps: null,
  kitchen: [],
  laundry: [],
  heating: [],
  outdoor: "",
  outdoorSeating: null,
  family: [],
  dogs: false,
  maxDogs: null,
  quiet: [],
  checkIn: "",
  checkInTime: "",
  checkOutTime: "",
  parking: "",
  parkingSpaces: null,
  parkingNote: "",
  privacy: "whole",
  sharedAreas: [],
  longStays: false,
  places: [],
  honest: [],
  honestCustom: "",
  tone: "plain",
  hook: "feature",
  signOff: "",
  houseRules: null,
});

/** Keep the per-bedroom lists the same length as the bedroom count (at least 1, for a studio's sleeping area). */
export function sizeBedrooms(f: Facts, n: number): Facts {
  const len = Math.max(1, n);
  const fit = <T>(xs: T[], d: T) => Array.from({ length: len }, (_, i) => xs[i] ?? d);
  return { ...f, bedrooms: n, beds: fit(f.beds, ""), ensuites: fit(f.ensuites, false) };
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max = LIMITS.text) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, min: number, max: number): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);
const strs = (v: unknown, max = 20) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 40)))].slice(0, max) : []);
const time = (v: unknown) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "");

export function cleanPlaces(v: unknown): Place[] {
  return (Array.isArray(v) ? v : [])
    .filter(isObj)
    .map((p) => ({ name: str(p.name, 60), minutes: num(p.minutes, 1, LIMITS.minutes), mode: str(p.mode, 10) || "walk", type: str(p.type, 20) || "other" }))
    .slice(0, LIMITS.places);
}

function cleanHouseRules(v: unknown): HouseRuleHighlights | null {
  if (!isObj(v)) return null;
  const pets = ["no", "yes", "ask"].includes(v.pets as string) ? (v.pets as string) : "";
  return { checkin: time(v.checkin), checkout: time(v.checkout), pets, maxPets: num(v.maxPets, 1, 10), parties: v.parties === true };
}

/** Make saved (possibly old or edited) facts safe to use. Text limits come from the stored templates. */
export function cleanFacts(x: unknown, t?: Pick<Templates, "inputLimits">): Facts {
  const d = defaultFacts();
  if (!isObj(x)) return d;
  const L = t?.inputLimits ?? { standout: 60, honestCustom: 100, signOff: 60, parkingNote: 80 };
  const f: Facts = {
    propertyType: str(x.propertyType, 20) || d.propertyType,
    bedrooms: num(x.bedrooms, 0, LIMITS.bedrooms) ?? d.bedrooms,
    maxGuests: num(x.maxGuests, 1, LIMITS.guests),
    sizeM2: num(x.sizeM2, 1, LIMITS.size),
    area: str(x.area, 60),
    town: str(x.town, 60),
    floor: ["ground", "1", "2", "3"].includes(x.floor as string) ? (x.floor as string) : "",
    lift: x.lift === true ? true : x.lift === false ? false : null,
    standout: str(x.standout, L.standout),
    guestTypes: strs(x.guestTypes, 3),
    beds: Array.isArray(x.beds) ? x.beds.map((b) => str(b, 20)) : d.beds,
    ensuites: Array.isArray(x.ensuites) ? x.ensuites.map((e) => e === true) : d.ensuites,
    bathrooms: num(x.bathrooms, 0, LIMITS.bathrooms) ?? d.bathrooms,
    bathTypes: strs(x.bathTypes),
    workspace: (["desk", "deskChair", "full"].includes(x.workspace as string) ? x.workspace : "none") as Facts["workspace"],
    workspaceLocation: str(x.workspaceLocation, 60),
    wifiMbps: num(x.wifiMbps, 1, LIMITS.mbps),
    kitchen: strs(x.kitchen),
    laundry: strs(x.laundry),
    heating: strs(x.heating),
    outdoor: str(x.outdoor, 20),
    outdoorSeating: num(x.outdoorSeating, 1, LIMITS.seating),
    family: strs(x.family),
    dogs: x.dogs === true,
    maxDogs: num(x.maxDogs, 1, LIMITS.dogs),
    quiet: strs(x.quiet),
    checkIn: str(x.checkIn, 20),
    checkInTime: time(x.checkInTime),
    checkOutTime: time(x.checkOutTime),
    parking: str(x.parking, 20),
    parkingSpaces: num(x.parkingSpaces, 1, LIMITS.spaces),
    parkingNote: str(x.parkingNote, L.parkingNote),
    privacy: x.privacy === "privateRoom" ? "privateRoom" : "whole",
    sharedAreas: strs(x.sharedAreas),
    longStays: x.longStays === true,
    places: cleanPlaces(x.places),
    honest: strs(x.honest),
    honestCustom: str(x.honestCustom, L.honestCustom),
    tone: x.tone === "warm" ? "warm" : "plain",
    hook: x.hook === "place" || x.hook === "guest" ? x.hook : "feature",
    signOff: str(x.signOff, L.signOff),
    houseRules: cleanHouseRules(x.houseRules),
  };
  return sizeBedrooms(f, f.bedrooms);
}

export const exampleFacts = (t: Templates): Facts => cleanFacts(t.example, t);

/** Required before the output is complete: the property type, the standout feature and at least one place. */
export function missingRequired(f: Facts): ("propertyType" | "standout" | "place")[] {
  const out: ("propertyType" | "standout" | "place")[] = [];
  if (!f.propertyType) out.push("propertyType");
  if (!f.standout.trim()) out.push("standout");
  if (!f.places.some((p) => p.name.trim() && p.minutes)) out.push("place");
  return out;
}

/* ---- Imports from the shared device format ------------------------------------- */

export type Imported = Partial<Facts> & { title?: string };

/**
 * Facts from a "listing-text" hand-off (written by the AI-readiness scorer and
 * the title checker today): property type, bedrooms, guests, town, guest
 * types, station or landmark as places (without minutes), and any richer
 * `facts` another tool added. Only fields that exist are returned.
 */
export function factsFromListingText(data: unknown, t?: Pick<Templates, "inputLimits">): Imported | null {
  if (!isObj(data)) return null;
  const out: Imported = {};
  const det = isObj(data.details) ? data.details : {};
  const type = str(det.propertyType, 20);
  if (type) out.propertyType = type;
  if (typeof det.bedrooms === "number") out.bedrooms = num(det.bedrooms, 0, LIMITS.bedrooms) ?? undefined;
  if (type === "studio") out.bedrooms = 0;
  if (typeof det.maxGuests === "number" && det.maxGuests > 0) out.maxGuests = num(det.maxGuests, 1, LIMITS.guests) ?? undefined;
  if (str(det.town)) out.town = str(det.town, 60);
  const guests = strs(data.guestTypes, 3);
  if (guests.length) out.guestTypes = guests;
  const names = [str(det.station, 60), str(det.landmark, 60)].filter((n) => n.trim());
  if (names.length) out.places = names.map((name) => ({ name, minutes: null, mode: "walk", type: /station|stop/i.test(name) ? "station" : "landmark" }));
  if (str(data.title, 200)) out.title = str(data.title, 200);
  // Richer facts from another tool (same field names as this form).
  if (isObj(data.facts)) {
    const facts = data.facts;
    const clean = cleanFacts({ ...defaultFacts(), bedrooms: out.bedrooms ?? facts.bedrooms ?? 1, ...facts }, t);
    for (const k of Object.keys(facts) as (keyof Facts)[]) if (k in clean) (out as Record<string, unknown>)[k] = clean[k];
  }
  return Object.keys(out).filter((k) => k !== "title").length ? out : null;
}

/** House rule highlights from the House rules generator's hand-off (its structured `highlights`), or null. */
export function highlightsFromHouseRules(data: unknown): HouseRuleHighlights | null {
  if (!isObj(data) || !isObj(data.highlights)) return null;
  const h = cleanHouseRules(data.highlights);
  return h && (h.checkin || h.checkout || h.pets || h.parties) ? h : null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Merge imported facts without overwriting what the host already filled in (a
 * field counts as filled when it differs from the default). Returns the new
 * facts, the fields filled, and the fields kept (`force` replaces those too).
 */
export function mergeImport(facts: Facts, imported: Imported, force = false): { facts: Facts; filled: string[]; kept: string[] } {
  const d = defaultFacts();
  let next: Facts = { ...facts };
  const filled: string[] = [];
  const kept: string[] = [];
  const keys = (Object.keys(imported) as (keyof Facts)[]).filter((k) => k in d).sort((a, b) => (a === "bedrooms" ? -1 : b === "bedrooms" ? 1 : 0));
  for (const k of keys) {
    const v = (imported as Record<string, unknown>)[k];
    if (v === undefined || same(v, next[k])) continue;
    if (!same(facts[k], d[k]) && !force) {
      kept.push(k);
      continue;
    }
    next = k === "bedrooms" ? sizeBedrooms(next, v as number) : ({ ...next, [k]: v } as Facts);
    filled.push(k);
  }
  return { facts: sizeBedrooms(next, next.bedrooms), filled, kept };
}
