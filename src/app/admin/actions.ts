"use server";

import { and, eq, inArray, lt, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eventsCacheTag } from "@/content/tools/eventCalendarId";
import { appUsers, bankHolidays, eventCategories, eventCities, events, eventSuggestions, figures } from "@/db/schema";
import { hashPassword, isAdmin, newPassword, noteFailure, requireUser, signIn, signOut, tooManyFailures } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { adminData, audit, eventToRow, readSettingsUncached, rowToEvent } from "@/lib/server/events";
import { isValidDate } from "@/lib/tools/dates";
import { londonToday } from "@/lib/tools/figures";
import {
  closeSuggestion,
  emptyEvent,
  findDuplicates,
  isHttpsUrl,
  nextYearCopy,
  previewImport,
  reviewCovers,
  slugFor,
  uniqueSlug,
  validateEvent,
  type AdminEvent,
  type FieldErrors,
  type ImportRow,
  type Settings,
} from "@/lib/tools/events";

/** Public pages refresh straight away (no rebuild or redeploy). */
function refresh(settings = false) {
  updateTag(eventsCacheTag);
  if (settings) updateTag("figures");
}

/* ---- Sign in / out ------------------------------------------------------------------ */

export async function loginAction(_: { error: string }, form: FormData): Promise<{ error: string }> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const keys = [`e:${email}`, `ip:${ip}`];
  if (tooManyFailures(keys)) return { error: "Too many attempts. Wait 15 minutes and try again." };
  const user = email && password ? await signIn(email, password) : null;
  if (!user) {
    noteFailure(keys);
    return { error: "That email and password don’t match an active account." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

/* ---- Events ------------------------------------------------------------------------- */

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");
const numOrNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);

/** Never trust the browser: rebuild the event from known fields only. */
function cleanEvent(x: Partial<AdminEvent>): AdminEvent {
  const d = emptyEvent();
  return {
    ...d,
    id: typeof x.id === "string" ? x.id : undefined,
    slug: str(x.slug, 120),
    name: str(x.name, 160),
    category: str(x.category, 60),
    startDate: str(x.startDate, 10),
    endDate: str(x.endDate, 10) || str(x.startDate, 10),
    startTime: str(x.startTime, 5),
    dateStatus: oneOf(x.dateStatus, ["confirmed", "expected", "tba"] as const, "confirmed"),
    city: str(x.city, 60),
    venue: str(x.venue, 160),
    address: str(x.address, 200),
    latitude: numOrNull(x.latitude),
    longitude: numOrNull(x.longitude),
    demand: oneOf(x.demand, ["high", "medium", "low"] as const, "medium"),
    demandReason: str(x.demandReason, 200),
    shortDescription: str(x.shortDescription, 400),
    sourceTitle: str(x.sourceTitle, 160),
    sourceUrl: str(x.sourceUrl, 500).trim(),
    secondSourceUrl: str(x.secondSourceUrl, 500).trim(),
    lastChecked: isValidDate(x.lastChecked ?? "") ? (x.lastChecked as string) : null,
    checkedBy: str(x.checkedBy, 160),
    status: oneOf(x.status, ["draft", "published", "archived"] as const, "draft"),
    recurrence: oneOf(x.recurrence, ["none", "annual"] as const, "none"),
    usualMonth: numOrNull(x.usualMonth),
    usualWeek: numOrNull(x.usualWeek),
    featured: x.featured === true,
    internalNotes: str(x.internalNotes, 2000),
  };
}

export type SaveResult = { ok: true; id: string } | { ok: false; errors?: FieldErrors; duplicates?: { name: string; city: string; startDate: string }[]; message?: string };

/**
 * Save an event. `intent`: "draft" (anyone), "publish" (admins), or "check"
 * (save and mark as checked). Warns about duplicates unless confirmed.
 */
export async function saveEventAction(input: Partial<AdminEvent>, intent: "draft" | "publish" | "check", confirmDuplicate: boolean, suggestionId?: string): Promise<SaveResult> {
  const user = await requireUser();
  const db = getDb();
  const e = cleanEvent(input);
  const before = e.id ? (await db.select().from(events).where(eq(events.id, e.id)).limit(1))[0] : undefined;
  if (e.id && !before) return { ok: false, message: "That event no longer exists." };
  // Editors work on drafts only; publishing, archiving and editing published events is for admins.
  if (!isAdmin(user) && (intent === "publish" || (before && before.status !== "draft"))) return { ok: false, message: "Only admins can publish or change published events." };
  e.status = intent === "publish" ? "published" : before && intent === "check" ? before.status : before && isAdmin(user) ? e.status : "draft";
  if (intent === "check") {
    e.lastChecked = londonToday();
    e.checkedBy = user.name || user.email;
  } else if (before) {
    e.lastChecked = before.lastChecked;
    e.checkedBy = before.checkedBy ?? "";
  }
  const { cities, categories, events: all } = await adminData();
  const errors = validateEvent(e, cities, categories, e.status === "published");
  if (Object.keys(errors).length) return { ok: false, errors };
  if (!before || slugFor(before.name, before.startDate) !== slugFor(e.name, e.startDate)) {
    e.slug = before && before.slug === slugFor(e.name, e.startDate) ? before.slug : uniqueSlug(slugFor(e.name, e.startDate), new Set(all.filter((x) => x.id !== e.id).map((x) => x.slug)));
  } else e.slug = before.slug;
  if (!confirmDuplicate) {
    const dups = findDuplicates(e, all, (await readSettingsUncached()).settings.duplicateDays);
    if (dups.length) return { ok: false, duplicates: dups.map((d) => ({ name: d.name, city: cities.find((c) => c.slug === d.city)?.name ?? d.city, startDate: d.startDate })) };
  }
  const row = eventToRow(e, user.email);
  let id = e.id;
  if (before) {
    await db.update(events).set(row).where(eq(events.id, before.id));
  } else {
    const [ins] = await db.insert(events).values(row).returning({ id: events.id });
    id = ins.id;
  }
  const action = intent === "publish" && before?.status !== "published" ? "publish" : before ? (intent === "check" ? "check" : "edit") : "create";
  await audit(user.email, action, "event", id!, `${action === "create" ? "Created" : action === "publish" ? "Published" : action === "check" ? "Checked" : "Edited"} “${e.name}”`, before ? rowToEvent(before) : null, { ...e, id });
  if (suggestionId) await closeSuggestionRow(suggestionId, "accepted", null, user.email);
  refresh();
  return { ok: true, id: id! };
}

export type BulkOp = "publish" | "archive" | "check" | "demand" | "delete" | "draft";

/** Bulk actions on the events list. Publish, archive and delete are for admins; publishing skips events without a valid source. */
export async function bulkEventsAction(ids: string[], op: BulkOp, value?: string): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  if (!ids.length) return { ok: false, message: "Select at least one event." };
  if (!isAdmin(user) && op !== "check") return { ok: false, message: "Only admins can do that." };
  const db = getDb();
  const rows = await db.select().from(events).where(inArray(events.id, ids.slice(0, 1000)));
  const today = londonToday();
  let done = 0;
  let skipped = 0;
  for (const r of rows) {
    if (op === "delete") {
      await db.delete(events).where(eq(events.id, r.id));
      await audit(user.email, "delete", "event", r.id, `Deleted “${r.name}”`, rowToEvent(r), null);
    } else if (op === "publish") {
      if (!isHttpsUrl(r.sourceUrl)) {
        skipped++;
        continue;
      }
      await db.update(events).set({ status: "published", updatedAt: new Date(), updatedBy: user.email }).where(eq(events.id, r.id));
      await audit(user.email, "publish", "event", r.id, `Published “${r.name}”`, { status: r.status }, { status: "published" });
    } else if (op === "archive" || op === "draft") {
      await db.update(events).set({ status: op === "archive" ? "archived" : "draft", updatedAt: new Date(), updatedBy: user.email }).where(eq(events.id, r.id));
      await audit(user.email, op, "event", r.id, `${op === "archive" ? "Archived" : "Moved to drafts"} “${r.name}”`, { status: r.status }, { status: op === "archive" ? "archived" : "draft" });
    } else if (op === "check") {
      await db.update(events).set({ lastChecked: today, checkedBy: user.name || user.email, updatedAt: new Date(), updatedBy: user.email }).where(eq(events.id, r.id));
      await audit(user.email, "check", "event", r.id, `Marked “${r.name}” as checked`, { lastChecked: r.lastChecked }, { lastChecked: today });
    } else if (op === "demand") {
      const d = value === "high" || value === "medium" || value === "low" ? value : null;
      if (!d) return { ok: false, message: "Pick a demand level." };
      await db.update(events).set({ demand: d, updatedAt: new Date(), updatedBy: user.email }).where(eq(events.id, r.id));
      await audit(user.email, "edit", "event", r.id, `Set demand of “${r.name}” to ${d}`, { demand: r.demand }, { demand: d });
    }
    done++;
  }
  // A big enough check moves "Events last reviewed" on.
  if (op === "check") {
    const { settings } = await readSettingsUncached();
    const upcoming = (await db.select({ id: events.id, endDate: events.endDate, status: events.status, isSample: events.isSample }).from(events)).filter((e) => e.status === "published" && !e.isSample && e.endDate >= today).map((e) => e.id);
    if (reviewCovers(ids, upcoming, settings)) await setFigure("events.lastReviewed", today);
  }
  refresh(op === "check");
  const verb: Record<BulkOp, string> = { publish: "Published", archive: "Archived", check: "Marked as checked", demand: "Updated", delete: "Deleted", draft: "Moved to drafts" };
  return { ok: true, message: `${verb[op]} ${done} ${done === 1 ? "event" : "events"}.${skipped ? ` Skipped ${skipped} without a valid https source.` : ""}` };
}

