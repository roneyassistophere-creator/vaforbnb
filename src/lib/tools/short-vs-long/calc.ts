import type { Content } from "./content";

/**
 * Short-let vs long-let: a fair, like-for-like comparison from the host's
 * own figures. Plain functions, full precision; rounding is for display.
 */

export type Start = "short" | "long" | "deciding";
export type Agent = "none" | "find" | "collection" | "full";

export type Inputs = {
  start: Start;
  shortProfit: number;
  /** The short-let profit already has the "costs either way" taken off. */
  includesShared: boolean;
  /** Imported from the profit calculator: VAT registered. */
  vatRegistered: boolean;
  shortHours: number;
  rent: number;
  agent: Agent;
  findKind: "pounds" | "weeks";
  findPounds: number;
  findWeeks: number;
  agentPercent: number;
  agentExVat: boolean;
  tenancyMonths: number;
  voidWeeks: number;
  landlordInsurance: number;
  maintKind: "pounds" | "percent";
  maintPounds: number;
  maintPercent: number;
  otherMonthly: number;
  gasAnnual: number;
  eicr: number;
  epc: number;
  licenceCost: number;
  licenceYears: number;
  otherAnnual: number;
  arrearsPercent: number;
  landlordBills: number;
  shared: { interest: number; serviceCharge: number; groundRent: number; buildingsInsurance: number; other: number };
  switchToLong: number;
  switchToShort: number;
  resale: number;
  rentGrowth: number;
  shortGrowth: number;
  longHours: number;
  hourValue: number;
  taxNation: "uk" | "scotland";
  taxBand: string;
  taxRates: "current" | "from2027";
};

export function defaultInputs(c: Content): Inputs {
  const d = c.defaults;
  return {
    start: "deciding",
    shortProfit: 0,
    includesShared: true,
    vatRegistered: false,
    shortHours: 0,
    rent: 0,
    agent: "none",
    findKind: "pounds",
    findPounds: 0,
    findWeeks: 4,
    agentPercent: 10,
    agentExVat: false,
    tenancyMonths: d.tenancyMonths,
    voidWeeks: d.voidWeeks,
    landlordInsurance: 0,
    maintKind: "pounds",
    maintPounds: 0,
    maintPercent: 0,
    otherMonthly: 0,
    gasAnnual: 0,
    eicr: 0,
    epc: 0,
    licenceCost: 0,
    licenceYears: 5,
    otherAnnual: 0,
    arrearsPercent: 0,
    landlordBills: 0,
    shared: { interest: 0, serviceCharge: 0, groundRent: 0, buildingsInsurance: 0, other: 0 },
    switchToLong: 0,
    switchToShort: 0,
    resale: 0,
    rentGrowth: d.rentGrowthPercent,
    shortGrowth: d.shortGrowthPercent,
    longHours: d.longHours,
    hourValue: 0,
    taxNation: "uk",
    taxBand: "basic",
    taxRates: "current",
  };
}

export function exampleInputs(c: Content): Inputs {
  const e = c.example;
  return { ...defaultInputs(c), shortProfit: e.shortProfit, includesShared: e.includesShared, rent: e.rent, agent: e.agent, agentPercent: e.agentPercent, voidWeeks: e.voidWeeks, otherMonthly: e.landlordMonthly };
}

/* ---- Validation ----------------------------------------------------------------------- */

