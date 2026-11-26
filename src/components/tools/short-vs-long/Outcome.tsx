"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toolById, toolLink } from "@/content/tools/catalog";
import { financeCheckHref, toolSlug } from "@/content/tools/shortVsLongId";
import { copy } from "@/content/tools/shortVsLongCopy";
import { track } from "@/lib/analytics";
import type { Figures } from "@/lib/tools/figures";
import { compare, readContent, whatThisMeans } from "@/lib/tools/short-vs-long";
import { useSvl } from "./Context";

/** "What this means" and the next-step card (after the server-rendered "other things to weigh"). */
export function Outcome({ figures }: { figures: Figures }) {
  const c = useMemo(() => readContent(figures), [figures]);
  const { inputs, valid } = useSvl();
  const text = inputs && valid && (inputs.rent || inputs.shortProfit) ? whatThisMeans(inputs, compare(inputs, c), c) : "Enter your short-let profit and a likely long-let rent to see what your figures mean.";
  const profit = toolById("short-let-profit-calculator");
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
        <h2 className="h2 mb-2 text-[24px]">What this means</h2>
        <p className="m-0 text-base leading-[1.7] text-ink-copy" aria-live="polite" data-what-this-means>
          {text}
        </p>
      </div>
      <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8" data-next-step="service">
        <p className="eyebrow text-brand">{copy.nextStep.eyebrow}</p>
        <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold">{copy.nextStep.title}</h2>
        <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{copy.nextStep.text}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={financeCheckHref} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
            {copy.nextStep.cta} →
          </Link>
          {profit && (
            <Link href={toolLink(profit)} className="text-sm font-bold text-brand underline underline-offset-2">
              {copy.nextStep.recheck}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
