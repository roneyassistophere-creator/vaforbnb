"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** [section id, short label] pairs, in page order. */
export type TocItems = ReadonlyArray<readonly [string, string]>;

export type TocCta = {
  title?: string;
  text: string;
  label: string;
  href: string;
};

/** Tracks which section is currently being read. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        // The first section (in page order) inside the reading band wins.
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** Numbered "On this page" links, as designed on the finance check page. */
export function TocNav({ items }: { items: TocItems }) {
  const [ids] = useState(() => items.map(([id]) => id));
  const active = useActiveSection(ids);

  return (
    <nav aria-label="On this page">
      {items.map(([id, label], i) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "location" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-[9px] text-sm font-semibold text-ink-hover no-underline hover:bg-fog hover:text-ink",
            active === id && "bg-fog text-ink",
          )}
        >
          <span className="min-w-5 text-xs font-extrabold text-brand">{String(i + 1).padStart(2, "0")}</span>
          {label}
        </a>
      ))}
    </nav>
  );
}

/** Dark call-to-action card under the links. */
export function TocCard({ title = "Prefer we do it?", text, label, href }: TocCta) {
  return (
    <div className="mt-6 rounded-[14px] bg-ink p-5 text-white">
      <p className="m-0 mb-1.5 text-[15px] font-extrabold">{title}</p>
      <p className="m-0 mb-3.5 text-[13px] leading-[1.55] text-mist">{text}</p>
      <a href={href} className="btn btn-coral min-h-[44px] w-full rounded-[10px]">
        {label}
      </a>
    </div>
  );
}

/**
 * Service page body with a sticky "On this page" sidebar on the left.
 * The sidebar shows from 1180px; below that the content runs full width.
 * Sections keep their own full-bleed backgrounds inside the content column.
 */
export function ServiceTocLayout({ items, cta, children }: { items: TocItems; cta: TocCta; children: ReactNode }) {
  return (
    <div className="toc:grid toc:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line toc:block">
        <div className="sticky top-0 max-h-dvh overflow-y-auto px-4 pt-10 pb-8">
          <p className="m-0 mb-2.5 ml-3 text-xs font-extrabold tracking-[1.2px] text-muted">ON THIS PAGE</p>
          <TocNav items={items} />
          <TocCard {...cta} />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
