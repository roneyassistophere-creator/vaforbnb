"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { copy, needFields, steps, storageKey, toolSlug } from "@/content/tools/descriptionBuilder";
import { toolPath as scorerPath } from "@/content/tools/aiReadinessId";
import { toolPath as titlePath } from "@/content/tools/titleCheckerId";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import type { Figures } from "@/lib/tools/figures";
import { londonToday } from "@/lib/tools/figures";
import { readHandoffData, writeHandoff } from "@/lib/tools/handoff";
import { countChars } from "@/lib/tools/listing-text";
import {
  buildDescription,
  cleanFacts,
  defaultFacts,
  exampleFacts,
  factIntegrity,
  factsFromListingText,
  highlightsFromHouseRules,
  makeItFit,
  mergeImport,
  missingRequired,
  needsPanel,
  readContent,
  readiness,
  scorerPrefillHandoff,
  sectionIds,
  titleHandoff,
  validPlaces,
  whatThisMeans,
  type Facts,
  type Imported,
  type SectionId,
} from "@/lib/tools/description-builder";
import { FactSteps } from "./FactSteps";
import { OutputPanel, type Override } from "./OutputPanel";
import { useDescriptionResult } from "./ResultContext";

type Saved = { facts: Facts; overrides: Partial<Record<SectionId, Override>>; fitSteps: number[]; example: boolean; visited: number[]; importedAt: string; title: string };
type ImportState = { source: string; prev: Facts; kept: string[]; imported: Imported };

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

function cleanOverrides(x: unknown): Partial<Record<SectionId, Override>> {
  if (!x || typeof x !== "object") return {};
  const out: Partial<Record<SectionId, Override>> = {};
  for (const id of sectionIds) {
    const o = (x as Record<string, unknown>)[id] as Partial<Override> | undefined;
    if (o && typeof o.text === "string") out[id] = { text: o.text.slice(0, 20000), locked: o.locked === true, basedOn: typeof o.basedOn === "string" ? o.basedOn : "" };
  }
  return out;
}

