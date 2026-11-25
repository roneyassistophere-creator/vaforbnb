"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy, historyKey, steps, storageKey, toolSlug } from "@/content/tools/aiReadiness";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  addToHistory,
  changeSinceLast,
  changeText,
  cleanHistory,
  cleanInputs,
  defaultInputs,
  descriptionOf,
  exampleInputs,
  fixListText,
  improvedExampleInputs,
  readContent,
  scoreListing,
  simulateSearch,
  type CheckId,
  type HistoryEntry,
  type Inputs,
} from "@/lib/tools/ai-readiness";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import type { Figures } from "@/lib/tools/figures";
import { londonToday } from "@/lib/tools/figures";
import { LeadPdfModal } from "../LeadPdfModal";
import { InputSteps } from "./InputSteps";
import { downloadReportPdf } from "./pdf";
import { useAiReadinessResult } from "./ResultContext";
import { ResultTabs, type ResultTab } from "./ResultTabs";
import { ScorePanel } from "./ScorePanel";

type Example = "" | "weak" | "improved";
type Saved = { inputs: Inputs; scored: boolean; ticked: string[]; example: Example; visited: number[] };

const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

export function AiReadinessTool({ figures }: { figures: Figures }) {
  const content = useMemo(() => readContent(figures), [figures]);
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [ready, setReady] = useState(false);
  const [scored, setScored] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [example, setExample] = useState<Example>("");
  const [tab, setTab] = useState<ResultTab>("fixes");
  const [focusCheck, setFocusCheck] = useState<CheckId | null>(null);
  const [simQuery, setSimQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [needText, setNeedText] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { setResult } = useAiReadinessResult();

  /* ---- Load and save (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const s = deviceStorage.read<Saved>(storageKey);
    // Restoring once after hydration: the server render has no storage.
    if (s) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputs(cleanInputs(s.inputs));
      setScored(s.scored === true);
      setTicked(new Set(Array.isArray(s.ticked) ? s.ticked.filter((x) => typeof x === "string") : []));
      setExample(s.example === "weak" || s.example === "improved" ? s.example : "");
      setVisited(new Set([0, ...(Array.isArray(s.visited) ? s.visited.filter((n) => Number.isInteger(n) && n >= 0 && n < steps.length) : [])]));
    }
    setHistory(cleanHistory(deviceStorage.read(historyKey)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const value: Saved = { inputs, scored, ticked: [...ticked], example, visited: [...visited] };
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, value));
  }, [ready, inputs, scored, ticked, example, visited]);

  useEffect(() => {
    if (ready) deviceStorage.write(historyKey, history);
  }, [ready, history]);

  /* ---- Derived: the score updates live once it has been shown ---- */
  const live = useMemo(() => scoreListing(inputs, content), [inputs, content]);
  const score = scored ? live : null;
  const simulation = useMemo(() => (simQuery ? simulateSearch(simQuery, inputs, content, live.analysis) : null), [simQuery, inputs, content, live]);
  const last = history[history.length - 1];
  const change = !score ? "" : last && last.score !== score.total ? changeText(score.total - last.score) : changeText(changeSinceLast(history));

  useEffect(() => {
    setResult(score ? { score, inputs, model: content.model } : null);
  }, [score, inputs, content, setResult]);

  /* ---- Actions ---- */
  const set = (patch: Partial<Inputs>) => {
    setInputs((i) => ({ ...i, ...patch }));
    setNeedText(false);
  };
  const openStep = (n: number) => {
    setOpen(n);
    if (n >= 0) setVisited((v) => new Set(v).add(n));
  };
  const record = (i: Inputs) => {
    const s = scoreListing(i, content);
    setHistory((h) => addToHistory(h, { at: new Date().toISOString(), score: s.total, band: s.band.label, version: s.version }));
    track("score_shown", toolSlug, { band: s.band.id });
    setScored(true);
    setTab("fixes");
    if (isMobile()) requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const scoreNow = () => {
    if (!descriptionOf(inputs)) {
      setNeedText(true);
      openStep(0);
      requestAnimationFrame(() => document.getElementById(inputs.oneBox ? "air-all" : "air-description")?.focus());
      return;
    }
    record(inputs);
  };
  const loadExample = (kind: "weak" | "improved") => {
    const i = kind === "weak" ? exampleInputs() : improvedExampleInputs();
    setInputs(i);
    setExample(kind);
    setNeedText(false);
    setVisited(new Set([0, 1, 2, 3]));
    record(i);
  };
  const goResults = (t: ResultTab) => {
    setTab(t);
    requestAnimationFrame(() => document.getElementById("air-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const showCheck = (id: CheckId) => {
    setFocusCheck(null);
    setTab("breakdown");
    requestAnimationFrame(() => setFocusCheck(id));
  };
  const onSimulate = (q: string, source: string) => {
    setSimQuery(q.trim().slice(0, 200));
    track("simulator_used", toolSlug, { type: source });
  };
  const clearAll = () => {
    deviceStorage.remove(storageKey);
    deviceStorage.remove(historyKey);
    setInputs(defaultInputs());
    setScored(false);
    setHistory([]);
    setTicked(new Set());
    setExample("");
    setVisited(new Set([0]));
    setOpen(0);
    setSimQuery("");
    setConfirmClear(false);
  };

  return (
    <div data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      {/* Example bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[16px] border border-violet-100 bg-violet-25 p-3 md:p-3.5">
        <p className="m-0 min-w-[180px] flex-1 text-sm font-semibold text-ink-copy">
          {example === "weak" ? copy.exampleBanner : example === "improved" ? copy.improvedBanner : "Not sure what a good listing looks like? Load a sample and watch the score change."}
        </p>
        {example === "weak" ? (
          <button type="button" onClick={() => loadExample("improved")} className="btn btn-violet min-h-11">
            {copy.buttons.improved} →
          </button>
        ) : (
          <button type="button" onClick={() => loadExample("weak")} className="btn btn-outline min-h-11 bg-white">
            {copy.buttons.example}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
        {/* Inputs */}
        <div className="grid min-w-0 gap-4">
          <div>
            <p className="m-0 mb-1.5 text-sm font-bold text-ink">{copy.progress.replace("{done}", String(visited.size)).replace("{total}", String(steps.length))}</p>
            <div className="h-2 max-w-[320px] overflow-hidden rounded-full bg-fog" aria-hidden="true">
              <div className="h-full rounded-full bg-violet transition-[width]" style={{ width: `${(visited.size / steps.length) * 100}%` }} />
            </div>
          </div>
          {saveFailed && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              {copy.storageFailed}
            </p>
          )}
          <InputSteps i={inputs} set={set} content={content} open={open} setOpen={openStep} visited={visited} mbpsFound={live.analysis.mbps.length > 0} />
          {needText && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              Paste your listing description in step 1 first.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={scoreNow} className="btn btn-coral min-h-12 px-6">
              {scored ? copy.buttons.rescore : copy.buttons.score}
            </button>
            <button
              type="button"
              onClick={() => {
                setInputs(defaultInputs());
                setScored(false);
                setExample("");
                setSimQuery("");
              }}
              className="btn btn-outline min-h-12"
            >
              {copy.buttons.reset}
            </button>
          </div>
          <div>
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
                <span className="flex-1">{copy.clearConfirm}</span>
                <button type="button" onClick={clearAll} className="btn btn-coral min-h-11">
                  Yes, clear
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-outline min-h-11">
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                {copy.buttons.clear}
              </button>
            )}
          </div>
        </div>

        {/* Score panel: stays in view on desktop */}
        <div ref={panelRef} className="min-w-0 scroll-mt-4 md:sticky md:top-6">
          <ScorePanel
            score={score}
            change={change}
            onCheck={(id) => {
              showCheck(id);
              requestAnimationFrame(() => document.getElementById("air-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
            }}
            onSeeFixes={() => goResults("fixes")}
            onReport={() => setModal(true)}
            fixListText={() => fixListText(live)}
            onCopiedFixes={() => track("copied", toolSlug, { type: "fix-list" })}
          />
        </div>
      </div>

      {/* Results */}
      {score && (
        <div className="mt-6 scroll-mt-4">
          <ResultTabs
            tab={tab}
            onTab={setTab}
            score={score}
            content={content}
            ticked={ticked}
            onTick={(id) => setTicked((t) => (t.has(id) ? new Set([...t].filter((x) => x !== id)) : new Set(t).add(id)))}
            onFixCopied={(check) => track("fix_copied", toolSlug, { check })}
            simQuery={simQuery}
            simulation={simulation}
            onSimulate={onSimulate}
            focusCheck={focusCheck}
            history={history}
            onClearHistory={() => setHistory([])}
          />
        </div>
      )}

      {/* Mobile: sticky score bar */}
      {score && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden" data-sticky-score>
          <button type="button" onClick={() => goResults("fixes")} className={cn("btn min-h-12 w-full")} style={{ background: score.band.bg, color: score.band.fg }}>
            {copy.sticky.replace("{score}", String(score.total))}
          </button>
        </div>
      )}

      <LeadPdfModal
        open={modal}
        onClose={() => setModal(false)}
        toolSlug={toolSlug}
        copy={copy.pdfModal}
        makePdf={async () => {
          track("report_requested", toolSlug);
          await downloadReportPdf(live, content, `ai-readiness-report-${londonToday()}.pdf`, { date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) });
        }}
      />
    </div>
  );
}
