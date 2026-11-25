import { addDays, isValidDate, nightsBetween } from "./dates";
import { platformLabels, type Booking, type Platform, type Property, type Store } from "./types";

/** The most nights a single booking can have. */
export const MAX_BOOKING_NIGHTS = 366;

export type Draft = {
  checkIn: string;
  checkOut: string;
  platform: Platform | "";
  otherPlatform?: string;
  reference?: string;
  note?: string;
};

export type DraftErrors = Partial<Record<"checkIn" | "checkOut" | "platform", string>>;

/** Check a booking before adding it. */
export function validateDraft(d: Draft): DraftErrors {
  const e: DraftErrors = {};
  if (!d.checkIn || !d.checkOut) {
    if (!d.checkIn) e.checkIn = "Add a check-in and check-out date.";
    if (!d.checkOut) e.checkOut = "Add a check-in and check-out date.";
  } else if (!isValidDate(d.checkIn)) e.checkIn = "Enter a real date.";
  else if (!isValidDate(d.checkOut)) e.checkOut = "Enter a real date.";
  else {
    const n = nightsBetween(d.checkIn, d.checkOut);
    if (n <= 0) e.checkOut = "Check-out must be after check-in.";
    else if (n > MAX_BOOKING_NIGHTS) e.checkOut = "That’s over a year. Check the dates.";
  }
  if (!d.platform || !(d.platform in platformLabels)) e.platform = "Choose where it was booked.";
  return e;
}

/** Nights field ↔ check-out date. */
export const checkOutFromNights = (checkIn: string, nights: number) => (isValidDate(checkIn) && Number.isInteger(nights) && nights > 0 ? addDays(checkIn, nights) : "");

/** Same dates and platform as an existing booking (ignoring the one being edited). */
export function findDuplicate(d: Draft, bookings: Booking[], ignoreId?: string): Booking | undefined {
  const other = (d.otherPlatform ?? "").trim().toLowerCase();
  return bookings.find(
    (b) =>
      b.id !== ignoreId &&
      b.checkIn === d.checkIn &&
      b.checkOut === d.checkOut &&
      b.platform === d.platform &&
      (d.platform !== "other" || (b.otherPlatform ?? "").trim().toLowerCase() === other),
  );
}

let counter = 0;
export const newId = (prefix = "b") => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function draftToBooking(d: Draft, id = newId()): Booking {
  const b: Booking = { id, checkIn: d.checkIn, checkOut: d.checkOut, platform: d.platform as Platform };
  if (d.platform === "other" && d.otherPlatform?.trim()) b.otherPlatform = d.otherPlatform.trim().slice(0, 60);
  if (d.reference?.trim()) b.reference = d.reference.trim().slice(0, 120);
  if (d.note?.trim()) b.note = d.note.trim().slice(0, 300);
  return b;
}

/* ---- Store: properties and their bookings ------------------------------- */

/** A fresh store with one property. Uses a fixed id so it's safe to create while rendering. */
export function emptyStore(): Store {
  const id = "my-property";
  return { version: 1, properties: [{ id, name: "My property", bookings: [] }], activePropertyId: id, wholeHome: true, paysCouncilTax: true };
}

const mapProperty = (s: Store, propertyId: string, fn: (p: Property) => Property): Store => ({
  ...s,
  properties: s.properties.map((p) => (p.id === propertyId ? fn(p) : p)),
});

export const activeProperty = (s: Store) => s.properties.find((p) => p.id === s.activePropertyId) ?? s.properties[0];

export const addBooking = (s: Store, propertyId: string, b: Booking) => mapProperty(s, propertyId, (p) => ({ ...p, bookings: [...p.bookings, b] }));

export const updateBooking = (s: Store, propertyId: string, b: Booking) =>
  mapProperty(s, propertyId, (p) => ({ ...p, bookings: p.bookings.map((x) => (x.id === b.id ? b : x)) }));

/** Remove a booking; returns what's needed to undo it. */
export function deleteBooking(s: Store, propertyId: string, bookingId: string) {
  const p = s.properties.find((x) => x.id === propertyId);
  const index = p?.bookings.findIndex((b) => b.id === bookingId) ?? -1;
  if (!p || index < 0) return { store: s, removed: null };
  const removed = { propertyId, index, booking: p.bookings[index] };
  return { store: mapProperty(s, propertyId, (x) => ({ ...x, bookings: x.bookings.filter((b) => b.id !== bookingId) })), removed };
}

export const restoreBooking = (s: Store, r: { propertyId: string; index: number; booking: Booking }) =>
  mapProperty(s, r.propertyId, (p) => {
    const bookings = [...p.bookings];
    bookings.splice(Math.min(r.index, bookings.length), 0, r.booking);
    return { ...p, bookings };
  });

export function addProperty(s: Store, name: string): Store {
  const id = newId("p");
  return { ...s, properties: [...s.properties, { id, name: name.trim().slice(0, 60) || `Property ${s.properties.length + 1}`, bookings: [] }], activePropertyId: id };
}

export const renameProperty = (s: Store, id: string, name: string) => mapProperty(s, id, (p) => ({ ...p, name: name.trim().slice(0, 60) || p.name }));

export function deleteProperty(s: Store, id: string): Store {
  const rest = s.properties.filter((p) => p.id !== id);
  if (!rest.length) return emptyStore();
  return { ...s, properties: rest, activePropertyId: s.activePropertyId === id ? rest[0].id : s.activePropertyId };
}

/* ---- Reading saved data safely ----------------------------------------- */

const PLATFORMS = Object.keys(platformLabels) as Platform[];

function cleanBooking(x: unknown): Booking | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || !isValidDate(o.checkIn as string) || !isValidDate(o.checkOut as string)) return null;
  if (!PLATFORMS.includes(o.platform as Platform)) return null;
  const n = nightsBetween(o.checkIn as string, o.checkOut as string);
  if (n <= 0 || n > MAX_BOOKING_NIGHTS) return null;
  const b: Booking = { id: o.id.slice(0, 64), checkIn: o.checkIn as string, checkOut: o.checkOut as string, platform: o.platform as Platform };
  for (const k of ["otherPlatform", "reference", "note"] as const) if (typeof o[k] === "string" && o[k]) b[k] = (o[k] as string).slice(0, 300);
  if (o.example === true) b.example = true;
  return b;
}

/** Turn anything (saved JSON, a backup file) into a valid store, or null. */
export function cleanStore(x: unknown): Store | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.properties)) return null;
  const properties: Property[] = [];
  for (const p of o.properties as unknown[]) {
    if (!p || typeof p !== "object") continue;
    const q = p as Record<string, unknown>;
    if (typeof q.id !== "string" || typeof q.name !== "string") continue;
    const bookings = Array.isArray(q.bookings) ? (q.bookings.map(cleanBooking).filter(Boolean) as Booking[]) : [];
    properties.push({ id: q.id.slice(0, 64), name: q.name.slice(0, 60) || "My property", bookings });
  }
  if (!properties.length) return null;
  const active = properties.find((p) => p.id === o.activePropertyId)?.id ?? properties[0].id;
  return { version: 1, properties, activePropertyId: active, wholeHome: o.wholeHome !== false, paysCouncilTax: o.paysCouncilTax !== false };
}
