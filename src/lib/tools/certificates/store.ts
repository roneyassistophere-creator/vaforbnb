import { addDays, addMonths, isValidDate } from "../dates";
import { itemDefs } from "./items";
import { nationLabels, type CustomItem, type ItemKey, type Nation, type PropertyData, type Store } from "./types";

let counter = 0;
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const blankProperty = (id: string, name: string): PropertyData => ({ id, name, nation: "england", hasGas: true, dates: {}, custom: [] });

/** A fresh store with one property. Fixed id, so it's safe to create while rendering. */
export const emptyStore = (): Store => ({
  version: 1,
  properties: [blankProperty("my-property", "My property")],
  activePropertyId: "my-property",
  settings: { secondReminder: false, includeOverdue: true, scope: "property" },
});

export const activeProperty = (s: Store) => s.properties.find((p) => p.id === s.activePropertyId) ?? s.properties[0];

export const updateProperty = (s: Store, id: string, fn: (p: PropertyData) => PropertyData): Store => ({
  ...s,
  properties: s.properties.map((p) => (p.id === id ? fn(p) : p)),
});

export function addProperty(s: Store, name: string): Store {
  const id = newId("p");
  const clean = name.trim().slice(0, 60) || `Property ${s.properties.length + 1}`;
  return { ...s, properties: [...s.properties, blankProperty(id, clean)], activePropertyId: id };
}

export const renameProperty = (s: Store, id: string, name: string) => updateProperty(s, id, (p) => ({ ...p, name: name.trim().slice(0, 60) || p.name }));

export function deleteProperty(s: Store, id: string): Store {
  const rest = s.properties.filter((p) => p.id !== id);
  if (!rest.length) return { ...emptyStore(), settings: s.settings };
  return { ...s, properties: rest, activePropertyId: s.activePropertyId === id ? rest[0].id : s.activePropertyId };
}

export const setDate = (p: PropertyData, key: ItemKey, iso: string): PropertyData => {
  const dates = { ...p.dates };
  if (iso) dates[key] = iso;
  else delete dates[key];
  return { ...p, dates };
};

export const upsertCustom = (p: PropertyData, c: CustomItem): PropertyData => ({
  ...p,
  custom: p.custom.some((x) => x.id === c.id) ? p.custom.map((x) => (x.id === c.id ? c : x)) : [...p.custom, c],
});

export const deleteCustom = (p: PropertyData, id: string): PropertyData => ({ ...p, custom: p.custom.filter((c) => c.id !== id) });

/** Example: one overdue, one due soon, the rest OK (relative to today, in England with gas). */
export function exampleProperty(today: string): PropertyData {
  const back = (months: number, days = 0) => addDays(addMonths(today, -months), days);
  return {
    id: "example",
    name: "Example: Flat 2",
    nation: "england",
    hasGas: true,
    example: true,
    dates: {
      gas: back(12, 25), // due in about 25 days
      fra: back(12, -40), // overdue by about 40 days
      eicr: back(24),
      pat: back(4),
      legionella: back(8),
      insurance: addMonths(today, 5),
    },
    custom: [{ id: "example-sweep", name: "Chimney sweep", mode: "interval", last: back(3), months: 12 }],
  };
}

export const withExample = (s: Store, today: string): Store => ({
  ...s,
  properties: [...s.properties.filter((p) => !p.example), exampleProperty(today)],
  activePropertyId: "example",
});

export function withoutExample(s: Store): Store {
  const rest = s.properties.filter((p) => !p.example);
  if (!rest.length) return { ...emptyStore(), settings: s.settings };
  return { ...s, properties: rest, activePropertyId: rest.some((p) => p.id === s.activePropertyId) ? s.activePropertyId : rest[0].id };
}

/* ---- Reading saved data safely ----------------------------------------- */

const NATIONS = Object.keys(nationLabels) as Nation[];
const KEYS = itemDefs.map((d) => d.key);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
const date = (v: unknown) => (typeof v === "string" && isValidDate(v) ? v : undefined);
const int = (v: unknown, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= max ? v : undefined);

function cleanCustom(x: unknown): CustomItem | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const id = str(o.id, 64);
  const name = str(o.name, 80)?.trim();
  if (!id || !name) return null;
  const c: CustomItem = { id, name, mode: o.mode === "fixed" ? "fixed" : "interval" };
  if (date(o.last)) c.last = date(o.last);
  if (int(o.months, 120)) c.months = int(o.months, 120);
  if (date(o.due)) c.due = date(o.due);
  return c;
}

function cleanProperty(x: unknown): PropertyData | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const id = str(o.id, 64);
  const name = str(o.name, 60);
  if (!id || !name) return null;
  const dates: PropertyData["dates"] = {};
  const raw = (o.dates && typeof o.dates === "object" ? o.dates : {}) as Record<string, unknown>;
  for (const k of KEYS) if (date(raw[k])) dates[k] = date(raw[k]);
  const p: PropertyData = {
    id,
    name,
    nation: NATIONS.includes(o.nation as Nation) ? (o.nation as Nation) : "england",
    hasGas: o.hasGas !== false,
    dates,
    custom: Array.isArray(o.custom) ? (o.custom.map(cleanCustom).filter(Boolean) as CustomItem[]).slice(0, 30) : [],
  };
  if (date(o.gasPrevDue)) p.gasPrevDue = date(o.gasPrevDue);
  if (date(o.eicrNext)) p.eicrNext = date(o.eicrNext);
  if (int(o.patMonths, 120)) p.patMonths = int(o.patMonths, 120);
  if (o.example === true) p.example = true;
  return p;
}

/** Turn saved JSON into a valid store, or null. */
export function cleanStore(x: unknown): Store | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.properties)) return null;
  const properties = (o.properties.map(cleanProperty).filter(Boolean) as PropertyData[]).slice(0, 20);
  if (!properties.length) return null;
  const st = (o.settings && typeof o.settings === "object" ? o.settings : {}) as Record<string, unknown>;
  return {
    version: 1,
    properties,
    activePropertyId: properties.find((p) => p.id === o.activePropertyId)?.id ?? properties[0].id,
    settings: {
      ...(int(st.remindDays, 365) ? { remindDays: int(st.remindDays, 365) } : {}),
      secondReminder: st.secondReminder === true,
      includeOverdue: st.includeOverdue !== false,
      scope: st.scope === "all" ? "all" : "property",
    },
  };
}
