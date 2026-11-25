"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { copy, listKey, steps, storageKey, toolSlug } from "@/content/tools/photoShotList";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import type { Figures } from "@/lib/tools/figures";
import { londonToday } from "@/lib/tools/figures";
import { readHandoffData } from "@/lib/tools/handoff";
import {
  addCustomShot,
  applyListState,
  captionsText,
  buildShotList,
  cleanListState,
  cleanSetup,
  defaultListState,
  defaultSetup,
  exampleSetup,
  factsFromHandoff,
  listTotals,
  mergeImport,
  moveShot,
  moveTo,
  prepSections,
  progress,
  readContent,
  removeShot,
  resetOrder,
  shotListCsv,
  toggleTaken,
  type ListState,
  type Setup,
  type SharedFacts,
} from "@/lib/tools/photo-shot-list";
import { CopyButton } from "../CopyButton";
import { downloadShotListPdf, printShotList } from "./exports";
import { PhotoTabs, type Tab } from "./PhotoTabs";
import { usePhotoResult } from "./ResultContext";
import { SetupSteps } from "./SetupSteps";
import { ShootMode } from "./ShootMode";
import { SidePanel } from "./SidePanel";

type Imported = { source: string; at: string; prev: Setup; kept: string[]; facts: SharedFacts };
type Saved = { setup: Setup; example: boolean; visited: number[]; imported?: { source: string; at: string; kept: string[] } | null; importedAt?: string };

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));
const band = (n: number, min: number, max: number) => (n < min ? "under" : n > max ? "over" : "in-range");

