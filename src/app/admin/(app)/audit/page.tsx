import { requireUser } from "@/lib/server/auth";
import { recentAudit } from "@/lib/server/events";

export default async function AdminAuditPage() {
  await requireUser("admin");
  const rows = await recentAudit(200);
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Audit log</h1>
      <p className="m-0 text-sm text-ink-copy">The last 200 changes: who, what and when.</p>
      <div className="overflow-x-auto rounded-[18px] border border-line bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="bg-cloud-2 text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Who</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">What</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">{r.at.toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-3 py-2">{r.userEmail}</td>
                <td className="px-3 py-2 font-bold">
                  {r.action} {r.entity}
                </td>
                <td className="px-3 py-2 text-ink-copy">{r.summary}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-muted">
                  No changes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
