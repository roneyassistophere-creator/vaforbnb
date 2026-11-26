"use client";

import Link from "next/link";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Toggle } from "@/components/tools/Toggle";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { cn } from "@/lib/cn";
import { money, percent } from "@/lib/tools/format";
import {
  bandsFor,
  costLines,
  leverLine,
  marginText,
  moneyFlow,
  MONTHS,
  paybackText,
  reachText,
  STATUS_LABEL,
  type CompareRow,
  type Content,
  type Inputs,
  type Lever,
  type Notices,
  type Result,
  type Scenario,
  type TaxColumn,
  type TaxEstimate,
} from "@/lib/tools/profit";
import { Bars, MonthChart, Waterfall } from "./Charts";
import { Chips, Num } from "./Fields";

const signed = (n: number, dp: 0 | 2 = 0) => money(n, dp);
const tone = (r: Result) => (r.status === "loss" ? "text-brand" : r.status === "thin" ? "text-amber" : "text-green");
const toneBg = (r: Result) => (r.status === "loss" ? "bg-coral-50" : r.status === "thin" ? "bg-amber-25" : "bg-green-25");

/* ---- Headline panel (always visible) ------------------------------------------------- */

export function Headline({ r, onSeeResults }: { r: Result; onSeeResults?: () => void }) {
  return (
    <section aria-label="Your result" className="grid gap-4 rounded-[22px] border border-ink bg-white p-5 md:p-6" data-headline>
      <div aria-live="polite" aria-atomic="true" className="grid gap-1">
        <p className="m-0 text-[13px] font-extrabold tracking-[0.8px] text-muted uppercase">Profit at your figures</p>
        <p className={cn("m-0 text-[32px] leading-[1.1] font-extrabold tracking-[-1px] tabular-nums md:text-[38px]", tone(r))} data-profit>
          {signed(r.monthly.profit)} <span className="text-[17px] font-bold text-ink-copy">/ month</span>
          <span className="text-[17px] font-bold text-ink-copy"> · {signed(r.annual.profit)} / year</span>
        </p>
        <p className="m-0 flex flex-wrap items-center gap-1.5 text-[17px] font-extrabold text-ink tabular-nums" data-cash>
          Cash flow {signed(r.monthly.cash)} / month
          <span className="cursor-help rounded-full border border-line px-1.5 text-[12px] font-bold text-muted" title="After mortgage capital repayments">
            i<span className="sr-only-label"> After mortgage capital repayments</span>
          </span>
        </p>
        <p className={cn("m-0 mt-1 self-start rounded-full px-3 py-1 text-sm font-extrabold", toneBg(r), tone(r))} data-status={r.status}>
          {STATUS_LABEL[r.status]}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <Tile label="Break-even occupancy" value={reachText(r.breakEven, (v) => percent(v))} sub={marginText(r)} id="break-even" />
        <Tile label="Minimum nightly rate" value={reachText(r.minRate, (v) => money(v))} sub="Covers every cost at your occupancy" id="min-rate" />
        <Tile label="Profit margin" value={r.kpis.margin === null ? "—" : percent(r.kpis.margin)} sub="Of booking value after VAT" id="margin" />
      </div>
      {onSeeResults && (
        <button type="button" className="btn btn-outline min-h-11 lg:hidden" onClick={onSeeResults}>
          See all results
        </button>
      )}
    </section>
  );
}

function Tile({ label, value, sub, id }: { label: string; value: string; sub: string; id: string }) {
  const long = value.length > 14;
  return (
    <div className="grid content-start gap-0.5 rounded-[14px] bg-cloud-2 p-3" data-tile={id}>
      <span className="text-[12px] font-bold text-ink-copy">{label}</span>
      <span className={cn("font-extrabold text-ink tabular-nums", long ? "text-sm leading-[1.35]" : "text-[22px] leading-[1.2]")}>{value}</span>
      <span className="text-[12px] leading-[1.4] text-muted">{sub}</span>
    </div>
  );
}

/** Phones: a sticky bar with the two key figures. */
export function MobileBar({ r, onSeeResults }: { r: Result; onSeeResults: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-white px-4 py-2.5 shadow-[0_-6px_20px_rgba(20,33,43,0.12)] lg:hidden" data-mobile-bar>
      <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
        <p className="m-0 min-w-0 text-[14px] leading-[1.35] font-extrabold tabular-nums">
          <span className={tone(r)}>Profit {signed(r.monthly.profit)}/month</span>
          <span className="text-ink-copy"> · Cash {signed(r.monthly.cash)}/month</span>
        </p>
        <button type="button" className="btn btn-coral min-h-11 flex-none px-3.5 text-sm" onClick={onSeeResults}>
          See results
        </button>
      </div>
    </div>
  );
}

