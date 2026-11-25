"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toolSlug } from "@/content/tools/photoShotList";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { track } from "@/lib/analytics";
import { makeHandoff, writeHandoff } from "@/lib/tools/handoff";
import { whatThisMeans, type Rules, type ShotList } from "@/lib/tools/photo-shot-list";
import { InfoBadge } from "../Badges";

type Result = { list: ShotList; rules: Rules; count: number; guestTypes: string[]; bedrooms: number } | null;
type Ctx = { result: Result; setResult: (r: Result) => void; inKit: boolean };
const Context = createContext<Ctx>({ result: null, setResult: () => {}, inKit: false });

/** Lets "What this means", the kit badge and the next-step card follow the planner. */
export function PhotoResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<Result>(null);
  const [inKit, setInKit] = useState(false);
  useEffect(() => {
    try {
      // The URL is only known in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInKit(new URLSearchParams(window.location.search).get("kit") === "more-bookings");
    } catch {
      // ignore
    }
  }, []);
  return <Context.Provider value={{ result, setResult, inKit }}>{children}</Context.Provider>;
}

export const usePhotoResult = () => useContext(Context);

/** Two sentences (plus the honesty line when an honesty shot was added); the server fallback until there's a list. */
export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { result } = usePhotoResult();
  const lines = result && result.count > 0 ? whatThisMeans(result.list, result.rules) : [fallback];
  return (
    <div aria-live="polite" data-what-this-means>
      {lines.map((l) => (
        <p key={l} className={className}>
          {l}
        </p>
      ))}
    </div>
  );
}

export function KitBadge({ label }: { label: string }) {
  const { inKit } = usePhotoResult();
  return inKit ? (
    <InfoBadge dot="#F0595A">
      <span data-kit-badge>{label}</span>
    </InfoBadge>
  ) : null;
}

type Regular = { eyebrow: string; title: string; text: string; cta: string; href: string };
type KitCopy = { eyebrow: string; title: string; live: string; soon: string; cta: string; save: string; saved: string };

/**
 * In the kit: "Next in your kit: Long-stay discount calculator" (passes only
 * the shared basics). Otherwise: "Want us to plan your shoot and write your
 * captions?" (Listing optimisation).
 */
export function NextStepCard({ regular, kit }: { regular: Regular; kit: KitCopy }) {
  const { result, inKit } = usePhotoResult();
  const [msg, setMsg] = useState("");
  const next = toolById("long-stay-discount-calculator");

  if (inKit && next) {
    const live = isLive(next);
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
        <p className="eyebrow text-coral-200">{kit.eyebrow}</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">{kit.title}</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{live ? kit.live : kit.soon}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={`${toolLink(next)}${live ? "?kit=more-bookings" : ""}`}
            onClick={(e) => {
              // Only the shared basics: bedrooms and who stays. No captions, notes or other facts.
              const ok = writeHandoff(makeHandoff("kit-basics", toolSlug, { bedrooms: result?.bedrooms ?? null, guestTypes: result?.guestTypes ?? [] }));
              track("kit_step_completed", toolSlug);
              track("next_step_clicked", toolSlug, { type: "kit" });
              if (!live) {
                e.preventDefault();
                setMsg(ok ? kit.saved : "");
              }
            }}
            className="btn btn-coral"
            data-kit-next
          >
            {live ? kit.cta : kit.save} →
          </a>
          <Link href={regular.href} className="text-sm font-bold text-coral-200 underline underline-offset-2 hover:text-white" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
            {regular.cta} →
          </Link>
        </div>
        {msg && (
          <p className="m-0 mt-3 text-sm font-bold text-white" role="status" data-next-saved>
            {msg}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8" data-next-step="service">
      <p className="eyebrow text-brand">{regular.eyebrow}</p>
      <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{regular.title}</h2>
      <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{regular.text}</p>
      <div>
        <Link href={regular.href} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
          {regular.cta} →
        </Link>
      </div>
    </div>
  );
}
