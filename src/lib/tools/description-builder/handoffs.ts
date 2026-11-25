/**
 * Hand-offs in the shared device format (src/lib/tools/handoff.ts). Nothing
 * is sent anywhere: these are saved on, and read from, the visitor's device.
 *
 *  - "listing-text": the four sections, details and `facts` (for the photo
 *    shot list planner, kit step 4, and any later tool).
 *  - "scorer-prefill": "Score this" (the scorer fills the sections and details).
 *  - "listing-title": "Back to title checker" (standout feature and area).
 */

import { toolSlug } from "@/content/tools/descriptionBuilderId";
import type { ListingTextHandoff } from "@/lib/tools/ai-readiness/handoffs";
import { makeHandoff, type Handoff } from "@/lib/tools/handoff";
import type { SectionId } from "./content";
import { formatTime, validPlaces } from "./build";
import { amenitiesFrom, toScorerInputs } from "./checks";
import type { Facts } from "./facts";

const PLANNER_PARKING: Record<string, string> = { drivewayFree: "driveway", streetFree: "street", permit: "permit", paidNearby: "carPark", none: "none" };
const PLANNER_HONEST: Record<string, string> = { stairsNoLift: "stairsNoLift", steepStairs: "steepStairs", sharedEntrance: "sharedEntrance", compactKitchen: "compactKitchen", streetNoise: "streetNoise" };
const PLANNER_KITCHEN: Record<string, string> = { oven: "oven", hob: "hob", microwave: "microwave", dishwasher: "dishwasher", fridgeFreezer: "fridge-freezer", kettle: "kettle", toaster: "toaster", coffee: "coffee machine" };
const VIEWS = ["canal", "sea", "river", "city", "countryside", "park"];

/** The facts in the photo shot list planner's field names (only what maps cleanly). */
export function plannerFacts(f: Facts): Record<string, unknown> {
  const out: Record<string, unknown> = {
    bedrooms: f.bedrooms,
    beds: f.beds.map((b) => (b === "cot" ? "" : b)),
    ensuites: f.ensuites,
    bathrooms: f.bathrooms,
    workspace: f.workspace === "full" ? "full" : f.workspace === "none" ? "none" : "desk",
    workspaceLocation: f.workspaceLocation,
    guestTypes: f.guestTypes,
    places: validPlaces(f).slice(0, 3).map((p) => ({ name: p.name, minutes: p.minutes, mode: p.mode })),
  };
  if (f.wifiMbps) out.wifiMbps = f.wifiMbps;
  if (f.sizeM2) out.sizeM2 = f.sizeM2;
  if (f.outdoor) out.outdoor = [f.outdoor];
  if (f.laundry.some((l) => l === "washer" || l === "dryer")) out.laundry = f.laundry.filter((l) => l === "washer" || l === "dryer");
  if (f.heating.includes("logBurner")) out.extras = ["fireplace"];
  const kitchen = f.kitchen.map((k) => PLANNER_KITCHEN[k]).filter(Boolean);
  if (kitchen.length) out.kitchenItems = kitchen;
  if (["keypad", "keySafe", "smartLock"].includes(f.checkIn)) out.checkIn = f.checkIn;
  if (f.checkInTime) out.checkInTime = formatTime(f.checkInTime);
  if (PLANNER_PARKING[f.parking]) out.parking = PLANNER_PARKING[f.parking];
  if (f.parkingSpaces) out.parkingSpaces = f.parkingSpaces;
  if (f.floor) out.floor = f.floor;
  if (f.lift !== null) out.lift = f.lift;
  const honest = f.honest.map((h) => PLANNER_HONEST[h]).filter(Boolean);
  if (honest.length) out.honest = honest;
  // The standout as a planner item, when it clearly names one: a view, or the outdoor space.
  const view = VIEWS.find((w) => new RegExp(`\\b${w}[\\s-]+views?\\b`, "i").test(f.standout));
  if (view) {
    out.view = view;
    out.standout = "view";
  } else if (f.outdoor && new RegExp(f.outdoor.replace(/([A-Z])/g, " $1").toLowerCase().trim().split(" ").pop() ?? "x", "i").test(f.standout)) {
    out.standout = `outdoor:${f.outdoor}`;
  }
  out.standoutText = f.standout;
  return out;
}

/** "listing-text": the sections, details and facts. Keeps the title another tool saved. */
export function listingTextHandoff(f: Facts, sections: Record<SectionId, string>, title = "", now?: Date): Handoff<ListingTextHandoff & { facts: Record<string, unknown>; area: string }> {
  const inputs = toScorerInputs(f, sections, title);
  return makeHandoff(
    "listing-text",
    toolSlug,
    {
      title,
      description: sections.listing,
      sections: { description: sections.listing, space: sections.space, access: sections.access, notes: sections.notes },
      details: { town: f.town, station: inputs.station, landmark: inputs.landmark, propertyType: inputs.propertyType, bedrooms: f.bedrooms, maxGuests: f.maxGuests ?? 0 },
      guestTypes: f.guestTypes,
      uncoveredNeeds: [],
      vagueWords: [],
      area: f.area,
      facts: plannerFacts(f),
    },
    now,
  );
}

export type DescriptionPrefill = {
  title: string;
  sections: { description: string; space: string; access: string; notes: string };
  town: string;
  station: string;
  landmark: string;
  propertyType: string;
  bedrooms: number;
  maxGuests: number;
  guestTypes: string[];
  amenities: string[];
  parking: string;
  bedSizes: boolean;
  honest: boolean;
};

/** "Score this": everything the scorer needs to score these sections. */
export function scorerPrefillHandoff(f: Facts, sections: Record<SectionId, string>, title = "", now?: Date): Handoff<DescriptionPrefill> {
  const i = toScorerInputs(f, sections, title);
  return makeHandoff(
    "scorer-prefill",
    toolSlug,
    { title, sections: i.sections, town: i.town, station: i.station, landmark: i.landmark, propertyType: i.propertyType, bedrooms: i.bedrooms, maxGuests: i.maxGuests, guestTypes: i.guestTypes, amenities: amenitiesFrom(f), parking: i.parking, bedSizes: i.bedSizes, honest: i.honest },
    now,
  );
}

/** "Back to title checker": the details, plus the standout feature and area for its title builder. */
export function titleHandoff(f: Facts, sections: Record<SectionId, string>, title = "", now?: Date) {
  const i = toScorerInputs(f, sections, title);
  return makeHandoff("listing-title", toolSlug, { title, town: f.town, station: i.station, landmark: i.landmark, propertyType: i.propertyType, bedrooms: f.bedrooms, maxGuests: f.maxGuests ?? 0, standout: f.standout, area: f.area }, now);
}
