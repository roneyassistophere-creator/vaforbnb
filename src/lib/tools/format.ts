/** UK-style text formatting shared by the builder tools. */

/** "15:00" → "3pm", "11:00" → "11am", "12:00" → "12 noon", "00:00" → "midnight", "22:30" → "10.30pm". */
export function formatTime(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return hhmm;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h === 0 && min === 0) return "midnight";
  if (h === 12 && min === 0) return "12 noon";
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${min ? `.${String(min).padStart(2, "0")}` : ""}${suffix}`;
}

/** "22:00", "08:00" → "10pm to 8am" */
export const formatTimeRange = (from: string, to: string) => `${formatTime(from)} to ${formatTime(to)}`;

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
/** 1–9 in words, other numbers as digits. */
export const numberWord = (n: number) => (Number.isInteger(n) && n >= 0 && n <= 9 ? WORDS[n] : String(n));

/** ["front door", "driveway", "garden"] → "front door, driveway and garden" */
export function joinList(items: string[], word = "and"): string {
  const xs = items.map((s) => s.trim()).filter(Boolean);
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} ${word} ${xs[xs.length - 1]}`;
}

/** First letter lower-case, for joining phrases into a sentence ("Load the dishwasher" → "load the dishwasher"). */
export const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/** "£1,139.60" (dp 2) or "£1,140" (dp 0). Negative values get a leading minus: "−£56.53". */
export function money(n: number, dp: 0 | 2 = 2): string {
  const s = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: dp, maximumFractionDigits: dp }).format(Math.abs(n));
  return n < 0 && Math.abs(n) >= (dp === 0 ? 0.5 : 0.005) ? `−${s}` : s;
}

/** "49.7%" from a decimal (0.497). */
export const percent = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;
