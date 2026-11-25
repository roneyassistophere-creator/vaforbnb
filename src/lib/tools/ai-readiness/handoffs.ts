/**
 * Hand-offs to the next tools, saved on this device in the shared format
 * (src/lib/tools/handoff.ts). Nothing is sent anywhere.
 */

import { toolSlug } from "@/content/tools/aiReadinessId";
import { makeHandoff, type Handoff } from "@/lib/tools/handoff";
import { findPhrases } from "@/lib/tools/listing-text";
import type { Model } from "./content";
import { descriptionOf, LIMITS, type Inputs } from "./inputs";
import type { Score } from "./score";

export type ListingTextHandoff = {
  title: string;
  description: string;
  sections: Inputs["sections"] | null;
  details: { town: string; station: string; landmark: string; propertyType: string; bedrooms: number; maxGuests: number };
  guestTypes: string[];
  uncoveredNeeds: string[];
  vagueWords: string[];
};

/** For the AI-ready description builder: shows "Imported from your AI-readiness score". */
export function descriptionHandoff(i: Inputs, s: Score): Handoff<ListingTextHandoff> {
  return makeHandoff("listing-text", toolSlug, {
    title: i.title.trim(),
    description: descriptionOf(i),
    sections: i.oneBox ? null : i.sections,
    details: { town: i.town.trim(), station: i.station.trim(), landmark: i.landmark.trim(), propertyType: i.propertyType, bedrooms: i.bedrooms, maxGuests: i.maxGuests },
    guestTypes: i.guestTypes,
    uncoveredNeeds: s.needs.filter((n) => !n.covered).map((n) => n.id),
    vagueWords: [...new Set(s.analysis.vague.map((v) => v.term))],
  });
}

export type TitleHandoff = { title: string; town: string; station: string; landmark: string; propertyType: string; bedrooms: number; maxGuests: number };

/** For the Airbnb title checker (next in the Get more bookings kit). */
export function titleHandoff(i: Inputs): Handoff<TitleHandoff> {
  return makeHandoff("listing-title", toolSlug, {
    title: i.title.trim(),
    town: i.town.trim(),
    station: i.station.trim(),
    landmark: i.landmark.trim(),
    propertyType: i.propertyType,
    bedrooms: i.bedrooms,
    maxGuests: i.maxGuests,
  });
}

export type AuditPrefill = { score: number; band: string; town: string };

/** For the free audit form, only when the host agrees: score, band and town. Never listing text. */
export function auditHandoff(i: Inputs, s: Score): Handoff<AuditPrefill> {
  return makeHandoff("audit-prefill", toolSlug, { score: s.total, band: s.band.label, town: i.town.trim() });
}

/**
 * From the Airbnb title checker's "Check your whole listing" ("scorer-prefill"):
 * fills the title and the details the host gave there. The checker has one
 * "station or landmark" field: it goes in Station when it names a transport
 * stop (stored transport words), otherwise in Landmark. Returns null if the data is unusable.
 */
export function applyTitlePrefill(i: Inputs, data: unknown, model: Pick<Model, "location" | "propertyTypeWords">, types: string[]): Inputs | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const title = str(o.title, LIMITS.title);
  if (!title) return null;
  const place = str(o.place, LIMITS.place);
  const isStop = !!place && findPhrases(place, model.location.transportWords).length > 0;
  const type = str(o.propertyType, 20);
  const beds = typeof o.bedrooms === "number" && Number.isFinite(o.bedrooms) ? Math.min(LIMITS.bedrooms, Math.max(0, Math.round(o.bedrooms))) : null;
  return {
    ...i,
    title,
    town: str(o.town, LIMITS.place) || i.town,
    station: place && isStop ? place : i.station,
    landmark: place && !isStop ? place : i.landmark,
    propertyType: types.includes(type) ? type : i.propertyType,
    bedrooms: beds ?? i.bedrooms,
  };
}
