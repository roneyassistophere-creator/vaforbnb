import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GroupBadge } from "./Badges";
import type { GroupKey } from "./styles";

/**
 * Results container. Marked as the print area, so printing the page shows
 * only this panel (see the print styles in globals.css).
 */
export const ResultPanel = forwardRef<
  HTMLHeadingElement,
  {
    heading: string;
    summary: ReactNode;
    printHeader?: ReactNode;
    children: ReactNode;
    className?: string;
  }
>(function ResultPanel({ heading, summary, printHeader, children, className }, headingRef) {
  return (
    <section data-print-area className={cn("rounded-[20px] border border-line bg-white p-5 md:p-9", className)} aria-labelledby="result-heading">
      {printHeader && <div className="mb-6 hidden print:block">{printHeader}</div>}
      <h2 id="result-heading" ref={headingRef} tabIndex={-1} className="m-0 mb-2 text-[28px] leading-[1.15] font-extrabold tracking-[-1px] outline-none md:text-[34px]">
        {heading}
      </h2>
      <p className="m-0 text-[17px] font-semibold text-ink-copy">{summary}</p>
      {children}
    </section>
  );
});

/** A titled group of result cards. Render nothing for empty groups. */
export function ResultGroup({ group, count, children }: { group: GroupKey; count: number; children: ReactNode }) {
  if (count === 0) return null;
  return (
    <section className="mt-9" aria-labelledby={`group-${group}`}>
      <h3 id={`group-${group}`} className="m-0 mb-3.5 flex items-center gap-3 text-xl font-extrabold">
        <GroupBadge group={group} className="text-xs" />
        <span>
          {count} {count === 1 ? "rule" : "rules"}
        </span>
      </h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}
