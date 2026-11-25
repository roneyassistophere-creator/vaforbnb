import { CitiesEditor } from "@/components/admin/Editors";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function AdminCitiesPage() {
  await requireUser("admin");
  const d = await adminData();
  const counts: Record<string, number> = {};
  for (const e of d.events) if (!e.isSample && e.status === "published" && (e.endDate || e.startDate) >= d.today) counts[e.city] = (counts[e.city] ?? 0) + 1;
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Cities</h1>
      <p className="m-0 text-sm text-ink-copy">Covered cities get a page and appear in the town search. Add nearby towns so hosts in Salford or Stockport still find Manchester.</p>
      <CitiesEditor cities={d.cities} counts={counts} />
    </div>
  );
}
