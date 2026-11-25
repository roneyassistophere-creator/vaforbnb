import { daysInMonth } from "@/lib/tools/dates";
import type { Content } from "./content";
import { CHANNELS, clean, type ChannelId, type Inputs } from "./inputs";

/**
 * The profit model. Plain functions returning plain data, calculated at full
 * precision (rounding is for display only). Shared by the Short-let vs
 * long-let, Direct booking savings and Booking performance tools.
 */

/* ---- Fees and fixed costs --------------------------------------------------------- */

export type FeeSetup = {
  /** Weighted platform fee on the guest booking value (decimal). */
  f: number;
  /** Direct share (decimal), for the fixed fee per booking. */
  d: number;
  directFixed: number;
  channels: { id: ChannelId; share: number; fee: number }[];
};

export function airbnbFee(inp: Inputs, c: Content): number {
  return inp.airbnbModel === "host-only" ? c.fees.airbnbHostOnly : inp.airbnbModel === "split" ? c.fees.airbnbSplit : inp.airbnbCustom / 100;
}

export function feeSetup(raw: Inputs, c: Content): FeeSetup {
  const inp = clean(raw);
  if (inp.feeMode === "simple") return { f: inp.simpleFee / 100, d: 0, directFixed: 0, channels: [] };
  const fee: Record<ChannelId, number> = { airbnb: airbnbFee(inp, c), booking: inp.bookingFee / 100, direct: inp.directFee / 100, other: inp.otherFee / 100 };
  const channels = CHANNELS.map((id) => ({ id, share: inp.shares[id] / 100, fee: fee[id] }));
  return { f: channels.reduce((t, ch) => t + ch.share * ch.fee, 0), d: inp.shares.direct / 100, directFixed: inp.directFixed, channels };
}

export const BILL_LABELS = {
  mortgageInterest: "Mortgage interest",
  rent: "Rent",
  energy: "Energy (standing charges and base use)",
  broadband: "Broadband and TV",
  councilTax: "Council tax or business rates",
  software: "Software",
  serviceCharge: "Service charge",
  other: "Other monthly",
  insurance: "Insurance",
  groundRent: "Ground rent",
  licence: "Licence or registration",
  safety: "Safety certificates",
  tvLicence: "TV licence",
  accountant: "Accountant",
  otherAnnual: "Other annual",
} as const;

export type Fixed = {
  /** Each bill as £ a month (annual bills ÷ 12). */
  lines: { id: keyof typeof BILL_LABELS; label: string; monthly: number }[];
  bills: number;
  reserveFixed: number;
  mgmtFixed: number;
  /** F_total: bills + fixed reserve + fixed management (£ a month). */
  total: number;
  payment: number;
  interest: number;
  capital: number;
};

export function fixedCosts(raw: Inputs): Fixed {
  const inp = clean(raw);
  const m = inp.monthly;
  const interest = m.mortgageInterest === null ? m.mortgagePayment : m.mortgageInterest;
  const a = inp.annual;
  const lines: Fixed["lines"] = (
    [
      ["mortgageInterest", interest],
      ["rent", m.rent],
      ["energy", m.energy],
      ["broadband", m.broadband],
      ["councilTax", m.councilTax],
      ["software", m.software],
      ["serviceCharge", m.serviceCharge],
      ["other", m.other],
      ["insurance", a.insurance / 12],
      ["groundRent", a.groundRent / 12],
      ["licence", a.licence / 12],
      ["safety", a.safety / 12],
      ["tvLicence", a.tvLicence / 12],
      ["accountant", a.accountant / 12],
      ["otherAnnual", a.other / 12],
    ] as [keyof typeof BILL_LABELS, number][]
  ).map(([id, monthly]) => ({ id, label: BILL_LABELS[id], monthly }));
  const bills = lines.reduce((t, l) => t + l.monthly, 0);
  const reserveFixed = inp.reserve.kind === "fixed" ? inp.reserve.fixed : 0;
  const mgmtFixed = inp.mgmt.kind === "fixed" ? inp.mgmt.fixed : 0;
  return { lines, bills, reserveFixed, mgmtFixed, total: bills + reserveFixed + mgmtFixed, payment: m.mortgagePayment, interest, capital: Math.max(0, m.mortgagePayment - interest) };
}

/* ---- One month -------------------------------------------------------------------- */

