import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireUser } from "@/lib/server/auth";

/** Signed-in admin pages: checks the session on the server, then shows the navigation. */
async function Gate({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="text-[15px] font-extrabold text-ink no-underline">
            VA for BnB · <span className="text-brand">Event calendar admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-copy">
              {user.name} <span className="rounded-md bg-fog px-2 py-[2px] text-[12px] font-bold uppercase">{user.role}</span>
            </span>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-outline min-h-11 px-3">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AdminNav role={user.role} />
      </header>
      <main className="mx-auto max-w-[1240px] px-4 py-6">{children}</main>
    </>
  );
}

/** The admin area is private and always reads live data: it renders per request (no instant static shell). */
export const instant = false;

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
