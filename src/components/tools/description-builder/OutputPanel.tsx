"use client";

import { copy, toolSlug } from "@/content/tools/descriptionBuilder";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { countChars } from "@/lib/tools/listing-text";
import { sectionIds, type Built, type Content, type Moved, type Readiness, type SectionId, type needsPanel } from "@/lib/tools/description-builder";
import { CopyButton } from "../CopyButton";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

export type Override = { text: string; locked: boolean; basedOn: string };

type Props = {
  content: Content;
  built: Built;
  shown: Record<SectionId, string>;
  overrides: Partial<Record<SectionId, Override>>;
  onEdit: (id: SectionId, text: string) => void;
  onLock: (id: SectionId, locked: boolean) => void;
  onUpdate: (id: SectionId) => void;
  onKeep: (id: SectionId) => void;
  tab: SectionId;
  onTab: (t: SectionId) => void;
  readiness: Readiness;
  panel: ReturnType<typeof needsPanel>;
  integrityOk: boolean;
  missing: string[];
  fitMoved: Moved[];
  canUndoFit: boolean;
  onMakeFit: () => void;
  onUndoFit: () => void;
  onAddIt: (need: string) => void;
  onScore: () => void;
  onTitle: () => void;
  allText: () => string;
  onDownload: () => void;
};

const tone = (p: number, max: number) => (p >= max * 0.77 ? { bg: "#E3F2EA", fg: "#1F6B45" } : p >= max * 0.5 ? { bg: "#FFF2CC", fg: "#6B4A00" } : { bg: "#FDECEC", fg: "#B8383A" });

