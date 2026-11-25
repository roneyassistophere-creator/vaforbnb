"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { audiences, faq, fit, funnel, pillarColours, pillarKeys, pillars, platforms, postRules, weeks } from "../content";

/* Bold "sticker" style: 2px ink borders and hard offset shadows. */

function Chip({ on, onClick, children, small, role }: { on: boolean; onClick: () => void; children: ReactNode; small?: boolean; role?: string }) {
  return (
    <button
      type="button"
      role={role}
      aria-pressed={role ? undefined : on}
      aria-selected={role === "tab" ? on : undefined}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border-2 border-ink font-extrabold",
        small ? "min-h-10 px-[18px] text-[13px]" : "min-h-[44px] px-[18px] text-sm",
        on ? "bg-ink text-white" : "bg-white text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** Phone frame used in the hero and the funnel. */
export function Phone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("box-border w-[270px] flex-none rounded-[44px] bg-ink p-3 md:w-[300px]", className)}>
      <div className="flex h-[600px] flex-col overflow-hidden rounded-[34px] bg-white">{children}</div>
    </div>
  );
}

/** "Is social media right for you?" picker. */
export function FitPicker() {
  const [idx, setIdx] = useState(1);
  const r = fit[idx];
  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-[18px] md:grid-cols-3">
        {fit.map((f, i) => {
          const on = idx === i;
          return (
            <button
              key={f.k}
              type="button"
              aria-pressed={on}
              onClick={() => setIdx(i)}
              className={cn(
                "flex min-h-[150px] cursor-pointer flex-col gap-2.5 rounded-3xl border-2 border-ink p-6 text-left",
                on ? "bg-ink text-white shadow-[6px_6px_0_#F0595A]" : "bg-white text-ink shadow-[4px_4px_0_#14212B]",
              )}
            >
              <span className="text-xs font-extrabold tracking-[1px]">{f.k}</span>
              <span className="font-bricolage text-2xl leading-[1.15] font-extrabold">{f.t}</span>
            </button>
          );
        })}
      </div>
      <div
        className="mt-[22px] flex flex-wrap items-start gap-5 rounded-3xl border-2 border-ink bg-white px-7 py-[26px] shadow-[6px_6px_0_#14212B]"
        aria-live="polite"
      >
        <span className="flex-none rounded-full px-3.5 py-2 text-[13px] font-extrabold" style={{ background: r.vb, color: r.vf }}>
          {r.v}
        </span>
        <p className="m-0 min-w-[260px] flex-1 text-[17px] leading-[1.6]">{r.x}</p>
      </div>
    </>
  );
}

