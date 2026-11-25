/**
 * Database schema (Drizzle ORM). Add tables for new tools here, then run
 *   npm run db:generate   → writes a SQL migration into /drizzle
 *   npm run db:migrate    → applies it (Docker does this on startup)
 *   npm run db:seed       → adds seed rows that don't exist yet
 */
import { bigint, boolean, date, doublePrecision, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { Condition, Region, RuleGroup, RuleStatus, SourceRef } from "@/lib/tools/compliance/types";
import type { FigureValue } from "@/lib/tools/figures";

/**
 * Files stored in S3 / R2 (tool uploads and generated outputs).
 * Premade downloads that ship with the site live in /public/downloads instead.
 */
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Object key in the bucket, e.g. "tools/finance-check/2026/11/abc.xlsx". */
    key: text("key").notNull().unique(),
    /** Original or download file name. */
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    /** Which tool created it, e.g. "finance-check". */
    tool: text("tool"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("files_tool_idx").on(t.tool)],
);

export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;

/**
 * Figures and dates shared by the tools (levy rates, deadlines, tax rates).
 * Rule summaries reference these as {key}, so a change here updates every tool.
 */
export const figures = pgTable("figures", {
  key: text("key").primaryKey(),
  /** A string, an ISO date string, or { rate, start } for dated rates. */
  value: jsonb("value").$type<FigureValue>().notNull(),
  /** "days", "%", "date", "years"… */
  unit: text("unit"),
  label: text("label"),
  sourceTitle: text("source_title").notNull(),
  sourceUrl: text("source_url"),
  lastChecked: date("last_checked").notNull(),
  /** Confirm before launch. */
  verify: boolean("verify").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Rules for the UK short-let compliance checker. */
export const complianceRules = pgTable("compliance_rules", {
  ruleId: text("rule_id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").$type<RuleStatus>().notNull(),
  groupKey: text("group_key").$type<RuleGroup>().notNull(),
  conditions: jsonb("conditions").$type<Condition>().notNull(),
  summary: text("summary").notNull(),
  summaryOther: text("summary_other"),
  whatToDo: jsonb("what_to_do").$type<string[]>().notNull(),
  sourceTitle: text("source_title").notNull(),
  sourceUrl: text("source_url"),
  sourcesByRegion: jsonb("sources_by_region").$type<Partial<Record<Region, SourceRef>>>(),
  rulesHubAnchor: text("rules_hub_anchor").notNull(),
  dataKeys: jsonb("data_keys").$type<string[]>(),
  sortOrder: integer("sort_order").notNull(),
  lastChecked: date("last_checked").notNull(),
  active: boolean("active").notNull().default(true),
  verify: boolean("verify").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Email sign-ups from tools (e.g. "Download the PDF"). Only lead fields are
 * stored: never a tool's answers or results.
 */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    toolSlug: text("tool_slug").notNull(),
    /** The exact consent wording the person agreed to. */
    consentText: text("consent_text").notNull(),
    /** When they agreed, as sent by the browser. */
    consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_email_idx").on(t.email), index("leads_tool_idx").on(t.toolSlug)],
);

/* ---- Admin users and sessions (the admin area at /admin) -------------------- */

/** People who can sign in to the admin area. Roles: "admin" (everything) or "editor" (drafts and checks). */
export const appUsers = pgTable("app_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").$type<"admin" | "editor">().notNull(),
  /** scrypt hash ("scrypt$salt$hash"): never the password itself. */
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

/** Signed-in sessions. Only a hash of the cookie token is stored. */
export const appSessions = pgTable(
  "app_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("app_sessions_user_idx").on(t.userId)],
);

/* ---- UK event calendar ------------------------------------------------------ */

/** Towns and cities the event calendar can search. Only `covered` ones get pages. */
export const eventCities = pgTable("event_cities", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  nation: text("nation").$type<"england" | "scotland" | "wales" | "northern-ireland">().notNull(),
  region: text("region"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  covered: boolean("covered").notNull().default(true),
  /** Nearby towns and areas that map to this city ("Salford", "Trafford"). */
  aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
  intro: text("intro"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Event categories, with the host tip shown on event cards. */
export const eventCategories = pgTable("event_categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  tip: text("tip"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Events that bring visitors. Only `published`, non-sample events ever show publicly. */
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categorySlug: text("category_slug").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    startTime: text("start_time"),
    dateStatus: text("date_status").$type<"confirmed" | "expected" | "tba">().notNull(),
    citySlug: text("city_slug").notNull(),
    venue: text("venue"),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    demand: text("demand").$type<"high" | "medium" | "low">().notNull(),
    demandReason: text("demand_reason"),
    shortDescription: text("short_description"),
    sourceTitle: text("source_title").notNull(),
    sourceUrl: text("source_url").notNull(),
    secondSourceUrl: text("second_source_url"),
    /** Set by "Mark as checked". Empty on a new "next year's copy". */
    lastChecked: date("last_checked"),
    checkedBy: text("checked_by"),
    status: text("status").$type<"draft" | "published" | "archived">().notNull().default("draft"),
    recurrence: text("recurrence").$type<"none" | "annual">().notNull().default("none"),
    /** For annual events: usual month (1–12) and week of the month (1–5). */
    usualMonth: integer("usual_month"),
    usualWeek: integer("usual_week"),
    featured: boolean("featured").notNull().default(false),
    internalNotes: text("internal_notes"),
    /** Test data: never shown on the live site. */
    isSample: boolean("is_sample").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (t) => [index("events_city_idx").on(t.citySlug), index("events_start_idx").on(t.startDate), index("events_status_idx").on(t.status)],
);

/** UK bank holidays (GOV.UK), by nation. */
export const bankHolidays = pgTable(
  "bank_holidays",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    name: text("name").notNull(),
    /** "england-and-wales", "scotland", "northern-ireland". */
    nations: jsonb("nations").$type<string[]>().notNull(),
    source: text("source").notNull(),
    year: integer("year").notNull(),
  },
  (t) => [uniqueIndex("bank_holidays_date_name_idx").on(t.date, t.name)],
);

/** "Know an event we've missed?" suggestions. The email is deleted when the suggestion is closed. */
export const eventSuggestions = pgTable("event_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  town: text("town").notNull(),
  sourceUrl: text("source_url").notNull(),
  email: text("email"),
  message: text("message"),
  status: text("status").$type<"new" | "accepted" | "rejected">().notNull().default("new"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

/** Who changed what, and when (events, cities, categories, bank holidays, settings, users). */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    userEmail: text("user_email").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull(),
    changes: jsonb("changes").$type<Record<string, unknown>>(),
  },
  (t) => [index("audit_log_at_idx").on(t.at)],
);

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type EventCityRow = typeof eventCities.$inferSelect;
export type EventCategoryRow = typeof eventCategories.$inferSelect;
export type BankHolidayRow = typeof bankHolidays.$inferSelect;
export type SuggestionRow = typeof eventSuggestions.$inferSelect;
export type AppUserRow = typeof appUsers.$inferSelect;
