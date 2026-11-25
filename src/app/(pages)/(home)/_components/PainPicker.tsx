"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import { serviceByName } from "@/content/services";
import { cn } from "@/lib/cn";
import { SmartLink } from "@/components/ui/SmartLink";
import { defaultPains, freeToolLinks, pains } from "../content";

const PACK_NAMES = [
  ["run", "Run"],
  ["grow", "Grow"],
  ["build", "Build"],
] as const;

export function PainPicker() {
  const [picked, setPicked] = useState<string[]>(defaultPains);
  const toggle = (id: string) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const sel = pains.filter((p) => picked.includes(p.id));
  const pkg = PACK_NAMES.filter(([k]) => sel.some((p) => p.pack === k))
    .map(([, n]) => n)
    .join(" + ");
  const fit: string[] = [];
  sel.forEach((p) => p.services.forEach((s) => !fit.includes(s) && fit.push(s)));
  const freeTool = sel[0]?.freeTool ?? "";

  return (
    <div className="grid grid-cols-1 items-start gap-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <p className="eyebrow">Sound familiar?</p>
        <h2 className="h2">
          Hosting shouldn’t take over <em>your life</em>
        </h2>
        <p className="lead mb-[26px]">
          You started hosting to build income, not a second full-time job. Tap what’s taking your time and we’ll
          show you where to start.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {pains.map((p) => {
            const on = picked.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(p.id)}
                className={cn(
                  "inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-[18px] text-[15px] font-semibold",
                  on ? "border-ink bg-ink text-white" : "border-sand-border bg-white text-ink",
                )}
              >
                {on ? "✓" : "+"} {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card box-border min-h-[420px] bg-cream p-8" aria-live="polite">
        {sel.length === 0 ? (
          <div className="flex h-full flex-col justify-center px-2.5 py-10 text-center">
            <p className="font-serif m-0 mb-2.5 text-[32px]">Pick one or more on the left</p>
            <p className="m-0 text-[15px] leading-[1.6] text-muted">
              We’ll show what it’s costing you, what we’d take off your plate, and a free tool you can use today.
            </p>
          </div>
        ) : (
          <>
            <p className="m-0 mb-1.5 text-xs font-extrabold tracking-[1px] text-muted uppercase">Your starting point</p>
            <p className="font-serif m-0 mb-5 text-[34px] leading-[1.1]">
              Start with: <em className="text-brand">{pkg}</em>
            </p>
            <div className="mb-[22px] grid gap-2.5">
              {sel.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-1 gap-4 rounded-[14px] border border-sand-line bg-white px-4 py-3.5 md:grid-cols-2"
                >
                  <div>
                    <p className="m-0 mb-0.5 text-xs font-bold text-subtle">What it costs you</p>
                    <p className="m-0 text-sm font-bold">{r.cost}</p>
                  </div>
                  <div>
                    <p className="m-0 mb-0.5 text-xs font-bold text-green">What changes</p>
                    <p className="m-0 text-sm font-semibold text-ink-soft">{r.fix}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="m-0 mb-2.5 text-[13px] font-extrabold">Services that fit</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {fit.slice(0, 6).map((name) => (
                <SmartLink
                  key={name}
                  href={anchors.service(serviceByName(name)?.id ?? "")}
                  className="rounded-full bg-ink px-3.5 py-2 text-[13px] font-bold text-white no-underline hover:bg-ink-hover hover:text-white"
                >
                  {name} →
                </SmartLink>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-line pt-[18px]">
              <span className="text-sm text-body">
                Free today:{" "}
                <SmartLink href={freeToolLinks[freeTool] ?? anchors.tool("")} className="link-brand">
                  {freeTool}
                </SmartLink>
              </span>
              <SmartLink href={brand.links.freeAudit} className="btn btn-coral min-h-[44px]">
                Get my free audit
              </SmartLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
