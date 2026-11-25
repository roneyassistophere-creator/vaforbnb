/**
 * Shared PDF basics for the tools (jsPDF, loaded only when a PDF is made).
 * PDFs are always made on the visitor's device.
 */

/** Standard PDF fonts can't draw curly quotes, some dashes or symbols; swap them for safe ones. */
export const safePdfText = (s: string) =>
  s
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/−/g, "-")
    .replace(/…/g, "...")
    .replace(/²/g, "2")
    .replace(/✓/g, "+")
    .replace(/✗/g, "x")
    .replace(/ /g, " ");

export const PDF_INK: [number, number, number] = [20, 33, 43];
export const PDF_CORAL: [number, number, number] = [240, 89, 90];
export const PDF_MUTED: [number, number, number] = [95, 107, 117];
export const PDF_VIOLET: [number, number, number] = [91, 63, 160];

export async function newPdf() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ unit: "pt", format: "a4" });
}

export type Pdf = Awaited<ReturnType<typeof newPdf>>;
