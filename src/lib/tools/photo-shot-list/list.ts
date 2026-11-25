/**
 * The host's changes to the recommended list, saved on their device: the
 * order, removed and custom shots, edited captions, "Taken" ticks, notes,
 * prep ticks and where shoot-day mode was left.
 */

import { toCsv } from "@/lib/tools/csv";
import { fill, type Rules } from "./content";
import { totalsFor, type Shot, type ShotList } from "./build";

export type CustomShot = { id: string; name: string; caption: string };

export type ListState = {
  /** Shot ids in the host's order; null = the recommended order. */
  order: string[] | null;
  removed: string[];
  custom: CustomShot[];
  /** Edited captions by shot id. */
  captions: Record<string, string>;
  taken: string[];
  notes: Record<string, string>;
  /** Ticked prep items ("whole:0", "bedroom-1:2"…). */
  prep: string[];
  /** Shoot-day mode: the shot id it was on. */
  shootAt: string;
};

export const LIST_LIMITS = { custom: 20, name: 60, caption: 500, note: 300 };

export const defaultListState = (): ListState => ({ order: null, removed: [], custom: [], captions: {}, taken: [], notes: {}, prep: [], shootAt: "" });

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const ids = (v: unknown, max = 400) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 80)))].slice(0, max) : []);
const map = (v: unknown, max: number) =>
  isObj(v) ? Object.fromEntries(Object.entries(v).filter(([k, x]) => typeof x === "string" && k.length <= 80).map(([k, x]) => [k, (x as string).slice(0, max)])) : {};

/** Make a saved (possibly old or edited) list state safe to use. */
export function cleanListState(x: unknown): ListState {
  const d = defaultListState();
  if (!isObj(x)) return d;
  return {
    order: Array.isArray(x.order) ? ids(x.order) : null,
    removed: ids(x.removed),
    custom: (Array.isArray(x.custom) ? x.custom : [])
      .filter(isObj)
      .map((c) => ({ id: typeof c.id === "string" ? c.id.slice(0, 40) : "", name: typeof c.name === "string" ? c.name.slice(0, LIST_LIMITS.name) : "", caption: typeof c.caption === "string" ? c.caption.slice(0, LIST_LIMITS.caption) : "" }))
      .filter((c) => c.id.startsWith("custom-") && c.name.trim())
      .slice(0, LIST_LIMITS.custom),
    captions: map(x.captions, LIST_LIMITS.caption),
    taken: ids(x.taken),
    notes: map(x.notes, LIST_LIMITS.note),
    prep: ids(x.prep, 600),
    shootAt: typeof x.shootAt === "string" ? x.shootAt.slice(0, 80) : "",
  };
}

/** A custom shot as a shot card. */
function customShot(c: CustomShot, r: Rules): Shot {
  return {
    id: c.id,
    itemKey: c.id,
    kind: "custom",
    area: c.name.trim(),
    shotType: "wide",
    shotTypeLabel: r.shotTypeLabels.wide,
    orientation: r.orientation,
    isFirstFive: false,
    isCover: false,
    position: 0,
    group: "extras",
    reasonForPosition: "",
    whatToShow: [],
    stagingTips: [],
    caption: c.caption.trim(),
    bestLight: "",
    honestyShot: false,
    custom: true,
  };
}

/**
 * The list as the host sees it: the recommended shots plus custom ones,
 * minus removed ones, in the host's order (new shots keep their recommended
 * place), with edited captions. The first five are always the first five.
 */
