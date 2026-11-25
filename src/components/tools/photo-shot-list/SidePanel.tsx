"use client";

import { copy } from "@/content/tools/photoShotList";
import { cn } from "@/lib/cn";
import type { Shot, Totals } from "@/lib/tools/photo-shot-list";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

/**
 * "First five" grid preview (an illustration, not any platform's design):
 * one big cover and four smaller tiles, each labelled with its area, plus the totals.
 */
export function FirstFiveGrid({ shots, compact }: { shots: Shot[]; compact?: boolean }) {
  const five = shots.slice(0, 5);
  if (!five.length) return <p className="m-0 rounded-[14px] bg-cloud-2 px-4 py-6 text-center text-sm text-muted">{copy.panel.empty}</p>;
  return (
    <ol className={cn("m-0 grid list-none grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-[16px] p-0", compact ? "h-[150px]" : "h-[210px]")} aria-label="Your first five photos" data-first-five>
      {five.map((x, i) => (
        <li
          key={x.id}
          className={cn("relative flex min-w-0 flex-col justify-end overflow-hidden p-2", i === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1")}
          style={{ background: i === 0 ? "linear-gradient(135deg,#F7F3EC,#EADFCF)" : i % 2 ? "#F2EEE6" : "#EDE6DA" }}
          data-grid-tile={x.id}
        >
          <span className={cn("absolute top-1.5 left-1.5 flex items-center justify-center rounded-full bg-ink font-extrabold text-white", i === 0 ? "h-6 px-2 text-[11px]" : "size-5 text-[10px]")}>
            {i === 0 ? `1 · ${copy.panel.cover}` : i + 1}
          </span>
          <span className={cn("leading-[1.2] font-bold break-words text-ink", i === 0 ? "text-[14px]" : "text-[11px]")}>{x.area}</span>
        </li>
      ))}
    </ol>
  );
}

export function SidePanel({ shots, totals, onSee }: { shots: Shot[]; totals: Totals; onSee: () => void }) {
  return (
    <div className="grid gap-3 rounded-[20px] border border-line bg-white p-5 md:p-6" data-side-panel>
      <div>
        <h3 className="m-0 text-lg font-extrabold text-ink">{copy.panel.title}</h3>
        <p className="m-0 mt-1 text-[13px] leading-[1.5] text-muted">{copy.panel.hint}</p>
      </div>
      <FirstFiveGrid shots={shots} />
      <p className="m-0 text-[12px] text-muted">{copy.panel.illustration}</p>
      <p className="m-0 text-[15px] font-bold text-ink" data-totals aria-live="polite">
        {fill(copy.panel.totals, { shots: totals.shots, rooms: totals.rooms })}
      </p>
      {totals.warning && (
        <p className="m-0 rounded-[12px] bg-amber-25 px-3.5 py-2.5 text-sm font-bold text-amber" role="status" data-count-warning>
          ⚠ {totals.warning}
        </p>
      )}
      <button type="button" onClick={onSee} className="btn btn-outline min-h-11 max-md:hidden">
        {fill(copy.panel.see, { n: totals.shots })} ↓
      </button>
    </div>
  );
}
