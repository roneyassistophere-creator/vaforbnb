/** One test against its target: label, a bar, ✓/✗ and how many more are needed. */
export function ProgressRow({
  label,
  value,
  target,
  passed,
  needed,
  unit = "days",
}: {
  label: string;
  value: number;
  target: number;
  passed: boolean;
  needed: number;
  unit?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 100;
  return (
    <li className="grid gap-2 rounded-[14px] border border-line bg-white px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] leading-[1.35] font-bold text-ink">{label}</span>
        <span
          className="flex size-6 flex-none items-center justify-center rounded-full text-[13px] font-extrabold text-white"
          style={{ background: passed ? "#1F6B45" : "#B8383A" }}
          aria-label={passed ? "Passed" : "Not met"}
          role="img"
        >
          {passed ? "✓" : "✕"}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-fog" aria-hidden="true">
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: passed ? "#2E8B57" : "#F0595A" }} />
      </div>
      <p className="m-0 text-sm text-ink-copy">
        <span className="font-extrabold text-ink tabular-nums">{value}</span> of {target} {unit}
        {!passed && (
          <>
            {" · "}
            <span className="font-bold text-brand">
              {needed} more {needed === 1 ? unit.replace(/s$/, "") : unit} needed
            </span>
          </>
        )}
      </p>
    </li>
  );
}
