/**
 * The photo order and shot list. Pure and deterministic: every order list,
 * priority, count, template, caption and tip comes from the stored rules.
 * Captions use only what the host entered or imported.
 */

import { minutesPhrase } from "@/lib/tools/listing-text";
import { capitalise, fill, renderCaption, type Content, type Rules } from "./content";
import type { Setup } from "./setup";

export type Group = "first" | "tour" | "extras";

/** Something to photograph: a room, a feature, the entrance, a local place. */
export type Item = {
  /** Stable key: "view", "livingSpace", "bedroom-2", "outdoor:privateGarden", "local-1"… */
  key: string;
  kind: string;
  label: string;
  /** Bedroom, bathroom or place number. */
  n?: number;
  /** Outdoor, access or extra id, or the place index. */
  sub?: string;
  /** Added because of an honest note. */
  honesty?: "stairs" | "sharedEntrance";
};

export type Shot = {
  /** Stable: "{itemKey}:{shotId}" (custom shots: "custom-…"). */
  id: string;
  itemKey: string;
  kind: string;
  area: string;
  shotType: "wide" | "detail";
  shotTypeLabel: string;
  orientation: string;
  isFirstFive: boolean;
  isCover: boolean;
  /** 1-based. */
  position: number;
  group: Group;
  reasonForPosition: string;
  whatToShow: string[];
  stagingTips: string[];
  caption: string;
  bestLight: string;
  honestyShot: boolean;
  custom?: boolean;
};

export type FirstFiveSlot = { item: Item; token: string; reason: string };

export type ShotList = {
  shots: Shot[];
  items: Item[];
  firstFive: FirstFiveSlot[];
  /** Kinds of honesty shot added. */
  honesty: ("stairs" | "sharedEntrance")[];
  totals: Totals;
};

export type Totals = { shots: number; photos: number; rooms: number; warning: string | null };

const S = (r: Rules) => r.words;

/* ---- Items ------------------------------------------------------------------ */

/** Every room and feature the host ticked, plus the entrance (always) and honesty shots. */
export function listItems(s: Setup, r: Rules): Item[] {
  const L = r.labels;
  const out: Item[] = [];
  const studio = s.bedrooms === 0;
  const adds = new Set(s.honest.map((h) => r.honestNotes.find((n) => n.id === h)?.adds).filter(Boolean));

  if (s.view) out.push({ key: "view", kind: "view", label: fill(L.view, { view: S(r).views[s.view] ?? capitalise(s.view) }) });
  if (s.kitchenDiner) out.push({ key: "kitchenDiner", kind: "kitchenDiner", label: L.kitchenDiner });
  if (s.living || (studio && !s.kitchenDiner)) out.push({ key: "livingSpace", kind: "livingSpace", label: studio ? L.studioLiving : L.livingSpace });
  if (studio) out.push({ key: "sleeping", kind: "sleeping", label: L.sleeping });
  for (let n = 1; n <= s.bedrooms; n++) out.push({ key: `bedroom-${n}`, kind: "bedroom", n, label: fill(L.bedroom, { n }) });
  if (s.kitchen && !s.kitchenDiner) out.push({ key: "kitchen", kind: "kitchen", label: L.kitchen });
  if (s.dining && !s.kitchenDiner) out.push({ key: "dining", kind: "dining", label: L.dining });
  for (let n = 1; n <= s.bathrooms; n++) out.push({ key: `bathroom-${n}`, kind: "bathroom", n, label: fill(L.bathroom, { n }) });
  for (let n = 1; n <= s.bedrooms; n++) if (s.ensuites[n - 1]) out.push({ key: `ensuite-${n}`, kind: "ensuite", n, label: fill(L.ensuite, { n }) });
  if (s.workspace !== "none") out.push({ key: "workspace", kind: "workspace", label: L.workspace });
  if (s.laundry.length) out.push({ key: "laundry", kind: "laundry", label: L.laundry });
  for (const o of Object.keys(S(r).outdoor)) if (s.outdoor.includes(o)) out.push({ key: `outdoor:${o}`, kind: "outdoor", sub: o, label: S(r).outdoor[o] });
  for (const e of ["hotTub", "pool", "gamesRoom", "gym", "fireplace"]) if (s.extras.includes(e)) out.push({ key: e, kind: e, label: L[e] ?? e });
  if (s.stairs || adds.has("stairs")) out.push({ key: "stairs", kind: "stairs", label: L.stairs, ...(s.stairs ? {} : { honesty: "stairs" as const }) });
  out.push(adds.has("sharedEntrance") ? { key: "entrance", kind: "entrance", label: L.sharedEntrance, honesty: "sharedEntrance" } : { key: "entrance", kind: "entrance", label: L.entrance });
  if (s.parking && s.parking !== "none") out.push({ key: "parking", kind: "parking", label: L.parking });
  for (const a of Object.keys(S(r).access)) if (s.access.includes(a)) out.push({ key: `access:${a}`, kind: "access", sub: a, label: S(r).access[a] });
  if (s.extras.includes("evCharger")) out.push({ key: "evCharger", kind: "evCharger", label: L.evCharger });
  s.places.slice(0, r.maxPlaces).forEach((p, i) => out.push({ key: `local-${i + 1}`, kind: "local", n: i + 1, sub: String(i), label: fill(L.local, { place: p.name.trim() }) }));
  return out;
}

