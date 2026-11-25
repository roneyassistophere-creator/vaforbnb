/**
 * Stored figures shared by every tool: thresholds, caps, rates and dates.
 * Values live in the `figures` database table (seeded from
 * src/data/figures.seed.ts) and are never typed into the interface.
 */

/**
 * A text value, an ISO date ("2027-03-31"), a number, a list of numbers, a
 * dated rate, or a small lookup table (e.g. a tag per nation).
 */
export type FigureValue = string | number | number[] | { rate: string; start: string } | Record<string, string> | JsonContent;

/** Structured stored content (rule templates, word lists…): any JSON, validated by the tool that reads it. */
export type JsonContent = { json: unknown };

export type Figure = {
  key: string;
  value: FigureValue;
  /** "days", "%", "date", "years"… */
  unit?: string | null;
  label?: string | null;
  sourceTitle: string;
  sourceUrl: string | null;
  lastChecked: string;
  /** Confirm before launch. */
  verify: boolean;
};

export type Figures = Record<string, Figure>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDate = (v: unknown): v is string => typeof v === "string" && ISO_DATE.test(v);

/** "2027-03-31" → "31 March 2027". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Today's date in the UK (Europe/London) as YYYY-MM-DD. */
export function londonToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** "2, 3" → "2 or 3". */
const orList = (n: number[]) => (n.length > 1 ? `${n.slice(0, -1).join(", ")} or ${n[n.length - 1]}` : String(n[0] ?? ""));

/** How a figure reads in text. ISO dates become "31 March 2027"; [2, 3] becomes "2 or 3". */
export function displayFigure(value: FigureValue): string {
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return orList(value);
  if (typeof value === "string") return isIsoDate(value) ? formatDate(value) : value;
  if ("json" in value) return "";
  if (typeof value.rate === "string" && typeof value.start === "string") return `${value.rate} from ${formatDate(value.start)}`;
  return Object.entries(value)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}

/** Structured content stored as `{ json: ... }`. Throws if missing, so a bad edit is caught loudly. */
export function jsonFigure<T>(figures: Figures, key: string): T {
  const v = figures[key]?.value;
  if (v && typeof v === "object" && !Array.isArray(v) && "json" in v) return v.json as T;
  throw new Error(`Figure "${key}" is missing or isn't structured content.`);
}

/** A lookup-table figure, e.g. { scotland: "required", england: "recommended" }. */
export function mapFigure(figures: Figures, key: string): Record<string, string> {
  const v = figures[key]?.value;
  if (v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every((x) => typeof x === "string")) return v as Record<string, string>;
  throw new Error(`Figure "${key}" is missing or isn't a lookup table.`);
}

/**
 * Replace {tokens} in text. `extra` tokens win over figures; unknown tokens
 * are left as-is so a missing figure is easy to spot.
 */
export function fillTemplate(text: string, figures: Figures, extra: Record<string, string> = {}): string {
  return text.replace(/\{([A-Za-z0-9._-]+)\}/g, (match, key: string) => {
    if (key in extra) return extra[key];
    const f = figures[key];
    return f ? displayFigure(f.value) : match;
  });
}

/** A numeric figure. Throws if it's missing or not a number, so a bad edit is caught loudly. */
export function numberFigure(figures: Figures, key: string): number {
  const v = figures[key]?.value;
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  if (!Number.isFinite(n)) throw new Error(`Figure "${key}" is missing or isn't a number.`);
  return n;
}

/** A list-of-numbers figure, e.g. averaging years [2, 3]. */
export function numberListFigure(figures: Figures, key: string): number[] {
  const v = figures[key]?.value;
  if (Array.isArray(v) && v.every((x) => Number.isFinite(x))) return v;
  if (typeof v === "number") return [v];
  throw new Error(`Figure "${key}" is missing or isn't a list of numbers.`);
}

/** Pick some figures by key (to send only what a tool needs to the browser). */
export function pickFigures(figures: Figures, keys: string[]): Figures {
  return Object.fromEntries(keys.filter((k) => figures[k]).map((k) => [k, figures[k]]));
}
