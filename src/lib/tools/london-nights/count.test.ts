import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import {
  addBooking,
  addDays,
  countNights,
  deleteBooking,
  emptyStore,
  findDuplicate,
  formatDateList,
  makeBackup,
  nightsBetween,
  previewCsv,
  previewIcs,
  readBackup,
  restoreBooking,
  statusText,
  summaryText,
  validateDraft,
  whatThisMeans,
  addProperty,
  type Booking,
} from "./index";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const TODAY = "2027-01-01";
let n = 0;
const bk = (checkIn: string, checkOut: string, platform: Booking["platform"] = "airbnb"): Booking => ({ id: `t${n++}`, checkIn, checkOut, platform });
const count = (bookings: Booking[], year = 2027, f = figures, today = TODAY) => countNights(bookings, year, f, today);

/** Consecutive non-overlapping short bookings in 2027 totalling `total` nights (7-night blocks with a gap). */
function nightsTotalling(total: number): Booking[] {
  const out: Booking[] = [];
  let start = "2027-01-01";
  let left = total;
  while (left > 0) {
    const len = Math.min(7, left);
    out.push(bk(start, addDays(start, len)));
    start = addDays(start, len + 1);
    left -= len;
  }
  return out;
}

describe("London 90 nights: spec cases", () => {
  it("1. 1–5 Mar 2027 → 4 nights", () => {
    const r = count([bk("2027-03-01", "2027-03-05")]);
    expect(r.used).toBe(4);
    expect(r.countedDates).toEqual(["2027-03-01", "2027-03-02", "2027-03-03", "2027-03-04"]);
  });

  it("2. Exactly 90 nights → reached, left 0, 90th night date", () => {
    const b = nightsTotalling(90);
    const r = count(b);
    expect(r.used).toBe(90);
    expect(r.left).toBe(0);
    expect(r.overBy).toBe(0);
    expect(r.status).toBe("reached");
    expect(r.ninetiethNightDate).toBe(r.countedDates[89]);
    expect(r.ninetiethNightDate).toBe(addDays(b[b.length - 1].checkOut, -1));
  });

  it("3. 91 nights → over by 1, 90th night is the 90th counted date", () => {
    const r = count(nightsTotalling(91));
    expect(r.status).toBe("over");
    expect(r.overBy).toBe(1);
    expect(r.ninetiethNightDate).toBe(r.countedDates[89]);
  });

  it("4. 30 Dec 2026 → 3 Jan 2027 splits across years", () => {
    const b = [bk("2026-12-30", "2027-01-03")];
    expect(count(b, 2027).countedDates).toEqual(["2027-01-01", "2027-01-02"]);
    expect(count(b, 2026).countedDates).toEqual(["2026-12-30", "2026-12-31"]);
  });

  it("5. Overlap: Airbnb 5–8 May and Booking.com 6–9 May → 4 nights, both flagged", () => {
    const a = bk("2027-05-05", "2027-05-08", "airbnb");
    const b = bk("2027-05-06", "2027-05-09", "booking");
    const r = count([a, b]);
    expect(r.used).toBe(4);
    expect(r.countedDates).toEqual(["2027-05-05", "2027-05-06", "2027-05-07", "2027-05-08"]);
    expect(r.overlaps).toEqual([{ a: a.id, b: b.id, dates: ["2027-05-06", "2027-05-07"] }]);
    expect(r.perBooking[a.id].overlapsWith).toEqual([b.id]);
    expect(r.perBooking[b.id].overlapsWith).toEqual([a.id]);
    expect(formatDateList(r.overlaps[0].dates)).toBe("6–7 May");
  });

  it("6. Check-in equals check-out → validation error", () => {
    expect(validateDraft({ checkIn: "2027-05-05", checkOut: "2027-05-05", platform: "airbnb" }).checkOut).toBe("Check-out must be after check-in.");
    expect(validateDraft({ checkIn: "2027-05-05", checkOut: "2027-05-04", platform: "airbnb" }).checkOut).toBe("Check-out must be after check-in.");
    expect(validateDraft({ checkIn: "", checkOut: "", platform: "airbnb" }).checkIn).toBe("Add a check-in and check-out date.");
    expect(validateDraft({ checkIn: "2027-01-01", checkOut: "2028-01-03", platform: "airbnb" }).checkOut).toBe("That’s over a year. Check the dates.");
    expect(validateDraft({ checkIn: "2027-05-01", checkOut: "2027-05-03", platform: "" }).platform).toBeTruthy();
  });

  it("7. Exactly 90 consecutive nights → long stay, 0 counted", () => {
    const b = bk("2027-02-01", addDays("2027-02-01", 90));
    const r = count([b]);
    expect(nightsBetween(b.checkIn, b.checkOut)).toBe(90);
    expect(r.used).toBe(0);
    expect(r.longStays).toEqual([b.id]);
    expect(r.perBooking[b.id].longStay).toBe(true);
  });

  it("8. 89 consecutive nights → 89 counted", () => {
    const r = count([bk("2027-02-01", addDays("2027-02-01", 89))]);
    expect(r.used).toBe(89);
    expect(r.longStays).toEqual([]);
  });

  it("9. 100-night stay across New Year → 0 counted in both years", () => {
    const b = bk("2026-11-02", "2027-02-10"); // 60 nights in 2026, 40 in 2027
    expect(nightsBetween(b.checkIn, b.checkOut)).toBe(100);
    expect(nightsBetween(b.checkIn, "2027-01-01")).toBe(60);
    expect(nightsBetween("2027-01-01", b.checkOut)).toBe(40);
    expect(count([b], 2026).used).toBe(0);
    expect(count([b], 2027).used).toBe(0);
    expect(count([b], 2027).longStays).toEqual([b.id]);
  });

  it("10. Leap year: 28 Feb → 1 Mar 2028 → 2 nights", () => {
    expect(count([bk("2028-02-28", "2028-03-01")], 2028).countedDates).toEqual(["2028-02-28", "2028-02-29"]);
  });

  it("11. Clock changes don't add or lose nights", () => {
    expect(count([bk("2026-03-28", "2026-03-30")], 2026).used).toBe(2);
    expect(count([bk("2026-10-24", "2026-10-26")], 2026).used).toBe(2);
  });

  it("12. Two properties are counted separately", () => {
    let s = emptyStore();
    const a = s.activePropertyId;
    s = addBooking(s, a, bk("2027-05-01", "2027-05-11"));
    s = addProperty(s, "Flat 2, Hackney");
    const b = s.activePropertyId;
    s = addBooking(s, b, bk("2027-06-01", "2027-06-04"));
    const prop = (id: string) => s.properties.find((p) => p.id === id)!.bookings;
    expect(count(prop(a)).used).toBe(10);
    expect(count(prop(b)).used).toBe(3);
  });

  it("13. Delete updates totals; Undo restores", () => {
    let s = emptyStore();
    const p = s.activePropertyId;
    const x = bk("2027-05-01", "2027-05-06");
    const y = bk("2027-06-01", "2027-06-03");
    s = addBooking(addBooking(s, p, x), p, y);
    expect(count(s.properties[0].bookings).used).toBe(7);
    const { store, removed } = deleteBooking(s, p, x.id);
    expect(count(store.properties[0].bookings).used).toBe(2);
    const back = restoreBooking(store, removed!);
    expect(count(back.properties[0].bookings).used).toBe(7);
    expect(back.properties[0].bookings.map((b) => b.id)).toEqual([x.id, y.id]);
  });

  it("14. Changing year recalculates; outside bookings show 0 nights in the year", () => {
    const b = [bk("2027-05-01", "2027-05-06"), bk("2026-07-01", "2026-07-03")];
    const r27 = count(b, 2027);
    const r26 = count(b, 2026);
    expect(r27.used).toBe(5);
    expect(r26.used).toBe(2);
    expect(r27.perBooking[b[1].id].inYear).toBe(0);
  });

  it("15. Used so far / booked ahead split on a fixed today", () => {
    const r = count([bk("2027-06-10", "2027-06-20")], 2027, figures, "2027-06-15");
    expect(r.usedSoFar).toBe(5); // 10–14 Jun
    expect(r.bookedAhead).toBe(5); // 15–19 Jun
    expect(r.usedSoFar + r.bookedAhead).toBe(r.used);
  });

  it("16. 75 nights → approaching, 74 → ok", () => {
    expect(count(nightsTotalling(75)).status).toBe("approaching");
    expect(count(nightsTotalling(74)).status).toBe("ok");
    expect(statusText(count(nightsTotalling(75)))).toBe("Getting close: 15 nights left");
  });

  it("17. Changing the stored limit changes the result", () => {
    const f100: Figures = { ...figures, "london.maxShortLetNights": { ...figures["london.maxShortLetNights"], value: 100 } };
    const r = count(nightsTotalling(91), 2027, f100);
    expect(r.status).toBe("approaching");
    expect(r.left).toBe(9);
    expect(r.ninetiethNightDate).toBeNull();
  });

  it("18. Exact duplicate booking is detected", () => {
    const existing = [bk("2027-05-01", "2027-05-04", "airbnb")];
    expect(findDuplicate({ checkIn: "2027-05-01", checkOut: "2027-05-04", platform: "airbnb" }, existing)).toBeTruthy();
    expect(findDuplicate({ checkIn: "2027-05-01", checkOut: "2027-05-04", platform: "booking" }, existing)).toBeUndefined();
    expect(findDuplicate({ checkIn: "2027-05-01", checkOut: "2027-05-04", platform: "airbnb" }, existing, existing[0].id)).toBeUndefined();
  });

  it("19. CSV import: valid rows previewed, bad date row skipped with an error", () => {
    const csv = "Check-in,Check-out,Platform,Reference\n2027-05-01,2027-05-04,Airbnb,HM123\n12/06/2027,15/06/2027,Booking.com,\"Smith, J\"\n2027-13-01,2027-13-05,Direct,bad\n2027-07-01,2027-07-03,Plumguide,PG1\n";
    const rows = previewCsv(csv);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ include: true, draft: { checkIn: "2027-05-01", checkOut: "2027-05-04", platform: "airbnb", reference: "HM123" } });
    expect(rows[1].draft).toMatchObject({ checkIn: "2027-06-12", checkOut: "2027-06-15", platform: "booking", reference: "Smith, J" });
    expect(rows[2]).toMatchObject({ include: false, draft: null });
    expect(rows[2].error).toBeTruthy();
    expect(rows[3].draft).toMatchObject({ platform: "other", otherPlatform: "Plumguide" });
  });

  it("20. Calendar file: blocked / not-available entries default to unticked", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20270512",
      "DTEND;VALUE=DATE:20270516",
      "SUMMARY:Reserved",
      "DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/details/HMABCDEF12\\nPhone Number (Last 4 Digits): 1234",
      "UID:abc@airbnb.com",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20270601",
      "DTEND;VALUE=DATE:20270610",
      "SUMMARY:Airbnb (Not available)",
      "UID:def@airbnb.com",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20270701",
      "DTEND;VALUE=DATE:20270705",
      "SUMMARY:CLOSED - Not available",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const rows = previewIcs(ics);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ include: true, draft: { checkIn: "2027-05-12", checkOut: "2027-05-16", platform: "airbnb", reference: "HMABCDEF12" } });
    expect(rows[1].include).toBe(false);
    expect(rows[1].note).toMatch(/blocked/i);
    expect(rows[2].include).toBe(false);
  });

  it("21. Per-platform totals add up to used; overlap night goes to the earlier booking", () => {
    const a = bk("2027-05-05", "2027-05-08", "airbnb");
    const b = bk("2027-05-06", "2027-05-09", "booking");
    const c = bk("2027-06-01", "2027-06-03", "direct");
    const r = count([b, a, c]); // order added doesn't matter: a checks in first
    expect(r.perPlatform).toEqual({ Airbnb: 3, "Booking.com": 1, Direct: 2 });
    expect(Object.values(r.perPlatform).reduce((x, y) => x + y, 0)).toBe(r.used);
  });
});

