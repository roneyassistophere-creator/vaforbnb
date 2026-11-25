"use client";

import Link from "next/link";
import { isLive, toolById } from "@/content/tools/catalog";
import { relatedByNation } from "@/content/tools/complianceChecker";
import { useComplianceResult } from "./ResultContext";

/** Extra related-tool cards for the result's nation (e.g. the London 90-night counter for London), once live. */
export function RelatedForResult() {
  const { shown } = useComplianceResult();
  const nation = shown?.answers.nation;
  const tools = (nation ? (relatedByNation[nation] ?? []) : []).map(toolById).filter((t) => isLive(t));
  return tools.map((t) => (
    <Link
      key={t!.id}
      href={t!.href!}
      className="flex min-h-[150px] flex-col gap-2 rounded-[18px] border-[1.5px] border-ink bg-white p-5 text-ink no-underline hover:text-ink"
    >
      <span className="pill self-start bg-green-100 text-green">For your result</span>
      <span className="text-[17px] font-extrabold">{t!.name}</span>
      <span className="text-sm text-body">{t!.q}</span>
    </Link>
  ));
}
