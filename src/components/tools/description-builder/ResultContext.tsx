"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toolSlug } from "@/content/tools/descriptionBuilder";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { track } from "@/lib/analytics";
import { writeHandoff } from "@/lib/tools/handoff";
import { listingTextHandoff, scorerPrefillHandoff, type Facts, type SectionId } from "@/lib/tools/description-builder";
import { InfoBadge } from "../Badges";

type Result = { facts: Facts; sections: Record<SectionId, string>; title: string; meaning: string; complete: boolean } | null;
type Ctx = { result: Result; setResult: (r: Result) => void; inKit: boolean };
const Context = createContext<Ctx>({ result: null, setResult: () => {}, inKit: false });

/** Lets "What this means", the kit badge and the next-step card follow the builder. */
export function DescriptionResultProvider({ children }: { children: ReactNode }) {
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

export const useDescriptionResult = () => useContext(Context);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { result } = useDescriptionResult();
  return (
    <p className={className} aria-live="polite" data-what-this-means>
      {result && result.complete ? result.meaning : fallback}
    </p>
  );
}

export function KitBadge({ label }: { label: string }) {
  const { inKit } = useDescriptionResult();
  return inKit ? (
    <InfoBadge dot="#F0595A">
      <span data-kit-badge>{label}</span>
    </InfoBadge>
  ) : null;
}

type Regular = { eyebrow: string; title: string; text: string; cta: string; secondary: { label: string; href: string } };
type KitCopy = { eyebrow: string; title: string; text: string; cta: string };

/**
 * In the kit: "Next in your kit: Photo shot list planner" (passes the rooms,
 * outdoor space, workspace and standout feature). Otherwise: "Score this
 * description" (the scorer opens with everything prefilled).
 */
export function NextStepCard({ regular, kit }: { regular: Regular; kit: KitCopy }) {
  const { result, inKit } = useDescriptionResult();
  const planner = toolById("photo-shot-list-planner");
  const scorer = toolById("ai-readiness-listing-scorer");

  if (inKit && planner) {
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
        <p className="eyebrow text-coral-200">{kit.eyebrow}</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">{kit.title}</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{kit.text}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={`${toolLink(planner)}${isLive(planner) ? "?kit=more-bookings" : ""}`}
            onClick={() => {
              if (result) writeHandoff(listingTextHandoff(result.facts, result.sections, result.title));
              track("kit_step_completed", toolSlug);
              track("next_step_clicked", toolSlug, { type: "kit" });
            }}
            className="btn btn-coral"
            data-kit-next
          >
            {kit.cta} →
          </a>
          <Link href={regular.secondary.href} className="text-sm font-bold text-coral-200 underline underline-offset-2 hover:text-white" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
            {regular.secondary.label} →
          </Link>
        </div>
      </div>
    );
  }

  const live = !!scorer && isLive(scorer);
  return (
    <div className="flex flex-col rounded-[20px] bg-violet-50 p-6 md:p-8" data-next-step="score">
      <p className="eyebrow text-violet">{regular.eyebrow}</p>
      <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{regular.title}</h2>
      <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{regular.text}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={scorer ? `${toolLink(scorer)}${live ? `?from=${toolSlug}` : ""}` : "/free-tools"}
          onClick={() => {
            if (result && live) writeHandoff(scorerPrefillHandoff(result.facts, result.sections, result.title));
            track("score_this_clicked", toolSlug);
            track("next_step_clicked", toolSlug, { type: "scorer" });
          }}
          className="btn btn-violet"
        >
          {regular.cta} →
        </a>
        <Link href={regular.secondary.href} className="text-sm font-bold text-violet underline underline-offset-2" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
          {regular.secondary.label} →
        </Link>
      </div>
    </div>
  );
}
