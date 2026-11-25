import type { Content, Score } from "@/lib/tools/ai-readiness";
import { newPdf, PDF_INK, PDF_MUTED, PDF_VIOLET, safePdfText as safe } from "@/lib/tools/pdf";

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/**
 * AI-readiness report: score, band, the 8 checks with reasons, top fixes and
 * quick wins. Made on the visitor's device; the listing text isn't included.
 */
export async function downloadReportPdf(s: Score, content: Content, fileName: string, opts: { date: string; brand?: string }) {
  const doc = await newPdf();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 50;
  let y = M;
  const ensure = (h: number) => {
    if (y + h > H - M - 20) {
      doc.addPage();
      y = M;
    }
  };
  const para = (text: string, size: number, color: [number, number, number] = PDF_INK, bold = false, indent = 0, lh = size * 1.4) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(safe(text), W - M * 2 - indent);
    ensure(lines.length * lh);
    lines.forEach((l: string, n: number) => doc.text(l, M + indent, y + n * lh));
    y += lines.length * lh;
  };

  doc.setFillColor(...PDF_VIOLET);
  doc.rect(0, 0, W, 8, "F");
  y = 62;
  para("AI-readiness report", 22, PDF_INK, true);
  para(`${opts.date} · Scoring model v${s.version}`, 10, PDF_MUTED);
  y += 14;

  // Score + band
  const band = hex(s.band.fg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(...PDF_INK);
  doc.text(`${s.total}`, M, y + 32);
  const sw = doc.getTextWidth(`${s.total}`);
  doc.setFontSize(16);
  doc.setTextColor(...PDF_MUTED);
  doc.text("/ 100", M + sw + 6, y + 32);
  doc.setFillColor(...hex(s.band.bg));
  doc.roundedRect(M + sw + 60, y + 12, 110, 26, 13, 13, "F");
  doc.setFontSize(12);
  doc.setTextColor(...band);
  doc.text(safe(s.band.label), M + sw + 115, y + 29, { align: "center" });
  y += 56;
  para("Scores readiness (clear, specific facts), not ranking. Airbnb hasn't published how its AI search matches or ranks listings.", 9.5, PDF_MUTED);
  y += 14;

  // Top fixes
  para(s.fixes.length ? "Your top fixes" : "No fixes left: every check has full points.", 14, PDF_INK, true);
  y += 4;
  s.fixes.forEach((f, n) => {
    ensure(60);
    para(`${n + 1}. ${f.name} (+${f.points} points available)`, 11.5, PDF_VIOLET, true);
    para(f.action, 11, PDF_INK, false, 14);
    if (f.example) para(`Example: ${f.example}`, 10, PDF_MUTED, false, 14);
    y += 8;
  });

  if (s.quickWins.length) {
    y += 4;
    para("Quick wins", 14, PDF_INK, true);
    y += 2;
    for (const q of s.quickWins) para(`[ ]  ${q.text}`, 10.5, PDF_INK, false, 0, 15);
  }

  // Breakdown
  y += 14;
  para("Score breakdown", 14, PDF_INK, true);
  y += 4;
  for (const c of s.checks) {
    ensure(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(...PDF_INK);
    doc.text(safe(`${c.id}. ${c.name}`), M, y);
    doc.text(`${c.points} / ${c.max}`, W - M, y, { align: "right" });
    y += 16;
    for (const r of c.reasons) para(`${r.text}: ${r.points >= 0 ? "+" : "-"}${Math.abs(r.points)}`, 9.5, PDF_MUTED, false, 12, 13);
    y += 8;
  }

  y += 6;
  para(
    "Price, photos, reviews, responsiveness and availability still matter, and this tool can't see them. A high score doesn't guarantee a ranking or bookings.",
    9,
    PDF_MUTED,
  );
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_MUTED);
    doc.text(safe(`Made on your device with the free AI-readiness listing scorer from ${opts.brand ?? "VA for BnB"} · ${content.source.title}`), M, H - 28);
  }
  doc.save(fileName);
}
