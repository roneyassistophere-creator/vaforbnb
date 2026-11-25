import { ImportPanel } from "@/components/admin/ImportPanel";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function ImportPage() {
  const user = await requireUser();
  const d = await adminData();
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Import and export</h1>
      <ImportPanel role={user.role} events={d.events.filter((e) => !e.isSample)} today={d.today} />
    </div>
  );
}
