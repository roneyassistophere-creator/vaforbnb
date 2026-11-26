import type { Content } from "./content";

/**
 * Direct booking savings: plain functions returning plain data, at full
 * precision (rounding is for display only).
 */

export type PlatformId = "airbnb" | "booking" | "vrbo" | "other";
export type ChannelId = PlatformId | "direct";
export const PLATFORMS: PlatformId[] = ["airbnb", "booking", "vrbo", "other"];
export const CHANNEL_LABEL: Record<ChannelId, string> = { airbnb: "Airbnb", booking: "Booking.com", vrbo: "Vrbo", other: "Other", direct: "Direct" };

/** The host's figures as typed: £, percentages 0–100. */
export type Inputs = {
  rate: number;
  nights: number;
  cleaningFee: number;
  /** Platforms to compare (Direct is always shown). */
  channels: PlatformId[];
  airbnbModel: "host-only" | "split" | "custom";
  airbnbCustom: number;
  guestFee: number;
  bookingFee: number;
  bookingPaymentsFee: number;
  vrboFee: number;
  otherFee: number;
  vatOnFee: boolean;
  cardPercent: number;
  cardFixed: number;
  damage: number;
  systemKind: "fixed" | "percent";
  systemFee: number;
  discount: number;
  /* Your year */
  bookings: number;
  occupancy: number;
  avgStay: number;
  /** null = Section A's booking value. */
  avgValue: number | null;
  shares: Record<ChannelId, number>;
  target: number;
  fromHighest: boolean;
  alreadyDirect: boolean;
  running: { system: number; hosting: number; marketing: number; other: number };
  websiteBuild: number;
};

export function defaultInputs(c: Content): Inputs {
  const d = c.defaults;
  return {
    rate: d.rate,
    nights: d.nights,
    cleaningFee: d.cleaningFee,
    channels: d.channels.filter((x): x is PlatformId => (PLATFORMS as string[]).includes(x)),
    airbnbModel: "host-only",
    airbnbCustom: round2(c.fees.airbnbHostOnly * 100),
    guestFee: round2(c.fees.airbnbSplitGuest * 100),
    bookingFee: d.bookingFee,
    bookingPaymentsFee: d.bookingPaymentsFee,
    vrboFee: d.vrboFee,
    otherFee: d.otherFee,
    vatOnFee: c.vatOnFeeDefault,
    cardPercent: round2(c.fees.cardPercent * 100),
    cardFixed: c.fees.cardFixed,
    damage: d.damage,
    systemKind: d.systemKind,
    systemFee: d.systemFee,
    discount: d.discount,
    bookings: d.bookings,
    occupancy: d.occupancy,
    avgStay: d.avgStay,
    avgValue: null,
    shares: { ...d.shares },
    target: d.target,
    fromHighest: d.fromHighest,
    alreadyDirect: d.alreadyDirect,
    running: { ...d.running },
    websiteBuild: d.websiteBuild,
  };
}