/** What the host can pick as the standout or second selling point (from what's ticked). */
export function standoutOptions(s: Setup, r: Rules): { key: string; label: string }[] {
  const items = listItems(s, r);
  const allowed = new Set(r.standoutKinds);
  return items
    .filter((i) => allowed.has(i.kind) || (allowed.has("mainBedroom") && (i.key === "bedroom-1" || i.key === "sleeping")))
    .map((i) => ({ key: i.key, label: i.key === "bedroom-1" ? `${i.label} (main bedroom)` : i.label }));
}

/* ---- First five ----------------------------------------------------------------- */

/** An order token ("livingSpace", "mainBedroom", "twinBunkBedroom"…) → the item it means, if it exists. */
function resolve(token: string, items: Item[], s: Setup): Item | undefined {
  const by = (k: string) => items.find((i) => i.key === k);
  switch (token) {
    case "livingSpace":
      return by("livingSpace") ?? by("kitchenDiner");
    case "mainBedroom":
      return by("bedroom-1") ?? by("sleeping");
    case "kitchen":
      return by("kitchen") ?? by("kitchenDiner");
    case "dining":
      return by("dining") ?? by("kitchenDiner");
    case "bathroom1":
      return by("bathroom-1");
    case "bedroom2":
      return by("bedroom-2");
    case "outdoor":
      return items.find((i) => i.kind === "outdoor");
    case "twinBunkBedroom":
      return items.find((i) => i.kind === "bedroom" && ["twin", "bunk"].includes(s.beds[(i.n ?? 1) - 1] ?? ""));
    case "stepFreeEntrance":
      return by("access:stepFree");
    case "walkInShower":
      return by("access:walkInShower");
    default:
      return by(token);
  }
}

/** The guest-type priority item for slot 5: the first guest type's first item that exists and isn't used. */
function priorityItem(s: Setup, r: Rules, items: Item[], used: Set<string>): { item: Item; reason: string } | null {
  const first = s.guestTypes[0];
  for (const p of (first && r.guestPriority[first]) || []) {
    const it = resolve(p.item, items, s);
    if (it && !used.has(it.key)) return { item: it, reason: p.reason };
  }
  const fb = resolve(r.guestPriorityFallback.item, items, s);
  return fb && !used.has(fb.key) ? { item: fb, reason: r.guestPriorityFallback.reason } : null;
}

/** The second selling point (never the standout), if it still exists. */
function secondItem(s: Setup, items: Item[]): Item | undefined {
  return s.second && s.second !== s.standout ? items.find((i) => i.key === s.second) : undefined;
}

/** Resolve one fill token to an unused item and the reason for its slot. */
function fillToken(token: string, s: Setup, r: Rules, items: Item[], used: Set<string>): { item: Item; reason: string } | null {
  if (token === "secondOrPriority") {
    const sec = secondItem(s, items);
    if (sec && !used.has(sec.key)) return { item: sec, reason: r.slotReasons.second };
    return priorityItem(s, r, items, used);
  }
  const it = resolve(token, items, s);
  return it && !used.has(it.key) ? { item: it, reason: r.slotReasons[token] ?? "" } : null;
}

/** The first five: the standout as cover, then each slot from the stored fill order (no item twice). */
export function firstFive(s: Setup, r: Rules, items: Item[] = listItems(s, r)): FirstFiveSlot[] {
  const used = new Set<string>();
  // Each fill step is used once: once the guest-type priority has filled a slot, the next slot moves on.
  const usedTokens = new Set<string>();
  const out: FirstFiveSlot[] = [];
  const cover = items.find((i) => i.key === s.standout);
  if (cover) {
    out.push({ item: cover, token: "cover", reason: r.slotReasons.cover });
    used.add(cover.key);
  }
  const { slots, fill: order } = r.firstFive;
  // Without a standout, slot 1 starts the fill order too.
  const starts = cover ? slots : [order[0], ...slots];
  for (const start of starts) {
    if (out.length >= 5) break;
    for (let i = Math.max(0, order.indexOf(start)); i < order.length; i++) {
      if (usedTokens.has(order[i])) continue;
      const hit = fillToken(order[i], s, r, items, used);
      if (hit) {
        out.push({ item: hit.item, token: order[i], reason: hit.reason });
        used.add(hit.item.key);
        usedTokens.add(order[i]);
        break;
      }
    }
  }
  return out.slice(0, 5);
}

