"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy as C, example, fieldText, nationOptions, storageKey, toolSlug } from "@/content/tools/businessRates";
import { track } from "@/lib/analytics";
import { evaluate, fieldsFor, resultLines, resultText, walesLine, type DayField, type Inputs, type Nation, type Outcome } from "@/lib/tools/business-rates";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { fillTemplate, formatDate, type Figures } from "@/lib/tools/figures";
import { ChoiceQuestion } from "../ChoiceQuestion";
import { CopyButton } from "../CopyButton";
import { NumberField } from "../NumberField";
import { ProgressRow } from "../ProgressRow";
import { StatusPill } from "../StatusPill";
import { Toggle } from "../Toggle";
import { useBusinessRatesResult } from "./ResultContext";

type Saved = { nation?: Nation; inputs: Record<DayField, string>; averaging: boolean };

const emptyInputs = (): Record<DayField, string> => ({ availableLast: "", availableNext: "", letLast: "", letYear2: "", letYear3: "", charityDays: "" });

/** Keep only known fields as strings (saved data could be anything). */
function cleanSaved(raw: unknown): Saved | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const nation = nationOptions.some((n) => n.value === o.nation) ? (o.nation as Nation) : undefined;
  const inputs = emptyInputs();
  const src = (o.inputs ?? {}) as Record<string, unknown>;
  for (const k of Object.keys(inputs) as DayField[]) if (typeof src[k] === "string") inputs[k] = (src[k] as string).slice(0, 6);
  return { nation, inputs, averaging: o.averaging === true };
}