export type Period = { days: number; ownerNights: number; rate: number; occupancy: number; avgStay: number };

/** The money for one period. Occupancy is a decimal here. */
export type Money = {
  available: number;
  nights: number;
  stays: number;
  roomRevenue: number;
  cleaningIncome: number;
  booking: number;
  vat: number;
  platformFees: number;
  management: number;
  turnovers: number;
  consumables: number;
  running: number;
  variable: number;
  reserve: number;
  bills: number;
  profit: number;
  capital: number;
  cash: number;
};

export type MonthResult = Money & { rate: number; occupancy: number; avgStay: number; days: number; /** Contribution per booked night (£). */ contribution: number };

type Factors = { k: number; f: number; d: number; fixedFee: number; mR: number; mC: number; rp: number };

function factors(inp: Inputs, c: Content): Factors {
  const fees = feeSetup(inp, c);
  const pct = inp.mgmt.kind === "percent" ? inp.mgmt.percent / 100 : 0;
  return {
    k: inp.vatRegistered ? 1 / (1 + c.vatRate) : 1,
    f: fees.f,
    d: fees.d,
    fixedFee: fees.directFixed,
    mR: pct,
    mC: inp.mgmt.basis === "roomCleaning" ? pct : 0,
    rp: inp.reserve.kind === "percent" ? inp.reserve.percent / 100 : 0,
  };
}

/** Contribution per booked night: what each booked night adds towards the fixed costs. */
function contribution(p: Pick<Period, "rate" | "avgStay">, inp: Inputs, x: Factors): number {
  return p.rate * (x.k - x.f - x.mR - x.rp) + (inp.cleaningFee / p.avgStay) * (x.k - x.f - x.mC - x.rp) - (inp.turnover + inp.consumables) / p.avgStay - inp.running - (x.d * x.fixedFee) / p.avgStay;
}

export function calcMonth(raw: Inputs, period: Period, c: Content): MonthResult {
  const inp = clean(raw);
  const x = factors(inp, c);
  const fx = fixedCosts(inp);
  const available = Math.max(0, period.days - period.ownerNights);
  const occ = period.occupancy / 100;
  const nights = available * occ;
  const stays = nights / period.avgStay;
  const roomRevenue = nights * period.rate;
  const cleaningIncome = stays * inp.cleaningFee;
  const booking = roomRevenue + cleaningIncome;
  const vat = booking - booking * x.k;
  const platformFees = booking * x.f + x.d * stays * x.fixedFee;
  const management = x.mR * (inp.mgmt.basis === "roomCleaning" ? booking : roomRevenue) + fx.mgmtFixed;
  const turnovers = stays * inp.turnover;
  const consumables = stays * inp.consumables;
  const running = nights * inp.running;
  const variable = turnovers + consumables + running;
  const reserve = x.rp * booking + fx.reserveFixed;
  const bills = fx.bills;
  const profit = booking - vat - platformFees - management - variable - reserve - bills;
  return {
    days: period.days,
    rate: period.rate,
    occupancy: occ,
    avgStay: period.avgStay,
    available,
    nights,
    stays,
    roomRevenue,
    cleaningIncome,
    booking,
    vat,
    platformFees,
    management,
    turnovers,
    consumables,
    running,
    variable,
    reserve,
    bills,
    profit,
    capital: fx.capital,
    cash: profit - fx.capital,
    contribution: contribution(period, inp, x),
  };
}

/* ---- Reach (break-even, minimum rate, targets) ----------------------------------- */

export type Unreachable = "loses" | "over100" | "noOccupancy" | "feesTakeAll";
export type Reach = { ok: true; value: number } | { ok: false; reason: Unreachable; message: string };

export const REACH_MESSAGES: Record<Unreachable, string> = {
  loses: "Not reachable: each booked night loses money",
  over100: "Not reachable: even a full calendar can’t cover your costs",
  noOccupancy: "Add an occupancy above 0%",
  feesTakeAll: "Not reachable: fees and management take the whole price",
};
const no = (reason: Unreachable): Reach => ({ ok: false, reason, message: REACH_MESSAGES[reason] });

/**
 * Occupancy needed for `extra` £ profit a month (0 = break-even), the same in
 * every month: 12 × (F_total + extra) ÷ Σ(A × c) over the year.
 */
