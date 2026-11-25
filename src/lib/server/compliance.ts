import "server-only";
import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { complianceRules, figures as figuresTable } from "@/db/schema";
import { rulesSeed } from "@/data/compliance/rules.seed";
import { figuresSeed } from "@/data/figures.seed";
import type { ComplianceRule, Figures } from "@/lib/tools/compliance/types";
import { getDb } from "./db";

export type ComplianceData = { rules: ComplianceRule[]; figures: Figures; fromDatabase: boolean };

const toFigures = (list: Figures[string][]): Figures => Object.fromEntries(list.map((f) => [f.key, f]));

/** Rules and figures from Postgres, cached for up to an hour. */
async function loadFromDatabase(): Promise<Omit<ComplianceData, "fromDatabase">> {
  "use cache";
  cacheLife("hours");
  cacheTag("compliance-data");

  const db = getDb();
  const [ruleRows, figureRows] = await Promise.all([
    db.select().from(complianceRules).orderBy(asc(complianceRules.sortOrder)),
    db.select().from(figuresTable),
  ]);

  const rules: ComplianceRule[] = ruleRows.map((r) => ({
    ruleId: r.ruleId,
    title: r.title,
    status: r.status,
    group: r.groupKey,
    conditions: r.conditions,
    summary: r.summary,
    summaryOther: r.summaryOther,
    whatToDo: r.whatToDo,
    sourceTitle: r.sourceTitle,
    sourceUrl: r.sourceUrl,
    sourcesByRegion: r.sourcesByRegion,
    rulesHubAnchor: r.rulesHubAnchor,
    dataKeys: r.dataKeys,
    order: r.sortOrder,
    lastChecked: r.lastChecked,
    active: r.active,
    verify: r.verify,
  }));

  const figures = toFigures(
    figureRows.map((f) => ({
      key: f.key,
      value: f.value,
      unit: f.unit,
      label: f.label,
      sourceTitle: f.sourceTitle,
      sourceUrl: f.sourceUrl,
      lastChecked: f.lastChecked,
      verify: f.verify,
    })),
  );

  if (rules.length === 0) throw new Error("compliance_rules is empty: run `npm run db:seed`.");
  return { rules, figures };
}

/**
 * Rules and figures for the compliance checker. Reads the database; if it
 * can't be reached, falls back to the seed data so the page still works
 * (and logs the error so it gets noticed).
 */
export async function getComplianceData(): Promise<ComplianceData> {
  try {
    return { ...(await loadFromDatabase()), fromDatabase: true };
  } catch (error) {
    console.error("[compliance] Using seed data, database read failed:", error);
    return { rules: rulesSeed, figures: toFigures(figuresSeed), fromDatabase: false };
  }
}