export function applyListState(list: ShotList, st: ListState, r: Rules): Shot[] {
  const removed = new Set(st.removed);
  const base = [...list.shots, ...st.custom.map((c) => customShot(c, r))].filter((x) => !removed.has(x.id));
  let ordered = base;
  if (st.order) {
    const rank = new Map(st.order.map((id, i) => [id, i]));
    const known = base.filter((x) => rank.has(x.id)).sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
    ordered = [...known];
    // Shots the saved order doesn't know (newly ticked rooms) go back in at their recommended place.
    base.forEach((x, i) => {
      if (!rank.has(x.id)) ordered.splice(Math.min(i, ordered.length), 0, x);
    });
  }
  return ordered.map((x, i) => {
    const first = i < 5;
    return {
      ...x,
      position: i + 1,
      isFirstFive: first,
      isCover: i === 0,
      group: first ? "first" : x.group === "first" ? "tour" : x.group,
      caption: st.captions[x.id] ?? x.caption,
    };
  });
}

/** Move a shot up (-1) or down (+1). Returns the new state with the full order saved. */
export function moveShot(st: ListState, shots: Shot[], id: string, delta: number): ListState {
  const order = shots.map((x) => x.id);
  const from = order.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= order.length) return st;
  return moveTo(st, shots, from, to);
}

/** Move the shot at `from` to `to` (drag and drop). */
export function moveTo(st: ListState, shots: Shot[], from: number, to: number): ListState {
  const order = shots.map((x) => x.id);
  if (from === to || from < 0 || from >= order.length) return st;
  const [id] = order.splice(from, 1);
  order.splice(Math.max(0, Math.min(order.length, to)), 0, id);
  return { ...st, order };
}

/** "Reset to recommended order". Keeps ticks, captions and notes. */
export const resetOrder = (st: ListState): ListState => ({ ...st, order: null });

export function addCustomShot(st: ListState, name: string, caption: string, now: number = Date.now()): ListState {
  const n = name.trim().slice(0, LIST_LIMITS.name);
  if (!n || st.custom.length >= LIST_LIMITS.custom) return st;
  return { ...st, custom: [...st.custom, { id: `custom-${now.toString(36)}`, name: n, caption: caption.trim().slice(0, LIST_LIMITS.caption) }] };
}

export const removeShot = (st: ListState, id: string): ListState =>
  id.startsWith("custom-") ? { ...st, custom: st.custom.filter((c) => c.id !== id), order: st.order?.filter((x) => x !== id) ?? null } : { ...st, removed: [...new Set([...st.removed, id])] };

export const toggleTaken = (st: ListState, id: string, on?: boolean): ListState => {
  const has = st.taken.includes(id);
  const want = on ?? !has;
  return want === has ? st : { ...st, taken: want ? [...st.taken, id] : st.taken.filter((x) => x !== id) };
};

export function progress(shots: Shot[], st: ListState) {
  const taken = shots.filter((x) => st.taken.includes(x.id)).length;
  return { taken, total: shots.length, done: shots.length > 0 && taken === shots.length };
}

/** Totals for the list as it stands. */
export const listTotals = (shots: Shot[], c: Parameters<typeof totalsFor>[1]) => totalsFor(shots, c);

/* ---- Exports (made on the device) ------------------------------------------- */

/** "Copy all captions": numbered, in photo order. */
export function captionsText(shots: Shot[]): string {
  return shots.map((x) => `${x.position}. ${x.area}: ${x.caption || "(no caption)"}`).join("\n");
}

/** CSV: #, area, shot type, first five, caption, what to show, taken. */
export function shotListCsv(shots: Shot[], st: ListState): string {
  return toCsv(
    ["#", "Area", "Shot type", "First five", "Caption", "What to show", "Taken"],
    shots.map((x) => [String(x.position), x.area, x.shotTypeLabel, x.isFirstFive ? "yes" : "no", x.caption, x.whatToShow.join("; "), st.taken.includes(x.id) ? "yes" : "no"]),
    { bom: true },
  );
}

/** The short brief for a photographer (copyable). */
export function photographerBrief(shots: Shot[], r: Rules, property: string): string {
  const five = shots.filter((x) => x.isFirstFive).map((x, i) => `${i + 1}. ${x.area}`).join(", ");
  return fill(r.brief, { property: property.trim() || "the property", firstFive: five });
}
