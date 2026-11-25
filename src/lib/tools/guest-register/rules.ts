import { addMonths, isValidDate } from "../dates";
import { mapFigure, numberFigure, type Figures } from "../figures";

/* ---- Types ---------------------------------------------------------- */

export type Guest = {
  id: string;
  fullName: string;
  nationality: string;
  nationality2?: string;
  idNumber?: string;
  placeOfIssue?: string;
  nextDestination?: string;
  nextAddress?: string;
};

export type Platform = "airbnb" | "booking" | "vrbo" | "direct" | "other";
export const platformLabels: Record<Platform, string> = { airbnb: "Airbnb", booking: "Booking.com", vrbo: "Vrbo", direct: "Direct", other: "Other" };

export type Stay = {
  id: string;
  propertyId: string;
  reference: string;
  arrival: string;
  departure?: string;
  platform?: Platform;
  /** Guests under the minimum age: a count only, never names. */
  under16: number;
  guests: Guest[];
  /** YYYY-MM-DD */
  recordedOn: string;
  example?: boolean;
};

export type ExtraField = "idNumber" | "placeOfIssue" | "nextDestination" | "nextAddress";
export const extraFieldOrder: ExtraField[] = ["idNumber", "placeOfIssue", "nextDestination", "nextAddress"];

/** The stored lists the rules need, read once from the figures. */
export type Lists = {
  countries: Record<string, string>;
  exempt: Set<string>;
  /** Extra fields and whether each is required. */
  extraFields: { key: ExtraField; required: boolean }[];
  minAge: number;
  retentionMonths: number;
};

export function readLists(figures: Figures): Lists {
  const extra = mapFigure(figures, "guestRegister.extraFields");
  return {
    countries: mapFigure(figures, "guestRegister.countries"),
    exempt: new Set(Object.keys(mapFigure(figures, "guestRegister.exemptNationalities"))),
    extraFields: extraFieldOrder.filter((k) => k in extra).map((key) => ({ key, required: extra[key] === "required" })),
    minAge: numberFigure(figures, "guestRegister.minAge"),
    retentionMonths: numberFigure(figures, "guestRegister.retentionMonths"),
  };
}

export const countryName = (code: string | undefined, lists: Lists) => (code ? (lists.countries[code] ?? code) : "");

/* ---- Rules ---------------------------------------------------------- */

/**
 * Does this guest need the extra details? Not if ANY of their nationalities is
 * exempt (British, Irish, Commonwealth: a stored list). Everyone else needs
 * them, including stateless guests and unknown nationalities.
 * Returns null while no nationality has been chosen.
 */
export function needsExtraDetails(nationalities: (string | undefined)[], lists: Lists): boolean | null {
  const chosen = nationalities.filter((n): n is string => !!n);
  if (!chosen.length) return null;
  return !chosen.some((n) => lists.exempt.has(n));
}

export const guestNeedsExtra = (g: Guest, lists: Lists) => needsExtraDetails([g.nationality, g.nationality2], lists) === true;

export type GuestErrors = Partial<Record<"fullName" | "nationality" | ExtraField, string>>;

export const guestMessages: Record<keyof GuestErrors, string> = {
  fullName: "Add the guest’s full name",
  nationality: "Choose their nationality",
  idNumber: "Add their passport or ID number",
  placeOfIssue: "Add where it was issued",
  nextDestination: "Add where they’re going next",
  nextAddress: "Add the address of their next destination",
};

export function validateGuest(g: Guest, lists: Lists): GuestErrors {
  const e: GuestErrors = {};
  if (!g.fullName.trim()) e.fullName = guestMessages.fullName;
  if (!g.nationality) e.nationality = guestMessages.nationality;
  if (guestNeedsExtra(g, lists)) {
    for (const f of lists.extraFields) if (f.required && !(g[f.key] ?? "").trim()) e[f.key] = guestMessages[f.key];
  }
  return e;
}

export type StayErrors = {
  stay: Partial<Record<"propertyId" | "arrival" | "departure" | "guests", string>>;
  guests: Record<string, GuestErrors>;
  /** Total number of problems. */
  count: number;
};

export function validateStay(s: Stay, lists: Lists): StayErrors {
  const stay: StayErrors["stay"] = {};
  if (!s.propertyId) stay.propertyId = "Choose a property";
  if (!s.arrival) stay.arrival = "Add the arrival date";
  else if (!isValidDate(s.arrival)) stay.arrival = "Enter the arrival date as DD/MM/YYYY";
  if (s.departure && !isValidDate(s.departure)) stay.departure = "Enter the departure date as DD/MM/YYYY";
  else if (s.departure && isValidDate(s.arrival) && s.departure < s.arrival) stay.departure = "The departure date can’t be before the arrival date";
  if (!s.guests.length) stay.guests = `Add at least one guest aged ${lists.minAge} or over`;
  const guests: StayErrors["guests"] = {};
  for (const g of s.guests) {
    const e = validateGuest(g, lists);
    if (Object.keys(e).length) guests[g.id] = e;
  }
  const count = Object.keys(stay).length + Object.values(guests).reduce((a, e) => a + Object.keys(e).length, 0);
  return { stay, guests, count };
}

/* ---- Retention ------------------------------------------------------ */

/** (departure, or arrival if none) + retention months, calendar-month arithmetic. */
export function keepUntil(s: Pick<Stay, "arrival" | "departure">, figures: Figures): string {
  const from = s.departure && isValidDate(s.departure) ? s.departure : s.arrival;
  return addMonths(from, numberFigure(figures, "guestRegister.retentionMonths"));
}

export const isPastRetention = (s: Pick<Stay, "arrival" | "departure">, figures: Figures, today: string) => today >= keepUntil(s, figures);

/* ---- Helpers -------------------------------------------------------- */

/** Copy the first next destination (and address) to every other guest who needs extra details. */
export function copyNextDestination(guests: Guest[], lists: Lists): Guest[] {
  const source = guests.find((g) => guestNeedsExtra(g, lists) && (g.nextDestination ?? "").trim()) ?? guests.find((g) => (g.nextDestination ?? "").trim());
  if (!source) return guests;
  return guests.map((g) => (g.id !== source.id && guestNeedsExtra(g, lists) ? { ...g, nextDestination: source.nextDestination, nextAddress: source.nextAddress } : g));
}

export const extraCount = (s: Stay, lists: Lists) => s.guests.filter((g) => guestNeedsExtra(g, lists)).length;
