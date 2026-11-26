import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import { afterTax, breakEvenRent, compare, defaultInputs, exampleInputs, fiveYear, importFromProfit, longNet, readContent, shortNet, timeView, validate, whatThisMeans, winnerText, type Inputs } from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Test 1: profit 1,500 (already includes the costs either way, which are 0), rent 1,200, collection 10%, 2 void weeks, landlord costs 100. */
const t1 = (over: Partial<Inputs> = {}): Inputs => ({ ...defaultInputs(content), shortProfit: 1500, includesShared: true, rent: 1200, agent: "collection", agentPercent: 10, voidWeeks: 2, otherMonthly: 100, ...over });

describe("1. the base comparison", () => {
  it("long net 938.46; +561.54 a month; 6,738.46 a year (full precision); break-even rent 1,848.89; minimum short profit 938.46", () => {
    const c = compare(t1(), content);
    expect(r2(c.long.net)).toBe(938.46);
    expect(r2(c.diff)).toBe(561.54);
    // The brief's 6,738.48 rounds the monthly figure first; agreed to keep full precision.
    expect(r2(c.yearly)).toBe(6738.46);
    expect(c.breakEvenRent.ok && r2(c.breakEvenRent.value)).toBe(1848.89);
    expect(r2(c.minShortProfit)).toBe(938.46);
    expect(c.winner).toBe("short");
    expect(winnerText(c, content)).toBe("Short-letting earns £562 more a month (£6,738 a year)");
  });
});

describe("2. tenant find, maintenance %, gas", () => {
  it("long net 931.15", () => {
    const i = t1({ agent: "find", findKind: "pounds", findPounds: 600, tenancyMonths: 12, maintKind: "percent", maintPercent: 5, gasAnnual: 180 });
    expect(r2(longNet(i, content).net)).toBe(931.15);
  });
});

describe("3. costs either way", () => {
  it("interest 500, already included: long 438.46, difference 1,061.54; not included: short 1,000, difference 561.54", () => {
    const shared = { interest: 500, serviceCharge: 0, groundRent: 0, buildingsInsurance: 0, other: 0 };
    const yes = compare(t1({ shared }), content);
    expect([r2(yes.long.net), r2(yes.diff)]).toEqual([438.46, 1061.54]);
    const no = compare(t1({ shared, includesShared: false }), content);
    expect([r2(no.short.net), r2(no.diff)]).toEqual([1000, 561.54]);
    expect(r2(no.minShortProfit)).toBe(938.46);
  });
});

describe("4. agent fees quoted excluding VAT", () => {
  it("12% of rent received: fee 138.46, long net 915.38", () => {
    const l = longNet(t1({ agentExVat: true }), content);
    expect([r2(l.agentFee), r2(l.net)]).toEqual([138.46, 915.38]);
  });
});

describe("5. your time", () => {
  it("£75.00 and £469.23 an hour; £31.20 per extra hour; time-adjusted 291.54", () => {
    const i = t1({ shortHours: 20, longHours: 2, hourValue: 15 });
    const t = timeView(i, compare(i, content));
    expect([r2(t.shortPerHour!), r2(t.longPerHour!), r2(t.extraPerHour!), r2(t.timeAdjusted!)]).toEqual([75, 469.23, 31.2, 291.54]);
  });
});

describe("6. after tax", () => {
  it("higher rate, current: 336.92 a month", () => {
    const i = t1({ taxBand: "higher" });
    expect(r2(afterTax(i, compare(i, content).diff, content).monthly)).toBe(336.92);
    const s = t1({ taxNation: "scotland", taxBand: "intermediate" });
    expect(afterTax(s, 100, content).rate).toBe(0.21);
  });
});

describe("7–8. five years", () => {
  it("7. no growth: 33,692.31; long-let now with a £5,000 switch-to-short cost: 28,692.31, payback 8.9 months", () => {
    expect(r2(fiveYear(t1(), content).cumulative)).toBe(33692.31);
    const f = fiveYear(t1({ start: "long", switchToShort: 5000 }), content);
    expect(r2(f.cumulative)).toBe(28692.31);
    expect(f.payback).toMatchObject({ text: "8.9 months" });
    expect(f.months[0]).toBe(-5000);
    expect(r2(f.months[60])).toBe(28692.31);
  });
  it("short-let now, switching to long: the cost adds to the difference; and a gain ≤ 0 is not paid back", () => {
    const f = fiveYear(t1({ start: "short", switchToLong: 2000, resale: 500 }), content);
    expect(r2(f.cumulative)).toBe(r2(33692.31 + 1500));
    expect(f.payback?.text).toBe("Not paid back");
  });
  it("8. rent growth 3%: 29,840.00", () => {
    expect(r2(fiveYear(t1({ rentGrowth: 3 }), content).cumulative)).toBe(29840);
  });
});