function occupancyFor(months: MonthResult[], weight: number, fixedTotal: number, extra: number): Reach {
  const sum = months.reduce((t, m) => t + m.available * m.contribution, 0) * weight;
  const need = 12 * (fixedTotal + extra);
  if (need <= 0) return { ok: true, value: 0 };
  if (sum <= 0) return no("loses");
  const occ = need / sum;
  return occ > 1 ? no("over100") : { ok: true, value: occ };
}

/** Average nightly rate needed (at the entered occupancy) for `extra` £ profit a month. */
function rateFor(months: MonthResult[], weight: number, inp: Inputs, x: Factors, fixedTotal: number, extra: number): Reach {
  const nights = months.reduce((t, m) => t + m.nights, 0) * weight;
  if (nights <= 0) return no("noOccupancy");
  const denom = x.k - x.f - x.mR - x.rp;
  if (denom <= 0) return no("feesTakeAll");
  const perStay = inp.turnover + inp.consumables + x.d * x.fixedFee - inp.cleaningFee * (x.k - x.f - x.mC - x.rp);
  const costs = months.reduce((t, m) => t + m.stays * perStay + m.nights * inp.running, 0) * weight;
  return { ok: true, value: Math.max(0, (12 * (fixedTotal + extra) + costs) / (denom * nights)) };
}

/* ---- The whole result -------------------------------------------------------------- */

export type Status = "loss" | "thin" | "healthy";

export type Kpis = {
  nights: number;
  stays: number;
  adr: number | null;
  revpar: number | null;
  margin: number | null;
  profitPerNight: number | null;
  costPerNight: number | null;
  /** Months to pay back set-up costs; null = no set-up costs entered. */
  paybackMonths: number | null;
  paybackReached: boolean;
  cashReturn: number | null;
};

export type Result = {
  mode: "quick" | "detailed";
  /** Quick: one month. Detailed: the 12 months of the chosen year. */
  months: MonthResult[];
  /** Quick: the month. Detailed: the yearly total ÷ 12. */
  monthly: Money;
  annual: Money;
  fixed: Fixed;
  fees: FeeSetup;
  /** Average occupancy across the year (decimal). */
  occupancy: number;
  breakEven: Reach;
  /** Occupancy points above break-even (decimal: 0.018 = 1.8 points); null if not reachable. */
  margin: number | null;
  minRate: Reach;
  target: { amount: number; rate: Reach; occupancy: Reach };
  status: Status;
  kpis: Kpis;
  lossMonths: number[];
  bestMonth: number | null;
};

const MONEY_KEYS: (keyof Money)[] = ["available", "nights", "stays", "roomRevenue", "cleaningIncome", "booking", "vat", "platformFees", "management", "turnovers", "consumables", "running", "variable", "reserve", "bills", "profit", "capital", "cash"];
const scale = (m: Money, by: number): Money => Object.fromEntries(MONEY_KEYS.map((k) => [k, m[k] * by])) as Money;
const sum = (ms: Money[]): Money => Object.fromEntries(MONEY_KEYS.map((k) => [k, ms.reduce((t, m) => t + m[k], 0)])) as Money;

function finish(inp: Inputs, c: Content, months: MonthResult[], weight: number, annual: Money): Result {
  const x = factors(inp, c);
  const fixed = fixedCosts(inp);
  const monthly = scale(annual, 1 / 12);
  const occupancy = annual.available > 0 ? annual.nights / annual.available : 0;
  const breakEven = occupancyFor(months, weight, fixed.total, 0);
  const margin = breakEven.ok ? occupancy - breakEven.value : null;
  const status: Status = annual.profit < 0 ? "loss" : margin !== null && margin < c.model.thinMarginPoints / 100 ? "thin" : "healthy";
  const n = annual.nights;
  const net = annual.booking - annual.vat;
  const cashMonth = annual.cash / 12;
  const lossMonths = weight === 1 ? months.flatMap((m, i) => (m.profit < 0 ? [i] : [])) : [];
  const best = weight === 1 ? months.reduce((b, m, i) => (b === -1 || m.profit > months[b].profit ? i : b), -1) : -1;
  return {
    mode: inp.mode,
    months,
    monthly,
    annual,
    fixed,
    fees: feeSetup(inp, c),
    occupancy,
    breakEven,
    margin,
    minRate: rateFor(months, weight, inp, x, fixed.total, 0),
    target: { amount: inp.target, rate: rateFor(months, weight, inp, x, fixed.total, inp.target), occupancy: occupancyFor(months, weight, fixed.total, inp.target) },
    status,
    kpis: {
      nights: n,
      stays: annual.stays,
      adr: n > 0 ? annual.roomRevenue / n : null,
      revpar: annual.available > 0 ? annual.roomRevenue / annual.available : null,
      margin: net > 0 ? annual.profit / net : null,
      profitPerNight: n > 0 ? annual.profit / n : null,
      costPerNight: n > 0 ? (net - annual.profit) / n : null,
      paybackMonths: inp.setupCosts > 0 ? (cashMonth > 0 ? inp.setupCosts / cashMonth : null) : null,
      paybackReached: inp.setupCosts > 0 && cashMonth > 0,
      cashReturn: inp.cashInvested > 0 ? annual.cash / inp.cashInvested : null,
    },
    lossMonths,
    bestMonth: best >= 0 ? best : null,
  };
}

