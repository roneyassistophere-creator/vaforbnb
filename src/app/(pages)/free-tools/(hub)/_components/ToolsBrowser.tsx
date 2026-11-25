"use client";

import { useEffect, useState, type ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Icon, SearchIcon } from "@/components/ui/Icon";
import { CheckStroke } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { hero, isLive, jobFromSlug, jobOrder, jobs, launchedPhase, tools, type JobKey, type Tool } from "../content";

/**
 * Hero search + job filter and the "All tools" grid share state, so this
 * component renders both. Anything passed as children (kits, featured tool)
 * renders between them.
 */
export function ToolsBrowser({ breadcrumbs, children }: { breadcrumbs: ReactNode; children: ReactNode }) {
  const [job, setJob] = useState<"all" | JobKey>("all");
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const visible = tools.filter((t) => t.phase <= launchedPhase + 1);
  const match = visible.filter(
    (t) =>
      (job === "all" || t.job === job) &&
      (!q || `${t.name} ${t.q} ${t.keywords} ${jobs[t.job].t}`.toLowerCase().includes(q)),
  );
  const liveCount = visible.filter((t) => isLive(t)).length;
  const filtered = job !== "all" || !!q;

  // ?job=stay-legal (e.g. from a breadcrumb) pre-selects that job; choosing a job updates the URL.
  useEffect(() => {
    const k = jobFromSlug(new URLSearchParams(window.location.search).get("job"));
    // Read once after hydration: the server render has no URL query.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (k) setJob(k);
  }, []);
  const chooseJob = (next: "all" | JobKey) => {
    setJob(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("job");
    else url.searchParams.set("job", jobs[next].slug);
    window.history.replaceState(null, "", url);
  };
  const clearAll = () => {
    chooseJob("all");
    setQuery("");
  };

  const onSearch = (v: string) => {
    setQuery(v);
  };

  return (
    <>
      {/* HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-14 pb-11 text-center">
          <div className="mb-5 flex justify-center">{breadcrumbs}</div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-3.5 py-[7px] text-[13px] font-bold text-green">
            <span className="size-[7px] rounded-full bg-green-dot" />
            Rules and figures last checked: {brand.content.rulesLastChecked}
          </p>
          <h1 className="mx-auto mb-[18px] max-w-[820px] text-[38px] leading-[1.04] font-extrabold tracking-[-2.2px] md:text-[56px]">
            {hero.title}
          </h1>
          <p className="mx-auto mb-[30px] max-w-[760px] text-lg leading-[1.65] text-ink-copy">{hero.lead}</p>

          <label className="mx-auto flex min-h-[60px] max-w-[640px] items-center gap-3 rounded-2xl border-[1.5px] border-ink bg-white px-[18px] shadow-[0_8px_24px_rgba(20,33,43,0.08)]">
            <SearchIcon size={20} color="#14212B" />
            <span className="sr-only-label">Search tools</span>
            <input
              type="search"
              placeholder={hero.searchPlaceholder}
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("all")?.scrollIntoView({ behavior: "smooth" })}
              className="min-h-14 min-w-0 flex-1 border-none bg-transparent text-[17px] outline-none"
            />
          </label>

          <div role="group" aria-label="Filter by job" className="mx-auto mt-7 grid max-w-[980px] grid-cols-2 gap-3 md:grid-cols-4">
            {jobOrder.map((k) => {
              const J = jobs[k];
              const on = job === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => chooseJob(on ? "all" : k)}
                  className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3.5 text-left text-ink"
                  style={{ borderColor: on ? J.c : "#E6E8EB", background: on ? J.tint : "#FFFFFF" }}
                >
                  <span className="flex size-9 flex-none items-center justify-center rounded-[10px]" style={{ background: J.tint }}>
                    <Icon name={J.icon} size={20} color={J.c} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-extrabold">{J.t}</span>
                    <span className="block text-xs text-muted">{visible.filter((t) => t.job === k).length} tools</span>
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="m-0 mt-6 flex list-none flex-wrap justify-center gap-[22px] p-0 text-[13px] font-semibold text-body">
            {hero.promises.map((p) => (
              <li key={p} className="inline-flex items-center gap-1.5">
                <CheckStroke />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {children}

      {/* ALL TOOLS */}
      <section id="all" className="pb-[72px]">
        <div className="wrap">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">All tools</p>
              <h2 className="h2 m-0">{job === "all" ? "Every tool, by what you need" : jobs[job].t}</h2>
            </div>
            {filtered && (
              <button type="button" onClick={clearAll} className="btn btn-outline min-h-[42px]">
                Clear filters
              </button>
            )}
          </div>
          <p className="lead mb-2" aria-live="polite">
            {match.length} of {visible.length} tools shown · {liveCount} live now
          </p>

          {jobOrder
            .filter((k) => match.some((t) => t.job === k))
            .map((k) => {
              const J = jobs[k];
              return (
                <div key={k} className="mt-9">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="flex size-[34px] items-center justify-center rounded-[10px]" style={{ background: J.tint }}>
                      <Icon name={J.icon} size={18} color={J.c} strokeWidth={2} />
                    </span>
                    <h3 className="m-0 text-xl font-extrabold">{J.t}</h3>
                    <span className="text-[13px] text-muted">{J.sub}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
                    {match
                      .filter((t) => t.job === k)
                      .map((t) => (
                        <ToolCard key={t.id} t={t} dot={J.c} />
                      ))}
                  </div>
                </div>
              );
            })}

          {match.length === 0 && (
            <div className="mt-8 rounded-[20px] border border-line bg-white p-10 text-center">
              <p className="m-0 mb-1.5 text-lg font-extrabold">No tools match “{query}”</p>
              <p className="m-0 mb-[18px] text-muted">Try another word, or suggest the tool you need below.</p>
              <button type="button" onClick={clearAll} className="btn btn-outline">
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ToolCard({ t, dot }: { t: Tool; dot: string }) {
  // Only tools set live in the catalogue show as Free and link to their page.
  const live = isLive(t);
  const status = live ? "Free" : "Coming soon";
  const statusCls = live ? "bg-green-100 text-green" : "bg-fog text-muted";

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="size-2 rounded-full" style={{ background: dot }} />
        <span className="flex items-center gap-1.5">
          {t.badge && <span className="pill bg-violet-50 font-extrabold text-violet">{t.badge}</span>}
          <span className={cn("pill", statusCls)}>{status}</span>
        </span>
      </div>
      <div className="flex-1">
        <p className="m-0 mb-1.5 text-[17px] leading-[1.3] font-extrabold">{t.name}</p>
        <p className="m-0 text-sm leading-normal text-body">{t.q}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="pill">{t.mins} min</span>
        <span className="pill">{t.out}</span>
        <span className="pill">{t.nations}</span>
      </div>
    </>
  );

  const cls = cn(
    "box-border flex min-h-[188px] flex-col gap-3 rounded-[18px] border border-line bg-white p-5 text-ink no-underline transition-shadow",
    "hover:border-ink hover:text-ink hover:shadow-[0_10px_28px_rgba(20,33,43,0.08)]",
    !live && "opacity-65",
  );

  return live ? (
    <SmartLink id={t.id} href={t.href!} className={cls}>
      {body}
    </SmartLink>
  ) : (
    <article id={t.id} className={cls}>
      {body}
    </article>
  );
}
