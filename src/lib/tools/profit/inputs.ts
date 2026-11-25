import type { Content, ExampleFigures, Shape } from "./content";

/**
 * The host's figures, as typed: money in £, percentages 0–100, nights as
 * entered. The model converts percentages to decimals.
 */
export type ChannelId = "airbnb" | "booking" | "direct" | "other";
export type AirbnbModel = "host-only" | "split" | "custom";
export type Nation = "england" | "wales" | "ni" | "scotland";
export type Ownership = "me" | "joint" | "company";
export type MonthInput = { rate: number; occupancy: number; ownerNights: number; avgStay: number | null };

export type MonthlyBills = { mortgagePayment: number; mortgageInterest: number | null; rent: number; energy: number; broadband: number; councilTax: number; software: number; serviceCharge: number; other: number };
export type AnnualBills = { insurance: number; groundRent: number; licence: number; safety: number; tvLicence: number; accountant: number; other: number };

export type Inputs = {
  mode: "quick" | "detailed";
  rate: number;
  occupancy: number;
  avgStay: number;
  cleaningFee: number;
  /** Quick mode: owner-blocked nights a year. */
  ownerNights: number;
  /** Detailed mode. */
  year: number;
  months: MonthInput[];
  feeMode: "channels" | "simple";
  simpleFee: number;
  shares: Record<ChannelId, number>;
  airbnbModel: AirbnbModel;
  airbnbCustom: number;
  bookingFee: number;
  directFee: number;
  directFixed: number;
  otherFee: number;
  mgmt: { kind: "none" | "percent" | "fixed"; percent: number; basis: "room" | "roomCleaning"; fixed: number };
  turnover: number;
  consumables: number;
  running: number;
  /** `mortgageInterest: null` = the same as the payment (interest-only). */
  monthly: MonthlyBills;
  annual: AnnualBills;
  reserve: { kind: "percent" | "fixed"; percent: number; fixed: number };
  setupCosts: number;
  cashInvested: number;
  vatRegistered: boolean;
  tax: { on: boolean; nation: Nation; band: string; ownership: Ownership; roomInHome: boolean };
  /** Target solver: £ profit a month. */
  target: number;
};