/** Quick inline edit (dates, demand, status) from the events list. */
export async function quickEditAction(id: string, patch: { startDate?: string; endDate?: string; demand?: string; status?: string }): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  const db = getDb();
  const [r] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!r) return { ok: false, message: "That event no longer exists." };
  if (!isAdmin(user) && (r.status !== "draft" || (patch.status && patch.status !== "draft"))) return { ok: false, message: "Only admins can change published events." };
  const e = { ...rowToEvent(r), ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) } as AdminEvent;
  const clean = cleanEvent(e);
  const { cities, categories } = await adminData();
  const errors = validateEvent(clean, cities, categories, clean.status === "published");
  const first = Object.values(errors)[0];
  if (first) return { ok: false, message: first };
  await db.update(events).set(eventToRow({ ...clean, slug: r.slug }, user.email)).where(eq(events.id, id));
  await audit(user.email, clean.status !== r.status && clean.status === "published" ? "publish" : "edit", "event", id, `Quick edit of “${r.name}”`, rowToEvent(r), clean);
  refresh();
  return { ok: true, message: "Saved." };
}

/** "Create next year's copy": a new draft, flagged for date confirmation. Returns the new id. */
export async function nextYearCopyAction(id: string): Promise<{ ok: boolean; id?: string; message?: string }> {
  const user = await requireUser();
  const db = getDb();
  const [r] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!r) return { ok: false, message: "That event no longer exists." };
  const copy = nextYearCopy(rowToEvent(r));
  const taken = new Set((await db.select({ slug: events.slug }).from(events)).map((x) => x.slug));
  copy.slug = uniqueSlug(copy.slug, taken);
  const [ins] = await db.insert(events).values(eventToRow(copy, user.email)).returning({ id: events.id });
  await audit(user.email, "create", "event", ins.id, `Created next year’s copy of “${r.name}” (${copy.startDate})`);
  refresh();
  return { ok: true, id: ins.id };
}

