"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, toolSlug } from "@/content/tools/titleChecker";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { track } from "@/lib/analytics";
import { readHandoffData, writeHandoff } from "@/lib/tools/handoff";
import { descriptionHandoff, scorerPrefillHandoff, whatThisMeans, type Details, type Rules, type TitleResult } from "@/lib/tools/title-checker";
import { InfoBadge } from "../Badges";

type Result = { result: TitleResult; rules: Rules; details: Details; maxGuests: number | null } | null;
type Ctx = { result: Result; setResult: (r: Result) => void; inKit: boolean };
const Context = createContext<Ctx>({ result: null, setResult: () => {}, inKit: false });

/** Lets "What this means", the kit badge and the next-step card follow the checker. */
export function TitleCheckerResultProvider({ children }: { children: ReactNode }) {
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

export const useTitleCheckerResult = () => useContext(Context);

/** Two sentences chosen by the verdict; the server-rendered fallback is shown until there's a title. */
export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { result } = useTitleCheckerResult();
  return (
    <p className={className} aria-live="polite" data-what-this-means>
      {result && result.result.length > 0 ? whatThisMeans(result.result, result.rules) : fallback}
    </p>
  );
}

/** "Get more bookings kit · step 2", only when arriving from the kit. */
export function KitBadge({ label }: { label: string }) {
  const { inKit } = useTitleCheckerResult();
  return inKit ? (
    <InfoBadge dot="#F0595A">
      <span data-kit-badge>{label}</span>
    </InfoBadge>
  ) : null;
}

type Regular = { eyebrow: string; title: string; text: string; cta: string; secondary: { label: string; href: string } };

/**
 * In the kit: "Next in your kit: AI-ready description builder" (saves the
 * final title and details for it). Otherwise: "Check your whole listing"
 * (opens the AI-readiness scorer with the title prefilled). Both are saved on
 * this device only.
 */
export function NextStepCard({ regular }: { regular: Regular }) {
  const { result, inKit } = useTitleCheckerResult();
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const builder = toolById("ai-ready-description-builder");
  const scorer = toolById("ai-readiness-listing-scorer");
  const title = result?.result.title ?? "";

  if (inKit && builder) {
    const live = isLive(builder);
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
        <p className="eyebrow text-coral-200">{copy.next.kitEyebrow}</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">{copy.next.kitTitle}</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{live ? copy.next.kitLive : copy.next.kitSoon}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            disabled={!title}
            onClick={() => {
              if (!result) return;
              const existing = readHandoffData("listing-text", (d) => d)?.data ?? null;
              const ok = writeHandoff(descriptionHandoff(result.result.title, result.details, result.maxGuests, existing));
              track("kit_step_completed", toolSlug);
              track("next_step_clicked", toolSlug);
              if (ok && live) router.push(`${toolLink(builder)}?kit=more-bookings`);
              else setMsg(ok ? copy.next.saved : copy.storageFailed);
            }}
            className="btn btn-coral disabled:cursor-not-allowed disabled:opacity-60"
          >
            {live ? copy.next.kitCta : copy.next.kitSave} →
          </button>
          <Link href={regular.secondary.href} className="text-sm font-bold text-coral-200 underline underline-offset-2 hover:text-white" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
            {regular.secondary.label} →
          </Link>
        </div>
        {!title && <p className="m-0 mt-2 text-[13px] text-white/75">{copy.next.needTitle}</p>}
        {msg && (
          <p className="m-0 mt-3 text-sm font-bold text-white" role="status" data-next-saved>
            {msg}
          </p>
        )}
      </div>
    );
  }

  const href = scorer ? toolLink(scorer) : "/free-tools";
  const live = !!scorer && isLive(scorer);
  return (
    <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8" data-next-step="scorer">
      <p className="eyebrow text-brand">{regular.eyebrow}</p>
      <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{regular.title}</h2>
      <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{regular.text}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={live ? `${href}?from=${toolSlug}` : href}
          onClick={() => {
            if (result && title && live) writeHandoff(scorerPrefillHandoff(title, result.details));
            track("next_step_clicked", toolSlug, { type: "scorer" });
          }}
          className="btn btn-coral"
        >
          {regular.cta} →
        </a>
        <Link href={regular.secondary.href} className="text-sm font-bold text-brand underline underline-offset-2" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
          {regular.secondary.label} →
        </Link>
      </div>
    </div>
  );
}
