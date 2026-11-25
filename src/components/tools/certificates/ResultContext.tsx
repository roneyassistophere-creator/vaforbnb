"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, toolSlug } from "@/content/tools/certificateReminders";
import { routes } from "@/config/navigation";
import { track } from "@/lib/analytics";
import type { Figures } from "@/lib/tools/figures";
import { whatThisMeans, type ScheduleRow } from "@/lib/tools/certificates";
import { InfoBadge } from "../Badges";
import { TrackedLink } from "../TrackedLink";

type Shown = { rows: ScheduleRow[]; figures: Figures } | null;
type Ctx = { shown: Shown; setShown: (s: Shown) => void; inKit: boolean };
const Context = createContext<Ctx>({ shown: null, setShown: () => {}, inKit: false });

/** Arriving from the New host kit: /free-tools/holiday-let-certificate-reminders?kit=new-host */
const readKit = () => {
  try {
    return new URLSearchParams(window.location.search).get("kit") === "new-host";
  } catch {
    return false;
  }
};

/** Lets the page's "What this means", kit badge and next-step card follow the tool. */
export function CertificateResultProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown>(null);
  const [inKit, setInKit] = useState(false);
  // The URL is only known in the browser.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setInKit(readKit()), []);
  return <Context.Provider value={{ shown, setShown, inKit }}>{children}</Context.Provider>;
}

export const useCertificateResult = () => useContext(Context);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { shown } = useCertificateResult();
  return (
    <p className={className} aria-live="polite">
      {shown ? whatThisMeans(shown.rows, shown.figures) : fallback}
    </p>
  );
}

export function KitBadge() {
  const { inKit } = useCertificateResult();
  return inKit ? <InfoBadge dot="#F0595A">{copy.kit.badge}</InfoBadge> : null;
}

/**
 * "Want us to book these for you?", or the "Kit complete" card once a host
 * in the New host kit has added a date.
 */
export function NextStepCard({ next }: { next: { eyebrow: string; title: string; text: string; cta: string; href: string } }) {
  const { shown, inKit } = useCertificateResult();
  const done = inKit && !!shown?.rows.some((r) => r.due);
  useEffect(() => {
    if (done) track("kit_completed", toolSlug);
  }, [done]);

  if (done) {
    return (
      <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" aria-live="polite">
        <p className="eyebrow text-coral-200">{copy.kit.badge}</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white">✓ {copy.kit.title}</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{copy.kit.text}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={routes.freeTools} className="btn btn-coral">
            {copy.kit.cta} →
          </Link>
          <TrackedLink href={next.href} event="next_step_clicked" toolSlug={toolSlug} className="text-sm font-bold text-white underline underline-offset-2">
            {next.title}
          </TrackedLink>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8">
      <p className="eyebrow">{next.eyebrow}</p>
      <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{next.title}</h2>
      <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{next.text}</p>
      <div>
        <TrackedLink href={next.href} event="next_step_clicked" toolSlug={toolSlug} className="btn btn-ink">
          {next.cta} →
        </TrackedLink>
      </div>
    </div>
  );
}