export function OutputPanel(p: Props) {
  const { content, readiness: r } = p;
  const t = tone(r.points, r.max);
  const id = p.tab;
  const ov = p.overrides[id];
  const text = p.shown[id];
  const n = countChars(text, content.scorer.counting);
  const limit = content.limits[id];
  const over = n - limit;
  const stale = ov && !ov.locked && ov.basedOn !== p.built.sections[id];
  const longest = id === "listing" && over > 0 && !ov ? [...p.built.listingSentences].sort((a, b) => b.length - a.length)[0] : "";

  return (
    <section className="grid min-w-0 gap-4 rounded-[20px] border border-violet-100 bg-white p-4 md:p-5 [&>*]:min-w-0" aria-label={copy.output.heading} data-output>
      {/* Mini readiness score */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex min-h-12 items-center rounded-full px-4 text-lg font-extrabold tabular-nums" style={{ background: t.bg, color: t.fg }} data-mini-score>
            {fill(copy.output.scoreOf, { points: r.points, max: r.max })}
          </span>
          <span className="text-sm font-bold text-ink-copy">{copy.output.score}</span>
          <span className="sr-only-label" aria-live="polite">
            {fill(copy.output.scoreLive, { points: r.points, max: r.max })}
          </span>
        </div>
        <button type="button" onClick={p.onScore} className="btn btn-violet min-h-11" data-score-this>
          {copy.output.scoreThis} →
        </button>
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 text-[12px] font-bold text-ink-copy" aria-label="Readiness by check">
        {r.checks.map((c) => (
          <li key={c.id} className="rounded-md bg-violet-25 px-2 py-1">
            {c.name}: <span className="tabular-nums">{c.points}/{c.max}</span>
          </li>
        ))}
      </ul>

      {/* Guest needs */}
      <div className="rounded-[14px] bg-violet-50 p-3.5" data-needs>
        <p className="m-0 mb-2 text-[13px] font-extrabold tracking-[0.6px] text-violet uppercase">{copy.output.needs}</p>
        {p.panel.length === 0 ? (
          <p className="m-0 text-sm text-ink-copy">{copy.output.needsEmpty}</p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {p.panel.map((g) => (
              <li key={g.guest} className="text-sm leading-[1.6] text-ink" data-needs-guest={g.guest}>
                <strong>{g.label}:</strong>{" "}
                {g.needs.map((nd, i) => (
                  <span key={nd.id} className="whitespace-nowrap">
                    {i > 0 && <span aria-hidden="true"> · </span>}
                    {nd.label}{" "}
                    {nd.covered ? (
                      <span className="font-extrabold text-green" data-need={nd.id} data-covered="yes">
                        ✓<span className="sr-only-label"> covered</span>
                      </span>
                    ) : (
                      <>
                        <span className="font-extrabold text-brand" data-need={nd.id} data-covered="no">
                          ✗<span className="sr-only-label"> missing</span>
                        </span>{" "}
                        <button type="button" onClick={() => p.onAddIt(nd.id)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-violet underline underline-offset-2" aria-label={`Add it: ${nd.label} for ${g.label}`}>
                          {copy.output.addIt}
                        </button>
                      </>
                    )}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {p.missing.length > 0 && (
        <p className="m-0 rounded-[12px] bg-amber-25 px-3.5 py-2.5 text-sm font-bold text-amber" role="status" data-missing>
          {fill(copy.missingNote, { items: p.missing.join(", ") })}
        </p>
      )}

      {/* Tabs */}
      <div>
        <div role="tablist" aria-label="Description sections" className="flex gap-1 overflow-x-auto rounded-[14px] bg-cloud-2 p-1 [scrollbar-width:thin]">
          {sectionIds.map((s, i) => {
            const c = countChars(p.shown[s], content.scorer.counting);
            const isOver = c > content.limits[s];
            return (
              <button
                key={s}
                id={`db-tab-${s}`}
                type="button"
                role="tab"
                aria-selected={id === s}
                aria-controls={`db-tabpanel-${s}`}
                tabIndex={id === s ? 0 : -1}
                onClick={() => p.onTab(s)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  const next = sectionIds[(i + (e.key === "ArrowRight" ? 1 : sectionIds.length - 1)) % sectionIds.length];
                  p.onTab(next);
                  document.getElementById(`db-tab-${next}`)?.focus();
                }}
                className={cn("flex min-h-11 flex-none cursor-pointer flex-col items-start justify-center rounded-[10px] border-none px-3 text-left", id === s ? "bg-ink text-white" : "bg-transparent text-ink-copy hover:bg-fog")}
              >
                <span className="text-[13px] font-extrabold whitespace-nowrap">{content.names[s]}</span>
                <span className={cn("text-[11px] font-bold tabular-nums", id === s ? "text-white/80" : isOver ? "text-brand" : "text-muted")}>
                  {c} / {content.limits[s]}
                  {p.overrides[s] && ` · ${copy.output.edited}`}
                </span>
              </button>
            );
          })}
        </div>

        <div id={`db-tabpanel-${id}`} role="tabpanel" aria-labelledby={`db-tab-${id}`} className="mt-3 grid gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={`db-text-${id}`} className="text-[15px] font-extrabold text-ink">
              {content.names[id]}
              {ov && <span className="ml-2 rounded-md bg-violet-50 px-2 py-[2px] text-[11px] font-extrabold text-violet uppercase">{ov.locked ? copy.output.locked : copy.output.edited}</span>}
            </label>
            <span id={`db-count-${id}`} className={cn("rounded-full px-2.5 py-0.5 text-[13px] font-extrabold tabular-nums", over > 0 ? "bg-coral-50 text-brand" : "bg-fog text-ink-copy")} aria-live="polite" data-section-count={id}>
              {fill(copy.output.counter, { n, limit })}
              {over > 0 && <span className="sr-only-label"> ({fill(copy.output.over, { n: over })})</span>}
            </span>
          </div>
          <textarea
            id={`db-text-${id}`}
            className={cn("field min-h-[220px] p-3 text-[15px] leading-[1.6]", over > 0 && "border-coral")}
            value={text}
            onChange={(e) => p.onEdit(id, e.target.value)}
            aria-describedby={`db-count-${id}`}
            placeholder={id === "listing" ? copy.output.empty : copy.output.sectionEmpty}
            data-section-text={id}
          />
          {stale && (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-violet-100 bg-violet-25 p-3 text-sm font-bold text-ink" role="alert" data-update-prompt>
              <span className="min-w-[180px] flex-1">{copy.output.updatePrompt}</span>
              <button type="button" className="btn btn-violet min-h-11" onClick={() => p.onUpdate(id)}>
                {copy.output.update}
              </button>
              <button type="button" className="btn btn-outline min-h-11" onClick={() => p.onKeep(id)}>
                {copy.output.keep}
              </button>
            </div>
          )}
          {over > 0 && (
            <div className="grid gap-2 rounded-[12px] bg-coral-50 p-3" role="status" data-over>
              <p className="m-0 text-sm font-extrabold text-brand">{fill(copy.output.over, { n: over })}</p>
              {longest && (
                <p className="m-0 text-sm text-ink-copy">
                  {copy.output.longest}: <span className="underline decoration-brand decoration-2 underline-offset-4">“{longest}”</span>
                </p>
              )}
            </div>
          )}
          {id === "listing" && (over > 0 || p.canUndoFit) && !ov && (
            <div className="flex flex-wrap gap-2">
              {over > 0 && (
                <button type="button" className="btn btn-coral min-h-11" onClick={p.onMakeFit} data-make-fit>
                  {copy.output.makeFit}
                </button>
              )}
              {p.canUndoFit && (
                <button type="button" className="btn btn-outline min-h-11" onClick={p.onUndoFit} data-undo-fit>
                  {copy.output.undo}
                </button>
              )}
            </div>
          )}
          {id === "listing" && p.fitMoved.length > 0 && !ov && (
            <ul className="m-0 grid list-none gap-1 p-0 text-[13px] text-ink-copy" aria-live="polite" data-moved>
              {p.fitMoved.map((m) => (
                <li key={m.id}>↪ {m.message}</li>
              ))}
              {p.built.warnings.map((w) => (
                <li key={w} className="font-bold text-brand">
                  {w}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {ov && (
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-ink">
                <input type="checkbox" checked={ov.locked} onChange={(e) => p.onLock(id, e.target.checked)} className="size-5 accent-ink" data-lock={id} />
                {copy.output.lock}
              </label>
            )}
            <CopyButton getText={() => p.shown[id]} label={copy.output.copy} className="min-h-11" onCopied={() => track("section_copied", toolSlug, { type: id })} />
          </div>
        </div>
      </div>

      <p className={cn("m-0 text-[13px] font-bold", p.integrityOk ? "text-green" : "text-brand")} data-integrity>
        {p.integrityOk ? copy.output.integrity : copy.output.integrityFail}
        {Object.keys(p.overrides).length > 0 && <span className="font-semibold text-muted"> · {copy.output.integrityEdited}</span>}
      </p>

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        <CopyButton getText={p.allText} label={copy.output.copyAll} copiedLabel="Copied" className="min-h-11" onCopied={() => track("section_copied", toolSlug, { type: "all" })} />
        <button type="button" className="btn btn-outline min-h-11" onClick={p.onDownload} data-download>
          {copy.output.download}
        </button>
        <button type="button" className="btn btn-outline min-h-11" onClick={p.onTitle} data-back-title>
          {copy.output.backToTitle}
        </button>
      </div>
    </section>
  );
}
