/**
 * Plain calendar dates ("YYYY-MM-DD"). Every calculation turns a date into a
 * whole day number and back, so clock changes and time zones can never add
 * or lose a night.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** Is this a real calendar date (e.g. not 2027-02-30)? */
export function isValidDate(iso: string | undefined | null): iso is string {
  const m = iso ? ISO.exec(iso) : null;
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= daysInMonth(y, mo);
}

export const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysInMonth = (y: number, m: number) => [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export const daysInYear = (y: number) => (isLeapYear(y) ? 366 : 365);

/** Whole day number for a calendar date (pure date arithmetic, no time of day). */
export function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function fromDayNumber(n: number): string {
  const dt = new Date(n * DAY_MS);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

export const addDays = (iso: string, n: number) => fromDayNumber(dayNumber(iso) + n);
/** Nights from check-in to check-out (check-out day not included). */
export const nightsBetween = (checkIn: string, checkOut: string) => dayNumber(checkOut) - dayNumber(checkIn);
export const yearOf = (iso: string) => Number(iso.slice(0, 4));

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON = MONTHS.map((m) => m.slice(0, 3));
export const monthName = (m: number) => MONTHS[m - 1];

/** "12 May 2027" */
export function formatLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "12 May" */
export function formatShort(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m - 1]}`;
}

/** "12–16 May", "30 Dec–3 Jan" (adds years when they differ from `year`). */
export function formatRange(a: string, b: string, year?: number) {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  const showYear = year !== undefined && (ya !== year || yb !== year);
  if (ya === yb && ma === mb) return `${da}–${db} ${MON[ma - 1]}${showYear ? ` ${ya}` : ""}`;
  const left = `${da} ${MON[ma - 1]}${showYear ? ` ${ya}` : ""}`;
  const right = `${db} ${MON[mb - 1]}${showYear ? ` ${yb}` : ""}`;
  return `${left}–${right}`;
}

/** Collapse a sorted list of dates into ranges: "6–7 May, 9 May". */
export function formatDateList(dates: string[]) {
  const ranges: [string, string][] = [];
  for (const d of dates) {
    const last = ranges[ranges.length - 1];
    if (last && dayNumber(d) - dayNumber(last[1]) === 1) last[1] = d;
    else ranges.push([d, d]);
  }
  return ranges.map(([a, b]) => (a === b ? formatShort(a) : formatRange(a, b))).join(", ");
}

/**
 * Calendar-month arithmetic. If the day doesn't exist in the target month,
 * the last day of that month is used: 31 Jan + 1 month = 28 Feb (29 in a leap
 * year); 29 Feb 2024 + 12 months = 28 Feb 2025. Negative months go back.
 */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  const p = (x: number) => String(x).padStart(2, "0");
  return `${ny}-${p(nm)}-${p(Math.min(d, daysInMonth(ny, nm)))}`;
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export const daysBetween = (from: string, to: string) => dayNumber(to) - dayNumber(from);

/** "20 Dec 2026" */
export function formatMedium(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m - 1]} ${y}`;
}

/** "15/01/2026" */
export function formatDmy(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Read a typed date: DD/MM/YYYY (also with - or . and 1-digit day or month)
 * or YYYY-MM-DD. Returns an ISO date, or null if it isn't a real date.
 */
export function parseTypedDate(text: string): string | null {
  const t = text.trim();
  let iso: string | null = null;
  const dmy = /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/.exec(t);
  if (dmy) iso = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) iso = t;
  return iso && isValidDate(iso) ? iso : null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** "Sat 8 Aug 2026", or "Fri 24 Jul" without the year. */
export function formatWeekday(iso: string, withYear = true) {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${wd} ${d} ${MON[m - 1]}${withYear ? ` ${y}` : ""}`;
}

/** "Jan 2027" */
export function formatMonthYear(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MON[m - 1]} ${y}`;
}
