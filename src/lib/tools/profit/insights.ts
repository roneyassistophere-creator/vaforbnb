import { joinList, money } from "@/lib/tools/format";
import type { Lever, Result } from "./calc";
import type { Content } from "./content";
import { MON, type Inputs } from "./inputs";
import type { Notices, TaxEstimate } from "./tax";

/**
 * Smart insights: conditions here, thresholds and wording from stored
 * content. Every number comes from the host's own figures, never a benchmark.
 */
export type Insight = { id: string; tier: number; impact: number; text: string; links: { tool?: string; href?: string; label: string }[] };

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? `{${k}}`);
const pts = (x: number) => (x * 100).toFixed(1);
const pc = (x: number) => `${(x * 100).toFixed(1)}%`;

export function insights(inp: Inputs, r: Result, levers: Lever[], tax: TaxEstimate | null, n: Notices, c: Content): Insight[] {
  const rules = new Map(c.insights.rules.filter((x) => x.enabled).map((x) => [x.id, x]));
  const T = c.insights.thresholds;
  const out: Insight[] = [];
  const add = (id: string, impact: number, vars: Record<string, string> = {}) => {
    const rule = rules.get(id) as (typeof c.insights.rules)[number] & { link?: string; tool?: string; tool2?: string; linkLabel?: string; link2Label?: string };
    if (!rule) return;
    const links: Insight["links"] = [];
    if (rule.tool || rule.link) links.push({ tool: rule.tool, href: rule.link, label: rule.linkLabel ?? "" });
    if (rule.tool2) links.push({ tool: rule.tool2, label: rule.link2Label ?? "" });
    out.push({ id, tier: rule.tier, impact, text: fill(rule.text, vars), links });
  };
  const lever = (id: Lever["id"]) => levers.find((l) => l.id === id);
  const P = r.monthly.profit;
  const C = r.monthly.cash;

  if (P < 0) {
    if (r.minRate.ok || r.breakEven.ok)
      add("loss", -P * 12, {
        loss: money(-P, 0),
        minRate: r.minRate.ok ? money(r.minRate.value) : "a higher price",
        beOcc: r.breakEven.ok ? pc(r.breakEven.value) : "more",
      });
    if (!r.breakEven.ok) add("lossUnreachable", -P * 12, { loss: money(-P, 0) });
  }
  if (P > 0 && C < 0) add("cashSqueeze", -C * 12, { short: money(-C, 0) });
  if (P >= 0 && r.margin !== null && r.margin < c.model.thinMarginPoints / 100) add("thin", lever("occupancy")?.gain ?? 0, { margin: pts(r.margin) });

  const stay = lever("stay");
  const avgStay = r.annual.stays > 0 ? r.annual.nights / r.annual.stays : inp.avgStay;
  if (stay && avgStay < T.shortStayNights && r.annual.booking > 0 && (r.annual.turnovers + r.annual.consumables) / r.annual.booking > T.turnoverSharePercent / 100 && stay.gain > 0)
    add("shortStays", stay.gain, { stay: String(Math.round(avgStay * 10) / 10), turnovers: String(Math.round(r.annual.stays)), saving: money(stay.gain, 0) });

  const direct = lever("direct");
  if (direct && direct.gain > 0 && r.fees.f > T.feePercent / 100 && r.fees.d < T.directSharePercent / 100) add("fees", direct.gain, { points: String(direct.size), saving: money(direct.gain, 0) });

  if (r.mode === "detailed" && r.lossMonths.length && r.lossMonths.length < 12) add("lossMonths", -r.lossMonths.reduce((t, i) => t + r.months[i].profit, 0), { months: joinList(r.lossMonths.map((i) => MON[i])) });

  const top = levers[0];
  if (top?.id === "rate" && top.gain > 0) add("priceLever", top.gain, { pct: String(top.size), gain: money(top.gain, 0) });

  if (n.vat === "over") add("vatOver", n.annualBooking);
  if (n.vat === "close") add("vatClose", n.annualBooking * 0.01);
  if (n.mtd) add("mtd", 0, { from: n.mtd });

  if (tax?.available && tax.columns.length === 2 && tax.columns[1].tax > tax.columns[0].tax) add("tax2027", tax.columns[1].tax - tax.columns[0].tax, { rise: money(tax.columns[1].tax - tax.columns[0].tax, 0) });

  return out.sort((a, b) => a.tier - b.tier || b.impact - a.impact).slice(0, c.insights.max);
}
