"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { areas, bars, faq, gbp, guests, myths, otherResults, street, verdicts } from "../content";

function Seg<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full bg-fog p-1" role="group" aria-label={label}>
      {options.map(([k, t]) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className={cn(
            "cursor-pointer rounded-full border-none font-bold",
            size === "sm" ? "min-h-10 px-4 text-[13px]" : "min-h-[44px] px-5 text-sm",
            value === k ? "bg-ink text-white" : "bg-transparent text-ink",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Fav({ className }: { className?: string }) {
  return <span className={cn("inline-flex size-[26px] flex-none rounded-full", className)} />;
}

/** Hero: what a guest sees on Google, with and without SEO. */
export function SearchSimulator() {
  const [g, setG] = useState(0);
  const [mode, setMode] = useState<"with" | "without">("with");
  const guest = guests[g];
  const withSeo = mode === "with";
  const yours = { url: "yourbrand.co.uk › stays", t: guest.title, d: guest.d };
  const results = withSeo ? [otherResults[0], yours, otherResults[1]] : otherResults;

  return (
    <div className="mx-auto box-border max-w-[920px] rounded-[28px] bg-white p-5 shadow-[0_30px_80px_rgba(20,33,43,0.14)] md:p-7">
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Guest type">
        <span className="mr-1 self-center text-[13px] font-bold text-body">Guest:</span>
        {guests.map((x, i) => (
          <button
            key={x.t}
            type="button"
            aria-pressed={g === i}
            onClick={() => setG(i)}
            className={cn(
              "min-h-10 cursor-pointer rounded-full border-[1.5px] border-ink px-[18px] text-[13px] font-bold",
              g === i ? "bg-ink text-white" : "bg-white text-ink",
            )}
          >
            {x.t}
          </button>
        ))}
      </div>
      <div className="flex min-h-[54px] items-center gap-3 rounded-full border border-line-6 px-5 shadow-[0_2px_8px_rgba(20,33,43,0.06)]">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
          <circle cx="11" cy="11" r="7" fill="none" stroke="#5F6B75" strokeWidth="2" />
          <path d="M16 16l5 5" stroke="#5F6B75" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-[17px]">{guest.q}</span>
      </div>
      <div className="mt-[18px] mb-1 flex flex-wrap items-center justify-between gap-3">
        <Seg
          size="sm"
          label="Your website"
          value={mode}
          onChange={setMode}
          options={[
            ["without", "Website without SEO"],
            ["with", "Website with SEO"],
          ]}
        />
        <span className="text-xs text-muted">Illustration only. Rankings can’t be guaranteed.</span>
      </div>
      <div aria-live="polite">
        {results.map((r) => {
          const mine = r === yours;
          return (
            <div key={r.url} className={cn("border-b border-[#F0F1F3] py-4", mine && "rounded-xl bg-coral-50 px-4")}>
              <p className="m-0 flex items-center gap-2 text-[13px] text-ink-copy">
                <Fav className={mine ? "bg-coral" : "bg-line-6"} />
                {r.url}
                {mine && <span className="ml-auto text-[11px] font-extrabold text-brand">YOUR WEBSITE</span>}
              </p>
              <p className="m-0 my-1 text-xl leading-[1.3] font-semibold text-[#1A3D8F]">{r.t}</p>
              <p className="m-0 text-sm leading-[1.55] text-body">{r.d}</p>
            </div>
          );
        })}
        <div className={cn("mt-3.5 rounded-[14px] px-[18px] py-3.5 text-sm leading-[1.55] font-semibold", withSeo ? "bg-[#DDF1E5]" : "bg-fog")}>
          {withSeo
            ? "With a page built for this search, your site has a chance to appear, and the guest contacts you directly."
            : "Your site isn’t on the first page for this search. The guest books through an OTA, and you pay the commission."}
        </div>
      </div>
    </div>
  );
}

/** "Is SEO right for you yet?" portfolio slider. */
export function FitSlider() {
  const [units, setUnits] = useState(12);
  const vi = verdicts.findIndex((v) => units <= v.max);
  const v = verdicts[vi];
  const bandCols = ["#B9C1C8", "#E8B23A", "#2E8B57"];
  return (
    <div className="rounded-[20px] border border-line-2 bg-white p-6 shadow-[0_20px_50px_rgba(20,33,43,0.08)] md:p-8">
      <label htmlFor="units" className="text-sm font-bold text-body">
        How many properties do you run?
      </label>
      <p className="m-0 mt-1.5 mb-1 text-[64px] leading-none font-extrabold tracking-[-2px]" aria-live="polite">
        {units}
        <span className="text-xl font-semibold tracking-normal text-muted"> {units === 1 ? "property" : "properties"}</span>
      </p>
      <input
        id="units"
        type="range"
        min={1}
        max={30}
        step={1}
        value={units}
        onChange={(e) => setUnits(Number(e.target.value))}
        className="h-8 w-full accent-coral"
      />
      <div className="mb-[22px] flex justify-between text-xs text-muted">
        <span>1</span>
        <span>10</span>
        <span>20</span>
        <span>30+</span>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {bandCols.map((c, i) => (
          <div key={c} className="h-2.5 rounded-[5px]" style={{ background: i <= vi ? c : "#EEF0F2" }} />
        ))}
      </div>
      <div aria-live="polite">
        <p className="m-0 mb-1.5 inline-block rounded-full px-3 py-1.5 text-xs font-extrabold tracking-[1px]" style={{ background: v.bg, color: v.fg }}>
          {v.k}
        </p>
        <p className="m-0 mt-2.5 mb-2 text-2xl font-extrabold tracking-[-0.6px]">{v.h}</p>
        <p className="m-0 text-[15px] leading-[1.65] text-body">{v.t}</p>
      </div>
    </div>
  );
}

/** Shop on an unmarked street vs a signposted one. */
export function StreetCompare() {
  const [mode, setMode] = useState<"without" | "with">("without");
  const w = mode === "without";
  const st = street[mode];
  const people = w
    ? ["#9AA6AF", "#3A4650", "#3A4650", "#3A4650", "#3A4650", "#3A4650"]
    : ["#F0595A", "#F0595A", "#FFFFFF", "#F0595A", "#FFFFFF", "#F0595A"];
  return (
    <>
      <div className="mb-7 flex justify-center">
        <Seg
          label="Compare"
          value={mode}
          onChange={setMode}
          options={[
            ["without", "Without SEO"],
            ["with", "With SEO"],
          ]}
        />
      </div>
      <div className={cn("overflow-hidden rounded-[28px] px-5 pt-10 md:px-10", w ? "bg-[#E9ECEF]" : "bg-coral-50")} aria-hidden="true">
        <div className="flex h-[230px] items-end justify-center gap-[18px]">
          <div className={cn("h-[150px] w-[110px] rounded-t-[10px] max-sm:hidden", w ? "bg-line-strong" : "bg-[#F8C9CA]")} />
          <div className="relative flex h-[210px] w-[220px] flex-col items-center rounded-t-xl border-2 border-b-0 border-ink bg-white">
            <div
              className={cn(
                "-mt-[18px] rounded-[10px] px-4 py-2 text-sm font-extrabold whitespace-nowrap",
                w ? "bg-[#E9ECEF] text-faint" : "bg-coral text-ink",
              )}
            >
              {st.label}
            </div>
            <div className="mt-[22px] flex gap-2.5">
              <div className="h-[50px] w-[60px] rounded-md bg-[#DCE8EC]" />
              <div className="h-[50px] w-[60px] rounded-md bg-[#DCE8EC]" />
            </div>
            <div className="mt-auto h-[74px] w-[46px] rounded-t-md bg-ink" />
          </div>
          <div className={cn("h-[120px] w-[130px] rounded-t-[10px] max-sm:hidden", w ? "bg-[#C3CAD0]" : "bg-[#F6B9BA]")} />
          <div className="ml-5 hidden flex-col items-center gap-1.5 md:flex">
            <div className={cn("max-w-[150px] rounded-lg px-3 py-2 text-center text-xs font-extrabold text-white", w ? "bg-faint" : "bg-ink")}>
              {st.postT}
            </div>
            <div className="h-[120px] w-1.5 bg-ink" />
          </div>
        </div>
        <div className="-mx-5 flex h-[46px] items-center justify-center gap-3.5 bg-ink-copy md:-mx-10">
          {people.map((p, i) => (
            <span key={i} className="size-3.5 rounded-full" style={{ background: p }} />
          ))}
        </div>
      </div>
      <ul className="m-0 mt-6 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2" aria-live="polite">
        {st.rows.map((t) => (
          <li key={t} className={cn("flex items-start gap-3 rounded-[14px] px-[18px] py-4 text-[15px] leading-normal", w ? "bg-fog" : "bg-white")}>
            <span
              className={cn(
                "flex size-6 flex-none items-center justify-center rounded-full text-[13px] font-extrabold text-white",
                w ? "bg-faint" : "bg-green",
              )}
              aria-hidden="true"
            >
              {w ? "×" : "✓"}
            </span>
            {t}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Eight included areas, shown as a sample monthly report. */
export function IncludedAreas({ heading }: { heading: ReactNode }) {
  const [idx, setIdx] = useState(0);
  const a = areas[idx];
  const n = String(idx + 1).padStart(2, "0");
  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14">
      <div className="md:sticky md:top-6">
        {heading}
        <div className="mt-7 grid gap-2">
          {areas.map((x, i) => (
            <button
              key={x.t}
              type="button"
              aria-pressed={idx === i}
              onClick={() => setIdx(i)}
              className={cn(
                "flex min-h-[54px] cursor-pointer items-center gap-3.5 rounded-[14px] border-[1.5px] px-[18px] text-left text-[15px] font-bold",
                idx === i ? "border-ink bg-ink text-white" : "border-line-2 bg-white text-ink",
              )}
            >
              <span className="text-xs font-extrabold opacity-70">{String(i + 1).padStart(2, "0")}</span>
              {x.t}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-[20px] border border-line-2 bg-white shadow-[0_30px_70px_rgba(20,33,43,0.12)]" aria-live="polite">
        <div className="flex items-center justify-between gap-3 bg-ink px-[26px] py-[22px] text-white">
          <span className="font-extrabold">Monthly SEO report</span>
          <span className="text-xs text-mist">[Client] · [Month]</span>
        </div>
        <div className="px-[26px] py-7">
          <p className="m-0 mb-1.5 text-xs font-extrabold tracking-[1px] text-brand uppercase">
            {n} · {a.t}
          </p>
          <p className="m-0 mb-4 text-[26px] leading-[1.2] font-extrabold tracking-[-0.6px]">{a.h}</p>
          {a.pts.map((p) => (
            <div key={p} className="flex gap-3 border-t border-line-4 py-2.5 text-[15px] leading-normal">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#1F6B45" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {p}
            </div>
          ))}
          <div className="mt-6 rounded-[14px] bg-[#F7F8F9] p-[18px]">
            <p className="m-0 mb-3 text-[13px] font-bold text-body">Clicks from Google (placeholder data)</p>
            <div className="flex h-[90px] items-end gap-1.5" aria-hidden="true">
              {bars.map((b, i) => (
                <div key={i} className="flex-1 rounded-t bg-line-6" style={{ height: b }} />
              ))}
            </div>
            <p className="m-0 mt-2.5 text-xs text-muted">[Real Search Console data goes here]</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Google Business Profile eligibility quick check. */
export function GbpCheck() {
  const [idx, setIdx] = useState(0);
  const r = gbp[idx];
  return (
    <>
      <div className="grid gap-2" role="radiogroup" aria-label="What to list">
        {gbp.map((o, i) => (
          <button
            key={o.t}
            type="button"
            role="radio"
            aria-checked={idx === i}
            onClick={() => setIdx(i)}
            className={cn(
              "min-h-14 cursor-pointer rounded-[14px] border-[1.5px] px-[18px] text-left text-[15px] font-bold text-ink",
              idx === i ? "border-coral bg-coral-50" : "border-line-6 bg-white",
            )}
          >
            {o.t}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-2xl p-5" style={{ background: r.bg }} aria-live="polite">
        <p className="m-0 mb-1.5 text-lg font-extrabold" style={{ color: r.fg }}>
          {r.h}
        </p>
        <p className="m-0 text-[15px] leading-[1.6] text-ink">{r.x}</p>
      </div>
    </>
  );
}

/** Tap-to-reveal myth or fact cards. */
export function MythCards() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {myths.map((m, i) => {
        const on = !!open[i];
        const fact = m.k === "FACT";
        return (
          <button
            key={m.t}
            type="button"
            aria-pressed={on}
            onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            className={cn(
              "flex min-h-[190px] cursor-pointer flex-col gap-2.5 rounded-[20px] border-none p-[22px] text-left",
              on ? (fact ? "bg-green text-white" : "bg-ink text-white") : "bg-white text-ink",
            )}
          >
            <span
              className={cn(
                "text-xs font-extrabold tracking-[1px]",
                on ? (fact ? "text-[#BFE8CF]" : "text-coral-200") : "text-brand",
              )}
            >
              {on ? m.k : "TAP TO REVEAL"}
            </span>
            <span className="text-base leading-[1.45] font-bold">{on ? m.x : m.t}</span>
          </button>
        );
      })}
    </div>
  );
}

/** "People also ask" style accordion. */
export function PeopleAlsoAsk() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-7 overflow-hidden rounded-[20px] border border-line-2">
      {faq.map((q, i) => {
        const on = open === i;
        return (
          <div key={q.q} className="border-t border-line-2 first:border-t-0">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`paa-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex min-h-[62px] w-full cursor-pointer items-center justify-between gap-4 border-none bg-white px-[22px] text-left text-[17px] font-bold text-ink"
              >
                {q.q}
                <span
                  className={cn("flex size-[30px] flex-none items-center justify-center rounded-full text-lg font-extrabold", on ? "bg-coral" : "bg-fog")}
                  aria-hidden="true"
                >
                  {on ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div id={`paa-${i}`} hidden={!on} className="px-[22px] pb-[22px] text-[15px] leading-[1.65] text-body">
              {q.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