export const CHANNELS: ChannelId[] = ["airbnb", "booking", "direct", "other"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MON = MONTHS.map((m) => m.slice(0, 3));

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;

/** Inputs from a set of example figures (the starting values or an example), keeping the tax and fee settings given. */
export function fromFigures(f: ExampleFigures, c: Content, base?: Inputs, year = new Date().getFullYear() + 1): Inputs {
  const shape = c.shapes.find((s) => s.id === f.shape) ?? c.shapes[0];
  const next: Inputs = {
    mode: base?.mode ?? "quick",
    rate: f.rate,
    occupancy: f.occupancy,
    avgStay: f.avgStay,
    cleaningFee: f.cleaningFee,
    ownerNights: f.ownerNights,
    year: base?.year ?? year,
    months: [],
    feeMode: "channels",
    simpleFee: round(c.fees.airbnbHostOnly * 100, 2),
    shares: { ...f.channels },
    airbnbModel: "host-only",
    airbnbCustom: round(c.fees.airbnbHostOnly * 100, 2),
    bookingFee: f.bookingFee,
    directFee: round(c.fees.directPercent * 100, 2),
    directFixed: c.fees.directFixed,
    otherFee: f.otherFee,
    mgmt: { kind: "none", percent: 0, basis: "room", fixed: 0 },
    turnover: f.turnover,
    consumables: f.consumables,
    running: f.running,
    monthly: { ...f.monthly, mortgageInterest: f.monthly.mortgagePayment ? f.monthly.mortgageInterest : null },
    annual: { ...f.annual },
    reserve: { kind: "percent", percent: 0, fixed: 0 },
    setupCosts: f.setupCosts,
    cashInvested: f.cashInvested,
    vatRegistered: false,
    tax: base?.tax ?? { on: false, nation: "england", band: "basic", ownership: "me", roomInHome: false },
    target: base?.target ?? c.model.defaultTarget,
  };
  // Months are filled from the Quick values when Detailed mode is opened; in Detailed mode, an example brings its shape.
  return base?.mode === "detailed" ? applyShape(next, shape) : next;
}

export const defaultInputs = (c: Content, year?: number): Inputs => fromFigures(c.defaults, c, undefined, year);

/** "Apply a shape": scale the Quick rate and occupancy for each month (owner nights spread evenly, stays left as Quick). */
export function applyShape(inp: Inputs, shape: Shape): Inputs {
  const owner = round(inp.ownerNights / 12, 1);
  return {
    ...inp,
    months: shape.rate.map((r, i) => ({ rate: round(inp.rate * r, 2), occupancy: Math.min(100, round(inp.occupancy * shape.occupancy[i], 1)), ownerNights: owner, avgStay: null })),
  };
}

/** "Copy January to all". */
export const copyJanuary = (inp: Inputs): Inputs => ({ ...inp, months: inp.months.map(() => ({ ...inp.months[0] })) });

/** Fill the 12 months from the Quick values when Detailed mode is first opened (nothing typed is lost). */
export function ensureMonths(inp: Inputs): Inputs {
  if (inp.months.length === 12) return inp;
  return applyShape(inp, { id: "flat", label: "Flat", rate: Array(12).fill(1) as Shape["rate"], occupancy: Array(12).fill(1) as Shape["occupancy"] });
}

export type Errors = Partial<Record<string, string>>;

const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** Plain-English messages, by field. The model still runs on cleaned values, so nothing shows NaN. */
export function validate(inp: Inputs): Errors {
  const e: Errors = {};
  const money = (k: string, v: number, label: string) => {
    if (!finite(v) || v < 0) e[k] = `Enter ${label} of £0 or more.`;
  };
  const percent = (k: string, v: number, label: string) => {
    if (!finite(v) || v < 0 || v > 100) e[k] = `Enter ${label} between 0% and 100%.`;
  };
  if (!finite(inp.rate) || inp.rate < 1) e.rate = "Enter a nightly rate of at least £1.";
  percent("occupancy", inp.occupancy, "an occupancy");
  if (!finite(inp.avgStay) || inp.avgStay < 1) e.avgStay = "Enter an average stay of at least 1 night.";
  money("cleaningFee", inp.cleaningFee, "a cleaning fee");
  if (!finite(inp.ownerNights) || inp.ownerNights < 0 || inp.ownerNights > 365) e.ownerNights = "Enter owner-blocked nights between 0 and 365.";
  if (inp.feeMode === "simple") percent("simpleFee", inp.simpleFee, "a platform fee");
  else {
    const total = CHANNELS.reduce((t, k) => t + (finite(inp.shares[k]) ? inp.shares[k] : 0), 0);
    if (Math.abs(total - 100) > 0.01) e.shares = `Your channel shares add up to ${round(total, 1)}%. They need to add up to 100%.`;
    for (const k of CHANNELS) percent(`share.${k}`, inp.shares[k], "a share");
    if (inp.airbnbModel === "custom") percent("airbnbCustom", inp.airbnbCustom, "an Airbnb fee");
    percent("bookingFee", inp.bookingFee, "a commission");
    percent("directFee", inp.directFee, "a card fee");
    money("directFixed", inp.directFixed, "a fixed fee");
    percent("otherFee", inp.otherFee, "a fee");
  }
  if (inp.mgmt.kind === "percent") percent("mgmt.percent", inp.mgmt.percent, "a management fee");
  if (inp.mgmt.kind === "fixed") money("mgmt.fixed", inp.mgmt.fixed, "a management fee");
  money("turnover", inp.turnover, "a turnover cost");
  money("consumables", inp.consumables, "a consumables cost");
  money("running", inp.running, "a running cost");
  for (const [k, v] of Object.entries(inp.monthly)) if (v !== null) money(`monthly.${k}`, v, "an amount");
  for (const [k, v] of Object.entries(inp.annual)) money(`annual.${k}`, v, "an amount");
  if (inp.monthly.mortgageInterest !== null && inp.monthly.mortgageInterest > inp.monthly.mortgagePayment) e["monthly.mortgageInterest"] = "The interest can’t be more than the whole mortgage payment.";
  if (inp.reserve.kind === "percent") percent("reserve.percent", inp.reserve.percent, "a reserve");
  else money("reserve.fixed", inp.reserve.fixed, "a reserve");
  money("setupCosts", inp.setupCosts, "set-up costs");
  money("cashInvested", inp.cashInvested, "cash invested");
  if (inp.mode === "detailed")
    inp.months.forEach((m, i) => {
      if (!finite(m.rate) || m.rate < 1) e[`month.${i}.rate`] = `${MONTHS[i]}: enter a rate of at least £1.`;
      if (!finite(m.occupancy) || m.occupancy < 0 || m.occupancy > 100) e[`month.${i}.occupancy`] = `${MONTHS[i]}: enter an occupancy between 0% and 100%.`;
      if (!finite(m.ownerNights) || m.ownerNights < 0 || m.ownerNights > 31) e[`month.${i}.ownerNights`] = `${MONTHS[i]}: enter owner nights between 0 and 31.`;
      if (m.avgStay !== null && (!finite(m.avgStay) || m.avgStay < 1)) e[`month.${i}.avgStay`] = `${MONTHS[i]}: enter a stay of at least 1 night, or leave it empty.`;
    });
  if (!finite(inp.target)) e.target = "Enter a target profit in £.";
  return e;
}

const num = (v: unknown, fallback: number, min = 0, max = Number.POSITIVE_INFINITY) => (finite(v) ? Math.min(max, Math.max(min, v)) : fallback);

/** Values the model can always work with (bad entries become safe ones; channel shares are scaled to 100%). */
export function clean(inp: Inputs): Inputs {
  const shares = Object.fromEntries(CHANNELS.map((k) => [k, num(inp.shares[k], 0, 0, 100)])) as Record<ChannelId, number>;
  const total = CHANNELS.reduce((t, k) => t + shares[k], 0);
  const scaled = total > 0 ? (Object.fromEntries(CHANNELS.map((k) => [k, (shares[k] / total) * 100])) as Record<ChannelId, number>) : { airbnb: 100, booking: 0, direct: 0, other: 0 };
  const payment = num(inp.monthly.mortgagePayment, 0);
  return {
    ...inp,
    rate: num(inp.rate, 1, 1),
    occupancy: num(inp.occupancy, 0, 0, 100),
    avgStay: num(inp.avgStay, 1, 1),
    cleaningFee: num(inp.cleaningFee, 0),
    ownerNights: num(inp.ownerNights, 0, 0, 365),
    months: inp.months.map((m) => ({ rate: num(m.rate, 1, 1), occupancy: num(m.occupancy, 0, 0, 100), ownerNights: num(m.ownerNights, 0, 0, 31), avgStay: m.avgStay === null ? null : num(m.avgStay, 1, 1) })),
    simpleFee: num(inp.simpleFee, 0, 0, 100),
    shares: scaled,
    airbnbCustom: num(inp.airbnbCustom, 0, 0, 100),
    bookingFee: num(inp.bookingFee, 0, 0, 100),
    directFee: num(inp.directFee, 0, 0, 100),
    directFixed: num(inp.directFixed, 0),
    otherFee: num(inp.otherFee, 0, 0, 100),
    mgmt: { ...inp.mgmt, percent: num(inp.mgmt.percent, 0, 0, 100), fixed: num(inp.mgmt.fixed, 0) },
    turnover: num(inp.turnover, 0),
    consumables: num(inp.consumables, 0),
    running: num(inp.running, 0),
    monthly: {
      mortgagePayment: payment,
      mortgageInterest: inp.monthly.mortgageInterest === null ? null : num(inp.monthly.mortgageInterest, 0, 0, payment),
      rent: num(inp.monthly.rent, 0),
      energy: num(inp.monthly.energy, 0),
      broadband: num(inp.monthly.broadband, 0),
      councilTax: num(inp.monthly.councilTax, 0),
      software: num(inp.monthly.software, 0),
      serviceCharge: num(inp.monthly.serviceCharge, 0),
      other: num(inp.monthly.other, 0),
    },
    annual: Object.fromEntries(Object.entries(inp.annual).map(([k, v]) => [k, num(v, 0)])) as AnnualBills,
    reserve: { ...inp.reserve, percent: num(inp.reserve.percent, 0, 0, 100), fixed: num(inp.reserve.fixed, 0) },
    setupCosts: num(inp.setupCosts, 0),
    cashInvested: num(inp.cashInvested, 0),
    target: num(inp.target, 0, Number.NEGATIVE_INFINITY),
  };
}

/** Inputs read back from the device, merged over the starting values (so older saves still work). Null if unusable. */
export function restoreInputs(raw: unknown, c: Content): Inputs | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<Inputs>;
  if (typeof o.rate !== "number") return null;
  const d = defaultInputs(c);
  const months = Array.isArray(o.months) && o.months.length === 12 && o.months.every((m) => m && typeof m.rate === "number") ? o.months : [];
  const next: Inputs = {
    ...d,
    ...o,
    shares: { ...d.shares, ...o.shares },
    mgmt: { ...d.mgmt, ...o.mgmt },
    monthly: { ...d.monthly, ...o.monthly },
    annual: { ...d.annual, ...o.annual },
    reserve: { ...d.reserve, ...o.reserve },
    tax: { ...d.tax, ...o.tax },
    months,
    mode: o.mode === "detailed" ? "detailed" : "quick",
  };
  return next.mode === "detailed" ? ensureMonths(next) : next;
}
