/**
 * Seed the database with tool rules and figures.
 *
 *   npm run db:seed              add rows that don't exist yet (never touches edited rows)
 *   npm run db:seed -- --update  overwrite every seeded row with the seed values
 *
 * Docker runs the first form after migrations on every start.
 */
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { complianceRules, figures } from "../src/db/schema";
import { rulesSeed } from "../src/data/compliance/rules.seed";
import { figuresSeed } from "../src/data/figures.seed";

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment.
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.");
  process.exit(1);
}

const update = process.argv.includes("--update");
const client = postgres(url, { max: 1 });
const db = drizzle(client);

const figureRows = figuresSeed.map((f) => ({
  key: f.key,
  value: f.value,
  unit: f.unit ?? null,
  label: f.label ?? null,
  sourceTitle: f.sourceTitle,
  sourceUrl: f.sourceUrl,
  lastChecked: f.lastChecked,
  verify: f.verify,
}));

const ruleRows = rulesSeed.map((r) => ({
  ruleId: r.ruleId,
  title: r.title,
  status: r.status,
  groupKey: r.group,
  conditions: r.conditions,
  summary: r.summary,
  summaryOther: r.summaryOther ?? null,
  whatToDo: r.whatToDo,
  sourceTitle: r.sourceTitle,
  sourceUrl: r.sourceUrl,
  sourcesByRegion: r.sourcesByRegion ?? null,
  rulesHubAnchor: r.rulesHubAnchor,
  dataKeys: r.dataKeys ?? null,
  sortOrder: r.order,
  lastChecked: r.lastChecked,
  active: r.active,
  verify: r.verify ?? false,
}));

/** Every column except the key, taken from the incoming row. */
const excludedSet = (cols: string[]) =>
  Object.fromEntries(cols.map((c) => [c, sql.raw(`excluded."${c}"`)]));

async function main() {
  if (update) {
    await db
      .insert(figures)
      .values(figureRows)
      .onConflictDoUpdate({
        target: figures.key,
        set: { ...excludedSet(["value", "unit", "label", "source_title", "source_url", "last_checked", "verify"]), updatedAt: sql`now()` },
      });
    await db
      .insert(complianceRules)
      .values(ruleRows)
      .onConflictDoUpdate({
        target: complianceRules.ruleId,
        set: {
          ...excludedSet([
            "title", "status", "group_key", "conditions", "summary", "summary_other", "what_to_do", "source_title",
            "source_url", "sources_by_region", "rules_hub_anchor", "data_keys", "sort_order", "last_checked", "active", "verify",
          ]),
          updatedAt: sql`now()`,
        },
      });
  } else {
    await db.insert(figures).values(figureRows).onConflictDoNothing();
    await db.insert(complianceRules).values(ruleRows).onConflictDoNothing();
  }
  const [{ n: nf }] = await db.execute<{ n: number }>(sql`select count(*)::int as n from figures`);
  const [{ n: nr }] = await db.execute<{ n: number }>(sql`select count(*)::int as n from compliance_rules`);
  console.log(`Seed ${update ? "updated" : "applied"}: ${nf} figures, ${nr} compliance rules in the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
