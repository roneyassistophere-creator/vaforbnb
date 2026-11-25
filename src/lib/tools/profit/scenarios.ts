import { money, percent } from "@/lib/tools/format";
import { airbnbFee, calculate, feeSetup, type Result } from "./calc";
import type { Content } from "./content";
import { CHANNELS, type Inputs } from "./inputs";

/* ---- Saved scenarios (on the device only) ---------------------------------------------- */

export type Scenario = { id: string; name: string; inputs: Inputs; savedAt: string };

export function addScenario(list: Scenario[], name: string, inputs: Inputs, max: number, now = new Date()): { list: Scenario[]; full: boolean } {
  if (list.length >= max) return { list, full: true };
  const id = `s${now.getTime().toString(36)}${list.length}`;
  const label = name.trim().slice(0, 40) || `Scenario ${list.length + 1}`;
  return { list: [...list, { id, name: label, inputs: structuredClone(inputs), savedAt: now.toISOString() }], full: false };
}
export const renameScenario = (list: Scenario[], id: string, name: string) => list.map((s) => (s.id === id ? { ...s, name: name.trim().slice(0, 40) || s.name } : s));
export const removeScenario = (list: Scenario[], id: string) => list.filter((s) => s.id !== id);

/** Drop anything malformed read back from the device. */
export function cleanScenarios(raw: unknown, max: number): Scenario[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Scenario => !!s && typeof s === "object" && typeof (s as Scenario).id === "string" && typeof (s as Scenario).name === "string" && !!(s as Scenario).inputs && typeof (s as Scenario).inputs.rate === "number")
    .slice(0, max);
}

export type CompareRow = { group: "Result" | "Inputs"; label: string; values: string[]; differs: boolean };

/** Side by side: headline figures, KPIs, then the inputs that differ (highlighted). */
export function compareScenarios(list: Scenario[], c: Content): CompareRow[] {
  const rs = list.map((s) => ({ s, r: calculate(s.inputs, c) }));
  const row = (group: CompareRow["group"], label: string, f: (x: { s: Scenario; r: Result }) => string): CompareRow => {
    const values = rs.map(f);
    return { group, label, values, differs: new Set(values).size > 1 };
  };
  const reach = (x: Result["breakEven"], fmt: (v: number) => string) => (x.ok ? fmt(x.value) : "Not reachable");
  const results = [
    row("Result", "Profit a month", ({ r }) => money(r.monthly.profit, 0)),
    row("Result", "Profit a year", ({ r }) => money(r.annual.profit, 0)),
    row("Result", "Cash flow a month", ({ r }) => money(r.monthly.cash, 0)),
    row("Result", "Break-even occupancy", ({ r }) => reach(r.breakEven, (v) => percent(v))),
    row("Result", "Minimum nightly rate", ({ r }) => reach(r.minRate, (v) => money(v))),
    row("Result", "Profit margin", ({ r }) => (r.kpis.margin === null ? "—" : percent(r.kpis.margin))),
    row("Result", "ADR", ({ r }) => (r.kpis.adr === null ? "—" : money(r.kpis.adr))),
    row("Result", "RevPAR", ({ r }) => (r.kpis.revpar === null ? "—" : money(r.kpis.revpar))),
  ];
  const inputs = [
    row("Inputs", "Mode", ({ s }) => (s.inputs.mode === "detailed" ? "Detailed" : "Quick")),
    row("Inputs", "Nightly rate", ({ s }) => money(s.inputs.rate)),
    row("Inputs", "Occupancy", ({ s }) => `${s.inputs.occupancy}%`),
    row("Inputs", "Average stay", ({ s }) => `${s.inputs.avgStay} nights`),
    row("Inputs", "Cleaning fee charged", ({ s }) => money(s.inputs.cleaningFee)),
    row("Inputs", "Average platform fee", ({ s }) => percent(feeSetup(s.inputs, c).f)),
    row("Inputs", "Turnover cost", ({ s }) => money(s.inputs.turnover)),
    row("Inputs", "Bills a month", ({ r }) => money(r.fixed.total)),
    row("Inputs", "Mortgage capital a month", ({ r }) => money(r.fixed.capital)),
  ].filter((x) => x.differs);
  return [...results, ...inputs];
}

/* ---- Hand-off to the other money tools (shared device format, kind "profit-inputs") -------- */

export type ProfitHandoff = {
  nightlyRate: number;
  occupancyPercent: number;
  averageStay: number;
  cleaningFee: number;
  turnoverCost: number;
  /** Weighted platform fee (%), and each channel's share and fee (%). */
  platformFeePercent: number;
  channels: { id: string; sharePercent: number; feePercent: number }[];
  directFixedFee: number;
  bookingValueMonthly: number;
  staysMonthly: number;
  monthlyProfit: number;
  monthlyCashFlow: number;
  annualFixedCosts: number;
  region: Inputs["tax"]["nation"];
  london: boolean;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function profitHandoffData(inp: Inputs, r: Result, c: Content, london: boolean): ProfitHandoff {
  const fees = feeSetup(inp, c);
  const feeOf = { airbnb: airbnbFee(inp, c) * 100, booking: inp.bookingFee, direct: inp.directFee, other: inp.otherFee };
  return {
    nightlyRate: r2(r.kpis.adr ?? inp.rate),
    occupancyPercent: r2(r.occupancy * 100),
    averageStay: r2(r.annual.stays > 0 ? r.annual.nights / r.annual.stays : inp.avgStay),
    cleaningFee: inp.cleaningFee,
    turnoverCost: inp.turnover,
    platformFeePercent: r2(fees.f * 100),
    channels: inp.feeMode === "simple" ? [{ id: "average", sharePercent: 100, feePercent: inp.simpleFee }] : CHANNELS.filter((k) => inp.shares[k] > 0).map((k) => ({ id: k, sharePercent: inp.shares[k], feePercent: r2(feeOf[k]) })),
    directFixedFee: fees.directFixed,
    bookingValueMonthly: r2(r.monthly.booking),
    staysMonthly: r2(r.monthly.stays),
    monthlyProfit: r2(r.monthly.profit),
    monthlyCashFlow: r2(r.monthly.cash),
    annualFixedCosts: r2(r.fixed.total * 12),
    region: inp.tax.nation,
    london,
  };
}
