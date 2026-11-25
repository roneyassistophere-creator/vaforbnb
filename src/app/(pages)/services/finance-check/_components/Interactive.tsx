"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { faq, reports, sheetGrids, type SheetTab } from "../content";

const fileName = brand.downloads.financeSheet.split("/").pop();

/** Hero spreadsheet window with clickable sheet tabs. */
export function SheetPreview() {
  const [tab, setTab] = useState<SheetTab>("report");
  const g = sheetGrids[tab];
  const cell = "overflow-hidden border-r border-b border-line px-2.5 py-2 text-xs text-ellipsis whitespace-nowrap";

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E2DCD0] bg-white shadow-[0_24px_60px_rgba(20,33,43,0.14)]">
      <div className="flex items-center gap-2 bg-ink px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-coral" />
        <span className="size-2.5 rounded-full bg-body" />
        <span className="size-2.5 rounded-full bg-body" />
        <span className="ml-2 truncate text-xs font-bold text-[#E4E9ED]">{fileName}</span>
      </div>
      <div className="flex flex-wrap gap-0.5 border-b border-line bg-[#FAFAFB] px-2.5" role="tablist" aria-label="Sheet tabs">
        {(Object.keys(sheetGrids) as SheetTab[]).map((k) => {
          const on = tab === k;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(k)}
              className={cn(
                "min-h-10 cursor-pointer border-x-0 border-t-0 border-b-2 border-solid bg-transparent px-3.5 text-[13px] font-bold",
                on ? "border-coral text-ink" : "border-transparent text-muted",
              )}
            >
              {sheetGrids[k].label}
            </button>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[520px] tabular-nums" role="table" aria-label={`${g.label} example`}>
          <div className="grid bg-fog" style={{ gridTemplateColumns: g.cols }} role="row">
            {g.head.map((h) => (
              <span key={h} className={cn(cell, "font-extrabold text-body")} role="columnheader">
                {h}
              </span>
            ))}
          </div>
          {g.rows.map((r, i) => (
            <div
              key={i}
              className={cn("grid", i % 2 ? "bg-[#FAFAFB]" : "bg-white")}
              style={{ gridTemplateColumns: g.cols }}
              role="row"
            >
              {r.c.map((c, j) => (
                <span key={j} className={cn(cell, r.bold ? "font-extrabold" : "font-medium")} role="cell">
                  {c || " "}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="m-0 border-t border-line px-3.5 py-2.5 text-[11px] text-muted">Example figures from the free sheet. Click the tabs.</p>
    </div>
  );
}

/** Property switcher for the sample monthly report. */
export function ReportSwitcher() {
  const [idx, setIdx] = useState(2);
  const r = reports[idx];
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="m-0 text-[28px] leading-[1.15] font-extrabold tracking-[-1px] md:text-[34px]">October, at a glance</h2>
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-fog p-1" role="group" aria-label="Choose property">
          {reports.map((x, i) => (
            <button
              key={x.t}
              type="button"
              aria-pressed={idx === i}
              onClick={() => setIdx(i)}
              className={cn(
                "min-h-[44px] cursor-pointer rounded-[9px] border-none px-4 text-sm font-bold text-ink",
                idx === i ? "bg-white shadow-sm" : "bg-transparent",
              )}
            >
              {x.t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 tabular-nums md:grid-cols-2" aria-live="polite">
        <div className="overflow-hidden rounded-[14px] border border-line">
          {r.lines.map((l) => (
            <div
              key={l.k}
              className={cn("flex justify-between gap-3 border-b border-[#F0F1F3] px-5 py-3.5 last:border-b-0", l.total ? "bg-[#FAFAFB]" : "bg-white")}
            >
              <span className={cn("text-[15px]", l.total ? "font-extrabold" : "font-medium")}>{l.k}</span>
              <span className={cn("text-[15px] font-extrabold", l.v.startsWith("(") ? "text-brand" : "text-ink")}>{l.v}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 content-start gap-3">
          <div className={cn("col-span-2 rounded-[14px] p-[22px]", r.neg ? "bg-[#FBE3E3]" : "bg-green-100")}>
            <p className={cn("m-0 mb-1.5 text-[13px] font-extrabold tracking-[1px]", r.neg ? "text-brand" : "text-green")}>
              PROFIT OR LOSS
            </p>
            <p className={cn("m-0 text-[44px] font-extrabold tracking-[-1.5px]", r.neg ? "text-brand" : "text-green")}>{r.pl}</p>
            <p className="m-0 mt-1.5 text-sm leading-normal text-ink-copy">{r.why}</p>
          </div>
          {r.kpis.map((k) => (
            <div key={k.k} className="rounded-[14px] border border-line p-[18px]">
              <p className="m-0 mb-1 text-xs font-bold text-muted">{k.k}</p>
              <p className="m-0 text-2xl font-extrabold">{k.v}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Break-even nights calculator. Runs in the browser; nothing is sent. */
export function BreakEven() {
  const [fixed, setFixed] = useState(900);
  const [net, setNet] = useState(110);
  const [varc, setVarc] = useState(25);
  const per = net - varc;
  const exact = per > 0 ? fixed / per : null;
  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  };
  const fields = [
    { label: "Fixed costs per month (£)", value: fixed, set: setFixed },
    { label: "Average net income per night (£)", value: net, set: setNet },
    { label: "Variable costs per night (£)", hint: "cleaning, laundry, consumables", value: varc, set: setVarc },
  ];

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
      <form aria-label="Break-even calculator" className="grid gap-3.5 rounded-[14px] border border-line p-6" onSubmit={(e) => e.preventDefault()}>
        {fields.map((f) => (
          <label key={f.label} className="grid gap-1.5 text-sm font-bold">
            <span>
              {f.label} {f.hint && <span className="text-[13px] font-medium text-muted">{f.hint}</span>}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={f.value}
              onChange={(e) => f.set(num(e.target.value))}
              className="field border-[1.5px] text-base font-bold tabular-nums"
            />
          </label>
        ))}
      </form>
      <div className="flex flex-col justify-center gap-2.5 rounded-[14px] bg-ink p-7 text-white" aria-live="polite">
        <p className="m-0 text-[13px] font-extrabold tracking-[1px] text-coral-200">YOU BREAK EVEN AT</p>
        <p className="m-0 text-[72px] leading-none font-extrabold tracking-[-3px] tabular-nums">
          {exact === null ? "—" : Math.ceil(exact)}
        </p>
        <p className="m-0 text-base text-[#E4E9ED]">
          {exact === null ? "Net income per night must be higher than variable costs per night." : "nights a month"}
        </p>
        <p className="m-0 mt-2.5 text-[13px] text-[#AEB9C2] tabular-nums">
          £{fixed} ÷ (£{net} − £{varc}) = {exact === null ? "no break-even" : exact.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

/** Question list on the left, answer panel on the right. */
export function FaqMasterDetail() {
  const [q, setQ] = useState(0);
  const a = faq[q];
  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="grid flex-[1_1_380px] gap-1.5" role="tablist" aria-label="Questions">
        {faq.map((x, i) => (
          <button
            key={x.q}
            type="button"
            role="tab"
            id={`fq-${i}`}
            aria-selected={q === i}
            aria-controls="fq-panel"
            onClick={() => setQ(i)}
            className={cn(
              "flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-4 py-3 text-left text-[15px] font-bold",
              q === i ? "border-ink bg-ink text-white" : "border-line bg-white text-ink",
            )}
          >
            {x.q}
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <div
        id="fq-panel"
        role="tabpanel"
        aria-labelledby={`fq-${q}`}
        className="box-border min-h-[260px] flex-[1.3_1_420px] rounded-2xl bg-sand p-6 md:p-8"
      >
        <p className="m-0 mb-3 text-xs font-extrabold tracking-[1.4px] text-brand uppercase">Answer</p>
        <h3 className="m-0 mb-3.5 text-2xl font-extrabold tracking-[-0.5px]">{a.q}</h3>
        <p className="m-0 text-base leading-[1.75] text-ink-copy">{a.a}</p>
      </div>
    </div>
  );
}
