"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { copy } from "@/content/tools/certificateReminders";
import { cn } from "@/lib/cn";
import { formatLong } from "@/lib/tools/dates";
import type { ScheduleRow } from "@/lib/tools/certificates";
import { Badge } from "../Badges";
import { RowStatus } from "./RowStatus";

const tagTone = {
  required: { bg: "#14212B", fg: "#FFFFFF" },
  recommended: { bg: "#E8EEF3", fg: "#14212B" },
  own: { bg: "#F2F4F6", fg: "#46525C" },
};

/** One check: name, tag, hint, its date fields, and its result. */
export function CheckCard({
  id,
  title,
  tag,
  hint,
  row,
  highlighted,
  children,
  headerActions,
  rulesHref,
  googleHref,
  onDownload,
}: {
  id: string;
  title: string;
  tag: "required" | "recommended" | "own";
  hint?: string;
  row?: ScheduleRow;
  highlighted?: boolean;
  children: ReactNode;
  headerActions?: ReactNode;
  rulesHref?: string;
  googleHref?: string | null;
  onDownload?: () => void;
}) {
  const C = copy.checks;
  return (
    <article
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      data-highlighted={highlighted ? "" : undefined}
      className={cn(
        "scroll-mt-24 rounded-[18px] border border-line bg-white p-4 transition-shadow outline-none md:p-5",
        highlighted && "border-coral shadow-[0_0_0_3px_#FDECEC,0_0_0_5px_#F0595A]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={`${id}-title`} className="m-0 text-[17px] leading-tight font-extrabold">
            {title}
          </h3>
          <Badge tone={tagTone[tag]}>{tag === "own" ? C.own : tag === "required" ? C.required : C.recommended}</Badge>
        </div>
        {row && <RowStatus row={row} />}
      </div>
      {hint && <p className="m-0 mb-3 text-sm leading-[1.5] text-ink-copy">{hint}</p>}

      <div className="grid gap-3">{children}</div>

      {row?.due && (
        <div className="mt-3 rounded-[12px] bg-cloud px-3.5 py-3 text-sm leading-[1.5] text-ink-copy">
          <p className="m-0">
            <strong className="text-ink">Due {formatLong(row.due)}</strong>
            {row.basis && <> · {row.basis}</>}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4" data-print-hide>
            {googleHref && (
              <a href={googleHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-brand">
                {C.google}
                <span className="sr-only-label"> (opens in a new tab)</span>
              </a>
            )}
            {onDownload && (
              <button type="button" onClick={onDownload} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                {C.appleOutlook}
              </button>
            )}
          </div>
        </div>
      )}

      {(rulesHref || headerActions) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-4">
          {rulesHref && (
            <Link href={rulesHref} className="inline-flex min-h-11 items-center text-sm font-bold text-ink underline underline-offset-2">
              {C.rules} →
            </Link>
          )}
          {headerActions}
        </div>
      )}
    </article>
  );
}
