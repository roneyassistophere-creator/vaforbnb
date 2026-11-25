import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { figures as figuresTable } from "@/db/schema";
import { figuresSeed } from "@/data/figures.seed";
import type { Figure, Figures } from "@/lib/tools/figures";
import { getDb } from "./db";

const toMap = (list: Figure[]): Figures => Object.fromEntries(list.map((f) => [f.key, f]));

/** The seed values, used during `next build` and if the database can't be reached. */
export const seedFigures = (): Figures => toMap(figuresSeed);

/**
 * All stored figures, cached for up to an hour, so they can be built into
 * the page HTML (FAQ, How it works, structured data). Edits made in the
 * database show within an hour.
 *
 * During `next build` there's no database, so the seed values are used;
 * the cache then refreshes from the database at runtime.
 */
export async function getFigures(): Promise<Figures> {
  "use cache";
  cacheLife("hours");
  cacheTag("figures");

  if (process.env.NEXT_PHASE === "phase-production-build") return seedFigures();
  try {
    const rows = await getDb().select().from(figuresTable);
    if (rows.length === 0) throw new Error("figures table is empty: run `npm run db:seed`.");
    // Fill any key the database doesn't have yet from the seed.
    return {
      ...seedFigures(),
      ...toMap(
        rows.map((f) => ({
          key: f.key,
          value: f.value,
          unit: f.unit,
          label: f.label,
          sourceTitle: f.sourceTitle,
          sourceUrl: f.sourceUrl,
          lastChecked: f.lastChecked,
          verify: f.verify,
        })),
      ),
    };
  } catch (error) {
    console.error("[figures] Using seed values, database read failed:", error);
    return seedFigures();
  }
}
