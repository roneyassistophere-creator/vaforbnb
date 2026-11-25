"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy, disclaimer, scenariosKey, storageKey, toolSlug } from "@/content/tools/longStay";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import type { Figures } from "@/lib/tools/figures";
import { money } from "@/lib/tools/format";
import { readHandoffData } from "@/lib/tools/handoff";
import {
  addScenario,
  cleanForm,
  cleanScenarios,
  compareStays,
  defaultForm,
  exampleForm,
  headline,
  londonFromCounter,
  parseForm,
  rateFromProfit,
  readContent,
  removeScenario,
  resultText,
  sensitivity,
  whatThisMeans,
  type Form,
  type Scenario,
} from "@/lib/tools/long-stay";
import { Inputs } from "./Inputs";
import { useLongStayResult } from "./ResultContext";
import { Chart, Headline, ResultPanel, Scenarios, SensitivityTable } from "./Results";

type Saved = { form: Form; example: boolean; moreOpen: boolean; importedAt: string };
type Imported = { source: string; prev: Form };

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

export function LongStayTool({ figures }: { figures: Figures }) {
  const content = useMemo(() => readContent(figures), [figures]);
  const [form, setForm] = useState<Form>(() => defaultForm(content));
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [example, setExample] = useState(false);
  const [imported, setImported] = useState<Imported | null>(null);
  const [importedAt, setImportedAt] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [sheet, setSheet] = useState(false);
  const [announce, setAnnounce] = useState("");
  const { setResult, inKit } = useLongStayResult();
  const lastBetter = useRef("");

  /* ---- Load and save (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const s = deviceStorage.read<Saved>(storageKey);
    let next = s ? cleanForm(s.form, content) : defaultForm(content);
    let at = typeof s?.importedAt === "string" ? s.importedAt : "";
    let imp: Imported | null = null;
    const d = defaultForm(content);
    // Shared device format: the nightly rate from the profit calculator, and the London flag from the 90-night counter.
    // Never overwrites what the host already filled in.
    const profit = readHandoffData("profit-inputs", (x) => x);
    const rate = profit ? rateFromProfit(profit.data) : null;
    if (profit && rate !== null && profit.createdAt !== at && next.nightlyRate === d.nightlyRate) {
      imp = { source: profit.source, prev: next };
      next = { ...next, nightlyRate: String(rate) };
      at = profit.createdAt;
    }
    const flag = readHandoffData("london-flag", (x) => x);
    if (flag && londonFromCounter(flag.data) && !next.london && flag.createdAt !== at) {
      imp = imp ?? { source: flag.source, prev: next };
      next = { ...next, london: true };
      at = flag.createdAt;
    }
    // Restoring once after hydration: the server render has no storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(next);
    setExample(s?.example === true && !imp);
    setMoreOpen(s?.moreOpen === true);
    setImported(imp);
    setImportedAt(at);
    setScenarios(cleanScenarios(deviceStorage.read(scenariosKey), content, (f) => cleanForm(f, content)));
    setReady(true);
  }, [content]);

  useEffect(() => {
    if (!ready) return;
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, { form, example, moreOpen, importedAt } satisfies Saved));
  }, [ready, form, example, moreOpen, importedAt]);

  useEffect(() => {
    if (ready) deviceStorage.write(scenariosKey, scenarios);
  }, [ready, scenarios]);

  /* ---- Derived: results update live ---- */
  const parsed = useMemo(() => parseForm(form, content), [form, content]);
  const inputs = parsed.inputs;
  const result = useMemo(() => (inputs ? compareStays(inputs, content) : null), [inputs, content]);
  const rows = useMemo(() => (inputs ? sensitivity(inputs, content.settings.sensitivitySteps, content) : []), [inputs, content]);

  useEffect(() => {
    setResult(result ? { meaning: whatThisMeans(result, inKit) } : null);
  }, [result, inKit, setResult]);

  // A polite update for screen readers once typing pauses, and one analytics event per outcome (never figures).
  useEffect(() => {
    if (!result) return;
    const t = window.setTimeout(() => {
      setAnnounce(fill(copy.result.live, { headline: headline(result), short: money(result.shortNet, 0), long: money(result.longNet, 0) }));
      if (lastBetter.current !== result.better) {
        lastBetter.current = result.better;
        track("result_shown", toolSlug, { type: result.better });
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [result]);

  /* ---- Actions ---- */
  const set = (patch: Partial<Form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setExample(false);
  };
  const reset = () => {
    setForm(defaultForm(content));
    setExample(false);
    setImported(null);
  };
  const clearAll = () => {
    deviceStorage.remove(storageKey);
    deviceStorage.remove(scenariosKey);
    reset();
    setScenarios([]);
    setImportedAt("");
    setConfirmClear(false);
  };
  const saveScenario = (name: string) => {
    setScenarios((l) => addScenario(l, name, form, content));
    setSaveMsg(copy.scenarios.saved);
    track("scenario_saved", toolSlug, { count: Math.min(scenarios.length + 1, content.settings.maxScenarios) });
    window.setTimeout(() => setSaveMsg(""), 2500);
  };
  const copyText = () => {
    track("copied", toolSlug, { type: "result" });
    return inputs && result ? resultText(inputs, result, content, disclaimer) : "";
  };
  const sourceName = imported ? (copy.toolNames[imported.source] ?? imported.source) : "";

  const panel = <ResultPanel i={inputs} r={result} copyText={copyText} onSave={saveScenario} saveMsg={saveMsg} full />;

  return (
    <div data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      {/* Example bar */}
      <div className={cn("mb-4 flex flex-wrap items-center gap-2 rounded-[16px] border p-3 md:p-3.5", example ? "border-amber-50 bg-amber-25" : "border-coral-100 bg-coral-25")}>
        <p className="m-0 min-w-[180px] flex-1 text-sm font-semibold text-ink-copy" data-example-banner={example ? "" : undefined}>
          {example ? (
            <>
              <strong className="text-ink">Example data.</strong> {copy.exampleBanner}
            </>
          ) : (
            copy.exampleHint
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(exampleForm(content));
            setExample(true);
            setImported(null);
          }}
          className="btn btn-outline min-h-11 bg-white"
        >
          {copy.buttons.example}
        </button>
      </div>

      {imported && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[16px] bg-steel-50 px-4 py-3" role="status" data-imported>
          <p className="m-0 min-w-[200px] flex-1 text-sm text-ink-copy">
            <span aria-hidden="true">↪ </span>
            <strong className="text-ink">{fill(copy.imported, { tool: sourceName })}.</strong>
          </p>
          <button
            type="button"
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2"
            onClick={() => {
              setForm(imported.prev);
              setImported(null);
            }}
            data-undo-import
          >
            {copy.buttons.undoImport}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="grid min-w-0 gap-4">
          {saveFailed && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              {copy.storageFailed}
            </p>
          )}
          <Inputs f={form} set={set} errors={parsed.errors} content={content} result={result} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" onClick={reset} className="btn btn-outline min-h-11">
              {copy.buttons.reset}
            </button>
            {confirmClear ? (
              <div className="flex flex-1 flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
                <span className="min-w-[200px] flex-1">{copy.clearConfirm}</span>
                <button type="button" onClick={clearAll} className="btn btn-coral min-h-11">
                  {copy.buttons.yesClear}
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-outline min-h-11">
                  {copy.buttons.cancel}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                {copy.buttons.clear}
              </button>
            )}
          </div>
        </div>

        {/* Result: stays in view on desktop */}
        <div className="min-w-0 max-md:hidden md:sticky md:top-6" data-result-desktop>
          {panel}
        </div>
      </div>

      <p className="sr-only-label" aria-live="polite" aria-atomic="true" data-live>
        {result ? announce : ""}
      </p>

      {/* Chart and sensitivity table */}
      {result && (
        <div className="mt-6 grid gap-6 rounded-[20px] border border-line bg-white p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-6" data-below>
          <Chart r={result} />
          <SensitivityTable rows={rows} />
        </div>
      )}

      <div className="mt-6">
        <Scenarios
          list={scenarios}
          content={content}
          onLoad={(s) => {
            setForm(cleanForm(s.form, content));
            setExample(false);
          }}
          onDelete={(id) => setScenarios((l) => removeScenario(l, id))}
        />
      </div>

      {/* Mobile: sticky result bar and full result sheet */}
      {ready && !sheet && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden" data-sticky-result>
          {result ? (
            <button type="button" onClick={() => setSheet(true)} className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[14px] border-none bg-transparent p-0" aria-label={`${headline(result)}. Open the full result`}>
              <Headline r={result} compact />
            </button>
          ) : (
            <p className="m-0 text-center text-sm font-bold text-brand">{copy.result.invalid}</p>
          )}
        </div>
      )}
      {sheet && (
        <div role="dialog" aria-modal="true" aria-label={copy.result.heading} className="fixed inset-0 z-[60] flex flex-col bg-cream md:hidden" data-sheet>
          <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
            <p className="m-0 text-lg font-extrabold text-ink">{copy.result.heading}</p>
            <button type="button" onClick={() => setSheet(false)} className="btn btn-outline min-h-11" autoFocus data-sheet-close>
              Back to the numbers
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">{panel}</div>
        </div>
      )}
    </div>
  );
}
