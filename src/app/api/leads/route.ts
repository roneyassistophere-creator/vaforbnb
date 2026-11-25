import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { leads } from "@/db/schema";

/**
 * POST /api/leads: email sign-ups from tools.
 * Accepts ONLY lead fields (unknown fields are rejected, so tool answers or
 * results can never be stored). Has a honeypot field and a rate limit.
 */
const Lead = z
  .object({
    email: z.email().max(254),
    firstName: z.string().trim().max(80).optional(),
    toolSlug: z.string().regex(/^[a-z0-9-]{1,80}$/),
    consentText: z.string().trim().min(10).max(500),
    timestamp: z.iso.datetime(),
    /** Honeypot: must be empty. */
    website: z.string().max(200).optional(),
  })
  .strict();

// Simple per-IP limit: 5 requests per 10 minutes per server instance.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many requests. Try again later." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = Lead.safeParse(body);
  if (!parsed.success) return Response.json({ ok: false, error: "Please check your email address." }, { status: 400 });

  const { website, email, firstName, toolSlug, consentText, timestamp } = parsed.data;
  // Bots fill the hidden field: pretend it worked, store nothing.
  if (website) return Response.json({ ok: true });

  try {
    await getDb()
      .insert(leads)
      .values({ email: email.toLowerCase(), firstName: firstName || null, toolSlug, consentText, consentedAt: new Date(timestamp) });
  } catch (error) {
    console.error("[leads] insert failed:", error);
    return Response.json({ ok: false, error: "Couldn’t save right now." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
