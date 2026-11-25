"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { areas, companies, faq, faqCats, linenOptions, linenSets, quotes, type FaqCat } from "../content";

const mono = "font-mono text-xs font-semibold tracking-[0.6px] uppercase";

function Pill({ on, onClick, children, className }: { on: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "min-h-[44px] cursor-pointer rounded-md border border-ink px-4 text-sm font-bold",
        on ? "bg-ink text-white" : "bg-white text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Three ways to handle linen, with the selected option explained. */
export function LinenOptions({ intro }: { intro: React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  const o = linenOptions[idx];
  return (
    <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-2 md:gap-12">
      <div>
        {intro}
        <p className={cn(mono, "m-0 mb-3")}>Three ways to handle linen</p>
        <div className="grid gap-2" role="group" aria-label="Linen options">
          {linenOptions.map((x, i) => (
            <Pill key={x.t} on={idx === i} onClick={() => setIdx(i)} className="flex min-h-14 items-center justify-between gap-3 text-left">
              <span>{x.t}</span>
              <span className={cn(mono, "text-[11px]")}>{x.tag}</span>
            </Pill>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-ink bg-white p-7" aria-live="polite">
        <p className={cn(mono, "m-0 mb-2.5 text-brand")}>{o.t}</p>
        <p className="m-0 mb-5 text-lg leading-[1.55] font-semibold">{o.how}</p>
        <div className="grid gap-3.5">
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <span className={cn(mono, "text-green")}>Best for</span>
            <span className="text-[15px] leading-[1.55]">{o.best}</span>
          </div>
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <span className={cn(mono, "text-brand-deep")}>Watch for</span>
            <span className="text-[15px] leading-[1.55]">{o.watch}</span>
          </div>
        </div>
        <div className="mt-6 border-t border-dashed border-ink pt-5">
          <p className={cn(mono, "m-0 mb-3")}>Rule of thumb: 3 sets per bed</p>
          <div className="grid grid-cols-3 gap-2">
            {linenSets.map((s) => (
              <div key={s.t} className="rounded border border-ink p-3 text-center" style={{ background: s.bg }}>
                <svg width="40" height="26" viewBox="0 0 40 26" aria-hidden="true" className="mx-auto">
                  <rect x="2" y="10" width="36" height="12" rx="2" fill="none" stroke="#14212B" strokeWidth="2" />
                  <rect x="5" y="5" width="12" height="7" rx="2" fill="none" stroke="#14212B" strokeWidth="2" />
                </svg>
                <p className="m-0 mt-1.5 text-[13px] font-bold">{s.t}</p>
              </div>
            ))}
          </div>
          <p className="m-0 mt-3 text-[13px] text-muted">Airbnb also recommends spare sheets and towels for same-day turnovers.</p>
        </div>
      </div>
    </div>
  );
}

/** Linen companies, filterable by area. */
export function CompanyDirectory() {
  const [area, setArea] = useState<(typeof areas)[number]>("All");
  const shown = area === "All" ? companies : companies.filter((c) => c.tags.includes(area));
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={cn(mono, "m-0 mb-2.5 text-brand")}>Directory</p>
          <h3 className="m-0 text-[26px] font-extrabold tracking-[-0.8px] md:text-[30px]">UK linen hire and laundry companies hosts use</h3>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by area">
          {areas.map((a) => (
            <Pill key={a} on={area === a} onClick={() => setArea(a)}>
              {a}
            </Pill>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-ink bg-white" aria-live="polite">
        {shown.map((c) => (
          <div key={c.n} className="grid grid-cols-1 items-start gap-x-7 gap-y-2.5 border-b border-[#D9D4CB] px-6 py-[22px] last:border-b-0 md:grid-cols-[1fr_2fr_1fr]">
            <span className="text-lg font-extrabold">{c.n}</span>
            <span className="text-sm leading-[1.55] text-ink-copy">{c.o}</span>
            <span className={cn(mono, "leading-[1.6] text-body")}>{c.where}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/** Pick one of three example quotes. */
export function QuoteChooser() {
  const [chosen, setChosen] = useState(-1);
  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {quotes.map((q, i) => {
          const on = chosen === i;
          return (
            <div
              key={q.n}
              className={cn("flex flex-col gap-3 rounded-md p-[22px]", on ? "border-2 border-coral bg-coral-50" : "border border-ink bg-white")}
            >
              <div className="flex items-center justify-between">
                <span className={mono}>{q.n}</span>
                <span className="text-[26px] font-extrabold">{q.p}</span>
              </div>
              {[
                ["Included", q.inc],
                ["Earliest date", q.date],
                ["Reviews", q.rev],
              ].map(([k, v]) => (
                <div key={k} className="text-sm leading-[1.55]">
                  <span className={cn(mono, "text-[11px] text-muted")}>{k}</span>
                  <br />
                  {v}
                </div>
              ))}
              <Pill on={on} onClick={() => setChosen(i)} className="mt-auto">
                {on ? "Chosen" : "Choose this quote"}
              </Pill>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-3.5 min-h-[21px] text-sm font-bold text-green" aria-live="polite">
        {chosen >= 0 && `${quotes[chosen].n} chosen. We book it on a day with no guests, confirm access and send you completion photos.`}
      </p>
    </>
  );
}

/** FAQ list with a category filter. */
export function FaqFilter() {
  const [cat, setCat] = useState<FaqCat>("All");
  const shown = cat === "All" ? faq : faq.filter((q) => q.cat === cat);
  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={cn(mono, "m-0 mb-2.5 text-brand")}>FAQ</p>
          <h2 className="m-0 text-[30px] leading-[1.12] font-extrabold tracking-[-1.2px] md:text-[40px]">Questions hosts ask</h2>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter questions">
          {faqCats.map((c) => (
            <Pill key={c} on={cat === c} onClick={() => setCat(c)}>
              {c}
            </Pill>
          ))}
        </div>
      </div>
      <div className="border-t-2 border-ink">
        {shown.map((q) => (
          <div key={q.q} className="grid grid-cols-1 gap-x-10 gap-y-2.5 border-b border-[#D9D4CB] py-[22px] md:grid-cols-2">
            <h3 className="m-0 text-lg leading-[1.4] font-extrabold">
              <span className={cn(mono, "mb-1.5 block text-[11px] text-brand")}>{q.cat}</span>
              {q.q}
            </h3>
            <p className="m-0 text-[15px] leading-[1.65] text-body">{q.a}</p>
          </div>
        ))}
      </div>
    </>
  );
}
