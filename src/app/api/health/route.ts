import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/lib/server/db";
import { checkStorage } from "@/lib/server/storage";

/** GET /api/health: checks the database and the storage bucket. */
export async function GET() {
  await connection(); // always run at request time, never prerender

  const [database, storage] = await Promise.allSettled([
    getDb().execute(sql`select 1`),
    checkStorage(),
  ]);

  const status = (r: PromiseSettledResult<unknown>) =>
    r.status === "fulfilled" ? "ok" : `error: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`;

  const body = { database: status(database), storage: status(storage) };
  const ok = database.status === "fulfilled" && storage.status === "fulfilled";
  return Response.json(body, { status: ok ? 200 : 503 });
}