/* ---- Tabs ---------------------------------------------------------------------------- */

export type TabId = "overview" | "flow" | "needle" | "months" | "tax" | "scenarios";
export const TAB_LABELS: Record<TabId, string> = { overview: "Overview", flow: "Money flow", needle: "What moves the needle", months: "Months", tax: "Tax estimate", scenarios: "Scenarios" };

export function Tabs({ tabs, active, onChange, children }: { tabs: TabId[]; active: TabId; onChange: (t: TabId) => void; children: ReactNode }) {
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next]);
    document.getElementById(`tab-${tabs[next]}`)?.focus();
  };
  return (
    <div className="grid min-w-0 gap-4">
      <div role="tablist" aria-label="Results" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {tabs.map((t, i) => (
          <button
            key={t}
            id={`tab-${t}`}
            type="button"
            role="tab"
            aria-selected={active === t}
            aria-controls={`panel-${t}`}
            tabIndex={active === t ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => onChange(t)}
            className={cn("min-h-11 flex-none rounded-full border-[1.5px] px-4 text-sm font-bold", active === t ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink")}
            data-tab={t}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="min-w-0" data-panel={active}>
        {children}
      </div>
    </div>
  );
}

const Card = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cn("grid gap-4 rounded-[18px] border border-line bg-white p-5", className)}>{children}</div>;
const H3 = ({ children }: { children: ReactNode }) => <h3 className="m-0 text-lg font-extrabold text-ink">{children}</h3>;

/* Overview ----------------------------------------------------------------------------- */

export function Overview({ r, inp, set }: { r: Result; inp: Inputs; set: (p: Partial<Inputs>) => void }) {
  const k = r.kpis;
  const kpis: [string, string, string][] = [
    ["Booked nights", `${(r.monthly.nights).toFixed(1)} / month`, `${Math.round(k.nights)} a year`],
    ["Stays", `${r.monthly.stays.toFixed(1)} / month`, `${Math.round(k.stays)} a year`],
    ["ADR", k.adr === null ? "—" : money(k.adr), "Average daily rate"],
    ["RevPAR", k.revpar === null ? "—" : money(k.revpar), "Room revenue per available night"],
    ["Profit per booked night", k.profitPerNight === null ? "—" : money(k.profitPerNight), "After every cost"],
    ["Cost per occupied night", k.costPerNight === null ? "—" : money(k.costPerNight), "Everything except profit"],
    ["Payback on set-up costs", inp.setupCosts > 0 ? paybackText(k.paybackMonths, k.paybackReached) : "—", inp.setupCosts > 0 ? `${money(inp.setupCosts, 0)} set-up` : "Add set-up costs to see this"],
    ["Cash return", k.cashReturn === null ? "—" : percent(k.cashReturn), inp.cashInvested > 0 ? "Yearly cash flow ÷ cash invested" : "Add cash invested to see this"],
  ];
  const lines = costLines(r);
  const groups = ["Fees", "Turnovers", "Variable", "Bills", "Reserve"] as const;
  const G = r.monthly.booking;
  const share = (v: number) => (G > 0 ? `${((v / G) * 100).toFixed(1)}%` : "—");
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4" data-kpis>
        {kpis.map(([label, value, sub]) => (
          <div key={label} className="grid content-start gap-0.5 rounded-[14px] border border-line bg-white p-3" data-kpi={label}>
            <span className="text-[12px] font-bold text-ink-copy">{label}</span>
            <span className="text-[17px] leading-[1.25] font-extrabold tabular-nums">{value}</span>
            <span className="text-[12px] leading-[1.35] text-muted">{sub}</span>
          </div>
        ))}
      </div>

      {isLive(toolById("booking-performance")) && (
        <Link href={toolLink(toolById("booking-performance")!)} className="-mt-2 justify-self-start text-sm font-bold text-brand" data-track-link>
          Track this over time: occupancy, ADR and RevPAR →
        </Link>
      )}
      <Card>
        <H3>Where the money goes</H3>
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[460px] border-collapse text-sm" data-cost-table>
            <thead className="text-[12px] tracking-[0.5px] text-muted uppercase">
              <tr>
                <th className="py-2 text-left">Cost</th>
                <th className="py-2 pl-4 text-right whitespace-nowrap">£ / month</th>
                <th className="py-2 pl-4 text-right whitespace-nowrap">£ / year</th>
                <th className="py-2 pl-4 text-right whitespace-nowrap">% of booking value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line font-extrabold">
                <td className="py-2">Guest booking value</td>
                <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(G)}</td>
                <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(G * 12)}</td>
                <td className="py-2 pl-4 text-right whitespace-nowrap">100%</td>
              </tr>
              {groups.map((g) => {
                const ls = lines.filter((l) => l.group === g);
                if (!ls.length) return null;
                const total = ls.reduce((t, l) => t + l.monthly, 0);
                return [
                  ...ls.map((l) => (
                    <tr key={g + l.label} className="border-t border-line text-ink-copy">
                      <td className="py-1.5 pl-3">{l.label}</td>
                      <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(l.monthly)}</td>
                      <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(l.monthly * 12)}</td>
                      <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{share(l.monthly)}</td>
                    </tr>
                  )),
                  <tr key={`${g}-total`} className="border-t border-line bg-cloud-2 font-bold" data-group={g}>
                    <td className="py-1.5 pl-3">{g} subtotal</td>
                    <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(total)}</td>
                    <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(total * 12)}</td>
                    <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{share(total)}</td>
                  </tr>,
                ];
              })}
              <tr className="border-t-2 border-ink font-extrabold">
                <td className="py-2">Profit</td>
                <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(r.monthly.profit)}</td>
                <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(r.annual.profit)}</td>
                <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{share(r.monthly.profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-sand" >
        <H3>Target solver</H3>
        <Num id="t-target" label="I want to make, a month" prefix="£" value={inp.target} onChange={(target) => set({ target })} className="max-w-[240px]" />
        <p className="m-0 text-[15px] leading-[1.6] text-ink" aria-live="polite" data-target>
          {r.target.rate.ok && r.target.occupancy.ok ? (
            <>
              Charge <strong>{money(r.target.rate.value)} a night</strong> at {percent(r.occupancy)} occupancy, <strong>or</strong> reach <strong>{percent(r.target.occupancy.value)} occupancy</strong> at {money(r.kpis.adr ?? inp.rate)}.
            </>
          ) : (
            <>
              {r.target.rate.ok ? (
                <>
                  Charge <strong>{money(r.target.rate.value)} a night</strong> at {percent(r.occupancy)} occupancy.{" "}
                </>
              ) : (
                <>Price: {r.target.rate.message}. </>
              )}
              {r.target.occupancy.ok ? (
                <>
                  Or reach <strong>{percent(r.target.occupancy.value)} occupancy</strong> at your rate.
                </>
              ) : (
                <>Occupancy: {r.target.occupancy.message}.</>
              )}
            </>
          )}
        </p>
      </Card>
    </div>
  );
}

