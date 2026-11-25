import { addDays, addMonths, isValidDate } from "../dates";
import type { Figures } from "../figures";
import { isPastRetention, platformLabels, type Guest, type Platform, type Stay } from "./rules";

export type Property = { id: string; name: string };

export type Draft = { step: 1 | 2 | 3; stay: Stay; editingId: string | null };

export type Data = {
  properties: Property[];
  lastPropertyId: string;
  stays: Stay[];
  draft: Draft | null;
  settings: { retentionReminder: boolean; sharedNoticeShown: boolean };
};

let counter = 0;
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const emptyGuest = (id: string): Guest => ({ id, fullName: "", nationality: "" });

export function emptyData(): Data {
  return {
    properties: [{ id: "my-property", name: "My property" }],
    lastPropertyId: "my-property",
    stays: [],
    draft: null,
    settings: { retentionReminder: true, sharedNoticeShown: false },
  };
}

/** A new stay for the form: arrival today, two adult guests. Ids are fixed so it's safe while rendering. */
export function newStay(propertyId: string, today: string, adults = 2): Stay {
  return {
    id: "draft",
    propertyId,
    reference: "",
    arrival: today,
    under16: 0,
    guests: Array.from({ length: adults }, (_, i) => emptyGuest(`g${i + 1}`)),
    recordedOn: today,
  };
}

/** Grow or shrink the guest cards to match the adult count (keeps what's typed). */
export function resizeGuests(guests: Guest[], n: number): Guest[] {
  if (n <= guests.length) return guests.slice(0, n);
  const used = new Set(guests.map((g) => g.id));
  const extra: Guest[] = [];
  for (let i = 1; extra.length < n - guests.length; i++) {
    if (used.has(`g${i}`)) continue;
    extra.push(emptyGuest(`g${i}`));
    used.add(`g${i}`);
  }
  return [...guests, ...extra];
}

/** Example: one British and one French guest (not saved unless the host saves it). */
export function exampleStay(propertyId: string, today: string): Stay {
  return {
    id: "draft",
    propertyId,
    reference: "HMEXAMPLE1",
    arrival: today,
    departure: addDays(today, 3),
    platform: "airbnb",
    under16: 1,
    guests: [
      { id: "g1", fullName: "Sam Taylor", nationality: "GB" },
      { id: "g2", fullName: "Amélie Martin", nationality: "FR", idNumber: "12AB34567", placeOfIssue: "FR", nextDestination: "Paris" },
    ],
    recordedOn: today,
    example: true,
  };
}

/**
 * A sample register: three stays (one past retention), with guests who do and
 * don't need extra details. Marked as example data and removable in one go.
 */
export function exampleRegister(propertyId: string, today: string): Stay[] {
  const ago = (months: number, days = 0) => addDays(addMonths(today, -months), days);
  return [
    { ...exampleStay(propertyId, ago(0, -10)), id: "example-1", recordedOn: ago(0, -10) },
    {
      id: "example-2",
      propertyId,
      reference: "BK-20488",
      arrival: ago(2),
      departure: ago(2, 4),
      platform: "booking",
      under16: 2,
      guests: [
        { id: "g1", fullName: "Jordan Lee", nationality: "US", idNumber: "A1234567", placeOfIssue: "US", nextDestination: "Edinburgh" },
        { id: "g2", fullName: "Casey Lee", nationality: "US", idNumber: "A7654321", placeOfIssue: "US", nextDestination: "Edinburgh" },
      ],
      recordedOn: ago(2),
      example: true,
    },
    {
      id: "example-3",
      propertyId,
      reference: "",
      arrival: ago(13),
      departure: ago(13, 2),
      platform: "direct",
      under16: 0,
      guests: [{ id: "g1", fullName: "Priya Sharma", nationality: "CA" }],
      recordedOn: ago(13),
      example: true,
    },
  ];
}

/** Load the sample register and an example stay in the form. */
export const withExample = (d: Data, today: string): Data => ({
  ...d,
  stays: [...d.stays.filter((s) => !s.example), ...exampleRegister(d.lastPropertyId, today)],
  draft: { step: 1, stay: exampleStay(d.lastPropertyId, today), editingId: null },
});

/** Remove every example stay (and the example in the form). */
export const withoutExample = (d: Data): Data => ({
  ...d,
  stays: d.stays.filter((s) => !s.example),
  draft: d.draft?.stay.example || (d.draft?.editingId ?? "").startsWith("example-") ? null : d.draft,
});

