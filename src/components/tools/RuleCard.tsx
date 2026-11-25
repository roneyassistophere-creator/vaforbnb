"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { StatusBadge } from "./Badges";
import { SourceLink, type SourceItem } from "./SourceLink";
import type { StatusKey } from "./styles";

export type RuleCardData = {
  id: string;
  title: string;
  status: StatusKey;
  summary: string;
  steps: string[];
  source: SourceItem;
  detailsHref?: string;
  detailsLabel?: string;
  /** Optional button to a tool that helps with this rule (e.g. "Count my nights"). */
  action?: { label: string; href: string };
};

/**
 * One rule: badge, title, summary, an expandable "What to do" list, the
 * official source and a link to more detail. Steps always show when printed.
 */
export function RuleCard({ rule, stepsLabel = "What to do" }: { rule: RuleCardData; stepsLabel?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="rounded-[16px] border border-line bg-white p-5 break-inside-avoid md:p-6" data-rule-id={rule.id}>
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <StatusBadge status={rule.status} />
      </div>
      <h4 className="m-0 mb-1.5 text-[17px] leading-[1.35] font-extrabold">
        <span className="hidden print:inline">☐ </span>
        {rule.title}
      </h4>
      <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">{rule.summary}</p>

      {rule.steps.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            data-print-hide
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-transparent p-0 text-sm font-extrabold text-ink"
          >
            <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-fog text-base leading-none">
              {open ? "−" : "+"}
            </span>
            {stepsLabel}
          </button>
          <ul id={panelId} className={cn("m-0 mt-1 list-none rounded-[12px] bg-cream-2 px-4 py-3", open ? "grid gap-1.5" : "hidden print:grid")}>
            {rule.steps.map((s) => (
              <li key={s} className="flex gap-2.5 text-sm leading-[1.55]">
                <span aria-hidden="true" className="font-extrabold text-brand">
                  →
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rule.action && (
        <Link href={rule.action.href} className="btn btn-ink mt-3" data-print-hide>
          {rule.action.label} →
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <SourceLink source={rule.source} />
        {rule.detailsHref && (
          <Link href={rule.detailsHref} className="inline-flex min-h-11 items-center text-sm font-bold text-brand no-underline hover:underline" data-print-hide>
            {rule.detailsLabel ?? "Details →"}
          </Link>
        )}
      </div>
    </article>
  );
}
