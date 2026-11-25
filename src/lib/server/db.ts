import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { getDatabaseUrl } from "./env";

/**
 * Postgres via Drizzle ORM. Use in Server Components, Server Functions and
 * Route Handlers only:
 *
 *   import { getDb } from "@/lib/server/db";
 *   import { files } from "@/db/schema";
 *   const rows = await getDb().select().from(files);
 */

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as {
  pg?: ReturnType<typeof postgres>;
  db?: PostgresJsDatabase<typeof schema>;
};

export function getDb() {
  if (!globalForDb.db) {
    globalForDb.pg ??= postgres(getDatabaseUrl(), { max: 10 });
    globalForDb.db = drizzle(globalForDb.pg, { schema });
  }
  return globalForDb.db;
}

export { schema };
