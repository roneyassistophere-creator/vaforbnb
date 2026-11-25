"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Tick } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { whoTabs } from "../content";

export function WhoTabs() {
  const [idx, setIdx] = useState(0);
  const w = whoTabs[idx];

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {whoTabs.map((t, i) => {
          const on = idx === i;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => setIdx(i)}
              className={cn(
                "min-h-[44px] cursor-pointer rounded-full border px-[18px] text-sm font-bold",
                on ? "border-ink bg-ink text-white" : "border-sand-border bg-white text-ink",
              )}
            >
              {t.tab}
            </button>
          );
        })}
      </div>
      <div className="card grid grid-cols-1 overflow-hidden md:grid-cols-2" aria-live="polite">
        <div className="bg-sand p-7 md:p-11">
          <p className="m-0 mb-2.5 text-[13px] font-extrabold text-brand">{w.tag}</p>
          <p className="font-serif m-0 mb-4 text-[38px] leading-[1.08]">{w.h}</p>
          <p className="m-0 mb-[26px] text-base leading-[1.65] text-body">{w.t}</p>
          <SmartLink href={w.href} className="btn btn-ink">
            {w.cta}
          </SmartLink>
        </div>
        <div className="p-7 md:p-11">
          <p className="m-0 mb-[18px] text-[13px] font-extrabold tracking-[1px] text-muted uppercase">What we take on</p>
          <div className="grid gap-4">
            {w.pts.map((p) => (
              <div key={p} className="flex items-start gap-3.5">
                <Tick size={20} className="mt-0.5" />
                <span className="text-[15px] leading-[1.55] font-semibold">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
