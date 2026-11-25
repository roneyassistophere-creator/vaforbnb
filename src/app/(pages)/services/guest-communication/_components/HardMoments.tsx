"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Kicker } from "@/components/service/ServiceBlocks";
import { cases } from "../content";

export function HardMoments() {
  const [picked, setPicked] = useState(0);
  const c = cases[picked];

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] md:gap-12">
      <div>
        <Kicker className="bg-white">The hard moments</Kicker>
        <h2 className="h2">Difficult conversations we’ve handled</h2>
        <p className="lead mb-7">Anyone can share a Wi-Fi password. The value is in the difficult moments.</p>
        <div className="grid gap-2" role="tablist" aria-label="Example situations">
          {cases.map((x, i) => (
            <button
              key={x.t}
              type="button"
              role="tab"
              id={`case-tab-${i}`}
              aria-selected={picked === i}
              aria-controls="case-panel"
              onClick={() => setPicked(i)}
              className={cn(
                "min-h-12 cursor-pointer rounded-xl border-[1.5px] px-[18px] text-left text-[15px] font-bold",
                picked === i ? "border-ink bg-ink text-white" : "border-[#E2DCD0] bg-white text-ink",
              )}
            >
              {x.t}
            </button>
          ))}
        </div>
      </div>
      <div id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${picked}`} className="rounded-[22px] bg-white p-7 md:p-9">
        <h3 className="m-0 mb-6 text-[26px] font-extrabold tracking-[-0.6px]">{c.t}</h3>
        <dl className="m-0 grid gap-5">
          {[
            { k: "Situation", v: c.s, cls: "text-muted", strong: false },
            { k: "What we did", v: c.a, cls: "text-brand", strong: false },
            { k: "Outcome", v: c.o, cls: "text-green", strong: true },
          ].map((row) => (
            <div key={row.k} className="grid grid-cols-1 gap-1 md:grid-cols-[120px_minmax(0,1fr)] md:gap-4">
              <dt className={cn("pt-[3px] text-xs font-extrabold tracking-[1px] uppercase", row.cls)}>{row.k}</dt>
              <dd className={cn("m-0 text-base leading-[1.6]", row.strong && "font-bold")}>{row.v}</dd>
            </div>
          ))}
        </dl>
        <p className="m-0 mt-7 border-t border-line-4 pt-[18px] text-[13px] text-muted">
          Structure only. Replace with a real anonymised case and a blurred chat screenshot before publishing.
        </p>
      </div>
    </div>
  );
}
