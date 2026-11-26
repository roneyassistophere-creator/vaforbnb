import { toCsv } from "@/lib/tools/csv";
import { money } from "@/lib/tools/format";
import { revparBreakdown, type BookingResult, type Comparison, type Kpis, type TargetGap } from "./calc";
import type { Content } from "./content";

export const pct1 = (x: number) => `${(x * 100).toFixed(1)}%`;
export const adrText = (k: Kpis) => (k.adr === null ? "–" : money(k.adr));
export const signedMoney = (n: number) => `${n >= 0 ? "+" : "−"}${money(Math.abs(n))}`;
export const signedPct = (x: number | null) => (x === null ? "–" : `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`);
export const signedPts = (p: number) => `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)} pts`;
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? `{${k}}`);

/** "You sold 18 of 25 available nights at an average of £110, earning £66 for every night you could have sold." */
export function summarySentence(k: Kpis): string {
  const n = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  if (!k.booked) return `You sold none of your ${n(k.available)} available nights.`;
  return `You sold ${n(k.booked)} of ${n(k.available)} available nights at an average of ${money(k.adr ?? 0, 0)}, earning ${money(k.revpar, 0)} for every night you could have sold.`;
}

export function whatThisMeans(k: Kpis | null, c: Content): string {
  const w = c.wording.whatThisMeans;
  if (!k) return w.noData;
  const v = { occ: pct1(k.occupancy), adr: adrText(k), revpar: money(k.revpar) };
  const t = c.insights.thresholds;
  const main = k.occupancy * 100 >= t.nearlyFullPercent ? w.high : k.occupancy * 100 < t.emptyPercent ? w.low : w.mid;
  return `${fill(main, v)} ${w.always}`;
}

export type Insight = { id: string; impact: number; text: string; links: { tool: string; label: string }[] };

/** Up to `max` insight cards, highest impact first. Only the host's own figures. */
export function insights(o: { k: Kpis; before: Kpis | null; cmp: Comparison | null; target: TargetGap | null; targetAdr: number | null; bookings: BookingResult | null }, c: Content): Insight[] {
  const rules = new Map(c.insights.rules.filter((r) => r.enabled).map((r) => [r.id, r as (typeof c.insights.rules)[number] & { tool?: string; linkLabel?: string; tool2?: string; link2Label?: string }]));
  const T = c.insights.thresholds;
  const out: Insight[] = [];
  const add = (id: string, impact: number, vars: Record<string, string> = {}) => {
    const r = rules.get(id);
    if (!r) return;
    const links = [r.tool ? { tool: r.tool, label: r.linkLabel ?? "" } : null, r.tool2 ? { tool: r.tool2, label: r.link2Label ?? "" } : null].filter((x): x is { tool: string; label: string } => !!x);
    out.push({ id, impact, text: fill(r.text, vars), links });
  };
  const { k, before, cmp, bookings: b } = o;
  if (b && b.flags.length) add("flags", 1e9, { n: String(b.flags.length) });
  const lowerAdr = (before?.adr != null && k.adr != null && k.adr < before.adr) || (o.targetAdr !== null && k.adr != null && k.adr < o.targetAdr);
  if (k.occupancy * 100 >= T.nearlyFullPercent && lowerAdr) add("nearlyFull", k.revpar * k.available * 0.1);
  if (k.available > 0 && k.occupancy * 100 < T.emptyPercent) add("empty", (1 - k.occupancy) * k.available * (k.adr ?? 0));
  if (b && b.gaps.count >= T.minGaps) add("gaps", b.gaps.nights * (k.adr ?? 0), { n: String(b.gaps.count), x: String(b.gaps.nights) });
  if (b && b.weekend.available && b.weekday.available && (b.weekend.occupancy - b.weekday.occupancy) * 100 > T.weekdayGapPoints)
    add("weekday", (b.weekend.occupancy - b.weekday.occupancy) * b.weekday.available * (k.adr ?? 0), { w: (b.weekday.occupancy * 100).toFixed(1), k: (b.weekend.occupancy * 100).toFixed(1) });
  if (before && cmp) {
    const br = revparBreakdown(k, before);
    if (br.occEffect * br.priceEffect < 0) add("opposite", Math.abs(br.total) * k.available, { dir: br.total >= 0 ? "rose" : "fell", x: money(Math.abs(br.total)) });
    if (cmp.revpar.pct !== null && cmp.revpar.abs > 0) add("yoyUp", cmp.revpar.abs * k.available, { y: (cmp.revpar.pct * 100).toFixed(1) });
    if (cmp.revpar.pct !== null && cmp.revpar.abs < 0) add("yoyDown", -cmp.revpar.abs * k.available, { y: (-cmp.revpar.pct * 100).toFixed(1) });
  }
  // Ties keep the rule order (impacts compared to the penny).
  return out.sort((a, b2) => Math.round(b2.impact * 100) - Math.round(a.impact * 100)).slice(0, c.insights.max);
}