/* ---- Captions and light -------------------------------------------------------- */

const andList = (xs: string[]) => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** The caption for an item, from the stored template and the host's facts only. A missing fact drops its part. */
export function captionFor(item: Pick<Item, "kind" | "key" | "n" | "sub" | "honesty">, s: Setup, r: Rules): string {
  const W = S(r);
  const C = r.captions;
  const n = item.n ?? 1;
  const bed = (i: number) => W.beds[s.beds[i] ?? ""] ?? "";
  const vars: Record<string, string> = { n: String(n) };
  let template = C[item.kind] ?? "";
  switch (item.kind) {
    case "view":
      vars.view = W.views[s.view] ?? capitalise(s.view);
      vars.viewFrom = s.viewFrom.trim().replace(/^the\s+/i, "");
      break;
    case "livingSpace":
      if (s.bedrooms === 0) template = C.studioLiving;
      vars.size = s.sizeM2 ? String(s.sizeM2) : "";
      break;
    case "kitchen":
    case "kitchenDiner":
      vars.kitchenItems = andList(s.kitchenItems);
      break;
    case "sleeping":
      vars.bed = bed(0);
      break;
    case "bedroom":
      vars.bed = bed(n - 1);
      vars.blackout = s.blackout[n - 1] ? W.blackout : "";
      vars.ensuite = s.ensuites[n - 1] ? W.ensuite : "";
      break;
    case "workspace":
      vars.workspaceKit = s.workspace === "full" ? W.workspaceFull : "";
      vars.workspaceLocation = s.workspaceLocation.trim().replace(/^in\s+/i, "");
      vars.mbps = s.wifiMbps ? String(s.wifiMbps) : "";
      break;
    case "laundry": {
      const names = Object.keys(W.laundry).filter((k) => s.laundry.includes(k)).map((k) => W.laundry[k]);
      vars.laundry = capitalise(andList(names));
      break;
    }
    case "outdoor":
      vars.outdoor = W.outdoor[item.sub ?? ""] ?? "";
      break;
    case "access":
      vars.access = W.access[item.sub ?? ""] ?? "";
      break;
    case "stairs":
      vars.floor = s.floor && s.floor !== "ground" ? (W.floors[s.floor] ?? "") : "";
      vars.noLift = s.lift ? "" : W.noLift;
      break;
    case "entrance":
      template = item.honesty === "sharedEntrance" ? C.sharedEntrance : C.entrance;
      vars.checkIn = W.checkIn[s.checkIn] ?? "";
      vars.checkInTime = s.checkInTime.trim();
      break;
    case "parking":
      vars.parkingType = W.parking[s.parking] ?? "";
      vars.parkingSpaces = s.parkingSpaces ? (s.parkingSpaces === 1 ? W.cars.one : fill(W.cars.many, { n: s.parkingSpaces })) : "";
      break;
    case "local": {
      const p = s.places[Number(item.sub ?? 0)];
      vars.minutesPhrase = p ? minutesPhrase(p.minutes, p.mode, p.name, r.minutesPhrases) : "";
      vars.place = p?.name.trim() ?? "";
      if (!vars.minutesPhrase) template = C.localNoMinutes;
      break;
    }
  }
  const out = renderCaption(template, vars);
  if (out) return capitalise(out);
  if (item.kind === "entrance") return renderCaption(C.entranceNoMethod, vars);
  return "";
}

/** The best-light tip for a room, from the window direction (unknown → the default daylight tip). Outside shots get the golden-hour tip. */
export function lightTip(windowFacing: string, _season: string, r: Rules, kind?: string): string {
  if (kind && r.outsideKinds.includes(kind)) return r.light.outside;
  return r.light[windowFacing] ?? r.light.unknown;
}

/** Season notes; a note with `requires` shows only when that extra is ticked. */
export function seasonNotes(s: Setup, r: Rules): string[] {
  return (r.seasons[s.season] ?? []).filter((n) => !n.requires || s.extras.includes(n.requires)).map((n) => n.text);
}

/* ---- The list ------------------------------------------------------------------- */