/** Archive every event that has ended (keeps the record; they were already hidden). Admins only. */
export async function archivePastAction(): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("admin");
  const today = londonToday();
  const res = await getDb()
    .update(events)
    .set({ status: "archived", updatedAt: new Date(), updatedBy: user.email })
    .where(and(lt(events.endDate, today), ne(events.status, "archived")))
    .returning({ id: events.id });
  if (res.length) await audit(user.email, "archive", "event", null, `Archived ${res.length} past events`);
  refresh();
  return { ok: true, message: `Archived ${res.length} past ${res.length === 1 ? "event" : "events"}.` };
}

/* ---- CSV import -------------------------------------------------------------------- */

export async function previewImportAction(text: string, publish: boolean): Promise<{ rows: ImportRow[]; headerError: string | null }> {
  const user = await requireUser();
  const { cities, categories, events: existing, settings } = await adminData();
  return previewImport(text.slice(0, 2_000_000), { cities, categories, existing, settings, publish: publish && isAdmin(user) });
}

/** Import after confirmation: the file is checked again on the server; only valid rows are saved. */
export async function confirmImportAction(text: string, publish: boolean): Promise<{ imported: number; updated: number; skipped: number }> {
  const user = await requireUser();
  const pub = publish && isAdmin(user);
  const { cities, categories, events: existing, settings } = await adminData();
  const { rows } = previewImport(text.slice(0, 2_000_000), { cities, categories, existing, settings, publish: pub });
  const db = getDb();
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  for (const r of rows) {
    if (!r.event) {
      skipped++;
      continue;
    }
    if (r.updatesSlug && r.event.id) {
      const [before] = await db.select().from(events).where(eq(events.id, r.event.id)).limit(1);
      if (!before || (!isAdmin(user) && before.status !== "draft")) {
        skipped++;
        continue;
      }
      const keep = { lastChecked: before.lastChecked, checkedBy: before.checkedBy ?? "", internalNotes: before.internalNotes ?? "", status: pub ? "published" : before.status } as const;
      await db.update(events).set(eventToRow({ ...r.event, ...keep }, user.email)).where(eq(events.id, before.id));
      updated++;
    } else {
      await db.insert(events).values(eventToRow(r.event, user.email));
      imported++;
    }
  }
  await audit(user.email, "import", "event", null, `CSV import: ${imported} imported, ${updated} updated, ${skipped} skipped${pub ? " (published)" : " (drafts)"}`);
  refresh();
  return { imported, updated, skipped };
}

