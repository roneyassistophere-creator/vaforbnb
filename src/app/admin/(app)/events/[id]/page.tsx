import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const [{ id }, d] = await Promise.all([params, adminData()]);
  const e = d.events.find((x) => x.id === id);
  if (!e) notFound();
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Edit event</h1>
      <p className="m-0 text-sm text-ink-copy">
        Last updated {new Date(e.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}
        {e.updatedBy ? ` by ${e.updatedBy}` : ""}.{e.isSample && " This is SAMPLE test data: it never shows on the live site."}
      </p>
      <EventForm initial={e} cities={d.cities} categories={d.categories} settings={d.settings} today={d.today} role={user.role} />
    </div>
  );
}
