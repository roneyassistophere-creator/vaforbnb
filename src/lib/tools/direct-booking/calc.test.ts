import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import {
  addScenario,
  bookingsFromOccupancy,
  compareScenarios,
  defaultInputs,
  exampleInputs,
  importFromProfit,
  makeItWork,
  mixForProfit,
  perBooking,
  perYear,
  readContent,
  validateBooking,
  validateYear,
  whatThisMeans,
  type Inputs,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Test 1: £120 × 3 nights + £40 cleaning, Airbnb host-only vs Direct (1.5% + £0.20), VAT on fee off. */
const t1 = (over: Partial<Inputs> = {}): Inputs => ({ ...defaultInputs(content), rate: 120, nights: 3, cleaningFee: 40, channels: ["airbnb"], vatOnFee: false, ...over });
/** Test 4: test 1 plus 60 bookings, Airbnb 95% / Direct 5% → 20%, booking system £30/month, website £120/year, build £1,500. */
const t4 = (over: Partial<Inputs> = {}): Inputs => t1({ bookings: 60, shares: { airbnb: 95, booking: 0, vrbo: 0, other: 0, direct: 5 }, target: 20, alreadyDirect: false, running: { system: 30, hosting: 120, marketing: 0, other: 0 }, websiteBuild: 1500, ...over });
const air = (pb: ReturnType<typeof perBooking>) => pb.platforms.find((p) => p.id === "airbnb")!;

describe("1–3. one booking", () => {
  it("1. V 400; Airbnb keeps 338.00, direct 393.80, saving 55.80 (558.00 per 10)", () => {
    const pb = perBooking(t1(), content);
    expect(pb.value).toBe(400);
    expect(r2(air(pb).payout)).toBe(338);
    expect(r2(pb.direct.payout)).toBe(393.8);
    expect(r2(air(pb).saving)).toBe(55.8);
    expect(r2(air(pb).saving * 10)).toBe(558);
  });
  it("2. VAT on the platform fee: fee 74.40, payout 325.60, saving 68.20", () => {
    const a = air(perBooking(t1({ vatOnFee: true }), content));
    expect(r2(a.fee)).toBe(74.4);
    expect(r2(a.payout)).toBe(325.6);
    expect(r2(a.saving)).toBe(68.2);
  });
  it("3. break-even discount 14.2%; at 5% off, direct keeps 374.10 (saving 36.10)", () => {
    const a = air(perBooking(t1(), content));
    expect(a.breakEvenDiscount.ok && Math.round(a.breakEvenDiscount.value * 1000) / 10).toBe(14.2);
    const pb = perBooking(t1({ discount: 5 }), content);
    expect(r2(pb.direct.payout)).toBe(374.1);
    expect(r2(air(pb).saving)).toBe(36.1);
  });
});

describe("4–5. your year", () => {
  it("4. fees 3,534 → 2,976; 9 extra bookings; gross 502.20 − 480 = 22.20; break-even 9; payback over 10 years; Marginal", () => {
    const y = perYear(t4(), content);
    expect(r2(y.platformFeesNow)).toBe(3534);
    expect(r2(y.platformFeesTarget)).toBe(2976);
    expect(r2(y.extra)).toBe(9);
    expect(r2(y.gross)).toBe(502.2);
    expect(r2(y.newCosts)).toBe(480);
    expect(r2(y.net)).toBe(22.2);
    expect(y.breakEven.ok && [y.breakEven.bookings, Math.round(y.breakEven.exact * 10) / 10]).toEqual([9, 8.6]);
    expect(y.payback?.text).toBe("Over 10 years");
    expect(y.verdict).toBe("marginal");
  });
  it("5. already run direct: net 502.20, payback 35.8 months, Worth it", () => {
    const y = perYear(t4({ alreadyDirect: true }), content);
    expect(r2(y.net)).toBe(502.2);
    expect(Math.round(y.payback!.months! * 10) / 10).toBe(35.8);
    expect(y.payback!.text).toBe("3 years");
    expect(y.verdict).toBe("worth");
  });
  it("not yet when costs beat the saving", () => {
    expect(perYear(t4({ running: { system: 100, hosting: 0, marketing: 0, other: 0 } }), content).verdict).toBe("notYet");
  });
});

describe("6–8. other fee models", () => {
  it("6. split fee: host keeps 388.00; saving 5.80; guest pays 456.00 vs 400.00; parity 456.00 → 448.96", () => {
    const pb = perBooking(t1({ airbnbModel: "split", guestFee: 14 }), content);
    const a = air(pb);
    expect(r2(a.payout)).toBe(388);
    expect(r2(a.saving)).toBe(5.8);
    expect(r2(a.guestPays)).toBe(456);
    expect(a.guestApprox).toBe(true);
    expect(r2(pb.direct.guestPays)).toBe(400);
    expect(pb.parity && [r2(pb.parity.price), r2(pb.parity.payout)]).toEqual([456, 448.96]);
  });
  it("7. Booking.com 15%: payout 340.00, direct saves 53.80", () => {
    const b = perBooking(t1({ channels: ["booking"], bookingFee: 15, bookingPaymentsFee: 0 }), content).platforms[0];
    expect(r2(b.payout)).toBe(340);
    expect(r2(b.saving)).toBe(53.8);
  });
  it("8. a 20% card fee makes direct cost more", () => {
    const a = air(perBooking(t1({ cardPercent: 20 }), content));
    expect(a.saving).toBeLessThan(0);
    expect(a.breakEvenDiscount).toEqual({ ok: false, message: "Direct costs more than this platform at these figures" });
  });
});

describe("9. what would make it work", () => {
  it("solves the share for net saving 0 and for a 36-month payback (checked directly)", () => {
    const fix = makeItWork(t4(), content);
    expect(fix.breakEvenShare.ok).toBe(true);
    expect(fix.paybackShare?.ok).toBe(true);
    if (!fix.breakEvenShare.ok || !fix.paybackShare?.ok) return;
    // Direct: each moved booking saves 55.80, so 480 ÷ 55.80 bookings, out of 60, on top of 5%.
    expect(fix.breakEvenShare.value).toBeCloseTo(0.05 + 480 / 55.8 / 60, 8);
    expect(fix.paybackShare.value).toBeCloseTo(0.05 + (480 + 500) / 55.8 / 60, 8);
    // And on the model itself: net ≈ 0, payback ≈ 36 months.
    expect(perYear(t4({ target: fix.breakEvenShare.value * 100 }), content).net).toBeCloseTo(0, 6);
    expect(perYear(t4({ target: fix.paybackShare.value * 100 }), content).payback!.months).toBeCloseTo(36, 6);
  });
});

describe("10–12. helper, validation, highest-fee first", () => {
  it("10. 60% occupancy, 3-night stays: 73 bookings a year", () => {
    expect(bookingsFromOccupancy(60, 3, content)).toBe(73);
  });
  it("11. rate 0, nights 0, shares off 100%, a negative fee: inline errors", () => {
    const e = validateBooking(t1({ rate: 0, nights: 0, bookingFee: -1, channels: ["airbnb", "booking"] }));
    expect(e.rate).toBe("Enter a nightly rate above £0.");
    expect(e.nights).toBe("Enter at least 1 night.");
    expect(e.bookingFee).toBe("Enter a commission between 0% and 100%.");
    expect(validateYear(t4({ shares: { airbnb: 90, booking: 0, vrbo: 0, other: 0, direct: 5 } })).shares).toBe("Your channel shares add up to 95%. They need to add up to 100%.");
    expect(Object.keys(validateBooking(t1()))).toEqual([]);
    expect(Object.keys(validateYear(t4()))).toEqual([]);
  });
  it("12. highest-fee first takes the extra direct bookings from Airbnb (15.5%) before Booking.com (15%)", () => {
    const i = t4({ channels: ["airbnb", "booking"], bookingFee: 15, shares: { airbnb: 50, booking: 45, vrbo: 0, other: 0, direct: 5 }, fromHighest: true });
    const y = perYear(i, content);
    expect(r2(y.rows.find((r) => r.id === "airbnb")!.target)).toBe(r2(60 * 0.5 - 9));
    expect(r2(y.rows.find((r) => r.id === "booking")!.target)).toBe(27);
    const prop = perYear({ ...i, fromHighest: false }, content);
    expect(r2(prop.rows.find((r) => r.id === "booking")!.target)).toBeLessThan(27);
  });
});

describe("13. stored presets drive the results", () => {
  const edit = (key: string, value: unknown) => readContent({ ...figures, [key]: { ...figures[key], value: value as never } });
  it("host-only % and card fee", () => {
    const c = edit("fees.airbnbHostOnlyPercent", 16);
    expect(r2(air(perBooking(t1(), c)).payout)).toBe(336);
    const c2 = edit("fees.directCardPercent", 2);
    expect(r2(perBooking({ ...defaultInputs(c2), rate: 120, nights: 3, cleaningFee: 40 }, c2).direct.payout)).toBe(391.8);
  });
  it("the 36-month verdict line", () => {
    const c = edit("directBooking.content", { json: { ...(figures["directBooking.content"].value as { json: object }).json, model: { ...content.model, worthItMonths: 30 } } });
    expect(perYear(t4({ alreadyDirect: true }), c).verdict).toBe("marginal");
  });
});

describe("14. import from the profit calculator", () => {
  const data = { bookingValueMonthly: 1824, staysMonthly: 6.08, channels: [{ id: "airbnb", sharePercent: 80, feePercent: 15.5 }, { id: "booking", sharePercent: 15, feePercent: 15 }, { id: "direct", sharePercent: 5, feePercent: 1.5 }] };
  it("prefills booking value, bookings a year and the channel mix", () => {
    const { inputs, fields } = importFromProfit(defaultInputs(content), data, content);
    expect(inputs.avgValue).toBe(300);
    expect(inputs.bookings).toBe(73);
    expect(inputs.shares).toEqual({ airbnb: 80, booking: 15, vrbo: 0, other: 0, direct: 5 });
    expect(inputs.channels).toEqual(["airbnb", "booking"]);
    expect(fields).toEqual(["average booking value", "bookings per year", "channel mix"]);
  });
  it("never overwrites what the host already filled in", () => {
    const filled = { ...defaultInputs(content), bookings: 40, avgValue: 250 };
    const { inputs, fields } = importFromProfit(filled, data, content);
    expect([inputs.bookings, inputs.avgValue]).toEqual([40, 250]);
    expect(fields).toEqual(["channel mix"]);
  });
});

describe("scenarios, example, wording, hand-off", () => {
  it("compare highlights differences", () => {
    let list = addScenario([], "Now", t4(), 5).list;
    list = addScenario(list, "30% direct", t4({ target: 30 }), 5).list;
    const rows = compareScenarios(list, content);
    expect(rows.find((r) => r.label === "Target direct share")).toMatchObject({ values: ["20.0%", "30.0%"], differs: true });
    expect(rows.find((r) => r.label === "Booking value")!.differs).toBe(false);
  });
  it("the example loads tests 1 and 4", () => {
    const e = exampleInputs(content);
    expect(r2(perYear(e, content).net)).toBe(22.2);
  });
  it("what this means: marginal, with the always line", () => {
    const t = whatThisMeans(t4(), perYear(t4(), content), content);
    expect(t).toMatch(/^Direct bookings save money per booking, but your running costs eat most of it\. You’d need about 34\.3% direct for a faster payback\./);
    expect(t).toMatch(/don’t move a platform’s guests off the platform\.$/);
  });
  it("Open in Profit calculator: the target mix (Vrbo folded into Other)", () => {
    const i = t4({ channels: ["airbnb", "vrbo"], vrboFee: 8, shares: { airbnb: 75, booking: 0, vrbo: 20, other: 0, direct: 5 } });
    const m = mixForProfit(i, perYear(i, content));
    expect(m.shares.direct).toBe(20);
    expect(r2(m.shares.airbnb + m.shares.other + m.shares.booking + m.shares.direct)).toBe(100);
    expect(m.otherFee).toBe(8);
  });
});