/* ---- Cities, categories, bank holidays ---------------------------------------------- */

export async function saveCityAction(c: { slug: string; name: string; nation: string; region: string; latitude: number; longitude: number; covered: boolean; aliases: string; intro: string }, isNew: boolean): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("admin");
  const slug = c.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!slug || !c.name.trim()) return { ok: false, message: "Add a name and a slug." };
  if (!["england", "scotland", "wales", "northern-ireland"].includes(c.nation)) return { ok: false, message: "Pick a nation." };
  if (!(c.latitude > 49 && c.latitude < 61 && c.longitude > -9 && c.longitude < 2.5)) return { ok: false, message: "Those coordinates aren’t in the UK." };
  const row = {
    slug,
    name: c.name.trim(),
    nation: c.nation as "england",
    region: c.region.trim() || null,
    latitude: c.latitude,
    longitude: c.longitude,
    covered: c.covered,
    aliases: c.aliases.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 40),
    intro: c.intro.trim() || null,
    updatedAt: new Date(),
  };
  const db = getDb();
  const [before] = await db.select().from(eventCities).where(eq(eventCities.slug, slug)).limit(1);
  if (isNew && before) return { ok: false, message: "A city with that slug already exists." };
  if (before) await db.update(eventCities).set(row).where(eq(eventCities.slug, slug));
  else await db.insert(eventCities).values(row);
  await audit(user.email, before ? "edit" : "create", "city", slug, `${before ? "Edited" : "Added"} city “${row.name}”`, before ?? null, row);
  refresh();
  return { ok: true, message: "Saved." };
}

