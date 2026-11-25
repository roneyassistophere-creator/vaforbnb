/**
 * SAMPLE events for local testing only. They are never shown on the live site:
 * every row has is_sample = true, the names start with "SAMPLE", and the public
 * page only shows them when NODE_ENV is not production AND EVENTS_SHOW_SAMPLE=on.
 *
 *   npm run db:seed:sample-events             add (or refresh) the sample events
 *   npm run db:seed:sample-events -- --remove delete every sample event
 *
 * Dates are relative to today, so the samples always look "upcoming".
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { events } from "../src/db/schema";

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

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const today = new Date(
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" }) +
    "T00:00:00Z",
);
const day = (offset: number) =>
  new Date(today.getTime() + offset * 86_400_000).toISOString().slice(0, 10);

type S = [
  city: string,
  category: string,
  name: string,
  start: number,
  length: number,
  demand: "high" | "medium" | "low",
  dateStatus?: "confirmed" | "expected" | "tba",
];

const samples: S[] = [
  ["manchester", "sport", "Derby day football", 3, 1, "high"],
  ["manchester", "music", "Arena tour night", 12, 2, "high"],
  ["manchester", "conferences", "Northern tech conference", 24, 3, "medium"],
  ["manchester", "seasonal", "Christmas markets", -10, 30, "medium"],
  [
    "manchester",
    "university",
    "Winter graduation week",
    45,
    4,
    "medium",
    "expected",
  ],
  ["manchester", "festivals", "Spring food festival", 140, 3, "low", "tba"],
  ["london", "sport", "Cup final", 5, 1, "high"],
  ["london", "music", "Stadium concert", 18, 2, "high"],
  ["london", "theatre", "Winter musical run", -5, 60, "medium"],
  ["london", "conferences", "Fintech summit", 33, 2, "medium"],
  ["london", "seasonal", "Winter wonderland", -20, 40, "medium"],
  ["london", "festivals", "Marathon weekend", 75, 1, "high", "expected"],
  ["edinburgh", "seasonal", "Hogmanay street party", 35, 3, "high"],
  [
    "edinburgh",
    "festivals",
    "Fringe-style comedy weekend",
    60,
    3,
    "medium",
    "expected",
  ],
  ["edinburgh", "sport", "Rugby international", 70, 1, "high"],
  ["edinburgh", "university", "Graduation week", 88, 5, "medium"],
  ["glasgow", "music", "Arena residency", 9, 3, "high"],
  ["glasgow", "sport", "Old firm match", 21, 1, "high"],
  ["glasgow", "conferences", "Energy expo", 50, 2, "low"],
  ["cardiff", "sport", "Six Nations match", 72, 1, "high"],
  ["cardiff", "music", "Castle concert", 28, 1, "medium"],
  ["cardiff", "seasonal", "Winter wonderland", -8, 35, "low"],
  ["liverpool", "sport", "Anfield fixture", 6, 1, "high"],
  ["liverpool", "music", "Waterfront gig", 40, 1, "medium"],
  ["liverpool", "festivals", "Comedy festival", 95, 5, "low", "tba"],
  ["birmingham", "conferences", "NEC trade show", 15, 4, "high"],
  ["birmingham", "music", "Arena show", 30, 1, "medium"],
  ["birmingham", "sport", "Test match", 160, 5, "high", "expected"],
  ["leeds", "sport", "Headingley cup tie", 11, 1, "medium"],
  ["leeds", "festivals", "Light night", 55, 2, "low"],
  ["york", "seasonal", "Christmas festival", -15, 35, "high"],
  ["york", "sport", "Racecourse meeting", 120, 2, "medium", "expected"],
  ["bath", "seasonal", "Christmas market", -12, 28, "high"],
  ["cheltenham", "sport", "Jump racing festival", 105, 4, "high", "expected"],
  ["bristol", "music", "Harbourside gig", 26, 1, "medium"],
  ["newcastle", "sport", "St James' Park fixture", 8, 1, "high"],
  ["brighton", "festivals", "Pride weekend", 230, 2, "high", "expected"],
  ["belfast", "music", "Arena concert", 19, 1, "medium"],
];

async function main() {
  if (process.argv.includes("--remove")) {
    const gone = await db
      .delete(events)
      .where(eq(events.isSample, true))
      .returning({ id: events.id });
    console.log(`Removed ${gone.length} sample events.`);
  } else {
    let n = 0;
    for (const [
      city,
      category,
      title,
      start,
      length,
      demand,
      dateStatus = "confirmed",
    ] of samples) {
      n++;
      const name = `SAMPLE ${title}`;
      const startDate = day(start);
      const row = {
        slug: `sample-${n}-${city}`,
        name,
        categorySlug: category,
        startDate,
        endDate: day(start + length - 1),
        dateStatus,
        citySlug: city,
        venue: "SAMPLE venue",
        demand,
        demandReason:
          demand === "high"
            ? "SAMPLE: big crowd expected from outside the city."
            : null,
        shortDescription: `SAMPLE description for ${title.toLowerCase()}.`,
        sourceTitle: "SAMPLE source",
        sourceUrl: `https://example.com/sample/${n}`,
        lastChecked: day(-(n % 40)),
        checkedBy: "sample",
        status: "published" as const,
        recurrence: "annual" as const,
        usualMonth: Number(startDate.slice(5, 7)),
        isSample: true,
        updatedBy: "sample",
        updatedAt: new Date(),
      };
      await db
        .insert(events)
        .values(row)
        .onConflictDoUpdate({ target: events.slug, set: row });
    }
    console.log(
      `Seeded ${n} sample events. Set EVENTS_SHOW_SAMPLE=on in .env to see them locally.`,
    );
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