describe("9–10. spread costs", () => {
  it("9. EICR 250 → 4.17, EPC 90 → 0.75, licence 600 over 5 years → 10.00", () => {
    const p = longNet(t1({ eicr: 250, epc: 90, licenceCost: 600, licenceYears: 5 }), content).periodic;
    expect([r2(p.eicr), r2(p.epc), r2(p.licence)]).toEqual([4.17, 0.75, 10]);
  });
  it("10. tenant find of 4 weeks’ rent: 1,107.69 over 24 months → 46.15", () => {
    const l = longNet(t1({ agent: "find", findKind: "weeks", findWeeks: 4, tenancyMonths: 24 }), content);
    expect([r2(l.tenantFindFee), r2(l.tenantFind)]).toEqual([1107.69, 46.15]);
  });
});

describe("11. about the same", () => {
  it("under £25 a month", () => {
    const c = compare(t1({ shortProfit: 950 }), content);
    expect(c.winner).toBe("same");
    expect(winnerText(c, content)).toBe("About the same");
    expect(whatThisMeans(t1({ shortProfit: 950 }), c, content)).toMatch(/^The money is close/);
  });
});

describe("12. validation", () => {
  it("void weeks 53, negative rent, tenancy 0", () => {
    const e = validate(t1({ voidWeeks: 53, rent: -1, tenancyMonths: 0 }));
    expect(e.voidWeeks).toBe("Void weeks must be between 0 and 52.");
    expect(e.rent).toBe("Rent can’t be negative.");
    expect(e.tenancyMonths).toBe("Tenancy length must be at least 1 month.");
    expect(Object.keys(validate(t1()))).toEqual([]);
  });
});

describe("13. stored figures drive the results", () => {
  const edit = (key: string, value: unknown) => readContent({ ...figures, [key]: { ...figures[key], value: value as never } });
  it("tax rates, default long-let hours, EICR interval", () => {
    const tax = edit("tax.propertyIncome", { json: { ...(figures["tax.propertyIncome"].value as { json: object }).json, current: { basic: 20, higher: 50, additional: 45 } } });
    expect(r2(afterTax(t1({ taxBand: "higher" }), 100, tax).monthly)).toBe(50);
    const svl = (figures["shortVsLong.content"].value as { json: { defaults: object } }).json;
    const hours = edit("shortVsLong.content", { json: { ...svl, defaults: { ...svl.defaults, longHours: 4 } } });
    expect(defaultInputs(hours).longHours).toBe(4);
    const eicr = edit("longLet.eicrMonths", 36);
    expect(r2(longNet(t1({ eicr: 360 }), eicr).periodic.eicr)).toBe(10);
  });
});

describe("14. import from the profit calculator", () => {
  const data = { monthlyProfit: 1500, sharedCosts: { mortgageInterest: 500, serviceCharge: 0, groundRent: 20, insurance: 30 }, vatRegistered: true };
  it("sets the profit, the ‘already includes’ flag and the costs either way", () => {
    const r = importFromProfit(defaultInputs(content), data, content)!;
    expect(r.inputs.shortProfit).toBe(1500);
    expect(r.inputs.includesShared).toBe(true);
    expect(r.inputs.shared).toEqual({ interest: 500, serviceCharge: 0, groundRent: 20, buildingsInsurance: 30, other: 0 });
    expect(r.inputs.vatRegistered).toBe(true);
    expect(r.summary).toBe("Imported: profit £1,500/month (includes mortgage interest £500, service charge £0)");
  });
  it("never overwrites what the host already filled in", () => {
    const filled = { ...defaultInputs(content), shortProfit: 1200, shared: { ...defaultInputs(content).shared, interest: 400 } };
    const r = importFromProfit(filled, data, content)!;
    expect(r.inputs.shortProfit).toBe(1200);
    expect(r.inputs.shared.interest).toBe(400);
    expect(r.fields).toEqual([]);
  });
});

describe("15. break-even rent with maintenance and arrears %", () => {
  it("the rent found gives L = S within £0.01 (also with tenant find in weeks)", () => {
    for (const over of [{ maintKind: "percent" as const, maintPercent: 5, arrearsPercent: 3, gasAnnual: 180 }, { agent: "find" as const, findKind: "weeks" as const, findWeeks: 4, arrearsPercent: 2, agentExVat: true }]) {
      const i = t1(over);
      const b = breakEvenRent(i, content);
      expect(b.ok).toBe(true);
      if (!b.ok) return;
      expect(Math.abs(longNet(i, content, b.value).net - shortNet(i).net)).toBeLessThan(0.01);
    }
  });
});

describe("example and wording", () => {
  it("the example is test 1, and short-wins wording", () => {
    const e = exampleInputs(content);
    const c = compare(e, content);
    expect(r2(c.long.net)).toBe(938.46);
    expect(whatThisMeans({ ...e, shortHours: 20, longHours: 2 }, c, content)).toBe("On your figures, short-letting earns about £562 more a month, or £31.20 for each extra hour you put in. A long let would need a rent of £1,848.89 to match.");
  });
});
