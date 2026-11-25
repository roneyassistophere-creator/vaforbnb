"use client";

import { Fragment, type ReactNode } from "react";
import { copy } from "@/content/tools/titleChecker";
import { cn } from "@/lib/cn";
import { passedText, type CheckResult, type Rules, type Status, type TitleResult, type VerdictId } from "@/lib/tools/title-checker";

/* Colours meet WCAG AA as text on their background. */
export const statusTone: Record<Status, { bg: string; fg: string; icon: string }> = {
  pass: { bg: "#E3F2EA", fg: "#1F6B45", icon: "✓" },
  fix: { bg: "#FDECEC", fg: "#B8383A", icon: "!" },
  tip: { bg: "#FFF2CC", fg: "#6B4A00", icon: "+" },
};
export const verdictTone: Record<VerdictId, { bg: string; fg: string; icon: string }> = {
  fixes: statusTone.fix,
  good: statusTone.tip,
  strong: statusTone.pass,
};

/** Pass / Fix / Tip badge: an icon and the word, never colour alone. */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = statusTone[status];
  return (
    <span className={cn("inline-flex min-w-[58px] flex-none items-center justify-center gap-1 rounded-md px-2 py-[3px] text-[12px] font-extrabold tracking-[0.3px] uppercase", className)} style={{ background: t.bg, color: t.fg }}>
      <span aria-hidden="true">{t.icon}</span>
      {copy.status[status]}
    </span>
  );
}

/** Verdict pill plus "n of 12 checks passed". */
export function Verdict({ r, rules, compact }: { r: TitleResult; rules: Rules; compact?: boolean }) {
  const t = verdictTone[r.verdict.id];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5" data-verdict={r.verdict.id}>
      <p
        className={cn("m-0 inline-flex items-center gap-2 rounded-full font-extrabold", compact ? "min-h-8 px-3 text-sm" : "min-h-11 px-4 text-lg")}
        style={{ background: t.bg, color: t.fg }}
      >
        <span aria-hidden="true" className={cn("flex items-center justify-center rounded-full text-white", compact ? "size-[18px] text-[11px]" : "size-6 text-sm")} style={{ background: t.fg }}>
          {t.icon}
        </span>
        {r.verdict.label}
      </p>
      <p className={cn("m-0 font-bold text-ink-copy", compact ? "text-[13px]" : "text-sm")} data-passed>
        {passedText(r, rules)}
      </p>
    </div>
  );
}

type Mark = { start: number; end: number; status: Status; n: number; name: string };
const severity: Record<Status, number> = { fix: 2, tip: 1, pass: 0 };

/**
 * The title with every matched part underlined (wavy = Fix, dashed = Tip,
 * solid = Pass) and followed by the number of its check, so the highlight
 * never relies on colour alone. Screen readers hear the check after the text.
 */
export function HighlightedTitle({ r, className }: { r: TitleResult; className?: string }) {
  const marks: Mark[] = r.checks.flatMap((c, i) => c.matches.map((m) => ({ start: m.start, end: m.end, status: c.status, n: i + 1, name: c.name })));
  const t = r.title;
  const cuts = [...new Set([0, t.length, ...marks.flatMap((m) => [m.start, m.end])])].sort((a, b) => a - b);
  const parts: ReactNode[] = [];
  for (let k = 0; k < cuts.length - 1; k++) {
    const [a, b] = [cuts[k], cuts[k + 1]];
    const text = t.slice(a, b);
    const on = marks.filter((m) => m.start <= a && m.end >= b);
    const ending = marks.filter((m) => m.end === b);
    if (!on.length) parts.push(<Fragment key={k}>{text}</Fragment>);
    else {
      const top = on.reduce((x, y) => (severity[y.status] > severity[x.status] ? y : x));
      parts.push(
        <span
          key={k}
          data-mark={top.status}
          className="underline underline-offset-[5px]"
          style={{
            textDecorationStyle: top.status === "fix" ? "wavy" : top.status === "tip" ? "dashed" : "solid",
            textDecorationColor: statusTone[top.status].fg,
            textDecorationThickness: top.status === "pass" ? 2 : 1.5,
            background: top.status === "fix" ? "#FDECEC" : top.status === "tip" ? "#FFF7E0" : undefined,
          }}
        >
          {text}
        </span>,
      );
    }
    if (ending.length) {
      const nums = [...new Set(ending.map((m) => m.n))];
      parts.push(
        <sup key={`l${k}`} className="ml-0.5 text-[11px] font-extrabold" style={{ color: statusTone[ending.reduce((x, y) => (severity[y.status] > severity[x.status] ? y : x)).status].fg }}>
          {nums.join(",")}
          <span className="sr-only-label"> ({ending.map((m) => `${copy.status[m.status]}, check ${m.n}: ${m.name}`).join("; ")})</span>
        </sup>,
      );
    }
  }
  return (
    <p className={cn("m-0 text-[17px] leading-[1.9] font-semibold break-words text-ink", className)} data-highlighted-title>
      {parts}
    </p>
  );
}

