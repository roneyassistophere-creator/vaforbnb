/**
 * Builds the four Airbnb description sections from the host's facts and the
 * stored sentence templates. Deterministic and private: it never invents a
 * fact, and an empty field simply doesn't produce a sentence.
 */

import { capitaliseFirst as cap, countChars, joinList, minutesPhrase as sharedMinutes, renderTemplate } from "@/lib/tools/listing-text";
export { joinList } from "@/lib/tools/listing-text";
import { fill, sectionIds, type Content, type SectionId, type Templates } from "./content";
import type { Facts, Place } from "./facts";

export type Moved = { id: string; label: string; to: SectionId; message: string };
export type BuildOptions = {
  /** How many of the stored "Make it fit" steps are applied (0 = none). */
  fitSteps?: number;
};
export type Built = {
  sections: Record<SectionId, string>;
  counts: Record<SectionId, number>;
  /** Characters the listing description is over its limit (0 when it fits). */
  overLimitBy: number;
  /** Listing description sentences, in order (for highlighting the longest). */
  listingSentences: string[];
  movedItems: Moved[];
  /** Fact keys that produced text. */
  usedFacts: string[];
  warnings: string[];
};

/* ---- Small pieces (exported for tests and the form) ------------------------------ */

/** "12-minute walk to Piccadilly station", "15 minutes by bus to Royal Infirmary"; short forms with `short`. */
export function minutesPhrase(place: Pick<Place, "name" | "minutes" | "mode">, t: Pick<Templates, "minutes" | "minutesShort">, short = false): string {
  return sharedMinutes(place.minutes, place.mode, place.name, short ? t.minutesShort : t.minutes);
}

