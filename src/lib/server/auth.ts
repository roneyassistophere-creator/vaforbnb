import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { appSessions, appUsers } from "@/db/schema";
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./password";

/**
 * Admin sign-in. Passwords are stored as scrypt hashes; the session cookie
 * holds a random token and only its SHA-256 hash is stored. Every admin page
 * and action checks the session and role on the server.
 */

export const SESSION_COOKIE = "vaforbnb_admin";
const SESSION_DAYS = 14;

export type Role = "admin" | "editor";
export type SessionUser = { id: string; email: string; name: string; role: Role };

export { hashPassword, newPassword, verifyPassword } from "./password";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/* Simple per-instance limit on failed sign-ins: 8 per 15 minutes per email or IP. */
const failures = new Map<string, number[]>();
const WINDOW = 15 * 60 * 1000;
export function tooManyFailures(keys: string[]): boolean {
  const now = Date.now();
  return keys.some((k) => (failures.get(k) ?? []).filter((t) => now - t < WINDOW).length >= 8);
}
export function noteFailure(keys: string[]) {
  const now = Date.now();
  for (const k of keys) failures.set(k, [...(failures.get(k) ?? []).filter((t) => now - t < WINDOW), now]);
}

/** Check an email and password; on success, start a session (sets the cookie). */
export async function signIn(email: string, password: string): Promise<SessionUser | null> {
  const db = getDb();
  const [u] = await db.select().from(appUsers).where(eq(appUsers.email, email.trim().toLowerCase())).limit(1);
  // Always hash, so a wrong email takes as long as a wrong password.
  const ok = u ? await verifyPassword(password, u.passwordHash) : (await hashPassword(password), false);
  if (!u || !ok || !u.active) return null;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(appSessions).values({ tokenHash: sha256(token), userId: u.id, expiresAt });
  await db.update(appUsers).set({ lastLoginAt: new Date() }).where(eq(appUsers.id, u.id));
  await db.delete(appSessions).where(lt(appSessions.expiresAt, new Date()));
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(appSessions).where(eq(appSessions.tokenHash, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user, or null. */
export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await connection(); // the session expiry check reads the clock at request time
  const [row] = await getDb()
    .select({ id: appUsers.id, email: appUsers.email, name: appUsers.name, role: appUsers.role, active: appUsers.active })
    .from(appSessions)
    .innerJoin(appUsers, eq(appUsers.id, appSessions.userId))
    .where(and(eq(appSessions.tokenHash, sha256(token)), gt(appSessions.expiresAt, new Date())))
    .limit(1);
  return row && row.active ? { id: row.id, email: row.email, name: row.name, role: row.role } : null;
}

/** For admin pages and actions: the user, or a redirect to sign in. `role: "admin"` also requires the admin role. */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (role === "admin" && u.role !== "admin") throw new Error("Only admins can do that.");
  return u;
}

export const isAdmin = (u: SessionUser) => u.role === "admin";