export type Errors = Partial<Record<string, string>>;
const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export function validate(inp: Inputs): Errors {
  const e: Errors = {};
  const money = (k: string, v: number) => {
    if (!finite(v) || v < 0) e[k] = "Enter £0 or more.";
  };
  const pctField = (k: string, v: number) => {
    if (!finite(v) || v < 0 || v > 100) e[k] = "Enter a percentage between 0 and 100.";
  };
  if (!finite(inp.shortProfit)) e.shortProfit = "Enter your short-let monthly profit.";
  if (!finite(inp.rent) || inp.rent < 0) e.rent = "Rent can’t be negative.";
  if (!finite(inp.voidWeeks) || inp.voidWeeks < 0 || inp.voidWeeks > 52) e.voidWeeks = "Void weeks must be between 0 and 52.";
  if (!finite(inp.tenancyMonths) || inp.tenancyMonths < 1) e.tenancyMonths = "Tenancy length must be at least 1 month.";
  if (inp.agent === "find") {
    if (inp.findKind === "pounds") money("findPounds", inp.findPounds);
    else if (!finite(inp.findWeeks) || inp.findWeeks < 0 || inp.findWeeks > 52) e.findWeeks = "Enter weeks of rent between 0 and 52.";
  }
  if (inp.agent === "collection" || inp.agent === "full") pctField("agentPercent", inp.agentPercent);
  if (inp.maintKind === "percent") pctField("maintPercent", inp.maintPercent);
  else money("maintPounds", inp.maintPounds);
  for (const k of ["landlordInsurance", "otherMonthly", "gasAnnual", "eicr", "epc", "licenceCost", "otherAnnual", "landlordBills", "switchToLong", "switchToShort", "resale", "hourValue"] as const) money(k, inp[k]);
  if (inp.licenceCost > 0 && (!finite(inp.licenceYears) || inp.licenceYears < 1)) e.licenceYears = "Enter at least 1 year.";
  pctField("arrearsPercent", inp.arrearsPercent);
  for (const [k, v] of Object.entries(inp.shared)) money(`shared.${k}`, v);
  if (!finite(inp.shortHours) || inp.shortHours < 0) e.shortHours = "Enter 0 or more hours.";
  if (!finite(inp.longHours) || inp.longHours < 0) e.longHours = "Enter 0 or more hours.";
  if (!finite(inp.rentGrowth) || inp.rentGrowth < -50 || inp.rentGrowth > 50) e.rentGrowth = "Enter a growth rate between −50% and 50%.";
  if (!finite(inp.shortGrowth) || inp.shortGrowth < -50 || inp.shortGrowth > 50) e.shortGrowth = "Enter a growth rate between −50% and 50%.";
  if (inp.arrearsPercent + (inp.maintKind === "percent" ? inp.maintPercent : 0) + (inp.agent === "collection" || inp.agent === "full" ? inp.agentPercent : 0) > 100) e.agentPercent = "Agent, maintenance and arrears percentages add up to more than 100%.";
  return e;
}

/* ---- Long and short nets ----------------------------------------------------------------- */

export const sharedTotal = (inp: Inputs) => inp.shared.interest + inp.shared.serviceCharge + inp.shared.groundRent + inp.shared.buildingsInsurance + inp.shared.other;

/** Rent-linked share of rent received, and the fixed monthly landlord costs. */
function parts(inp: Inputs, c: Content) {
  const vatF = inp.agentExVat ? 1 + c.vatRate : 1;
  const agentPct = inp.agent === "collection" || inp.agent === "full" ? (inp.agentPercent / 100) * vatF : 0;
  const maintPct = inp.maintKind === "percent" ? inp.maintPercent / 100 : 0;
  const arrearsPct = inp.arrearsPercent / 100;
  const periodic = { gas: inp.gasAnnual / 12, eicr: inp.eicr / c.eicrMonths, epc: inp.epc / c.epcMonths, licence: inp.licenceCost > 0 ? inp.licenceCost / (inp.licenceYears * 12) : 0, otherAnnual: inp.otherAnnual / 12 };
  const fixed = inp.landlordInsurance + (inp.maintKind === "pounds" ? inp.maintPounds : 0) + inp.otherMonthly + inp.landlordBills + Object.values(periodic).reduce((t, v) => t + v, 0);
  return { vatF, agentPct, maintPct, arrearsPct, periodic, fixed, occupied: (52 - inp.voidWeeks) / 52 };
}

export type LongNet = {
  rent: number;
  rentReceived: number;
  voidLoss: number;
  agentFee: number;
  tenantFindFee: number;
  tenantFind: number;
  maintenance: number;
  arrears: number;
  periodic: { gas: number; eicr: number; epc: number; licence: number; otherAnnual: number };
  landlordCosts: number;
  shared: number;
  net: number;
};

export function tenantFindFee(inp: Inputs, rent: number, c: Content) {
  if (inp.agent !== "find") return 0;
  const vatF = inp.agentExVat ? 1 + c.vatRate : 1;
  return (inp.findKind === "pounds" ? inp.findPounds : (inp.findWeeks * rent * 12) / 52) * vatF;
}

