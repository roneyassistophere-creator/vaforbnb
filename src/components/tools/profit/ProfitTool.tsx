"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { LeadPdfModal } from "@/components/tools/LeadPdfModal";
import { brand } from "@/config/brand";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { toolPath as houseRulesPath } from "@/content/tools/houseRulesId";
import { financeCheckHref, scenariosKey, storageKey, toolSlug } from "@/content/tools/profitId";
import { copy } from "@/content/tools/profitCopy";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { formatDate, londonToday, type Figures } from "@/lib/tools/figures";
import { makeHandoff, readHandoffData, writeHandoff } from "@/lib/tools/handoff";
import {
  addScenario,
  calculate,
  cleanScenarios,
  compareScenarios,
  defaultInputs,
  ensureMonths,
  fromFigures,
  insights as buildInsights,
  notices as buildNotices,
  profitHandoffData,
  readContent,
  removeScenario,
  renameScenario,
  restoreInputs,
  sensitivity,
  summaryText,
  taxEstimate,
  validate,
  whatThisMeans,
  type Inputs,
  type Scenario,
} from "@/lib/tools/profit";
import { downloadProfitCsv, downloadProfitPdf } from "./exports";
import { useKit } from "./ProfitContext";
import { ProfitInputs } from "./ProfitInputs";
import { Headline, MobileBar, MoneyFlowTab, MonthsTab, NeedleTab, Overview, ScenariosTab, Tabs, TaxTab, type TabId } from "./ProfitResults";

type Saved = { v: 1; inputs: Inputs; example: boolean };

