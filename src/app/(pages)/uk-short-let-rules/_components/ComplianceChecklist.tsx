"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { checklist } from "../content";

/** Self-assessment checklist. Nothing is saved or sent. */
export function ComplianceChecklist() {
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const done = checklist.filter((_, i) => checks[i]).length;
  const pct = Math.round((done / checklist.length) * 100);

  return (
    <div className="grid grid-cols-1 gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div>
        <p className="eyebrow">Your checklist</p>
        <h2 className="h2">How compliant are you?</h2>
        <p className="lead text-[15px]">Tick what you’ve done. Nothing is saved or sent.</p>
        <p className="m-0 mt-7 mb-2 text-[44px] font-extrabold tracking-[-1.5px]" aria-live="polite">
          {done}
          <span className="text-lg tracking-normal text-muted"> / {checklist.length}</span>
        </p>
        <div
          className="h-2 overflow-hidden rounded bg-line-3"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist progress"
        >
          <div className="h-2 rounded bg-coral transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" onClick={() => window.print()} className="btn btn-ink mt-6">
          Print or save the checklist (PDF)
        </button>
      </div>
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
        {checklist.map((t, i) => {
          const on = !!checks[i];
          return (
            <button
              key={t}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => setChecks((c) => ({ ...c, [i]: !on }))}
              className={cn(
                "flex min-h-[52px] cursor-pointer items-start gap-3 rounded-[10px] border px-3.5 py-3 text-left text-sm leading-[1.45] text-ink",
                on ? "border-sand-rule bg-cream-2" : "border-line-3 bg-white",
              )}
            >
              <span
                className={cn(
                  "flex size-5 flex-none items-center justify-center rounded-[5px] border-[1.5px] text-[13px] font-extrabold text-white",
                  on ? "border-ink bg-ink" : "border-line-box bg-white",
                )}
              >
                {on ? "✓" : ""}
              </span>
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
