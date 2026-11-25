import { EventsTable } from "@/components/admin/EventsTable";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const [d, sp] = await Promise.all([adminData(), searchParams]);
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Events</h1>
      <EventsTable
        events={d.events}
        cities={d.cities}
        categories={d.categories}
        settings={d.settings}
        today={d.today}
        role={user.role}
        initial={{ queue: one("queue"), status: one("status"), city: one("city") }}
      />
    </div>
  );
}
