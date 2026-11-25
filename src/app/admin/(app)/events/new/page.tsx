import { EventForm } from "@/components/admin/EventForm";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";
import { draftFromSuggestion, emptyEvent } from "@/lib/tools/events";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const [d, sp] = await Promise.all([adminData(), searchParams]);
  const sid = typeof sp.suggestion === "string" ? sp.suggestion : "";
  const suggestion = sid ? d.suggestions.find((s) => s.id === sid && s.status === "new") : undefined;
  const initial = suggestion ? draftFromSuggestion(suggestion, d.cities) : emptyEvent();
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">{suggestion ? "New event from a suggestion" : "Add an event"}</h1>
      <EventForm initial={initial} cities={d.cities} categories={d.categories} settings={d.settings} today={d.today} role={user.role} suggestionId={suggestion?.id} />
    </div>
  );
}
