"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, toolSlug } from "@/content/tools/aiReadiness";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { track } from "@/lib/analytics";
import { auditHandoff, descriptionHandoff, titleHandoff, whatThisMeans, type Inputs, type Model, type Score } from "@/lib/tools/ai-readiness";
import { writeHandoff } from "@/lib/tools/handoff";
import { InfoBadge } from "../Badges";

type Result = { score: Score; inputs: Inputs; model: Model } | null;
type Ctx = { result: Result; setResult: (r: Result) => void; inKit: boolean };
const Context = createContext<Ctx>({ result: null, setResult: () => {}, inKit: false });

/** Lets "What this means", the kit badge and the next-step card follow the scorer. */
export function AiReadinessResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<Result>(null);
  const [inKit, setInKit] = useState(false);
  useEffect(() => {
    try {
      // The URL is only known in the browser.
      const k = new URLSearchParams(window.location.search).get("kit") === "more-bookings";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInKit(k);
      if (k) track("kit_started", toolSlug);
    } catch {
      // ignore
    }
  }, []);
  return <Context.Provider value={{ result, setResult, inKit }}>{children}</Context.Provider>;
}

export const useAiReadinessResult = () => useContext(Context);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { result } = useAiReadinessResult();
  return (
    <p className={className} aria-live="polite" data-what-this-means>
      {result ? whatThisMeans(result.score, result.model) : fallback}
    </p>
  );
}

export function KitBadge({ label }: { label: string }) {
  const { inKit } = useAiReadinessResult();
  return inKit ? <InfoBadge dot="#F0595A">{label}</InfoBadge> : null;
}

/** "Send to the description builder": saves the text and facts on this device, then opens the builder if it's live. */
function SendToBuilder({ className }: { className?: string }) {
  const { result } = useAiReadinessResult();
  const [msg, setMsg] = useState("");
  const builder = toolById("ai-ready-description-builder");
  return (
    <span className="grid gap-1">
      <button
        type="button"
        className={className}
        onClick={() => {
          if (!result) return;
          const ok = writeHandoff(descriptionHandoff(result.inputs, result.score));
          track("sent_to_description_builder", toolSlug);
          if (ok && builder && isLive(builder)) window.location.href = toolLink(builder);
          else setMsg(ok ? copy.handoff.builderSaved : copy.storageFailed);
        }}
        disabled={!result}
      >
        {copy.handoff.toBuilder} →
      </button>
      {msg && (
        <span className="text-[13px] font-semibold" role="status">
          {msg}
        </span>
      )}
    </span>
  );
}

type Regular = { eyebrow: string; title: string; text: string; cta: string; href: string };

/** In the kit: "Next in your kit: Airbnb title checker" (passes the title across). Otherwise the free audit. */
export function NextStepCard({ regular }: { regular: Regular }) {
  const { result, inKit } = useAiReadinessResult();
  const [share, setShare] = useState(false);
  const [saved, setSaved] = useState(false);
  const checker = toolById("airbnb-title-checker");

  if (inKit && checker) {
    const live = isLive(checker);
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
        <p className="eyebrow text-coral-200">Get more bookings kit · step 2</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">Next in your kit: Airbnb title checker</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">
          {live ? "It picks up your title, so you can test better versions straight away." : "Coming soon. Your title is saved on this device, ready for it to import."}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={`${toolLink(checker)}${live ? "?kit=more-bookings" : ""}`}
            onClick={() => {
              if (result) setSaved(writeHandoff(titleHandoff(result.inputs)));
              track("kit_step_completed", toolSlug);
              track("next_step_clicked", toolSlug);
            }}
            className="btn btn-coral"
          >
            {live ? "Continue to the title checker" : "Save my title for the title checker"} →
          </a>
          <SendToBuilder className="cursor-pointer border-none bg-transparent p-0 text-left text-sm font-bold text-coral-200 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60" />
        </div>
        {saved && <p className="m-0 mt-2 text-sm font-bold text-white">Saved.</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-[20px] bg-violet-50 p-6 md:p-8" data-next-step="audit">
      <p className="eyebrow text-violet">{regular.eyebrow}</p>
      <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{regular.title}</h2>
      <p className="m-0 mb-4 flex-1 text-[15px] leading-[1.6] text-ink-copy">{regular.text}</p>
      {result && (
        <label className="mb-4 flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-[1.5] text-ink">
          <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-0.5 size-5 flex-none accent-ink" />
          <span>{copy.handoff.auditShare}</span>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={regular.href}
          onClick={() => {
            if (result && share) writeHandoff(auditHandoff(result.inputs, result.score));
            track("next_step_clicked", toolSlug);
          }}
          className="btn btn-violet"
        >
          {regular.cta} →
        </a>
        <SendToBuilder className="cursor-pointer border-none bg-transparent p-0 text-left text-sm font-bold text-violet underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60" />
      </div>
    </div>
  );
}