/** "Try an example": tests 1 and 4. */
export function exampleInputs(c: Content): Inputs {
  const e = c.example;
  return { ...defaultInputs(c), rate: e.rate, nights: e.nights, cleaningFee: e.cleaningFee, channels: e.channels as PlatformId[], bookings: e.bookings, shares: { ...e.shares }, target: e.target, alreadyDirect: e.alreadyDirect, running: { ...e.running }, websiteBuild: e.websiteBuild };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/* ---- Validation (inline errors; no result while Section A or B has one) -------------- */

export type Errors = Partial<Record<string, string>>;

export function validateBooking(inp: Inputs): Errors {
  const e: Errors = {};
  const pct = (k: string, v: number, label: string) => {
    if (!finite(v) || v < 0 || v > 100) e[k] = `Enter ${label} between 0% and 100%.`;
  };
  const money = (k: string, v: number, label: string) => {
    if (!finite(v) || v < 0) e[k] = `Enter ${label} of £0 or more.`;
  };
  if (!finite(inp.rate) || inp.rate <= 0) e.rate = "Enter a nightly rate above £0.";
  if (!finite(inp.nights) || inp.nights < 1) e.nights = "Enter at least 1 night.";
  money("cleaningFee", inp.cleaningFee, "a cleaning fee");
  if (inp.channels.includes("airbnb")) {
    if (inp.airbnbModel === "custom") pct("airbnbCustom", inp.airbnbCustom, "an Airbnb fee");
    if (inp.airbnbModel === "split") pct("guestFee", inp.guestFee, "a guest service fee");
  }
  if (inp.channels.includes("booking")) {
    pct("bookingFee", inp.bookingFee, "a commission");
    pct("bookingPaymentsFee", inp.bookingPaymentsFee, "a payments fee");
  }
  if (inp.channels.includes("vrbo")) pct("vrboFee", inp.vrboFee, "a fee");
  if (inp.channels.includes("other")) pct("otherFee", inp.otherFee, "a fee");
  pct("cardPercent", inp.cardPercent, "a card fee");
  money("cardFixed", inp.cardFixed, "a fixed fee");
  money("damage", inp.damage, "a damage protection cost");
  if (inp.systemKind === "percent") pct("systemFee", inp.systemFee, "a booking system fee");
  else money("systemFee", inp.systemFee, "a booking system fee");
  if (!finite(inp.discount) || inp.discount < 0 || inp.discount >= 100) e.discount = "Enter a discount from 0% to 99%.";
  return e;
}

export function validateYear(inp: Inputs): Errors {
  const e: Errors = {};
  if (!finite(inp.bookings) || inp.bookings <= 0) e.bookings = "Enter how many bookings you get a year.";
  if (inp.avgValue !== null && (!finite(inp.avgValue) || inp.avgValue <= 0)) e.avgValue = "Enter an average booking value above £0.";
  const ids: ChannelId[] = [...inp.channels, "direct"];
  for (const id of ids) if (!finite(inp.shares[id]) || inp.shares[id] < 0 || inp.shares[id] > 100) e[`share.${id}`] = "Enter a share between 0% and 100%.";
  const total = ids.reduce((t, id) => t + (finite(inp.shares[id]) ? inp.shares[id] : 0), 0);
  if (Math.abs(total - 100) > 0.01) e.shares = `Your channel shares add up to ${round2(total)}%. They need to add up to 100%.`;
  if (!finite(inp.target) || inp.target < 0 || inp.target > 100) e.target = "Enter a target between 0% and 100%.";
  for (const [k, v] of Object.entries(inp.running)) if (!finite(v) || v < 0) e[`running.${k}`] = "Enter £0 or more.";
  if (!finite(inp.websiteBuild) || inp.websiteBuild < 0) e.websiteBuild = "Enter £0 or more.";
  return e;
}

/* ---- Per booking -------------------------------------------------------------------- */

export type Reach = { ok: true; value: number } | { ok: false; message: string };

export type PlatformCard = {
  id: PlatformId;
  label: string;
  /** Host fee rate before VAT (decimal). */
  feePct: number;
  /** Host fee £, including VAT if on. */
  fee: number;
  vat: number;
  payout: number;
  guestPays: number;
  /** Split fee: the guest's own VAT isn't modelled. */
  guestApprox: boolean;
  saving: number;
  breakEvenDiscount: Reach;
};

export type PerBooking = {
  value: number;
  platforms: PlatformCard[];
  direct: { value: number; costs: number; payout: number; guestPays: number };
  /** Split-fee Airbnb only: the direct price that equals the guest's platform total, and the payout at it. */
  parity: { price: number; payout: number } | null;
};

/** Host fee rate for a platform (decimal, before VAT). */
export function feeRate(inp: Inputs, id: PlatformId, c: Content): number {
  if (id === "airbnb") return inp.airbnbModel === "host-only" ? c.fees.airbnbHostOnly : inp.airbnbModel === "split" ? c.fees.airbnbSplitHost : inp.airbnbCustom / 100;
  if (id === "booking") return (inp.bookingFee + inp.bookingPaymentsFee) / 100;
  if (id === "vrbo") return inp.vrboFee / 100;
  return inp.otherFee / 100;
}

/** Direct payout for a guest price (after card, damage protection and booking system costs). */
function directAt(inp: Inputs, price: number) {
  const system = inp.systemKind === "percent" ? (price * inp.systemFee) / 100 : inp.systemFee;
  const costs = (price * inp.cardPercent) / 100 + inp.cardFixed + inp.damage + system;
  return { costs, payout: price - costs };
}

function platformAt(inp: Inputs, id: PlatformId, value: number, c: Content) {
  const rate = feeRate(inp, id, c);
  const base = value * rate;
  const vat = inp.vatOnFee ? base * c.vatRate : 0;
  const split = id === "airbnb" && inp.airbnbModel === "split";
  return { rate, fee: base + vat, vat, payout: value - base - vat, guestPays: split ? value * (1 + inp.guestFee / 100) : value, split };
}

/** Booking value at which to work out payouts (Section A, or Section B's average). */
export function perBooking(inp: Inputs, c: Content, value = inp.rate * inp.nights + inp.cleaningFee): PerBooking {
  const vd = value * (1 - inp.discount / 100);
  const direct = { value: vd, ...directAt(inp, vd), guestPays: vd };
  const sysPct = inp.systemKind === "percent" ? inp.systemFee / 100 : 0;
  const sysFixed = inp.systemKind === "fixed" ? inp.systemFee : 0;
  const denom = value * (1 - inp.cardPercent / 100 - sysPct);
  const platforms = inp.channels.map((id): PlatformCard => {
    const p = platformAt(inp, id, value, c);
    const d = denom > 0 ? 1 - (p.payout + inp.cardFixed + inp.damage + sysFixed) / denom : 0;
    return {
      id,
      label: CHANNEL_LABEL[id],
      feePct: p.rate,
      fee: p.fee,
      vat: p.vat,
      payout: p.payout,
      guestPays: p.guestPays,
      guestApprox: p.split,
      saving: direct.payout - p.payout,
      breakEvenDiscount: d > 0 ? { ok: true, value: Math.min(1, d) } : { ok: false, message: "Direct costs more than this platform at these figures" },
    };
  });
  const air = platforms.find((p) => p.id === "airbnb" && p.guestApprox);
  return { value, platforms, direct, parity: air ? { price: air.guestPays, payout: directAt(inp, air.guestPays).payout } : null };
}

/* ---- Per year ---------------------------------------------------------------------- */

export type Verdict = "worth" | "marginal" | "notYet";

export type PerYear = {
  bookings: number;
  value: number;
  /** Current and target bookings, fees (platform host fees incl. VAT, or direct costs) per channel. */
  rows: { id: ChannelId; label: string; current: number; target: number; feeNow: number; feeTarget: number }[];
  platformFeesNow: number;
  platformFeesTarget: number;
  currentShare: number;
  targetShare: number;
  extra: number;
  gross: number;
  newCosts: number;
  /** Running costs per year, whether or not they're new. */
  runningCosts: number;
  net: number;
  breakEven: { ok: true; bookings: number; exact: number } | { ok: false; message: string };
  payback: { months: number | null; text: string } | null;
  verdict: Verdict;
};

type Plan = { from: Record<PlatformId, number> };

/** How many bookings move from each platform for an extra direct share (decimal). */
function movePlan(inp: Inputs, extraShare: number, fees: Record<PlatformId, number>): Plan {
  const from = { airbnb: 0, booking: 0, vrbo: 0, other: 0 } as Record<PlatformId, number>;
  const ids = inp.channels.filter((id) => inp.shares[id] > 0);
  const pool = ids.reduce((t, id) => t + inp.shares[id] / 100, 0);
  if (extraShare <= 0 || pool <= 0) return { from };
  const want = Math.min(extraShare, pool);
  if (inp.fromHighest) {
    let left = want;
    for (const id of [...ids].sort((a, b) => fees[b] - fees[a])) {
      const take = Math.min(left, inp.shares[id] / 100);
      from[id] = take;
      left -= take;
      if (left <= 1e-12) break;
    }
  } else for (const id of ids) from[id] = want * (inp.shares[id] / 100 / pool);
  return { from };
}

export function bookingsFromOccupancy(occupancyPercent: number, avgStay: number, c: Content): number {
  return avgStay > 0 ? Math.round((c.daysPerYear * (occupancyPercent / 100)) / avgStay) : 0;
}

export function runningPerYear(inp: Inputs) {
  return inp.running.system * 12 + inp.running.hosting + inp.running.marketing * 12 + inp.running.other;
}

function paybackText(months: number, cap: number): string {
  if (months > cap) return "Over 10 years";
  let y = Math.floor(months / 12);
  let m = Math.round(months - y * 12);
  if (m === 12) {
    y += 1;
    m = 0;
  }
  const part = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  return [y ? part(y, "year") : "", m || !y ? part(m, "month") : ""].filter(Boolean).join(" ");
}

/** Gross yearly saving at a target direct share (decimal). */
function grossAt(inp: Inputs, pb: PerBooking, target: number): { gross: number; extra: number; plan: Plan } {
  const B = inp.bookings;
  const cur = inp.shares.direct / 100;
  const savings = Object.fromEntries(pb.platforms.map((p) => [p.id, p.saving])) as Record<PlatformId, number>;
  const fees = Object.fromEntries(pb.platforms.map((p) => [p.id, p.fee])) as Record<PlatformId, number>;
  const plan = movePlan(inp, Math.max(0, target - cur), fees);
  const moved = PLATFORMS.reduce((t, id) => t + plan.from[id], 0);
  const gross = PLATFORMS.reduce((t, id) => t + plan.from[id] * B * (savings[id] ?? 0), 0);
  return { gross, extra: moved * B, plan };
}

export function perYear(inp: Inputs, c: Content, pbA?: PerBooking): PerYear {
  const value = inp.avgValue ?? (pbA ? pbA.value : inp.rate * inp.nights + inp.cleaningFee);
  const pb = perBooking(inp, c, value);
  const B = inp.bookings;
  const cur = inp.shares.direct / 100;
  const target = Math.max(cur, inp.target / 100);
  const { gross, extra, plan } = grossAt(inp, pb, target);
  const card = (id: PlatformId) => pb.platforms.find((p) => p.id === id);
  const rows = ([...inp.channels, "direct"] as ChannelId[]).map((id) => {
    const nowShare = inp.shares[id] / 100;
    const tShare = id === "direct" ? cur + extra / B : nowShare - plan.from[id as PlatformId];
    const per = id === "direct" ? pb.direct.costs : (card(id as PlatformId)?.fee ?? 0);
    return { id, label: CHANNEL_LABEL[id], current: B * nowShare, target: B * tShare, feeNow: B * nowShare * per, feeTarget: B * tShare * per };
  });
  const platformRows = rows.filter((r) => r.id !== "direct");
  const runningCosts = runningPerYear(inp);
  const newCosts = inp.alreadyDirect ? 0 : runningCosts;
  const net = gross - newCosts;
  // Average saving per moved booking (or the first booking that would move, if none move yet).
  const first = grossAt(inp, pb, Math.min(1, cur + 1 / Math.max(B, 1)));
  const avg = extra > 0 ? gross / extra : first.extra > 0 ? first.gross / first.extra : 0;
  const breakEven: PerYear["breakEven"] =
    avg <= 0 ? { ok: false, message: "Direct bookings don’t save money at these figures" } : { ok: true, bookings: newCosts > 0 ? Math.ceil(newCosts / avg - 1e-9) : 0, exact: newCosts / avg };
  let payback: PerYear["payback"] = null;
  if (inp.websiteBuild > 0) payback = net <= 0 ? { months: null, text: "Not paid back at these figures" } : (() => {
    const months = inp.websiteBuild / (net / 12);
    return { months, text: paybackText(months, c.model.paybackCapMonths) };
  })();
  const verdict: Verdict = net <= 0 ? "notYet" : payback === null || (payback.months !== null && payback.months <= c.model.worthItMonths) ? "worth" : "marginal";
  return {
    bookings: B,
    value,
    rows,
    platformFeesNow: platformRows.reduce((t, r) => t + r.feeNow, 0),
    platformFeesTarget: platformRows.reduce((t, r) => t + r.feeTarget, 0),
    currentShare: cur,
    targetShare: cur + extra / B,
    extra,
    gross,
    newCosts,
    runningCosts,
    net,
    breakEven,
    payback,
    verdict,
  };
}

/**
 * "What would make it work?": the direct share at which the net saving is 0,
 * and the share for website payback within the stored months. Solved on the
 * same model (bisection on a monotone piecewise-linear curve).
 */
export function makeItWork(inp: Inputs, c: Content): { breakEvenShare: Reach; paybackShare: Reach | null } {
  const value = inp.avgValue ?? inp.rate * inp.nights + inp.cleaningFee;
  const pb = perBooking(inp, c, value);
  const cur = inp.shares.direct / 100;
  const newCosts = inp.alreadyDirect ? 0 : runningPerYear(inp);
  const solve = (need: number): Reach => {
    if (need <= 0) return { ok: true, value: cur };
    const top = grossAt(inp, pb, 1).gross;
    if (top < need) return { ok: false, message: "Not reachable even with every booking direct" };
    let lo = cur;
    let hi = 1;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (grossAt(inp, pb, mid).gross >= need) hi = mid;
      else lo = mid;
    }
    return { ok: true, value: hi };
  };
  return {
    breakEvenShare: solve(newCosts),
    paybackShare: inp.websiteBuild > 0 ? solve(newCosts + (inp.websiteBuild * 12) / c.model.worthItMonths) : null,
  };
}

