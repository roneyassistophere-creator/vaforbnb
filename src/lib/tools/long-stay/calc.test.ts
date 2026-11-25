import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import { money } from "../format";
import {
  addScenario,
  breakEvenDiscountText,
  breakEvenOccupancyText,
  cleanForm,
  cleanScenarios,
  compareStays,
  defaultForm,
  exampleForm,
  headline,
  londonFromCounter,
  parseForm,
  rateFromProfit,
  formFromProfit,
  readContent,
  removeScenario,
  resultText,
  sensitivity,
  turnoversText,
  whatThisMeans,
  type Inputs,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const T1: Inputs = { nightlyRate: 100, periodNights: 28, discount: 0.2, occupancy: 0.6, averageStay: 3, turnoverCost: 50, fee: 0.155, runningCost: 0, midCleans: 0, midCleanCost: 50, longFee: 0.155, london: false };
const run = (over: Partial<Inputs> = {}, c = content) => compareStays({ ...T1, ...over, longFee: over.longFee ?? over.fee ?? T1.longFee }, c);
const r2 = (n: number) => Math.round(n * 100) / 100;
const pct1 = (x: number | null) => (x === null ? null : Math.round(x * 1000) / 10);

describe("compareStays (stored figures)", () => {
  it("1. the example", () => {
    const r = run();
    expect(r.shortNights).toBeCloseTo(16.8, 10);
    expect(r.shortStays).toBeCloseTo(5.6, 10);
    expect(r2(r.shortNet)).toBe(1139.6);
    expect(r2(r.longNet)).toBe(1842.8);
    expect(r.better).toBe("long");
    expect(r2(r.difference)).toBe(703.2);
    expect(pct1(r.breakEvenDiscount.value)).toBe(49.7);
    expect(pct1(r.breakEvenOccupancy.value)).toBe(97.0);
    expect(r.turnoversSaved.toFixed(1)).toBe("4.6");
    expect(r2(r.guestNightly)).toBe(80);
    expect(r2(r.guestTotal)).toBe(2240);
    expect(r.thresholdLabel).toBe("monthly");
    expect(headline(r)).toBe("Long stay earns £703 more");
    expect(breakEvenDiscountText(r)).toBe("Break-even discount: 49.7%. You could discount up to this and still match short stays.");
    expect(breakEvenOccupancyText(r)).toBe("Short stays would need 97.0% occupancy to beat this discount.");
    expect(turnoversText(r)).toBe("Turnovers saved: 4.6 (about 5 fewer cleans)");
  });

  it("2. running cost £8 per occupied night", () => {
    const r = run({ runningCost: 8 });
    expect(r2(r.shortNet)).toBe(1005.2);
    expect(r2(r.longNet)).toBe(1618.8);
    expect(r2(r.difference)).toBe(613.6);
    expect(pct1(r.breakEvenDiscount.value)).toBe(45.9);
  });

  it("3. one mid-stay clean at £50", () => {
    const r = run({ midCleans: 1, midCleanCost: 50 });
    expect(r2(r.longNet)).toBe(1792.8);
    expect(pct1(r.breakEvenDiscount.value)).toBe(47.6);
  });

  it("4. weekly", () => {
    const r = run({ nightlyRate: 80, periodNights: 7, occupancy: 0.7, averageStay: 2, turnoverCost: 40, discount: 0.1 });
    expect(r2(r.shortNet)).toBe(233.24);
    expect(r2(r.longNet)).toBe(385.88);
    expect(r.better).toBe("long");
    expect(r2(r.difference)).toBe(152.64);
    expect(pct1(r.breakEvenDiscount.value)).toBe(42.3);
    expect(r.thresholdLabel).toBe("weekly");
  });

  it("5. occupancy 100%: short stays earn more", () => {
    const r = run({ occupancy: 1 });
    expect(r2(r.shortNet)).toBe(1899.33);
    expect(r2(r.longNet)).toBe(1842.8);
    expect(r.better).toBe("short");
    expect(r2(-r.difference)).toBe(56.53);
    expect(pct1(r.breakEvenDiscount.value)).toBe(17.6);
    expect(headline(r)).toBe("Short stays earn £57 more");
    expect(r.notes).toContain("occupancyAboveBreakEven");
  });

  it("6. occupancy 0%", () => {
    const r = run({ occupancy: 0 });
    expect(r2(r.shortNet)).toBe(0);
    expect(r2(r.difference)).toBe(1842.8);
    expect(pct1(r.breakEvenDiscount.value)).toBe(97.9);
    expect(r.turnoversSaved).toBe(0);
    expect(turnoversText(r)).toBe("Turnovers saved: none.");
  });

  it("7. short stays win", () => {
    const r = run({ occupancy: 0.9, averageStay: 7, discount: 0.3 });
    expect(r2(r.shortNet)).toBe(1949.4);
    expect(r2(r.longNet)).toBe(1606.2);
    expect(r.better).toBe("short");
    expect(r2(-r.difference)).toBe(343.2);
    expect(pct1(r.breakEvenDiscount.value)).toBe(15.5);
    expect(pct1(r.breakEvenOccupancy.value)).toBe(74.2);
    expect(whatThisMeans(r, false)).toBe("On these numbers, short stays earn £343 more. A long stay only wins if your discount is below 15.5% or short-stay occupancy is under 74.2%.");
  });

  it("8. discount 0%: short stays can't beat it even fully booked", () => {
    const r = run({ discount: 0 });
    expect(r2(r.longNet)).toBe(2316);
    expect(pct1(r.breakEvenOccupancy.value)).toBe(121.9);
    expect(r.breakEvenOccupancy.edge).toBe("cannotBeat");
    expect(breakEvenOccupancyText(r)).toBe("Short stays can’t beat this long stay, even fully booked.");
  });

  it("8b. very low rate: short stays lose money, no division error", () => {
    const r = run({ nightlyRate: 20, turnoverCost: 60, averageStay: 1 });
    expect(r.breakEvenOccupancy).toEqual({ value: null, edge: "shortLoses" });
    expect(breakEvenOccupancyText(r)).toBe("Short stays lose money at this rate, so any long stay beats them.");
    expect(r.breakEvenDiscount.edge).toBe("longAlways");
    expect(breakEvenDiscountText(r)).toBe("A long stay earns more at any discount.");
    for (const v of [r.shortNet, r.longNet, r.difference, r.breakEvenDiscount.value]) expect(Number.isFinite(v)).toBe(true);
  });

  it("9. threshold label and notes by period", () => {
    expect(run({ periodNights: 6 }).thresholdLabel).toBe("tooShort");
    const r90 = run({ periodNights: 90 });
    expect(r90.notes).toContain("london90");
    expect(r90.notes).toContain("tenancy");
    const r60 = run({ periodNights: 60 });
    expect(r60.notes).toContain("tenancy");
    expect(r60.notes).not.toContain("london90");
    expect(run({ periodNights: 59 }).notes).not.toContain("tenancy");
    // London flag (imported from the 90-night counter): a 28-night stay still counts.
    expect(run({ london: true }).notes).toContain("londonCounts");
  });

  it("10. sensitivity row at 40%", () => {
    const rows = sensitivity(T1, content.settings.sensitivitySteps, content);
    expect(rows.map((x) => Math.round(x.discount * 100))).toEqual([0, 5, 10, 15, 20, 25, 30, 40]);
    expect(r2(rows.find((x) => Math.round(x.discount * 100) === 40)!.longNet)).toBe(1369.6);
    expect(rows.filter((x) => x.own).map((x) => x.discount)).toEqual([0.2]);
    // The host's own discount is added when it isn't a step.
    const own = sensitivity({ ...T1, discount: 0.18 }, content.settings.sensitivitySteps, content);
    expect(own).toHaveLength(9);
    expect(own.find((x) => x.own)!.discount).toBe(0.18);
  });

  it("11. highlight badge at the stored threshold", () => {
    expect(run({ discount: 0.09 }).highlighted).toBe(false);
    expect(run({ discount: 0.1 }).highlighted).toBe(true);
  });

  it("12. validation: inline errors, no result", () => {
    const base = exampleForm(content);
    for (const [k, v] of [
      ["nightlyRate", "0"],
      ["turnoverCost", "-5"],
      ["averageStay", "0"],
      ["occupancyPercent", "101"],
      ["nightlyRate", "abc"],
      ["periodNights", "181"],
    ] as const) {
      const p = parseForm({ ...base, [k]: v }, content);
      expect(p.inputs, `${k}=${v}`).toBeNull();
      expect(p.errors[k]).toBeTruthy();
    }
    const ok = parseForm(base, content);
    expect(ok.errors).toEqual({});
    expect(ok.inputs).toMatchObject({ nightlyRate: 100, periodNights: 28, discount: 0.2, occupancy: 0.6, fee: 0.155, longFee: 0.155, midCleanCost: 50 });
  });

  it("13. a difference under £10 is 'About the same'", () => {
    // Find a discount where the difference is within £10.
    const r = run({ occupancy: 1, discount: 0.175 });
    expect(Math.abs(r.difference)).toBeLessThan(10);
    expect(r.better).toBe("same");
    expect(headline(r)).toBe("About the same");
    expect(whatThisMeans(r, true)).toBe("It’s close. A long stay gives you steadier income and fewer turnovers for about the same money. That’s your Get more bookings kit done.");
  });

  it("14. stored figures drive the labels, no code change", () => {
    const f30: Figures = { ...figures, "platform.monthlyDiscountMinNights": { ...figures["platform.monthlyDiscountMinNights"], value: 30 } };
    expect(run({}, readContent(f30)).thresholdLabel).toBe("weekly");
    expect(run({ periodNights: 30 }, readContent(f30)).thresholdLabel).toBe("monthly");
    const hl: Figures = { ...figures, "platform.discountHighlightMinPercent": { ...figures["platform.discountHighlightMinPercent"], value: 25 } };
    expect(run({}, readContent(hl)).highlighted).toBe(false);
    expect(readContent(figures).fees).toEqual({ airbnb: 0.155, direct: 0.015 });
  });

  it("15. saved scenarios keep their inputs and results; 3 compare side by side", () => {
    let list = addScenario([], "Monthly 20%", exampleForm(content), content, new Date("2026-11-25T10:00:00Z"));
    list = addScenario(list, "Monthly 30%", { ...exampleForm(content), discountPercent: "30" }, content, new Date("2026-11-25T10:01:00Z"));
    list = addScenario(list, "Weekly", { ...exampleForm(content), periodNights: "7" }, content, new Date("2026-11-25T10:02:00Z"));
    expect(list.map((s) => s.name)).toEqual(["Monthly 20%", "Monthly 30%", "Weekly"]);
    expect(r2(list[0].summary.longNet)).toBe(1842.8);
    expect(list[1].form.discountPercent).toBe("30");
    const reloaded = cleanScenarios(JSON.parse(JSON.stringify(list)), content, (f) => cleanForm(f, content));
    expect(reloaded).toHaveLength(3);
    expect(reloaded.slice(0, content.settings.compareMax)).toHaveLength(3);
    expect(removeScenario(reloaded, reloaded[1].id).map((s) => s.name)).toEqual(["Monthly 20%", "Weekly"]);
    // Full: the oldest drops off.
    let many = list;
    for (let n = 0; n < 4; n++) many = addScenario(many, `Extra ${n}`, exampleForm(content), content, new Date(Date.UTC(2026, 10, 25, 11, n)));
    expect(many).toHaveLength(content.settings.maxScenarios);
    expect(many[0].name).toBe("Weekly"); // 3 + 4 = 7 saved: the two oldest drop off
    // An invalid form isn't saved.
    expect(addScenario([], "Bad", { ...exampleForm(content), nightlyRate: "0" }, content)).toEqual([]);
  });
});

describe("text, copy and imports", () => {
  it("What this means: long better, in the kit", () => {
    expect(whatThisMeans(run(), true)).toBe("On these numbers, one long stay earns £703 more and saves about 5 turnovers. A discount up to 49.7% would still beat short stays. That’s your Get more bookings kit done.");
  });

  it("copy result has the inputs, both nets, the difference, the date and the disclaimer", () => {
    const t = resultText(T1, run(), content, "Estimates only.");
    expect(t).toContain("Nightly rate: £100.00 · Period: 28 nights · Discount: 20.0%");
    expect(t).toContain("net £1,139.60");
    expect(t).toContain("net £1,842.80");
    expect(t).toContain("Long stay earns £703 more (difference £703.20)");
    expect(t).toContain("Figures last checked 17 November 2026.");
    expect(t.endsWith("Estimates only.")).toBe(true);
    expect(money(-56.53)).toBe("−£56.53");
  });

  it("imports: nightly rate from the profit calculator, London flag from the counter", () => {
    expect(rateFromProfit({ nightlyRate: 120 })).toBe(120);
    expect(rateFromProfit({ nightlyRate: 0 })).toBeNull();
    // The profit calculator's hand-off also carries the turnover cost, platform fee, occupancy and stay.
    expect(formFromProfit({ nightlyRate: 100, turnoverCost: 50, platformFeePercent: 15.5, occupancyPercent: 60, averageStay: 3 })).toEqual({ nightlyRate: "100", turnoverCost: "50", feePercent: "15.5", occupancyPercent: "60", averageStay: "3" });
    expect(formFromProfit({ nightlyRate: 100, platformFeePercent: 140 })).toEqual({ nightlyRate: "100" });
    expect(rateFromProfit("x")).toBeNull();
    expect(londonFromCounter({ london: true })).toBe(true);
    expect(londonFromCounter({})).toBe(false);
  });

  it("defaults come from stored figures", () => {
    expect(defaultForm(content)).toMatchObject({ nightlyRate: "100", periodNights: "28", discountPercent: "20", occupancyPercent: "60", averageStay: "3", turnoverCost: "50", feePercent: "15.5" });
  });
});
