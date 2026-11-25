import { cn } from "@/lib/cn";

/** "Step 2 of 3 · Guests" with a bar and step names. Shared by the step-by-step builder tools. */
export function StepProgress({ steps, current, onStep }: { steps: string[]; current: number; onStep?: (i: number) => void }) {
  return (
    <nav aria-label="Progress" className="mb-5">
      <p className="m-0 mb-2 text-sm font-bold text-ink">
        Step {current + 1} of {steps.length} <span className="text-muted">· {steps[current]}</span>
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-fog" aria-hidden="true">
        <div className="h-full rounded-full bg-coral transition-[width]" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
      <ol className="m-0 mt-2 grid list-none gap-1 p-0" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => (
          <li key={s}>
            {onStep && i < current ? (
              <button type="button" onClick={() => onStep(i)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-bold text-ink underline underline-offset-2">
                {i + 1}. {s}
              </button>
            ) : (
              <span aria-current={i === current ? "step" : undefined} className={cn("flex min-h-11 items-center text-[13px] font-bold", i === current ? "text-ink" : "text-muted")}>
                {i + 1}. {s}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
