"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { copy, propertyTypeLabels, toolSlug } from "@/content/tools/titleChecker";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  buildTitles,
  checkTitle,
  fill,
  LIMITS,
  propertyTypes,
  type BuilderChoices,
  type CheckResult,
  type Content,
  type Details,
  type FeatureChoice,
  type TitleResult,
} from "@/lib/tools/title-checker";
import { ChoiceChips } from "../ChoiceChips";
import { CopyButton } from "../CopyButton";
import { MultiChips } from "../MultiChips";
import { NumberField } from "../NumberField";
import { Checklist, HighlightedTitle, SearchCard, StatusBadge, Verdict } from "./ResultParts";

export type Tab = "checklist" | "builder" | "compare";
export const TABS: Tab[] = ["checklist", "builder", "compare"];

type Props = {
  tab: Tab;
  onTab: (t: Tab) => void;
  content: Content;
  result: TitleResult;
  title: string;
  details: Details;
  setDetails: (patch: Partial<Details>) => void;
  choices: BuilderChoices;
  setChoices: (c: BuilderChoices) => void;
  compare: string[];
  onAddCompare: (title: string) => void;
  onRemoveCompare: (title: string) => void;
  /** Put a title into the main input. */
  onUse: (title: string, from: "builder" | "compare") => void;
  /** Extra actions under the checklist (copy buttons, added in step 5). */
  checklistActions?: ReactNode;
};

