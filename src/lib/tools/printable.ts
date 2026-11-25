/**
 * Print-ready A4 documents, made on the visitor's device. Shared by the
 * builder tools (guest register, welcome guide, house rules, checklists).
 * Returns a complete HTML document: print it with `printHtml`, or save it.
 */

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export type PrintableOptions = {
  title: string;
  /** Small line under the title, e.g. property and date range. */
  subtitle?: string;
  orientation?: "portrait" | "landscape";
  /** Trusted HTML for the body (escape any user text with escapeHtml). */
  body: string;
  /** Footer note on every page. */
  footer?: string;
  brand?: string;
};

export function printableDocument(o: PrintableOptions): string {
  const brand = escapeHtml(o.brand ?? "VA for BnB");
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(o.title)}</title>
<style>
  @page { size: A4 ${o.orientation ?? "portrait"}; margin: 14mm 12mm 16mm;
    @bottom-left { content: "${(o.footer ?? "").replace(/"/g, "'")}"; font: 8pt Manrope, Arial, sans-serif; color: #5f6b75; }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt Manrope, Arial, sans-serif; color: #5f6b75; } }
  * { box-sizing: border-box; }
  body { margin: 0; font: 10pt/1.4 Manrope, Arial, Helvetica, sans-serif; color: #14212b; background: #fff; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #14212b; padding-bottom: 6pt; margin-bottom: 10pt; }
  .brand { font-weight: 800; font-size: 11pt; } .brand span { color: #f0595a; }
  h1 { margin: 0; font-size: 16pt; letter-spacing: -0.3pt; }
  .sub { margin: 2pt 0 0; color: #3a4650; font-size: 9pt; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #b9c1c8; padding: 5pt 6pt; text-align: left; vertical-align: top; }
  th { background: #f2f4f6; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.3pt; }
  tr { break-inside: avoid; }
  .blank td { height: 22pt; }
  .note { margin-top: 10pt; font-size: 8.5pt; color: #3a4650; }
  .box { border: 2px solid #14212b; border-radius: 6pt; padding: 10pt 12pt; margin-top: 12pt; }
  .box.extra { border-style: dashed; border-color: #b8383a; }
  .box h2 { margin: 0 0 6pt; font-size: 11pt; }
  .line { border-bottom: 1px solid #5f6b75; height: 24pt; margin-bottom: 6pt; position: relative; }
  .line span { position: absolute; left: 0; bottom: 3pt; font-size: 8pt; color: #5f6b75; }
  .example td { color: #8e2729; font-style: italic; }
  .foot { margin-top: 12pt; font-size: 8pt; color: #5f6b75; }
  @media screen { body { padding: 16px; } }
</style>
</head>
<body>
<div class="head"><div><h1>${escapeHtml(o.title)}</h1>${o.subtitle ? `<p class="sub">${escapeHtml(o.subtitle)}</p>` : ""}</div><div class="brand">${brand.replace("BnB", "<span>BnB</span>")}</div></div>
${o.body}
${o.footer ? `<p class="foot">${escapeHtml(o.footer)}</p>` : ""}
</body>
</html>`;
}

/** An HTML table from a header and rows (cells are escaped). */
export function htmlTable(header: string[], rows: string[][], opts: { className?: string; rowClass?: (i: number) => string } = {}): string {
  const head = `<tr>${header.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`;
  const body = rows.map((r, i) => `<tr${opts.rowClass?.(i) ? ` class="${opts.rowClass(i)}"` : ""}>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("");
  return `<table${opts.className ? ` class="${opts.className}"` : ""}><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

/** Print a document from a hidden frame (browser only). Nothing is uploaded. */
export function printHtml(html: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}
