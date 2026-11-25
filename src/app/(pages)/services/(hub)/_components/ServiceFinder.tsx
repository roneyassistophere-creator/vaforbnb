"use client";

import { useMemo, useState, type ReactNode } from "react";
import { brand } from "@/config/brand";
import { prices, showPrice } from "@/config/pricing";
import { packages, serviceHref, services, type GoalKey, type Service } from "@/content/services";
import { cn } from "@/lib/cn";
import { Icon, SearchIcon } from "@/components/ui/Icon";
import { Tick } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { defaultPlan, goals, hero } from "../content";

const quoteHref = (names: string[]) =>
  `mailto:${brand.contact.email}?subject=${encodeURIComponent("Quote request")}&body=${encodeURIComponent(
    `Hi ${brand.name},\n\nPlease quote for:\n${names.map((n) => `- ${n}`).join("\n")}\n\nNumber of properties:\nWhere they are:\n`,
  )}`;

/** Hero search, goal filter, service catalogue and the sticky "your plan" bar (shared state). */
export function ServiceFinder({ breadcrumbs }: { breadcrumbs: ReactNode }) {
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState<"all" | GoalKey>("all");
  const [plan, setPlan] = useState<string[]>(defaultPlan);

  const q = query.trim().toLowerCase();
  const match = useMemo(
    () =>
      services.filter(
        (x) =>
          (goal === "all" || x.goals.includes(goal)) &&
          (!q || `${x.name} ${x.benefit} ${x.keywords}`.toLowerCase().includes(q)),
      ),
    [goal, q],
  );

  const toggle = (id: string) => setPlan((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const sel = services.filter((x) => plan.includes(x.id));
  const packsCovered = packages.filter((p) => sel.some((x) => x.pack === p.key)).map((p) => p.title);
  const runN = sel.filter((x) => x.pack === "run").length;

  const planTitle =
    sel.length === 0
      ? "Build your plan"
      : "Your plan: " +
        sel
          .map((x) => x.name)
          .slice(0, 3)
          .join(", ") +
        (sel.length > 3 ? ` +${sel.length - 3} more` : "");
  const planSub =
    sel.length === 0
      ? "Add services above and we’ll quote for exactly what you need."
      : runN >= 4
        ? `Tip: with ${runN} Run services, the full Run package may be simpler. We’ll compare both on a call.`
        : `Covers: ${packsCovered.join(" + ")} · we’ll confirm the price on a call`;

  return (
    <>
      {/* HERO + FINDER */}
      <section className="border-b border-line-2 bg-white">
        <div className="wrap pt-7 pb-14">
          <div className="mb-10">{breadcrumbs}</div>
          <div className="grid grid-cols-1 items-end gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1 className="font-sora m-0 mb-[18px] text-[40px] leading-[1.06] font-semibold tracking-[-2px] md:text-[52px]">
                {hero.titleStart} <span className="text-brand">{hero.titleAccent}</span>
              </h1>
              <p className="lead text-[17px]">{hero.lead}</p>
            </div>
            <div className="card border-sand-edge bg-sand p-[22px]">
              <label htmlFor="service-q" className="mb-2.5 block text-sm font-extrabold">
                {hero.finderLabel}
              </label>
              <div className="flex min-h-[52px] items-center gap-2.5 rounded-xl border-[1.5px] border-line-strong bg-white px-3.5">
                <SearchIcon />
                <input
                  id="service-q"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={hero.finderPlaceholder}
                  className="min-h-12 min-w-0 flex-1 border-none bg-transparent text-[15px] text-ink outline-none"
                />
              </div>
              <p className="mt-3.5 mb-0 text-[13px] text-muted">
                Or not sure?{" "}
                <SmartLink href={brand.links.freeAudit} className="font-bold">
                  Get a free listing audit
                </SmartLink>{" "}
                and we’ll tell you where to start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GOAL FILTER + CATALOG */}
      <section className="pt-10 pb-6" id="catalog">
        <div className="wrap">
          <div role="group" aria-label="Filter by goal" className="mb-3.5 flex flex-wrap gap-2">
            {goals.map((g) => {
              const on = goal === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGoal(g.key)}
                  className={cn(
                    "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border-[1.5px] px-4 text-sm font-bold",
                    on ? "border-ink bg-ink text-white" : "border-line-5 bg-white text-ink",
                  )}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          <p className="m-0 mb-8 text-sm text-muted" aria-live="polite">
            {match.length === services.length
              ? `Showing all ${services.length} services. Add the ones you need to build your plan.`
              : `Showing ${match.length} of ${services.length} services`}
          </p>

          {packages.map((p) => {
            const items = match.filter((x) => x.pack === p.key);
            if (!items.length) return null;
            return (
              <div key={p.key} className="mb-12" id={`pack-${p.key}`}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
                  <div className="flex items-center gap-3.5">
                    <span
                      className="font-sora flex size-12 items-center justify-center rounded-[14px] text-xl font-bold"
                      style={{ background: p.bg, color: p.fg }}
                    >
                      {p.n}
                    </span>
                    <div>
                      <h2 className="font-sora m-0 text-[26px] font-semibold tracking-[-0.8px]">{p.title}</h2>
                      <p className="m-0 mt-0.5 text-sm text-muted">{p.line}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">
                    From {showPrice(prices[p.key])} {p.unit}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {items.map((s) => (
                    <ServiceCard key={s.id} s={s} inPlan={plan.includes(s.id)} onToggle={() => toggle(s.id)} />
                  ))}
                </div>
              </div>
            );
          })}

          {match.length === 0 && (
            <div className="card mb-12 p-11 text-center">
              <p className="m-0 mb-1.5 text-lg font-extrabold">No service matches “{query}”</p>
              <p className="m-0 mb-[18px] text-muted">
                Tell us what you need on a free call. If it’s part of running a short let, we can probably help.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setGoal("all");
                }}
                className="btn btn-outline"
              >
                Show all services
              </button>
            </div>
          )}
        </div>
      </section>

      {/* PLAN BAR (sticky) */}
      <div className="sticky bottom-0 z-10 pb-4">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink py-3.5 pr-4 pl-[22px] text-white shadow-[0_16px_40px_rgba(20,33,43,0.25)]">
            <div className="flex min-w-0 flex-wrap items-center gap-3.5">
              <span className="font-sora flex size-[38px] flex-none items-center justify-center rounded-[10px] bg-coral font-bold text-ink">
                {sel.length}
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[15px] font-extrabold">{planTitle}</p>
                <p className="m-0 mt-0.5 text-[13px] text-mist">{planSub}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sel.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPlan([])}
                  className="min-h-[44px] cursor-pointer rounded-[10px] border border-night-3 bg-transparent px-3.5 text-sm font-bold text-white"
                >
                  Clear
                </button>
              )}
              <SmartLink
                href={sel.length ? quoteHref(sel.map((x) => x.name)) : brand.links.freeAudit}
                className="btn btn-coral min-h-[44px]"
              >
                {sel.length === 0 ? "Get a free audit" : "Get a quote for these"}
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ServiceCard({ s, inPlan, onToggle }: { s: Service; inPlan: boolean; onToggle: () => void }) {
  const soon = !!s.comingSoon;
  return (
    <article
      id={s.id}
      className={cn("card flex flex-col gap-3.5 p-[22px]", inPlan ? "border-ink shadow-[0_0_0_1px_#14212B]" : "border-line-2")}
    >
      <div className="flex items-start justify-between gap-2.5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-cloud">
          <Icon name={s.icon} color="#14212B" />
        </span>
        {s.tag && (
          <span
            className={cn(
              "rounded-full px-[9px] py-1 text-[11px] font-extrabold",
              soon ? "bg-fog text-muted" : "bg-coral-50 text-brand",
            )}
          >
            {s.tag}
          </span>
        )}
      </div>
      <div>
        <h3 className="m-0 mb-1 text-lg font-extrabold tracking-[-0.3px]">{s.name}</h3>
        <p className="m-0 text-sm leading-normal text-body">{s.benefit}</p>
      </div>
      <ul className="m-0 grid flex-1 list-none gap-[7px] p-0">
        {s.included.map((i) => (
          <li key={i} className="flex items-start gap-[9px] text-[13px] leading-[1.45] font-semibold text-ink-soft">
            <Tick className="mt-px" />
            {i}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 border-t border-line-4 pt-3.5">
        {soon ? (
          <SmartLink
            href={brand.links.bookCall}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-line-strong bg-white text-sm font-bold text-ink no-underline hover:text-ink"
          >
            Ask about it
          </SmartLink>
        ) : (
          <button
            type="button"
            aria-pressed={inPlan}
            onClick={onToggle}
            className={cn(
              "min-h-[44px] flex-1 cursor-pointer rounded-[10px] border-[1.5px] text-sm font-bold",
              inPlan ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink",
            )}
          >
            {inPlan ? "✓ In my plan" : "+ Add to my plan"}
          </button>
        )}
        <SmartLink
          href={s.slug ? serviceHref(s.id) : brand.links.bookCall}
          className="inline-flex min-h-[44px] items-center rounded-[10px] bg-cloud px-3.5 text-sm font-bold text-ink no-underline hover:text-ink"
          aria-label={`${s.name} details`}
        >
          Details →
        </SmartLink>
      </div>
    </article>
  );
}
