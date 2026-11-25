/** Circular progress: value of max, filled up to full (capped when over). */
export function ProgressRing({
  value,
  max,
  label,
  sublabel,
  color = "#14212B",
  size = 168,
}: {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF0F2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap={pct > 0 ? "round" : "butt"}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[15px] leading-tight font-extrabold text-ink">{label}</span>
        {sublabel && <span className="mt-0.5 text-[13px] text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
