/** What the host enters in the 4 setup steps. Saved on their device only. */

import type { Rules } from "./content";

export type Place = { name: string; minutes: number | null; mode: string };

export type Setup = {
  /* Step 1: rooms */
  /** 0 = studio (a "sleeping area" shot instead of bedrooms). */
  bedrooms: number;
  /** Bed type per bedroom (index 0 = bedroom 1); "" = not set. For a studio, index 0 is the sleeping area's bed. */
  beds: string[];
  ensuites: boolean[];
  bathrooms: number;
  living: boolean;
  kitchen: boolean;
  dining: boolean;
  /** Open plan: replaces the separate kitchen and dining shots. */
  kitchenDiner: boolean;
  workspace: "none" | "desk" | "full";
  workspaceLocation: string;
  laundry: string[];
  outdoor: string[];
  /** "" = no view; otherwise canal, sea, river, city, countryside, park. */
  view: string;
  viewFrom: string;
  extras: string[];
  checkIn: string;
  parking: string;
  access: string[];
  stairs: boolean;
  lift: boolean;
  /** "", ground, 1, 2, 3, 4 (4 = fourth or higher). */
  floor: string;

  /* Step 2: what sells it */
  /** An item key from standoutOptions (e.g. "view", "outdoor:privateGarden", "livingSpace"). */
  standout: string;
  second: string;
  guestTypes: string[];

  /* Step 3: details for captions */
  wifiMbps: number | null;
  kitchenItems: string[];
  /** Blackout blinds per bedroom. */
  blackout: boolean[];
  sizeM2: number | null;
  checkInTime: string;
  parkingSpaces: number | null;
  places: Place[];
  honest: string[];

  /* Step 4: shoot day */
  season: string;
  windows: string;
  shooter: string;
};

export const LIMITS = { bedrooms: 12, bathrooms: 10, text: 60, mbps: 10000, size: 2000, spaces: 20, minutes: 180, places: 3 };

export const defaultSetup = (): Setup => ({
  bedrooms: 1,
  beds: [""],
  ensuites: [false],
  blackout: [false],
  bathrooms: 1,
  living: true,
  kitchen: true,
  dining: false,
  kitchenDiner: false,
  workspace: "none",
  workspaceLocation: "",
  laundry: [],
  outdoor: [],
  view: "",
  viewFrom: "",
  extras: [],
  checkIn: "",
  parking: "",
  access: [],
  stairs: false,
  lift: false,
  floor: "",
  standout: "",
  second: "",
  guestTypes: [],
  wifiMbps: null,
  kitchenItems: [],
  sizeM2: null,
  checkInTime: "",
  parkingSpaces: null,
  places: [],
  honest: [],
  season: "",
  windows: "",
  shooter: "",
});

/** "Try an example": the stored example (test 1), clearly labelled as example data in the tool. */
export function exampleSetup(rules: Rules): Setup {
  return cleanSetup(rules.example);
}

/** Keep the per-bedroom lists the same length as the bedroom count (at least 1, for a studio's sleeping area). */
export function sizeBedrooms(s: Setup, n: number): Setup {
  const len = Math.max(1, n);
  const fit = <T>(xs: T[], d: T) => Array.from({ length: len }, (_, i) => xs[i] ?? d);
  return { ...s, bedrooms: n, beds: fit(s.beds, ""), ensuites: fit(s.ensuites, false), blackout: fit(s.blackout, false) };
}

const str = (v: unknown, max = LIMITS.text) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, min: number, max: number): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);
const bool = (v: unknown) => v === true;
const strs = (v: unknown, max = 20) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 40)))].slice(0, max) : []);
const bools = (v: unknown) => (Array.isArray(v) ? v.map((x) => x === true) : []);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function cleanPlaces(v: unknown): Place[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isObj)
    .map((p) => ({ name: str(p.name), minutes: num(p.minutes, 1, LIMITS.minutes), mode: str(p.mode, 10) || "walk" }))
    .filter((p) => p.name.trim())
    .slice(0, LIMITS.places);
}

