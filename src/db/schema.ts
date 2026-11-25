/**
 * Database schema (Drizzle ORM). Add tables for new tools here, then run
 *   npm run db:generate   → writes a SQL migration into /drizzle
 *   npm run db:migrate    → applies it (Docker does this on startup)
 *   npm run db:seed       → adds seed rows that don't exist yet
 */
import { bigint, boolean, date, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