export async function saveCategoryAction(c: { slug: string; name: string; icon: string; sortOrder: number; tip: string }, isNew: boolean): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("admin");
  const slug = c.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!slug || !c.name.trim()) return { ok: false, message: "Add a name and a slug." };
  const row = { slug, name: c.name.trim(), icon: c.icon.trim() || null, sortOrder: Number.isFinite(c.sortOrder) ? c.sortOrder : 0, tip: c.tip.trim() || null, updatedAt: new Date() };
  const db = getDb();
  const [before] = await db.select().from(eventCategories).where(eq(eventCategories.slug, slug)).limit(1);
  if (isNew && before) return { ok: false, message: "A category with that slug already exists." };
  if (before) await db.update(eventCategories).set(row).where(eq(eventCategories.slug, slug));
  else await db.insert(eventCategories).values(row);
  await audit(user.email, before ? "edit" : "create", "category", slug, `${before ? "Edited" : "Added"} category “${row.name}”`, before ?? null, row);
  refresh();
  return { ok: true, message: "Saved." };
}

/** Add bank holidays: one per line, "YYYY-MM-DD, Name, nations" (nations: england-and-wales, scotland, northern-ireland; separate with |). */
export async function addBankHolidaysAction(text: string): Promise<{ ok: boolean; message: string; errors: string[] }> {
  const user = await requireUser("admin");
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors: string[] = [];
  const rows: { date: string; name: string; nations: string[]; source: string; year: number }[] = [];
  const allowed = ["england-and-wales", "scotland", "northern-ireland"];
  lines.forEach((l, i) => {
    const [date, name, nations] = l.split(",").map((x) => (x ?? "").trim());
    const ns = (nations || "").split("|").map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (!isValidDate(date)) errors.push(`Line ${i + 1}: bad date “${date ?? ""}”.`);
    else if (!name) errors.push(`Line ${i + 1}: add the holiday’s name.`);
    else if (!ns.length || ns.some((n) => !allowed.includes(n))) errors.push(`Line ${i + 1}: nations must be ${allowed.join(", ")} (separate with |).`);
    else rows.push({ date, name, nations: ns, source: "https://www.gov.uk/bank-holidays", year: Number(date.slice(0, 4)) });
  });
  if (errors.length) return { ok: false, message: "Nothing was added. Fix these lines:", errors };
  if (rows.length) await getDb().insert(bankHolidays).values(rows).onConflictDoNothing();
  await audit(user.email, "create", "bank-holiday", null, `Added ${rows.length} bank holidays`);
  refresh();
  return { ok: true, message: `Added ${rows.length} bank holidays (existing ones were left as they are).`, errors: [] };
}

export async function deleteBankHolidayAction(id: string): Promise<{ ok: boolean }> {
  const user = await requireUser("admin");
  const [r] = await getDb().delete(bankHolidays).where(eq(bankHolidays.id, id)).returning();
  if (r) await audit(user.email, "delete", "bank-holiday", id, `Deleted bank holiday “${r.name}” (${r.date})`);
  refresh();
  return { ok: true };
}

/* ---- Settings -------------------------------------------------------------------- */

async function setFigure(key: string, value: unknown) {
  await getDb()
    .update(figures)
    .set({ value: value as never, updatedAt: new Date(), lastChecked: londonToday() })
    .where(eq(figures.key, key));
}