function shotsFor(item: Item, s: Setup, r: Rules, caption: string) {
  const defs = r.shots[item.kind] ?? r.shots.default;
  const t = r.templates[item.kind] ?? {};
  return defs.map((d) => ({
    id: `${item.key}:${d.id}`,
    itemKey: item.key,
    kind: item.kind,
    area: item.label,
    shotType: d.type,
    shotTypeLabel: r.shotTypeLabels[d.type] ?? d.type,
    orientation: r.orientation,
    whatToShow: (t[d.id] ?? t.wide ?? { show: [] }).show.slice(0, 4),
    stagingTips: (t[d.id] ?? t.wide ?? { staging: [] }).staging.slice(0, 3),
    caption,
    bestLight: lightTip(s.windows, s.season, r, item.kind),
    honestyShot: !!item.honesty,
  }));
}

export function totalsFor(shots: Pick<Shot, "itemKey" | "kind">[], c: Pick<Content, "rules" | "photoCount">): Totals {
  const n = shots.length;
  const rooms = new Set(shots.filter((x) => c.rules.roomKinds.includes(x.kind)).map((x) => x.itemKey)).size;
  const P = c.photoCount;
  const W = c.rules.photoCountWarnings;
  const warning = n === 0 ? null : n < P.min ? fill(W.low, { n, min: P.min }) : n > P.max ? fill(W.high, { n, max: P.max }) : null;
  return { shots: n, photos: n, rooms, warning };
}

/** The ordered shot list: the first five, more of those rooms, the photo tour, then extras and honesty shots. */
export function buildShotList(s: Setup, c: Pick<Content, "rules" | "photoCount">): ShotList {
  const r = c.rules;
  const items = listItems(s, r);
  const five = firstFive(s, r, items);
  const fiveKeys = new Set(five.map((f) => f.item.key));
  const out: Omit<Shot, "position" | "isFirstFive">[] = [];
  const captions = new Map(items.map((i) => [i.key, captionFor(i, s, r)]));

  // 1. The first five: the first shot of each.
  const more: typeof out = [];
  five.forEach((slot, i) => {
    const [first, ...rest] = shotsFor(slot.item, s, r, captions.get(slot.item.key) ?? "");
    out.push({ ...first, isCover: i === 0 && slot.token === "cover", group: "first", reasonForPosition: slot.reason });
    for (const x of rest) more.push({ ...x, isCover: false, group: "tour", reasonForPosition: r.tourReasons.more });
  });
  // 2. More of the first-five rooms.
  out.push(...more);
  // 3. The photo tour and extras, in the stored order (every remaining item).
  for (const step of r.tourOrder) {
    for (const item of items.filter((i) => i.kind === step.kind && !fiveKeys.has(i.key))) {
      for (const x of shotsFor(item, s, r, captions.get(item.key) ?? "")) {
        out.push({ ...x, isCover: false, group: item.honesty ? "extras" : step.group, reasonForPosition: item.honesty ? r.tourReasons.honesty : r.tourReasons[step.group] });
      }
    }
  }
  // Anything not covered by the stored order still appears (the photo tour rule).
  const placed = new Set(out.map((x) => x.itemKey));
  for (const item of items.filter((i) => !placed.has(i.key))) {
    for (const x of shotsFor(item, s, r, captions.get(item.key) ?? "")) out.push({ ...x, isCover: false, group: "tour", reasonForPosition: r.tourReasons.tour });
  }

  const shots: Shot[] = out.map((x, i) => ({ ...x, position: i + 1, isFirstFive: i < five.length && x.group === "first" }));
  const honesty = [...new Set(items.map((i) => i.honesty).filter((h): h is "stairs" | "sharedEntrance" => !!h))];
  return { shots, items, firstFive: five, honesty, totals: totalsFor(shots, c) };
}

/** "What this means": the main line, plus the honesty line when an honesty shot was added. */
export function whatThisMeans(list: Pick<ShotList, "honesty">, r: Rules): string[] {
  const out = [r.meaning.main];
  if (list.honesty.length) out.push(fill(r.meaning.honesty, { what: andList(list.honesty.map((h) => r.meaning.honestyWhat[h] ?? h)) }));
  return out;
}

/** Prep checklist: the whole-home list, then one section per room or feature that has a stored list. Ids are stable for ticks. */
export function prepSections(items: Item[], r: Rules): { key: string; title: string; items: { id: string; text: string }[] }[] {
  const whole = { key: "whole", title: "Whole home", items: r.prep.wholeHome.map((text, i) => ({ id: `whole:${i}`, text })) };
  const rooms = items
    .filter((i) => r.prep.byKind[i.kind]?.length)
    .map((i) => ({ key: i.key, title: i.label, items: r.prep.byKind[i.kind].map((text, n) => ({ id: `${i.key}:${n}`, text })) }));
  return [whole, ...rooms];
}
