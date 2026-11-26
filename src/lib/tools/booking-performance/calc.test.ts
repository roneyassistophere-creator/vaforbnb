import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import { parseCsv } from "../csv";
import { parseTypedDate } from "../dates";
import type { Figures } from "../figures";
import {
  beforeAfter,
  blankMonth,
  compare,
  fromBookings,
  insights,
  kpis,
  monthly,
  parseMonthPaste,
  portfolio,
  previewBookingCsv,
  readContent,
  revparBreakdown,
  summarySentence,
  validateBookings,
  validateQuick,
  vsTarget,
  type Booking,
  type QuickIn,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const r2 = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100);
const p1 = (x: number) => Math.round(x * 1000) / 10;
const q = (over: Partial<QuickIn> = {}): QuickIn => ({ nights: 30, booked: 18, blocked: 0, revenue: 1980, cleaning: 0, feePercent: 0, bookings: 0, ...over });

const MARCH = { start: "2027-03-01", end: "2027-04-01" };
const bk = (id: string, checkIn: string, checkOut: string, revenue: number, extra: Partial<Booking> = {}): Booking => ({ id, checkIn, checkOut, revenue, channel: "", bookedOn: "", cleaning: 0, ...extra });
const test5 = [bk("A", "2027-02-28", "2027-03-03", 300), bk("B", "2027-03-05", "2027-03-08", 360), bk("C", "2027-03-10", "2027-03-12", 240), bk("D", "2027-03-30", "2027-04-02", 330)];

describe("1–3. core KPIs", () => {
  it("1. 30 nights, 18 booked, £1,980: 60.0%, £110.00, £66.00", () => {
    const k = kpis(q());
    expect([p1(k.occupancy), r2(k.adr), r2(k.revpar)]).toEqual([60, 110, 66]);
    expect(summarySentence(k)).toBe("You sold 18 of 30 available nights at an average of £110, earning £66 for every night you could have sold.");
  });
  it("2. 5 blocked: available 25, 72.0%, RevPAR £79.20", () => {
    const k = kpis(q({ blocked: 5 }));
    expect([k.available, p1(k.occupancy), r2(k.revpar)]).toEqual([25, 72, 79.2]);
  });
  it("3. nothing booked: ADR –, RevPAR 0, occupancy 0", () => {
    const k = kpis(q({ booked: 0, revenue: 0 }));
    expect([k.adr, k.revpar, k.occupancy]).toEqual([null, 0, 0]);
  });
});

describe("4. year on year and the RevPAR breakdown", () => {
  it("occupancy +10 pts, ADR −£10 (−8.3%), RevPAR +£6 (+10%); effects +12 / −6", () => {
    const now = kpis(q());
    const before = kpis(q({ booked: 15, revenue: 1800 }));
    const c = compare(now, before);
    expect(r2(c.occPoints)).toBe(10);
    expect([r2(c.adr!.abs), p1(c.adr!.pct!)]).toEqual([-10, -8.3]);
    expect([r2(c.revpar.abs), p1(c.revpar.pct!)]).toEqual([6, 10]);
    const b = revparBreakdown(now, before);
    expect([r2(b.occEffect), r2(b.priceEffect), r2(b.total)]).toEqual([12, -6, 6]);
    expect(r2(b.total)).toBe(r2(c.revpar.abs));
  });
});

