import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import {
  addScenario,
  applyShape,
  calcDetailed,
  calculate,
  compareScenarios,
  copyJanuary,
  defaultInputs,
  ensureMonths,
  insights,
  moneyFlow,
  notices,
  paybackText,
  profitHandoffData,
  readContent,
  sensitivity,
  taxEstimate,
  validate,
  type Inputs,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const r2 = (n: number) => Math.round(n * 100) / 100;
const p1 = (x: number) => Math.round(x * 1000) / 10;

/** The brief's base: rate 100, 60%, stay 3, one 15.5% fee, turnover 50, fixed costs 1,200 a month, nothing else. */
function base(over: Partial<Inputs> = {}): Inputs {
  const d = defaultInputs(content, 2027);
  return {
    ...d,
    rate: 100,
    occupancy: 60,
    avgStay: 3,
    cleaningFee: 0,
    ownerNights: 0,
    feeMode: "simple",
    simpleFee: 15.5,
    turnover: 50,
    consumables: 0,
    running: 0,
    monthly: { mortgagePayment: 0, mortgageInterest: null, rent: 0, energy: 0, broadband: 0, councilTax: 0, software: 0, serviceCharge: 0, other: 1200 },
    annual: { insurance: 0, groundRent: 0, licence: 0, safety: 0, tvLicence: 0, accountant: 0, other: 0 },
    setupCosts: 0,
    cashInvested: 0,
    ...over,
  };
}
const run = (over: Partial<Inputs> = {}, c = content) => calculate(base(over), c);
const reach = (x: { ok: boolean; value?: number; message?: string }) => (x.ok ? x.value! : x.message!);
const all = (i: Inputs, c = content) => {
  const r = calculate(i, c);
  const l = sensitivity(i, c);
  const t = i.tax.on ? taxEstimate(i, r, c) : null;
  return insights(i, r, l, t, notices(i, r, c), c);
};

describe("1. base", () => {
  const r = run();
  it("nights, stays, booking value, fees, turnovers, profit", () => {
    expect(r2(r.monthly.nights)).toBe(18.24);
    expect(r2(r.monthly.stays)).toBe(6.08);
    expect(r2(r.monthly.booking)).toBe(1824);
    expect(r2(r.monthly.platformFees)).toBe(282.72);
    expect(r2(r.monthly.turnovers)).toBe(304);
    expect(r2(r.monthly.profit)).toBe(37.28);
    expect(r2(r.annual.profit)).toBe(447.36);
  });
  it("break-even 58.2% and minimum rate £97.58", () => {
    expect(p1(reach(r.breakEven) as number)).toBe(58.2);
    expect(r2(reach(r.minRate) as number)).toBe(97.58);
    expect(r.status).toBe("thin");
  });
});

describe("2. detailed costs", () => {
  const r = run({ cleaningFee: 40, consumables: 8, running: 4, ownerNights: 24 });
  it("matches the brief", () => {
    expect(r2(r.monthly.available)).toBe(28.4);
    expect(r2(r.monthly.nights)).toBe(17.04);
    expect(r2(r.monthly.stays)).toBe(5.68);
    expect(r2(r.monthly.booking)).toBe(1931.2);
    expect(r2(r.monthly.platformFees)).toBe(299.34);
    expect(r2(r.monthly.variable)).toBe(397.6);
    expect(r2(r.monthly.profit)).toBe(34.26);
    expect(p1(reach(r.breakEven) as number)).toBe(58.3);
    expect(r2(reach(r.minRate) as number)).toBe(97.62);
  });
});

describe("3. channel mix", () => {
  const r = run({ feeMode: "channels", shares: { airbnb: 70, booking: 20, direct: 10, other: 0 }, airbnbModel: "custom", airbnbCustom: 15.5, bookingFee: 15, directFee: 1.5, directFixed: 0.2 });
  it("fees 255.48, profit 64.52, break-even 56.9%, minimum rate 95.89", () => {
    expect(r2(r.monthly.platformFees)).toBe(255.48);
    expect(r2(r.monthly.profit)).toBe(64.52);
    expect(p1(reach(r.breakEven) as number)).toBe(56.9);
    expect(r2(reach(r.minRate) as number)).toBe(95.89);
  });
  it("the host-only preset uses the stored Airbnb fee", () => {
    const h = run({ feeMode: "channels", shares: { airbnb: 100, booking: 0, direct: 0, other: 0 }, airbnbModel: "host-only" });
    expect(r2(h.monthly.platformFees)).toBe(282.72);
  });
});

describe("4. management 20% of room revenue", () => {
  const i = base({ mgmt: { kind: "percent", percent: 20, basis: "room", fixed: 0 } });
  const r = calculate(i, content);
  it("management, profit, break-even, minimum rate, loss insight", () => {
    expect(r2(r.monthly.management)).toBe(364.8);
    expect(r2(r.monthly.profit)).toBe(-327.52);
    expect(p1(reach(r.breakEven) as number)).toBe(82.5);
    expect(r2(reach(r.minRate) as number)).toBe(127.84);
    expect(r.status).toBe("loss");
    const ins = all(i);
    expect(ins[0].id).toBe("loss");
    expect(ins[0].text).toBe("At these figures you lose £328 a month. You’d need £127.84 a night, or 82.5% occupancy, to break even.");
  });
  it("on room revenue + cleaning fees, the cleaning income is included", () => {
    const x = run({ cleaningFee: 40, mgmt: { kind: "percent", percent: 20, basis: "roomCleaning", fixed: 0 } });
    expect(r2(x.monthly.management)).toBe(r2(0.2 * x.monthly.booking));
  });
});

describe("5. VAT registered at 20%, rate 120", () => {
  const r = run({ vatRegistered: true, rate: 120 });
  it("matches the brief", () => {
    expect(r2(r.monthly.booking)).toBe(2188.8);
    expect(r2(r.monthly.vat)).toBe(364.8);
    expect(r2(r.monthly.platformFees)).toBe(339.26);
    expect(r2(r.monthly.profit)).toBe(-19.26);
    expect(p1(reach(r.breakEven) as number)).toBe(61);
    expect(r2(reach(r.minRate) as number)).toBe(121.56);
  });
});

describe("6. target solver", () => {
  it("£500 a month: £130.02 a night, or 82.4% occupancy", () => {
    const r = run({ target: 500 });
    expect(r2(reach(r.target.rate) as number)).toBe(130.02);
    expect(p1(reach(r.target.occupancy) as number)).toBe(82.4);
  });
});

describe("7. sensitivity (annual, full precision)", () => {
  it("levers and order", () => {
    const l = sensitivity(base(), content);
    // Full precision: the brief's 1,849.56 and 1,237.32 round the monthly change first (agreed: 1,849.54 and 1,237.28).
    expect(l.map((x) => [x.id, r2(x.gain)])).toEqual([
      ["rate", 1849.54],
      ["occupancy", 1237.28],
      ["stay", 912],
      ["turnover", 729.6],
      ["fee", 218.88],
    ]);
  });
  it("direct +10 points is added (taken from the highest-fee channel) only when channels are used", () => {
    const l = sensitivity(base({ feeMode: "channels", shares: { airbnb: 100, booking: 0, direct: 0, other: 0 }, airbnbModel: "host-only", directFee: 1.5, directFixed: 0.2 }), content);
    const d = l.find((x) => x.id === "direct")!;
    // 10% of 1,824 × (15.5% − 1.5%) − 0.608 stays × £0.20, × 12.
    expect(r2(d.gain)).toBe(r2((0.1 * 1824 * 0.14 - 0.608 * 0.2) * 12));
  });
});

describe("8. cash flow", () => {
  const i = base({ monthly: { mortgagePayment: 700, mortgageInterest: 500, rent: 0, energy: 0, broadband: 0, councilTax: 0, software: 0, serviceCharge: 0, other: 700 } });
  const r = calculate(i, content);
  it("capital 200, cash flow −162.72, cash squeeze insight", () => {
    expect(r2(r.fixed.total)).toBe(1200);
    expect(r2(r.fixed.capital)).toBe(200);
    expect(r2(r.monthly.profit)).toBe(37.28);
    expect(r2(r.monthly.cash)).toBe(-162.72);
    expect(all(i).some((x) => x.id === "cashSqueeze" && x.text.includes("£163 short each month"))).toBe(true);
  });
  it("interest left as ‘same as payment’ means interest-only", () => {
    const x = run({ monthly: { ...base().monthly, mortgagePayment: 500, mortgageInterest: null, other: 700 } });
    expect(x.fixed.capital).toBe(0);
    expect(r2(x.fixed.interest)).toBe(500);
  });
});

describe("9. tax estimate (England, just me, test 8)", () => {
  const mk = (band: string) => {
    const i = base({ monthly: { mortgagePayment: 700, mortgageInterest: 500, rent: 0, energy: 0, broadband: 0, councilTax: 0, software: 0, serviceCharge: 0, other: 700 }, tax: { on: true, nation: "england", band, ownership: "me", roomInHome: false } });
    const t = taxEstimate(i, calculate(i, content), content);
    if (!t.available) throw new Error("expected an estimate");
    return t;
  };
  it("higher rate: now 1,378.94, from 2027 1,387.89; basic now 89.47; after-tax cash −3,331.58", () => {
    const h = mk("higher");
    expect(r2(h.annualInterest)).toBe(6000);
    expect(r2(h.taxable)).toBe(6447.36);
    expect(r2(h.columns[0].tax)).toBe(1378.94);
    expect(r2(h.columns[1].tax)).toBe(1387.89);
    expect(r2(h.columns[0].afterTaxCash)).toBe(-3331.58);
    expect(r2(mk("basic").columns[0].tax)).toBe(89.47);
  });
  it("companies get no estimate; Scotland has one column with a 2027 note", () => {
    const i = base({ tax: { on: true, nation: "england", band: "basic", ownership: "company", roomInHome: false } });
    expect(taxEstimate(i, calculate(i, content), content)).toEqual({ available: false, reason: "Tax estimate not available for companies in this tool." });
    const s = base({ tax: { on: true, nation: "scotland", band: "intermediate", ownership: "me", roomInHome: false } });
    const t = taxEstimate(s, calculate(s, content), content);
    expect(t.available && t.columns.length).toBe(1);
    expect(t.available && t.note2027).toContain("check Scottish rates");
  });
});

describe("10. Rent a Room", () => {
  it("21,888 receipts: normal method likely better; £7,000: likely tax-free", () => {
    const i = base({ monthly: { mortgagePayment: 700, mortgageInterest: 500, rent: 0, energy: 0, broadband: 0, councilTax: 0, software: 0, serviceCharge: 0, other: 700 }, tax: { on: true, nation: "england", band: "basic", ownership: "me", roomInHome: true } });
    const t = taxEstimate(i, calculate(i, content), content);
    const rr = t.available ? t.rentARoom : null;
    expect(rr?.kind === "compare" && [r2(rr.receipts), r2(rr.rentARoomTaxable), r2(rr.normalTaxable), rr.better]).toEqual([21888, 14388, 6447.36, "normal"]);
    const low = base({ occupancy: 7000 / (100 * 30.4 * 12) * 100, tax: { on: true, nation: "england", band: "basic", ownership: "me", roomInHome: true } });
    const t2 = taxEstimate(low, calculate(low, content), content);
    expect(t2.available && t2.rentARoom && t2.rentARoom.kind).toBe("taxFree");
  });
});

describe("11. Detailed mode, 2027", () => {
  const i = { ...ensureMonths(base({ mode: "detailed", year: 2027, months: [] })), mode: "detailed" as const };
  const r = calcDetailed(i, content);
  it("219 nights, profit 455.50, February a loss", () => {
    expect(r2(r.annual.nights)).toBe(219);
    expect(r2(r.annual.profit)).toBe(455.5);
    expect(r.lossMonths).toEqual([1]);
    expect(r2(r.months[1].profit)).toBe(-60.4);
    expect(r2(r.months[3].profit)).toBe(21);
    expect(r2(r.months[0].profit)).toBe(61.7);
    expect(r.bestMonth).toBe(0);
  });
  it("annual break-even uses Σ(A × c)", () => {
    const c = r.months[0].contribution;
    expect(reach(r.breakEven)).toBeCloseTo((12 * 1200) / (365 * c), 10);
  });
  it("Copy January to all, and shapes scale from Quick values", () => {
    const j = copyJanuary({ ...i, months: i.months.map((m, k) => (k === 0 ? { ...m, rate: 150 } : m)) });
    expect(j.months.every((m) => m.rate === 150)).toBe(true);
    const coastal = applyShape(base(), content.shapes.find((s) => s.id === "coastal")!);
    expect(coastal.months[7].rate).toBe(140);
    expect(coastal.months[7].occupancy).toBe(93);
  });
});

describe("12. payback", () => {
  it("£6,000 at £37.28 a month: 160.9 months, 13 years 5 months", () => {
    const r = run({ setupCosts: 6000 });
    expect(Math.round(r.kpis.paybackMonths! * 10) / 10).toBe(160.9);
    expect(paybackText(r.kpis.paybackMonths, r.kpis.paybackReached)).toBe("13 years 5 months");
    const neg = run({ setupCosts: 6000, rate: 50 });
    expect(paybackText(neg.kpis.paybackMonths, neg.kpis.paybackReached)).toBe("Not reached at current cash flow");
  });
});

describe("13. VAT and Making Tax Digital notices", () => {
  it("rate 300 at 85%: 93,024 a year, over the VAT threshold; MTD from April 2026", () => {
    const i = base({ rate: 300, occupancy: 85 });
    const r = calculate(i, content);
    const n = notices(i, r, content);
    expect(r2(r.annual.booking)).toBe(93024);
    expect(n.vat).toBe("over");
    expect(n.mtd).toBe("from April 2026");
    expect(all(i).some((x) => x.id === "vatOver" && x.text === "Your figures are over the VAT registration threshold. You may need to register.")).toBe(true);
  });
  it("80% of the threshold is ‘close’, and VAT-registered hosts get no notice", () => {
    const close = base({ rate: 250, occupancy: 85 });
    expect(notices(close, calculate(close, content), content).vat).toBe("close");
    const reg = base({ rate: 300, occupancy: 85, vatRegistered: true });
    expect(notices(reg, calculate(reg, content), content).vat).toBeNull();
  });
});

describe("14. edge cases", () => {
  it("occupancy 0%: profit is −fixed, minimum rate asks for occupancy", () => {
    const r = run({ occupancy: 0 });
    expect(r.monthly.profit).toBe(-1200);
    expect(reach(r.minRate)).toBe("Add an occupancy above 0%");
  });
  it("each booked night loses money", () => {
    expect(reach(run({ rate: 20, turnover: 60, avgStay: 1 }).breakEven)).toBe("Not reachable: each booked night loses money");
  });
  it("break-even over 100%", () => {
    expect(reach(run({ monthly: { ...base().monthly, other: 5000 } }).breakEven)).toBe("Not reachable: even a full calendar can’t cover your costs");
  });
  it("fees take the whole price", () => {
    expect(reach(run({ simpleFee: 60, mgmt: { kind: "percent", percent: 45, basis: "room", fixed: 0 } }).minRate)).toBe("Not reachable: fees and management take the whole price");
  });
  it("channel shares must add up to 100%; results still never NaN", () => {
    const i = base({ feeMode: "channels", shares: { airbnb: 70, booking: 20, direct: 0, other: 0 } });
    expect(validate(i).shares).toBe("Your channel shares add up to 90%. They need to add up to 100%.");
    const r = calculate({ ...i, rate: Number.NaN, occupancy: Number.POSITIVE_INFINITY }, content);
    expect(Number.isFinite(r.monthly.profit)).toBe(true);
  });
  it("validation messages are plain English", () => {
    expect(validate(base({ rate: 0 })).rate).toBe("Enter a nightly rate of at least £1.");
    expect(validate(base({ occupancy: 120 })).occupancy).toBe("Enter an occupancy between 0% and 100%.");
  });
});

describe("15. stored figures drive the results", () => {
  const edit = (key: string, value: unknown) => readContent({ ...figures, [key]: { ...figures[key], value: value as never } });
  it("daysPerMonth 30.42 changes the nights", () => {
    const c = edit("profit.model", { json: { ...content.model, daysPerMonth: 30.42 } });
    expect(r2(run({}, c).monthly.nights)).toBe(18.25);
  });
  it("a lower VAT threshold triggers the notice", () => {
    const c = edit("vat.registrationThreshold", 20000);
    const i = base();
    expect(notices(i, calculate(i, c), c).vat).toBe("over");
  });
  it("the model version is readable for the changelog", () => {
    expect(content.model.version).toBe(2);
    expect(content.model.versionDate).toBe("2026-11-26");
  });
});

describe("16. scenarios and hand-off", () => {
  it("save 3, compare, differences highlighted", () => {
    let list = addScenario([], "Now", base(), 5).list;
    list = addScenario(list, "Higher price", base({ rate: 120 }), 5).list;
    list = addScenario(list, "Longer stays", base({ avgStay: 4 }), 5).list;
    expect(list.map((s) => s.name)).toEqual(["Now", "Higher price", "Longer stays"]);
    const rows = compareScenarios(list, content);
    expect(rows.find((x) => x.label === "Nightly rate")).toMatchObject({ values: ["£100.00", "£120.00", "£100.00"], differs: true });
    expect(rows.find((x) => x.label === "Turnover cost")).toBeUndefined();
    expect(rows.find((x) => x.label === "Profit a month")!.differs).toBe(true);
    let full = list;
    for (let k = 0; k < 3; k++) full = addScenario(full, `x${k}`, base(), 5).list;
    expect(full).toHaveLength(5);
    expect(addScenario(full, "too many", base(), 5).full).toBe(true);
  });
  it("Compare with long-letting writes the right fields", () => {
    const i = base({ monthly: { mortgagePayment: 700, mortgageInterest: 500, rent: 0, energy: 0, broadband: 0, councilTax: 0, software: 0, serviceCharge: 0, other: 700 } });
    const h = profitHandoffData(i, calculate(i, content), content, false);
    expect(h).toMatchObject({ nightlyRate: 100, occupancyPercent: 60, averageStay: 3, turnoverCost: 50, platformFeePercent: 15.5, monthlyProfit: 37.28, monthlyCashFlow: -162.72, annualFixedCosts: 14400, region: "england", london: false });
  });
});

describe("money flow", () => {
  it("guest payments to cash flow, leaving out empty steps", () => {
    const steps = moneyFlow(run().monthly);
    expect(steps.map((s) => s.id)).toEqual(["booking", "fees", "turnovers", "bills", "profit", "cash"]);
    expect(r2(steps.find((s) => s.id === "profit")!.amount)).toBe(37.28);
  });
});