/* ---- Shared device format ------------------------------------------------------------ */

/** Prefill from the profit calculator's hand-off ("profit-inputs"), only where the host hasn't changed the starting value. */
export function importFromProfit(inp: Inputs, data: unknown, c: Content): { inputs: Inputs; fields: string[] } {
  if (!data || typeof data !== "object") return { inputs: inp, fields: [] };
  const d = data as { bookingValueMonthly?: unknown; staysMonthly?: unknown; channels?: unknown };
  const base = defaultInputs(c);
  const next: Inputs = { ...inp, shares: { ...inp.shares }, channels: [...inp.channels] };
  const fields: string[] = [];
  const stays = typeof d.staysMonthly === "number" && d.staysMonthly > 0 ? d.staysMonthly : 0;
  if (stays && typeof d.bookingValueMonthly === "number" && d.bookingValueMonthly > 0 && inp.avgValue === null) {
    next.avgValue = round2(d.bookingValueMonthly / stays);
    fields.push("average booking value");
  }
  if (stays && inp.bookings === base.bookings) {
    next.bookings = Math.round(stays * 12);
    fields.push("bookings per year");
  }
  const sameShares = (Object.keys(base.shares) as ChannelId[]).every((k) => inp.shares[k] === base.shares[k]);
  if (Array.isArray(d.channels) && sameShares) {
    const shares: Record<ChannelId, number> = { airbnb: 0, booking: 0, vrbo: 0, other: 0, direct: 0 };
    for (const ch of d.channels as { id?: unknown; sharePercent?: unknown; feePercent?: unknown }[]) {
      const id = ch.id === "average" ? "airbnb" : ch.id;
      if (typeof id === "string" && id in shares && typeof ch.sharePercent === "number") shares[id as ChannelId] += ch.sharePercent;
      if (id === "booking" && typeof ch.feePercent === "number") next.bookingFee = ch.feePercent;
      if (id === "other" && typeof ch.feePercent === "number") next.otherFee = ch.feePercent;
    }
    const total = Object.values(shares).reduce((t, v) => t + v, 0);
    if (Math.abs(total - 100) < 0.5) {
      next.shares = shares;
      next.channels = PLATFORMS.filter((id) => shares[id] > 0 || inp.channels.includes(id));
      if (!next.channels.length) next.channels = ["airbnb"];
      fields.push("channel mix");
    }
  }
  return { inputs: next, fields };
}

/** "Open in Profit calculator": the target channel mix (Vrbo goes into Other, with a blended fee). */
export type DirectMix = { shares: { airbnb: number; booking: number; direct: number; other: number }; bookingFee: number; otherFee: number; directFee: number; directFixed: number };

export function mixForProfit(inp: Inputs, y: PerYear): DirectMix {
  const share = (id: ChannelId) => (y.bookings > 0 ? ((y.rows.find((r) => r.id === id)?.target ?? 0) / y.bookings) * 100 : 0);
  const vrbo = share("vrbo");
  const other = share("other");
  const otherFee = vrbo + other > 0 ? (vrbo * inp.vrboFee + other * inp.otherFee) / (vrbo + other) : inp.otherFee;
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    shares: { airbnb: r(share("airbnb")), booking: r(share("booking")), direct: r(share("direct")), other: r(vrbo + other) },
    bookingFee: r(inp.bookingFee + inp.bookingPaymentsFee),
    otherFee: r(otherFee),
    directFee: inp.cardPercent,
    directFixed: inp.cardFixed,
  };
}
