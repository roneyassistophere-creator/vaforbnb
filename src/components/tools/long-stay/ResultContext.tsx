"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { routes } from "@/config/navigation";
import { toolSlug } from "@/content/tools/longStay";
import { track } from "@/lib/analytics";
import { InfoBadge } from "../Badges";

type Result = { meaning: string } | null;
type Ctx = { result: Result; setResult: (r: Result) => void; inKit: boolean };
const Context = createContext<Ctx>({ result: null, setResult: () => {}, inKit: false });

export function LongStayResultProvider({ children }: { children: ReactNode }) {
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

export const useLongStayResult = () => useContext(Context);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { result } = useLongStayResult();
  return (
    <p className={className} aria-live="polite" data-what-this-means>
      {result ? result.meaning : fallback}
    </p>
  );
}

export function KitBadge({ label }: { label: string }) {
  const { inKit } = useLongStayResult();
  return inKit ? (
    <InfoBadge dot="#F0595A">
      <span data-kit-badge>{label}</span>
    </InfoBadge>
  ) : null;
}

type Regular = { eyebrow: string; title: string; text: string; cta: string; href: string };
type KitDone = { eyebrow: string; title: string; text: string; hub: string; service: string; serviceHref: string };

/** In the kit (the last step): "Kit complete". Otherwise: "Want help pricing long stays?". */
export function NextStepCard({ regular, kit }: { regular: Regular; kit: KitDone }) {
  const { inKit, result } = useLongStayResult();
  const sent = useRef(false);
  useEffect(() => {
    if (inKit && result && !sent.current) {
      sent.current = true;
      track("kit_completed", toolSlug);
      track("kit_step_completed", toolSlug);
    }
  }, [inKit, result]);

  if (inKit) {
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit-complete">
        <p className="eyebrow text-coral-200">{kit.eyebrow}</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">
          <span aria-hidden="true">✓ </span>
          {kit.title}
        </h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{kit.text}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={routes.freeTools} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "hub" })}>
            {kit.hub} →
          </Link>
          <Link href={kit.serviceHref} className="text-sm font-bold text-coral-200 underline underline-offset-2 hover:text-white" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
            {kit.service} →
          </Link>
        </div>
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
