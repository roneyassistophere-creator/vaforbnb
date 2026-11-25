import type { Line, Rules } from "@/lib/tools/house-rules";
import { newPdf as newDoc, PDF_CORAL as CORAL, PDF_INK as INK, PDF_MUTED as MUTED, safePdfText as safe } from "@/lib/tools/pdf";

/** Full house rules: headings and bullets, A4, made on the visitor's device. */
export async function downloadRulesPdf(r: Rules, fileName: string, brand = "VA for BnB") {
  const doc = await newDoc();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  let y = M;
  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  for (const l of doc.splitTextToSize(safe(r.title), W - M * 2)) {
    doc.text(l, M, y + 20);
    y += 28;
  }
  doc.setDrawColor(...CORAL);
  doc.setLineWidth(2);
  doc.line(M, y + 2, M + 60, y + 2);
  y += 26;
  for (const s of r.sections) {
    ensure(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(safe(s.heading), M, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11.5);
    for (const line of s.lines) {
      const wrapped = doc.splitTextToSize(safe(line.text), W - M * 2 - 16);
      ensure(wrapped.length * 16 + 4);
      doc.setFillColor(...CORAL);
      doc.circle(M + 4, y - 4, 2, "F");
      wrapped.forEach((w: string, i: number) => doc.text(w, M + 16, y + i * 16));
      y += wrapped.length * 16 + 4;
    }
    y += 10;
  }
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(safe(`Made with the free House rules generator from ${brand}`), M, H - 30);
  doc.save(fileName);
}

/* ---- Printable sign: large type and simple line icons ------------------ */

type Doc = Awaited<ReturnType<typeof newDoc>>;

function icon(doc: Doc, kind: string | undefined, x: number, y: number, s: number) {
  const c = { x: x + s / 2, y: y + s / 2 };
  doc.setDrawColor(...INK);
  doc.setLineWidth(2);
  switch (kind) {
    case "clock":
      doc.circle(c.x, c.y, s / 2 - 2);
      doc.line(c.x, c.y, c.x, c.y - s / 3.2);
      doc.line(c.x, c.y, c.x + s / 4, c.y);
      break;
    case "people":
      doc.circle(c.x - s / 6, c.y - s / 6, s / 8);
      doc.circle(c.x + s / 6, c.y - s / 6, s / 8);
      doc.line(c.x - s / 2.6, c.y + s / 3, c.x - s / 2.6 + s / 3.6, c.y + s / 3);
      doc.line(c.x + s / 2.6 - s / 3.6, c.y + s / 3, c.x + s / 2.6, c.y + s / 3);
      doc.line(c.x - s / 2.6, c.y + s / 3, c.x - s / 6, c.y + s / 30);
      doc.line(c.x - s / 6, c.y + s / 30, c.x - s / 2.6 + s / 3.6, c.y + s / 3);
      doc.line(c.x + s / 2.6 - s / 3.6, c.y + s / 3, c.x + s / 6, c.y + s / 30);
      doc.line(c.x + s / 6, c.y + s / 30, c.x + s / 2.6, c.y + s / 3);
      break;
    case "moon":
      doc.circle(c.x, c.y, s / 2.6);
      doc.setFillColor(255, 255, 255);
      doc.circle(c.x + s / 6, c.y - s / 8, s / 3, "F");
      break;
    case "paw":
      doc.circle(c.x, c.y + s / 8, s / 5);
      [-0.3, -0.1, 0.1, 0.3].forEach((dx, i) => doc.circle(c.x + dx * s, c.y - s / 5 + (i === 0 || i === 3 ? s / 10 : 0), s / 14));
      break;
    case "bin":
      doc.rect(c.x - s / 4, c.y - s / 6, s / 2, s / 2.2);
      doc.line(c.x - s / 3, c.y - s / 6, c.x + s / 3, c.y - s / 6);
      doc.line(c.x - s / 12, c.y - s / 4, c.x + s / 12, c.y - s / 4);
      break;
    case "no":
    default:
      doc.circle(c.x, c.y, s / 2 - 2);
      doc.line(c.x - s / 3, c.y + s / 3, c.x + s / 3, c.y - s / 3);
  }
}

/** A4 portrait sign: property name, the key rules with icons, "Need help? Message us". */
export async function downloadSignPdf(title: string, lines: Line[], fileName: string) {
  const doc = await newDoc();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 50;
  doc.setFillColor(...CORAL);
  doc.rect(0, 0, W, 10, "F");
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  const t = doc.splitTextToSize(safe(title), W - M * 2);
  t.forEach((l: string, i: number) => doc.text(l, M, 70 + i * 34));
  let y = 70 + t.length * 34 + 20;
  const gap = Math.min(78, (H - y - 120) / Math.max(lines.length, 1));
  doc.setFontSize(17);
  for (const l of lines) {
    icon(doc, l.icon, M, y - 4, 34);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(safe(l.text), W - M * 2 - 56);
    wrapped.slice(0, 3).forEach((w: string, i: number) => doc.text(w, M + 52, y + 16 + i * 21));
    y += Math.max(gap, wrapped.length * 21 + 16);
  }
  doc.setDrawColor(...INK);
  doc.setLineWidth(1);
  doc.line(M, H - 92, W - M, H - 92);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Need help? Message us.", M, H - 58);
  doc.save(fileName);
}
