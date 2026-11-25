import { validateDraft, cleanStore, type Draft } from "./bookings";
import { isValidDate, nightsBetween } from "./dates";
import { platformName } from "./count";
import type { Booking, NightsResult, Platform, Store } from "./types";

/**
 * Reading and writing files. Everything runs on the visitor's device;
 * nothing is uploaded.
 */

export type PreviewRow = {
  line: number;
  draft: Draft | null;
  /** Ticked to be added. */
  include: boolean;
  /** Why the row can't be added (it's skipped). */
  error?: string;
  /** Why it's unticked by default (e.g. blocked dates). */
  note?: string;
};

/* ---- Platform names ------------------------------------------------------ */

export function normalisePlatform(raw: string): { platform: Platform; otherPlatform?: string } {
  const s = raw.trim().toLowerCase();
  if (!s) return { platform: "other" };
  if (s.includes("airbnb")) return { platform: "airbnb" };
  if (s.includes("booking")) return { platform: "booking" };
  if (s.includes("vrbo") || s.includes("homeaway") || s.includes("expedia")) return { platform: "vrbo" };
  if (s.includes("direct") || s === "website" || s === "own site") return { platform: "direct" };
  return { platform: "other", otherPlatform: raw.trim().slice(0, 60) };
}

/* ---- Dates in files ------------------------------------------------------ */

/** Accepts 2027-05-12, 12/05/2027 or 12-05-2027 (UK order), and 20270512. */
export function parseFileDate(raw: string): string | null {
  const s = raw.trim();
  let y: number, m: number, d: number;
  let r: RegExpExecArray | null;
  if ((r = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s))) [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{4})(\d{2})(\d{2})/.exec(s))) [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else return null;
  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return isValidDate(iso) ? iso : null;
}

/* ---- CSV ----------------------------------------------------------------- */

/** Split CSV text into rows of cells (handles quotes, commas and new lines in quotes). */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === "," || c === ";" || c === "\t") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

const HEADERS: Record<"checkIn" | "checkOut" | "platform" | "reference", RegExp> = {
  checkIn: /^(check[\s-]?in|arrival|start|from)( date)?$/i,
  checkOut: /^(check[\s-]?out|departure|end|to)( date)?$/i,
  platform: /^(platform|channel|source|site)$/i,
  reference: /^(reference|ref|booking( ref(erence)?)?|guest( name)?|name|confirmation( code)?)$/i,
};

