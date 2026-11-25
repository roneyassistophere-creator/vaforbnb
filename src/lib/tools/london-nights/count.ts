import { numberFigure, type Figures } from "../figures";
import { dayNumber, fromDayNumber, isValidDate, nightsBetween } from "./dates";
import { platformLabels, type Booking, type BookingNights, type DayKind, type NightsResult, type Overlap, type Status } from "./types";

export const figureKeys = {
  limit: "london.maxShortLetNights",
  longStayMin: "london.longStayMinNights",
  warnAt: "london.warnAtNights",
  rulesLastChecked: "rulesLastChecked",
};
export const allFigureKeys = Object.values(figureKeys);

export const platformName = (b: Pick<Booking, "platform" | "otherPlatform">) =>
  b.platform === "other" && b.otherPlatform?.trim() ? b.otherPlatform.trim() : platformLabels[b.platform];

/**
 * Count London short-let nights for one property in one calendar year.
 *  - Nights are the dates from check-in up to (not including) check-out.
 *  - A night belongs to the year of its date.
 *  - A booking of `longStayMin`+ nights (its whole length, any year) counts 0.
 *  - A night shared by several bookings counts once, under the earliest booking
 *    (earlier check-in; if equal, the one added first).
 * @param today YYYY-MM-DD in London, for the used-so-far / booked-ahead split.
 */
export function countNights(bookings: Booking[], year: number, figures: Figures, today: string): NightsResult {
  const limit = numberFigure(figures, figureKeys.limit);
  const longStayMin = numberFigure(figures, figureKeys.longStayMin);
  const warnAt = numberFigure(figures, figureKeys.warnAt);

  const yearStart = dayNumber(`${year}-01-01`);
  const yearEnd = dayNumber(`${year + 1}-01-01`); // exclusive

  const valid = bookings
    .map((b, index) => ({ b, index }))
    .filter(({ b }) => isValidDate(b.checkIn) && isValidDate(b.checkOut) && nightsBetween(b.checkIn, b.checkOut) > 0);

  // Earliest booking first: decides which booking "owns" a shared night.
  const ordered = [...valid].sort((x, y) => dayNumber(x.b.checkIn) - dayNumber(y.b.checkIn) || x.index - y.index);

  const perBooking: Record<string, BookingNights> = {};
  const onDay = new Map<number, string[]>(); // counted (short-stay) bookings per day
  const longStayDays = new Map<number, string[]>();
  const longStays: string[] = [];

  for (const { b } of ordered) {
    const start = dayNumber(b.checkIn);
    const end = dayNumber(b.checkOut);
    const total = end - start;
    const longStay = total >= longStayMin;
    const from = Math.max(start, yearStart);
    const to = Math.min(end, yearEnd);
    const inYear = Math.max(0, to - from);
    perBooking[b.id] = { total, inYear, counted: 0, longStay, overlapsWith: [] };
    if (longStay) longStays.push(b.id);
    const target = longStay ? longStayDays : onDay;
    for (let d = from; d < to; d++) target.set(d, [...(target.get(d) ?? []), b.id]);
  }

  // Count unique nights; the first booking on a day owns it.
  const byId = new Map(valid.map(({ b }) => [b.id, b]));
  const perPlatform: Record<string, number> = {};
  const pairDates = new Map<string, number[]>();
  const days: NightsResult["days"] = {};
  const counted: number[] = [];

  for (const [d, ids] of [...onDay.entries()].sort((x, y) => x[0] - y[0])) {
    counted.push(d);
    const owner = byId.get(ids[0])!;
    perBooking[owner.id].counted++;
    const name = platformName(owner);
    perPlatform[name] = (perPlatform[name] ?? 0) + 1;
    const kind: DayKind = ids.length > 1 ? "overlap" : "counted";
    days[fromDayNumber(d)] = { kind, bookingIds: ids };
    if (ids.length > 1) {
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++) {
          const key = `${ids[i]}|${ids[j]}`;
          pairDates.set(key, [...(pairDates.get(key) ?? []), d]);
        }
    }
  }
  for (const [d, ids] of longStayDays) {
    const iso = fromDayNumber(d);
    if (!days[iso]) days[iso] = { kind: "longStay", bookingIds: ids };
  }

  const overlaps: Overlap[] = [...pairDates.entries()].map(([key, ds]) => {
    const [a, b] = key.split("|");
    perBooking[a].overlapsWith.push(b);
    perBooking[b].overlapsWith.push(a);
    return { a, b, dates: ds.map(fromDayNumber) };
  });

  const countedDates = counted.map(fromDayNumber);
  const used = countedDates.length;
  const todayN = dayNumber(today);
  const usedSoFar = counted.filter((d) => d < todayN).length;
  const status: Status = used > limit ? "over" : used === limit ? "reached" : used >= warnAt ? "approaching" : "ok";

  return {
    year,
    limit,
    warnAt,
    longStayMin,
    used,
    usedSoFar,
    bookedAhead: used - usedSoFar,
    left: Math.max(0, limit - used),
    overBy: Math.max(0, used - limit),
    status,
    ninetiethNightDate: used >= limit && limit > 0 ? countedDates[limit - 1] : null,
    countedDates,
    overlaps,
    longStays,
    perPlatform,
    perBooking,
    days,
  };
}
