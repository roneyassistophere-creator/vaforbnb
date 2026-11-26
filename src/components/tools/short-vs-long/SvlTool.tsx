"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { LeadPdfModal } from "@/components/tools/LeadPdfModal";
import { Chips, Num } from "@/components/tools/profit/Fields";
import { Toggle } from "@/components/tools/Toggle";
import { toolById, toolLink } from "@/content/tools/catalog";
import { scenariosKey, storageKey, toolSlug } from "@/content/tools/shortVsLongId";
import { copy } from "@/content/tools/shortVsLongCopy";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { londonToday, type Figures } from "@/lib/tools/figures";
import { money } from "@/lib/tools/format";
import { readHandoffData } from "@/lib/tools/handoff";
import {
  addScenario,
  afterTax,
  bandsFor,
  cleanScenarios,
  compare,
  compareScenarios,
  defaultInputs,
  exampleInputs,
  fiveYear,
  importFromProfit,
  readContent,
  removeScenario,
  renameScenario,
  summaryText,
  timeView,
  validate,
  winnerText,
  type Inputs,
  type Scenario,
} from "@/lib/tools/short-vs-long";
import { useSvl } from "./Context";
import { downloadSvlPdf } from "./exports";

type Saved = { v: 1; inputs: Inputs; example: boolean; importedAt: string };
type Tab = "overview" | "five" | "time" | "tax";
const TAB_LABEL: Record<Tab, string> = { overview: "Overview", five: "5-year view", time: "Your time", tax: "After tax (estimate)" };
const WIN_CLS = { short: "bg-green-100 text-green", long: "bg-ink text-white", same: "bg-fog text-ink-copy" } as const;

const Card = ({ title, children, id }: { title: string; children: ReactNode; id: string }) => (
  <section aria-labelledby={`${id}-h`} className="grid min-w-0 gap-4 rounded-[20px] border border-line bg-white p-5 md:p-6" data-card={id}>
    <h2 id={`${id}-h`} className="m-0 text-[20px] font-extrabold">
      {title}
    </h2>
    {children}
  </section>
);
const Box = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cn("grid min-w-0 gap-4 rounded-[18px] border border-line bg-white p-5", className)}>{children}</div>;

