import { newPdf, PDF_CORAL as CORAL, PDF_INK as INK, PDF_MUTED as MUTED, safePdfText as safe } from "@/lib/tools/pdf";
import { escapeHtml, printableDocument, printHtml } from "@/lib/tools/printable";
import type { ListState, Shot } from "@/lib/tools/photo-shot-list";

type Prep = { key: string; title: string; items: { id: string; text: string }[] }[];

/**
 * Shot list PDF, A4, made on the visitor's device: a first-five summary,
 * numbered shots with tick boxes, what to show and captions, then a prep
 * checklist page. Nothing is uploaded.
 */
export async function downloadShotListPdf(shots: Shot[], st: ListState, prep: Prep, opts: { fileName: string; property: string; date: string; brand?: boolean }) {
  const doc = await newPdf();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
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

  if (opts.brand !== false) text("VA for BnB", 10, { bold: true, color: CORAL });
  text("Photo shot list", 24, { bold: true });
  text([opts.property.trim(), opts.date].filter(Boolean).join(" · "), 11, { color: MUTED });
  y += 6;
  doc.setDrawColor(...CORAL);
  doc.setLineWidth(2);
  doc.line(M, y, W - M, y);
  y += 16;

  text("Your first five", 14, { bold: true });
  shots.slice(0, 5).forEach((x, i) => text(`${i + 1}. ${x.area}${i === 0 ? " (cover photo)" : ""}`, 11));
  y += 8;
  text(`${shots.length} shots. Upload in this order and paste each caption.`, 10, { color: MUTED });
  y += 10;

  for (const x of shots) {
    ensure(70);
    doc.setDrawColor(...INK);
    doc.setLineWidth(1);
    doc.rect(M, y + 2, 11, 11);
    if (st.taken.includes(x.id)) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("x", M + 3, y + 11);
    }
    const head = `${x.position}. ${x.area}${x.isFirstFive ? "  (first five)" : ""}${x.honestyShot ? "  (honesty shot)" : ""}`;
    text(head, 12, { bold: true, x: M + 20 });
    text(`${x.shotTypeLabel}, ${x.orientation.toLowerCase()}`, 9, { color: MUTED, x: M + 20 });
    for (const w of x.whatToShow) text(`- ${w}`, 10, { x: M + 20 });
    if (x.caption) text(`Caption: ${x.caption}`, 10, { x: M + 20, color: [58, 70, 80] });
    if (x.bestLight) text(`Best light: ${x.bestLight}`, 9, { x: M + 20, color: MUTED });
    y += 8;
  }

  doc.addPage();
  y = M;
  text("Prep checklist", 20, { bold: true });
  y += 6;
  for (const sec of prep) {
    ensure(40);
    text(sec.title, 12, { bold: true });
    for (const i of sec.items) {
      ensure(16);
      doc.setDrawColor(...INK);
      doc.rect(M, y + 2, 9, 9);
      text(i.text, 10, { x: M + 16 });
    }
    y += 6;
  }

  doc.save(opts.fileName);
}

/** Printable A4 shot list (browser print, or save as PDF from the print dialog). */
export function printShotList(shots: Shot[], st: ListState, prep: Prep, property: string) {
  const e = escapeHtml;
  const body = `
    <h2>Your first five</h2>
    <ol>${shots
      .slice(0, 5)
      .map((x, i) => `<li>${e(x.area)}${i === 0 ? " (cover photo)" : ""}</li>`)
      .join("")}</ol>
    <h2>Shot list</h2>
    ${shots
      .map(
        (x) => `<div class="shot" style="break-inside:avoid;border-top:1px solid #ddd;padding:6px 0">
      <p style="margin:0;font-weight:700">${st.taken.includes(x.id) ? "☑" : "☐"} ${x.position}. ${e(x.area)}${x.isFirstFive ? " · first five" : ""}${x.honestyShot ? " · honesty shot" : ""}</p>
      <ul style="margin:4px 0">${x.whatToShow.map((w) => `<li>${e(w)}</li>`).join("")}</ul>
      ${x.caption ? `<p style="margin:0"><em>Caption:</em> ${e(x.caption)}</p>` : ""}
    </div>`,
      )
      .join("")}
    <h2 style="break-before:page">Prep checklist</h2>
    ${prep.map((s) => `<h3>${e(s.title)}</h3><ul style="list-style:none;padding:0">${s.items.map((i) => `<li>☐ ${e(i.text)}</li>`).join("")}</ul>`).join("")}`;
  printHtml(printableDocument({ title: "Photo shot list", subtitle: property.trim() || undefined, body, footer: "Made with VA for BnB’s photo shot list planner. Photos must show the property accurately." }));
}