/** Follower → booking funnel with a phone preview. */
export function Funnel({ heading }: { heading: ReactNode }) {
  const [step, setStep] = useState(0);
  const st = funnel[step];
  return (
    <div className="grid grid-cols-1 items-center gap-9 md:grid-cols-2 md:gap-14">
      <div>
        {heading}
        <div className="mt-7 grid gap-2" role="tablist" aria-label="Steps">
          {funnel.map((x, i) => {
            const on = step === i;
            return (
              <button
                key={x.t}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setStep(i)}
                className={cn(
                  "flex min-h-[58px] cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-ink px-[18px] text-left text-ink",
                  on ? "bg-coral shadow-[4px_4px_0_#14212B]" : "bg-white",
                )}
              >
                <span className="w-7 font-bricolage text-[22px] font-extrabold">{i + 1}</span>
                <span>
                  <strong className="text-base">{x.t}</strong>
                  <span className="block text-[13px] opacity-85">{x.d}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center" aria-live="polite">
        <Phone>
          <div className="flex h-full flex-col" style={{ background: st.bg }}>
            <div className="flex items-center gap-2.5 border-b border-line-4 bg-white px-[18px] py-4">
              <div className="size-8 rounded-full bg-coral" />
              <strong className="text-sm">{st.app}</strong>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
              {st.items.map((it) => (
                <div
                  key={it.t}
                  className="box-border max-w-[85%] rounded-[18px] px-4 py-3.5 text-sm leading-[1.45]"
                  style={{
                    alignSelf: it.al ?? "stretch",
                    background: it.bg,
                    color: it.fg,
                    minHeight: it.h ?? 0,
                    fontWeight: it.w,
                  }}
                >
                  {it.t}
                </div>
              ))}
            </div>
            <div className="border-t border-line-4 bg-white px-[18px] py-3.5 text-xs font-extrabold text-brand">{st.foot}</div>
          </div>
        </Phone>
      </div>
    </div>
  );
}

/** Five content pillars with example posts. */
export function Pillars() {
  const [idx, setIdx] = useState(0);
  return (
    <>
      <div className="mt-8 mb-7 flex flex-wrap gap-2" role="tablist" aria-label="Pillars">
        {pillars.map((p, i) => (
          <Chip key={p.t} role="tab" on={idx === i} onClick={() => setIdx(i)}>
            {p.t}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-live="polite">
        {pillars[idx].posts.map((p) => (
          <div key={p.h} className="overflow-hidden rounded-3xl border-2 border-ink bg-white shadow-[6px_6px_0_#14212B]">
            <div className="box-border flex h-[230px] items-center justify-center p-6 text-center" style={{ background: p.c }}>
              <span className="font-bricolage text-[26px] leading-[1.1] font-extrabold" style={{ color: p.f }}>
                {p.h}
              </span>
            </div>
            <div className="px-[18px] py-4">
              <p className="m-0 mb-1.5 text-[11px] font-extrabold tracking-[1px] text-brand">{p.fmt}</p>
              <p className="m-0 text-sm leading-normal text-body">{p.cap}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Sample month, filterable by pillar. */
export function SampleMonth() {
  const [filter, setFilter] = useState<number | "all">("all");
  return (
    <>
      <div className="mt-7 mb-[22px] flex flex-wrap gap-2" role="group" aria-label="Filter by pillar">
        <Chip small on={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        {pillarKeys.map((k, i) => (
          <Chip key={k} small on={filter === i} onClick={() => setFilter(i)}>
            {k}
          </Chip>
        ))}
      </div>
      <div className="grid gap-3">
        {weeks.map((w, wi) => (
          <div key={wi} className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[110px_repeat(3,minmax(0,1fr))]">
            <div className="flex items-center font-bricolage text-[22px] font-extrabold">Week {wi + 1}</div>
            {w.map(([p, t]) => (
              <div
                key={t}
                className="rounded-2xl border-2 border-ink px-4 py-3.5 transition-opacity"
                style={{ background: pillarColours[p], opacity: filter === "all" || filter === p ? 1 : 0.25 }}
              >
                <p className="m-0 mb-1 text-[11px] font-extrabold tracking-[0.6px] text-body uppercase">{pillarKeys[p]}</p>
                <p className="m-0 text-[15px] leading-[1.35] font-bold">{t}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/** Pick an audience; platforms are ranked to match. */
export function PlatformPicker() {
  const [aud, setAud] = useState(0);
  const rec = audiences[aud].rec;
  return (
    <>
      <div className="mt-[30px] mb-[26px] flex flex-wrap gap-2" role="group" aria-label="Audience">
        {audiences.map((a, i) => (
          <Chip key={a.t} on={aud === i} onClick={() => setAud(i)}>
            {a.t}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5" aria-live="polite">
        {platforms.map((p, i) => {
          const r = rec.indexOf(i);
          const on = r !== -1;
          const first = r === 0;
          return (
            <div
              key={p.n}
              className={cn(
                "rounded-[22px] border-2 border-ink px-[18px] py-[22px] text-ink",
                on ? (first ? "bg-coral" : "bg-white") : "bg-[#FBF6F6] opacity-70",
                on && "shadow-[5px_5px_0_#14212B]",
              )}
            >
              <p className={cn("m-0 mb-1 text-[11px] font-extrabold tracking-[1px]", on ? (first ? "text-ink" : "text-brand") : "text-muted")}>
                {on ? (first ? "START HERE" : "RECOMMENDED") : "LATER, MAYBE"}
              </p>
              <p className="m-0 mb-2.5 font-bricolage text-2xl font-extrabold">{p.n}</p>
              <p className="m-0 mb-2.5 text-[13px] leading-normal">
                <strong>Best for:</strong> {p.b}
              </p>
              <p className="m-0 text-[13px] leading-normal">
                <strong>What works:</strong> {p.w}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** "Post it, or don't?" tap-to-reveal cards. */
export function RulesQuiz() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="mt-9 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
      {postRules.map((r, i) => {
        const on = !!open[i];
        const label = r.ok === true ? "POST IT" : r.ok === null ? "ONLY WITH CONSENT" : "DON’T POST";
        const bg = on ? (r.ok === true ? "bg-[#DDF1E5]" : r.ok === null ? "bg-[#FFF4D6]" : "bg-ink") : "bg-white";
        const fg = on && r.ok === false ? "text-white" : "text-ink";
        const badge = on
          ? r.ok === true
            ? "bg-green text-white"
            : r.ok === null
              ? "bg-amber text-white"
              : "bg-coral text-ink"
          : "bg-coral-50 text-brand";
        return (
          <button
            key={r.t}
            type="button"
            aria-pressed={on}
            onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            className={cn(
              "flex min-h-[200px] cursor-pointer flex-col gap-2.5 rounded-[22px] border-2 border-ink p-[22px] text-left shadow-[4px_4px_0_#14212B]",
              bg,
              fg,
            )}
          >
            <span className={cn("self-start rounded-full px-2.5 py-[5px] text-[11px] font-extrabold tracking-[1px]", badge)}>
              {on ? label : "POST IT?"}
            </span>
            <span className="text-base leading-[1.45] font-bold">{on ? r.x : r.t}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Boxed accordion FAQ. */
export function FaqBoxes() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-[30px] grid gap-2.5">
      {faq.map((q, i) => {
        const on = open === i;
        return (
          <div
            key={q.q}
            className={cn(
              "overflow-hidden rounded-3xl border-2 border-ink",
              on ? "bg-coral-50 shadow-[6px_6px_0_#F0595A]" : "bg-white shadow-[4px_4px_0_#14212B]",
            )}
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`sfaq-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent px-[22px] text-left text-[17px] font-extrabold text-ink"
              >
                {q.q}
                <span className="flex-none font-bricolage text-[26px]" aria-hidden="true">
                  {on ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div id={`sfaq-${i}`} hidden={!on} className="px-[22px] pb-[22px] text-[15px] leading-[1.65] text-ink-prose">
              {q.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