export function SvlTool({ figures }: { figures: Figures }) {
  const c = useMemo(() => readContent(figures), [figures]);
  const { setResult } = useSvl();
  const [inp, setInp] = useState<Inputs>(() => defaultInputs(c));
  const [example, setExample] = useState(false);
  const [ready, setReady] = useState(false);
  const [importedAt, setImportedAt] = useState("");
  const [imported, setImported] = useState<{ summary: string; prev: Inputs } | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [scName, setScName] = useState("");
  const [modal, setModal] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const applyImport = (base: Inputs, at: string, force = false) => {
    const h = readHandoffData("profit-inputs", (x) => x);
    if (!h || (!force && h.createdAt === at)) return { next: base, at, imp: null };
    const r = importFromProfit(base, h.data, c);
    if (!r || !r.fields.length) return { next: base, at: h.createdAt, imp: null };
    track("imported_from", toolSlug, { type: "profit" });
    return { next: r.inputs, at: h.createdAt, imp: { summary: r.summary, prev: base } };
  };

  useEffect(() => {
    const s = deviceStorage.read<Saved>(storageKey);
    const base = s?.v === 1 && s.inputs && typeof s.inputs.rent === "number" ? { ...defaultInputs(c), ...s.inputs, shared: { ...defaultInputs(c).shared, ...s.inputs.shared } } : defaultInputs(c);
    const { next, at, imp } = applyImport(base, typeof s?.importedAt === "string" ? s.importedAt : "");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from device storage after hydration */
    setInp(next);
    setImportedAt(at);
    setImported(imp);
    setExample(s?.example === true && !imp);
    setScenarios(cleanScenarios(deviceStorage.read(scenariosKey), c.model.maxScenarios));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("tool_opened", toolSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c]);
  useEffect(() => {
    if (ready) deviceStorage.write(storageKey, { v: 1, inputs: inp, example, importedAt } satisfies Saved);
  }, [ready, inp, example, importedAt]);
  useEffect(() => {
    if (ready) deviceStorage.write(scenariosKey, scenarios);
  }, [ready, scenarios]);

  const set = (patch: Partial<Inputs>) => {
    setInp((x) => ({ ...x, ...patch }));
    setExample(false);
  };
  const errors = validate(inp);
  const valid = Object.keys(errors).length === 0;
  const cmp = valid ? compare(inp, c) : null;
  const five = valid ? fiveYear(inp, c) : null;
  const time = cmp ? timeView(inp, cmp) : null;
  const tax = cmp ? afterTax(inp, cmp.diff, c) : null;

  useEffect(() => {
    if (ready) setResult(inp, valid);
  }, [ready, inp, valid, setResult]);
  const lastWinner = useRef("");
  useEffect(() => {
    if (!ready || !cmp || (!inp.rent && !inp.shortProfit) || lastWinner.current === cmp.winner) return;
    lastWinner.current = cmp.winner;
    track("result_shown", toolSlug, { band: cmp.winner });
  }, [ready, cmp, inp.rent, inp.shortProfit]);

  const hosting = toolById("hosting-time-calculator");
  const tabs: Tab[] = ["overview", "five", "time", "tax"];
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : -1;
    if (n < 0) return;
    e.preventDefault();
    setTab(tabs[n]);
    document.getElementById(`svl-tab-${tabs[n]}`)?.focus();
  };

  return (
    <div className="grid min-w-0 gap-6 pb-20 lg:pb-0" data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      <div className="grid gap-4">
        <Chips
          legend="Where are you starting from?"
          name="svl-start"
          value={inp.start}
          onChange={(start) => set({ start })}
          hint="This decides which way switching costs apply."
          options={[
            { value: "short", label: "I short-let now" },
            { value: "long", label: "I long-let now" },
            { value: "deciding", label: "I’m deciding" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-outline min-h-11" onClick={() => (setInp(exampleInputs(c)), setExample(true), setImported(null))} data-example>
            Try an example
          </button>
          <button type="button" className="min-h-11 px-2 text-sm font-bold underline underline-offset-2" onClick={() => (setInp(defaultInputs(c)), setExample(false), setImported(null))} data-reset>
            Reset
          </button>
        </div>
        {example && (
          <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-semibold text-ink-copy" data-example-banner>
            {c.example.note}
          </p>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="grid min-w-0 gap-4">
          {/* SHORT LET */}
          <Card title="Short let" id="short">
            <div className="flex flex-wrap items-end gap-3">
              <Num id="s-profit" label="Short-let monthly profit" prefix="£" value={inp.shortProfit} onChange={(shortProfit) => set({ shortProfit })} error={errors.shortProfit} className="min-w-[200px] flex-1" />
              <button
                type="button"
                className="btn btn-outline min-h-11"
                onClick={() => {
                  const r = applyImport(inp, importedAt, true);
                  if (r.imp) {
                    setInp(r.next);
                    setImported(r.imp);
                    setImportedAt(r.at);
                  } else setImported({ summary: "Nothing to import yet. Work out your profit in the profit calculator first, then choose “Compare with long-letting”.", prev: inp });
                }}
                data-import
              >
                Import from profit calculator
              </button>
            </div>
            {imported && (
              <p className="m-0 flex flex-wrap items-center gap-2 rounded-[12px] bg-green-25 px-3 py-2 text-sm font-semibold" role="status" data-imported>
                {imported.summary}
                <button type="button" className="min-h-11 px-1 font-bold underline" onClick={() => (setInp(imported.prev), setImported(null))}>
                  Undo import
                </button>
              </p>
            )}
            {inp.vatRegistered && <p className="m-0 text-sm font-bold text-ink-copy">Your short-let profit is already after VAT.</p>}
            <Toggle label="My short-let profit already includes the “costs either way” below" checked={inp.includesShared} onChange={(includesShared) => set({ includesShared })} hint="Mortgage interest, service charge and so on. Yes if you used the profit calculator." />
            <Num
              id="s-hours"
              label="Hosting hours per month (optional)"
              suffix="hours"
              value={inp.shortHours}
              onChange={(shortHours) => set({ shortHours })}
              error={errors.shortHours}
              hint={
                hosting ? (
                  <>
                    Not sure?{" "}
                    <Link href={toolLink(hosting)} className="font-bold text-brand">
                      Work out your hosting hours
                    </Link>
                  </>
                ) : undefined
              }
              className="sm:max-w-[320px]"
            />
          </Card>

          {/* LONG LET */}
          <Card title="Long let" id="long">
            <Num id="l-rent" label="Expected monthly rent" prefix="£" value={inp.rent} onChange={(rent) => set({ rent })} hint="Check similar long lets nearby or ask a letting agent." error={errors.rent} className="sm:max-w-[280px]" />
            <Chips
              legend="Agent service"
              name="l-agent"
              value={inp.agent}
              onChange={(agent) => set({ agent })}
              options={[
                { value: "none", label: "None (self-managed)" },
                { value: "find", label: "Tenant find only" },
                { value: "collection", label: "Rent collection" },
                { value: "full", label: "Full management" },
              ]}
            />
            {inp.agent === "find" && (
              <div className="grid gap-3 rounded-[14px] bg-cloud-2 p-4">
                <Chips
                  legend="Tenant-find fee"
                  name="l-find"
                  value={inp.findKind}
                  onChange={(findKind) => set({ findKind })}
                  options={[
                    { value: "pounds", label: "A one-off £ fee" },
                    { value: "weeks", label: "Weeks of rent" },
                  ]}
                />
                {inp.findKind === "pounds" ? (
                  <Num id="l-find-pounds" label="One-off fee" prefix="£" value={inp.findPounds} onChange={(findPounds) => set({ findPounds })} error={errors.findPounds} className="sm:max-w-[240px]" />
                ) : (
                  <Num id="l-find-weeks" label="Weeks of rent" suffix="weeks" value={inp.findWeeks} onChange={(findWeeks) => set({ findWeeks })} error={errors.findWeeks} className="sm:max-w-[240px]" />
                )}
              </div>
            )}
            {(inp.agent === "collection" || inp.agent === "full") && <Num id="l-agent-pct" label={inp.agent === "full" ? "Full management fee" : "Rent collection fee"} suffix="% of rent" value={inp.agentPercent} onChange={(agentPercent) => set({ agentPercent })} error={errors.agentPercent} className="sm:max-w-[280px]" />}
            {inp.agent !== "none" && <Toggle label="Agent fees quoted excluding VAT" checked={inp.agentExVat} onChange={(agentExVat) => set({ agentExVat })} hint={`Adds VAT at ${Math.round(c.vatRate * 100)}% to the agent fees.`} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Num id="l-tenancy" label="Expected tenancy length" suffix="months" value={inp.tenancyMonths} onChange={(tenancyMonths) => set({ tenancyMonths })} hint="Periodic tenancies have no fixed end. Use your best estimate." error={errors.tenancyMonths} />
              <div className="grid content-start gap-1.5">
                <Num id="l-voids" label="Void weeks per year" suffix="weeks" value={inp.voidWeeks} onChange={(voidWeeks) => set({ voidWeeks })} hint="Weeks with no tenant." error={errors.voidWeeks} />
                <div className="flex gap-1.5">
                  <button type="button" className="btn btn-outline min-h-11 flex-1 px-0" aria-label="One void week fewer" onClick={() => set({ voidWeeks: Math.max(0, Math.round(inp.voidWeeks) - 1) })}>
                    −
                  </button>
                  <button type="button" className="btn btn-outline min-h-11 flex-1 px-0" aria-label="One more void week" onClick={() => set({ voidWeeks: Math.min(26, Math.round(inp.voidWeeks) + 1) })}>
                    +
                  </button>
                </div>
              </div>
            </div>
            <details className="rounded-[14px] border border-line p-4" open>
              <summary className="min-h-11 cursor-pointer font-bold">Landlord costs</summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Num id="l-ins" label="Landlord insurance (a month, if separate)" prefix="£" value={inp.landlordInsurance} onChange={(landlordInsurance) => set({ landlordInsurance })} error={errors.landlordInsurance} />
                <div className="grid content-start gap-2">
                  <Chips
                    legend="Maintenance"
                    name="l-maint"
                    value={inp.maintKind}
                    onChange={(maintKind) => set({ maintKind })}
                    options={[
                      { value: "pounds", label: "£ a month" },
                      { value: "percent", label: "% of rent received" },
                    ]}
                  />
                  {inp.maintKind === "pounds" ? (
                    <Num id="l-maint-pounds" label="Maintenance a month" hideLabel prefix="£" value={inp.maintPounds} onChange={(maintPounds) => set({ maintPounds })} error={errors.maintPounds} />
                  ) : (
                    <Num id="l-maint-pct" label="Maintenance reserve" hideLabel suffix="%" value={inp.maintPercent} onChange={(maintPercent) => set({ maintPercent })} error={errors.maintPercent} />
                  )}
                </div>
                <Num id="l-other" label="Other landlord costs (a month)" prefix="£" value={inp.otherMonthly} onChange={(otherMonthly) => set({ otherMonthly })} error={errors.otherMonthly} />
                <Num id="l-gas" label="Gas safety (a year)" prefix="£" value={inp.gasAnnual} onChange={(gasAnnual) => set({ gasAnnual })} error={errors.gasAnnual} />
                <Num id="l-eicr" label="EICR cost" prefix="£" value={inp.eicr} onChange={(eicr) => set({ eicr })} hint={`Spread over ${c.eicrMonths} months.`} error={errors.eicr} />
                <Num id="l-epc" label="EPC cost" prefix="£" value={inp.epc} onChange={(epc) => set({ epc })} hint={`Spread over ${c.epcMonths} months.`} error={errors.epc} />
                <Num id="l-licence" label="Licence cost" prefix="£" value={inp.licenceCost} onChange={(licenceCost) => set({ licenceCost })} error={errors.licenceCost} />
                <Num id="l-licence-years" label="Years the licence covers" suffix="years" value={inp.licenceYears} onChange={(licenceYears) => set({ licenceYears })} error={errors.licenceYears} />
                <Num id="l-other-annual" label="Other annual costs" prefix="£" value={inp.otherAnnual} onChange={(otherAnnual) => set({ otherAnnual })} error={errors.otherAnnual} />
                <Num id="l-arrears" label="Rent arrears allowance" suffix="% of rent" value={inp.arrearsPercent} onChange={(arrearsPercent) => set({ arrearsPercent })} hint="Some landlords allow for missed rent." error={errors.arrearsPercent} />
                <Num id="l-bills" label="Bills you’d still pay (a month)" prefix="£" value={inp.landlordBills} onChange={(landlordBills) => set({ landlordBills })} hint="For example, if bills are included in the rent." error={errors.landlordBills} />
              </div>
            </details>
          </Card>

          {/* COSTS EITHER WAY */}
          <Card title="Costs either way" id="shared">
            <p className="m-0 -mt-2 text-sm text-ink-copy">Paid whichever you choose. Counted once: always on the long-let side, and on the short-let side only if your profit doesn’t already include them.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["interest", "Mortgage interest"],
                  ["serviceCharge", "Service charge"],
                  ["groundRent", "Ground rent"],
                  ["buildingsInsurance", "Buildings insurance"],
                  ["other", "Other"],
                ] as [keyof Inputs["shared"], string][]
              ).map(([k, label]) => (
                <Num key={k} id={`c-${k}`} label={`${label} (a month)`} prefix="£" value={inp.shared[k]} onChange={(v) => set({ shared: { ...inp.shared, [k]: v } })} error={errors[`shared.${k}`]} />
              ))}
            </div>
          </Card>
        </div>

        {/* HEAD TO HEAD */}
        <div ref={panelRef} className="grid scroll-mt-4 gap-3 lg:sticky lg:top-4" data-panel-wrap>
          {!cmp ? (
            <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold" data-no-result>
              Fix the fields marked in red to see the comparison.
            </p>
          ) : (
            <section aria-label="Head to head" className="grid gap-4 rounded-[22px] border border-ink bg-white p-5" data-head>
              <div className="grid grid-cols-2 gap-2" aria-live="polite" aria-atomic="true">
                {(
                  [
                    ["short", "Short let", cmp.short.net, [["Profit", cmp.short.profit], ["Costs either way", -cmp.short.adjustment]]],
                    ["long", "Long let", cmp.long.net, [["Rent received", cmp.long.rentReceived], ["Agent fees", -cmp.long.agentFee], ["Tenant find (spread)", -cmp.long.tenantFind], ["Landlord costs", -cmp.long.landlordCosts], ["Costs either way", -cmp.long.shared]]],
                  ] as [string, string, number, [string, number][]][]
                ).map(([id, label, net, rows]) => (
                  <div key={id} className="grid content-start gap-1 rounded-[14px] bg-cloud-2 p-3" data-side={id}>
                    <span className="text-[13px] font-bold text-ink-copy">{label}</span>
                    <span className="text-[22px] leading-[1.15] font-extrabold tabular-nums" data-net>
                      {money(net, 0)}
                      <span className="text-[13px] font-bold text-ink-copy">/month</span>
                    </span>
                    <details className="text-[12px]">
                      <summary className="min-h-11 cursor-pointer py-2 font-bold text-ink-copy">Breakdown</summary>
                      <ul className="m-0 grid list-none gap-0.5 p-0 tabular-nums">
                        {rows.map(([k, v]) => (
                          <li key={k} className="flex justify-between gap-2">
                            <span>{k}</span>
                            <span>{money(v)}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ))}
              </div>
              <p className={cn("m-0 self-start rounded-full px-4 py-1.5 text-[15px] font-extrabold", WIN_CLS[cmp.winner])} data-winner={cmp.winner}>
                {winnerText(cmp, c)}
              </p>
              <ul className="m-0 grid list-none gap-1.5 p-0 text-sm leading-[1.5]">
                <li data-break-even-rent>{cmp.breakEvenRent.ok ? `A long-let rent of ${money(cmp.breakEvenRent.value)} would match your short-let profit.` : cmp.breakEvenRent.message}</li>
                <li data-min-short>Short-letting needs to make at least {money(cmp.minShortProfit)} a month to beat this long let.</li>
              </ul>
            </section>
          )}
        </div>
      </div>

      {cmp && five && time && tax && (
        <section aria-label="Results" className="grid min-w-0 gap-4" data-results>
          <div role="tablist" aria-label="Results" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {tabs.map((t, i) => (
              <button
                key={t}
                id={`svl-tab-${t}`}
                type="button"
                role="tab"
                aria-selected={tab === t}
                aria-controls={`svl-panel-${t}`}
                tabIndex={tab === t ? 0 : -1}
                onKeyDown={(e) => onTabKey(e, i)}
                onClick={() => (setTab(t), track("tab_viewed", toolSlug, { type: t }))}
                className={cn("min-h-11 flex-none rounded-full border-[1.5px] px-4 text-sm font-bold", tab === t ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink")}
                data-tab={t}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`svl-panel-${tab}`} aria-labelledby={`svl-tab-${tab}`} className="min-w-0" data-panel={tab}>
            {tab === "overview" && (
              <div className="grid gap-4">
                <Box>
                  <h3 className="m-0 text-lg font-extrabold">Side by side, a month</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <table className="w-full border-collapse text-sm" data-long-table>
                      <caption className="mb-1 text-left text-[13px] font-extrabold text-muted uppercase">Long let</caption>
                      <tbody>
                        {(
                          [
                            ["Rent", cmp.long.rent],
                            ["Void weeks", -cmp.long.voidLoss],
                            ["Agent fees", -cmp.long.agentFee],
                            ["Tenant find (spread)", -cmp.long.tenantFind],
                            ["Landlord costs", -cmp.long.landlordCosts],
                            ["Costs either way", -cmp.long.shared],
                          ] as [string, number][]
                        ).map(([k, v]) => (
                          <tr key={k} className="border-t border-line">
                            <th scope="row" className="py-1.5 text-left font-normal">{k}</th>
                            <td className="py-1.5 text-right tabular-nums">{money(v)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-ink font-extrabold">
                          <th scope="row" className="py-1.5 text-left">Net</th>
                          <td className="py-1.5 text-right tabular-nums">{money(cmp.long.net)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse self-start text-sm" data-short-table>
                      <caption className="mb-1 text-left text-[13px] font-extrabold text-muted uppercase">Short let</caption>
                      <tbody>
                        <tr className="border-t border-line">
                          <th scope="row" className="py-1.5 text-left font-normal">Profit {imported ? "(imported)" : "(as entered)"}</th>
                          <td className="py-1.5 text-right tabular-nums">{money(cmp.short.profit)}</td>
                        </tr>
                        <tr className="border-t border-line">
                          <th scope="row" className="py-1.5 text-left font-normal">Costs either way</th>
                          <td className="py-1.5 text-right tabular-nums">{inp.includesShared ? "Already included" : money(-cmp.short.adjustment)}</td>
                        </tr>
                        <tr className="border-t-2 border-ink font-extrabold">
                          <th scope="row" className="py-1.5 text-left">Net</th>
                          <td className="py-1.5 text-right tabular-nums">{money(cmp.short.net)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <NetBars short={cmp.short.net} long={cmp.long.net} />
                </Box>
                <Box>
                  <h3 className="m-0 text-lg font-extrabold">Who pays what</h3>
                  <div className="-mx-5 overflow-x-auto px-5">
                    <table className="w-full min-w-[460px] border-collapse text-sm" data-who-pays>
                      <thead className="text-[12px] text-muted uppercase">
                        <tr>
                          <th className="py-1.5 text-left" />
                          <th className="py-1.5 pl-3 text-left">Short let</th>
                          <th className="py-1.5 pl-3 text-left">Long let</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.whoPays.map((w) => (
                          <tr key={w.item} className="border-t border-line">
                            <th scope="row" className="py-1.5 text-left">{w.item}</th>
                            <td className="py-1.5 pl-3">{w.short}</td>
                            <td className="py-1.5 pl-3">{w.long}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Box>
              </div>
            )}

            {tab === "five" && (
              <div className="grid gap-4">
                <Box>
                  <h3 className="m-0 text-lg font-extrabold">Switching and growth</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(inp.start === "short" || inp.start === "deciding") && <Num id="f-to-long" label="Cost to switch to a long let" prefix="£" value={inp.switchToLong} onChange={(switchToLong) => set({ switchToLong })} hint="Decorating, removing furniture, safety upgrades." error={errors.switchToLong} />}
                    {(inp.start === "short" || inp.start === "deciding") && <Num id="f-resale" label="Furniture resale value" prefix="£" value={inp.resale} onChange={(resale) => set({ resale })} hint="Reduces the cost of switching to a long let." error={errors.resale} />}
                    {(inp.start === "long" || inp.start === "deciding") && <Num id="f-to-short" label="Cost to switch to a short let" prefix="£" value={inp.switchToShort} onChange={(switchToShort) => set({ switchToShort })} hint="Furnishing and set-up." error={errors.switchToShort} />}
                    <Num id="f-rent-growth" label="Annual rent growth (ASSUMPTION)" suffix="%" value={inp.rentGrowth} onChange={(rentGrowth) => set({ rentGrowth })} error={errors.rentGrowth} />
                    <Num id="f-short-growth" label="Annual short-let profit growth (ASSUMPTION)" suffix="%" value={inp.shortGrowth} onChange={(shortGrowth) => set({ shortGrowth })} error={errors.shortGrowth} />
                  </div>
                </Box>
                <Box>
                  <h3 className="m-0 text-lg font-extrabold">Over 5 years: {money(five.cumulative, 0)} in favour of {five.cumulative >= 0 ? "short-letting" : "long-letting"}</h3>
                  <CumulativeChart months={five.months} />
                  <div className="-mx-5 overflow-x-auto px-5">
                    <table className="w-full min-w-[480px] border-collapse text-sm" data-five-table>
                      <thead className="text-[12px] text-muted uppercase">
                        <tr>
                          <th className="py-1.5 text-left">Year</th>
                          <th className="py-1.5 pl-3 text-right">Short a month</th>
                          <th className="py-1.5 pl-3 text-right">Long a month</th>
                          <th className="py-1.5 pl-3 text-right">Difference</th>
                          <th className="py-1.5 pl-3 text-right">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {five.offset !== 0 && (
                          <tr className="border-t border-line text-ink-copy">
                            <th scope="row" className="py-1.5 text-left font-normal">Switching cost</th>
                            <td colSpan={3} />
                            <td className="py-1.5 pl-3 text-right tabular-nums">{money(five.offset, 0)}</td>
                          </tr>
                        )}
                        {five.rows.map((r) => (
                          <tr key={r.year} className="border-t border-line">
                            <th scope="row" className="py-1.5 text-left">Year {r.year}</th>
                            <td className="py-1.5 pl-3 text-right tabular-nums">{money(r.short, 0)}</td>
                            <td className="py-1.5 pl-3 text-right tabular-nums">{money(r.long, 0)}</td>
                            <td className="py-1.5 pl-3 text-right tabular-nums">{money(r.diff, 0)}</td>
                            <td className="py-1.5 pl-3 text-right font-bold tabular-nums">{money(r.cumulative, 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {five.payback && (
                    <p className="m-0 text-sm font-bold" data-payback>
                      Payback of the switching cost: {five.payback.text}.
                    </p>
                  )}
                </Box>
              </div>
            )}

            {tab === "time" && (
              <Box>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Num id="t-short" label="Short-let hours a month" suffix="hours" value={inp.shortHours} onChange={(shortHours) => set({ shortHours })} error={errors.shortHours} />
                  <Num id="t-long" label="Long-let hours a month (ASSUMPTION)" suffix="hours" value={inp.longHours} onChange={(longHours) => set({ longHours })} error={errors.longHours} />
                  <Num id="t-value" label="Value my time at (optional)" prefix="£" suffix="/hour" value={inp.hourValue} onChange={(hourValue) => set({ hourValue })} error={errors.hourValue} />
                </div>
                {!inp.shortHours && hosting && (
                  <p className="m-0 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold" data-hours-prompt>
                    Not sure?{" "}
                    <Link href={toolLink(hosting)} className="font-bold text-brand">
                      Work out your hosting hours
                    </Link>
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[14px] bg-cloud-2 p-4" data-per-hour="short">
                    <p className="m-0 text-[13px] font-bold text-ink-copy">Short let</p>
                    <p className="m-0 text-[22px] font-extrabold tabular-nums">{time.shortPerHour === null ? "–" : `${money(time.shortPerHour)}/hour`}</p>
                  </div>
                  <div className="rounded-[14px] bg-cloud-2 p-4" data-per-hour="long">
                    <p className="m-0 text-[13px] font-bold text-ink-copy">Long let</p>
                    <p className="m-0 text-[22px] font-extrabold tabular-nums">{time.longPerHour === null ? "–" : `${money(time.longPerHour)}/hour`}</p>
                  </div>
                </div>
                {time.extraPerHour !== null && (
                  <p className="m-0 text-[16px] font-extrabold" data-extra-hour>
                    {time.extraPerHour >= 0 ? `Short-letting pays you ${money(time.extraPerHour)} for each extra hour of work.` : `Each extra hour of short-letting costs you ${money(-time.extraPerHour)} compared with a long let.`}
                  </p>
                )}
                {time.timeAdjusted !== null && (
                  <p className="m-0 text-sm" data-time-adjusted>
                    Valuing your time at {money(inp.hourValue)} an hour, the difference is {money(time.timeAdjusted)} a month {time.timeAdjusted >= 0 ? "in favour of short-letting" : "in favour of long-letting"}.
                  </p>
                )}
              </Box>
            )}

            {tab === "tax" && (
              <Box>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="m-0 text-lg font-extrabold">After tax</h3>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-[12px] font-extrabold tracking-[0.6px] text-amber uppercase">Estimate</span>
                </div>
                <Chips
                  legend="Where is the property?"
                  name="x-nation"
                  value={inp.taxNation}
                  onChange={(taxNation) => set({ taxNation, taxBand: "basic" })}
                  options={[
                    { value: "uk", label: "England, Wales or NI" },
                    { value: "scotland", label: "Scotland" },
                  ]}
                />
                <Chips legend="Your income tax band" name="x-band" value={inp.taxBand} onChange={(taxBand) => set({ taxBand })} options={bandsFor(inp, c).map((b) => ({ value: b.id, label: b.label }))} />
                {inp.taxNation === "uk" ? (
                  <Chips
                    legend="Rates"
                    name="x-rates"
                    value={inp.taxRates}
                    onChange={(taxRates) => set({ taxRates })}
                    options={[
                      { value: "current", label: "Current" },
                      { value: "from2027", label: "From 6 April 2027" },
                    ]}
                  />
                ) : (
                  <p className="m-0 text-sm font-bold text-amber">From April 2027: check Scottish rates.</p>
                )}
                <table className="w-full border-collapse text-sm" data-tax-table>
                  <thead className="text-[12px] text-muted uppercase">
                    <tr>
                      <th className="py-1.5 text-left" />
                      <th className="py-1.5 pl-3 text-right">A month</th>
                      <th className="py-1.5 pl-3 text-right">A year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-line">
                      <th scope="row" className="py-1.5 text-left">Difference before tax</th>
                      <td className="py-1.5 pl-3 text-right tabular-nums">{money(cmp.diff)}</td>
                      <td className="py-1.5 pl-3 text-right tabular-nums">{money(cmp.yearly)}</td>
                    </tr>
                    <tr className="border-t border-line font-extrabold">
                      <th scope="row" className="py-1.5 text-left">After tax ({Math.round(tax.rate * 100)}%)</th>
                      <td className="py-1.5 pl-3 text-right tabular-nums" data-after-tax>
                        {money(tax.monthly)}
                      </td>
                      <td className="py-1.5 pl-3 text-right tabular-nums">{money(tax.yearly)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="m-0 text-sm text-ink-copy">{tax.label}. {c.wording.afterTaxNote} VAT and capital gains aren’t calculated.</p>
              </Box>
            )}
          </div>

          <div className="grid gap-3 rounded-[18px] border border-line bg-white p-4" data-actions>
            <div className="flex flex-wrap items-end gap-2">
              <CopyButton getText={() => summaryText(inp, c)} label="Copy summary" className="btn btn-outline min-h-11" onCopied={() => track("copied", toolSlug)} />
              <button type="button" className="btn btn-coral min-h-11" onClick={() => setModal(true)} data-pdf>
                Download PDF report
              </button>
              <div className="grid gap-1.5">
                <label htmlFor="svl-sc-name" className="text-sm font-bold">
                  Scenario name
                </label>
                <input id="svl-sc-name" className="field min-h-11" value={scName} maxLength={40} onChange={(e) => setScName(e.target.value)} placeholder={`Scenario ${scenarios.length + 1}`} />
              </div>
              <button
                type="button"
                className="btn btn-outline min-h-11"
                disabled={scenarios.length >= c.model.maxScenarios}
                onClick={() => {
                  const r = addScenario(scenarios, scName, inp, c.model.maxScenarios);
                  if (r.full) return;
                  setScenarios(r.list);
                  setSelected((s) => (s.length < c.model.compareMax ? [...s, r.list[r.list.length - 1].id] : s));
                  setScName("");
                  track("scenario_saved", toolSlug, { count: r.list.length });
                }}
                data-save-scenario
              >
                Save scenario
              </button>
            </div>
            {scenarios.length > 0 && (
              <ul className="m-0 grid list-none gap-2 p-0" data-scenario-list>
                {scenarios.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-[12px] bg-cloud-2 px-3 py-1.5">
                    <label className="flex min-h-11 items-center">
                      <input type="checkbox" className="size-5" checked={selected.includes(s.id)} disabled={!selected.includes(s.id) && selected.length >= c.model.compareMax} onChange={(e) => setSelected(e.target.checked ? [...selected, s.id] : selected.filter((x) => x !== s.id))} />
                      <span className="sr-only-label">Compare {s.name}</span>
                    </label>
                    <input aria-label={`Rename ${s.name}`} className="field min-h-11 min-w-0 flex-1" defaultValue={s.name} onBlur={(e) => setScenarios((l) => renameScenario(l, s.id, e.target.value))} />
                    <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => setInp({ ...defaultInputs(c), ...s.inputs })}>
                      Load
                    </button>
                    <button type="button" className="min-h-11 px-2 text-sm font-bold text-brand underline" onClick={() => (setScenarios((l) => removeScenario(l, s.id)), setSelected((x) => x.filter((i) => i !== s.id)))}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selected.length > 1 && (
              <div className="-mx-4 overflow-x-auto px-4">
                <table className="w-full min-w-[420px] border-collapse text-sm" data-compare>
                  <thead>
                    <tr>
                      <th />
                      {scenarios
                        .filter((s) => selected.includes(s.id))
                        .map((s) => (
                          <th key={s.id} className="py-2 pl-4 text-right font-extrabold">{s.name}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareScenarios(scenarios.filter((s) => selected.includes(s.id)), c).map((r) => (
                      <tr key={r.label} className={cn("border-t border-line", r.differs && "bg-amber-25")} data-differs={r.differs ? "" : undefined}>
                        <th scope="row" className="py-1.5 text-left">
                          {r.label}
                          {r.differs && <span className="sr-only-label"> (differs)</span>}
                        </th>
                        {r.values.map((v, i) => (
                          <td key={i} className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {cmp && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-white px-4 py-2.5 shadow-[0_-6px_20px_rgba(20,33,43,0.12)] lg:hidden" data-mobile-bar>
          <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
            <p className="m-0 text-[14px] font-extrabold tabular-nums">
              {cmp.winner === "same" ? "About the same" : `${cmp.winner === "short" ? "Short" : "Long"} let +${money(Math.abs(cmp.diff), 0)}/month`}
            </p>
            <button type="button" className="btn btn-coral min-h-11 px-3.5 text-sm" onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              See result
            </button>
          </div>
        </div>
      )}

      <p className="m-0 text-[13px] text-muted">
        Your figures stay on this device.{" "}
        {confirmClear ? (
          <>
            <button
              type="button"
              className="inline-flex min-h-11 items-center font-bold text-brand underline"
              onClick={() => {
                deviceStorage.remove(storageKey);
                deviceStorage.remove(scenariosKey);
                setScenarios([]);
                setSelected([]);
                setInp(defaultInputs(c));
                setImported(null);
                setConfirmClear(false);
              }}
              data-clear-confirm
            >
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

      <LeadPdfModal
        open={modal}
        onClose={() => setModal(false)}
        toolSlug={toolSlug}
        copy={copy.pdfModal}
        makePdf={async () => {
          track("pdf_downloaded", toolSlug);
          await downloadSvlPdf(inp, c, copy.disclaimer, `short-vs-long-let-${londonToday()}.pdf`, new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
        }}
      />
    </div>
  );
}

function NetBars({ short, long }: { short: number; long: number }) {
  const max = Math.max(1, Math.abs(short), Math.abs(long));
  return (
    <div className="grid gap-2">
      <figure className="m-0 grid gap-2" aria-hidden="true" data-net-chart>
        {(
          [
            ["Short let", short, "bg-coral"],
            ["Long let", long, "bg-ink"],
          ] as [string, number, string][]
        ).map(([label, v, cls]) => (
          <div key={label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
            <span className="text-[13px] font-bold">{label}</span>
            <span className="flex items-center gap-2">
              <span className={cn("h-6 rounded-[4px]", v >= 0 ? cls : "bg-brand")} style={{ width: `${Math.max(1, (Math.abs(v) / max) * 72)}%` }} />
              <span className="text-[13px] font-extrabold tabular-nums">{money(v, 0)}</span>
            </span>
          </div>
        ))}
      </figure>
      <p className="sr-only-label">
        Short let {money(short, 0)} a month; long let {money(long, 0)} a month.
      </p>
    </div>
  );
}

function CumulativeChart({ months }: { months: number[] }) {
  const W = 600;
  const H = 200;
  const pad = 24;
  const lo = Math.min(0, ...months);
  const hi = Math.max(1, ...months);
  const x = (m: number) => pad + (m / 60) * (W - pad * 2);
  const y = (v: number) => pad + ((hi - v) / (hi - lo)) * (H - pad * 2);
  // A step at month 0 from zero to the switching cost.
  const points = [`${x(0)},${y(0)}`, `${x(0)},${y(months[0])}`, ...months.map((v, m) => `${x(m)},${y(v)}`)].join(" ");
  return (
    <figure className="m-0" data-five-chart>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
        <line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke="#C9CED3" strokeDasharray="4 4" />
        <polyline fill="none" stroke="#1F6B45" strokeWidth="2.5" points={points} />
        {[0, 12, 24, 36, 48, 60].map((m) => (
          <text key={m} x={x(m)} y={H - 4} fontSize="12" textAnchor="middle" fill="#5F6B75">
            {m === 0 ? "Now" : `Y${m / 12}`}
          </text>
        ))}
      </svg>
      <figcaption className="text-[12px] text-muted">Cumulative difference (above the line favours short-letting). The step at the start is the switching cost.</figcaption>
    </figure>
  );
}