describe("5. booking list, March 2027", () => {
  const r = fromBookings(test5, [], MARCH, content);
  it("booked 9, revenue 1,020: 29.0%, £113.33, £32.90; ALOS 2.67", () => {
    expect([r.kpis.booked, r2(r.kpis.revenue)]).toEqual([9, 1020]);
    expect([p1(r.kpis.occupancy), r2(r.kpis.adr), r2(r.kpis.revpar)]).toEqual([29, 113.33, 32.9]);
    expect(r2(r.alos)).toBe(2.67);
  });
  it("gaps: 2 gaps, 4 nights (3–4 and 8–9 March); 12–29 March isn’t a gap", () => {
    expect(r.gaps.count).toBe(2);
    expect(r.gaps.nights).toBe(4);
    expect(r.gaps.runs).toEqual([
      ["2027-03-03", "2027-03-04"],
      ["2027-03-08", "2027-03-09"],
    ]);
    expect(r.days["2027-03-15"]).toBeUndefined();
    expect(r.days["2027-03-03"].kind).toBe("gap");
  });
  it("weekends 2 of 8 at £120 (25.0%); weekdays 7 of 23 at £111.43 (30.4%)", () => {
    expect([r.weekend.booked, r.weekend.available, p1(r.weekend.occupancy), r2(r.weekend.adr)]).toEqual([2, 8, 25, 120]);
    expect([r.weekday.booked, r.weekday.available, p1(r.weekday.occupancy), r2(r.weekday.adr)]).toEqual([7, 23, 30.4, 111.43]);
  });
  it("lead time and channel mix", () => {
    const withMeta = fromBookings(
      test5.map((b, i) => ({ ...b, bookedOn: ["2027-02-01", "2027-02-10", "2027-03-01", "2027-03-02"][i], channel: ["Airbnb", "Airbnb", "Direct", "Booking.com"][i] })),
      [],
      MARCH,
      content,
    );
    // Check-ins inside March: B (23 days), C (9), D (28) → 20.
    expect(withMeta.leadTime).toBe(20);
    expect(withMeta.channelMix.find((x) => x.channel === "Airbnb")).toMatchObject({ nights: 5, revenue: 560 });
  });
});

describe("6. portfolio from sums", () => {
  it("70.5%, £92.56, £65.25; sorted by RevPAR", () => {
    const p = portfolio([
      { id: "1", name: "Flat 1", kpis: kpis(q()) },
      { id: "2", name: "Flat 2", kpis: kpis(q({ nights: 31, booked: 25, revenue: 2000 })) },
    ]);
    expect([p1(p.total!.occupancy), r2(p.total!.adr), r2(p.total!.revpar)]).toEqual([70.5, 92.56, 65.25]);
    expect(p.rows[0].name).toBe("Flat 1");
  });
});

describe("7. net RevPAR and TRevPAR", () => {
  it("15.5% fee: £55.77; £240 cleaning: £74.00", () => {
    expect(r2(kpis(q({ feePercent: 15.5 })).netRevpar)).toBe(55.77);
    expect(r2(kpis(q({ cleaning: 240 })).trevpar)).toBe(74);
    expect(kpis(q({ bookings: 6 })).alos).toBe(3);
  });
});

describe("8. targets", () => {
  it("70% and £105: −10.0 pts, +£5.00; RevPAR £73.50: −£7.50, 66.8% at £110 or £122.50 at 60%", () => {
    const k = kpis(q());
    const t = vsTarget(k, { occupancy: 70, adr: 105, revpar: 73.5 });
    expect([r2(t.occPoints), r2(t.adr), r2(t.revpar)]).toEqual([-10, 5, -7.5]);
    expect(p1(t.needOcc!.value)).toBe(66.8);
    expect(r2(t.needAdr)).toBe(122.5);
  });
});

describe("9. before/after", () => {
  it("+£6 (+10%) Worked; under 2% No real change; down Didn’t work", () => {
    const b = beforeAfter(kpis(q({ booked: 15, revenue: 1800 })), kpis(q()), content);
    expect([r2(b.delta), p1(b.pct!), b.verdict]).toEqual([6, 10, "worked"]);
    expect(beforeAfter(kpis(q()), kpis(q({ revenue: 2000 })), content).verdict).toBe("none");
    expect(beforeAfter(kpis(q()), kpis(q({ revenue: 1500 })), content).verdict).toBe("didnt");
  });
});

describe("10–11. overlaps and blocked nights", () => {
  it("10. two bookings sharing a night: counted once, flagged, revenue reconciles", () => {
    const r = fromBookings([bk("X", "2027-03-05", "2027-03-08", 300), bk("Y", "2027-03-07", "2027-03-09", 200)], [], MARCH, content);
    expect(r.kpis.booked).toBe(4);
    expect(r2(r.kpis.revenue)).toBe(500);
    expect(r.flags.map((f) => f.message)).toEqual(["Possible double booking", "Possible double booking"]);
    expect(r.days["2027-03-07"].kind).toBe("overlap");
  });
  it("11. a booking over a blocked night: flagged, the night counts as booked", () => {
    const r = fromBookings([bk("X", "2027-03-05", "2027-03-08", 300)], [{ id: "k", from: "2027-03-07", to: "2027-03-10" }], MARCH, content);
    expect(r.flags).toEqual([{ id: "X", message: "Booking overlaps a blocked night" }]);
    expect(r.kpis.booked).toBe(3);
    expect(r.kpis.blocked).toBe(3);
    expect(r.kpis.available).toBe(28);
  });
});

