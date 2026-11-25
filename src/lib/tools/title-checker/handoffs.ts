/**
 * Hand-offs in the shared device format (src/lib/tools/handoff.ts). Nothing
 * is sent anywhere: these are saved on, and read from, the visitor's device.
 *
 *  - In:  "listing-title" from the AI-readiness scorer (Get more bookings kit, step 1 → 2).
 *  - Out: "listing-text" for the AI-ready description builder (step 2 → 3). Keeps
 *         the description the scorer saved and updates the title and details.
 *  - Out: "scorer-prefill" for "Check your whole listing" (the scorer prefills the title).
 */

import { toolSlug } from "@/content/tools/titleCheckerId";
import type { ListingTextHandoff, TitleHandoff } from "@/lib/tools/ai-readiness/handoffs";
import { makeHandoff, type Handoff } from "@/lib/tools/handoff";
import { squash } from "@/lib/tools/listing-text";
import type { Details } from "./check";
import { cleanDetails, LIMITS } from "./inputs";

/** `standout`: from the description builder, for the title builder (empty when not sent). */
export type TitleImport = { title: string; details: Details; maxGuests: number | null; standout: string };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);

/**
 * Validate a "listing-title" hand-off's data. The scorer has separate station
 * and landmark fields; the checker has one, so it takes the station, or the
 * landmark if there's no station.
 */
export function parseTitleImport(data: unknown): TitleImport | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Partial<TitleHandoff> & Record<string, unknown>;
  const title = str(o.title, LIMITS.title);
  const standout = str(o.standout, 60);
  // The description builder may send no title, only the details and the standout feature.
  if (!title && !standout) return null;
  const details = cleanDetails({
    town: str(o.town, LIMITS.place),
    place: str(o.station, LIMITS.place) || str(o.landmark, LIMITS.place),
    propertyType: str(o.propertyType, 20),
    bedrooms: num(o.bedrooms, 0, LIMITS.bedrooms),
  });
  return { title, details, maxGuests: num(o.maxGuests, 1, LIMITS.guests), standout };
}

const isListingText = (d: unknown): d is ListingTextHandoff => !!d && typeof d === "object" && typeof (d as ListingTextHandoff).description === "string" && typeof (d as ListingTextHandoff).details === "object";

/**
 * For the AI-ready description builder: the final title and details. If the
 * scorer already saved the listing text, its description and other fields are
 * kept and only the title and details are updated.
 */
export function descriptionHandoff(title: string, details: Details, maxGuests: number | null, existing: unknown, now?: Date): Handoff<ListingTextHandoff> {
  const prev: ListingTextHandoff | null = isListingText(existing) ? existing : null;
  const d = prev?.details;
  const place = details.place.trim();
  // The checker has one "station or landmark" field. If it's still one of the scorer's, keep the scorer's
  // station and landmark as they were; otherwise it's a new place, saved as the landmark.
  const same = !!d && !!place && (squash(d.station) === squash(place) || squash(d.landmark) === squash(place));
  const station = same ? d!.station : "";
  const landmark = same ? d!.landmark : place;
  return makeHandoff(
    "listing-text",
    toolSlug,
    {
      title: title.trim(),
      description: prev?.description ?? "",
      sections: prev?.sections ?? null,
      details: {
        town: details.town.trim(),
        station,
        landmark,
        propertyType: details.propertyType || d?.propertyType || "",
        bedrooms: details.bedrooms ?? d?.bedrooms ?? 0,
        maxGuests: maxGuests ?? d?.maxGuests ?? 0,
      },
      guestTypes: prev?.guestTypes ?? [],
      uncoveredNeeds: prev?.uncoveredNeeds ?? [],
      vagueWords: prev?.vagueWords ?? [],
    },
    now,
  );
}

export type ScorerPrefill = { title: string; town: string; place: string; propertyType: string; bedrooms: number | null };

/** For "Check your whole listing": the AI-readiness scorer prefills the title (and details) once. */
export function scorerPrefillHandoff(title: string, details: Details, now?: Date): Handoff<ScorerPrefill> {
  return makeHandoff("scorer-prefill", toolSlug, { title: title.trim(), town: details.town.trim(), place: details.place.trim(), propertyType: details.propertyType, bedrooms: details.bedrooms }, now);
}