/** Add or replace a saved stay (newest first is a display concern). */
export function saveStay(d: Data, stay: Stay, editingId: string | null): { data: Data; saved: Stay } {
  // Editing a sample stay keeps it marked as an example; anything else is a real record.
  const saved: Stay = { ...stay, id: editingId ?? newId("s") };
  if (editingId?.startsWith("example-")) saved.example = true;
  else delete saved.example;
  const stays = editingId ? d.stays.map((s) => (s.id === editingId ? saved : s)) : [...d.stays, saved];
  return { data: { ...d, stays, draft: null, lastPropertyId: stay.propertyId }, saved };
}

/** Delete every stay past retention; returns what's needed to undo. */
export function deletePastRetention(d: Data, figures: Figures, today: string): { data: Data; removed: Stay[] } {
  const removed = d.stays.filter((s) => isPastRetention(s, figures, today));
  return { data: { ...d, stays: d.stays.filter((s) => !isPastRetention(s, figures, today)) }, removed };
}

export const restoreStays = (d: Data, removed: Stay[]): Data => ({ ...d, stays: [...d.stays, ...removed.filter((r) => !d.stays.some((s) => s.id === r.id))] });

export const newestFirst = (stays: Stay[]) => [...stays].sort((a, b) => (a.arrival < b.arrival ? 1 : a.arrival > b.arrival ? -1 : a.id < b.id ? 1 : -1));

export function filterStays(stays: Stay[], f: { query: string; propertyId: string; from: string; to: string }): Stay[] {
  const q = f.query.trim().toLowerCase();
  return stays.filter(
    (s) =>
      (!f.propertyId || s.propertyId === f.propertyId) &&
      (!f.from || s.arrival >= f.from) &&
      (!f.to || s.arrival <= f.to) &&
      (!q || s.reference.toLowerCase().includes(q) || s.guests.some((g) => g.fullName.toLowerCase().includes(q))),
  );
}

/* ---- Reading saved data safely ----------------------------------------- */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const opt = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : undefined);
const PLATFORMS = Object.keys(platformLabels) as Platform[];

function cleanGuest(x: unknown): Guest | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string") return null;
  const g: Guest = { id: o.id.slice(0, 40), fullName: str(o.fullName, 120), nationality: str(o.nationality, 20) };
  for (const k of ["nationality2", "idNumber", "placeOfIssue", "nextDestination", "nextAddress"] as const) {
    const v = opt(o[k], k === "nextAddress" ? 300 : 120);
    if (v) g[k] = v;
  }
  return g;
}

function cleanStay(x: unknown): Stay | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.propertyId !== "string") return null;
  const s: Stay = {
    id: o.id.slice(0, 64),
    propertyId: o.propertyId.slice(0, 64),
    reference: str(o.reference, 60),
    arrival: isValidDate(o.arrival as string) ? (o.arrival as string) : "",
    under16: typeof o.under16 === "number" && Number.isInteger(o.under16) && o.under16 >= 0 && o.under16 <= 30 ? o.under16 : 0,
    guests: Array.isArray(o.guests) ? (o.guests.map(cleanGuest).filter(Boolean) as Guest[]).slice(0, 40) : [],
    recordedOn: isValidDate(o.recordedOn as string) ? (o.recordedOn as string) : "",
  };
  if (isValidDate(o.departure as string)) s.departure = o.departure as string;
  if (PLATFORMS.includes(o.platform as Platform)) s.platform = o.platform as Platform;
  if (o.example === true) s.example = true;
  return s;
}

/** Turn saved JSON into valid data, or null. */
export function cleanData(x: unknown): Data | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const properties = Array.isArray(o.properties)
    ? (o.properties
        .map((p) => (p && typeof p === "object" && typeof (p as Property).id === "string" && typeof (p as Property).name === "string" ? { id: (p as Property).id.slice(0, 64), name: (p as Property).name.slice(0, 60) } : null))
        .filter(Boolean) as Property[])
    : [];
  if (!properties.length) return null;
  const stays = Array.isArray(o.stays) ? (o.stays.map(cleanStay).filter((s) => s && s.arrival) as Stay[]) : [];
  const dr = o.draft as Record<string, unknown> | null;
  const draftStay = dr && typeof dr === "object" ? cleanStay(dr.stay) : null;
  const st = (o.settings && typeof o.settings === "object" ? o.settings : {}) as Record<string, unknown>;
  return {
    properties,
    lastPropertyId: properties.find((p) => p.id === o.lastPropertyId)?.id ?? properties[0].id,
    stays,
    draft: draftStay ? { step: dr!.step === 2 || dr!.step === 3 ? dr!.step : 1, stay: draftStay, editingId: typeof dr!.editingId === "string" ? dr!.editingId : null } : null,
    settings: { retentionReminder: st.retentionReminder !== false, sharedNoticeShown: st.sharedNoticeShown === true },
  };
}
