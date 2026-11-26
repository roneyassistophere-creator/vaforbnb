import { money } from "@/lib/tools/format";
import { afterTax, compare, fiveYear, timeView, type Inputs } from "./calc";
import type { Content } from "./content";

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? `{${k}}`);
type Cmp = ReturnType<typeof compare>;

export function winnerText(cmp: Cmp, c: Content): string {
  const w = c.wording.winner;
  if (cmp.winner === "same") return w.same;
  const d = Math.abs(cmp.diff);
  return fill(cmp.winner === "short" ? w.short : w.long, { d: money(d, 0), y: money(12 * d, 0) });
}

export function whatThisMeans(inp: Inputs, cmp: Cmp, c: Content): string {
  const w = c.wording.whatThisMeans;
  if (cmp.winner === "same") return w.same;
  if (cmp.winner === "long") return fill(w.long, { d: money(-cmp.diff, 0) });
  const t = timeView(inp, cmp);
  return fill(w.short, {
    d: money(cmp.diff, 0),
    perHour: t.extraPerHour !== null ? `, or ${money(t.extraPerHour)} for each extra hour you put in` : "",
    rent: cmp.breakEvenRent.ok ? money(cmp.breakEvenRent.value) : "more than any realistic rent",
  });
}

export function summaryText(inp: Inputs, c: Content): string {
  const cmp = compare(inp, c);
  const f = fiveYear(inp, c);
  const t = timeView(inp, cmp);
  const tax = afterTax(inp, cmp.diff, c);
  const lines = [
    "Short-let vs long-let (VA for BnB): on your figures",
    "",
    `Short let ${money(cmp.short.net, 0)}/month · Long let ${money(cmp.long.net, 0)}/month`,
    winnerText(cmp, c),
    cmp.breakEvenRent.ok ? `A long-let rent of ${money(cmp.breakEvenRent.value)} would match your short-let profit.` : cmp.breakEvenRent.message,
    `Short-letting needs to make at least ${money(cmp.minShortProfit)} a month to beat this long let.`,
    `Over 5 years: ${money(f.cumulative, 0)} in favour of ${f.cumulative >= 0 ? "short-letting" : "long-letting"}${f.payback ? ` · switching cost payback ${f.payback.text}` : ""}.`,
  ];
  if (t.extraPerHour !== null) lines.push(`Short-letting pays you ${money(t.extraPerHour)} for each extra hour of work.`);
  lines.push(`After tax (estimate, ${tax.label}): ${money(tax.monthly)} a month difference.`);
  lines.push("", "Estimates from your figures, not financial, tax or legal advice.");
  return lines.join("\n");
}

/* ---- Saved scenarios (device only) ---------------------------------------------------- */

export type Scenario = { id: string; name: string; inputs: Inputs; savedAt: string };

export function addScenario(list: Scenario[], name: string, inputs: Inputs, max: number, now = new Date()): { list: Scenario[]; full: boolean } {
  if (list.length >= max) return { list, full: true };
  return { list: [...list, { id: `s${now.getTime().toString(36)}${list.length}`, name: name.trim().slice(0, 40) || `Scenario ${list.length + 1}`, inputs: structuredClone(inputs), savedAt: now.toISOString() }], full: false };
}
export const renameScenario = (list: Scenario[], id: string, name: string) => list.map((s) => (s.id === id ? { ...s, name: name.trim().slice(0, 40) || s.name } : s));
export const removeScenario = (list: Scenario[], id: string) => list.filter((s) => s.id !== id);
export function cleanScenarios(raw: unknown, max: number): Scenario[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is Scenario => !!s && typeof s === "object" && typeof (s as Scenario).id === "string" && typeof (s as Scenario).inputs?.rent === "number").slice(0, max);
}

export function compareScenarios(list: Scenario[], c: Content) {
  const rs = list.map((s) => ({ s, cmp: compare(s.inputs, c), f: fiveYear(s.inputs, c) }));
  const row = (label: string, f: (x: (typeof rs)[number]) => string) => {
    const values = rs.map(f);
    return { label, values, differs: new Set(values).size > 1 };
  };
  return [
    row("Short let a month", ({ cmp }) => money(cmp.short.net, 0)),
    row("Long let a month", ({ cmp }) => money(cmp.long.net, 0)),
    row("Difference a month", ({ cmp }) => money(cmp.diff, 0)),
    row("Break-even rent", ({ cmp }) => (cmp.breakEvenRent.ok ? money(cmp.breakEvenRent.value, 0) : "—")),
    row("Over 5 years", ({ f }) => money(f.cumulative, 0)),
    row("Rent", ({ s }) => money(s.inputs.rent, 0)),
    row("Void weeks", ({ s }) => String(s.inputs.voidWeeks)),
    row("Agent", ({ s }) => s.inputs.agent),
  ];
}
