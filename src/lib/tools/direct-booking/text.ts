import { money, percent } from "@/lib/tools/format";
import { perBooking, perYear, makeItWork, type Inputs, type PerBooking, type PerYear, type Reach } from "./calc";
import type { Content } from "./content";

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? `{${k}}`);
export const share = (x: number) => `${(x * 100).toFixed(1)}`;
export const reachShare = (r: Reach) => (r.ok ? `${share(r.value)}% direct` : r.message);

export function verdictLabel(y: PerYear, c: Content) {
  return c.wording.verdict[y.verdict];
}

/** "What this means": 2–3 sentences chosen by the result. */
export function whatThisMeans(inp: Inputs, y: PerYear, c: Content): string {
  const w = c.wording.whatThisMeans;
  const fix = makeItWork(inp, c);
  const main =
    y.verdict === "worth"
      ? fill(y.payback ? w.worth : w.worthNoBuild, { target: share(y.targetShare), net: money(y.net, 0), payback: y.payback?.text ?? "" })
      : y.verdict === "marginal"
        ? fill(w.marginal, { share: fix.paybackShare?.ok ? share(fix.paybackShare.value) : "100" })
        : w.notYet;
  return `${main} ${w.always}`;
}

/** The best platform to compare Direct with (the one you keep least from). */
export const versus = (pb: PerBooking) => [...pb.platforms].sort((a, b) => a.payout - b.payout)[0];

export function summaryText(inp: Inputs, pb: PerBooking, y: PerYear | null, c: Content): string {
  const lines = ["Direct booking savings (VA for BnB): an estimate at your figures", "", `One booking: ${money(pb.value)} booking value`];
  for (const p of pb.platforms) lines.push(`- ${p.label}: you keep ${money(p.payout)} (fees ${money(p.fee)}), guest pays ${money(p.guestPays)}${p.guestApprox ? " (approximate)" : ""}`);
  lines.push(`- Direct: you keep ${money(pb.direct.payout)} (costs ${money(pb.direct.costs)}), guest pays ${money(pb.direct.guestPays)}`);
  for (const p of pb.platforms) lines.push(`Direct vs ${p.label}: ${p.saving >= 0 ? "+" : "−"}${money(Math.abs(p.saving))} per booking; ${p.breakEvenDiscount.ok ? `up to ${percent(p.breakEvenDiscount.value)} off and still keep more` : p.breakEvenDiscount.message}`);
  if (y) {
    lines.push(
      "",
      `Your year: about ${money(y.platformFeesNow, 0)} a year in platform fees.`,
      `Moving from ${share(y.currentShare)}% to ${share(y.targetShare)}% direct = ${Math.round(y.extra)} more direct bookings a year.`,
      `Gross saving ${money(y.gross, 0)} − new direct costs ${money(y.newCosts, 0)} = net saving ${money(y.net, 0)} a year.`,
      y.breakEven.ok ? `Break-even: ${y.breakEven.bookings} direct bookings a year cover your direct running costs.` : y.breakEven.message,
      y.payback ? `Website payback: ${y.payback.text}.` : "",
      `Verdict: ${verdictLabel(y, c)}.`,
    );
  }
  lines.push("", "Platforms bring guests you might not reach yourself. Don’t move a platform’s guests off the platform.");
  return lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

/* ---- Saved scenarios (device only) ------------------------------------------------------ */

export type Scenario = { id: string; name: string; inputs: Inputs; savedAt: string };

export function addScenario(list: Scenario[], name: string, inputs: Inputs, max: number, now = new Date()): { list: Scenario[]; full: boolean } {
  if (list.length >= max) return { list, full: true };
  return { list: [...list, { id: `s${now.getTime().toString(36)}${list.length}`, name: name.trim().slice(0, 40) || `Scenario ${list.length + 1}`, inputs: structuredClone(inputs), savedAt: now.toISOString() }], full: false };
}
export const renameScenario = (list: Scenario[], id: string, name: string) => list.map((s) => (s.id === id ? { ...s, name: name.trim().slice(0, 40) || s.name } : s));
export const removeScenario = (list: Scenario[], id: string) => list.filter((s) => s.id !== id);
export function cleanScenarios(raw: unknown, max: number): Scenario[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is Scenario => !!s && typeof s === "object" && typeof (s as Scenario).id === "string" && typeof (s as Scenario).inputs?.rate === "number").slice(0, max);
}

export type CompareRow = { label: string; values: string[]; differs: boolean };

export function compareScenarios(list: Scenario[], c: Content): CompareRow[] {
  const rs = list.map((s) => {
    const pb = perBooking(s.inputs, c);
    return { s, pb, y: perYear(s.inputs, c, pb) };
  });
  const row = (label: string, f: (x: (typeof rs)[number]) => string): CompareRow => {
    const values = rs.map(f);
    return { label, values, differs: new Set(values).size > 1 };
  };
  return [
    row("Booking value", ({ pb }) => money(pb.value)),
    row("Direct payout", ({ pb }) => money(pb.direct.payout)),
    row("Saving per booking", ({ pb }) => (pb.platforms[0] ? money(pb.platforms[0].saving) : "—")),
    row("Platform fees a year", ({ y }) => money(y.platformFeesNow, 0)),
    row("Target direct share", ({ y }) => `${share(y.targetShare)}%`),
    row("Net saving a year", ({ y }) => money(y.net, 0)),
    row("Website payback", ({ y }) => y.payback?.text ?? "—"),
    row("Verdict", ({ y }) => c.wording.verdict[y.verdict]),
  ];
}
