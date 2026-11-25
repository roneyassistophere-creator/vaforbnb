"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { copy, sectionTitles, storageKey, toolSlug } from "@/content/tools/houseRules";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import type { Figures } from "@/lib/tools/figures";
import { writeHandoff } from "@/lib/tools/handoff";
import {
  buildRules,
  cleanAnswers,
  defaultAnswers,
  exampleAnswers,
  fullText,
  listingText,
  platformChecklist,
  readContent,
  rulesHandoff,
  signRules,
  type Answers,
} from "@/lib/tools/house-rules";
import { downloadRulesPdf, downloadSignPdf } from "./pdf";
import { Preview, type PreviewTab } from "./Preview";
import { Questions } from "./Questions";
import { useHouseRulesResult } from "./ResultContext";

type Saved = { answers: Answers; visited: number[]; ticked: string[]; example: boolean };

const fileSlug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "house-rules";

export function HouseRulesTool({ figures }: { figures: Figures }) {
  const content = useMemo(() => readContent(figures), [figures]);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [example, setExample] = useState(false);
  const [tab, setTab] = useState<PreviewTab>("full");
  const [sheet, setSheet] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [guideMessage, setGuideMessage] = useState("");
  const shownWarnings = useRef(new Set<string>());
  const backRef = useRef<HTMLButtonElement>(null);
  const { setRules } = useHouseRulesResult();
  const router = useRouter();

  /* ---- Load and save (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const s = deviceStorage.read<Saved>(storageKey);
    // Restoring once after hydration: the server render has no storage.
    if (s) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(cleanAnswers(s.answers));
      setVisited(new Set([0, ...(Array.isArray(s.visited) ? s.visited.filter((n) => Number.isInteger(n) && n >= 0 && n < 8) : [])]));
      setTicked(new Set(Array.isArray(s.ticked) ? s.ticked.filter((x) => typeof x === "string") : []));
      setExample(s.example === true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const value: Saved = { answers, visited: [...visited], ticked: [...ticked], example };
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, value));
  }, [ready, answers, visited, ticked, example]);

  /* ---- Derived ---- */
  const rules = useMemo(() => buildRules(answers, content), [answers, content]);
  const listing = useMemo(() => listingText(rules), [rules]);
  const checklist = useMemo(() => platformChecklist(answers, content), [answers, content]);
  const sign = useMemo(() => signRules(rules), [rules]);
  const text = useMemo(() => fullText(rules), [rules]);

  useEffect(() => {
    setRules(rules);
    for (const w of rules.warnings) {
      if (shownWarnings.current.has(w.type)) continue;
      shownWarnings.current.add(w.type);
      track("checker_warning_shown", toolSlug, { type: w.type });
    }
  }, [rules, setRules]);

  /* ---- Mobile preview sheet ---- */
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    backRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      requestAnimationFrame(() => document.getElementById("hr-preview-open")?.focus());
    };
  }, [sheet]);

  /* ---- Actions ---- */
  const set = (patch: Partial<Answers>) => {
    setAnswers((a) => ({ ...a, ...patch }));
    setGuideMessage("");
  };
  const openSection = (i: number) => {
    setOpen(i);
    if (i >= 0) setVisited((v) => new Set(v).add(i));
  };
  const pickTab = (t: PreviewTab) => {
    setTab(t);
    track("preview_tab_viewed", toolSlug, { type: t });
  };
  const name = fileSlug(answers.propertyName || "house-rules");
  const checklistText = ["Airbnb", ...checklist.filter((c) => c.platform === "airbnb").map((c) => `[ ] ${c.text}`), "", "Booking.com", ...checklist.filter((c) => c.platform === "booking").map((c) => `[ ] ${c.text}`)].join("\n");

  const toGuide = () => {
    const ok = writeHandoff(rulesHandoff(rules));
    track("sent_to_welcome_guide", toolSlug);
    const guide = toolById("welcome-guide-builder");
    if (ok && guide && isLive(guide)) window.location.href = toolLink(guide);
    else setGuideMessage(ok ? copy.actions.toGuideSaved : copy.storageFailed);
  };

  const done = visited.size;

  const preview = (
    <Preview
      tab={tab}
      onTab={pickTab}
      rules={rules}
      listing={listing}
      limit={content.listingLimit}
      checklist={checklist}
      ticked={ticked}
      onTick={(id) => setTicked((t) => (t.has(id) ? new Set([...t].filter((x) => x !== id)) : new Set(t).add(id)))}
      sign={sign}
      fullText={text}
      checklistText={checklistText}
      onCopied={(type) => track("copied", toolSlug, { type })}
      onPdf={() => (void downloadRulesPdf(rules, `${name}-house-rules.pdf`), track("file_downloaded", toolSlug, { type: "pdf" }))}
      onTxt={() => (downloadText(`${name}-house-rules.txt`, text, "text/plain"), track("file_downloaded", toolSlug, { type: "txt" }))}
      onSignPdf={() => (void downloadSignPdf(answers.propertyName.trim() || "House rules", sign, `${name}-house-rules-sign.pdf`), track("file_downloaded", toolSlug, { type: "sign" }))}
      onToGuide={toGuide}
      onToBuilder={
        isLive(toolById("ai-ready-description-builder"))
          ? () => {
              // Saves the rules (with their highlights) on this device; the builder's "Import house rule highlights" reads them.
              writeHandoff(rulesHandoff(rules));
              track("next_step_clicked", toolSlug, { type: "description-builder" });
              router.push(toolLink(toolById("ai-ready-description-builder")!));
            }
          : undefined
      }
      guideMessage={guideMessage}
    />
  );

  return (
    <div data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-start">
        {/* Questions */}
        <div className="grid min-w-0 gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-[200px] flex-1">
              <p className="m-0 mb-1.5 text-sm font-bold text-ink" aria-live="polite">
                {copy.progress.replace("{done}", String(done)).replace("{total}", String(sectionTitles.length))}
              </p>
              <div className="h-2 max-w-[320px] overflow-hidden rounded-full bg-fog" aria-hidden="true">
                <div className="h-full rounded-full bg-green transition-[width]" style={{ width: `${(done / sectionTitles.length) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnswers(exampleAnswers());
                  setExample(true);
                  setGuideMessage("");
                }}
                className="btn btn-outline min-h-11"
              >
                {copy.example}
              </button>
              <button type="button" onClick={() => (setAnswers(defaultAnswers()), setExample(false))} className="btn btn-outline min-h-11">
                {copy.reset}
              </button>
            </div>
          </div>
          {example && (
            <p className="m-0 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-bold text-ink" role="status">
              {copy.exampleBanner}
            </p>
          )}
          {saveFailed && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              {copy.storageFailed}
            </p>
          )}
          <Questions a={answers} set={set} rules={rules} open={open} setOpen={openSection} visited={visited} />
          <div>
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
                <span className="flex-1">{copy.clearConfirm}</span>
                <button
                  type="button"
                  onClick={() => {
                    deviceStorage.remove(storageKey);
                    setAnswers(defaultAnswers());
                    setVisited(new Set([0]));
                    setTicked(new Set());
                    setExample(false);
                    setOpen(0);
                    setConfirmClear(false);
                  }}
                  className="btn btn-coral min-h-11"
                >
                  Yes, clear
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-outline min-h-11">
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                {copy.clear}
              </button>
            )}
          </div>
        </div>

        {/* Preview: sticky on desktop, a full-screen sheet on mobile */}
        <div
          role={sheet ? "dialog" : undefined}
          aria-modal={sheet ? true : undefined}
          aria-label={sheet ? "Preview my rules" : undefined}
          className={cn(
            "min-w-0 md:sticky md:top-6 md:block md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:overscroll-contain",
            sheet ? "fixed inset-0 z-50 block overflow-y-auto bg-cream p-3 pb-24 md:static md:bg-transparent md:p-0" : "hidden",
          )}
          data-preview-sheet={sheet ? "" : undefined}
        >
          {sheet && (
            <button ref={backRef} type="button" onClick={() => setSheet(false)} className="btn btn-outline mb-3 min-h-12 w-full bg-white md:hidden">
              ← {copy.backButton}
            </button>
          )}
          {preview}
        </div>
      </div>

      {/* Mobile: sticky "Preview my rules" */}
      {!sheet && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
          <button id="hr-preview-open" type="button" onClick={() => setSheet(true)} className="btn btn-ink min-h-12 w-full">
            {copy.previewButton}
            {rules.warnings.length > 0 && <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-[12px]">{rules.warnings.length} to check</span>}
          </button>
        </div>
      )}
    </div>
  );
}