export function BusinessRatesChecker({ figures }: { figures: Figures }) {
  const [nation, setNation] = useState<Nation | undefined>();
  const [inputs, setInputs] = useState<Record<DayField, string>>(emptyInputs);
  const [averaging, setAveraging] = useState(false);
  const [ready, setReady] = useState(false);
  const opened = useRef(false);
  const lastTracked = useRef<string | null>(null);
  const { setOutcome } = useBusinessRatesResult();

  /* ---- Saved inputs (this device only) ---- */
  useEffect(() => {
    if (!opened.current) track("tool_opened", toolSlug);
    opened.current = true;
    const saved = cleanSaved(deviceStorage.read(storageKey));
    // Restoring once after hydration (the server render has no storage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    if (!saved) return;
    setNation(saved.nation);
    setInputs(saved.inputs);
    setAveraging(saved.averaging);
  }, []);

  useEffect(() => {
    if (ready) deviceStorage.write(storageKey, { nation, inputs, averaging } satisfies Saved);
  }, [ready, nation, inputs, averaging]);

  /* ---- Live result ---- */
  const outcome: Outcome | null = useMemo(() => {
    if (!nation) return null;
    try {
      return evaluate(nation, { ...inputs, averaging } as Inputs, figures);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [nation, inputs, averaging, figures]);

  useEffect(() => setOutcome(outcome), [outcome, setOutcome]);

  useEffect(() => {
    const o = outcome?.overall;
    if ((o === "passes" || o === "not-yet") && lastTracked.current !== o) track("tool_result_shown", toolSlug, { outcome: o });
    lastTracked.current = o ?? null;
  }, [outcome?.overall]);

  const set = (f: DayField) => (v: string) => setInputs((s) => ({ ...s, [f]: v.replace(/\s/g, "").slice(0, 6) }));
  const reset = () => {
    deviceStorage.remove(storageKey);
    setNation(undefined);
    setInputs(emptyInputs());
    setAveraging(false);
  };
  const tryExample = () => {
    setNation(example.nation);
    setInputs({ ...emptyInputs(), ...(example.inputs as Record<DayField, string>) });
    setAveraging(false);
  };

  const fill = (s: string) => fillTemplate(s, figures);
  const textFor = (f: DayField) => (nation === "scotland" && fieldText.scotland[f]) || fieldText[f];
  const rulesChecked = typeof figures.rulesLastChecked?.value === "string" ? formatDate(figures.rulesLastChecked.value) : "";
  const fields = nation ? fieldsFor(nation, averaging) : [];

  return (
    <div data-tool={toolSlug} data-ready={ready || undefined} className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:items-start">
      {/* ---- Inputs ---- */}
      <form className="rounded-[20px] border border-line bg-white p-5 md:p-8" onSubmit={(e) => e.preventDefault()} aria-label="Business rates qualifier">
        <div className="mb-5 flex flex-wrap items-center justify-end gap-x-5 gap-y-1">
          <button type="button" onClick={tryExample} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
            {C.tryExample}
          </button>
          <button type="button" onClick={reset} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-ink underline underline-offset-2">
            {C.reset}
          </button>
        </div>

        <ChoiceQuestion
          name="nation"
          legend={C.nationLegend}
          hint={C.nationHint}
          options={nationOptions}
          value={nation}
          onChange={(v) => setNation(v as Nation)}
        />

        {nation === "ni" && (
          <div className="mt-6 rounded-[14px] bg-steel-50 p-5 text-[15px] leading-[1.6] text-ink" role="status">
            <p className="m-0 mb-2">{C.niMessage}</p>
            <a href={C.niLink.href} target="_blank" rel="noopener noreferrer" className="font-bold text-brand">
              {C.niLink.label} →<span className="sr-only-label"> (opens in a new tab)</span>
            </a>
          </div>
        )}

        {nation && nation !== "ni" && (
          <fieldset className="m-0 mt-8 grid min-w-0 gap-6 border-none p-0">
            <legend className="mb-4 p-0 text-xl font-extrabold tracking-[-0.4px]">{C.daysTitle}</legend>
            {fields
              .filter((f) => f !== "letYear2" && f !== "letYear3" && f !== "charityDays")
              .map((f) => (
                <NumberField
                  key={f}
                  name={f}
                  label={textFor(f).label}
                  hint={fill(textFor(f).hint)}
                  tip={fill(textFor(f).tip)}
                  value={inputs[f]}
                  onChange={set(f)}
                  error={outcome?.errors[f]}
                />
              ))}

            {nation === "wales" && (
              <div className="grid gap-6 rounded-[16px] bg-cream-2 p-4 md:p-5">
                <Toggle label={fill(C.averagingLabel)} hint={C.averagingHint} checked={averaging} onChange={setAveraging} />
                {averaging &&
                  (["letYear2", "letYear3"] as const).map((f) => (
                    <NumberField key={f} name={f} label={textFor(f).label} hint={fill(textFor(f).hint)} tip={fill(textFor(f).tip)} value={inputs[f]} onChange={set(f)} error={outcome?.errors[f]} />
                  ))}
                <NumberField
                  name="charityDays"
                  label={textFor("charityDays").label}
                  hint={fill(textFor("charityDays").hint)}
                  tip={fill(textFor("charityDays").tip)}
                  value={inputs.charityDays}
                  onChange={set("charityDays")}
                  error={outcome?.errors.charityDays}
                />
              </div>
            )}
          </fieldset>
        )}
      </form>

      {/* ---- Live result ---- */}
      <section aria-labelledby="br-result" className="rounded-[20px] border border-line bg-white p-5 md:sticky md:top-6 md:p-7" data-result-panel>
        <h2 id="br-result" className="m-0 mb-4 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">
          {C.resultTitle}
        </h2>
        <div aria-live="polite">
          {outcome?.overall === "passes" && <StatusPill tone="pass">{C.passes}</StatusPill>}
          {outcome?.overall === "not-yet" && <StatusPill tone="notYet">{C.notYet}</StatusPill>}
          {outcome?.overall === "not-covered" && <StatusPill tone="info">Not covered by this checker</StatusPill>}
          {(!outcome || outcome.overall === "incomplete") && <StatusPill tone="neutral">{C.incomplete}</StatusPill>}

          {outcome && resultLines(outcome).length > 0 && (
            <div className="mt-4 grid gap-2">
              {resultLines(outcome).map((l) => (
                <p key={l} className="m-0 text-[15px] leading-[1.6] text-ink-copy first:font-semibold first:text-ink">
                  {l}
                </p>
              ))}
            </div>
          )}
          {(!outcome || outcome.overall === "incomplete") && <p className="m-0 mt-3 text-sm text-muted">{C.incompleteHint}</p>}
        </div>

        {outcome && outcome.tests.length > 0 && (
          <ul className="m-0 mt-5 grid list-none gap-2.5 p-0">
            {outcome.tests.map((t) => (
              <ProgressRow key={t.id} label={t.name} value={t.value} target={t.required} passed={t.passed} needed={t.daysNeeded} />
            ))}
          </ul>
        )}

        {outcome?.wales && outcome.overall !== "incomplete" && (
          <p className="m-0 mt-3 rounded-[12px] bg-cream-2 px-4 py-3 text-sm leading-[1.55] text-ink-copy">{walesLine(outcome.wales)}</p>
        )}

        {outcome && outcome.warnings.length > 0 && (
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {outcome.warnings.map((w) => (
              <li key={w.code} className="rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold text-amber" role="note">
                {w.message}
              </li>
            ))}
          </ul>
        )}

        {outcome && (outcome.overall === "passes" || outcome.overall === "not-yet") && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            <CopyButton
              label={C.copyResult}
              copiedLabel={C.copied}
              getText={() => resultText(outcome, { heading: C.copyHeading, rulesChecked, disclaimer: C.disclaimer })}
            />
            <button type="button" onClick={reset} className="btn btn-outline">
              {C.reset}
            </button>
          </div>
        )}

        <p className="m-0 mt-5 border-t border-line pt-4 text-[13px] leading-[1.6] text-muted">
          {C.privacy}{" "}
          <button type="button" onClick={reset} className="cursor-pointer border-none bg-transparent p-0 font-bold text-ink underline underline-offset-2">
            {C.clear}
          </button>
        </p>
      </section>
    </div>
  );
}
