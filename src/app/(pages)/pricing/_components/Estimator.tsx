"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { formatMoney, prices, showPrice, PRICE_PLACEHOLDER, type PriceKey } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { SmartLink } from "@/components/ui/SmartLink";
import { addOns } from "../content";

const RUN_OPTS = [
  { key: "full", t: "Full Run package", s: "Everything for daily operations" },
  { key: "guest", t: "Guest communication only", s: "Just the messages" },
] as const;

export function Estimator() {
  const [props, setProps] = useState(2);
  const [run, setRun] = useState<"full" | "guest">("full");
  const [add, setAdd] = useState<PriceKey[]>([]);

  const runP = run === "full" ? prices.run : prices.guestOnly;
  const chosen = addOns.filter((a) => add.includes(a.key));
  const allSet = [runP, ...chosen.map((a) => prices[a.key])].every((n) => n > 0);

  let monthly = runP * props;
  let oneOff = 0;
  chosen.forEach((a) => {
    if (a.type === "monthly") monthly += prices[a.key];
    else oneOff += prices[a.key];
  });

  const lines = [
    { t: `${run === "full" ? "Run package" : "Guest communication"} × ${props}`, v: runP > 0 ? formatMoney(runP * props) : PRICE_PLACEHOLDER },
    ...chosen.map((a) => ({ t: a.t + (a.type === "oneoff" ? " (one-off)" : ""), v: showPrice(prices[a.key]) })),
  ];
  const oneOffLabel = oneOff > 0 ? formatMoney(oneOff) : chosen.some((a) => a.type === "oneoff") ? PRICE_PLACEHOLDER : "£0";

  const quoteHref = `mailto:${brand.contact.email}?subject=${encodeURIComponent("Exact quote request")}&body=${encodeURIComponent(
    `Properties: ${props}\nDaily operations: ${run === "full" ? "Full Run package" : "Guest communication only"}\nAdd-ons: ${chosen.map((a) => a.t).join(", ") || "none"}\n`,
  )}`;

  return (
    <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="card p-6 md:p-[30px]">
        <p className="m-0 mb-3 text-[15px] font-extrabold" id="props-label">
          1. How many properties?
        </p>
        <div className="mb-7 flex flex-wrap items-center gap-3.5" role="group" aria-labelledby="props-label">
          <button
            type="button"
            aria-label="Fewer properties"
            onClick={() => setProps((n) => Math.max(1, n - 1))}
            className="size-11 cursor-pointer rounded-xl border border-line-strong bg-white text-xl font-bold text-ink"
          >
            −
          </button>
          <span className="font-jakarta min-w-[60px] text-center text-[34px] font-extrabold" aria-live="polite">
            {props}
          </span>
          <button
            type="button"
            aria-label="More properties"
            onClick={() => setProps((n) => Math.min(50, n + 1))}
            className="size-11 cursor-pointer rounded-xl border border-line-strong bg-white text-xl font-bold text-ink"
          >
            +
          </button>
          <span className="text-sm text-muted">
            {props === 1 ? "property" : props >= 20 ? "properties · ask about a custom quote" : "properties"}
          </span>
        </div>

        <p className="m-0 mb-3 text-[15px] font-extrabold">2. Daily operations</p>
        <div className="mb-7 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {RUN_OPTS.map((o) => {
            const on = run === o.key;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={on}
                onClick={() => setRun(o.key)}
                className={cn(
                  "flex min-h-[76px] cursor-pointer flex-col items-start gap-1 rounded-[14px] border-[1.5px] p-4 text-left text-ink",
                  on ? "border-coral bg-coral-50" : "border-linen bg-white",
                )}
              >
                <span className="text-[15px] font-extrabold">{o.t}</span>
                <span className="text-[13px] text-muted">{o.s}</span>
              </button>
            );
          })}
        </div>

        <p className="m-0 mb-3 text-[15px] font-extrabold">3. Add growth and systems</p>
        <div className="grid gap-2">
          {addOns.map((a) => {
            const on = add.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => setAdd((cur) => (on ? cur.filter((x) => x !== a.key) : [...cur, a.key]))}
                className={cn(
                  "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left text-ink",
                  on ? "border-ink bg-sand" : "border-linen bg-white",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-5 flex-none items-center justify-center rounded-md border-[1.5px] text-xs text-white",
                      on ? "border-ink bg-ink" : "border-line-strong bg-white",
                    )}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">{a.t}</span>
                    <span className="block text-xs text-muted">{a.s}</span>
                  </span>
                </span>
                <span className="text-[13px] font-extrabold whitespace-nowrap">
                  {showPrice(prices[a.key])}
                  {a.type === "monthly" ? "/mo" : " one-off"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[20px] bg-ink p-6 text-white md:sticky md:top-6 md:p-[30px]" aria-live="polite">
        <p className="m-0 mb-[18px] text-xs font-extrabold tracking-[1px] text-faint uppercase">Your estimate</p>
        <div className="mb-[18px] grid gap-3 border-b border-night-2 pb-[18px]">
          {lines.map((l) => (
            <div key={l.t} className="flex justify-between gap-3 text-sm">
              <span className="text-mist">{l.t}</span>
              <span className="font-bold">{l.v}</span>
            </div>
          ))}
        </div>
        <p className="m-0 mb-1 text-[13px] text-faint">Monthly</p>
        <p className="font-jakarta m-0 mb-3 text-[44px] font-extrabold tracking-[-1.5px]">
          {allSet ? formatMoney(monthly) : PRICE_PLACEHOLDER}
        </p>
        <div className="mb-1.5 flex justify-between gap-3 text-sm">
          <span className="text-mist">One-off set-up</span>
          <span className="font-bold">{oneOffLabel}</span>
        </div>
        <div className="mb-[22px] flex justify-between gap-3 text-sm">
          <span className="text-mist">Per property per month</span>
          <span className="font-bold">{allSet ? formatMoney(monthly / props) : PRICE_PLACEHOLDER}</span>
        </div>
        <SmartLink href={quoteHref} className="btn btn-coral mb-3 w-full">
          Get my exact quote
        </SmartLink>
        <p className="m-0 text-xs leading-normal text-faint">
          {allSet
            ? "Estimate only. Your exact quote depends on property size, booking volume and channels."
            : "Prices are being finalised. Book a call and we’ll give you an exact quote."}
        </p>
      </div>
    </div>
  );
}
