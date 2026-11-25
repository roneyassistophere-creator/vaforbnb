"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { headerCtas, mainNav, routes, type NavGroup, type NavItem, type NavKey } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { SmartLink } from "@/components/ui/SmartLink";

export type HeaderCta = { label: string; href: string };

type Props = {
  active?: NavKey;
  /** Overrides the main header button for this page (e.g. "Free SEO check"). */
  cta?: HeaderCta;
};

const linkCls = (isActive: boolean) =>
  cn(
    "text-ink hover:text-ink",
    isActive
      ? "underline decoration-coral decoration-2 underline-offset-[6px]"
      : "no-underline hover:underline hover:decoration-coral hover:decoration-2 hover:underline-offset-[6px]",
  );

export function SiteHeader({ active, cta }: Props) {
  const [open, setOpen] = useState(false);
  const primary = cta ?? headerCtas.primary;

  return (
    <header className="relative z-30 border-b border-[var(--line-color)] bg-white">
      <div className="wrap flex min-h-[72px] items-center justify-between gap-5 md:min-h-[76px]">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-[30px] text-[15px] font-semibold md:flex">
          {mainNav.map((item) =>
            item.dropdown ? (
              <DesktopDropdown key={item.key} item={item} isActive={item.key === active} />
            ) : (
              <Link
                key={item.key}
                href={item.href}
                aria-current={item.key === active ? "page" : undefined}
                className={linkCls(item.key === active)}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          <SmartLink
            href={headerCtas.secondary.href}
            className="mr-2 hidden text-[15px] font-bold text-ink no-underline hover:text-ink lg:inline"
          >
            {headerCtas.secondary.label}
          </SmartLink>
          <SmartLink href={primary.href} className="btn btn-ink min-h-[42px] md:min-h-[44px]">
            {primary.label}
          </SmartLink>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex size-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-line-strong bg-white md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="#14212B" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="#14212B" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && <MobileNav active={active} onNavigate={() => setOpen(false)} />}
    </header>
  );
}

/* --------------------------------------------------------------------------
   Desktop dropdown
   -------------------------------------------------------------------------- */

function DesktopDropdown({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="flex items-center gap-1">
        <Link href={item.href} aria-current={isActive ? "page" : undefined} className={linkCls(isActive)}>
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="services-menu"
          aria-label={`${item.label} menu`}
          onClick={() => setOpen((v) => !v)}
          className="flex size-6 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-ink hover:bg-cloud"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn("transition-transform", open && "rotate-180")}
          >
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && item.dropdown && (
        <div id="services-menu" className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
          <div className="w-[min(860px,calc(100vw-48px))] overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_24px_60px_rgba(20,33,43,0.16)]">
            <div className="grid grid-cols-3 gap-2 p-5">
              {item.dropdown.map((g) => (
                <MenuGroup key={g.heading} group={g} onNavigate={() => setOpen(false)} />
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line-4 bg-cloud-2 px-6 py-4">
              <p className="m-0 text-[13px] font-medium text-muted">
                Not sure what you need? Most hosts start with Run.
              </p>
              <Link
                href={routes.services}
                onClick={() => setOpen(false)}
                className="text-sm font-extrabold text-brand no-underline"
              >
                See all services →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuGroup({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  return (
    <div className="rounded-[14px] p-2">
      <p className="m-0 px-2.5 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">{group.heading}</p>
      <p className="m-0 mt-0.5 mb-2 px-2.5 text-[13px] font-medium text-subtle">{group.line}</p>
      <ul className="m-0 grid list-none gap-0.5 p-0">
        {group.links.map((l) => (
          <li key={l.label}>
            <SmartLink
              href={l.href}
              onClick={onNavigate}
              className="flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-[15px] font-bold text-ink no-underline hover:bg-coral-50 hover:text-ink"
            >
              {l.label}
              {l.note && <span className="pill px-2 py-0.5 text-[11px]">{l.note}</span>}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Mobile nav
   -------------------------------------------------------------------------- */

function MobileNav({ active, onNavigate }: { active?: NavKey; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <nav id="mobile-nav" aria-label="Mobile" className="border-t border-[var(--line-color)] bg-white md:hidden">
      <div className="wrap flex flex-col py-2">
        {mainNav.map((item) => (
          <div key={item.key} className="border-b border-line-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={item.key === active ? "page" : undefined}
                className={cn(
                  "flex-1 py-3.5 text-base font-semibold text-ink no-underline",
                  item.key === active && "text-brand",
                )}
              >
                {item.label}
              </Link>
              {item.dropdown && (
                <button
                  type="button"
                  aria-expanded={expanded === item.key}
                  aria-label={`Show ${item.label.toLowerCase()}`}
                  onClick={() => setExpanded((v) => (v === item.key ? null : item.key))}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-cloud"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={cn("transition-transform", expanded === item.key && "rotate-180")}
                  >
                    <path d="M6 9l6 6 6-6" fill="none" stroke="#14212B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            {item.dropdown && expanded === item.key && (
              <div className="grid gap-3 pb-3">
                {item.dropdown.map((g) => (
                  <div key={g.heading}>
                    <p className="m-0 mb-1 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">{g.heading}</p>
                    {g.links.map((l) => (
                      <SmartLink
                        key={l.label}
                        href={l.href}
                        onClick={onNavigate}
                        className="flex items-center justify-between py-2 pl-3 text-[15px] font-semibold text-ink no-underline"
                      >
                        {l.label}
                        {l.note && <span className="pill px-2 py-0.5 text-[11px]">{l.note}</span>}
                      </SmartLink>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <SmartLink href={headerCtas.secondary.href} className="btn btn-coral my-3">
          Get a {headerCtas.secondary.label.toLowerCase()}
        </SmartLink>
      </div>
    </nav>
  );
}
