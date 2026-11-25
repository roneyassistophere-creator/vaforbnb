import { isHttpsUrl, type AdminEvent } from "./admin";
import type { PublicEvent } from "./types";

/**
 * What the public may see: published events with an official https source,
 * and never sample (test) data unless explicitly allowed (local testing only).
 * Past events are filtered by date on the device (and on the server).
 */
export function toPublic(rows: (AdminEvent & { isSample?: boolean })[], opts: { allowSample: boolean }): PublicEvent[] {
  return rows
    .filter((e) => e.status === "published" && isHttpsUrl(e.sourceUrl) && (opts.allowSample || !e.isSample))
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      category: e.category,
      startDate: e.startDate,
      endDate: e.endDate || e.startDate,
      startTime: e.startTime || null,
      dateStatus: e.dateStatus,
      city: e.city,
      venue: e.venue || null,
      latitude: e.latitude,
      longitude: e.longitude,
      demand: e.demand,
      demandReason: e.demandReason || null,
      shortDescription: e.shortDescription || null,
      sourceTitle: e.sourceTitle,
      sourceUrl: e.sourceUrl,
      lastChecked: e.lastChecked,
      featured: e.featured,
    }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));
}