/** One row of the checklist. */
function CheckRow({ c, n, compact }: { c: CheckResult; n: number; compact?: boolean }) {
  return (
    <li className={cn("flex items-start gap-3 border-t border-line first:border-t-0", compact ? "py-1.5" : "py-3")} data-check={c.id} data-status={c.status}>
      <StatusBadge status={c.status} className={compact ? "min-w-[50px] text-[11px]" : undefined} />
      <div className="min-w-0 flex-1">
        <p className={cn("m-0 font-bold text-ink", compact ? "text-[13px] leading-[1.35]" : "text-[15px] leading-[1.4]")}>
          <span className="mr-1.5 text-muted tabular-nums">{n}.</span>
          {c.name}
        </p>
        {!compact && <p className="m-0 mt-0.5 text-sm leading-[1.5] text-ink-copy">{c.reason}</p>}
      </div>
    </li>
  );
}

/** The 12 checks, in their stored order (numbered to match the highlights), plus any extra tip. */
export function Checklist({ r, compact }: { r: TitleResult; compact?: boolean }) {
  return (
    <div>
      <ol className="m-0 list-none p-0" aria-label="Title checks">
        {r.checks.map((c, i) => (
          <CheckRow key={c.id} c={c} n={i + 1} compact={compact} />
        ))}
      </ol>
      {!compact &&
        r.extraTips.map((t) => (
          <p key={t} className="m-0 mt-2 flex items-start gap-3 rounded-[12px] bg-amber-25 px-3 py-2.5 text-sm leading-[1.5] text-ink-copy" data-extra-tip>
            <StatusBadge status="tip" />
            <span>
              <strong className="text-ink">{copy.checklist.extra}:</strong> {t}
            </span>
          </p>
        ))}
    </div>
  );
}

/**
 * A simple, generic search result card (not a copy of any platform's design):
 * photo placeholder, the title, and a rating placeholder. Over the limit, the
 * title is cut where a card would cut it, with "…".
 */
export function SearchCard({ r, compact, className }: { r: TitleResult; compact?: boolean; className?: string }) {
  const shown = r.cutAt === null ? r.title : `${r.title.slice(0, r.cutAt).trimEnd()}…`;
  return (
    <figure className={cn("m-0", className)} data-search-card>
      <div className={cn("overflow-hidden rounded-[16px] border border-line bg-white", compact ? "max-w-[240px]" : "max-w-[300px]")}>
        <div className={cn("flex items-center justify-center bg-gradient-to-br from-sand to-[#EDE6DA] text-muted", compact ? "h-[96px]" : "h-[150px]")} aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.8" />
            <path d="m21 16-5-5-8 8" />
          </svg>
        </div>
        <div className="grid gap-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("m-0 min-w-0 flex-1 leading-[1.35] font-bold break-words text-ink", compact ? "text-[13px]" : "text-[15px]")} title={r.title} data-card-title>
              {r.title ? shown : <span className="font-semibold text-muted">{copy.card.empty}</span>}
            </p>
            <span className={cn("flex-none font-semibold text-ink", compact ? "text-[12px]" : "text-sm")}>
              <span aria-hidden="true">★</span> {copy.card.rating}
              <span className="sr-only-label"> (placeholder rating)</span>
            </span>
          </div>
          <span className="grid gap-1.5 pt-1" aria-hidden="true">
            <span className="h-2 w-3/4 rounded-full bg-fog" />
            <span className="h-2 w-1/2 rounded-full bg-fog" />
          </span>
        </div>
      </div>
      <figcaption className={cn("mt-2 text-muted", compact ? "text-[11px]" : "text-[13px]")}>
        {copy.card.label}
        {r.cutAt !== null && <span className="font-bold text-brand"> {copy.card.cut.replace("{limit}", String(r.limit))}.</span>}
      </figcaption>
    </figure>
  );
}