/** Quick mode: one average month (daysPerMonth, owner nights ÷ 12), × 12 for the year. */
export function calcQuick(raw: Inputs, c: Content): Result {
  const inp = clean(raw);
  const month = calcMonth(inp, { days: c.model.daysPerMonth, ownerNights: inp.ownerNights / 12, rate: inp.rate, occupancy: inp.occupancy, avgStay: inp.avgStay }, c);
  return finish({ ...inp, mode: "quick" }, c, [month], 12, scale(month, 12));
}

/** Detailed mode: each month of the chosen year with its own days, rate, occupancy and stay length. */
export function calcDetailed(raw: Inputs, c: Content): Result {
  const inp = clean(raw);
  const months = inp.months.slice(0, 12).map((m, i) => calcMonth(inp, { days: daysInMonth(inp.year, i + 1), ownerNights: m.ownerNights, rate: m.rate, occupancy: m.occupancy, avgStay: m.avgStay ?? inp.avgStay }, c));
  return finish({ ...inp, mode: "detailed" }, c, months, 1, sum(months));
}

export const calculate = (inp: Inputs, c: Content): Result => (inp.mode === "detailed" && inp.months.length === 12 ? calcDetailed(inp, c) : calcQuick(inp, c));

/** Shortcuts named in the brief. */
export const breakEven = (inp: Inputs, c: Content) => calculate(inp, c).breakEven;
export const minRate = (inp: Inputs, c: Content) => calculate(inp, c).minRate;
export function targetSolve(inp: Inputs, c: Content, target: number) {
  return calculate({ ...inp, target }, c).target;
}

/** "13 years 5 months" (months rounded to the nearest whole month). */
export function paybackText(months: number | null, reached: boolean): string {
  if (!reached || months === null) return "Not reached at current cash flow";
  let y = Math.floor(months / 12);
  let m = Math.round(months - y * 12);
  if (m === 12) {
    y += 1;
    m = 0;
  }
  const part = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  return [y ? part(y, "year") : "", m || !y ? part(m, "month") : ""].filter(Boolean).join(" ");
}

/* ---- What moves the needle ----------------------------------------------------------- */

export type LeverId = "rate" | "occupancy" | "stay" | "turnover" | "fee" | "direct";
export type Lever = { id: LeverId; size: number; gain: number };

const mapMonths = (inp: Inputs, fn: (m: Inputs["months"][number]) => Inputs["months"][number]) => ({ ...inp, months: inp.months.map(fn) });

