import { toCsv } from "@/lib/tools/csv";
import { money, percent } from "@/lib/tools/format";
import { BILL_LABELS, costLines, feeSetup, type Lever, type Reach, type Result } from "./calc";
import type { Content } from "./content";
import { CHANNELS, MONTHS, type Inputs } from "./inputs";
import type { Insight } from "./insights";
import type { TaxEstimate } from "./tax";

export const reachText = (x: Reach, fmt: (v: number) => string) => (x.ok ? fmt(x.value) : x.message);
export const pct = (x: number) => percent(x);
export const pts = (x: number) => `${(x * 100).toFixed(1)} points`;

export const STATUS_LABEL = { loss: "Losing money at these figures", thin: "Profitable, but a thin margin", healthy: "Healthy margin" } as const;

/** "You’re at 60.0% · 1.8 points above" */
export function marginText(r: Result): string {
  if (!r.breakEven.ok || r.margin === null) return `You’re at ${pct(r.occupancy)}`;
  const m = r.margin;
  return `You’re at ${pct(r.occupancy)} · ${Math.abs(m * 100).toFixed(1)} points ${m >= 0 ? "above" : "below"}`;
}

export function leverLine(l: Lever, c: Content): string {
  const t = c.leverText[l.id];
  const size = l.id === "turnover" ? money(l.size, 0) : String(l.size);
  const gain = l.gain >= 0 ? money(l.gain, 0) : `−${money(-l.gain, 0)}`;
  return t.replace("{size}", size).replace("{gain}", gain).replace(" adds −", " costs ");
}

/** "What this means": 2–3 sentences chosen by the result. */
export function whatThisMeans(r: Result, levers: Lever[], c: Content): string {
  const top = levers[0];
  const lever = top && top.gain > 0 ? ` ${leverLine(top, c)}: that’s your biggest lever.` : "";
  const cash = r.monthly.cash < 0 && r.monthly.profit >= 0 ? ` After mortgage capital repayments, though, you’re ${money(-r.monthly.cash, 0)} a month short of cash, so plan for that gap.` : "";
  if (r.status === "loss") {
    const need = [r.minRate.ok ? `${money(r.minRate.value)} a night` : "", r.breakEven.ok ? `${pct(r.breakEven.value)} occupancy` : ""].filter(Boolean).join(" or ");
    return `At your figures this property loses ${money(-r.monthly.profit, 0)} a month (${money(-r.annual.profit, 0)} a year).${need ? ` To break even you’d need ${need}.` : " Higher occupancy alone can’t close the gap: look at your price, fees and costs per stay."}${lever}`;
  }
  if (r.status === "thin")
    return `You make ${money(r.monthly.profit, 0)} a month at your figures, but you’re only ${pts(r.margin ?? 0)} above break-even, so a quiet month could tip you into a loss.${cash}${lever}`;
  return `You make ${money(r.monthly.profit, 0)} a month (${money(r.annual.profit, 0)} a year) at your figures, ${pts(r.margin ?? 0)} above break-even.${cash}${lever}`;
}

/** "Copy summary": plain text. */
export function summaryText(inp: Inputs, r: Result, levers: Lever[], ins: Insight[], tax: TaxEstimate | null, c: Content): string {
  const lines = [
    "Short-let profit calculator (VA for BnB): an estimate at your figures",
    `Mode: ${inp.mode === "detailed" ? `Detailed (${inp.year})` : "Quick"}`,
    "",
    `Profit: ${money(r.monthly.profit, 0)} a month · ${money(r.annual.profit, 0)} a year`,
    `Cash flow (after mortgage capital): ${money(r.monthly.cash, 0)} a month`,
    `Status: ${STATUS_LABEL[r.status]}`,
    `Break-even occupancy: ${reachText(r.breakEven, pct)} (${marginText(r)})`,
    `Minimum nightly rate: ${reachText(r.minRate, (v) => money(v))}`,
    `Profit margin: ${r.kpis.margin === null ? "—" : pct(r.kpis.margin)}`,
    `ADR ${r.kpis.adr === null ? "—" : money(r.kpis.adr)} · RevPAR ${r.kpis.revpar === null ? "—" : money(r.kpis.revpar)} · booked nights ${Math.round(r.kpis.nights)} a year`,
    `Target ${money(r.target.amount, 0)} a month: ${reachText(r.target.rate, (v) => `${money(v)} a night`)} at ${pct(r.occupancy)}, or ${reachText(r.target.occupancy, pct)} at your rate`,
    "",
    "What moves the needle (a year):",
    ...levers.map((l) => `- ${leverLine(l, c)}`),
  ];
  if (ins.length) lines.push("", "Insights:", ...ins.map((i) => `- ${i.text}`));
  if (tax?.available) lines.push("", `Tax ESTIMATE (${tax.bandLabel}):`, ...tax.columns.map((col) => `- ${col.label}: ${money(col.tax)} tax, after-tax profit ${money(col.afterTaxProfit)}`));
  lines.push("", "A planning estimate, not accounts or tax advice.");
  return lines.join("\n");
}

