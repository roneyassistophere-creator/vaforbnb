import { asc } from "drizzle-orm";
import { UsersPanel } from "@/components/admin/Editors";
import { appUsers } from "@/db/schema";
import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export default async function AdminUsersPage() {
  const me = await requireUser("admin");
  const rows = await getDb().select().from(appUsers).orderBy(asc(appUsers.name));
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Users</h1>
      <p className="m-0 text-sm text-ink-copy">Editors can add and edit drafts. Only admins can publish, import as published, or change settings. A new user gets a one-time password: send it to them privately.</p>
      <UsersPanel users={rows.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} me={me.id} />
    </div>
  );
}
