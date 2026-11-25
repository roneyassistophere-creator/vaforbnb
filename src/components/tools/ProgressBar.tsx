/** "Question 2 of 6" with a bar. */
export function ProgressBar({ current, total, label = "Question" }: { current: number; total: number; label?: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <p className="m-0 mb-2 text-[13px] font-bold text-body" aria-live="polite">
        {label} {current} of {total}
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-fog"
        role="progressbar"
        aria-label={`${label} ${current} of ${total}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className="h-full rounded-full bg-coral transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
