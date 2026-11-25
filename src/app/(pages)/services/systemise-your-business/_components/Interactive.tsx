"use client";

import { useState, type ReactNode } from "react";
import { showPrice } from "@/config/pricing";
import { cn } from "@/lib/cn";
import {
  blockLines,
  docs,
  faq,
  flow,
  folders,
  meterTasks,
  months,
  options,
  parts,
  simRows,
  simText,
  trainingWeeks,
} from "../content";

/* Paper / binder style: white "paper" with soft shadow on a warm cream page. */
const paper ="rounded-[4px_14px_14px_14px] bg-white shadow-[0_1px_0_#E2DCD0,0_24px_60px_rgba(20,33,43,0.10)]";

/** Hero binder: pick a sample SOP from the left rail. */
export function SopViewer() {
  const [idx, setIdx] = useState(0);
  const d = docs[idx];
  return (
    <div className="flex flex-wrap items-stretch">
      <div className="box-border max-w-none flex-[1_1_260px] rounded-t-2xl bg-ink px-4 py-[22px] text-white md:max-w-[300px] md:rounded-l-2xl md:rounded-tr-none">
        <p className="m-0 mb-3.5 px-2 text-[11px] font-extrabold tracking-[1.4px] text-faint">SOP LIBRARY · PREVIEW</p>
        <div className="grid gap-1">
          {docs.map((x, i) => (
            <button
              key={x.code}
              type="button"
              aria-pressed={idx === i}
              onClick={() => setIdx(i)}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-2.5 rounded-[10px] border-none px-3 text-left text-sm font-bold",
                idx === i ? "bg-ink-hover text-white" : "bg-transparent text-mist",
              )}
            >
              <span className="size-2 flex-none rounded-sm" style={{ background: x.c }} />
              {x.t}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          paper,
          "relative box-border min-w-0 flex-[999_1_560px] rounded-b-2xl px-6 py-9 md:rounded-l-none md:rounded-r-2xl md:px-10",
        )}
        aria-live="polite"
      >
        <div className="absolute top-10 left-3.5 hidden gap-[70px] md:grid" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-4 rounded-full bg-sand shadow-[inset_0_2px_3px_rgba(20,33,43,0.25)]" />
          ))}
        </div>
        <div className="md:pl-[22px]">
          <div className="mb-2.5 flex flex-wrap justify-between gap-3 text-xs font-bold text-muted">
            <span>
              {d.code} · {d.area}
            </span>
            <span>Version [1.2] · Updated [date]</span>
          </div>
          <h2 className="m-0 mb-2 font-dmserif text-[32px] leading-[1.1] font-normal md:text-[38px]">{d.t}</h2>
          <p className="m-0 mb-[22px] text-[15px] leading-[1.6] text-body">
            <strong className="text-ink">Purpose:</strong> {d.p}
          </p>
          <div className="mb-[22px] grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {d.meta.map((m) => (
              <div key={m.k} className="rounded-[10px] bg-sand px-3.5 py-3">
                <p className="m-0 mb-0.5 text-[11px] font-extrabold tracking-[1px] text-muted">{m.k}</p>
                <p className="m-0 text-sm font-bold">{m.v}</p>
              </div>
            ))}
          </div>
          <ol className="m-0 mb-[22px] grid list-none gap-2.5 p-0">
            {d.steps.map((t, i) => (
              <li key={t} className="flex gap-3.5 text-[15px] leading-normal">
                <span className="flex size-7 flex-none items-center justify-center rounded-full bg-ink text-[13px] font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="pt-[3px]">{t}</span>
              </li>
            ))}
          </ol>
          <div className="flex gap-3.5 rounded-xl bg-coral-50 px-[18px] py-4">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
              <path d="M12 3l10 18H2z" fill="none" stroke="#B8383A" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M12 10v5M12 18h.01" stroke="#B8383A" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <p className="m-0 text-sm leading-[1.55]">
              <strong>Escalate to the host if:</strong> {d.e}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A year with and without SOPs, as a 12-month grid. */
