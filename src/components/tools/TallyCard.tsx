import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TallyRow = { label: string; count: number | null; dot: string };
export type AnswerRow = { label: string; value: string };

/** Live count per group plus the answers given so far. */
export function TallyCard({
  title,
  rows,
  answers,
  emptyText,
  footer,
  className,
}: {
  title: string;
  rows: TallyRow[];
  answers: AnswerRow[];
  emptyText: string;
  footer?: ReactNode;
  className?: string;
}) {
  const started = rows.some((r) => r.count !== null);
  return (
    <aside className={cn("rounded-[20px] bg-ink p-6 text-white md:p-7", className)} aria-label={title}>
      <p className="m-0 mb-4 text-xs font-extrabold tracking-[1.2px] text-coral-200 uppercase">{title}</p>
      <ul className="m-0 grid list-none gap-2.5 p-0" aria-live="polite">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3 rounded-[12px] bg-ink-hover px-4 py-3">
            <span className="flex items-center gap-2.5 text-[15px] font-semibold">
              <span className="size-2.5 rounded-full" style={{ background: r.dot }} />
              {r.label}
            </span>
            <span className="text-2xl font-extrabold tabular-nums">{r.count ?? "–"}</span>
          </li>
        ))}
      </ul>
      {!started && <p className="m-0 mt-3 text-[13px] text-mist">{emptyText}</p>}

      {answers.length > 0 && (
        <div className="mt-6">
          <p className="m-0 mb-2.5 text-[13px] font-extrabold text-mist">Your answers</p>
          <dl className="m-0 grid gap-2">
            {answers.map((a) => (
              <div key={a.label} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 text-[13px]">
                <dt className="text-faint">{a.label}</dt>
                <dd className="m-0 font-semibold text-white">{a.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {footer && <div className="mt-6 border-t border-night-2 pt-4">{footer}</div>}
    </aside>
  );
}
