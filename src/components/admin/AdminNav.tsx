"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Dashboard", admin: false },
  { href: "/admin/events", label: "Events", admin: false },
  { href: "/admin/import", label: "Import / export", admin: false },
  { href: "/admin/suggestions", label: "Suggestions", admin: false },
  { href: "/admin/cities", label: "Cities", admin: true },
  { href: "/admin/categories", label: "Categories", admin: true },
  { href: "/admin/bank-holidays", label: "Bank holidays", admin: true },
  { href: "/admin/settings", label: "Settings", admin: true },
  { href: "/admin/users", label: "Users", admin: true },
  { href: "/admin/audit", label: "Audit log", admin: false },
];

export function AdminNav({ role }: { role: "admin" | "editor" }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="mx-auto max-w-[1240px] overflow-x-auto px-2">
      <ul className="m-0 flex list-none gap-1 p-0 pb-1">
        {LINKS.filter((l) => !l.admin || role === "admin").map((l) => {
          const on = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={on ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-[10px] px-3 text-sm font-bold whitespace-nowrap no-underline", on ? "bg-ink text-white" : "text-ink-copy hover:bg-fog hover:text-ink")}>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