export function summaryText(o: { label: string; k: Kpis; cmp: Comparison | null; before: Kpis | null; ins: Insight[]; bookings: BookingResult | null }): string {
  const { k } = o;
  const lines = [
    `Booking performance (VA for BnB): ${o.label}`,
    "",
    `Occupancy ${pct1(k.occupancy)} · ADR ${adrText(k)} · RevPAR ${money(k.revpar)}`,
    summarySentence(k),
  ];
  const extra = [k.netRevpar !== null ? `Net RevPAR ${money(k.netRevpar)}` : "", k.trevpar !== null ? `TRevPAR ${money(k.trevpar)}` : "", k.alos !== null ? `Avg stay ${k.alos.toFixed(1)} nights` : ""].filter(Boolean);
  if (extra.length) lines.push(extra.join(" · "));
  if (o.cmp && o.before) {
    const br = revparBreakdown(k, o.before);
    lines.push("", `vs last year: occupancy ${signedPts(o.cmp.occPoints)}, ADR ${o.cmp.adr ? `${signedMoney(o.cmp.adr.abs)} (${signedPct(o.cmp.adr.pct)})` : "–"}, RevPAR ${signedMoney(o.cmp.revpar.abs)} (${signedPct(o.cmp.revpar.pct)})`);
    lines.push(`Occupancy effect ${signedMoney(br.occEffect)} · Price effect ${signedMoney(br.priceEffect)} · Total ${signedMoney(br.total)}`);
  }
  if (o.bookings) {
    const b = o.bookings;
    lines.push("", `Weekends: ${pct1(b.weekend.occupancy)} at ${b.weekend.adr === null ? "–" : money(b.weekend.adr)} · Weekdays: ${pct1(b.weekday.occupancy)} at ${b.weekday.adr === null ? "–" : money(b.weekday.adr)}`);
    if (b.gaps.count) lines.push(`Gap nights: ${b.gaps.count} gaps, ${b.gaps.nights} nights`);
  }
  if (o.ins.length) lines.push("", "Insights:", ...o.ins.map((i) => `- ${i.text}`));
  lines.push("", "Your figures, not market benchmarks.");
  return lines.join("\n");
}

const n2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const kRow = (label: string, k: Kpis) => [label, String(k.periodNights), String(k.blocked), String(k.available), String(k.booked), n2(k.revenue), (k.occupancy * 100).toFixed(1), k.adr === null ? "" : n2(k.adr), n2(k.revpar)];
export const KPI_HEADER = ["Period", "Nights", "Blocked", "Available", "Booked", "Revenue", "Occupancy %", "ADR", "RevPAR"];

export function kpiCsv(rows: { label: string; k: Kpis }[]): string {
  return toCsv(KPI_HEADER, rows.map((r) => kRow(r.label, r.k)), { bom: true });
}

/** Booking-level nights inside the period (Booking list CSV). */
export function nightsCsv(b: BookingResult): string {
  const rows = Object.entries(b.days)
    .sort(([a], [b2]) => a.localeCompare(b2))
    .map(([d, info]) => [d, info.kind, info.detail]);
  return toCsv(["Night", "Status", "Detail"], rows, { bom: true });
}
