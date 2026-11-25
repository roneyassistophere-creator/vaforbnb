"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compareKey, copy, propertyTypeLabels, storageKey, toolSlug } from "@/content/tools/titleChecker";
import { toolSlug as scorerSlug } from "@/content/tools/aiReadinessId";
import { toolSlug as builderSlug } from "@/content/tools/descriptionBuilderId";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import type { Figures } from "@/lib/tools/figures";
import { readHandoffData } from "@/lib/tools/handoff";
import {
  addToCompare,
  checklistText,
  checkTitle,
  cleanCompare,
  cleanInputs,
  defaultInputs,
  exampleInputs,
  LIMITS,
  parseTitleImport,
  passedText,
  propertyTypes,
  readContent,
  type BuilderChoices,
  type Details,
  type Inputs,
} from "@/lib/tools/title-checker";
import { CopyButton } from "../CopyButton";
import { ChoiceChips } from "../ChoiceChips";
import { NumberField } from "../NumberField";
import { Checklist, HighlightedTitle, SearchCard, Verdict } from "./ResultParts";
import { useTitleCheckerResult } from "./ResultContext";
import { ResultTabs, type Tab } from "./ResultTabs";

/** `imported`: the title came from the AI-readiness scorer; `importedAt`: that hand-off, so it is imported once, not on every visit. */
type Saved = { inputs: Inputs; imported?: boolean; importedAt?: string };

