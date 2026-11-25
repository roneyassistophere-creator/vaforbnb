"use client";

import { useEffect, useState, type ReactNode } from "react";
import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import { serviceByName } from "@/content/services";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Cross, Tick } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { fitNotes, fitQuestions, hero, matchPersona, personas, type FitKey } from "../content";

const EMPTY_FIT: Record<FitKey, string> = { size: "", role: "", where: "" };

/** Hero (with "find your fit" quiz) and the persona selector, which share the selected persona. */
export function PersonaExplorer({ breadcrumbs }: { breadcrumbs: ReactNode }) {
  const [persona, setPersona] = useState(0);
  const [fit, setFit] = useState(EMPTY_FIT);

  // Deep links like /who-we-help#for-pm open the matching tab.
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#for-(.+)$/);
      if (!m) return;
      const i = personas.findIndex((p) => p.id === m[1]);
      if (i >= 0) {
        setPersona(i);
        document.getElementById("personas")?.scrollIntoView();
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const go = (i: number) => {
    setPersona(i);
    document.getElementById("personas")?.scrollIntoView({ behavior: "smooth" });
  };

  const ready = Boolean(fit.size && fit.role && fit.where);
  const idx = ready ? matchPersona(fit) : 0;
  const p = personas[persona];

  return (
    <>
      {/* HERO + FIT FINDER */}
      <section className="bg-ink text-white">
        <div className="wrap grid grid-cols-1 items-center gap-14 pt-16 pb-16 md:grid-cols-2 md:pt-[72px] md:pb-20">
          <div>
            <div className="mb-7">{breadcrumbs}</div>
            <h1 className="font-outfit m-0 mb-5 text-[40px] leading-[1.05] font-semibold tracking-[-1.8px] md:text-[54px]">
              {hero.titleStart} <span className="text-coral">{hero.titleAccent}</span>
            </h1>
            <p className="m-0 mb-[26px] text-[17px] leading-[1.65] text-mist">{hero.lead}</p>
            <div className="flex flex-wrap gap-2">
              {personas.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => go(i)}
                  className="min-h-10 cursor-pointer rounded-full border border-night-3 bg-transparent px-3.5 text-[13px] font-bold text-white hover:border-white"
                >
                  {x.tab}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-7 text-ink">
            <div className="mb-[18px] flex items-center justify-between gap-3">
              <h2 className="font-outfit m-0 text-[22px] font-semibold tracking-[-0.5px]">Find your fit in 3 taps</h2>
              <button
                type="button"
                onClick={() => setFit(EMPTY_FIT)}
                className="min-h-9 cursor-pointer rounded-[10px] border-none bg-fog px-3 text-[13px] font-bold text-ink"
              >
                Reset
              </button>
            </div>
            {fitQuestions.map((q) => (
              <fieldset key={q.key} className="m-0 mb-4 border-none p-0">
                <legend className="m-0 mb-2 p-0 text-[13px] font-extrabold text-body">{q.q}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {q.opts.map(([v, t]) => {
                    const on = fit[q.key] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setFit((f) => ({ ...f, [q.key]: v }))}
                        className={cn(
                          "min-h-[44px] cursor-pointer rounded-xl border-[1.5px] px-3.5 text-sm font-bold",
                          on ? "border-ink bg-ink text-white" : "border-line-5 bg-white text-ink",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <div className={cn("mt-1.5 rounded-2xl p-[18px]", ready ? "bg-coral-50" : "bg-cloud-2")} aria-live="polite">
              {ready ? (
                <>
                  <p className="m-0 mb-1 text-xs font-extrabold tracking-[1px] text-brand uppercase">You sound like</p>
                  <p className="font-outfit m-0 mb-1.5 text-[22px] font-semibold">{personas[idx].tab}</p>
                  <p className="m-0 mb-3.5 text-sm leading-[1.55] text-body">{fitNotes[idx]}</p>
                  <button type="button" onClick={() => go(idx)} className="btn btn-ink min-h-[44px]">
                    See how we help →
                  </button>
                </>
              ) : (
                <p className="m-0 text-sm text-muted">Answer the questions above and we’ll point you to the right section.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PERSONA SELECTOR */}
      <section className="sec md:pt-[72px]" id="personas">
        <div className="wrap">
          <div className="mb-8 text-center">
            <p className="eyebrow">Which sounds like you?</p>
            <h2 className="h2">Pick your situation</h2>
          </div>
          <div role="tablist" aria-label="Host types" className="mb-6 grid grid-cols-2 gap-2.5 md:grid-cols-6">
            {personas.map((t, i) => {
              const on = persona === i;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={on}
                  aria-controls="persona-panel"
                  onClick={() => setPersona(i)}
                  className={cn(
                    "flex min-h-[132px] cursor-pointer flex-col items-start gap-2.5 rounded-2xl border-[1.5px] px-4 py-[18px] text-left",
                    on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink",
                  )}
                >
                  <Icon name={t.icon} size={24} color={on ? "#F0595A" : "#B8383A"} />
                  <span className="text-[15px] leading-[1.25] font-extrabold">{t.tab}</span>
                  <span className="text-xs leading-[1.4] opacity-80">{t.sub}</span>
                </button>
              );
            })}
          </div>

          <div
            id="persona-panel"
            role="tabpanel"
            aria-labelledby={`tab-${p.id}`}
            className="overflow-hidden rounded-3xl border border-line"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-sand p-7 md:p-11">
                <p className="m-0 mb-2.5 text-[13px] font-extrabold text-brand">{p.tag}</p>
                <h3 className="font-outfit m-0 mb-3.5 text-[30px] leading-[1.1] font-semibold tracking-[-1px] md:text-[34px]">{p.h}</h3>
                <p className="m-0 mb-6 text-base leading-[1.65] text-body">{p.t}</p>
                <p className="m-0 mb-2.5 text-[13px] font-extrabold">What usually gets in the way</p>
                <ul className="m-0 mb-[26px] grid list-none gap-2 p-0">
                  {p.pains.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-sm leading-normal text-ink-soft">
                      <Cross className="mt-px" />
                      {x}
                    </li>
                  ))}
                </ul>
                <figure className="m-0 rounded-[14px] bg-white p-[18px]">
                  <blockquote className="m-0 mb-2 text-[15px] leading-[1.6] italic">“{p.quote}”</blockquote>
                  <figcaption className="text-xs font-bold text-subtle">{p.quoteBy}</figcaption>
                </figure>
              </div>
              <div className="p-7 md:p-11">
                <p className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[1px] text-muted uppercase">What we take on for you</p>
                <ul className="m-0 mb-7 grid list-none gap-3.5 p-0">
                  {p.take.map((x) => (
                    <li key={x.h} className="flex items-start gap-3">
                      <Tick className="mt-0.5" />
                      <span>
                        <span className="block text-[15px] font-extrabold">{x.h}</span>
                        <span className="block text-sm leading-normal text-muted">{x.t}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mb-[26px] grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="m-0 mb-2 text-[13px] font-extrabold">Services that fit</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.services.map((x) => (
                        <SmartLink
                          key={x}
                          href={anchors.service(serviceByName(x)?.id ?? "")}
                          className="rounded-full bg-ink px-3 py-[7px] text-[13px] font-bold text-white no-underline hover:bg-ink-hover hover:text-white"
                        >
                          {x}
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="m-0 mb-2 text-[13px] font-extrabold">Free tools for you</p>
                    <div className="grid gap-1.5">
                      {p.tools.map((x) => (
                        <SmartLink key={x.label} href={x.href} className="text-[13px] font-bold text-brand no-underline">
                          {x.label} →
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 border-t border-line pt-[22px]">
                  <SmartLink href={p.cta.includes("audit") ? brand.links.freeAudit : brand.links.bookCall} className="btn btn-coral">
                    {p.cta}
                  </SmartLink>
                  <span className="text-[13px] text-muted">
                    Usually starts with: <strong className="text-ink">{p.pkg}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-0 text-xs text-subtle">Quotes are placeholders: replace with real client words, shared with permission.</p>
        </div>
      </section>
    </>
  );
}
