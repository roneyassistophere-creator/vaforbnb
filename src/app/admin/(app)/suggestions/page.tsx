import { SuggestionsInbox } from "@/components/admin/Editors";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function AdminSuggestionsPage() {
  const user = await requireUser();
  const d = await adminData();
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Suggestions</h1>
      <p className="m-0 text-sm text-ink-copy">Events sent in by hosts. Check the source link, then create a draft or reject. Emails are deleted when a suggestion is closed.</p>
      <SuggestionsInbox suggestions={d.suggestions} role={user.role} />
    </div>
  );
}
