"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toolSlug } from "@/content/tools/houseRules";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { track } from "@/lib/analytics";
import { writeHandoff } from "@/lib/tools/handoff";
import { rulesHandoff, whatThisMeans, type Rules } from "@/lib/tools/house-rules";
import { InfoBadge } from "../Badges";
import { TrackedLink } from "../TrackedLink";

type Ctx = { rules: Rules | null; setRules: (r: Rules | null) => void; inKit: boolean };
const Context = createContext<Ctx>({ rules: null, setRules: () => {}, inKit: false });

/** Lets "What this means", the kit badge and the next-step card follow the generator. */
export function HouseRulesResultProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<Rules | null>(null);
  const [inKit, setInKit] = useState(false);
  useEffect(() => {
    try {
      // The URL is only known in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInKit(new URLSearchParams(window.location.search).get("kit") === "new-host");
    } catch {
      // ignore
    }
  }, []);
  return <Context.Provider value={{ rules, setRules, inKit }}>{children}</Context.Provider>;
}

export const useHouseRulesResult = () => useContext(Context);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { rules } = useHouseRulesResult();
  return (
    <p className={className} aria-live="polite">
      {rules ? whatThisMeans(rules) : fallback}
    </p>
  );
}

export function KitBadge({ label }: { label: string }) {
  const { inKit } = useHouseRulesResult();
  return inKit ? <InfoBadge dot="#F0595A">{label}</InfoBadge> : null;
}

/** In the kit: "Next in your kit: Welcome guide builder" (passes the rules across). Otherwise the regular next step. */
export function NextStepCard({ regular }: { regular: { eyebrow: string; title: string; text: string; cta: string; href: string; secondary?: { label: string; href: string } } }) {
  const { rules, inKit } = useHouseRulesResult();
  const guide = toolById("welcome-guide-builder");
  const [saved, setSaved] = useState(false);

  if (inKit && guide) {
    const live = isLive(guide);
    const href = `${toolLink(guide)}${live ? "?kit=new-host" : ""}`;
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8">
        <p className="eyebrow text-coral-200">New host kit · step 4</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">Next in your kit: Welcome guide builder</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">
          {live ? "It imports these house rules, so you only add the rest." : "Coming soon. Your rules are saved on this device, ready for it to import."}
        </p>
        <div>
          <a
            href={href}
            onClick={() => {
              if (rules) setSaved(writeHandoff(rulesHandoff(rules)));
              track("sent_to_welcome_guide", toolSlug);
              track("kit_step_completed", toolSlug);
              track("next_step_clicked", toolSlug);
            }}
            className="btn btn-coral"
          >
            {live ? "Continue to the Welcome guide builder" : "Save my rules for the welcome guide"} →
          </a>
          {saved && <p className="m-0 mt-2 text-sm font-bold text-white">Saved.</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8">
      <p className="eyebrow">{regular.eyebrow}</p>
      <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{regular.title}</h2>
      <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{regular.text}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <TrackedLink href={regular.href} event="next_step_clicked" toolSlug={toolSlug} className="btn btn-ink">
          {regular.cta} →
        </TrackedLink>
        {regular.secondary && (
          <TrackedLink href={regular.secondary.href} event="next_step_clicked" toolSlug={toolSlug} className="text-sm font-bold text-brand">
            {regular.secondary.label}
          </TrackedLink>
        )}
      </div>
    </div>
  );
}
