"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { copy } from "@/content/tools/aiReadiness";
import { cn } from "@/lib/cn";
import { fill, type CheckId, type Content, type HistoryEntry, type Score, type SimRow, type Simulation } from "@/lib/tools/ai-readiness";
import type { Analysis } from "@/lib/tools/listing-text";
import { CopyButton } from "../CopyButton";
import { BandPill } from "./ScorePanel";

export type ResultTab = "fixes" | "simulator" | "text" | "breakdown" | "history";
export const TABS: ResultTab[] = ["fixes", "simulator", "text", "breakdown", "history"];

const AMBER = { fg: "#6B4A00", bg: "#FFF2CC" };
const GREEN = { fg: "#1F6B45", bg: "#E3F2EA" };

export function ResultTabs({
  tab,
  onTab,
  score,
  content,
  ticked,
  onTick,
  onFixCopied,
  simQuery,
  simulation,
  onSimulate,
  focusCheck,
  history,
  onClearHistory,
}: {
  tab: ResultTab;
  onTab: (t: ResultTab) => void;
  score: Score;
  content: Content;
  ticked: Set<string>;
  onTick: (id: string) => void;
  onFixCopied: (check: CheckId) => void;
  simQuery: string;
  simulation: Simulation | null;
  onSimulate: (q: string, source: string) => void;
  focusCheck: CheckId | null;
  history: HistoryEntry[];
  onClearHistory: () => void;
}) {
  return (
    <section aria-label="Your results" className="rounded-[20px] border border-line bg-white" id="air-results">
      <div role="tablist" aria-label="Results" className="flex gap-1 overflow-x-auto border-b border-line p-1.5 [scrollbar-width:thin]">
        {TABS.map((t, n) => (
          <button
            key={t}
            id={`air-tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`air-tabpanel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => onTab(t)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = TABS[(n + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
              onTab(next);
              document.getElementById(`air-tab-${next}`)?.focus();
            }}
            className={cn("min-h-11 flex-none cursor-pointer rounded-[12px] border-none px-3.5 text-[13px] font-extrabold whitespace-nowrap", tab === t ? "bg-ink text-white" : "bg-transparent text-ink-copy hover:bg-fog")}
          >
            {copy.tabs[t]}
          </button>
        ))}
      </div>
      <div id={`air-tabpanel-${tab}`} role="tabpanel" aria-labelledby={`air-tab-${tab}`} className="p-4 md:p-6" tabIndex={-1}>
        {tab === "fixes" && <FixesTab score={score} ticked={ticked} onTick={onTick} onFixCopied={onFixCopied} />}
        {tab === "simulator" && <SimulatorTab content={content} query={simQuery} simulation={simulation} onSimulate={onSimulate} />}
        {tab === "text" && <HighlightedText analysis={score.analysis} content={content} />}
        {tab === "breakdown" && <Breakdown score={score} focus={focusCheck} />}
        {tab === "history" && <History history={history} onClear={onClearHistory} />}
      </div>
    </section>
  );
}

/* ---------------- Fixes ---------------- */

function FixesTab({ score, ticked, onTick, onFixCopied }: { score: Score; ticked: Set<string>; onTick: (id: string) => void; onFixCopied: (c: CheckId) => void }) {
  return (
    <div className="grid gap-6">
      {score.fixes.length ? (
        <ol className="m-0 grid list-none gap-3 p-0 lg:grid-cols-3" data-fixes>
          {score.fixes.map((f, n) => (
            <li key={f.check} className="flex flex-col gap-3 rounded-[16px] border border-violet-100 bg-violet-25 p-5" data-fix={f.check}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-extrabold text-violet">
                  {n + 1}. {f.name}
                </span>
                <span className="pill bg-white font-extrabold text-violet">{copy.fixes.available.replace("{n}", String(f.points))}</span>
              </div>
              <p className="m-0 text-[17px] leading-[1.4] font-extrabold text-ink">{f.action}</p>
              {f.needs && f.needs.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Needs without evidence">
                  {f.needs.map((x) => (
                    <li key={x} className="pill bg-white text-ink">
                      ✗ {x}
                    </li>
                  ))}
                </ul>
              )}
              {f.example && (
                <div className="mt-auto grid gap-2">
                  <p className="m-0 rounded-[12px] bg-white px-3.5 py-3 text-sm leading-[1.55] text-ink-copy">
                    <span className="mb-0.5 block text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">{copy.fixes.example}</span>
                    {f.example}
                  </p>
                  <div className="flex flex-wrap">
                    <CopyButton getText={() => f.example} label={copy.fixes.copyExample} className="min-h-11" onCopied={() => onFixCopied(f.check)} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="m-0 rounded-[14px] px-4 py-3 text-[15px] font-bold" style={{ background: GREEN.bg, color: GREEN.fg }}>
          ✓ {copy.fixes.none}
        </p>
      )}

      <div>
        <h3 className="m-0 mb-1 text-lg font-extrabold">{copy.fixes.quickWins}</h3>
        <p className="m-0 mb-3 text-sm text-muted">{copy.fixes.quickWinsHint}</p>
        {score.quickWins.length ? (
          <ul className="m-0 grid list-none gap-1.5 p-0" data-quick-wins>
            {score.quickWins.map((q) => (
              <li key={q.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[12px] border border-line px-3.5 py-2.5 text-[15px] leading-[1.45] has-checked:bg-cloud has-checked:text-muted">
                  <input type="checkbox" checked={ticked.has(q.id)} onChange={() => onTick(q.id)} className="mt-0.5 size-5 flex-none accent-ink" />
                  <span className={cn(ticked.has(q.id) && "line-through")}>{q.text}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm font-semibold text-ink-copy">{copy.fixes.noQuickWins}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Simulator ---------------- */

function Found({ row }: { row: SimRow }) {
  if (!row.found) return null;
  if (typeof row.found === "string") return <span>{row.found}</span>;
  return (
    <span>
      Found: ‘{row.found.before}
      <mark className="rounded-[3px] px-0.5 font-bold underline decoration-2 underline-offset-2" style={{ background: GREEN.bg, color: GREEN.fg }}>
        {row.found.match}
      </mark>
      {row.found.after}’
    </span>
  );
}

function SimulatorTab({ content, query, simulation, onSimulate }: { content: Content; query: string; simulation: Simulation | null; onSimulate: (q: string, source: string) => void }) {
  const S = content.model.simulator;
  const [draft, setDraft] = useState(query);
  useEffect(() => {
    // Follow a chip pick made elsewhere (the query lives in the parent).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(query);
  }, [query]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) onSimulate(draft, "custom");
  };
  const chips = (exclude?: string) => (
    <div className="flex flex-wrap gap-2">
      {S.examples
        .filter((x) => x.text !== exclude)
        .map((x) => (
          <button key={x.id} type="button" onClick={() => onSimulate(x.text, x.id)} className="min-h-11 cursor-pointer rounded-full border-[1.5px] border-violet-100 bg-white px-4 text-left text-sm font-semibold text-ink hover:border-violet" data-sim-chip={x.id}>
            {x.text}
          </button>
        ))}
    </div>
  );
  const verdictTone = simulation?.verdict === "all" ? GREEN : simulation?.verdict === "some" ? AMBER : { fg: "#B8383A", bg: "#FDECEC" };

  return (
    <div className="grid gap-5">
      <p className="m-0 rounded-[12px] bg-violet-50 px-4 py-3 text-sm leading-[1.55] font-semibold text-violet-deep" data-illustration>
        <span aria-hidden="true">ⓘ </span>
        {S.labels.illustration}
      </p>
      <form onSubmit={submit} className="grid gap-1.5" role="search">
        <label htmlFor="air-sim" className="text-[15px] font-bold">
          {copy.simulator.label}
        </label>
        <div className="flex flex-wrap gap-2">
          <input id="air-sim" type="search" className="field min-h-12 min-w-0 flex-[1_1_240px]" value={draft} maxLength={200} onChange={(e) => setDraft(e.target.value)} placeholder={copy.simulator.placeholder} />
          <button type="submit" className="btn btn-violet min-h-12">
            {copy.simulator.check}
          </button>
        </div>
      </form>

      {!simulation && (
        <div>
          <p className="m-0 mb-2 text-sm font-bold text-muted">{copy.simulator.examples}</p>
          {chips()}
        </div>
      )}

      {simulation && (
        <div className="grid gap-4" aria-live="polite" data-simulation>
          <p className="m-0 text-[15px] text-ink-copy">
            Guest searches: <strong className="text-ink">“{simulation.query}”</strong>
          </p>
          {simulation.rows.length > 0 ? (
            <ul className="m-0 grid list-none gap-2 p-0">
              {simulation.rows.map((r) => (
                <li key={r.id} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-[14px] border border-line p-3.5" data-sim-row={r.id} data-covered={r.covered ? "yes" : "no"}>
                  <span
                    className="flex size-8 items-center justify-center rounded-full text-base font-extrabold"
                    style={r.covered ? { background: GREEN.bg, color: GREEN.fg } : { background: "#FDECEC", color: "#B8383A" }}
                    aria-label={r.covered ? "Has evidence" : "No evidence"}
                    role="img"
                  >
                    {r.covered ? "✓" : "✗"}
                  </span>
                  <span className="grid gap-1 text-sm leading-[1.55] text-ink-copy">
                    <strong className="text-[15px] text-ink">{r.label}</strong>
                    {r.covered ? (
                      <Found row={r} />
                    ) : (
                      <span>
                        <strong className="text-brand-deep">{S.labels.missing}</strong> {r.suggestion}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm font-semibold">{S.labels.nothing}</p>
          )}
          {simulation.notCheckedText && <p className="m-0 text-sm text-muted">{simulation.notCheckedText}</p>}
          {simulation.total > 0 && (
            <div className="rounded-[14px] px-4 py-3" style={{ background: verdictTone.bg, color: verdictTone.fg }}>
              <p className="m-0 text-[15px] font-extrabold" data-sim-verdict>
                {simulation.verdictText}
              </p>
              <p className="m-0 text-sm font-semibold">{simulation.summary}</p>
            </div>
          )}
          <div>
            <p className="m-0 mb-2 text-sm font-bold text-muted">{copy.simulator.again}</p>
            {chips(simulation.query)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Highlighted text ---------------- */

type Mark = { kind: "vague" | "phrase" | "unit" | null; v: number };

function segments(a: Analysis) {
  const marks: Mark[] = Array.from({ length: a.text.length }, () => ({ kind: null, v: -1 }));
  const paint = (s: number, e: number, m: Mark, only = false) => {
    for (let k = s; k < e; k++) if (!only || !marks[k].kind) marks[k] = m;
  };
  for (const p of a.phrases) paint(p.start, p.end, { kind: "phrase", v: -1 });
  for (const u of a.units) paint(u.start, u.end, { kind: "unit", v: -1 }, true);
  a.vague.forEach((v, n) => paint(v.start, v.end, { kind: "vague", v: n }));
  const out: { text: string; mark: Mark }[] = [];
  for (let k = 0; k < a.text.length; k++) {
    const m = marks[k];
    const last = out[out.length - 1];
    if (last && last.mark.kind === m.kind && last.mark.v === m.v) last.text += a.text[k];
    else out.push({ text: a.text[k], mark: m });
  }
  return out;
}

export function HighlightedText({ analysis, content }: { analysis: Analysis; content: Content }) {
  const segs = useMemo(() => segments(analysis), [analysis]);
  const [picked, setPicked] = useState<number | null>(null);
  const H = content.model.highlights;
  if (!analysis.text) return <p className="m-0 text-sm text-muted">{copy.text.empty}</p>;
  const pickedHit = picked !== null ? analysis.vague[picked] : null;
  return (
    <div className="grid gap-4">
      <p className="m-0 text-[15px] font-extrabold" data-highlight-counts>
        {fill(H.counts, { vague: analysis.vague.length, units: analysis.units.length, phrases: analysis.phrases.length })}
      </p>
      <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[13px] font-semibold text-ink-copy" aria-label={copy.text.key}>
        <li>
          <span className="underline decoration-wavy decoration-2 underline-offset-4" style={{ background: AMBER.bg, textDecorationColor: AMBER.fg }}>
            cosy
          </span>{" "}
          {copy.text.vague}
        </li>
        <li>
          <span className="underline decoration-2 underline-offset-4" style={{ background: GREEN.bg, textDecorationColor: GREEN.fg }}>
            300 Mbps
          </span>{" "}
          {copy.text.fact}
        </li>
        <li>
          <span className="underline decoration-double decoration-2 underline-offset-4" style={{ background: GREEN.bg, textDecorationColor: GREEN.fg }}>
            8 min walk to…
          </span>{" "}
          {copy.text.phrase}
        </li>
      </ul>
      <div className="rounded-[14px] border border-line bg-cloud-2 p-4 text-[15px] leading-[1.9] break-words whitespace-pre-wrap text-ink" data-highlighted>
        {segs.map((s, n) => {
          if (s.mark.kind === "vague") {
            const hit = analysis.vague[s.mark.v];
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPicked(s.mark.v === picked ? null : s.mark.v)}
                title={`Vague word. Instead: ${hit.suggestion}`}
                aria-label={`${s.text}: vague word. Instead, ${hit.suggestion}`}
                aria-pressed={picked === s.mark.v}
                className="cursor-pointer rounded-[3px] border-none p-0 font-[inherit] text-[length:inherit] leading-[inherit] text-ink underline decoration-wavy decoration-2 underline-offset-4"
                style={{ background: AMBER.bg, textDecorationColor: AMBER.fg }}
                data-mark="vague"
              >
                {s.text}
              </button>
            );
          }
          if (s.mark.kind)
            return (
              <mark
                key={n}
                className={cn("rounded-[3px] text-ink underline decoration-2 underline-offset-4", s.mark.kind === "phrase" && "decoration-double")}
                style={{ background: GREEN.bg, textDecorationColor: GREEN.fg }}
                data-mark={s.mark.kind}
              >
                {s.text}
                <span className="sr-only-label"> ({s.mark.kind === "phrase" ? H.phrase : H.fact})</span>
              </mark>
            );
          return <span key={n}>{s.text}</span>;
        })}
      </div>
      <p className="m-0 min-h-6 text-sm leading-[1.55]" aria-live="polite">
        {pickedHit ? (
          <span className="block rounded-[12px] px-3.5 py-2.5" style={{ background: AMBER.bg, color: AMBER.fg }}>
            <strong>‘{pickedHit.text}’:</strong> {pickedHit.suggestion}.
          </span>
        ) : analysis.vague.length ? (
          <span className="text-muted">Tap or hover a highlighted vague word to see what to write instead.</span>
        ) : null}
      </p>
    </div>
  );
}

/* ---------------- Breakdown ---------------- */

function Breakdown({ score, focus }: { score: Score; focus: CheckId | null }) {
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(`air-check-${focus}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  }, [focus]);
  return (
    <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
      {score.checks.map((c) => (
        <li key={c.id} id={`air-check-${c.id}`} tabIndex={-1} className={cn("rounded-[16px] border p-4 outline-none", focus === c.id ? "border-violet ring-2 ring-violet-100" : "border-line")} data-breakdown={c.id}>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="m-0 text-[16px] font-extrabold">
              {c.id}. {c.name}
            </h3>
            <span className="text-[15px] font-extrabold tabular-nums">
              {c.points} / {c.max}
            </span>
          </div>
          <ul className="m-0 grid list-none gap-1 p-0 text-sm leading-[1.5] text-ink-copy">
            {c.reasons.map((r, n) => (
              <li key={n} className="flex gap-2">
                <span aria-hidden="true" className={cn("flex-none font-extrabold", r.points > 0 ? "text-green" : r.points < 0 ? "text-brand-deep" : "text-muted")}>
                  {r.points > 0 ? "✓" : r.points < 0 ? "−" : "·"}
                </span>
                <span>
                  {r.text}: <strong className="text-ink">{r.points >= 0 ? `+${r.points}` : `−${Math.abs(r.points)}`}</strong>
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- History ---------------- */

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
};

function History({ history, onClear }: { history: HistoryEntry[]; onClear: () => void }) {
  if (!history.length) return <p className="m-0 text-sm text-muted">{copy.history.empty}</p>;
  const W = 320;
  const H = 120;
  const x = (n: number) => (history.length === 1 ? W / 2 : 16 + (n * (W - 32)) / (history.length - 1));
  const y = (s: number) => H - 12 - (s / 100) * (H - 24);
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <figure className="m-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[420px]" role="img" aria-label={`Scores over time: ${history.map((h) => h.score).join(", ")}`}>
          {[0, 50, 80, 100].map((g) => (
            <g key={g}>
              <line x1={0} x2={W} y1={y(g)} y2={y(g)} stroke="#E6E8EB" strokeDasharray="3 3" />
              <text x={W - 2} y={y(g) - 3} fontSize="9" textAnchor="end" fill="#6B7680">
                {g}
              </text>
            </g>
          ))}
          <polyline fill="none" stroke="#5B3FA0" strokeWidth="2.5" points={history.map((h, n) => `${x(n)},${y(h.score)}`).join(" ")} />
          {history.map((h, n) => (
            <circle key={n} cx={x(n)} cy={y(h.score)} r="4.5" fill="#5B3FA0" />
          ))}
        </svg>
      </figure>
      <div className="grid gap-3">
        <table className="w-full border-collapse text-sm" data-history>
          <thead>
            <tr className="text-left text-[12px] tracking-[0.6px] text-muted uppercase">
              <th className="py-1.5 font-extrabold">{copy.history.date}</th>
              <th className="py-1.5 font-extrabold">{copy.history.score}</th>
              <th className="py-1.5 font-extrabold">{copy.history.band}</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((h, n) => (
              <tr key={h.at + n} className="border-t border-line">
                <td className="py-2">{shortDate(h.at)}</td>
                <td className="py-2 font-extrabold tabular-nums">{h.score}</td>
                <td className="py-2">{h.band}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={onClear} className="min-h-11 cursor-pointer self-start border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
          {copy.history.clear}
        </button>
      </div>
    </div>
  );
}