/** CSV with columns: check-in, check-out, platform, reference (header row optional). */
export function previewCsv(text: string): PreviewRow[] {
  const rows = parseCsvText(text);
  if (!rows.length) return [];
  let col = { checkIn: 0, checkOut: 1, platform: 2, reference: 3 };
  let start = 0;
  const header = rows[0].map((h) => h.trim());
  if (header.some((h) => HEADERS.checkIn.test(h))) {
    const find = (re: RegExp, fallback: number) => {
      const i = header.findIndex((h) => re.test(h));
      return i >= 0 ? i : fallback;
    };
    col = { checkIn: find(HEADERS.checkIn, 0), checkOut: find(HEADERS.checkOut, 1), platform: find(HEADERS.platform, -1), reference: find(HEADERS.reference, -1) };
    start = 1;
  }
  return rows.slice(start).map((r, i) => {
    const line = start + i + 1;
    const checkIn = parseFileDate(r[col.checkIn] ?? "");
    const checkOut = parseFileDate(r[col.checkOut] ?? "");
    if (!checkIn || !checkOut) return { line, draft: null, include: false, error: "Couldn’t read the dates. Use YYYY-MM-DD or DD/MM/YYYY." };
    const p = normalisePlatform(col.platform >= 0 ? (r[col.platform] ?? "") : "");
    const draft: Draft = { checkIn, checkOut, ...p, reference: col.reference >= 0 ? (r[col.reference] ?? "").trim() : "" };
    const errors = validateDraft(draft);
    const error = errors.checkOut ?? errors.checkIn ?? errors.platform;
    return error ? { line, draft: null, include: false, error } : { line, draft, include: true };
  });
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Bookings for one property and year, with the nights counted in that year. */
export function bookingsCsv(bookings: Booking[], result: NightsResult, propertyName: string): string {
  const head = ["Property", "Check-in", "Check-out", "Platform", "Reference", "Note", "Total nights", `Nights in ${result.year}`, `Nights counted in ${result.year}`, "Flags"];
  const sorted = [...bookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const lines = [head.map(csvCell).join(",")];
  for (const b of sorted) {
    const n = result.perBooking[b.id];
    if (!n) continue;
    const flags = [n.longStay ? "Long stay: not counted" : "", n.overlapsWith.length ? "Overlaps another booking" : ""].filter(Boolean).join("; ");
    lines.push(
      [propertyName, b.checkIn, b.checkOut, platformName(b), b.reference ?? "", b.note ?? "", n.total, n.inYear, n.counted, flags].map(csvCell).join(","),
    );
  }
  lines.push(["", "", "", "", "", "", "", "Total counted", result.used, ""].map(csvCell).join(","));
  return lines.join("\r\n") + "\r\n";
}

/* ---- Calendar files (.ics) ------------------------------------------------ */

const BLOCKED = /not available|unavailable|blocked|closed|owner (stay|block)|maintenance/i;

/** Read a calendar export. Blocked / "not available" entries are unticked by default. */
export function previewIcs(text: string): PreviewRow[] {
  const unfolded = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const prodId = lines.find((l) => l.startsWith("PRODID"))?.toLowerCase() ?? "";
  const rows: PreviewRow[] = [];
  let ev: Record<string, string> | null = null;
  let n = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") ev = {};
    else if (line === "END:VEVENT" && ev) {
      n++;
      const checkIn = parseFileDate((ev.DTSTART ?? "").replace(/^.*:/, ""));
      const checkOut = parseFileDate((ev.DTEND ?? "").replace(/^.*:/, ""));
      const summary = (ev.SUMMARY ?? "").replace(/\\,/g, ",").replace(/\\n/gi, " ").trim();
      const desc = (ev.DESCRIPTION ?? "").replace(/\\n/gi, " ");
      const source = `${prodId} ${(ev.UID ?? "").toLowerCase()} ${summary.toLowerCase()} ${desc.toLowerCase()}`;
      const platform = normalisePlatform(source).platform === "other" ? "other" : normalisePlatform(source).platform;
      if (!checkIn || !checkOut) {
        rows.push({ line: n, draft: null, include: false, error: "This entry has no usable dates." });
      } else {
        const ref = /^(reserved|airbnb|booking|blocked|not available|closed)/i.test(summary) ? (/(HM[A-Z0-9]{8})/.exec(desc)?.[1] ?? "") : summary;
        const draft: Draft = { checkIn, checkOut, platform, reference: ref.slice(0, 120), note: summary && ref !== summary ? summary.slice(0, 120) : "" };
        const errors = validateDraft(draft);
        const error = errors.checkOut ?? errors.checkIn;
        if (error) rows.push({ line: n, draft: null, include: false, error });
        else if (BLOCKED.test(summary)) rows.push({ line: n, draft, include: false, note: "Looks like blocked dates, not a guest stay. Tick it only if guests stayed." });
        else rows.push({ line: n, draft, include: true });
      }
      ev = null;
    } else if (ev) {
      const i = line.indexOf(":");
      if (i > 0) {
        const name = line.slice(0, i).split(";")[0].toUpperCase();
        ev[name] = name === "DTSTART" || name === "DTEND" ? line : line.slice(i + 1);
      }
    }
  }
  return rows;
}

/* ---- Backup -------------------------------------------------------------- */

export const BACKUP_APP = "vaforbnb-london-90-night-counter";

export function makeBackup(store: Store, exportedAt: string): string {
  return JSON.stringify({ app: BACKUP_APP, version: 1, exportedAt, data: store }, null, 2);
}

export function readBackup(text: string): { ok: true; store: Store } | { ok: false; error: string } {
  try {
    const o = JSON.parse(text) as { app?: string; data?: unknown };
    if (o.app !== BACKUP_APP) return { ok: false, error: "This isn’t a backup from the London 90-night counter." };
    const store = cleanStore(o.data);
    return store ? { ok: true, store } : { ok: false, error: "The backup file is empty or damaged." };
  } catch {
    return { ok: false, error: "Couldn’t read this file. Choose the .json backup you downloaded." };
  }
}

/** Nights shown in a preview row. */
export const previewNights = (r: PreviewRow) => (r.draft ? nightsBetween(r.draft.checkIn, r.draft.checkOut) : 0);
