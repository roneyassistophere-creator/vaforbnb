/** What the host enters, saved on their device only. Nothing here leaves the device. */

import type { BuilderChoices, FeatureChoice, HookChoice } from "./build";
import { defaultChoices } from "./build";
import type { Details } from "./check";
import type { Rules } from "./content";

export const propertyTypes = ["flat", "house", "cottage", "studio", "room", "loft", "other"] as const;

export type Inputs = {
  title: string;
  details: Details;
  /** "Add details for smarter checks" is open. */
  showDetails: boolean;
  /** True while the example is loaded (shown with an "example data" label). */
  example: boolean;
  builder: BuilderChoices;
};

export const LIMITS = { title: 200, place: 80, bedrooms: 30, guests: 50, minutes: 120, compare: 3 };

export const defaultInputs = (): Inputs => ({
  title: "",
  details: { town: "", place: "", propertyType: "", bedrooms: null },
  showDetails: false,
  example: false,
  builder: defaultChoices(),
});

/** "Try an example": the stored example, clearly labelled as example data in the tool. */
export function exampleInputs(rules: Rules): Inputs {
  const e = rules.example;
  return { ...defaultInputs(), title: e.title, details: { town: e.town, place: e.place, propertyType: e.propertyType, bedrooms: e.bedrooms }, showDetails: true, example: true };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const int = (v: unknown, min: number, max: number): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function cleanDetails(x: unknown): Details {
  const o = isObj(x) ? x : {};
  const type = str(o.propertyType, 20);
  return {
    town: str(o.town, LIMITS.place),
    place: str(o.place, LIMITS.place),
    propertyType: (propertyTypes as readonly string[]).includes(type) ? type : "",
    bedrooms: int(o.bedrooms, 0, LIMITS.bedrooms),
  };
}

function cleanFeature(x: unknown, customMax: number): FeatureChoice | null {
  if (!isObj(x)) return null;
  if (typeof x.id === "string") return { id: x.id.slice(0, 40) };
  if (typeof x.custom === "string" && x.custom.trim()) return { custom: x.custom.slice(0, customMax) };
  return null;
}

function cleanHook(x: unknown): HookChoice {
  if (!isObj(x)) return { kind: "none" };
  if (x.kind === "near") return { kind: "near" };
  if (x.kind === "minutes") return { kind: "minutes", minutes: int(x.minutes, 1, LIMITS.minutes) ?? 5, mode: str(x.mode, 20) || "walk" };
  return { kind: "none" };
}

export function cleanChoices(x: unknown, rules: Rules): BuilderChoices {
  const d = defaultChoices();
  if (!isObj(x)) return { ...d, separator: rules.builder.defaultSeparator };
  const max = rules.builder.customMax;
  const b = x.benefit;
  return {
    features: (Array.isArray(x.features) ? x.features : []).map((f) => cleanFeature(f, max)).filter((f): f is FeatureChoice => !!f).slice(0, rules.builder.maxFeatures),
    benefit: isObj(b) && typeof b.id === "string" ? { id: b.id.slice(0, 40) } : isObj(b) && typeof b.custom === "string" ? { custom: b.custom.slice(0, max) } : null,
    hook: cleanHook(x.hook),
    separator: rules.builder.separators.some((s) => s.id === x.separator) ? (x.separator as string) : rules.builder.defaultSeparator,
    maxGuests: int(x.maxGuests, 1, LIMITS.guests),
  };
}

/** Make saved (possibly old or edited) inputs safe to use. */
export function cleanInputs(x: unknown, rules: Rules): Inputs {
  const d = defaultInputs();
  if (!isObj(x)) return { ...d, builder: cleanChoices(null, rules) };
  return {
    title: str(x.title, LIMITS.title),
    details: cleanDetails(x.details),
    showDetails: x.showDetails === true,
    example: x.example === true,
    builder: cleanChoices(x.builder, rules),
  };
}

/** Saved compare list: up to 3 distinct, non-empty titles. */
export function cleanCompare(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return [...new Set(x.filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, LIMITS.title)).filter(Boolean))].slice(0, LIMITS.compare);
}

/** Add a title to the compare list (no duplicates; when full, the oldest drops off). */
export function addToCompare(list: string[], title: string): string[] {
  const t = title.trim();
  if (!t) return list;
  return [...list.filter((x) => x !== t), t].slice(-LIMITS.compare);
}