const n2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2);

/** "Download CSV": the monthly table and the inputs. */
export function profitCsv(inp: Inputs, r: Result, c: Content): string {
  const rows: string[][] = [];
  const months = r.mode === "detailed" ? r.months.map((m, i) => ({ label: MONTHS[i], m })) : [{ label: "Average month", m: r.monthly }];
  for (const { label, m } of months) rows.push([label, n2(m.nights), n2(m.stays), n2(m.booking), n2(m.vat), n2(m.platformFees), n2(m.management), n2(m.variable), n2(m.reserve), n2(m.bills), n2(m.profit), n2(m.capital), n2(m.cash)]);
  rows.push(["Year", n2(r.annual.nights), n2(r.annual.stays), n2(r.annual.booking), n2(r.annual.vat), n2(r.annual.platformFees), n2(r.annual.management), n2(r.annual.variable), n2(r.annual.reserve), n2(r.annual.bills), n2(r.annual.profit), n2(r.annual.capital), n2(r.annual.cash)]);
  rows.push([]);
  rows.push(["Cost line", "£ a month", "£ a year", "% of booking value"]);
  for (const l of costLines(r)) rows.push([l.label, n2(l.monthly), n2(l.monthly * 12), r.monthly.booking > 0 ? ((l.monthly / r.monthly.booking) * 100).toFixed(1) : ""]);
  rows.push([]);
  rows.push(["Input", "Value"]);
  for (const [k, v] of inputRows(inp, c)) rows.push([k, v]);
  return toCsv(["Period", "Booked nights", "Stays", "Guest booking value", "VAT", "Platform fees", "Management", "Turnovers and running costs", "Reserve", "Bills", "Profit", "Mortgage capital", "Cash flow"], rows, { bom: true });
}

/** The inputs as label/value pairs (CSV and PDF). */
export function inputRows(inp: Inputs, c: Content): [string, string][] {
  const fees = feeSetup(inp, c);
  const rows: [string, string][] = [
    ["Mode", inp.mode === "detailed" ? `Detailed (${inp.year})` : "Quick"],
    ["Average nightly rate", money(inp.rate)],
    ["Occupancy", `${inp.occupancy}%`],
    ["Average length of stay", `${inp.avgStay} nights`],
    ["Cleaning fee charged per stay", money(inp.cleaningFee)],
    ["Owner-blocked nights a year", String(inp.ownerNights)],
    ["Average platform fee", pct(fees.f)],
  ];
  if (inp.feeMode === "channels") for (const k of CHANNELS) if (inp.shares[k] > 0) rows.push([`Channel: ${k}`, `${inp.shares[k]}%`]);
  if (inp.mgmt.kind === "percent") rows.push(["Management", `${inp.mgmt.percent}% of ${inp.mgmt.basis === "room" ? "room revenue" : "room revenue + cleaning fees"}`]);
  if (inp.mgmt.kind === "fixed") rows.push(["Management", `${money(inp.mgmt.fixed)} a month`]);
  rows.push(["Turnover cost per stay", money(inp.turnover)], ["Consumables per stay", money(inp.consumables)], ["Running cost per occupied night", money(inp.running)]);
  rows.push(["Mortgage payment a month", money(inp.monthly.mortgagePayment)]);
  for (const [k, v] of Object.entries(inp.monthly)) if (k !== "mortgagePayment" && typeof v === "number" && v > 0) rows.push([`${k === "mortgageInterest" ? BILL_LABELS.mortgageInterest : BILL_LABELS[k as keyof typeof BILL_LABELS]} a month`, money(v)]);
  for (const [k, v] of Object.entries(inp.annual)) if (v > 0) rows.push([`${BILL_LABELS[(k === "other" ? "otherAnnual" : k) as keyof typeof BILL_LABELS]} a year`, money(v)]);
  rows.push(["Reserve", inp.reserve.kind === "percent" ? `${inp.reserve.percent}% of booking value` : `${money(inp.reserve.fixed)} a month`]);
  if (inp.setupCosts) rows.push(["Set-up costs", money(inp.setupCosts)]);
  if (inp.cashInvested) rows.push(["Cash invested", money(inp.cashInvested)]);
  rows.push(["VAT registered", inp.vatRegistered ? "Yes" : "No"]);
  return rows;
}


