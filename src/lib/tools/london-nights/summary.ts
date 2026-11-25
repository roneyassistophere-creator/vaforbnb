import { formatLong, formatRange } from "./dates";
import type { Booking, NightsResult } from "./types";

/** Status pill text. */
export function statusText(r: NightsResult): string {
  switch (r.status) {
    case "ok":
      return `${r.left} ${r.left === 1 ? "night" : "nights"} left this year`;
    case "approaching":
      return `Getting close: ${r.left} ${r.left === 1 ? "night" : "nights"} left`;
    case "reached":
      return `You’ve reached ${r.limit} nights`;
    case "over":
      return `Over by ${r.overBy} ${r.overBy === 1 ? "night" : "nights"}`;
  }
}

/** "What this means", chosen by the result. */
export function whatThisMeans(r: NightsResult | null, hasBookings: boolean): string {
  if (!r || !hasBookings) return "Add every booking for the year, from every platform and direct, to see how many of your nights you’ve used.";
  const main = {
    ok: `You have ${r.left} ${r.left === 1 ? "night" : "nights"} left this year. Keep adding every booking, including direct ones, so the count stays accurate.`,
    approaching: `You’re close to the limit. Consider longer stays of ${r.longStayMin}+ nights, or plan which dates to keep for short stays.`,
    reached: `You’ve used all ${r.limit} nights. More short stays this year would need planning permission from your borough.`,
    over: `Your bookings go ${r.overBy} ${r.overBy === 1 ? "night" : "nights"} over the limit. Check the bookings after ${r.ninetiethNightDate ? formatLong(r.ninetiethNightDate) : "your limit night"} and speak to your borough’s planning team.`,
  }[r.status];
  return r.overlaps.length ? `${main} Some bookings share dates. Check for a double booking or a change of dates.` : main;
}

/** Plain-text summary for "Copy summary". */
export function summaryText(r: NightsResult, o: { propertyName: string; rulesChecked: string; disclaimer: string }): string {
  const lines = [
    "London 90-night count",
    `Property: ${o.propertyName}`,
    `Year: ${r.year}`,
    `Nights used: ${r.used} of ${r.limit}`,
    `Nights left: ${r.left}`,
    `Status: ${statusText(r)}`,
    `Used so far: ${r.usedSoFar} · Booked ahead: ${r.bookedAhead}`,
  ];
  if (r.ninetiethNightDate) lines.push(`Night ${r.limit}: ${formatLong(r.ninetiethNightDate)}`);
  const platforms = Object.entries(r.perPlatform);
  if (platforms.length) lines.push(`By platform: ${platforms.map(([p, n]) => `${p} ${n}`).join(" · ")}`);
  if (r.overlaps.length) lines.push(`Overlapping bookings: ${r.overlaps.length}`);
  if (r.longStays.length) lines.push(`Long stays not counted: ${r.longStays.length}`);
  lines.push("", `Rules last checked ${o.rulesChecked}`, o.disclaimer);
  return lines.join("\n") + "\n";
}

/** "Added: 4 nights (12–16 May) on Airbnb" */
export const addedMessage = (b: Booking, nights: number, platform: string, verb = "Added") =>
  `${verb}: ${nights} ${nights === 1 ? "night" : "nights"} (${formatRange(b.checkIn, b.checkOut)}) on ${platform}`;

/** A sample year for "Try an example": includes an overlap and a long stay. */
export function exampleBookings(year: number): Booking[] {
  const d = (m: number, day: number, y = year) => `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const rows: [string, string, Booking["platform"], string][] = [
    [d(1, 9), d(1, 13), "airbnb", "Example: weekend in January"],
    [d(2, 13), d(2, 17), "booking", "Example: half term"],
    [d(3, 20), d(3, 27), "airbnb", "Example: week in March"],
    [d(4, 17), d(4, 21), "direct", "Example: repeat guest"],
    [d(5, 12), d(5, 16), "airbnb", "Example: May stay"],
    [d(5, 15), d(5, 18), "booking", "Example: possible double booking"],
    [d(6, 5), d(6, 12), "vrbo", "Example: family week"],
    [d(7, 18), d(7, 25), "airbnb", "Example: July week"],
    [d(8, 1), d(8, 8), "booking", "Example: August week"],
    [d(9, 1), d(12, 5), "direct", "Example: 95-night contractor stay"],
    [d(12, 22), d(12, 29), "airbnb", "Example: Christmas"],
  ];
  return rows.map(([checkIn, checkOut, platform, reference], i) => ({ id: `example-${i}`, checkIn, checkOut, platform, reference, example: true }));
}