export function longNet(inp: Inputs, c: Content, rent = inp.rent): LongNet {
  const p = parts(inp, c);
  const rentReceived = rent * p.occupied;
  const agentFee = p.agentPct * rentReceived;
  const fee = tenantFindFee(inp, rent, c);
  const tenantFind = fee / inp.tenancyMonths;
  const maintenance = p.maintPct * rentReceived + (inp.maintKind === "pounds" ? inp.maintPounds : 0);
  const arrears = p.arrearsPct * rentReceived;
  const landlordCosts = p.fixed + p.maintPct * rentReceived + arrears;
  const shared = sharedTotal(inp);
  return { rent, rentReceived, voidLoss: rent - rentReceived, agentFee, tenantFindFee: fee, tenantFind, maintenance, arrears, periodic: p.periodic, landlordCosts, shared, net: rentReceived - agentFee - tenantFind - landlordCosts - shared };
}

export function shortNet(inp: Inputs, profit = inp.shortProfit) {
  const adjustment = inp.includesShared ? 0 : sharedTotal(inp);
  return { profit, adjustment, net: profit - adjustment };
}

export type Winner = "short" | "long" | "same";

/** The rent at which the long let matches the short let (rent-linked costs in the denominator). */
export function breakEvenRent(inp: Inputs, c: Content): { ok: true; value: number } | { ok: false; message: string } {
  const p = parts(inp, c);
  const S = shortNet(inp).net;
  const vatF = p.vatF;
  const findFixed = inp.agent === "find" && inp.findKind === "pounds" ? (inp.findPounds * vatF) / inp.tenancyMonths : 0;
  const findPerRent = inp.agent === "find" && inp.findKind === "weeks" ? (inp.findWeeks * 12 * vatF) / 52 / inp.tenancyMonths : 0;
  const denom = p.occupied * (1 - p.agentPct - p.maintPct - p.arrearsPct) - findPerRent;
  if (denom <= 0) return { ok: false, message: "No rent can match: fees and voids take it all" };
  return { ok: true, value: Math.max(0, (S + p.fixed + sharedTotal(inp) + findFixed) / denom) };
}

export function compare(inp: Inputs, c: Content) {
  const L = longNet(inp, c);
  const S = shortNet(inp);
  const D = S.net - L.net;
  return {
    long: L,
    short: S,
    diff: D,
    yearly: 12 * D,
    winner: (Math.abs(D) < c.model.aboutSamePounds ? "same" : D > 0 ? "short" : "long") as Winner,
    breakEvenRent: breakEvenRent(inp, c),
    minShortProfit: L.net + (inp.includesShared ? 0 : sharedTotal(inp)),
  };
}

/* ---- 5-year view ----------------------------------------------------------------------- */

export function fiveYear(inp: Inputs, c: Content) {
  const years = [1, 2, 3, 4, 5].map((y) => {
    const rent = inp.rent * (1 + inp.rentGrowth / 100) ** (y - 1);
    const profit = inp.shortProfit * (1 + inp.shortGrowth / 100) ** (y - 1);
    const L = longNet(inp, c, rent).net;
    const S = shortNet(inp, profit).net;
    return { year: y, short: S, long: L, diff: 12 * (S - L) };
  });
  const costLong = Math.max(0, inp.switchToLong - inp.resale);
  const costShort = inp.switchToShort;
  // A switching cost lowers the side you'd switch to.
  const offset = inp.start === "short" ? costLong : inp.start === "long" ? -costShort : costLong - costShort;
  const months: number[] = [offset];
  for (let m = 1; m <= 60; m++) months.push(months[m - 1] + years[Math.ceil(m / 12) - 1].diff / 12);
  let cumulative = offset;
  const rows = years.map((y) => ({ ...y, cumulative: (cumulative += y.diff) }));
  // Payback of the switching cost, from the first year's monthly gain from switching.
  const D1 = years[0].short - years[0].long;
  const toShort = inp.start === "long" || (inp.start === "deciding" && D1 > 0);
  const cost = toShort ? costShort : costLong;
  const gain = toShort ? D1 : -D1;
  const payback: { months: number | null; text: string } | null =
    cost <= 0 ? null : gain <= 0 ? { months: null, text: "Not paid back" } : cost / gain > 60 ? { months: cost / gain, text: "Over 5 years" } : { months: cost / gain, text: `${(cost / gain).toFixed(1)} months` };
  return { rows, months, cumulative: rows[4].cumulative, offset, payback, switchTo: cost > 0 ? (toShort ? "short" : "long") : null };
}

