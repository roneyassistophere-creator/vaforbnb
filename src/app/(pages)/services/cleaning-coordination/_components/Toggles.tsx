"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { comparePairs, proofRules, shotLists, tiles } from "../content";

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex flex-wrap gap-1 rounded-[14px] p-[5px]", className)}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.key)}
            className={cn(
              "min-h-[44px] cursor-pointer rounded-[10px] border-none px-5 text-[15px] font-bold",
              on ? "bg-ink text-white" : "bg-transparent text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** "Basic forwarding vs VA for BnB" comparison. */
export function CompareToggle({ heading }: { heading: React.ReactNode }) {
  const [mode, setMode] = useState<"basic" | "va">("va");
  const va = mode === "va";
  return (
    <>
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        {heading}
        <Segmented
          label="Compare"
          className="bg-[#EDF1F4]"
          value={mode}
          onChange={setMode}
          options={[
            { key: "basic", label: "Basic forwarding" },
            { key: "va", label: brand.name },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-live="polite">
        {comparePairs.map((p) => (
          <div
            key={p[0]}
            className={cn("flex items-start gap-3.5 rounded-[18px] px-[22px] py-5", va ? "bg-[#F0F8F3]" : "bg-[#F6F8FA]")}
          >
            <span
              className={cn(
                "flex size-7 flex-none items-center justify-center rounded-full text-sm font-extrabold",
                va ? "bg-green text-white" : "bg-[#D5DADF] text-body",
              )}
              aria-hidden="true"
            >
              {va ? "✓" : "–"}
            </span>
            <span className={cn("text-base leading-normal", va ? "text-ink" : "text-body")}>{va ? p[1] : p[0]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/** Before/after photo standard with the matching photo checklist. */
export function PhotoStandard() {
  const [shot, setShot] = useState<"before" | "after">("after");
  const rows = shotLists[shot];
  const stamp = shotLists.stamps[shot];

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
      <div>
        <p className="m-0 mb-5 inline-block rounded-lg border-[1.5px] border-ink px-2.5 py-1.5 text-xs font-extrabold tracking-[1.2px] uppercase">
          Our photo and video standard
        </p>
        <h2 className="m-0 mb-4 text-[32px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[44px]">
          Two sets of evidence, every single turnover
        </h2>
        <p className="m-0 mb-7 max-w-[680px] text-lg leading-[1.65] text-body">
          <strong className="text-ink">Before</strong> shows how the guest left it, for damage and extra-cleaning claims.{" "}
          <strong className="text-ink">After</strong> shows how the next guest found it, for cleanliness complaints.
        </p>
        <Segmented
          label="Before or after photos"
          className="mb-[18px] bg-white"
          value={shot}
          onChange={setShot}
          options={[
            { key: "before", label: "Before (on arrival)" },
            { key: "after", label: "After (finished)" },
          ]}
        />
        <div className="rounded-[20px] bg-white px-[22px] py-2" aria-live="polite">
          {rows.map((r) => (
            <div key={r.a} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3.5 border-b border-line-4 py-3.5 last:border-b-0 md:grid-cols-[130px_minmax(0,1fr)]">
              <span className="text-sm font-extrabold">{r.a}</span>
              <span className="text-sm leading-normal text-ink-copy">{r.t}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-5 grid grid-cols-3 gap-2" aria-hidden="true">
          {tiles.map((p) => (
            <div
              key={p.l}
              className="relative box-border flex aspect-square items-end rounded-[14px] p-2"
              style={{ background: p.bg }}
            >
              <span className="rounded-md bg-white/90 px-[7px] py-1 text-[11px] font-bold text-ink">{p.l}</span>
              <span className="absolute top-2 right-2 rounded-[5px] bg-ink px-1.5 py-[3px] text-[10px] font-extrabold text-white">
                {stamp}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-2.5">
          {proofRules.map((r) => (
            <div key={r.h} className="rounded-2xl bg-white px-[18px] py-4">
              <p className="m-0 mb-1 text-[15px] font-extrabold">{r.h}</p>
              <p className="m-0 text-sm leading-[1.55] text-body">{r.t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