/** "15:00" → "3pm", "10:30" → "10:30am". */
export function formatTime(hhmm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return "";
  const h = Number(m[1]);
  const min = m[2];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${min === "00" ? "" : `:${min}`}${h < 12 ? "am" : "pm"}`;
}

const pick = (ids: string[], words: Record<string, string>) => Object.keys(words).filter((k) => ids.includes(k)).map((k) => words[k]);
const trimEnd = (s: string) => s.trim().replace(/[.!?\s]+$/, "");
const asSentence = (s: string) => {
  const t = s.trim();
  return t ? cap(/[.!?]$/.test(t) ? t : `${t}.`) : "";
};
/** Apply the warm-tone swaps (connecting words only). */
const warmUp = (s: string, t: Templates, on: boolean) => (on ? t.warm.reduce((x, w) => x.split(w.from).join(w.to), s) : s);

/** Places with a name and minutes, in the host's order. */
export const validPlaces = (f: Facts) => f.places.filter((p) => p.name.trim() && p.minutes && p.minutes > 0);

/** "a quiet residential street with double glazing" (article) or "Quiet residential street with double glazing." */
export function quietPhrase(f: Facts, t: Templates, withArticle: boolean): string {
  const Q = t.words.quiet;
  const keys = Object.keys(Q.places).filter((k) => f.quiet.includes(k));
  const merged = Object.entries(Q.merged).find(([combo]) => combo.split("+").every((k) => keys.includes(k)));
  const rest = merged ? keys.filter((k) => !merged[0].split("+").includes(k)) : keys;
  const place = joinList([...(merged ? [merged[1]] : []), ...rest.map((k) => Q.places[k])]);
  const extras = joinList(pick(f.quiet, Q.extras));
  if (place) {
    const p = renderTemplate(Q.sentence, { place, extras });
    return withArticle ? fill(Q.article, { place: p }) : p;
  }
  return extras ? renderTemplate(Q.extrasOnly, { extras }) : "";
}

/** "king in bedroom 1, double in bedroom 2" (studio: "double bed"). */
function bedsSummary(f: Facts, t: Templates): string {
  if (f.bedrooms === 0) return t.words.bedsLong[f.beds[0] ?? ""] ?? "";
  return joinList(
    f.beds
      .slice(0, f.bedrooms)
      .map((b, i) => (t.words.bedsShort[b] ? fill(t.words.bedsSummaryItem, { bed: t.words.bedsShort[b], n: i + 1 }) : ""))
      .filter(Boolean),
  ).replace(/ and ([^,]+)$/, ", $1");
}

/** Values shared by many templates. */
function baseVars(f: Facts, t: Templates, short: boolean): Record<string, string> {
  const W = t.words;
  const places = validPlaces(f);
  const transport = places.find((p) => t.transportTypes.includes(p.type) || t.transportModes.includes(p.mode));
  return {
    type: W.types[f.propertyType] ?? f.propertyType,
    n: String(f.bedrooms),
    where: (f.area.trim() || f.town.trim()).trim(),
    standout: trimEnd(f.standout),
    guestList: joinList(f.guestTypes.map((g) => W.guests[g] ?? g)),
    mbps: f.wifiMbps ? String(f.wifiMbps) : "",
    workspaceKit: W.workspace[f.workspace] ?? "",
    workspaceLocation: f.workspaceLocation.trim().replace(/^in\s+/i, ""),
    quietFact: quietPhrase(f, t, true),
    transportPlace: transport ? minutesPhrase(transport, t, short) : "",
    parkingFact: t.parkingFacts[f.parking] ?? "",
    method: W.checkIn[f.checkIn] ?? "",
    kitchen: joinList(pick(f.kitchen, W.kitchen)),
    laundry: joinList(pick(f.laundry, W.laundry)),
    heating: joinList(pick(f.heating, W.heating)),
    family: joinList(pick(f.family, W.family)),
    outdoor: W.outdoor[f.outdoor] ?? "",
    stepFree: f.floor === "ground" ? t.stepFreeFacts.ground : f.lift === true ? t.stepFreeFacts.lift : "",
    bedsSummary: bedsSummary(f, t),
    floorPhrase: W.floors[f.floor] ?? "",
  };
}

/** Needs whose phrase has no token are only true when the host said so. */
const NEED_GATES: Record<string, (f: Facts) => boolean> = { pets: (f) => f.dogs, "long-stay": (f) => f.longStays };

/** The first `max` available facts for the first guest type, in the stored needs dictionary's order. */
export function idealForFacts(f: Facts, c: Content, short: boolean, max = 2): { need: string; text: string }[] {
  const first = f.guestTypes[0];
  if (!first) return [];
  const M = c.scorer.model;
  const g = M.guestTypes.find((x) => x.id === first);
  if (!g) return [];
  const order = M.needs.map((n) => n.id);
  const vars = baseVars(f, c.templates, short);
  return [...g.needs]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((need) => ({ need, text: (NEED_GATES[need]?.(f) ?? true) ? renderTemplate(c.templates.needFacts[need] ?? "", vars) : "" }))
    .filter((x) => x.text)
    .slice(0, max);
}

function honestShort(f: Facts, t: Templates): string {
  const first = t.honest.find((h) => f.honest.includes(h.id));
  if (first) {
    const vars = { floorPhrase: t.words.floors[f.floor] ?? "" };
    return renderTemplate(first.short, vars) || first.shortFallback || "";
  }
  return trimEnd(f.honestCustom);
}

function honestSentences(f: Facts, t: Templates): string[] {
  const vars = { floorPhrase: t.words.floors[f.floor] ?? "", type: t.words.types[f.propertyType] ?? "" };
  const out = t.honest.filter((h) => f.honest.includes(h.id)).map((h) => renderTemplate(h.sentence, vars) || h.sentenceFallback || "");
  if (f.honestCustom.trim()) out.push(asSentence(f.honestCustom));
  return out.filter(Boolean);
}

/* ---- The builder ------------------------------------------------------------------ */

export function buildDescription(f: Facts, c: Content, options: BuildOptions = {}): Built {
  const t = c.templates;
  const L = t.listing;
  const W = t.words;
  const steps = t.fitSteps.slice(0, Math.max(0, options.fitSteps ?? 0)).map((s) => s.id);
  const on = (id: string) => steps.includes(id as (typeof steps)[number]);
  const short = on("short");
  const warm = f.tone === "warm";
  const v = baseVars(f, t, short);
  const used = new Set<string>();
  const moved: Moved[] = [];
  const places = validPlaces(f);
  const phrase = (p?: Place) => (p ? minutesPhrase(p, t, short) : "");
  const msg = (id: string, to: SectionId) => {
    const step = t.fitSteps.find((s) => s.id === id)!;
    moved.push({ id, label: step.label, to, message: id === "short" ? fill(t.fitMessages.shortened, { section: c.names.listing }) : fill(t.fitMessages.moved, { item: `‘${step.label}’`, section: c.names[to] }) });
  };

  /* Listing description */
  const listing: string[] = [];
  const hookKind = f.hook === "guest" && !f.guestTypes.length ? "feature" : f.hook;
  const hookT = f.bedrooms === 0 ? t.listing.studioHooks[hookKind] : L.hooks[hookKind];
  const hook = renderTemplate(hookT, { ...v, bedroomsPhrase: fill(L.bedroomsPhrase, { n: f.bedrooms }), Place1: cap(phrase(places[0])) });
  if (hook) listing.push(hook);
  ["propertyType", "standout"].forEach((k) => used.add(k));
  if (v.where) used.add(f.area.trim() ? "area" : "town");
  if (places[0]) used.add("places");

  const facts = idealForFacts(f, c, short);
  const dropFact2 = on("fact2") && facts.length > 1;
  const factList = dropFact2 ? facts.slice(0, 1) : facts;
  if (factList.length) {
    const s = renderTemplate(hookKind === "guest" ? L.idealForGuestHook : L.idealFor, { guestList: v.guestList, facts: joinList(factList.map((x) => x.text)) });
    if (s) listing.push(cap(s));
    used.add("guestTypes");
  }
  if (dropFact2) msg("fact2", "space");

  const key = renderTemplate(L.keyFacts, { size: f.sizeM2 ? String(f.sizeM2) : "", maxGuests: f.maxGuests ? String(f.maxGuests) : "", bedsSummary: v.bedsSummary });
  if (key) listing.push(cap(key));

  const dropPlace3 = on("place3") && !!places[2];
  const more = renderTemplate(L.morePlaces, { place2: phrase(places[1]), place3: dropPlace3 ? "" : phrase(places[2]) });
  if (more) listing.push(cap(more));
  if (dropPlace3) msg("place3", "space");

  const hShort = honestShort(f, t);
  if (hShort && !on("honest")) listing.push(renderTemplate(L.honest, { honest: hShort }));
  if (hShort && on("honest")) msg("honest", "notes");

  const sign = f.signOff.trim();
  if (sign && !on("signOff")) listing.push(asSentence(sign));
  if (sign && on("signOff")) msg("signOff", "notes");
  if (short && places.length) msg("short", "listing");
  // Keep the moved messages in step order.
  moved.sort((a, b) => t.fitSteps.findIndex((s) => s.id === a.id) - t.fitSteps.findIndex((s) => s.id === b.id));

  /* The space */
  const S = t.space;
  const space: string[] = [];
  if (f.bedrooms === 0) {
    const b = W.bedsLong[f.beds[0] ?? ""];
    if (b) space.push(renderTemplate(S.sleeping, { bed: b }));
  } else {
    for (let i = 0; i < f.bedrooms; i++) {
      const line = renderTemplate(S.bedroom, { n: String(i + 1), bed: W.bedsLong[f.beds[i] ?? ""] ?? "", ensuite: f.ensuites[i] ? W.ensuite : "" });
      if (line) space.push(line);
    }
  }
  if (f.bathrooms > 0) {
    const phraseB = f.bathrooms === 1 ? S.bathroomsOne : fill(S.bathroomsMany, { n: f.bathrooms });
    space.push(cap(renderTemplate(S.bathrooms, { bathroomsPhrase: phraseB, bathTypes: joinList(pick(f.bathTypes, W.bathTypes)) })));
  }
  const spaceLines: [string, string][] = [
    ["workspace", renderTemplate(S.workspace, v)],
    ["wifiMbps", renderTemplate(S.wifi, v)],
    ["kitchen", renderTemplate(S.kitchen, v)],
    ["laundry", renderTemplate(S.laundry, v)],
    ["heating", renderTemplate(S.heating, v)],
    ["quiet", renderTemplate(S.quiet, { Quiet: cap(quietPhrase(f, t, false)) })],
    ["outdoor", renderTemplate(S.outdoor, { Outdoor: cap(v.outdoor), seating: f.outdoorSeating ? String(f.outdoorSeating) : "" })],
    ["family", renderTemplate(S.family, v)],
    ["dogs", f.dogs ? renderTemplate(S.pets, { maxDogs: f.maxDogs ? String(f.maxDogs) : "" }) : ""],
  ];
  for (const [k, line] of spaceLines) {
    if (!line) continue;
    space.push(line);
    used.add(k);
  }
  const extraPlaces = [...(dropPlace3 ? [places[2]] : []), ...places.slice(3)].map((p) => phrase(p));
  if (extraPlaces.length) space.push(renderTemplate(S.morePlaces, { places: joinList(extraPlaces) }));
  // Step 5: the second fact moves here, unless The space already says it.
  const inSpace: Record<string, string> = { "fast-wifi": "wifiMbps", workspace: "workspace", quiet: "quiet", kitchen: "kitchen", laundry: "laundry", family: "family", outdoor: "outdoor", pets: "dogs", sleeping: "bedrooms" };
  if (dropFact2 && !(inSpace[facts[1].need] && used.has(inSpace[facts[1].need])) && !(facts[1].need === "sleeping" && space.length)) space.push(renderTemplate(S.movedFact, { fact: facts[1].text }));

  /* Guest access */
  const A = t.access;
  const access: string[] = [];
  access.push(f.privacy === "privateRoom" ? renderTemplate(A.privateRoom, { shared: joinList(pick(f.sharedAreas, W.shared)) }) : renderTemplate(A.whole, v));
  const inTime = formatTime(f.checkInTime);
  const outTime = formatTime(f.checkOutTime);
  if (f.checkIn === "meet") access.push(renderTemplate(A.meet, { checkinTime: inTime }));
  else if (v.method) access.push(renderTemplate(A.checkIn, { method: v.method, checkinTime: inTime }));
  else if (inTime) access.push(renderTemplate(A.checkInTimeOnly, { checkinTime: inTime }));
  if (outTime) access.push(renderTemplate(A.checkOut, { checkoutTime: outTime }));
  const cars = f.parkingSpaces ? (f.parkingSpaces === 1 ? A.cars.one : fill(A.cars.many, { n: f.parkingSpaces })) : "";
  if (A.parking[f.parking]) access.push(renderTemplate(A.parking[f.parking], { cars }));
  if (f.parkingNote.trim()) access.push(asSentence(f.parkingNote));
  if (f.floor) access.push(renderTemplate(A.floor, { type: v.type, floorPhrase: v.floorPhrase, lift: f.lift === true ? A.liftYes : f.lift === false ? A.liftNo : "" }));
  if (f.longStays) access.push(A.longStays);

  /* Other things to note: always every honest note */
  const N = t.notes;
  const notes: string[] = [...honestSentences(f, t)];
  if (sign && on("signOff")) notes.push(asSentence(sign));
  const hr = f.houseRules;
  if (hr) {
    const a = formatTime(hr.checkin);
    const b = formatTime(hr.checkout);
    if (a && b) notes.push(renderTemplate(N.houseRulesTimes, { checkin: a, checkout: b }));
    else if (a) notes.push(renderTemplate(A.checkInTimeOnly, { checkinTime: a }));
    else if (b) notes.push(renderTemplate(A.checkOut, { checkoutTime: b }));
    if (hr.pets && N.pets[hr.pets]) notes.push(renderTemplate(N.pets[hr.pets], { maxPets: hr.maxPets ? String(hr.maxPets) : "" }));
    if (hr.parties) notes.push(N.parties);
  }
  if ((hr && hr.pets) || f.dogs) notes.push(N.assistanceDogs);

  const join = (xs: string[], sep: string) => xs.filter(Boolean).map((x) => warmUp(x, t, warm)).join(sep).replace(/ {2,}/g, " ").trim();
  const sections: Record<SectionId, string> = { listing: join(listing, " "), space: join(space, "\n"), access: join(access, " "), notes: join(notes, "\n") };
  const counts = Object.fromEntries(sectionIds.map((id) => [id, countChars(sections[id], c.scorer.counting)])) as Record<SectionId, number>;
  const overLimitBy = Math.max(0, counts.listing - c.limits.listing);
  const warnings: string[] = [];
  if (overLimitBy > 0 && (options.fitSteps ?? 0) >= t.fitSteps.length) warnings.push(t.fitMessages.still);
  return { sections, counts, overLimitBy, listingSentences: listing.map((x) => warmUp(x, t, warm)), movedItems: moved, usedFacts: [...used], warnings };
}

/**
 * "Make it fit": apply the stored steps one at a time (starting after
 * `from`) until the listing description fits. Returns the number of steps
 * now applied, the result, and what moved. Facts are never deleted.
 */
export function makeItFit(f: Facts, c: Content, from = 0): { fitSteps: number; built: Built; still: boolean } {
  let n = from;
  let built = buildDescription(f, c, { fitSteps: n });
  while (built.overLimitBy > 0 && n < c.templates.fitSteps.length) {
    n++;
    built = buildDescription(f, c, { fitSteps: n });
  }
  return { fitSteps: n, built, still: built.overLimitBy > 0 };
}

/* ---- Fact integrity ------------------------------------------------------------- */

/** Every number the facts allow in the output (counts, minutes, times, bedroom numbers, numbers the host typed). */
export function allowedNumbers(f: Facts): Set<string> {
  const out = new Set<string>();
  const add = (n: number | null | undefined) => n !== null && n !== undefined && Number.isFinite(n) && out.add(String(n));
  [f.bedrooms, f.maxGuests, f.sizeM2, f.wifiMbps, f.bathrooms, f.outdoorSeating, f.maxDogs, f.parkingSpaces, f.houseRules?.maxPets].forEach(add);
  for (let i = 1; i <= Math.max(1, f.bedrooms); i++) add(i);
  f.places.forEach((p) => add(p.minutes));
  for (const t of [f.checkInTime, f.checkOutTime, f.houseRules?.checkin ?? "", f.houseRules?.checkout ?? ""]) {
    for (const n of formatTime(t).match(/\d+/g) ?? []) out.add(String(Number(n))).add(n);
  }
  const typed = [f.standout, f.area, f.town, f.workspaceLocation, f.honestCustom, f.signOff, f.parkingNote, ...f.places.map((p) => p.name)].join(" ");
  for (const n of typed.match(/\d+(?:\.\d+)?/g) ?? []) out.add(n);
  return out;
}

/** Numbers in the output that don't come from the host's answers (should always be empty). */
export function factIntegrity(sections: Record<SectionId, string>, f: Facts): { ok: boolean; stray: string[] } {
  const allowed = allowedNumbers(f);
  const stray = [...new Set(Object.values(sections).flatMap((s) => s.match(/\d+(?:\.\d+)?/g) ?? []))].filter((n) => !allowed.has(n));
  return { ok: stray.length === 0, stray };
}
