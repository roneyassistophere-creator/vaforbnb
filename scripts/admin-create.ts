/**
 * Create an admin (or editor) account for the admin area at /admin.
 *
 *   npm run admin:create -- you@example.com "Your Name"            → admin
 *   npm run admin:create -- editor@example.com "Name" editor        → editor
 *
 * Prints a new password once. Sign in at /admin/login and keep it safe.
 * Running it again for the same email resets that account's password.
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { appUsers } from "../src/db/schema";
import { hashPassword, newPassword } from "../src/lib/server/password";

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment.
}

const [email, name, roleArg] = process.argv.slice(2);
const role = roleArg === "editor" ? "editor" : "admin";
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- you@example.com "Your Name" [editor]');
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.");
  process.exit(1);
}
const client = postgres(url, { max: 1 });
const db = drizzle(client);

async function main() {
  const e = email.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || newPassword();
  const hash = await hashPassword(password);
  const [existing] = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, e)).limit(1);
  if (existing) {
    await db
      .update(appUsers)
      .set({ passwordHash: hash, role, active: true, ...(name ? { name } : {}) })
      .where(eq(appUsers.id, existing.id));
    console.log(`Updated ${e} (${role}). New password: ${password}`);
  } else {
    await db.insert(appUsers).values({ email: e, name: name || e, role, passwordHash: hash });
    console.log(`Created ${e} (${role}). Password: ${password}`);
  }
  console.log("Sign in at /admin/login. This password is shown once: keep it safe.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
