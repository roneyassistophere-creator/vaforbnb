import { money } from "@/lib/tools/format";
import { newPdf, PDF_CORAL as CORAL, PDF_INK as INK, PDF_MUTED as MUTED, safePdfText as safe } from "@/lib/tools/pdf";
import { afterTax, compare, fiveYear, timeView, winnerText, type Content, type Inputs } from "@/lib/tools/short-vs-long";

/** The PDF report, made on the visitor's device. */
export async function downloadSvlPdf(inp: Inputs, c: Content, disclaimer: string, fileName: string, date: string) {
  const cmp = compare(inp, c);
  const f = fiveYear(inp, c);
  const t = timeView(inp, cmp);
  const tax = afterTax(inp, cmp.diff, c);
  const doc = await newPdf();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 46;
  let y = M;
  const text = (s: string, size: number, opt: { bold?: boolean; color?: [number, number, number] } = {}) => {
    doc.setFont("helvetica", opt.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opt.color ?? INK));
    for (const line of doc.splitTextToSize(safe(s), W - M * 2)) {
      if (y + size > H - M) {
        doc.addPage();
        y = M;
      }
      doc.text(line, M, y + size);
      y += size + 4;
    }
  };
  const heading = (s: string) => {
    y += 10;
    text(s, 14, { bold: true });
  };
  const row = (a: string, b: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(safe(a), M, y + 10);
    doc.text(safe(b), W - M, y + 10, { align: "right" });
    y += 15;
  };
  text("VA for BnB", 10, { bold: true, color: CORAL });
  text("Short-let vs long-let", 22, { bold: true });
  text(`${date} · on your figures`, 10, { color: MUTED });
  y += 6;
  text(`Short let ${money(cmp.short.net, 0)}/month · Long let ${money(cmp.long.net, 0)}/month`, 15, { bold: true });
  text(winnerText(cmp, c), 12, { bold: true });
  if (cmp.breakEvenRent.ok) text(`A long-let rent of ${money(cmp.breakEvenRent.value)} would match your short-let profit.`, 10.5);
  text(`Short-letting needs to make at least ${money(cmp.minShortProfit)} a month to beat this long let.`, 10.5);
  heading("Long let, a month");
  row("Rent", money(cmp.long.rent));
  row("Void weeks", money(-cmp.long.voidLoss));
  row("Agent fees", money(-cmp.long.agentFee));
  row("Tenant find (spread)", money(-cmp.long.tenantFind));
  row("Landlord costs", money(-cmp.long.landlordCosts));
  row("Costs either way", money(-cmp.long.shared));
  row("Net", money(cmp.long.net), true);
  heading("5 years");
  for (const r of f.rows) row(`Year ${r.year}: difference ${money(r.diff, 0)}`, `cumulative ${money(r.cumulative, 0)}`);
  if (f.payback) text(`Payback of the switching cost: ${f.payback.text}.`, 10);
  if (t.extraPerHour !== null) {
    heading("Your time");
    text(`Short-letting pays you ${money(t.extraPerHour)} for each extra hour of work.`, 10.5);
  }
  heading("After tax (estimate)");
  text(`${tax.label}: ${money(tax.monthly)} a month, ${money(tax.yearly)} a year. ${c.wording.afterTaxNote}`, 10);
  y += 10;
  text(disclaimer, 9, { color: MUTED });
  doc.save(fileName);
}