export function ResultTabs(p: Props) {
  const { tab, onTab } = p;
  return (
    <section aria-label="Results" className="scroll-mt-4 rounded-[20px] border border-line bg-white" id="tc-tabs">
      <div role="tablist" aria-label="Results" className="flex gap-1 overflow-x-auto border-b border-line p-1.5 [scrollbar-width:thin]">
        {TABS.map((t, n) => (
          <button
            key={t}
            id={`tc-tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tc-tabpanel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => onTab(t)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = TABS[(n + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
              onTab(next);
              document.getElementById(`tc-tab-${next}`)?.focus();
            }}
            className={cn("min-h-11 flex-none cursor-pointer rounded-[12px] border-none px-4 text-sm font-extrabold whitespace-nowrap", tab === t ? "bg-ink text-white" : "bg-transparent text-ink-copy hover:bg-fog")}
          >
            {copy.tabs[t]}
            {t === "compare" && p.compare.length > 0 && <span className="tabular-nums"> ({p.compare.length})</span>}
          </button>
        ))}
      </div>
      <div id={`tc-tabpanel-${tab}`} role="tabpanel" aria-labelledby={`tc-tab-${tab}`} className="p-4 md:p-6" tabIndex={-1}>
        {tab === "checklist" && <ChecklistTab r={p.result} actions={p.checklistActions} />}
        {tab === "builder" && <BuilderTab {...p} />}
        {tab === "compare" && <CompareTab {...p} />}
      </div>
    </section>
  );
}

/* ---------------- Checklist: grouped, with reasons ---------------- */

function Group({ title, items, n }: { title: string; items: CheckResult[]; n: (c: CheckResult) => number }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="m-0 mb-2 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">{title}</h3>
      <ul className="m-0 grid list-none gap-2 p-0">
        {items.map((c) => (
          <li key={c.id} className="flex items-start gap-3 rounded-[12px] bg-cloud-2 px-3.5 py-3" data-check-detail={c.id}>
            <StatusBadge status={c.status} />
            <div className="min-w-0">
              <p className="m-0 text-[15px] font-bold text-ink">
                <span className="mr-1.5 text-muted tabular-nums">{n(c)}.</span>
                {c.name}
              </p>
              <p className="m-0 mt-0.5 text-sm leading-[1.5] text-ink-copy">{c.reason}</p>
              {c.matches.length > 0 && c.status !== "pass" && (
                <p className="m-0 mt-1 text-[13px] text-muted">
                  Found:{" "}
                  {[...new Set(c.matches.map((m) => m.text))].map((t, i) => (
                    <span key={t}>
                      {i > 0 && ", "}
                      <span className="font-bold text-ink">‘{t}’</span>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChecklistTab({ r, actions }: { r: TitleResult; actions?: ReactNode }) {
  if (!r.length) return <p className="m-0 text-[15px] text-muted">{copy.checklist.empty}</p>;
  const n = (c: CheckResult) => r.checks.indexOf(c) + 1;
  return (
    <div className="grid gap-5" data-checklist-tab>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid content-start gap-5">
          <Group title={copy.checklist.fixes} items={r.checks.filter((c) => c.status === "fix")} n={n} />
          <Group title={copy.checklist.tips} items={r.checks.filter((c) => c.status === "tip")} n={n} />
          {r.extraTips.map((t) => (
            <p key={t} className="m-0 flex items-start gap-3 rounded-[12px] bg-amber-25 px-3.5 py-3 text-sm text-ink-copy">
              <StatusBadge status="tip" />
              <span>
                <strong className="text-ink">{copy.checklist.extra}:</strong> {t}
              </span>
            </p>
          ))}
        </div>
        <Group title={copy.checklist.passes} items={r.checks.filter((c) => c.status === "pass")} n={n} />
      </div>
      {actions}
    </div>
  );
}

/* ---------------- Title builder ---------------- */

function BuilderTab({ content, details, setDetails, choices, setChoices, compare, onAddCompare, onUse }: Props) {
  const B = content.rules.builder;
  const [own, setOwn] = useState("");
  const [benefitOwn, setBenefitOwn] = useState(choices.benefit && "custom" in choices.benefit ? choices.benefit.custom : "");
  const ids = choices.features.filter((f): f is { id: string } => "id" in f).map((f) => f.id);
  const customs = choices.features.filter((f): f is { custom: string } => "custom" in f);
  const set = (patch: Partial<BuilderChoices>) => setChoices({ ...choices, ...patch });
  const setFeatures = (nextIds: string[], nextCustoms = customs) => set({ features: [...nextIds.map((id) => ({ id }) as FeatureChoice), ...nextCustoms].slice(0, B.maxFeatures) });
  const built = useMemo(() => buildTitles(choices, details, content), [choices, details, content]);
  const benefitValue = !choices.benefit ? "none" : "custom" in choices.benefit ? "own" : choices.benefit.id;
  const hookNeedsPlace = choices.hook.kind !== "none" && !details.place.trim();

  const addOwn = (e: FormEvent) => {
    e.preventDefault();
    const t = own.trim().slice(0, B.customMax);
    if (!t || choices.features.length >= B.maxFeatures) return;
    setFeatures(ids, [...customs, { custom: t }]);
    setOwn("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-builder>
      {/* Choices */}
      <div className="grid content-start gap-5">
        <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">{copy.builder.intro}</p>
        <MultiChips
          legend={copy.builder.features.legend}
          hint={fill(copy.builder.features.hint, { max: B.maxFeatures })}
          value={ids}
          options={B.features.map((f) => ({ value: f.id, label: f.label }))}
          onChange={(v) => setFeatures(v)}
          max={B.maxFeatures - customs.length}
          fullNote={fill(copy.builder.features.full, { max: B.maxFeatures })}
        />
        <form onSubmit={addOwn} className="grid gap-1.5">
          <label htmlFor="tc-own" className="text-[15px] font-bold text-ink">
            {copy.builder.own.label}
          </label>
          <p id="tc-own-hint" className="m-0 text-[13px] text-muted">
            {fill(copy.builder.own.hint, { max: B.customMax })}
          </p>
          <div className="flex gap-2">
            <input id="tc-own" type="text" className="field min-h-12 min-w-0 flex-1" value={own} maxLength={B.customMax} onChange={(e) => setOwn(e.target.value)} aria-describedby="tc-own-hint" autoComplete="off" disabled={choices.features.length >= B.maxFeatures} />
            <button type="submit" className="btn btn-outline min-h-12" disabled={!own.trim() || choices.features.length >= B.maxFeatures}>
              {copy.builder.own.add}
            </button>
          </div>
          {customs.length > 0 && (
            <ul className="m-0 mt-1 flex list-none flex-wrap gap-2 p-0">
              {customs.map((c) => (
                <li key={c.custom}>
                  <button
                    type="button"
                    onClick={() => setFeatures(ids, customs.filter((x) => x !== c))}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-ink bg-sand px-4 text-sm font-semibold text-ink"
                    aria-label={fill(copy.builder.own.remove, { feature: c.custom })}
                  >
                    {c.custom} <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="grid gap-3">
          <ChoiceChips
            legend={copy.builder.benefit.legend}
            value={benefitValue}
            options={[
              { value: "none", label: copy.builder.benefit.none },
              ...B.benefits.map((b) => ({ value: b.id, label: b.text.includes("{maxGuests}") ? (choices.maxGuests ? fill(b.text, { maxGuests: choices.maxGuests }) : copy.builder.benefit.sleeps) : b.text })),
              { value: "own", label: copy.builder.benefit.own },
            ]}
            onChange={(v) => set({ benefit: v === "none" ? null : v === "own" ? { custom: benefitOwn } : { id: v } })}
            name="tc-benefit"
          />
          {benefitValue === "own" && (
            <div className="grid gap-1.5">
              <label htmlFor="tc-benefit-own" className="text-[15px] font-bold text-ink">
                {copy.builder.benefit.ownLabel}
              </label>
              <input
                id="tc-benefit-own"
                type="text"
                className="field min-h-12"
                value={benefitOwn}
                maxLength={B.customMax}
                onChange={(e) => {
                  setBenefitOwn(e.target.value);
                  set({ benefit: { custom: e.target.value } });
                }}
                autoComplete="off"
              />
            </div>
          )}
          {benefitValue !== "none" && B.benefits.find((b) => b.id === benefitValue)?.text.includes("{maxGuests}") && (
            <div className="max-w-[240px]">
              <NumberField
                label={copy.builder.benefit.guests}
                name="tc-guests"
                value={choices.maxGuests ? String(choices.maxGuests) : ""}
                onChange={(v) => set({ maxGuests: /^\d+$/.test(v.trim()) ? Math.min(LIMITS.guests, Math.max(1, Number(v))) : null })}
                min={1}
                max={LIMITS.guests}
                placeholder="–"
              />
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <ChoiceChips
            legend={copy.builder.hook.legend}
            value={choices.hook.kind}
            options={[
              { value: "minutes", label: copy.builder.hook.minutes },
              { value: "near", label: copy.builder.hook.near },
              { value: "none", label: copy.builder.hook.none },
            ]}
            onChange={(v) => set({ hook: v === "minutes" ? { kind: "minutes", minutes: 5, mode: B.modes[0] } : v === "near" ? { kind: "near" } : { kind: "none" } })}
            name="tc-hook"
          />
          {choices.hook.kind !== "none" && (
            <div className="grid gap-1.5">
              <label htmlFor="tc-hook-place" className="text-[15px] font-bold text-ink">
                {copy.details.place.label}
              </label>
              <p id="tc-hook-place-hint" className="m-0 text-[13px] text-muted">
                {copy.details.place.hint}
              </p>
              <input id="tc-hook-place" type="text" className="field min-h-12" value={details.place} maxLength={LIMITS.place} onChange={(e) => setDetails({ place: e.target.value })} aria-describedby="tc-hook-place-hint" autoComplete="off" />
              {hookNeedsPlace && (
                <p className="m-0 text-[13px] font-bold text-amber" role="status">
                  {copy.builder.hook.needPlace}
                </p>
              )}
            </div>
          )}
          {choices.hook.kind === "minutes" && (
            <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-end">
              <NumberField
                label={copy.builder.hook.minutesLabel}
                name="tc-minutes"
                value={String(choices.hook.minutes)}
                onChange={(v) => /^\d+$/.test(v.trim()) && set({ hook: { ...choices.hook, kind: "minutes", minutes: Math.min(LIMITS.minutes, Math.max(1, Number(v))), mode: choices.hook.kind === "minutes" ? choices.hook.mode : B.modes[0] } })}
                min={1}
                max={LIMITS.minutes}
                placeholder="5"
              />
              <ChoiceChips
                legend={copy.builder.hook.mode}
                value={choices.hook.mode}
                options={B.modes.map((m) => ({ value: m, label: m }))}
                onChange={(m) => choices.hook.kind === "minutes" && set({ hook: { ...choices.hook, mode: m } })}
                name="tc-mode"
              />
            </div>
          )}
        </div>

        <ChoiceChips
          legend={copy.details.type}
          value={details.propertyType}
          options={["", ...propertyTypes].map((t) => ({ value: t, label: propertyTypeLabels[t] ?? t }))}
          onChange={(v) => setDetails({ propertyType: v })}
          name="tc-builder-type"
        />
        <ChoiceChips legend={copy.builder.separator} value={choices.separator} options={B.separators.map((s) => ({ value: s.id, label: `${s.label}  ${s.id}` }))} onChange={(v) => set({ separator: v })} name="tc-sep" />
      </div>

      {/* Ideas */}
      <div className="grid content-start gap-3 lg:sticky lg:top-6">
        <h3 className="m-0 text-lg font-extrabold text-ink">{copy.builder.results}</h3>
        {!choices.features.length ? (
          <p className="m-0 rounded-[14px] bg-cloud-2 px-4 py-3 text-[15px] text-muted">{copy.builder.empty}</p>
        ) : (
          <>
            <ol className="m-0 grid list-none gap-3 p-0" aria-live="polite" data-suggestions>
              {built.suggestions.map((s) => {
                const inCompare = compare.includes(s.title);
                return (
                  <li key={s.title} className="grid gap-2.5 rounded-[16px] border border-line bg-white p-4" data-suggestion>
                    <p className="m-0 text-[17px] leading-[1.4] font-bold break-words text-ink">{s.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Verdict r={s.result} rules={content.rules} compact />
                      <span className="text-[13px] font-bold text-muted tabular-nums">· {fill(copy.builder.count, { n: s.length })}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-coral min-h-11" onClick={() => onUse(s.title, "builder")}>
                        {copy.builder.use}
                      </button>
                      <CopyButton getText={() => s.title} label={copy.builder.copy} className="btn btn-outline min-h-11" onCopied={() => track("copied", toolSlug, { type: "suggestion" })} />
                      <button type="button" className="btn btn-outline min-h-11" onClick={() => onAddCompare(s.title)} disabled={inCompare} aria-pressed={inCompare}>
                        {inCompare ? `✓ ${copy.builder.added}` : copy.builder.compare}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
            {built.hint && (
              <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold text-amber" role="status" data-few-hint>
                {built.hint}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Compare ---------------- */

function CompareTab({ content, title, details, compare, onAddCompare, onRemoveCompare, onUse }: Props) {
  const results = useMemo(() => compare.map((t) => checkTitle(t, details, content)), [compare, details, content]);
  const current = title.trim();
  const max = LIMITS.compare;
  return (
    <div className="grid gap-4" data-compare>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[15px] text-ink-copy">{fill(copy.compare.intro, { max })}</p>
        <button type="button" className="btn btn-outline min-h-11" onClick={() => onAddCompare(current)} disabled={!current || compare.includes(current)}>
          {copy.compare.addCurrent}
        </button>
      </div>
      {compare.length >= max && <p className="m-0 text-[13px] font-semibold text-muted">{fill(copy.compare.full, { max })}</p>}
      {!compare.length ? (
        <p className="m-0 rounded-[14px] bg-cloud-2 px-4 py-3 text-[15px] text-muted">{copy.compare.empty}</p>
      ) : (
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
          {results.map((r) => {
            const inUse = r.title === current;
            return (
              <li key={r.title} className={cn("flex min-w-0 flex-col gap-3 rounded-[18px] border p-4", inUse ? "border-ink bg-sand" : "border-line bg-white")} data-compare-card>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[13px] font-extrabold tabular-nums", r.counter === "over" ? "bg-coral-50 text-brand" : r.counter === "warn" ? "bg-amber-50 text-amber" : "bg-fog text-ink-copy")}>
                    {r.length} / {r.limit}
                  </span>
                  {inUse && <span className="text-[12px] font-extrabold text-ink uppercase">{copy.compare.picked}</span>}
                </div>
                <HighlightedTitle r={r} className="text-[15px] leading-[1.8]" />
                <Verdict r={r} rules={content.rules} compact />
                <SearchCard r={r} compact />
                <Checklist r={r} compact />
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <button type="button" className="btn btn-coral min-h-11 flex-1" onClick={() => onUse(r.title, "compare")} disabled={inUse}>
                    {copy.compare.pick}
                  </button>
                  <button type="button" className="btn btn-outline min-h-11" onClick={() => onRemoveCompare(r.title)} aria-label={`${copy.compare.remove}: ${r.title}`}>
                    {copy.compare.remove}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
