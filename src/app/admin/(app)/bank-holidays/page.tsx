import { BankHolidaysEditor } from "@/components/admin/Editors";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function AdminBankHolidaysPage() {
  await requireUser("admin");
  const d = await adminData();
  const upcoming = d.bankHolidays.filter((h) => h.date >= d.today);
  const last = upcoming.at(-1)?.date;
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Bank holidays</h1>
      <p className="m-0 text-sm text-ink-copy">
        {last ? `Covered up to ${last}. ` : "No upcoming bank holidays. "}Add the next year once GOV.UK publishes it (usually a year or more ahead).
      </p>
      <BankHolidaysEditor holidays={upcoming.map((h) => ({ id: h.id, date: h.date, name: h.name, nations: h.nations }))} />
    </div>
  );
}