export function VaChangeSim() {
  const [mode, setMode] = useState<"without" | "with">("without");
  const cell = (k: string) =>
    k === "t"
      ? { cls: "bg-coral text-ink", l: "TRAIN" }
      : k === "w"
        ? { cls: "bg-[#5E8C7E] text-white", l: "" }
        : k === "y"
          ? { cls: "bg-sand text-ink", l: "YOU" }
          : { cls: "bg-transparent", l: "" };
  const t = simText[mode];
  return (
    <>
      <div className="mb-7 inline-flex gap-1 rounded-xl bg-night-field p-1" role="group" aria-label="Compare">
        {(["without", "with"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={mode === k}
            onClick={() => setMode(k)}
            className={cn(
              "min-h-[44px] cursor-pointer rounded-[9px] border-none px-5 text-sm font-bold",
              mode === k ? "bg-coral text-ink" : "bg-transparent text-white",
            )}
          >
            {k === "without" ? "Without SOPs" : "With SOPs"}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[20px] bg-night-field p-7">
        <div className="min-w-[760px]" aria-hidden="true">
          <div className="mb-2.5 grid grid-cols-[120px_repeat(12,minmax(0,1fr))] gap-1 text-[11px] font-bold text-faint">
            <span />
            {months.map((m, i) => (
              <span key={i} className="text-center">
                {m}
              </span>
            ))}
          </div>
          {simRows[mode].map((r) => (
            <div key={r.t} className="mb-1.5 grid grid-cols-[120px_repeat(12,minmax(0,1fr))] items-center gap-1">
              <span className="text-[13px] font-bold">{r.t}</span>
              {r.p.split(" ").map((k, i) => {
                const c = cell(k);
                return (
                  <span key={i} className={cn("flex h-[34px] items-center justify-center rounded-md text-[10px] font-extrabold", c.cls)}>
                    {c.l}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-[18px] flex flex-wrap gap-[18px] text-[13px] text-mist">
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded bg-coral" />
            Training
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded bg-[#5E8C7E]" />
            Working independently
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded bg-sand" />
            Your time spent training
          </span>
        </div>
      </div>
      <p className="m-0 mt-[22px] max-w-[820px] text-[17px] leading-[1.6]" aria-live="polite">
        <strong className="text-coral-200">{t.h}</strong> {t.t}
      </p>
    </>
  );
}

/** Folder tabs for the SOP library. */
export function LibraryFolders() {
  const [idx, setIdx] = useState(0);
  const f = folders[idx];
  return (
    <>
      <div className="flex flex-wrap items-end gap-1" role="tablist" aria-label="Library areas">
        {folders.map((x, i) => {
          const on = idx === i;
          return (
            <button
              key={x.t}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="folder-panel"
              onClick={() => setIdx(i)}
              className={cn("min-h-[44px] cursor-pointer rounded-t-[10px] border-none px-3.5 text-[13px] font-extrabold", !on && "translate-y-1")}
              style={{ background: on ? "#FFFFFF" : x.c, color: on ? "#14212B" : x.f }}
            >
              {x.t}
            </button>
          );
        })}
      </div>
      <div
        id="folder-panel"
        role="tabpanel"
        className={cn(paper, "grid grid-cols-1 gap-9 rounded-[0_14px_14px_14px] p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:p-9")}
      >
        <div>
          <p className="m-0 mb-1.5 text-xs font-extrabold tracking-[1.2px] text-muted">FOLDER {String(idx + 1).padStart(2, "0")}</p>
          <p className="m-0 mb-3 font-dmserif text-4xl leading-[1.1]">{f.t}</p>
          <p className="m-0 text-[15px] leading-[1.6] text-body">{f.d}</p>
        </div>
        <ul className="m-0 grid list-none gap-2 p-0">
          {f.items.map((i) => (
            <li key={i} className="flex items-center gap-3.5 rounded-[10px] bg-sand px-4 py-3.5">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                <path d="M6 3h9l4 4v14H6z" fill="none" stroke="#14212B" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 12h7M9 16h5" stroke="#B8383A" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="text-[15px] font-bold">{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Tap a part to highlight it on the SOP skeleton. */
export function Anatomy({ heading }: { heading: ReactNode }) {
  const [part, setPart] = useState(4);
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
      <div>
        {heading}
        <div className="mt-[26px] grid gap-1.5">
          {parts.map((p, i) => {
            const on = part === i;
            return (
              <button
                key={p.t}
                type="button"
                aria-pressed={on}
                onClick={() => setPart(i)}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3.5 rounded-[10px] border-[1.5px] px-3.5 text-left text-ink",
                  on ? "border-coral bg-coral-50" : "border-[#E2DCD0] bg-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-[26px] flex-none items-center justify-center rounded-full text-xs font-extrabold",
                    on ? "bg-coral text-ink" : "bg-ink text-white",
                  )}
                >
                  {i + 1}
                </span>
                <strong className="w-[130px] flex-none text-[15px]">{p.t}</strong>
                <span className="text-sm text-body max-sm:hidden">{p.d}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={cn(paper, "relative p-[30px]")} aria-hidden="true">
        {blockLines.map((ls, i) => {
          const on = part === i;
          return (
            <div
              key={i}
              className={cn("mb-2.5 flex items-center gap-3 rounded-[10px] p-2", on ? "bg-coral-50 outline-2 outline-coral" : "bg-transparent")}
            >
              <span
                className={cn(
                  "flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] font-extrabold text-ink",
                  on ? "bg-coral" : "bg-[#E2DCD0]",
                )}
              >
                {i + 1}
              </span>
              <div className="grid flex-1 gap-[5px]">
                {ls.map(([h, w], j) => (
                  <span
                    key={j}
                    className="block rounded-[3px]"
                    style={{
                      height: h,
                      width: w,
                      background: on ? (i === 5 ? "#F3B1B2" : "#E4A3A4") : i === 0 ? "#14212B" : "#E6E1D6",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Ready-made / tailored / custom, with the matching delivery steps. */
export function OptionsFlow() {
  const [idx, setIdx] = useState(1);
  const op = options[idx];
  return (
    <>
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
        {options.map((o, i) => {
          const on = idx === i;
          return (
            <button
              key={o.k}
              type="button"
              aria-pressed={on}
              onClick={() => setIdx(i)}
              className={cn(
                "flex cursor-pointer flex-col gap-3 rounded-[18px] border-2 p-7 text-left",
                on ? "border-ink bg-ink text-white" : "border-[#E2DCD0] bg-white text-ink",
              )}
            >
              <span className={cn("text-xs font-extrabold tracking-[1.2px]", on ? "text-coral-200" : "text-brand")}>{o.k}</span>
              <span className="font-dmserif text-[30px] leading-[1.1]">{o.t}</span>
              <span className="text-[15px] leading-[1.55]">{o.d}</span>
              <span className="text-[13px] font-bold opacity-85">Best for: {o.b}</span>
              <span className="mt-1.5 text-[22px] font-extrabold">From {showPrice(o.price)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-11 rounded-[20px] bg-sand p-6 md:p-8" aria-live="polite">
        <p className="m-0 mb-5 text-lg font-extrabold">{op.flow}</p>
        <ol className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-3 md:grid-cols-6">
          {flow.map((f, i) => {
            const inc = op.steps.includes(i);
            return (
              <li key={f.t} className="transition-opacity" style={{ opacity: inc ? 1 : 0.35 }}>
                <div className={cn("mb-3 h-1.5 rounded-[3px]", inc ? "bg-coral" : "bg-[#D9D2C4]")} />
                <p className="m-0 mb-1 text-xs font-extrabold text-muted">STEP {i + 1}</p>
                <p className="m-0 mb-1 text-base font-extrabold">{f.t}</p>
                <p className="m-0 text-[13px] leading-normal text-body">{f.d}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

/** 4-week training plan slider. */
export function TrainingPlan({ heading }: { heading: ReactNode }) {
  const [week, setWeek] = useState(1);
  const wk = trainingWeeks[week - 1];
  const label = (v: number) => (v < 20 ? "Learning" : v < 50 ? "With checks" : v < 85 ? "Spot-checked" : "Independent");
  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14">
      <div>
        {heading}
        <label htmlFor="wk" className="mt-[30px] block text-sm font-bold text-body">
          Week
        </label>
        <p className="m-0 font-dmserif text-[72px] leading-none" aria-live="polite">
          {week}
          <span className="ml-3 font-sans text-xl font-extrabold">{wk.t}</span>
        </p>
        <input
          id="wk"
          type="range"
          min={1}
          max={4}
          step={1}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="h-8 w-full accent-coral"
        />
        <p className="m-0 mt-3.5 text-base leading-[1.6]">{wk.d}</p>
        <div className="mt-6 rounded-xl bg-coral-50 px-5 py-[18px] text-[15px] leading-[1.6]">
          <strong>Tip:</strong> when your VA asks something the SOP doesn’t answer, add the answer to the SOP. Within a few
          weeks, your SOPs cover almost everything.
        </div>
      </div>
      <div className={cn(paper, "p-[30px]")}>
        <p className="m-0 mb-[18px] text-[13px] font-extrabold tracking-[1px] text-muted">WHO DOES WHAT · WEEK {week}</p>
        {meterTasks.map((t, i) => {
          const v = wk.v[i];
          const done = v >= 85;
          return (
            <div key={t} className="mb-4">
              <div className="mb-1.5 flex justify-between text-sm font-bold">
                <span>{t}</span>
                <span className={done ? "text-[#2F5E50]" : "text-brand"}>{label(v)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-md bg-[#EFE9DE]">
                <div className={cn("h-3 rounded-md transition-[width]", done ? "bg-[#5E8C7E]" : "bg-coral")} style={{ width: `${v}%` }} />
              </div>
            </div>
          );
        })}
        <p className="m-0 mt-2 text-xs text-body">Bar = how independently your VA handles it</p>
      </div>
    </div>
  );
}

/** Numbered index-style FAQ accordion. */
export function FaqIndex() {
  const [open, setOpen] = useState(0);
  return (
    <div className={cn(paper, "mt-7 px-7 py-2")}>
      {faq.map((q, i) => {
        const on = open === i;
        return (
          <div key={q.q} className="border-b border-dashed border-[#D9D2C4] last:border-b-0">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`sop-faq-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex min-h-[62px] w-full cursor-pointer items-center gap-4 border-none bg-transparent p-0 text-left text-[17px] font-bold text-ink"
              >
                <span className="w-10 flex-none font-dmserif text-[22px] font-normal text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">{q.q}</span>
                <span className="flex-none text-[13px] font-extrabold text-muted" aria-hidden="true">
                  {on ? "CLOSE" : "OPEN"}
                </span>
              </button>
            </h3>
            <div id={`sop-faq-${i}`} hidden={!on} className="pb-5 pl-14 text-[15px] leading-[1.65] text-body">
              {q.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
