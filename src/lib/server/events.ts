import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { eventsCacheTag } from "@/content/tools/eventCalendarId";
import * as seed from "@/data/events";
import { auditLog, bankHolidays, eventCategories, eventCities, events, eventSuggestions, figures, type EventRow } from "@/db/schema";
import { jsonFigure, londonToday } from "@/lib/tools/figures";
import { auditRecord, toPublic, type AdminEvent, type BankHoliday, type Category, type City, type PublicData, type Settings, type Suggestion } from "@/lib/tools/events";
import { getDb } from "./db";
import { getFigures } from "./figures";

/** Sample (test) events are never shown on the live site: only in local development, when switched on. */
export const allowSample = () => process.env.NODE_ENV !== "production" && process.env.EVENTS_SHOW_SAMPLE === "on";

/* ---- Row mapping --------------------------------------------------------------- */

export type StoredEvent = AdminEvent & { id: string; isSample: boolean; createdAt: string; updatedAt: string; updatedBy: string };

export function rowToEvent(r: EventRow): StoredEvent {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.categorySlug,
    startDate: r.startDate,
    endDate: r.endDate,
    startTime: r.startTime ?? "",
    dateStatus: r.dateStatus,
    city: r.citySlug,
    venue: r.venue ?? "",
    address: r.address ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
    demand: r.demand,
    demandReason: r.demandReason ?? "",
    shortDescription: r.shortDescription ?? "",
    sourceTitle: r.sourceTitle,
    sourceUrl: r.sourceUrl,
    secondSourceUrl: r.secondSourceUrl ?? "",
    lastChecked: r.lastChecked,
    checkedBy: r.checkedBy ?? "",
    status: r.status,
    recurrence: r.recurrence,
    usualMonth: r.usualMonth,
    usualWeek: r.usualWeek,
    featured: r.featured,
    internalNotes: r.internalNotes ?? "",
    isSample: r.isSample,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    updatedBy: r.updatedBy ?? "",
  };
}

export function eventToRow(e: AdminEvent, user: string) {
  return {
    slug: e.slug,
    name: e.name.trim(),
    categorySlug: e.category,
    startDate: e.startDate,
    endDate: e.endDate || e.startDate,
    startTime: e.startTime || null,
    dateStatus: e.dateStatus,
    citySlug: e.city,
    venue: e.venue.trim() || null,
    address: e.address.trim() || null,
    latitude: e.latitude,
    longitude: e.longitude,
    demand: e.demand,
    demandReason: e.demandReason.trim() || null,
    shortDescription: e.shortDescription.trim() || null,
    sourceTitle: e.sourceTitle.trim(),
    sourceUrl: e.sourceUrl.trim(),
    secondSourceUrl: e.secondSourceUrl.trim() || null,
    lastChecked: e.lastChecked,
    checkedBy: e.checkedBy || null,
    status: e.status,
    recurrence: e.recurrence,
    usualMonth: e.usualMonth,
    usualWeek: e.usualWeek,
    featured: e.featured,
    internalNotes: e.internalNotes.trim() || null,
    updatedAt: new Date(),
    updatedBy: user,
  };
}

const toCity = (c: typeof eventCities.$inferSelect): City => ({ slug: c.slug, name: c.name, nation: c.nation, region: c.region, latitude: c.latitude, longitude: c.longitude, covered: c.covered, aliases: c.aliases ?? [], intro: c.intro });
const toCategory = (c: typeof eventCategories.$inferSelect): Category => ({ slug: c.slug, name: c.name, icon: c.icon, sortOrder: c.sortOrder, tip: c.tip });

/* ---- Settings --------------------------------------------------------------------- */

export async function readSettings(): Promise<{ settings: Settings; lastReviewed: string }> {
  const f = await getFigures();
  let settings: Settings = seed.settings;
  try {
    settings = { ...seed.settings, ...jsonFigure<Settings>(f, "events.settings") };
  } catch {
    // Fall back to the seed values.
  }
  const lr = f["events.lastReviewed"]?.value;
  return { settings, lastReviewed: typeof lr === "string" ? lr : "" };
}

/* ---- Public data (cached; admin changes refresh it straight away) ------------------ */