describe("12. monthly tracker", () => {
  it("2028 is a leap year; blank months are left out of year to date; totals from sums", () => {
    const rows = Array.from({ length: 12 }, (_, i) => (i < 3 ? { blocked: 0, booked: 15, revenue: 1500, cleaning: null } : blankMonth()));
    const m = monthly(rows, 2028);
    expect(m.months[1]!.periodNights).toBe(29);
    expect([m.filled, m.partial]).toEqual([3, true]);
    expect(m.total!.available).toBe(31 + 29 + 31);
    expect(r2(m.total!.occupancy)).toBe(r2(45 / 91));
  });
  it("paste fills the table", () => {
    const p = parseMonthPaste("0\t17\t1870\n0\t15\t1590\nbad row");
    expect(p.rows[0]).toEqual({ blocked: 0, booked: 17, revenue: 1870, cleaning: null });
    expect(p.errors).toEqual(["Row 3: expected 3 or 4 numbers (blocked, booked, revenue, cleaning)."]);
  });
});

describe("13. validation", () => {
  it("inline messages", () => {
    expect(validateQuick(q({ booked: 31 })).booked).toBe("Booked nights can’t be more than available nights.");
    expect(validateQuick(q({ blocked: 31 })).blocked).toBe("Blocked nights can’t be more than the nights in the period.");
    expect(validateQuick(q({ revenue: -1 })).revenue).toBe("Revenue can’t be negative.");
    expect(validateQuick(q({ blocked: 30, booked: 0 })).available).toBe("Every night is blocked. There’s nothing to measure.");
    expect(validateBookings([bk("Z", "2027-03-05", "2027-03-05", 100)], MARCH, [])["b.Z"]).toBe("Check-out must be after check-in.");
    expect(Object.keys(validateQuick(q()))).toEqual([]);
  });
});

describe("14. stored figures drive the results", () => {
  const edit = (patch: object) => readContent({ ...figures, "bookingPerformance.content": { ...figures["bookingPerformance.content"], value: { json: { ...(figures["bookingPerformance.content"].value as { json: { model: object } }).json, model: { ...content.model, ...patch } } } } });
  it("gapMaxNights 3, and weekend nights", () => {
    const c3 = edit({ gapMaxNights: 1 });
    expect(fromBookings(test5, [], MARCH, c3).gaps.count).toBe(0);
    const sat = edit({ weekendNights: [6] });
    expect(fromBookings(test5, [], MARCH, sat).weekend.available).toBe(4);
  });
});

describe("15. CSV import", () => {
  it("valid rows import; bad rows show reasons", () => {
    const rows = parseCsv("check-in,check-out,revenue,channel,booked-on,cleaning\n05/03/2027,08/03/2027,360,Airbnb,10/02/2027,60\n2027-03-10,2027-03-09,240,,,\n2027-03-12,2027-03-14,,Direct,,");
    const p = previewBookingCsv(rows, parseTypedDate);
    expect(p[0].booking).toEqual({ checkIn: "2027-03-05", checkOut: "2027-03-08", revenue: 360, channel: "Airbnb", bookedOn: "2027-02-10", cleaning: 60 });
    expect(p[1].errors).toEqual(["Check-out must be after check-in."]);
    expect(p[2].errors).toEqual(["Revenue is missing."]);
    expect(p.map((x) => x.line)).toEqual([2, 3, 4]);
  });
});

describe("insights", () => {
  it("year on year, gaps, opposite effects, empty nights", () => {
    const k = kpis(q());
    const before = kpis(q({ booked: 15, revenue: 1800 }));
    const ins = insights({ k, before, cmp: compare(k, before), target: null, targetAdr: null, bookings: null }, content);
    expect(ins.map((i) => i.id)).toEqual(["opposite", "yoyUp"]);
    expect(ins[1].text).toBe("RevPAR is up 10.0% on last year. You earned more per available night.");
    const b = fromBookings(test5, [], MARCH, content);
    const ib = insights({ k: b.kpis, before: null, cmp: null, target: null, targetAdr: null, bookings: b }, content);
    expect(ib.map((i) => i.id)).toEqual(["empty", "gaps"]);
    expect(ib[1].text).toBe("2 short gaps left 4 nights unsold. A shorter minimum stay or gap-night discount could fill them.");
  });
});
