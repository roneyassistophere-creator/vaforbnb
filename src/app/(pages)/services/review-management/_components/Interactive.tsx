"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { replies, stays } from "../content";

export function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
            fill={i <= n ? "#F0595A" : "#E2E6EA"}
          />
        </svg>
      ))}
    </span>
  );
}

/** Same 3-star review, defensive vs professional reply. */
export function ReplySimulator() {
  const [mode, setMode] = useState<"good" | "bad">("good");
  const r = replies[mode];
  const good = mode === "good";

  return (
    <>
      <div className="mx-auto mb-11 max-w-[760px] text-center">
        <p className="m-0 mb-3.5 text-[13px] font-extrabold text-coral-200">How we reply to a bad review</p>
        <h2 className="m-0 mb-4 text-[32px] leading-[1.08] font-extrabold tracking-[-1.6px] text-white md:text-[44px]">
          Same review. Two replies. Which would you book?
        </h2>
        <div className="mt-3 inline-flex flex-wrap gap-1 rounded-full bg-ink-hover p-1" role="group" aria-label="Choose reply style">
          {(["bad", "good"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={mode === k}
              onClick={() => setMode(k)}
              className={cn(
                "min-h-[44px] cursor-pointer rounded-full border-none px-[18px] text-sm font-bold",
                mode === k ? "bg-white text-ink" : "bg-transparent text-white",
              )}
            >
              {replies[k].label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2" aria-live="polite">
        <div className="rounded-[22px] bg-white p-7 text-ink">
          <div className="mb-2.5">
            <Stars n={3} size={20} />
          </div>
          <p className="m-0 mb-5 text-lg leading-normal font-semibold">
            “Great location, but the oven was dirty and the shower was barely warm.”
          </p>
          <div
            className={cn(
              "rounded-[14px] border-[1.5px] p-[18px]",
              good ? "border-green bg-green-100" : "border-brand bg-[#FBE3E3]",
            )}
          >
            <p className="m-0 mb-2 text-[13px] font-extrabold">Response from your host</p>
            <p className="m-0 text-base leading-[1.65] text-ink-hover">{r.t}</p>
          </div>
        </div>
        <div className={cn("flex flex-col gap-4 rounded-[22px] p-7", good ? "bg-[#1D3A2C]" : "bg-[#3A1F24]")}>
          <p className={cn("m-0 text-[13px] font-extrabold tracking-[1px]", good ? "text-[#7FD1A3]" : "text-coral-200")}>
            WHAT A FUTURE GUEST THINKS
          </p>
          <p className="m-0 text-[26px] leading-[1.2] font-extrabold tracking-[-0.8px] md:text-[30px]">“{r.verdict}”</p>
          {r.pts.map((p) => (
            <p key={p} className="m-0 flex gap-2.5 text-[15px] leading-[1.55] text-[#E4E9ED]">
              <span
                className={cn(
                  "flex size-[22px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold text-ink",
                  good ? "bg-[#7FD1A3]" : "bg-coral-200",
                )}
                aria-hidden="true"
              >
                {good ? "✓" : "!"}
              </span>
              {p}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}

/** Pick how the stay went; see how we'd ask for a review. */
export function StaySelector({ heading }: { heading: React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  const s = stays[idx];
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
      <div>
        {heading}
        <div className="grid gap-2" role="group" aria-label="How the stay went">
          {stays.map((x, i) => (
            <button
              key={x.t}
              type="button"
              aria-pressed={idx === i}
              onClick={() => setIdx(i)}
              className={cn(
                "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-[14px] border-[1.5px] px-5 text-left text-base font-bold text-ink",
                idx === i ? "border-ink bg-white" : "border-[#D8CFC2] bg-transparent",
              )}
            >
              {x.t}
              <span className="size-3 flex-none rounded-full" style={{ background: x.dot }} />
            </button>
          ))}
        </div>
      </div>
      <div aria-live="polite">
        <div className="rounded-[22px] bg-white p-[26px] shadow-[0_18px_44px_rgba(20,33,43,0.10)]">
          <p className="m-0 mb-1.5 text-[13px] font-extrabold text-muted">WHAT WE DO</p>
          <p className="m-0 mb-[18px] text-[17px] leading-normal font-bold">{s.do}</p>
          <div className="rounded-[16px_16px_16px_4px] bg-fog px-[18px] py-4 text-[15px] leading-[1.65] text-ink-hover">{s.msg}</div>
          <p className="m-0 mt-2.5 text-xs text-muted">Example message. Written fresh for each guest.</p>
        </div>
        <div className="mt-4 rounded-2xl bg-coral-50 px-5 py-[18px] text-[15px] leading-[1.6] text-ink-copy">
          <strong className="text-ink">Honest note:</strong> Airbnb prompts every guest to review on check-out day anyway.
          The aim isn’t to stop anyone reviewing; it’s that every guest leaves feeling heard, with any problem already
          solved.
        </div>
      </div>
    </div>
  );
}