export async function saveSettingsAction(s: Settings): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("admin");
  const { settings: before } = await readSettingsUncached();
  const ints = (xs: unknown) => (Array.isArray(xs) ? xs.map(Number).filter((n) => Number.isFinite(n) && n > 0) : []);
  const next: Settings = {
    ...before,
    ...s,
    distances: ints(s.distances).length ? ints(s.distances) : before.distances,
    reminderWeeks: ints(s.reminderWeeks).length ? ints(s.reminderWeeks) : before.reminderWeeks,
    demandCriteria: String(s.demandCriteria ?? before.demandCriteria).slice(0, 1500),
  };
  for (const k of ["defaultDistance", "defaultRangeDays", "recheckDays", "recheckHorizonDays", "startingSoonDays", "confirmWindowDays", "launchCities", "launchEventsPerCity", "coverageDays", "cityNoindexMin", "defaultReminderWeeks", "duplicateDays", "thisWeekDays", "highDemandSoonDays", "htmlEventCount"] as const) {
    const v = Number(next[k]);
    if (!Number.isFinite(v) || v < 0 || v > 3650) return { ok: false, message: `Check “${k}”: enter a number.` };
    (next as Record<string, unknown>)[k] = Math.round(v);
  }
  next.reviewCoverage = Math.min(1, Math.max(0.1, Number(next.reviewCoverage) || before.reviewCoverage));
  await setFigure("events.settings", { json: next });
  await audit(user.email, "edit", "settings", "events.settings", "Changed event calendar settings", before as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
  refresh(true);
  return { ok: true, message: "Settings saved. They apply straight away." };
}

export async function setLastReviewedAction(date: string): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("admin");
  if (date && !isValidDate(date)) return { ok: false, message: "Enter a real date." };
  await setFigure("events.lastReviewed", date);
  await audit(user.email, "edit", "settings", "events.lastReviewed", `Set “Events last reviewed” to ${date || "(empty)"}`);
  refresh(true);
  return { ok: true, message: "Saved." };
}

/* ---- Suggestions ------------------------------------------------------------------- */

async function closeSuggestionRow(id: string, status: "accepted" | "rejected", note: string | null, user: string) {
  const db = getDb();
  const [s] = await db.select().from(eventSuggestions).where(eq(eventSuggestions.id, id)).limit(1);
  if (!s) return;
  const closed = closeSuggestion({ ...s, closedAt: s.closedAt?.toISOString() ?? null }, status, note);
  // The suggester's email is deleted once the suggestion is closed.
  await db.update(eventSuggestions).set({ status: closed.status, note: closed.note, email: null, closedAt: new Date(closed.closedAt!) }).where(eq(eventSuggestions.id, id));
  await audit(user, status === "accepted" ? "accept" : "reject", "suggestion", id, `${status === "accepted" ? "Accepted" : "Rejected"} suggestion “${s.name}”`);
}

export async function rejectSuggestionAction(id: string, note: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  await closeSuggestionRow(id, "rejected", note.slice(0, 500), user.email);
  return { ok: true };
}

/* ---- Users ---------------------------------------------------------------------------- */

/** Add an admin or editor. Returns a new password, shown once. */
export async function addUserAction(email: string, name: string, role: "admin" | "editor"): Promise<{ ok: boolean; message: string; password?: string }> {
  const user = await requireUser("admin");
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, message: "Enter a real email address." };
  const db = getDb();
  const [exists] = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, e)).limit(1);
  if (exists) return { ok: false, message: "That email already has an account." };
  const password = newPassword();
  const [u] = await db
    .insert(appUsers)
    .values({ email: e, name: name.trim() || e, role: role === "admin" ? "admin" : "editor", passwordHash: await hashPassword(password) })
    .returning({ id: appUsers.id });
  await audit(user.email, "create", "user", u.id, `Added ${role} ${e}`);
  return { ok: true, message: `Account created. Give ${e} this password (shown once):`, password };
}

export async function setUserActiveAction(id: string, active: boolean): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("admin");
  if (id === user.id) return { ok: false, message: "You can’t switch off your own account." };
  await getDb().update(appUsers).set({ active }).where(eq(appUsers.id, id));
  await audit(user.email, "edit", "user", id, `${active ? "Reactivated" : "Deactivated"} an account`);
  return { ok: true, message: "Saved." };
}
