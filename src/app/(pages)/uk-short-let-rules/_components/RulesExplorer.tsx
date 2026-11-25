"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { brand } from "@/config/brand";
import { isToolLive, toolBySlug } from "@/content/tools/catalog";
import { cn } from "@/lib/cn";
import { SearchIcon } from "@/components/ui/Icon";
import { nations, rules, statusKey, statusStyles, topics, type NationKey, type Rule, type TopicKey } from "../content";

const matchNation = (r: Rule, n: NationKey) =>
  n === "all" || r.n.includes("uk") || r.n.includes(n as Rule["n"][number]) || (n === "london" && r.n.includes("england"));

/** Filterable, expandable list of every rule. Hero links like #nation-scotland pre-select a nation. */
export function RulesExplorer() {
  const [nation, setNation] = useState<NationKey>("all");
  const [topic, setTopic] = useState<TopicKey>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  const [all, setAll] = useState(false);

  const [highlight, setHighlight] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const read = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash) return;

      // #<rule anchor>: clear filters, open that card, scroll to it and highlight it.
      const i = rules.findIndex((r) => r.anchor === hash || r.aliases?.includes(hash));
      if (i >= 0) {
        setNation("all");
        setTopic("all");
        setQuery("");
        setAll(false);
        setOpen({ [i]: true });
        setHighlight(i);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" })),
        );
        clearTimeout(timer);
        timer = setTimeout(() => setHighlight(null), 2500);
        return;
      }

      // #nation-<key>: pre-select a nation.
      const m = hash.match(/^nation-(.+)$/);
      if (!m || !nations.some((n) => n.key === m[1])) return;
      setNation(m[1] as NationKey);
      setTopic("all");
      document.getElementById("rules")?.scrollIntoView();
    };
    read();
    window.addEventListener("hashchange", read);
    return () => {
      window.removeEventListener("hashchange", read);
      clearTimeout(timer);
    };
  }, []);

  const q = query.toLowerCase().trim();
  const base = useMemo(
    () =>
      rules
        .map((r, i) => ({ ...r, i }))
        .filter((r) => matchNation(r, nation) && (!q || `${r.q} ${r.a} ${r.where}`.toLowerCase().includes(q))),
    [nation, q],
  );
  const list = base.filter((r) => topic === "all" || r.topic === topic);
  const isOpen = (i: number) => all || !!open[i];

  const toggle = (i: number) => {
    const current = isOpen(i);
    const nextOpen = all ? Object.fromEntries(list.map((x) => [x.i, true])) : { ...open };
    setAll(false);
    setOpen({ ...nextOpen, [i]: !current });
  };

  const nationLabel = nations.find((n) => n.key === nation)?.t;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">All rules</p>
          <h2 className="h2 m-0">Find the rules that apply to you</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setAll((v) => !v);
            setOpen({});
          }}
          className="min-h-[44px] cursor-pointer rounded-[10px] border border-line-6 bg-white px-4 text-sm font-bold text-ink"
        >
          {all ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-8">
        {/* Filters */}
        <div className="grid w-full max-w-none gap-[26px] md:w-auto md:max-w-[280px] md:flex-[1_1_240px]">
          <label className="flex min-h-12 items-center gap-2.5 rounded-[10px] border border-line-6 px-3.5">
            <SearchIcon />
            <span className="sr-only-label">Search rules</span>
            <input
              type="search"
              placeholder="Search: gas, levy, EPC…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[46px] min-w-0 flex-1 border-none bg-transparent text-[15px] outline-none"
            />
          </label>
          <div>
            <p className="eyebrow mb-2.5">Nation</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by nation">
              {nations.map((n) => {
                const on = nation === n.key;
                return (
                  <button
                    key={n.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setNation(n.key)}
                    className={cn(
                      "min-h-10 cursor-pointer rounded-full border px-3.5 text-[13px] font-bold",
                      on ? "border-ink bg-ink text-white" : "border-line-6 bg-white text-ink",
                    )}
                  >
                    {n.t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2.5">Topic</p>
            <div className="grid gap-0.5" role="group" aria-label="Filter by topic">
              {topics.map((t) => {
                const on = topic === t.key;
                const c = t.key === "all" ? base.length : base.filter((r) => r.topic === t.key).length;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTopic(t.key)}
                    className={cn(
                      "flex min-h-[42px] cursor-pointer items-center justify-between rounded-lg border-none px-3 text-left text-sm text-ink",
                      on ? "bg-coral-50 font-extrabold" : "bg-transparent font-semibold",
                    )}
                  >
                    {t.t}
                    <span className="font-mono text-xs text-muted">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2.5">Status key</p>
            <div className="grid gap-2 text-[13px] text-body">
              {statusKey.map((k) => (
                <span key={k.kind} className="flex items-center gap-2.5">
                  <span className="badge-mono" style={{ background: statusStyles[k.kind].bg, color: statusStyles[k.kind].fg }}>
                    {k.t}
                  </span>
                  {k.d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="min-w-0 flex-[999_1_560px]">
          <p className="font-mono m-0 mb-3 text-[13px] text-muted" aria-live="polite">
            {list.length} {list.length === 1 ? "rule" : "rules"}
            {nation === "all" ? "" : ` for ${nationLabel}`}
          </p>
          <div className="border-t border-line-3">
            {list.map((r) => {
              const o = isOpen(r.i);
              const st = statusStyles[r.kind];
              return (
                <article
                  key={r.i}
                  id={r.anchor}
                  className={cn(
                    "scroll-mt-24 border-b border-line-3 transition-[background-color,box-shadow] duration-700",
                    highlight === r.i && "rounded-[12px] bg-coral-50 shadow-[0_0_0_3px_#F0595A]",
                  )}
                >
                  {r.aliases?.map((a) => (
                    <span key={a} id={a} className="block scroll-mt-24" aria-hidden="true" />
                  ))}
                  <h3 className="m-0">
                    <button
                      type="button"
                      aria-expanded={o}
                      aria-controls={`rule-${r.i}`}
                      onClick={() => toggle(r.i)}
                      className="flex w-full cursor-pointer items-start gap-4 border-none bg-transparent px-1 py-[18px] text-left text-ink"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="mb-2 block text-[17px] leading-[1.4] font-bold">{r.q}</span>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="badge-mono" style={{ background: st.bg, color: st.fg }}>
                            {r.status}
                          </span>
                          <span className="text-[13px] font-normal text-muted">{r.where}</span>
                        </span>
                      </span>
                      <span className="flex size-7 flex-none items-center justify-center rounded-full border border-line-6 text-base font-semibold text-body">
                        {o ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div id={`rule-${r.i}`} hidden={!o} className="pt-0 pr-4 pb-6 pl-1 md:pr-[52px]">
                    <p className="m-0 mb-4 text-[15px] leading-[1.7] text-ink-prose">{r.a}</p>
                    {r.todo.length > 0 && (
                      <div className="mb-4 rounded-[10px] bg-cream-2 px-[18px] py-4">
                        <p className="m-0 mb-2 text-[13px] font-extrabold">What to do</p>
                        {r.todo.map((t) => (
                          <p key={t} className="m-0 flex gap-2.5 py-1 text-sm leading-[1.55]">
                            <span className="font-extrabold text-brand">→</span>
                            <span>{t}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    {r.tool && isToolLive(r.tool) && (
                      <Link href={toolBySlug(r.tool)!.href! + (r.toolQuery ?? "")} className="btn btn-ink mb-4">
                        {r.toolLabel ?? "Check if you qualify"} →
                      </Link>
                    )}
                    <p className="font-mono m-0 text-xs leading-[1.6] text-muted">
                      Source: {r.src} · Last checked {brand.content.rulesLastCheckedShort}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          {list.length === 0 && <p className="py-10 text-[15px] text-muted">No rules match. Try another word, or clear the filters.</p>}
        </div>
      </div>
    </>
  );
}
