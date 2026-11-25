/**
 * Spreadsheet-safe CSV, shared by the builder tools.
 * - UTF-8 byte-order mark (optional) so accented names open correctly in Excel.
 * - Fields with commas, quotes or line breaks are quoted; quotes are doubled.
 * - Values starting with =, +, - or @ get a leading apostrophe so formulas can't run.
 * - CRLF line endings.
 */
export const BOM = "﻿";

export function csvCell(value: string): string {
  let v = value ?? "";
  if (/^[=+\-@]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(header: string[], rows: string[][], opts: { bom?: boolean } = {}): string {
  const body = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
  return (opts.bom ? BOM : "") + body;
}

/** Split CSV text back into rows (handles quotes); used by tests and imports. */
export function parseCsv(text: string): string[][] {
  const t = text.startsWith(BOM) ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const endCell = () => {
    row.push(cell);
    cell = "";
  };
  const endRow = () => {
    endCell();
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"' && t[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") endCell();
    else if (c === "\r" && t[i + 1] === "\n") {
      endRow();
      i++;
    } else if (c === "\n") endRow();
    else cell += c;
  }
  if (cell !== "" || row.length) endRow();
  return rows;
}