export function DescriptionBuilderTool({ figures }: { figures: Figures }) {
  const content = useMemo(() => readContent(figures), [figures]);
  const T = content.templates;
  const router = useRouter();
  const [facts, setFacts] = useState<Facts>(defaultFacts);
  const [overrides, setOverrides] = useState<Partial<Record<SectionId, Override>>>({});
  /** History of "Make it fit" step counts (last = current), so Undo goes back one step. */
  const [fitHistory, setFitHistory] = useState<number[]>([0]);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [open, setOpen] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [example, setExample] = useState(false);
  const [imported, setImported] = useState<ImportState | null>(null);
  const [importedAt, setImportedAt] = useState("");
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState<SectionId>("listing");
  const [sheet, setSheet] = useState(false);
  const [houseMsg, setHouseMsg] = useState("");
  const { setResult } = useDescriptionResult();
  const fitSteps = fitHistory[fitHistory.length - 1] ?? 0;

  /* ---- Load and save (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const s = deviceStorage.read<Saved>(storageKey);
    let next = s ? cleanFacts(s.facts, T) : defaultFacts();
    let at = typeof s?.importedAt === "string" ? s.importedAt : "";
    let imp: ImportState | null = null;
    let t = typeof s?.title === "string" ? s.title.slice(0, 200) : "";
    // Arriving from the kit or another tool: import the shared details, once per hand-off, never overwriting answers.
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("kit") === "more-bookings" || q.get("from")) {
        const h = readHandoffData("listing-text", (d) => d);
        const data = h ? factsFromListingText(h.data, T) : null;
        if (h && data && h.createdAt !== at && h.source !== toolSlug) {
          const m = mergeImport(next, data);
          imp = { source: h.source, prev: next, kept: m.kept, imported: data };
          next = m.facts;
          at = h.createdAt;
          if (data.title) t = data.title;
          track("imported_from_scorer", toolSlug);
        }
      }
    } catch {
      // ignore
    }
    // Restoring once after hydration: the server render has no storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFacts(next);
    setOverrides(cleanOverrides(s?.overrides));
    setFitHistory(Array.isArray(s?.fitSteps) && s.fitSteps.every((n) => Number.isInteger(n) && n >= 0) && s.fitSteps.length ? s.fitSteps.slice(-10) : [0]);
    setExample(s?.example === true && !imp);
    setVisited(new Set([0, ...(Array.isArray(s?.visited) ? s.visited.filter((n) => Number.isInteger(n) && n >= 0 && n < steps.length) : [])]));
    setImported(imp);
    setImportedAt(at);
    setTitle(t);
    setReady(true);
  }, [T]);

  useEffect(() => {
    if (!ready) return;
    const v: Saved = { facts, overrides, fitSteps: fitHistory, example, visited: [...visited], importedAt, title };
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, v));
  }, [ready, facts, overrides, fitHistory, example, visited, importedAt, title]);

  /* ---- Derived: everything updates live ---- */
  const built = useMemo(() => buildDescription(facts, content, { fitSteps }), [facts, content, fitSteps]);
  const shown = useMemo(() => Object.fromEntries(sectionIds.map((id) => [id, overrides[id]?.text ?? built.sections[id]])) as Record<SectionId, string>, [overrides, built]);
  const shownBuilt = useMemo(() => ({ ...built, sections: shown, overLimitBy: Math.max(0, countChars(shown.listing, content.scorer.counting) - content.limits.listing) }), [built, shown, content]);
  const score = useMemo(() => readiness(facts, shownBuilt, content), [facts, shownBuilt, content]);
  const panel = useMemo(() => needsPanel(facts, shownBuilt, content), [facts, shownBuilt, content]);
  const integrity = useMemo(() => factIntegrity(built.sections, facts), [built.sections, facts]);
  const missing = missingRequired(facts).map((m) => copy.missing[m]);
  const meaning = whatThisMeans(shownBuilt, score, panel, content);
  const done = [
    !!facts.propertyType && facts.maxGuests !== null,
    !!facts.standout.trim() && facts.guestTypes.length > 0,
    facts.bedrooms === 0 ? !!facts.beds[0] : facts.beds.slice(0, facts.bedrooms).every(Boolean),
    !!facts.checkIn || !!facts.parking,
    validPlaces(facts).length > 0,
    visited.has(5),
  ];

  useEffect(() => {
    setResult({ facts, sections: shown, title, meaning, complete: missing.length === 0 });
  }, [facts, shown, title, meaning, missing.length, setResult]);

  /* ---- Actions ---- */
  const set = (patch: Partial<Facts>) => {
    setFacts((f) => ({ ...f, ...patch }));
    setExample(false);
  };
  const openStep = (n: number) => {
    setOpen(n);
    if (n >= 0) setVisited((v) => new Set(v).add(n));
  };
  const loadExample = () => {
    setFacts(exampleFacts(T));
    setOverrides({});
    setFitHistory([0]);
    setExample(true);
    setImported(null);
    setVisited(new Set([0, 1, 2, 3, 4, 5]));
    setOpen(-1);
  };
  const reset = () => {
    setFacts(defaultFacts());
    setOverrides({});
    setFitHistory([0]);
    setExample(false);
    setImported(null);
    setTitle("");
    setVisited(new Set([0]));
    setOpen(0);
  };
  const clearAll = () => {
    deviceStorage.remove(storageKey);
    reset();
    setImportedAt("");
    setConfirmClear(false);
  };
  const addIt = (need: string) => {
    const target = needFields[need];
    if (!target) return;
    setSheet(false);
    openStep(target.step);
    requestAnimationFrame(() => {
      const el = document.getElementById(target.field);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    });
  };
  const allText = () => sectionIds.map((id) => `${content.names[id]}\n\n${shown[id] || "-"}`).join("\n\n\n");
  const scoreThis = () => {
    writeHandoff(scorerPrefillHandoff(facts, shown, title));
    track("score_this_clicked", toolSlug);
    router.push(`${scorerPath}?from=${toolSlug}`);
  };
  const backToTitle = () => {
    writeHandoff(titleHandoff(facts, shown, title));
    track("next_step_clicked", toolSlug, { type: "title-checker" });
    router.push(`${titlePath}?from=${toolSlug}`);
  };
  const importHouseRules = () => {
    const h = readHandoffData("house-rules", (d) => d);
    const hl = h ? highlightsFromHouseRules(h.data) : null;
    if (hl) set({ houseRules: hl });
    setHouseMsg(hl ? copy.honest.houseRulesAdded : copy.honest.houseRulesNone);
  };

  const sourceName = imported ? (copy.toolNames[imported.source] ?? imported.source) : "";

  const output = (
    <OutputPanel
      content={content}
      built={built}
      shown={shown}
      overrides={overrides}
      onEdit={(id, text) => setOverrides((o) => ({ ...o, [id]: { text, locked: o[id]?.locked ?? false, basedOn: o[id]?.basedOn ?? built.sections[id] } }))}
      onLock={(id, locked) => setOverrides((o) => (o[id] ? { ...o, [id]: { ...o[id]!, locked } } : o))}
      onUpdate={(id) =>
        setOverrides((o) => {
          const next = { ...o };
          delete next[id];
          return next;
        })
      }
      onKeep={(id) => setOverrides((o) => (o[id] ? { ...o, [id]: { ...o[id]!, basedOn: built.sections[id] } } : o))}
      tab={tab}
      onTab={setTab}
      readiness={score}
      panel={panel}
      integrityOk={integrity.ok}
      missing={missing}
      fitMoved={built.movedItems}
      canUndoFit={fitSteps > 0}
      onMakeFit={() => {
        const r = makeItFit(facts, content, fitSteps);
        if (r.fitSteps !== fitSteps) setFitHistory((h) => [...h, r.fitSteps]);
        track("make_it_fit_used", toolSlug, { count: r.fitSteps });
      }}
      onUndoFit={() => setFitHistory((h) => {
        // Back exactly one "Make it fit" step.
        const cur = h[h.length - 1] ?? 0;
        return cur > 0 ? [...h.slice(-9), cur - 1] : h;
      })}
      onAddIt={addIt}
      onScore={scoreThis}
      onTitle={backToTitle}
      allText={allText}
      onDownload={() => {
        track("file_downloaded", toolSlug, { type: "txt" });
        downloadText(`airbnb-description-${londonToday()}.txt`, allText());
      }}
    />
  );

  return (
    <div data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      {/* Example bar */}
      <div className={cn("mb-4 flex flex-wrap items-center gap-2 rounded-[16px] border p-3 md:p-3.5", example ? "border-amber-50 bg-amber-25" : "border-violet-100 bg-violet-25")}>
        <p className="m-0 min-w-[180px] flex-1 text-sm font-semibold text-ink-copy" data-example-banner={example ? "" : undefined}>
          {example ? (
            <>
              <strong className="text-ink">Example data.</strong> {copy.exampleBanner}
            </>
          ) : (
            copy.exampleHint
          )}
        </p>
        <button type="button" onClick={loadExample} className="btn btn-outline min-h-11 bg-white">
          {copy.buttons.example}
        </button>
      </div>

      {imported && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[16px] bg-steel-50 px-4 py-3" role="status" data-imported>
          <p className="m-0 min-w-[200px] flex-1 text-sm text-ink-copy">
            <span aria-hidden="true">↪ </span>
            <strong className="text-ink">{fill(copy.imported, { tool: sourceName })}.</strong>
            {imported.kept.length > 0 && <> {fill(copy.importedKept, { n: imported.kept.length })}</>}
          </p>
          {imported.kept.length > 0 && (
            <button
              type="button"
              className="btn btn-outline min-h-11 bg-white"
              onClick={() => {
                setFacts(mergeImport(imported.prev, imported.imported, true).facts);
                setImported({ ...imported, kept: [] });
              }}
            >
              {copy.buttons.replaceToo}
            </button>
          )}
          <button
            type="button"
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2"
            onClick={() => {
              setFacts(imported.prev);
              setImported(null);
            }}
            data-undo-import
          >
            {copy.buttons.undoImport}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Fact form */}
        <div className="grid min-w-0 gap-4">
          <div>
            <p className="m-0 mb-1.5 text-sm font-bold text-ink">{fill(copy.stepsDone, { done: done.filter(Boolean).length, total: steps.length })}</p>
            <div className="h-2 max-w-[320px] overflow-hidden rounded-full bg-fog" aria-hidden="true">
              <div className="h-full rounded-full bg-violet transition-[width]" style={{ width: `${(done.filter(Boolean).length / steps.length) * 100}%` }} />
            </div>
          </div>
          {saveFailed && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              {copy.storageFailed}
            </p>
          )}
          <FactSteps f={facts} set={set} content={content} open={open} setOpen={openStep} done={done} onHouseRules={importHouseRules} houseRulesMsg={houseMsg} />
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

        {/* Live output: stays in view on desktop */}
        <div className="min-w-0 max-md:hidden md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:overflow-y-auto" data-output-desktop>
          {output}
        </div>
      </div>

      {/* Mobile: sticky button and full-screen sheet */}
      {ready && !sheet && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden" data-sticky-see>
          <button type="button" onClick={() => setSheet(true)} className="btn btn-violet min-h-12 w-full">
            {fill(copy.sticky, { score: `${score.points}/${score.max}` })}
          </button>
        </div>
      )}
      {sheet && (
        <div role="dialog" aria-modal="true" aria-label={copy.output.heading} className="fixed inset-0 z-[60] flex flex-col bg-cream md:hidden" data-sheet>
          <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
            <p className="m-0 text-lg font-extrabold text-ink">{copy.output.heading}</p>
            <button type="button" onClick={() => setSheet(false)} className="btn btn-outline min-h-11" data-sheet-close autoFocus>
              {copy.backToForm}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">{output}</div>
        </div>
      )}
    </div>
  );
}
