import { downloadText } from "@/lib/tools/download";
import { money, percent } from "@/lib/tools/format";
import { newPdf, PDF_CORAL as CORAL, PDF_INK as INK, PDF_MUTED as MUTED, safePdfText as safe } from "@/lib/tools/pdf";
import { costLines, inputRows, leverLine, marginText, moneyFlow, MONTHS, paybackText, profitCsv, reachText, STATUS_LABEL, type Content, type Insight, type Inputs, type Lever, type Result, type TaxEstimate } from "@/lib/tools/profit";

const GREEN: [number, number, number] = [31, 107, 69];

/**
 * The PDF report, A4, made on the visitor's device: headline, KPIs, cost
 * table, charts, tax estimate (if on), insights, inputs, the figures date
 * and the disclaimer. Nothing is uploaded.
 */
export async function downloadProfitPdf(o: { inp: Inputs; r: Result; levers: Lever[]; insights: Insight[]; tax: TaxEstimate | null; c: Content; checked: string; disclaimer: string; fileName: string; date: string }) {
  const { inp, r, levers, c } = o;
  const doc = await newPdf();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 46;
  let y = M;
  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (t: string, size: number, opt: { bold?: boolean; color?: [number, number, number]; x?: number; width?: number; gap?: number } = {}) => {
    doc.setFont("helvetica", opt.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opt.color ?? INK));
    for (const line of doc.splitTextToSize(safe(t), opt.width ?? W - M * 2 - ((opt.x ?? M) - M))) {
      ensure(size + 4);
      doc.text(line, opt.x ?? M, y + size);
      y += size + (opt.gap ?? 4);
    }
  };
  const heading = (t: string) => {
    y += 10;
    ensure(40);
    text(t, 14, { bold: true });
    y += 2;
  };
  const row = (cells: string[], widths: number[], opt: { bold?: boolean; color?: [number, number, number] } = {}) => {
    ensure(16);
    doc.setFont("helvetica", opt.bold ? "bold" : "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...(opt.color ?? INK));
    let x = M;
    cells.forEach((cell, i) => {
      const right = i > 0;
      doc.text(safe(cell), right ? x + widths[i] : x, y + 10, right ? { align: "right" } : undefined);
      x += widths[i];
    });
    y += 15;
  };
  const bar = (label: string, value: number, max: number, color: [number, number, number]) => {
    ensure(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(safe(label), M, y + 10, { maxWidth: 190 });
    const w = Math.max(2, (Math.abs(value) / max) * (W - M * 2 - 290));
    doc.setFillColor(...color);
    doc.rect(M + 200, y + 2, w, 10, "F");
    doc.text(safe(money(value, 0)), M + 206 + w, y + 10);
    y += 17;
  };

  text("VA for BnB", 10, { bold: true, color: CORAL });
  text("Short-let profit report", 22, { bold: true });
  text(`${o.date} · ${inp.mode === "detailed" ? `Detailed mode, ${inp.year}` : "Quick mode"} · an estimate at your figures`, 10, { color: MUTED });
  y += 4;
  doc.setDrawColor(...CORAL);
  doc.setLineWidth(2);
  doc.line(M, y, W - M, y);
  y += 14;

  text(`Profit ${money(r.monthly.profit, 0)} a month · ${money(r.annual.profit, 0)} a year`, 18, { bold: true, color: r.status === "loss" ? CORAL : r.status === "thin" ? [107, 74, 0] : GREEN });
  text(`Cash flow ${money(r.monthly.cash, 0)} a month (after mortgage capital repayments)`, 12, { bold: true });
  text(STATUS_LABEL[r.status], 11, { color: MUTED });
  y += 4;
  text(`Break-even occupancy: ${reachText(r.breakEven, (v) => percent(v))} (${marginText(r)})`, 10.5);
  text(`Minimum nightly rate: ${reachText(r.minRate, (v) => money(v))}`, 10.5);
  text(`Profit margin: ${r.kpis.margin === null ? "—" : percent(r.kpis.margin)}`, 10.5);
  text(`Target ${money(r.target.amount, 0)} a month: ${reachText(r.target.rate, (v) => `${money(v)} a night`)} at ${percent(r.occupancy)}, or ${reachText(r.target.occupancy, (v) => percent(v))} occupancy at your rate`, 10.5);

  heading("Key figures");
  const k = r.kpis;
  const kp: [string, string][] = [
    ["Booked nights a year", String(Math.round(k.nights))],
    ["Stays a year", String(Math.round(k.stays))],
    ["ADR", k.adr === null ? "—" : money(k.adr)],
    ["RevPAR", k.revpar === null ? "—" : money(k.revpar)],
    ["Profit per booked night", k.profitPerNight === null ? "—" : money(k.profitPerNight)],
    ["Cost per occupied night", k.costPerNight === null ? "—" : money(k.costPerNight)],
    ["Payback on set-up costs", inp.setupCosts > 0 ? paybackText(k.paybackMonths, k.paybackReached) : "—"],
    ["Cash return", k.cashReturn === null ? "—" : percent(k.cashReturn)],
  ];
  for (const [a, b] of kp) row([a, b], [300, W - M * 2 - 300]);

  heading("Where the money goes");
  const widths = [230, 90, 90, W - M * 2 - 410];
  row(["", "£ a month", "£ a year", "% of booking"], widths, { bold: true, color: MUTED });
  row(["Guest booking value", money(r.monthly.booking), money(r.annual.booking), "100%"], widths, { bold: true });
  for (const l of costLines(r)) row([l.label, money(l.monthly), money(l.monthly * 12), r.monthly.booking > 0 ? `${((l.monthly / r.monthly.booking) * 100).toFixed(1)}%` : "—"], widths);
  row(["Profit", money(r.monthly.profit), money(r.annual.profit), r.monthly.booking > 0 ? `${((r.monthly.profit / r.monthly.booking) * 100).toFixed(1)}%` : "—"], widths, { bold: true });

  heading("Money flow (a month)");
  const steps = moneyFlow(r.monthly);
  const maxFlow = Math.max(1, ...steps.map((s) => Math.abs(s.amount)));
  for (const s of steps) bar(`${s.kind === "minus" ? "- " : ""}${s.label}`, s.amount, maxFlow, s.kind === "minus" ? [253, 205, 205] : s.amount < 0 ? CORAL : s.kind === "start" ? INK : GREEN);

  heading("What moves the needle (a year)");
  const maxLever = Math.max(1, ...levers.map((l) => Math.abs(l.gain)));
  for (const l of levers) bar(leverLine(l, c), l.gain, maxLever, l.gain >= 0 ? GREEN : CORAL);

  if (r.mode === "detailed") {
    heading("Month by month");
    const mw = [90, 80, 90, 90, W - M * 2 - 350];
    row(["Month", "Nights", "Revenue", "Profit", "Cash"], mw, { bold: true, color: MUTED });
    r.months.forEach((m, i) => row([MONTHS[i], m.nights.toFixed(1), money(m.booking, 0), money(m.profit, 0), money(m.cash, 0)], mw, { color: m.profit < 0 ? CORAL : INK }));
  }

  const tax = o.tax;
  if (tax?.available) {
    heading("Tax ESTIMATE");
    text(`${tax.bandLabel}. Taxable property profit ${money(tax.taxable)} a year. Your band is set by your total income; personal allowance and other income are not included.`, 9.5, { color: MUTED });
    const tw = [200, ...tax.columns.map(() => (W - M * 2 - 200) / tax.columns.length)];
    row(["", ...tax.columns.map((x) => x.label)], tw, { bold: true, color: MUTED });
    row(["Tax at your band", ...tax.columns.map((x) => money(x.taxAtBand))], tw);
    row(["Finance cost credit", ...tax.columns.map((x) => money(-x.credit))], tw);
    row(["Estimated tax", ...tax.columns.map((x) => money(x.tax))], tw, { bold: true });
    row(["After-tax profit", ...tax.columns.map((x) => money(x.afterTaxProfit))], tw);
    row(["After-tax cash", ...tax.columns.map((x) => money(x.afterTaxCash))], tw);
    if (tax.note2027) text(tax.note2027, 9.5, { color: MUTED });
  }

  if (o.insights.length) {
    heading("Insights");
    for (const i of o.insights) text(`- ${i.text}`, 10);
  }

  heading("Your inputs");
  for (const [a, b] of inputRows(inp, c)) row([a, b], [300, W - M * 2 - 300]);

  y += 12;
  text(`Figures last checked ${o.checked}. Calculation model v${c.model.version}.`, 9, { color: MUTED });
  text(o.disclaimer, 9, { color: MUTED });

  doc.save(o.fileName);
}

export function downloadProfitCsv(inp: Inputs, r: Result, c: Content, fileName: string) {
  downloadText(fileName, profitCsv(inp, r, c), "text/csv");
}