describe("London 90 nights: extras", () => {
  it("long-stay nights are excluded before checking overlaps", () => {
    const long = bk("2027-03-01", addDays("2027-03-01", 95));
    const short = bk("2027-03-10", "2027-03-12");
    const r = count([long, short]);
    expect(r.used).toBe(2);
    expect(r.overlaps).toEqual([]);
    expect(r.days["2027-03-10"].kind).toBe("counted");
    expect(r.days["2027-03-20"].kind).toBe("longStay");
  });

  it("backup round trip keeps everything", () => {
    let s = emptyStore();
    s = addBooking(s, s.activePropertyId, { ...bk("2027-05-01", "2027-05-04"), reference: "Guest A", note: "Late check-in" });
    const r = readBackup(makeBackup(s, "2027-05-05"));
    expect(r.ok && r.store).toEqual(s);
    expect(readBackup("{}").ok).toBe(false);
    expect(readBackup("not json").ok).toBe(false);
  });

  it("what this means: over, with overlaps", () => {
    const r = count([...nightsTotalling(92), bk("2027-01-02", "2027-01-04", "booking")]);
    const t = whatThisMeans(r, true);
    expect(t).toContain("go 2 nights over the limit");
    expect(t).toContain("Some bookings share dates");
  });

  it("summary text includes totals, date and disclaimer, and never says compliant", () => {
    const t = summaryText(count(nightsTotalling(40)), { propertyName: "Flat 2", rulesChecked: "17 November 2026", disclaimer: "General information." });
    expect(t).toContain("Nights used: 40 of 90");
    expect(t).toContain("Nights left: 50");
    expect(t).toContain("Rules last checked 17 November 2026");
    expect(t).not.toMatch(/compliant|allowed/i);
  });

  it("never produces NaN for odd input", () => {
    const r = count([{ id: "x", checkIn: "2027-02-30", checkOut: "2027-03-02", platform: "airbnb" }, { id: "y", checkIn: "", checkOut: "", platform: "airbnb" }]);
    expect(r.used).toBe(0);
    expect(JSON.stringify(r)).not.toContain("NaN");
  });
});