export function ProfitTool({ figures }: { figures: Figures }) {
  const c = useMemo(() => readContent(figures), [figures]);
  const router = useRouter();
  const kit = useKit();
  // The first render (on the server) uses the stored starting values; the device's own figures load after.
  const startYear = Number(c.model.versionDate.slice(0, 4)) + 1;
  const [inp, setInp] = useState<Inputs>(() => defaultInputs(c, startYear));
  const [example, setExample] = useState(true);
  const [exampleNote, setExampleNote] = useState(copy.example);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState<TabId>("overview");
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [london, setLondon] = useState(false);
  const [handoffMsg, setHandoffMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  /* Load (this device only), then save on every change. */
  useEffect(() => {
    const saved = deviceStorage.read<Saved>(storageKey);
    const restored = saved?.v === 1 ? restoreInputs(saved.inputs, c) : null;
    const flag = readHandoffData("london-flag", (x) => x);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from device storage after hydration */
    if (restored) {
      setInp(restored);
      setExample(saved?.example === true);
    } else setInp(defaultInputs(c, new Date().getFullYear() + 1));
    setScenarios(cleanScenarios(deviceStorage.read(scenariosKey), c.model.maxScenarios));
    setLondon(!!flag && typeof flag.data === "object" && flag.data !== null && (flag.data as { london?: unknown }).london === true);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("tool_opened", toolSlug, { type: restored?.mode ?? "quick" });
  }, [c]);
  useEffect(() => {
    if (ready) deviceStorage.write(storageKey, { v: 1, inputs: inp, example } satisfies Saved);
  }, [ready, inp, example]);
  useEffect(() => {
    if (ready) deviceStorage.write(scenariosKey, scenarios);
  }, [ready, scenarios]);

  const set = (patch: Partial<Inputs>) => {
    setInp((x) => ({ ...x, ...patch }));
    setExample(false);
  };

  /* The model (all plain functions). */
  const errors = validate(inp);
  const r = calculate(inp, c);
  const levers = sensitivity(inp, c);
  const tax = inp.tax.on ? taxEstimate(inp, r, c) : null;
  const n = buildNotices(inp, r, c);
  const ins = buildInsights(inp, r, levers, tax, n, c);
  const meaning = whatThisMeans(r, levers, c);
  const compareRows = compareScenarios(scenarios.filter((s) => selected.includes(s.id)), c);

  // Result band only (never figures), once per change of band.
  const lastBand = useRef("");
  useEffect(() => {
    if (!ready || lastBand.current === r.status) return;
    lastBand.current = r.status;
    track("result_shown", toolSlug, { band: r.status === "healthy" ? "profit" : r.status, type: inp.mode });
    if (kit) track("kit_step_completed", toolSlug, { type: kit });
  }, [ready, r.status, inp.mode, kit]);

  const switchMode = (mode: Inputs["mode"]) => {
    if (mode === inp.mode) return;
    setInp((x) => (mode === "detailed" ? { ...ensureMonths(x), mode } : { ...x, mode }));
    if (mode !== "detailed" && tab === "months") setTab("overview");
    track("mode_switched", toolSlug, { type: mode });
  };
  const loadExample = (id: string) => {
    const e = c.examples.find((x) => x.id === id);
    if (!e) return;
    setInp((x) => fromFigures(e.figures, c, x));
    setExample(true);
    setExampleNote(e.note);
  };
  const reset = () => {
    setInp((x) => ({ ...defaultInputs(c, x.year), mode: x.mode, months: x.mode === "detailed" ? ensureMonths({ ...defaultInputs(c, x.year), months: [] }).months : [] }));
    setExample(true);
    setExampleNote(copy.example);
  };
  const clearData = () => {
    deviceStorage.remove(storageKey);
    deviceStorage.remove(scenariosKey);
    setScenarios([]);
    setSelected([]);
    setInp(defaultInputs(c, new Date().getFullYear() + 1));
    setExample(true);
    setExampleNote(copy.example);
    setConfirmClear(false);
  };
  const seeResults = () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const changeTab = (t: TabId) => {
    setTab(t);
    track("tab_viewed", toolSlug, { type: t });
  };

  /* Hand-offs (shared device format). */
  const handoff = (target: string) => {
    const t = toolById(target);
    writeHandoff(makeHandoff("profit-inputs", toolSlug, profitHandoffData(inp, r, c, london)));
    track("handoff_clicked", toolSlug, { type: target });
    if (t && isLive(t)) router.push(toolLink(t));
    else setHandoffMsg(`Saved on this device. The ${t?.name ?? "tool"} is coming soon and will import your figures.`);
  };
  const handoffs = [
    { id: "long-stay-discount-calculator", label: "Try a long-stay discount" },
    { id: "short-let-vs-long-let", label: "Compare with long-letting" },
    { id: "direct-booking-savings", label: "Check direct booking savings" },
  ].filter((h) => {
    const t = toolById(h.id);
    return t && isLive(t);
  });

  const checked = c.lastChecked ? formatDate(c.lastChecked) : "";
  const tabs: TabId[] = inp.mode === "detailed" ? ["overview", "flow", "needle", "months", "tax", "scenarios"] : ["overview", "flow", "needle", "tax", "scenarios"];
  const houseRules = toolById("house-rules-generator");
  const kitNextHref = houseRules && isLive(houseRules) ? `${houseRulesPath}?kit=new-host` : houseRules ? toolLink(houseRules) : "/free-tools";

  return (
    <div className="grid min-w-0 gap-6 pb-20 lg:pb-0" data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      {/* 2. MODE + EXAMPLES */}
      <div className="grid gap-4">
        <div role="radiogroup" aria-label="Mode" className="grid grid-cols-2 gap-1 rounded-[18px] border border-line bg-white p-1.5 md:max-w-[620px]">
          {(
            [
              ["quick", "Quick (1 minute)"],
              ["detailed", "Detailed (seasonal months)"],
            ] as [Inputs["mode"], string][]
          ).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={inp.mode === m} onClick={() => switchMode(m)} className={cn("min-h-12 rounded-[14px] px-3 text-[15px] font-extrabold md:text-base", inp.mode === m ? "bg-ink text-white" : "text-ink hover:bg-cloud-2")} data-mode={m}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-ink-copy">Start from an example:</span>
          {c.examples.map((e) => (
            <button key={e.id} type="button" className="btn btn-outline min-h-11 px-3.5" onClick={() => loadExample(e.id)} data-example={e.id}>
              {e.label}
            </button>
          ))}
          <button type="button" className="min-h-11 px-2 text-sm font-bold text-ink underline underline-offset-2" onClick={reset} data-reset>
            Reset
          </button>
        </div>
        {example && (
          <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-semibold text-ink-copy" data-example-banner>
            {exampleNote}
          </p>
        )}
      </div>

      {/* 3. INPUTS + HEADLINE */}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <ProfitInputs inp={inp} set={set} errors={errors} r={r} c={c} />
        <div className="grid gap-3 lg:sticky lg:top-4">
          <Headline r={r} onSeeResults={seeResults} />
          <p className="m-0 text-center text-[12px] text-muted">Figures last checked {checked} · results update as you type</p>
        </div>
      </div>

      {/* 4. RESULTS (tabs) + actions */}
      <section ref={resultsRef} aria-label="Results" className="grid min-w-0 scroll-mt-4 gap-4" id="results" data-results>
        <Tabs tabs={tabs} active={tabs.includes(tab) ? tab : "overview"} onChange={changeTab}>
          {tab === "overview" && <Overview r={r} inp={inp} set={set} />}
          {tab === "flow" && <MoneyFlowTab r={r} />}
          {tab === "needle" && <NeedleTab levers={levers} c={c} />}
          {tab === "months" && inp.mode === "detailed" && <MonthsTab r={r} />}
          {tab === "tax" && <TaxTab inp={inp} set={set} tax={tax} n={n} c={c} disclaimer={copy.disclaimer} />}
          {tab === "scenarios" && (
            <ScenariosTab
              list={scenarios}
              rows={compareRows}
              max={c.model.maxScenarios}
              compareMax={c.model.compareMax}
              selected={selected}
              onSelect={setSelected}
              onSave={(name) => {
                const res = addScenario(scenarios, name, inp, c.model.maxScenarios);
                if (res.full) return;
                setScenarios(res.list);
                setSelected((s) => (s.length < c.model.compareMax ? [...s, res.list[res.list.length - 1].id] : s));
                track("scenario_saved", toolSlug, { count: res.list.length });
              }}
              onRename={(id, name) => setScenarios((l) => renameScenario(l, id, name))}
              onDelete={(id) => {
                setScenarios((l) => removeScenario(l, id));
                setSelected((s) => s.filter((x) => x !== id));
              }}
              onLoad={(s) => {
                setInp(restoreInputs(s.inputs, c) ?? s.inputs);
                setExample(false);
              }}
            />
          )}
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 rounded-[18px] border border-line bg-white p-3" data-actions>
          <CopyButton getText={() => summaryText(inp, r, levers, ins, tax, c)} label="Copy summary" className="btn btn-outline min-h-11" onCopied={() => track("copied", toolSlug)} />
          <button type="button" className="btn btn-coral min-h-11" onClick={() => setModal(true)} data-pdf>
            Download PDF report
          </button>
          <button
            type="button"
            className="btn btn-outline min-h-11"
            onClick={() => {
              downloadProfitCsv(inp, r, c, `short-let-profit-${londonToday()}.csv`);
              track("file_downloaded", toolSlug, { type: "csv" });
            }}
            data-csv
          >
            Download CSV
          </button>
          {handoffs.map((h) => (
            <button key={h.id} type="button" className="btn btn-outline min-h-11" onClick={() => handoff(h.id)} data-handoff={h.id}>
              {h.label} →
            </button>
          ))}
          {handoffMsg && (
            <p className="m-0 w-full text-sm font-semibold text-ink-copy" role="status">
              {handoffMsg}
            </p>
          )}
        </div>
      </section>

      {/* 5. INSIGHTS */}
      {ins.length > 0 && (
        <section aria-labelledby="insights-h" className="grid gap-3" data-insights>
          <h2 id="insights-h" className="h2 m-0 text-[24px]">
            Insights from your figures
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ins.map((i) => (
              <article key={i.id} className={cn("grid content-start gap-2 rounded-[18px] border p-5", i.tier === 1 ? "border-coral-100 bg-coral-25" : "border-line bg-white")} data-insight={i.id}>
                <p className="m-0 text-[15px] leading-[1.6] text-ink">{i.text}</p>
                {i.links.length > 0 && (
                  <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {i.links.map((l) => {
                      const t = l.tool ? toolById(l.tool) : undefined;
                      const href = t ? toolLink(t) : l.href;
                      return href ? (
                        <Link key={l.label} href={href} className="font-bold text-brand">
                          {l.label} →
                        </Link>
                      ) : null;
                    })}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 6. WHAT THIS MEANS + 7. NEXT STEP */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
          <h2 className="h2 mb-2 text-[24px]">What this means</h2>
          <p className="m-0 text-base leading-[1.7] text-ink-copy" aria-live="polite" data-what-this-means>
            {meaning}
          </p>
        </div>
        {kit === "new-host" ? (
          <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
            <p className="eyebrow text-coral-200">{copy.kit.newHost.eyebrow}</p>
            <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold text-white">{copy.kit.newHost.title}</h2>
            <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{copy.kit.newHost.text}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href={kitNextHref} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "kit" })}>
                House rules generator →
              </Link>
              <a href={brand.downloads.financeSheet} className="text-sm font-bold text-coral-200 underline underline-offset-2 hover:text-white" data-finance-sheet>
                {copy.nextStep.sheet}
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8" data-next-step="service">
            <p className="eyebrow text-brand">{copy.nextStep.eyebrow}</p>
            <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold">{copy.nextStep.title}</h2>
            <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{copy.nextStep.text}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href={financeCheckHref} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
                {copy.nextStep.cta} →
              </Link>
              <a href={brand.downloads.financeSheet} className="text-sm font-bold text-brand underline underline-offset-2" data-finance-sheet>
                {copy.nextStep.sheet}
              </a>
            </div>
          </div>
        )}
      </div>

      <p className="m-0 text-[13px] text-muted">
        Your figures stay on this device.{" "}
        {confirmClear ? (
          <>
            <button type="button" className="inline-flex min-h-11 items-center font-bold text-brand underline" onClick={clearData} data-clear-confirm>
              Yes, clear my data
            </button>{" "}
            <button type="button" className="inline-flex min-h-11 items-center font-bold underline" onClick={() => setConfirmClear(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button type="button" className="inline-flex min-h-11 items-center font-bold text-ink underline" onClick={() => setConfirmClear(true)} data-clear>
            Clear my data
          </button>
        )}
      </p>

      <MobileBar r={r} onSeeResults={seeResults} />
      <LeadPdfModal
        open={modal}
        onClose={() => setModal(false)}
        toolSlug={toolSlug}
        copy={copy.pdfModal}
        makePdf={async () => {
          track("pdf_downloaded", toolSlug, { type: inp.mode });
          await downloadProfitPdf({ inp, r, levers, insights: ins, tax, c, checked, disclaimer: copy.disclaimer, fileName: `short-let-profit-report-${londonToday()}.pdf`, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) });
        }}
      />
    </div>
  );
}
