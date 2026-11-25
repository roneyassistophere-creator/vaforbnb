import { z } from "zod";
import { eventSuggestions } from "@/db/schema";
import { getDb } from "@/lib/server/db";

/**
 * POST /api/event-suggestions: a host suggests an event for the UK event calendar.
 * Suggestions go to the admin inbox as "new" and are never published automatically.
 * Strict fields, https source required, honeypot, per-IP rate limit.
 * The optional email is deleted when the suggestion is closed.
 */
const Suggestion = z
  .object({
    name: z.string().trim().min(3).max(140),
    date: z.string().trim().min(3).max(60),
    town: z.string().trim().min(2).max(80),
    sourceUrl: z
      .url()
      .max(500)
      .refine((u) => u.startsWith("https://"), "https"),
    email: z.union([z.email().max(254), z.literal("")]).optional(),
    message: z.string().trim().max(600).optional(),
    /** Honeypot: must be empty. */
    website: z.string().max(200).optional(),
  })
  .strict();

const WINDOW_MS = 60 * 60 * 1000;
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
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many suggestions from here. Try again in an hour." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = Suggestion.safeParse(body);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const error =
      field === "sourceUrl"
        ? "Add a link to the official event page (starting https://)."
        : field === "email"
          ? "Check your email address, or leave it empty."
          : field === "name"
            ? "Add the event name."
            : field === "town"
              ? "Add the town or city."
              : field === "date"
                ? "Add the date, or the month if it isn’t confirmed."
                : "Please check the form.";
    return Response.json({ ok: false, error, field }, { status: 400 });
  }
  const { website, email, message, ...rest } = parsed.data;
  if (website) return Response.json({ ok: true });

  try {
    await getDb()
      .insert(eventSuggestions)
      .values({ ...rest, email: email ? email.toLowerCase() : null, message: message || null });
  } catch (error) {
    console.error("[event-suggestions] insert failed:", error);
    return Response.json({ ok: false, error: "Couldn’t send right now. Please try again later." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
