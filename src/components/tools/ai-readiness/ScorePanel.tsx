"use client";

import { copy } from "@/content/tools/aiReadiness";
import { cn } from "@/lib/cn";
import type { CheckId, Score } from "@/lib/tools/ai-readiness";
import { CopyButton } from "../CopyButton";
import { ProgressRing } from "../ProgressRing";

export function BandPill({ band, className }: { band: Score["band"]; className?: string }) {
  return (
    <span className={cn("pill font-extrabold", className)} style={{ background: band.bg, color: band.fg }} data-band={band.id}>
      {band.label}
    </span>
  );
}

/** The score ring, band, change since last time and one bar per check. */
export function ScorePanel({
  score,
  change,
  onCheck,
  onSeeFixes,
  onReport,
  fixListText,
  onCopiedFixes,
}: {
  score: Score | null;
  change: string;
  onCheck: (id: CheckId) => void;
  onSeeFixes: () => void;
  onReport: () => void;
  fixListText: () => string;
  onCopiedFixes: () => void;
}) {
  if (!score)
    return (
      <section aria-label="Your score" className="rounded-[20px] border border-dashed border-violet-100 bg-violet-25 p-6 text-center md:p-8" data-score-panel>
        <div className="mx-auto mb-4 flex size-[150px] items-center justify-center rounded-full border-[14px] border-[#EEF0F2] bg-white text-[28px] font-extrabold text-muted" aria-hidden="true">
          –
        </div>
        <p className="m-0 mb-1 text-lg font-extrabold">{copy.panel.empty}</p>
        <p className="m-0 text-sm text-body">{copy.panel.emptyHint}</p>
      </section>
    );

  return (
    <section aria-label="Your score" className="rounded-[20px] border border-line bg-white p-5 md:p-6" data-score-panel>
      <p className="sr-only-label" aria-live="polite" aria-atomic="true">
        {copy.panel.live.replace("{score}", String(score.total)).replace("{band}", score.band.label)}
      </p>
      <div className="flex flex-wrap items-center gap-5">
        <ProgressRing value={score.total} max={100} label={`${score.total} / 100`} color={score.band.fg} size={150} />
        <div className="grid min-w-[150px] flex-1 gap-2">
          <BandPill band={score.band} className="self-start text-[14px]" />
          {change && (
            <p className={cn("m-0 text-sm font-extrabold", change.startsWith("+") ? "text-green" : change.startsWith("−") ? "text-brand-deep" : "text-muted")} data-change>
              {change}
            </p>
          )}
          <p className="m-0 text-[13px] leading-[1.5] text-muted">Readiness, not ranking. Model v{score.version}.</p>
        </div>
      </div>

      <h3 className="m-0 mt-5 mb-2 text-[13px] font-extrabold tracking-[0.8px] text-muted uppercase">{copy.panel.bars}</h3>
      <ul className="m-0 grid list-none gap-1 p-0">
        {score.checks.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onCheck(c.id)}
              className="grid min-h-11 w-full cursor-pointer grid-cols-[22px_minmax(0,1fr)_56px] items-center gap-2 rounded-[10px] border-none bg-transparent px-1.5 text-left text-ink hover:bg-cloud"
              aria-label={`${c.id}. ${c.name}: ${c.points} of ${c.max} points. Show the breakdown.`}
              data-check-bar={c.id}
            >
              <span className="text-[12px] font-extrabold text-muted">{c.id}</span>
              <span className="grid gap-1">
                <span className="truncate text-[13px] font-bold">{c.name}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-fog" aria-hidden="true">
                  <span className="block h-full rounded-full bg-violet transition-[width]" style={{ width: `${(c.points / c.max) * 100}%` }} />
                </span>
              </span>
              <span className="text-right text-[13px] font-extrabold tabular-nums">
                {c.points}/{c.max}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-2">
        <button type="button" onClick={onSeeFixes} className="btn btn-coral min-h-12 w-full">
          {copy.panel.seeFixes}
        </button>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onReport} className="btn btn-outline min-h-11 flex-1">
            {copy.panel.report}
          </button>
          <CopyButton getText={fixListText} label={copy.panel.copyFixes} copiedLabel="Fix list copied" className="min-h-11 flex-1" onCopied={onCopiedFixes} />
        </div>
      </div>
    </section>
  );
}
