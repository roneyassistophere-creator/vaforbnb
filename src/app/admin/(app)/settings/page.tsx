import { SettingsForm } from "@/components/admin/Editors";
import { requireUser } from "@/lib/server/auth";
import { readSettingsUncached } from "@/lib/server/events";

export default async function AdminSettingsPage() {
  await requireUser("admin");
  const { settings, lastReviewed } = await readSettingsUncached();
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Settings</h1>
      <p className="m-0 text-sm text-ink-copy">Changes apply to the public page within a few minutes.</p>
      <SettingsForm settings={settings} lastReviewed={lastReviewed} />
    </div>
  );
}