function TextField({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold text-ink">
        {label}
      </label>
      <p id={`${id}-hint`} className="m-0 text-[13px] text-muted">
        {hint}
      </p>
      <input id={id} type="text" className="field min-h-12" value={value} maxLength={LIMITS.place} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-hint`} autoComplete="off" />
    </div>
  );
}

export function TitleCheckerTool({ figures }: { figures: Figures }) {
  const content = useMemo(() => readContent(figures), [figures]);
  const { rules } = content;
  const [inputs, setInputs] = useState<Inputs>(() => ({ ...defaultInputs(), builder: cleanInputs(null, rules).builder }));
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [compare, setCompare] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("checklist");
  const [imported, setImported] = useState(false);
  const [importedAt, setImportedAt] = useState("");
  const { setResult } = useTitleCheckerResult();
  const lastTracked = useRef("");

  /* ---- Load and save (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const s = deviceStorage.read<Saved>(storageKey);
    // Restoring once after hydration: the server render has no storage.
    let next = s ? cleanInputs(s.inputs, rules) : null;
    let wasImported = s?.imported === true;
    let at = typeof s?.importedAt === "string" ? s.importedAt : "";
    // Arriving from the scorer (the Get more bookings kit, or "Improve my title"): import its title and details, once per hand-off.
    let fromScorer = false;
    try {
      const q = new URLSearchParams(window.location.search);
      fromScorer = q.get("kit") === "more-bookings" || q.get("from") === scorerSlug || q.get("from") === builderSlug;
    } catch {
      // ignore
    }
    const h = fromScorer ? readHandoffData("listing-title", parseTitleImport) : null;
    if (h && h.createdAt !== at) {
      const base = next ?? { ...defaultInputs(), builder: cleanInputs(null, rules).builder };
      // The standout feature becomes a custom feature in the title builder, if it's short enough.
      const own = h.data.standout.replace(/^(a|an|the)\s+/i, "").trim();
      const features = own && own.length <= rules.builder.customMax && base.builder.features.length < rules.builder.maxFeatures && !base.builder.features.some((x) => "custom" in x && x.custom === own) ? [...base.builder.features, { custom: own }] : base.builder.features;
      next = { ...base, title: h.data.title || base.title, details: h.data.details, showDetails: true, example: false, builder: { ...base.builder, features, maxGuests: h.data.maxGuests ?? base.builder.maxGuests } };
      wasImported = true;
      at = h.createdAt;
      track("import_used", toolSlug);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) setInputs(next);
    setImported(wasImported);
    setImportedAt(at);
    setCompare(cleanCompare(deviceStorage.read(compareKey)));
    setReady(true);
  }, [rules]);

  useEffect(() => {
    if (!ready) return;
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, { inputs, imported, importedAt } satisfies Saved));
  }, [ready, inputs, imported, importedAt]);

  useEffect(() => {
    if (ready) deviceStorage.write(compareKey, compare);
  }, [ready, compare]);

  /* ---- Derived: the checklist updates as the host types ---- */
  const result = useMemo(() => checkTitle(inputs.title, inputs.details, content), [inputs.title, inputs.details, content]);

  useEffect(() => {
    setResult({ result, rules, details: inputs.details, maxGuests: inputs.builder.maxGuests });
  }, [result, rules, inputs.details, inputs.builder.maxGuests, setResult]);

  // A polite update for screen readers once typing pauses, and one analytics event per verdict (never the title).
  useEffect(() => {
    if (!result.length) return;
    const t = window.setTimeout(() => {
      setAnnounce(copy.live.replace("{n}", String(result.length)).replace("{limit}", String(result.limit)).replace("{verdict}", result.verdict.label).replace("{passed}", passedText(result, rules)));
      if (lastTracked.current !== result.verdict.id) {
        lastTracked.current = result.verdict.id;
        track("title_checked", toolSlug, { verdict: result.verdict.id });
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [result, rules]);

  /* ---- Actions ---- */
  const set = (patch: Partial<Inputs>) => setInputs((i) => ({ ...i, ...patch, example: patch.example ?? (patch.title !== undefined || patch.details ? false : i.example) }));
  const setDetails = (patch: Partial<Details>) => set({ details: { ...inputs.details, ...patch } });
  const clearTitle = () => {
    set({ title: "", details: defaultInputs().details, example: false });
    setImported(false);
  };
  const clearAll = () => {
    deviceStorage.remove(storageKey);
    deviceStorage.remove(compareKey);
    setInputs({ ...defaultInputs(), builder: cleanInputs(null, rules).builder });
    setCompare([]);
    setImported(false);
    setTab("checklist");
    setConfirmClear(false);
  };
  /** "Use this" / "Pick this one": the title goes into the main input, which gets focus. */
  const pickTitle = (title: string, from: "builder" | "compare") => {
    set({ title });
    track(from === "builder" ? "suggestion_used" : "compare_used", toolSlug);
    setTab("checklist");
    requestAnimationFrame(() => {
      const el = document.getElementById("tc-title");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    });
  };
  const addCompare = (title: string) => {
    setCompare((c) => addToCompare(c, title));
    track("compare_used", toolSlug, { count: Math.min(compare.length + 1, LIMITS.compare) });
  };
  const goTab = (t: Tab) => {
    setTab(t);
    requestAnimationFrame(() => document.getElementById("tc-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const counterTone = result.counter === "over" ? "bg-coral-50 text-brand" : result.counter === "warn" ? "bg-amber-50 text-amber" : "bg-fog text-ink-copy";
  const bedrooms = inputs.details.bedrooms;

  return (
    <div data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      {/* Example bar */}
      <div className={cn("mb-4 flex flex-wrap items-center gap-2 rounded-[16px] border p-3 md:p-3.5", inputs.example ? "border-amber-50 bg-amber-25" : "border-coral-100 bg-coral-25")}>
        <p className="m-0 min-w-[180px] flex-1 text-sm font-semibold text-ink-copy" data-example-banner={inputs.example ? "" : undefined}>
          {inputs.example ? (
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
            setInputs((i) => ({ ...exampleInputs(rules), builder: i.builder }));
            setImported(false);
          }}
          className="btn btn-outline min-h-11 bg-white"
        >
          {copy.buttons.example}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:[grid-template-areas:'input_check'_'card_check'] md:items-start lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Title and details */}
        <div className="grid min-w-0 gap-4 md:[grid-area:input]">
          {saveFailed && (
            <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
              {copy.storageFailed}
            </p>
          )}
          <div className="grid gap-2 rounded-[20px] border border-line bg-white p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="tc-title" className="text-[17px] font-extrabold text-ink">
                {copy.title.label}
              </label>
              <span id="tc-count" className={cn("rounded-full px-2.5 py-1 text-sm font-extrabold tabular-nums", counterTone)} data-counter={result.counter}>
                {copy.title.counter.replace("{n}", String(result.length)).replace("{limit}", String(result.limit))}
                {result.counter === "over" && <span className="sr-only-label"> ({copy.title.over})</span>}
                {result.counter === "warn" && <span className="sr-only-label"> ({copy.title.near})</span>}
              </span>
            </div>
            {imported && (
              <p className="m-0 flex items-start gap-2 rounded-[12px] bg-steel-50 px-3.5 py-2.5 text-sm text-ink-copy" role="status" data-imported>
                <span aria-hidden="true">↪</span>
                <span>
                  <strong className="text-ink">{copy.imported}.</strong> {copy.importedHint}
                </span>
              </p>
            )}
            <input
              id="tc-title"
              type="text"
              className="field min-h-14 text-[17px] font-semibold"
              value={inputs.title}
              maxLength={LIMITS.title}
              onChange={(e) => set({ title: e.target.value })}
              aria-describedby="tc-count tc-privacy"
              autoComplete="off"
              spellCheck
              placeholder={copy.title.placeholder}
            />
            <p id="tc-privacy" className="m-0 flex items-center gap-1.5 text-[13px] font-semibold text-muted">
              <span aria-hidden="true">🔒</span>
              {copy.privacy}
            </p>
            <p className="sr-only-label" aria-live="polite" aria-atomic="true" data-live>
              {result.length ? announce : ""}
            </p>

            {/* Optional details */}
            <div className="mt-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => set({ showDetails: !inputs.showDetails, example: inputs.example })}
                aria-expanded={inputs.showDetails}
                aria-controls="tc-details"
                className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-[15px] font-bold text-ink"
              >
                <span>
                  {copy.details.toggle}
                  <span className="block text-[13px] font-semibold text-muted">{copy.details.hint}</span>
                </span>
                <span aria-hidden="true" className={cn("text-lg transition-transform", inputs.showDetails && "rotate-180")}>
                  ⌄
                </span>
              </button>
              <div id="tc-details" hidden={!inputs.showDetails} className="mt-3 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField id="tc-town" label={copy.details.town.label} hint={copy.details.town.hint} value={inputs.details.town} onChange={(v) => setDetails({ town: v })} />
                  <TextField id="tc-place" label={copy.details.place.label} hint={copy.details.place.hint} value={inputs.details.place} onChange={(v) => setDetails({ place: v })} />
                </div>
                <ChoiceChips
                  legend={copy.details.type}
                  value={inputs.details.propertyType}
                  options={["", ...propertyTypes].map((t) => ({ value: t, label: propertyTypeLabels[t] ?? t }))}
                  onChange={(v) => setDetails({ propertyType: v })}
                  name="tc-type"
                />
                <div className="max-w-[260px]">
                  <NumberField
                    label={copy.details.bedrooms.label}
                    hint={copy.details.bedrooms.hint}
                    name="tc-bedrooms"
                    value={bedrooms === null ? "" : String(bedrooms)}
                    onChange={(v) => {
                      const t = v.trim();
                      if (t === "") setDetails({ bedrooms: null });
                      else if (/^\d+$/.test(t)) setDetails({ bedrooms: Math.min(LIMITS.bedrooms, Number(t)) });
                    }}
                    min={0}
                    max={LIMITS.bedrooms}
                    placeholder="–"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" onClick={clearTitle} className="btn btn-outline min-h-11">
              {copy.buttons.clear}
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
                {copy.buttons.clearData}
              </button>
            )}
          </div>
        </div>

        {/* Verdict and checklist: to the right on desktop, below the title on mobile */}
        <div className="min-w-0 rounded-[20px] border border-line bg-white p-5 md:sticky md:top-6 md:p-6 md:[grid-area:check]" id="tc-results" data-results>
          {result.length === 0 ? (
            <div className="mb-3">
              <p className="m-0 text-lg font-extrabold text-ink">{copy.verdictEmpty}</p>
              <p className="m-0 mt-1 text-sm text-muted">{copy.verdictEmptyHint}</p>
            </div>
          ) : (
            <div className="mb-4 grid gap-3">
              <Verdict r={result} rules={rules} />
              <div className="rounded-[14px] bg-cloud-2 px-4 py-3">
                <p className="m-0 mb-1 text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">{copy.highlighted.heading}</p>
                <HighlightedTitle r={result} />
                <p className="m-0 mt-1 text-[12px] text-muted">{copy.highlighted.key}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton getText={() => result.title} label={copy.copyTitle} copiedLabel={copy.copied} className="min-h-11" onCopied={() => track("copied", toolSlug, { type: "title" })} />
                <CopyButton getText={() => checklistText(result, rules, copy.credit)} label={copy.copyChecklist} copiedLabel={copy.copied} className="min-h-11" onCopied={() => track("copied", toolSlug, { type: "checklist" })} />
              </div>
            </div>
          )}
          <Checklist r={result} compact />
          {result.length > 0 && (
            <button type="button" onClick={() => goTab("checklist")} className="mt-3 min-h-11 cursor-pointer border-none bg-transparent p-0 text-left text-sm font-bold text-brand underline underline-offset-2">
              {copy.checklist.seeWhy} ↓
            </button>
          )}
        </div>
        {/* Search card preview */}
        <div className="min-w-0 rounded-[20px] border border-line bg-cloud-2 p-5 md:[grid-area:card]">
          <h3 className="m-0 mb-3 text-[15px] font-extrabold text-ink">{copy.card.heading}</h3>
          <SearchCard r={result} />
        </div>

      </div>

      <div className="mt-6">
        <ResultTabs
          tab={tab}
          onTab={setTab}
          content={content}
          result={result}
          title={inputs.title}
          details={inputs.details}
          setDetails={setDetails}
          choices={inputs.builder}
          setChoices={(c: BuilderChoices) => set({ builder: c, example: inputs.example })}
          compare={compare}
          onAddCompare={addCompare}
          onRemoveCompare={(t) => setCompare((c) => c.filter((x) => x !== t))}
          onUse={pickTitle}
          checklistActions={
            result.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                <CopyButton getText={() => result.title} label={copy.copyTitle} copiedLabel={copy.copied} className="min-h-11" onCopied={() => track("copied", toolSlug, { type: "title" })} />
                <CopyButton getText={() => checklistText(result, rules, copy.credit)} label={copy.copyChecklist} copiedLabel={copy.copied} className="min-h-11" onCopied={() => track("copied", toolSlug, { type: "checklist" })} />
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