/**
 * Everything the public page needs, cached for at most a few minutes and
 * tagged so that saving in the admin area refreshes it immediately. Past
 * events are dropped here and again on the visitor's device.
 */
export async function getPublicEventData(): Promise<PublicData & { today: string }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(eventsCacheTag);
  cacheTag("figures");
  const { settings, lastReviewed } = await readSettings();
  const fallback: PublicData & { today: string } = {
    today: londonToday(),
    events: [],
    cities: seed.cities.map((c) => ({ ...c, covered: true, intro: null })),
    categories: seed.categories,
    bankHolidays: seed.bankHolidays,
    settings,
    lastReviewed,
  };
  if (process.env.NEXT_PHASE === "phase-production-build") return fallback;
  try {
    const db = getDb();
    const today = londonToday();
    const [rows, cities, cats, holidays] = await Promise.all([
      db.select().from(events).where(eq(events.status, "published")).orderBy(asc(events.startDate)),
      db.select().from(eventCities).orderBy(asc(eventCities.name)),
      db.select().from(eventCategories).orderBy(asc(eventCategories.sortOrder)),
      db.select().from(bankHolidays).orderBy(asc(bankHolidays.date)),
    ]);
    return {
      today,
      events: toPublic(rows.map(rowToEvent), { allowSample: allowSample() }).filter((e) => e.endDate >= today),
      cities: cities.map(toCity),
      categories: cats.map(toCategory),
      bankHolidays: holidays.filter((h) => h.date >= today).map((h): BankHoliday => ({ date: h.date, name: h.name, nations: h.nations })),
      settings,
      lastReviewed,
    };
  } catch (error) {
    console.error("[events] Using fallback data, database read failed:", error);
    return fallback;
  }
}

/* ---- Admin reads (never cached) -------------------------------------------------- */

export async function adminData() {
  const db = getDb();
  const [rows, cities, cats, holidays, suggestions] = await Promise.all([
    db.select().from(events).orderBy(asc(events.startDate)),
    db.select().from(eventCities).orderBy(asc(eventCities.name)),
    db.select().from(eventCategories).orderBy(asc(eventCategories.sortOrder)),
    db.select().from(bankHolidays).orderBy(asc(bankHolidays.date)),
    db.select().from(eventSuggestions).orderBy(desc(eventSuggestions.createdAt)),
  ]);
  const { settings, lastReviewed } = await readSettingsUncached();
  return {
    events: rows.map(rowToEvent),
    cities: cities.map(toCity),
    categories: cats.map(toCategory),
    bankHolidays: holidays,
    suggestions: suggestions.map(
      (s): Suggestion & { createdAt: string } => ({ id: s.id, name: s.name, date: s.date, town: s.town, sourceUrl: s.sourceUrl, email: s.email, message: s.message, status: s.status, note: s.note, closedAt: s.closedAt?.toISOString() ?? null, createdAt: s.createdAt.toISOString() }),
    ),
    settings,
    lastReviewed,
    today: londonToday(),
  };
}

/** Settings straight from the database (the admin area always shows the latest). */
export async function readSettingsUncached(): Promise<{ settings: Settings; lastReviewed: string }> {
  const rows = await getDb()
    .select()
    .from(figures)
    .where(inArray(figures.key, ["events.settings", "events.lastReviewed"]));
  const s = rows.find((r) => r.key === "events.settings")?.value;
  const lr = rows.find((r) => r.key === "events.lastReviewed")?.value;
  const settings = s && typeof s === "object" && "json" in s ? { ...seed.settings, ...(s.json as Settings) } : seed.settings;
  return { settings, lastReviewed: typeof lr === "string" ? lr : "" };
}

export async function recentAudit(limit = 100) {
  return getDb().select().from(auditLog).orderBy(desc(auditLog.at)).limit(limit);
}

/** Write an audit record (who changed what, and when). */
export async function audit(user: string, action: string, entity: string, entityId: string | null, summary: string, before?: Record<string, unknown> | null, after?: Record<string, unknown> | null) {
  const r = auditRecord(user, action, entity, entityId, summary, before, after);
  await getDb().insert(auditLog).values({ userEmail: r.userEmail, action: r.action, entity: r.entity, entityId: r.entityId, summary: r.summary, changes: r.changes });
}