/* Money flow ---------------------------------------------------------------------------- */

export function MoneyFlowTab({ r }: { r: Result }) {
  const [year, setYear] = useState(false);
  const steps = moneyFlow(year ? r.annual : r.monthly);
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <H3>Money flow {year ? "a year" : "a month"}</H3>
        <div className="flex rounded-full border border-line p-1" role="group" aria-label="Period">
          {[false, true].map((y) => (
            <button key={String(y)} type="button" aria-pressed={year === y} onClick={() => setYear(y)} className={cn("min-h-11 rounded-full px-4 text-sm font-bold", year === y ? "bg-ink text-white" : "text-ink")}>
              {y ? "Yearly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>
      <Waterfall steps={steps} />
      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer py-2 font-bold">Show as a table</summary>
        <table className="w-full border-collapse" data-flow-table>
          <caption className="sr-only-label">Money flow {year ? "a year" : "a month"}</caption>
          <tbody>
            {steps.map((s) => (
              <tr key={s.id} className={cn("border-t border-line", s.kind !== "minus" && "font-extrabold")}>
                <th scope="row" className="py-1.5 text-left font-[inherit]">
                  {s.kind === "minus" ? "Less " : ""}
                  {s.label}
                </th>
                <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(s.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  );
}

/* What moves the needle ------------------------------------------------------------------- */

const LEVER_LINK: Partial<Record<Lever["id"], string>> = { fee: "direct-booking-savings", direct: "direct-booking-savings", occupancy: "uk-event-calendar", stay: "long-stay-discount-calculator" };

export function NeedleTab({ levers, c }: { levers: Lever[]; c: Content }) {
  return (
    <Card>
      <H3>What would add the most profit a year?</H3>
      <p className="m-0 -mt-2 text-sm text-ink-copy">Each change on its own, at your figures.</p>
      <Bars items={levers.map((l) => ({ id: l.id, label: leverLine(l, c), value: l.gain }))} />
      <ul className="m-0 grid list-none gap-2 p-0" data-lever-list>
        {levers.map((l) => {
          const tool = LEVER_LINK[l.id] ? toolById(LEVER_LINK[l.id]!) : undefined;
          return (
            <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line pt-2 text-sm">
              <span>{leverLine(l, c)}.</span>
              {tool && (
                <Link href={toolLink(tool)} className="font-bold text-brand">
                  {tool.name} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* Months ---------------------------------------------------------------------------------- */

export function MonthsTab({ r }: { r: Result }) {
  const best = r.bestMonth;
  return (
    <Card>
      <H3>Month by month ({r.months.length === 12 ? "Detailed mode" : ""})</H3>
      <p className="m-0 -mt-2 text-sm font-bold text-ink" data-month-summary>
        {r.lossMonths.length ? `Loss months: ${r.lossMonths.map((i) => MONTHS[i].slice(0, 3)).join(", ")}` : "No loss months"}
        {best !== null ? ` · Best month: ${MONTHS[best].slice(0, 3)}` : ""}
      </p>
      <MonthChart profit={r.months.map((m) => m.profit)} cash={r.months.map((m) => m.cash)} />
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[520px] border-collapse text-sm" data-months-table>
          <caption className="sr-only-label">Monthly booked nights, revenue, costs, profit and cash flow</caption>
          <thead className="text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th className="py-2 text-left">Month</th>
              <th className="py-2 pl-4 text-right whitespace-nowrap">Nights</th>
              <th className="py-2 pl-4 text-right whitespace-nowrap">Revenue</th>
              <th className="py-2 pl-4 text-right whitespace-nowrap">Costs</th>
              <th className="py-2 pl-4 text-right whitespace-nowrap">Profit</th>
              <th className="py-2 pl-4 text-right whitespace-nowrap">Cash</th>
            </tr>
          </thead>
          <tbody>
            {r.months.map((m, i) => (
              <tr key={i} className={cn("border-t border-line", m.profit < 0 && "bg-coral-25")}>
                <th scope="row" className="py-1.5 text-left">
                  {MONTHS[i].slice(0, 3)}
                  {m.profit < 0 && <span className="sr-only-label"> (loss)</span>}
                </th>
                <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{m.nights.toFixed(1)}</td>
                <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(m.booking, 0)}</td>
                <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(m.booking - m.profit, 0)}</td>
                <td className={cn("py-1.5 pl-4 text-right whitespace-nowrap font-bold tabular-nums", m.profit < 0 && "text-brand")}>{money(m.profit, 0)}</td>
                <td className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">{money(m.cash, 0)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-ink font-extrabold">
              <th scope="row" className="py-2 text-left">
                Year
              </th>
              <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{Math.round(r.annual.nights)}</td>
              <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(r.annual.booking, 0)}</td>
              <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(r.annual.booking - r.annual.profit, 0)}</td>
              <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(r.annual.profit, 0)}</td>
              <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">{money(r.annual.cash, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* Tax estimate ----------------------------------------------------------------------------- */

export function TaxTab({ inp, set, tax, n, c, disclaimer }: { inp: Inputs; set: (p: Partial<Inputs>) => void; tax: TaxEstimate | null; n: Notices; c: Content; disclaimer: string }) {
  const t = inp.tax;
  const setT = (p: Partial<Inputs["tax"]>) => set({ tax: { ...t, ...p } });
  const bands = bandsFor(t.nation, c);
  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H3>Tax estimate</H3>
          <span className="rounded-md bg-amber-50 px-2 py-1 text-[12px] font-extrabold tracking-[0.6px] text-amber uppercase">Estimate</span>
        </div>
        <Toggle label="Show a tax estimate" checked={t.on} onChange={(on) => setT({ on })} hint="For individual owners. Your band is set by your total income; we don’t include your personal allowance or other income." />
        {t.on && (
          <>
            <Chips
              legend="Where is the property?"
              name="t-nation"
              value={t.nation}
              onChange={(nation) => setT({ nation, band: bandsFor(nation, c).some((b) => b.id === t.band) ? t.band : "basic" })}
              options={[
                { value: "england", label: "England" },
                { value: "wales", label: "Wales" },
                { value: "ni", label: "Northern Ireland" },
                { value: "scotland", label: "Scotland" },
              ]}
            />
            <Chips legend="Your income tax band" name="t-band" value={t.band} onChange={(band) => setT({ band })} options={bands.map((b) => ({ value: b.id, label: b.label }))} />
            <Chips
              legend="Who owns it?"
              name="t-own"
              value={t.ownership}
              onChange={(ownership) => setT({ ownership })}
              options={[
                { value: "me", label: "Just me" },
                { value: "joint", label: "Jointly (50/50)" },
                { value: "company", label: "Through a company" },
              ]}
            />
            <Toggle label="This is a room in my own home where I live" checked={t.roomInHome} onChange={(roomInHome) => setT({ roomInHome })} hint="Adds a Rent a Room relief comparison." />
          </>
        )}
      </Card>

      {t.on && tax && !tax.available && <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold" data-tax-unavailable>{tax.reason}</p>}

      {t.on && tax?.available && (
        <Card>
          <p className="m-0 text-sm text-ink-copy">
            {tax.bandLabel}
            {tax.share < 1 ? " · your 50% share" : ""} · taxable property profit <strong className="text-ink">{money(tax.taxable)}</strong> a year (profit plus {money(tax.annualInterest * tax.share)} mortgage interest, which isn’t deductible for residential lets).
          </p>
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[420px] border-collapse text-sm" data-tax-table>
              <thead className="text-[12px] tracking-[0.5px] text-muted uppercase">
                <tr>
                  <th className="py-2 text-left">A year (ESTIMATE)</th>
                  {tax.columns.map((col) => (
                    <th key={col.id} className="py-2 pl-4 text-right whitespace-nowrap" data-tax-col={col.id}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Taxable property profit", () => tax.taxable],
                    ["Tax at your band", (col) => col.taxAtBand],
                    ["Finance cost credit", (col) => -col.credit],
                    ["Estimated tax", (col) => col.tax],
                    ["After-tax profit", (col) => col.afterTaxProfit],
                    ["After-tax cash", (col) => col.afterTaxCash],
                  ] as [string, (col: TaxColumn) => number][]
                ).map(([label, f]) => (
                  <tr key={label} className={cn("border-t border-line", label === "Estimated tax" && "font-extrabold")}>
                    <th scope="row" className="py-1.5 text-left font-[inherit]">
                      {label}
                    </th>
                    {tax.columns.map((col) => (
                      <td key={col.id} className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">
                        {money(f(col))}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-line text-[12px] text-muted">
                  <th scope="row" className="py-1.5 text-left font-normal">
                    Rates used
                  </th>
                  {tax.columns.map((col) => (
                    <td key={col.id} className="py-1.5 pl-4 text-right whitespace-nowrap">
                      {Math.round(col.bandRate * 100)}% band, {Math.round(col.creditRate * 100)}% credit
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {tax.note2027 && <p className="m-0 text-sm font-bold text-amber">{tax.note2027}</p>}
          {tax.rentARoom && (
            <div className="rounded-[14px] bg-cloud-2 p-4 text-sm leading-[1.6]" data-rent-a-room>
              <p className="m-0 font-extrabold">Rent a Room relief</p>
              {tax.rentARoom.kind === "taxFree" ? (
                <p className="m-0">
                  Your receipts of {money(tax.rentARoom.receipts)} a year are within the {money(tax.rentARoom.threshold, 0)} threshold: <strong>likely tax-free under Rent a Room</strong>.
                </p>
              ) : (
                <p className="m-0">
                  Rent a Room: {money(tax.rentARoom.rentARoomTaxable)} taxable (receipts {money(tax.rentARoom.receipts)} less {money(tax.rentARoom.threshold, 0)}). Normal method: {money(tax.rentARoom.normalTaxable)} taxable.{" "}
                  <strong>{tax.rentARoom.better === "normal" ? "The normal method is likely better." : "Rent a Room is likely better."}</strong>
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      <Notes n={n} inp={inp} c={c} />
      <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm leading-[1.6] font-semibold text-ink-copy">{disclaimer}</p>
    </div>
  );
}

function Notes({ n, inp, c }: { n: Notices; inp: Inputs; c: Content }) {
  const items: { id: string; text: ReactNode }[] = [];
  if (n.vat === "over") items.push({ id: "vat", text: <>Your figures are over the VAT registration threshold ({money(c.vatThreshold, 0)}). You may need to register. <Link href="/uk-short-let-rules#vat" className="font-bold text-brand">VAT and short lets</Link></> });
  else if (n.vat === "close") items.push({ id: "vat", text: <>You’re getting close to the VAT threshold ({money(c.vatThreshold, 0)} in any rolling 12 months). <Link href="/uk-short-let-rules#vat" className="font-bold text-brand">VAT and short lets</Link></> });
  if (n.mtd) items.push({ id: "mtd", text: <>Making Tax Digital for Income Tax: likely to apply {n.mtd} at {money(n.mtdIncome, 0)} gross a year. Count all your property and self-employment income together. <Link href="/uk-short-let-rules#making-tax-digital" className="font-bold text-brand">Making Tax Digital</Link></> });
  if (inp.vatRegistered) items.push({ id: "vat-reg", text: <>VAT registered: your prices are treated as including VAT at {Math.round(c.vatRate * 100)}%, and the VAT is taken off before profit.</> });
  if (!items.length) return null;
  return (
    <ul className="m-0 grid list-none gap-2 p-0" data-notices>
      {items.map((i) => (
        <li key={i.id} className="rounded-[14px] border border-line bg-white px-4 py-3 text-sm leading-[1.6]" data-notice={i.id}>
          {i.text}
        </li>
      ))}
    </ul>
  );
}

/* Scenarios ------------------------------------------------------------------------------- */

export function ScenariosTab({ list, rows, max, compareMax, onSave, onRename, onDelete, onLoad, selected, onSelect }: { list: Scenario[]; rows: CompareRow[]; max: number; compareMax: number; onSave: (name: string) => void; onRename: (id: string, name: string) => void; onDelete: (id: string) => void; onLoad: (s: Scenario) => void; selected: string[]; onSelect: (ids: string[]) => void }) {
  const [name, setName] = useState("");
  const shown = list.filter((s) => selected.includes(s.id));
  return (
    <div className="grid gap-4">
      <Card>
        <H3>Save and compare</H3>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(name);
            setName("");
          }}
        >
          <div className="grid gap-1.5">
            <label htmlFor="sc-name" className="text-[15px] font-bold">
              Scenario name
            </label>
            <input id="sc-name" className="field min-h-11" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder={`Scenario ${list.length + 1}`} />
          </div>
          <button type="submit" className="btn btn-coral min-h-11" disabled={list.length >= max} data-save-scenario>
            Save scenario
          </button>
          <span className="text-[13px] text-muted">
            {list.length} of {max} saved on this device.
          </span>
        </form>
        {list.length > 0 && (
          <ul className="m-0 grid list-none gap-2 p-0" data-scenario-list>
            {list.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-[12px] bg-cloud-2 px-3 py-2" data-scenario={s.name}>
                <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    className="size-5"
                    checked={selected.includes(s.id)}
                    disabled={!selected.includes(s.id) && selected.length >= compareMax}
                    onChange={(e) => onSelect(e.target.checked ? [...selected, s.id] : selected.filter((x) => x !== s.id))}
                  />
                  <span className="sr-only-label">Compare </span>
                </label>
                <input aria-label={`Rename ${s.name}`} className="field min-h-11 min-w-0 flex-1" defaultValue={s.name} onBlur={(e) => onRename(s.id, e.target.value)} />
                <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => onLoad(s)}>
                  Load
                </button>
                <button type="button" className="min-h-11 px-2 text-sm font-bold text-brand underline" onClick={() => onDelete(s.id)} aria-label={`Delete ${s.name}`}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="m-0 text-[13px] text-muted">Tick up to {compareMax} to compare side by side.</p>
      </Card>
      {shown.length > 1 && (
        <Card>
          <H3>Side by side</H3>
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[480px] border-collapse text-sm" data-compare>
              <thead>
                <tr>
                  <th className="py-2 text-left text-[12px] text-muted uppercase" />
                  {shown.map((s) => (
                    <th key={s.id} className="py-2 pl-4 text-right whitespace-nowrap font-extrabold">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.group + row.label} className={cn("border-t border-line", row.differs && "bg-amber-25")} data-differs={row.differs ? "" : undefined}>
                    <th scope="row" className="py-1.5 text-left font-bold">
                      {row.label}
                      {row.differs && <span className="sr-only-label"> (differs)</span>}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="m-0 text-[13px] text-muted">Highlighted rows differ between scenarios.</p>
        </Card>
      )}
    </div>
  );
}