/** Annual profit change from each lever, applied one at a time, sorted biggest first. */
export function sensitivity(raw: Inputs, c: Content): Lever[] {
  const inp = clean(raw);
  const L = c.model.levers;
  const base = calculate(inp, c).annual.profit;
  const gain = (next: Inputs) => calculate(next, c).annual.profit - base;
  const out: Lever[] = [
    { id: "rate", size: L.ratePercent, gain: gain(mapMonths({ ...inp, rate: inp.rate * (1 + L.ratePercent / 100) }, (m) => ({ ...m, rate: m.rate * (1 + L.ratePercent / 100) }))) },
    { id: "occupancy", size: L.occupancyPoints, gain: gain(mapMonths({ ...inp, occupancy: Math.min(100, inp.occupancy + L.occupancyPoints) }, (m) => ({ ...m, occupancy: Math.min(100, m.occupancy + L.occupancyPoints) }))) },
    { id: "stay", size: L.stayNights, gain: gain(mapMonths({ ...inp, avgStay: inp.avgStay + L.stayNights }, (m) => ({ ...m, avgStay: m.avgStay === null ? null : m.avgStay + L.stayNights }))) },
    { id: "turnover", size: L.turnoverPounds, gain: gain({ ...inp, turnover: Math.max(0, inp.turnover - L.turnoverPounds) }) },
  ];
  const less = (v: number) => Math.max(0, v - L.feePoints);
  if (inp.feeMode === "simple") out.push({ id: "fee", size: L.feePoints, gain: gain({ ...inp, simpleFee: less(inp.simpleFee) }) });
  else {
    out.push({ id: "fee", size: L.feePoints, gain: gain({ ...inp, airbnbModel: "custom", airbnbCustom: less(airbnbFee(inp, c) * 100), bookingFee: less(inp.bookingFee), directFee: less(inp.directFee), otherFee: less(inp.otherFee) }) });
    const fee: Record<ChannelId, number> = { airbnb: airbnbFee(inp, c), booking: inp.bookingFee / 100, direct: inp.directFee / 100, other: inp.otherFee / 100 };
    const from = (["airbnb", "booking", "other"] as ChannelId[]).filter((id) => inp.shares[id] > 0).sort((a, b) => fee[b] - fee[a])[0];
    if (from) {
      const move = Math.min(L.directPoints, inp.shares[from]);
      out.push({ id: "direct", size: L.directPoints, gain: gain({ ...inp, shares: { ...inp.shares, [from]: inp.shares[from] - move, direct: inp.shares.direct + move } }) });
    }
  }
  return out.sort((a, b) => b.gain - a.gain);
}

/* ---- Money flow (waterfall) and cost table ------------------------------------------- */

export type FlowStep = { id: string; label: string; amount: number; kind: "start" | "minus" | "total" };

/** Guest payments → … → Profit → − Mortgage capital → Cash flow. Zero steps are left out (totals always shown). */
export function moneyFlow(m: Money): FlowStep[] {
  const steps: FlowStep[] = [
    { id: "booking", label: "Guest payments", amount: m.booking, kind: "start" },
    { id: "vat", label: "VAT", amount: -m.vat, kind: "minus" },
    { id: "fees", label: "Platform fees", amount: -m.platformFees, kind: "minus" },
    { id: "management", label: "Management", amount: -m.management, kind: "minus" },
    { id: "turnovers", label: "Turnovers and consumables", amount: -(m.turnovers + m.consumables), kind: "minus" },
    { id: "running", label: "Running costs", amount: -m.running, kind: "minus" },
    { id: "bills", label: "Bills", amount: -m.bills, kind: "minus" },
    { id: "reserve", label: "Reserve", amount: -m.reserve, kind: "minus" },
    { id: "profit", label: "Profit", amount: m.profit, kind: "total" },
    { id: "capital", label: "Mortgage capital", amount: -m.capital, kind: "minus" },
    { id: "cash", label: "Cash flow", amount: m.cash, kind: "total" },
  ];
  return steps.filter((s) => s.kind !== "minus" || Math.abs(s.amount) > 0.004);
}

export type CostLine = { group: "Fees" | "Turnovers" | "Variable" | "Bills" | "Reserve"; label: string; monthly: number };

/** The cost breakdown (monthly £); the screen adds £/year and % of booking value. */
export function costLines(r: Result): CostLine[] {
  const m = r.monthly;
  const lines: CostLine[] = [
    { group: "Fees", label: "VAT", monthly: m.vat },
    { group: "Fees", label: "Platform fees", monthly: m.platformFees },
    { group: "Fees", label: "Management", monthly: m.management },
    { group: "Turnovers", label: "Cleaning and laundry", monthly: m.turnovers },
    { group: "Turnovers", label: "Consumables", monthly: m.consumables },
    { group: "Variable", label: "Running costs (occupied nights)", monthly: m.running },
    ...r.fixed.lines.map((l) => ({ group: "Bills" as const, label: l.label, monthly: l.monthly })),
    { group: "Reserve", label: "Maintenance reserve", monthly: m.reserve },
  ];
  return lines.filter((l) => l.monthly > 0.004);
}
