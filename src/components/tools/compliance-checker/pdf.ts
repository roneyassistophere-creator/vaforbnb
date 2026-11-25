import { groupLabels, groupOrder, summaryLine, type ComplianceResult } from "@/lib/tools/compliance";

/** Standard PDF fonts can't draw some characters; swap them for safe ones. */
const safe = (s: string) => s.replace(/→/g, "->").replace(/[✓✔]/g, "").replace(/ /g, " ");

type PdfOptions = {
  brandName: string;
  heading: string;
  createdLabel: string;
  rulesCheckedLabel: string;
  siteUrl: string;
  rulesHubPath: string;
  disclaimer: string;
  fileName: string;
};

/** Build the checklist PDF on the visitor's device and download it. */
export async function downloadChecklistPdf(result: ComplianceResult, o: PdfOptions) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const width = W - M * 2;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const write = (text: string, size: number, style: "normal" | "bold", color: [number, number, number], indent = 0, gap = 4) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(safe(text), width - indent) as string[];
    const lh = size * 1.35;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M + indent, y + size);
      y += lh;
    }
    y += gap;
  };

  const ink: [number, number, number] = [20, 33, 43];
  const body: [number, number, number] = [58, 70, 80];
  const coral: [number, number, number] = [184, 56, 58];
  const groupColor: Record<string, [number, number, number]> = {
    "must-do": [184, 56, 58],
    "coming-soon": [107, 74, 0],
    "check-contract": [58, 70, 80],
  };

  // Header
  doc.setFillColor(240, 89, 90);
  doc.roundedRect(M, y, 22, 22, 5, 5, "F");
  write(o.brandName, 14, "bold", ink, 30, 0);
  y = M + 34;
  write(o.heading, 20, "bold", ink, 0, 2);
  write(`${o.createdLabel} · ${o.rulesCheckedLabel}`, 10, "normal", body, 0, 2);
  write(summaryLine(result), 12, "bold", body, 0, 12);

  for (const g of groupOrder) {
    const list = result.groups[g];
    if (!list.length) continue;
    ensure(40);
    write(`${groupLabels[g]} (${list.length})`, 14, "bold", groupColor[g], 0, 6);
    for (const r of list) {
      ensure(60);
      write(`[ ]  ${r.title}`, 12, "bold", ink, 0, 2);
      write(r.summary, 10, "normal", body, 18, 3);
      for (const step of r.whatToDo) write(`- ${step}`, 10, "normal", body, 28, 1);
      write(`Source: ${r.source.title}${r.source.url ? ` (${r.source.url})` : ""}`, 9, "normal", body, 18, 1);
      write(`Details: ${o.siteUrl}${o.rulesHubPath}#${r.rulesHubAnchor}`, 9, "normal", coral, 18, 10);
    }
    y += 4;
  }

  ensure(40);
  write(o.disclaimer, 9, "normal", body, 0, 0);
  doc.save(o.fileName);
}
