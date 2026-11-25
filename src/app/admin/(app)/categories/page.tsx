import { CategoriesEditor } from "@/components/admin/Editors";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";

export default async function AdminCategoriesPage() {
  await requireUser("admin");
  const d = await adminData();
  return (
    <div className="grid gap-4">
      <h1 className="m-0 text-[28px] font-extrabold">Categories</h1>
      <p className="m-0 text-sm text-ink-copy">The filter chips on the public page, in this order. The tip shows on every event card in the category.</p>
      <CategoriesEditor categories={d.categories} />
    </div>
  );
}