export function PhotoShotListTool({ figures, vague }: { figures: Figures; vague: string[] }) {
  const content = useMemo(() => readContent(figures), [figures]);
  const R = content.rules;
  const [setup, setSetup] = useState<Setup>(defaultSetup);
  const [st, setStRaw] = useState<ListState>(defaultListState);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [open, setOpen] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [example, setExample] = useState(false);
  const [imported, setImported] = useState<Imported | null>(null);
  const [importedAt, setImportedAt] = useState("");
  const [tab, setTab] = useState<Tab>("order");
  const [shooting, setShooting] = useState(false);
  const { setResult } = usePhotoResult();
  const lastBand = useRef("");

  /* ---- Load and save (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const saved = deviceStorage.read<Saved>(storageKey);
    let next = saved ? cleanSetup(saved.setup) : defaultSetup();
    let at = typeof saved?.importedAt === "string" ? saved.importedAt : "";
    let imp: Imported | null = null;
    // Arriving from the kit (or a linked tool): import the shared basics, once per hand-off, never overwriting answers.
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("kit") === "more-bookings" || q.get("from")) {
        const h = readHandoffData("listing-text", (d) => d);
        const facts = h ? factsFromHandoff(h.data) : null;
        if (h && facts && h.createdAt !== at) {
          const m = mergeImport(next, facts);
          imp = { source: h.source, at: h.createdAt, prev: next, kept: m.kept, facts };
          next = m.setup;
          at = h.createdAt;
          track("imported_from_description", toolSlug);
        }
      }
    } catch {
      // ignore
    }
    // Restoring once after hydration: the server render has no storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSetup(next);
    setExample(saved?.example === true && !imp);
    setVisited(new Set([0, ...(Array.isArray(saved?.visited) ? saved.visited.filter((n) => Number.isInteger(n) && n >= 0 && n < steps.length) : [])]));
    setImported(imp);
    setImportedAt(at);
    setStRaw(cleanListState(deviceStorage.read(listKey)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const value: Saved = { setup, example, visited: [...visited], importedAt, imported: imported ? { source: imported.source, at: imported.at, kept: imported.kept } : null };
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, value));
  }, [ready, setup, example, visited, importedAt, imported]);

  // Taken ticks, order and edits save instantly.
  useEffect(() => {
    if (ready) deviceStorage.write(listKey, st);
  }, [ready, st]);

  /* ---- Derived: the list updates live ---- */
  const built = useMemo(() => buildShotList(setup, content), [setup, content]);
  const shots = useMemo(() => applyListState(built, st, R), [built, st, R]);
  const totals = useMemo(() => listTotals(shots, content), [shots, content]);
  const prog = progress(shots, st);
  const prep = useMemo(() => prepSections(built.items, R), [built.items, R]);

  useEffect(() => {
    setResult({ list: built, rules: R, count: shots.length, guestTypes: setup.guestTypes, bedrooms: setup.bedrooms });
  }, [built, R, shots.length, setup.guestTypes, setup.bedrooms, setResult]);

  // One analytics event per shot-count band (never facts or captions).
  useEffect(() => {
    if (!ready || !setup.standout) return;
    const b = band(totals.shots, content.photoCount.min, content.photoCount.max);
    if (b === lastBand.current) return;
    const t = window.setTimeout(() => {
      lastBand.current = b;
      track("list_built", toolSlug, { band: b });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [ready, totals.shots, setup.standout, content.photoCount]);

  /* ---- Actions ---- */
  const set = (patch: Partial<Setup>) => {
    setSetup((x) => ({ ...x, ...patch }));
    setExample(false);
  };
  const setSt = useCallback((f: (s: ListState) => ListState) => setStRaw((s) => f(s)), []);
  const openStep = (n: number) => {
    setOpen(n);
    if (n >= 0) setVisited((v) => new Set(v).add(n));
  };
  const loadExample = () => {
    setSetup(exampleSetup(R));
    setStRaw(defaultListState());
    setExample(true);
    setImported(null);
    setVisited(new Set([0, 1, 2, 3]));
    setOpen(-1);
  };
  const reset = () => {
    setSetup(defaultSetup());
    setStRaw(defaultListState());
    setExample(false);
    setImported(null);
    setVisited(new Set([0]));
    setOpen(0);
  };
  const clearAll = () => {
    deviceStorage.remove(storageKey);
    deviceStorage.remove(listKey);
    reset();
    setImportedAt("");
    setConfirmClear(false);
  };
  const goList = () => requestAnimationFrame(() => document.getElementById("ps-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  const onAt = useCallback((id: string) => setStRaw((s) => (s.shootAt === id ? s : { ...s, shootAt: id })), []);
  const onTaken = useCallback((id: string, on: boolean) => setStRaw((s) => toggleTaken(s, id, on)), []);
  const property = "";
  const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const pdf = async () => {
    track("file_downloaded", toolSlug, { type: "pdf" });
    await downloadShotListPdf(shots, st, prep, { fileName: `photo-shot-list-${londonToday()}.pdf`, property, date: today() });
  };
  const csv = () => {
    track("file_downloaded", toolSlug, { type: "csv" });
    downloadText(`photo-shot-list-${londonToday()}.csv`, shotListCsv(shots, st), "text/csv");
  };
  const print = () => {
    track("file_downloaded", toolSlug, { type: "print" });
    printShotList(shots, st, prep, property);
  };

  const sourceName = imported ? (copy.toolNames[imported.source] ?? imported.source) : "";

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
                setSetup(mergeImport(imported.prev, imported.facts, true).setup);
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
              setSetup(imported.prev);
              setImported(null);
            }}
            data-undo-import
          >
            {copy.buttons.undoImport}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
        {/* Setup form */}
        <div className="grid min-w-0 gap-4">
          <div>
            <p className="m-0 mb-1.5 text-sm font-bold text-ink">{fill(copy.stepsDone, { done: visited.size, total: steps.length })}</p>
            <div className="h-2 max-w-[320px] overflow-hidden rounded-full bg-fog" aria-hidden="true">
              <div className="h-full rounded-full bg-coral transition-[width]" style={{ width: `${(visited.size / steps.length) * 100}%` }} />
            </div>
          </div>
          {saveFailed && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              {copy.storageFailed}
            </p>
          )}
          <SetupSteps s={setup} set={set} content={content} open={open} setOpen={openStep} visited={visited} />
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

        {/* First five and totals: stays in view on desktop */}
        <div className="min-w-0 md:sticky md:top-6">
          <SidePanel shots={shots} totals={totals} onSee={goList} />
        </div>
      </div>

      {/* Shoot-day mode and exports */}
      <div className="mt-6 grid gap-3 rounded-[20px] border border-line bg-white p-4 md:flex md:flex-wrap md:items-center md:justify-between md:p-5" data-toolbar>
        <button type="button" onClick={() => setShooting(true)} className="btn btn-coral min-h-14 px-7 text-lg" data-start-shoot disabled={!shots.length}>
          Start shoot-day mode
        </button>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={pdf} className="btn btn-outline min-h-11" data-download="pdf">
            Download PDF
          </button>
          <button type="button" onClick={print} className="btn btn-outline min-h-11">
            Print
          </button>
          <button type="button" onClick={csv} className="btn btn-outline min-h-11" data-download="csv">
            Download CSV
          </button>
          <CopyButton getText={() => captionsText(shots)} label="Copy all captions" copiedLabel="Captions copied" className="min-h-11" onCopied={() => track("captions_copied", toolSlug)} />
        </div>
      </div>

      <div className="mt-4">
        <PhotoTabs
          tab={tab}
          onTab={setTab}
          content={content}
          setup={setup}
          items={built.items}
          shots={shots}
          st={st}
          setSt={setSt}
          vague={vague}
          progressText={`${prog.taken} of ${prog.total} taken`}
          isCustomOrder={!!st.order}
          onPdf={pdf}
          a={{
            onTaken,
            onNote: (id, v) => setStRaw((s) => ({ ...s, notes: { ...s.notes, [id]: v } })),
            onCaption: (id, v) => setStRaw((s) => ({ ...s, captions: { ...s.captions, [id]: v } })),
            onMove: (id, d) => setStRaw((s) => moveShot(s, shots, id, d)),
            onRemove: (id) => setStRaw((s) => removeShot(s, id)),
            onDragStart: () => {},
            onDrop: () => {},
            onReset: () => setStRaw((s) => resetOrder(s)),
            onAddCustom: (n, c) => setStRaw((s) => addCustomShot(s, n, c)),
          }}
          dragTo={(from, to) => setStRaw((s) => moveTo(s, shots, from, to))}
        />
      </div>

      {/* Mobile: sticky "See my shot list" */}
      {ready && shots.length > 0 && !shooting && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden" data-sticky-see>
          <button type="button" onClick={goList} className="btn btn-coral min-h-12 w-full">
            {fill(copy.panel.see, { n: shots.length })}
          </button>
        </div>
      )}

      {shooting && <ShootMode shots={shots} st={st} onTaken={onTaken} onAt={onAt} onClose={() => (setShooting(false), goList())} />}
    </div>
  );
}