/** Make saved (possibly old or edited) answers safe to use. */
export function cleanSetup(x: unknown): Setup {
  const d = defaultSetup();
  if (!isObj(x)) return d;
  const workspace = x.workspace === "desk" || x.workspace === "full" ? x.workspace : "none";
  const s: Setup = {
    bedrooms: num(x.bedrooms, 0, LIMITS.bedrooms) ?? d.bedrooms,
    beds: Array.isArray(x.beds) ? x.beds.map((b) => str(b, 20)) : d.beds,
    ensuites: bools(x.ensuites),
    blackout: bools(x.blackout),
    bathrooms: num(x.bathrooms, 0, LIMITS.bathrooms) ?? d.bathrooms,
    living: x.living === undefined ? d.living : bool(x.living),
    kitchen: x.kitchen === undefined ? d.kitchen : bool(x.kitchen),
    dining: bool(x.dining),
    kitchenDiner: bool(x.kitchenDiner),
    workspace,
    workspaceLocation: str(x.workspaceLocation),
    laundry: strs(x.laundry),
    outdoor: strs(x.outdoor),
    view: str(x.view, 20),
    viewFrom: str(x.viewFrom),
    extras: strs(x.extras),
    checkIn: str(x.checkIn, 20),
    parking: str(x.parking, 20),
    access: strs(x.access),
    stairs: bool(x.stairs),
    lift: bool(x.lift),
    floor: str(x.floor, 10),
    standout: str(x.standout, 40),
    second: str(x.second, 40),
    guestTypes: strs(x.guestTypes, 3),
    wifiMbps: num(x.wifiMbps, 1, LIMITS.mbps),
    kitchenItems: strs(x.kitchenItems, 20),
    sizeM2: num(x.sizeM2, 1, LIMITS.size),
    checkInTime: str(x.checkInTime, 20),
    parkingSpaces: num(x.parkingSpaces, 1, LIMITS.spaces),
    places: cleanPlaces(x.places),
    honest: strs(x.honest),
    season: str(x.season, 10),
    windows: str(x.windows, 10),
    shooter: str(x.shooter, 10),
  };
  return sizeBedrooms(s, s.bedrooms);
}

/* ---- Import from the shared device format ---------------------------------- */

/**
 * Facts another tool can pass (the "listing-text" hand-off). Today the
 * AI-readiness scorer and title checker send bedrooms, property type, guest
 * types and places; the AI-ready description builder will add the rest.
 * Every field is optional.
 */
export type SharedFacts = Partial<Omit<Setup, "season" | "windows" | "shooter">> & { propertyType?: string; maxGuests?: number };

/** Read the facts from a "listing-text" hand-off's data (old or new shape). */
export function factsFromHandoff(data: unknown): SharedFacts | null {
  if (!isObj(data)) return null;
  const out: SharedFacts = {};
  const det = isObj(data.details) ? data.details : {};
  const facts = isObj(data.facts) ? data.facts : {};
  // Today's basics.
  if (typeof det.bedrooms === "number") out.bedrooms = num(det.bedrooms, 0, LIMITS.bedrooms) ?? undefined;
  if (str(det.propertyType) === "studio") out.bedrooms = 0;
  const guest = strs(data.guestTypes, 3);
  if (guest.length) out.guestTypes = guest;
  const names = [str(det.station), str(det.landmark)].filter((n) => n.trim());
  if (names.length) out.places = names.map((name) => ({ name, minutes: null, mode: "walk" }));
  // Richer facts (written by the description builder).
  // Size the per-bedroom lists from the import itself, so cleaning doesn't cut them to the default single bedroom.
  const lens = ["beds", "ensuites", "blackout"].map((k) => (Array.isArray(facts[k]) ? (facts[k] as unknown[]).length : 0));
  const rooms = typeof facts.bedrooms === "number" ? facts.bedrooms : (out.bedrooms ?? Math.max(1, ...lens));
  const clean = cleanSetup({ ...defaultSetup(), bedrooms: rooms, ...facts });
  for (const k of Object.keys(facts) as (keyof Setup)[]) {
    if (k in clean && k !== "season" && k !== "windows" && k !== "shooter") (out as Record<string, unknown>)[k] = clean[k];
  }
  return Object.keys(out).length ? out : null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Merge imported facts without overwriting what the host already filled in
 * (a field counts as filled when it differs from the default). Returns the
 * new setup, the fields filled from the import, and the fields kept because
 * the host had already answered them (`force` replaces those too).
 */
export function mergeImport(setup: Setup, facts: SharedFacts, force = false): { setup: Setup; filled: string[]; kept: string[] } {
  const d = defaultSetup();
  let next: Setup = { ...setup };
  const filled: string[] = [];
  const kept: string[] = [];
  const keys = Object.keys(facts).filter((k) => k in d) as (keyof Setup)[];
  // Bedrooms first, so the per-bedroom lists line up.
  keys.sort((a, b) => (a === "bedrooms" ? -1 : b === "bedrooms" ? 1 : 0));
  for (const k of keys) {
    const v = (facts as Record<string, unknown>)[k];
    if (v === undefined || same(v, next[k])) continue;
    const hostFilled = !same(setup[k], d[k]);
    if (hostFilled && !force) {
      kept.push(k);
      continue;
    }
    next = k === "bedrooms" ? sizeBedrooms(next, v as number) : ({ ...next, [k]: v } as Setup);
    filled.push(k);
  }
  return { setup: sizeBedrooms(next, next.bedrooms), filled, kept };
}