/* ---- Your time ---------------------------------------------------------------------- */

export function timeView(inp: Inputs, cmp: ReturnType<typeof compare>) {
  const sh = inp.shortHours;
  const lh = inp.longHours;
  return {
    shortPerHour: sh > 0 ? cmp.short.net / sh : null,
    longPerHour: lh > 0 ? cmp.long.net / lh : null,
    extraPerHour: sh > lh ? cmp.diff / (sh - lh) : null,
    timeAdjusted: inp.hourValue > 0 ? cmp.diff - (sh - lh) * inp.hourValue : null,
  };
}

/* ---- After tax (estimate) ----------------------------------------------------------------- */

export function bandsFor(inp: Inputs, c: Content) {
  return inp.taxNation === "scotland" ? c.scotland.bands.map((b) => ({ id: b.id, label: `${b.label} rate` })) : [{ id: "basic", label: "Basic rate" }, { id: "higher", label: "Higher rate" }, { id: "additional", label: "Additional rate" }];
}

export function afterTax(inp: Inputs, diff: number, c: Content) {
  let rate: number;
  let label: string;
  if (inp.taxNation === "scotland") {
    const b = c.scotland.bands.find((x) => x.id === inp.taxBand) ?? c.scotland.bands.find((x) => x.id === "basic") ?? c.scotland.bands[0];
    rate = b.rate;
    label = `Scottish ${b.label.toLowerCase()} rate, ${c.scotland.taxYear}`;
  } else {
    const id = (["basic", "higher", "additional"] as const).find((x) => x === inp.taxBand) ?? "basic";
    rate = (inp.taxRates === "from2027" ? c.tax.from2027 : c.tax.current)[id];
    label = `${id[0].toUpperCase()}${id.slice(1)} rate, ${inp.taxRates === "from2027" ? "from 6 April 2027" : "current rates"}`;
  }
  return { rate, label, monthly: diff * (1 - rate), yearly: 12 * diff * (1 - rate) };
}

/* ---- Shared device format ------------------------------------------------------------------ */

/** Prefill from the profit calculator ("profit-inputs"), only fields still at their starting values. */
export function importFromProfit(inp: Inputs, data: unknown, c: Content): { inputs: Inputs; fields: string[]; summary: string } | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { monthlyProfit?: unknown; sharedCosts?: Record<string, unknown>; vatRegistered?: unknown };
  if (typeof d.monthlyProfit !== "number" || !Number.isFinite(d.monthlyProfit)) return null;
  const base = defaultInputs(c);
  const next: Inputs = { ...inp, shared: { ...inp.shared } };
  const fields: string[] = [];
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
  if (inp.shortProfit === base.shortProfit) {
    next.shortProfit = d.monthlyProfit;
    next.includesShared = true;
    fields.push("short-let profit");
  }
  const sc = d.sharedCosts ?? {};
  const map: [keyof Inputs["shared"], string][] = [
    ["interest", "mortgageInterest"],
    ["serviceCharge", "serviceCharge"],
    ["groundRent", "groundRent"],
    ["buildingsInsurance", "insurance"],
  ];
  if ((Object.keys(base.shared) as (keyof Inputs["shared"])[]).every((k) => inp.shared[k] === base.shared[k])) {
    for (const [k, from] of map) next.shared[k] = num(sc[from]);
    fields.push("costs either way");
  }
  next.vatRegistered = d.vatRegistered === true;
  const money = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
  return { inputs: next, fields, summary: `Imported: profit ${money(next.shortProfit)}/month (includes mortgage interest ${money(next.shared.interest)}, service charge ${money(next.shared.serviceCharge)})` };
}
