import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import {
  calculateLevy,
  chargeableNights,
  emptyInputs,
  exVat,
  FEES_NOTE,
  fieldsFor,
  formatPence,
  listAreas,
  logCsv,
  logTotals,
  parseArea,
  parsePounds,
  resolveChoice,
  statusText,
  stayNights,
  whatThisMeans,
  type LevyInputs,
  type LogEntry,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const area = (id: string, f: Figures = figures) => parseArea(id, f)!;
const inputs = (over: Partial<LevyInputs>): LevyInputs => ({ ...emptyInputs(), ...over });
const calc = (id: string, over: Partial<LevyInputs>, f: Figures = figures) => {
  const c = calculateLevy(area(id, f), inputs(over), f);
  if (!c.ok) throw new Error(`Expected a result, got ${JSON.stringify(c)}`);
  return c.result;
};
const withArea = (id: string, patch: Record<string, string>): Figures => {
  const f = figures[`levy.calc.${id}`];
  return { ...figures, [f.key]: { ...f, value: { ...(f.value as Record<string, string>), ...patch } } };
};

describe("nights", () => {
  it("check-in 1 Aug for 7 nights covers 1–7 Aug", () => {
    const n = stayNights("2026-08-01", 7);
    expect(n[0]).toBe("2026-08-01");
    expect(n[6]).toBe("2026-08-07");
    expect(n).toHaveLength(7);
  });
  it("cap takes the first in-force nights", () => {
    const r = chargeableNights(area("edinburgh"), stayNights("2026-07-22", 10));
    expect(r.notInForce).toEqual(["2026-07-22", "2026-07-23"]);
    expect(r.chargeable).toEqual(["2026-07-24", "2026-07-25", "2026-07-26", "2026-07-27", "2026-07-28"]);
  });
});

describe("calculateLevy", () => {
  it("1. Edinburgh, 7 nights at £150 → £37.50, £5.36 per night", () => {
    const r = calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150" });
    expect(r.totalPence).toBe(3750);
    expect(r.perNightPence).toBe(536);
    expect(r.chargeable).toHaveLength(5);
    expect(r.status).toBe("inForce");
    expect(r.capped).toBe(true);
    expect(r.lines).toEqual(["5 nights × £150.00 × 5% = £37.50"]);
    expect(r.nights.map((n) => n.status)).toEqual(["charged", "charged", "charged", "charged", "charged", "capped", "capped"]);
    expect(r.nights[0].levyPence).toBe(750);
    expect(r.stayPricePence).toBe(105000);
  });

  it("2. Edinburgh booked and paid before the cut-off → £0, exempt", () => {
    const r = calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150", bookedPaidBefore: true });
    expect(r.totalPence).toBe(0);
    expect(r.status).toBe("exempt");
    expect(r.exemptReason).toBe("Exempt: booked and paid before 1 October 2025");
    expect(statusText(r)).toBe("Exempt");
  });

  it("3. Cardiff, 3 nights, 2 guests, standard → £7.80", () => {
    const r = calc("cardiff", { checkIn: "2027-04-01", nights: "3", guests: "2" });
    expect(r.totalPence).toBe(780);
    expect(r.lines).toEqual(["3 nights × 2 guests × £1.30 = £7.80"]);
  });

  it("4. Cardiff, the night before the start → £0, not in force", () => {
    const r = calc("cardiff", { checkIn: "2027-03-31", nights: "1", guests: "2" });
    expect(r.totalPence).toBe(0);
    expect(r.status).toBe("notInForce");
    expect(statusText(r)).toBe("Not in force yet");
    expect(r.notes).toContain("Not in force yet for these dates. Cardiff’s levy starts 1 April 2027.");
  });

  it("5. Stirling, 10 nights at £100 → 7 × 100 × 3% = £21.00", () => {
    expect(calc("stirling", { checkIn: "2027-07-01", nights: "10", price: "100" }).totalPence).toBe(2100);
  });

  it("6. Glasgow, 4 nights at £120 → £24.00", () => {
    expect(calc("glasgow", { checkIn: "2027-02-01", nights: "4", price: "120" }).totalPence).toBe(2400);
  });

  it("7. Aberdeen, 3 nights at £99.99 → £20.9979 → £21.00", () => {
    expect(calc("aberdeen", { checkIn: "2027-05-01", nights: "3", price: "99.99" }).totalPence).toBe(2100);
  });

  it("8. Edinburgh crossing the start date → partly in force", () => {
    const r = calc("edinburgh", { checkIn: "2026-07-22", nights: "4", price: "100" });
    expect(r.totalPence).toBe(1000);
    expect(r.notInForce).toEqual(["2026-07-22", "2026-07-23"]);
    expect(r.chargeable).toEqual(["2026-07-24", "2026-07-25"]);
    expect(statusText(r)).toBe("Partly in force: 2 of 4 nights");
  });

  it("9. Edinburgh, prices by night → first 5 = £720 × 5% = £36.00", () => {
    const r = calc("edinburgh", { checkIn: "2026-09-01", nights: "6", priceMode: "byNight", prices: ["100", "120", "150", "150", "200", "200"] });
    expect(r.totalPence).toBe(3600);
    expect(r.lines[0]).toBe("£720.00 across 5 nights × 5% = £36.00");
    expect(r.stayPricePence).toBeNull();
  });

  it("10. Edinburgh, £120 including VAT → £100.00 ex VAT; 3 nights → £15.00", () => {
    const r = calc("edinburgh", { checkIn: "2026-09-01", nights: "3", price: "120", includesVat: true });
    expect(r.totalPence).toBe(1500);
    expect(r.notes).toContain("Price excluding VAT: £100.00");
    expect(r.stayPricePence).toBe(36000);
  });

  it("11. Cardiff hostel rate: 2 guests × 2 nights × £0.75 = £3.00", () => {
    expect(calc("cardiff", { checkIn: "2027-05-01", nights: "2", guests: "2", accommodation: "lower" }).totalPence).toBe(300);
  });

  it("12. Cardiff crossing the start → only 1 Apr charged", () => {
    const r = calc("cardiff", { checkIn: "2027-03-30", nights: "3", guests: "1" });
    expect(r.totalPence).toBe(130);
    expect(statusText(r)).toBe("Partly in force: 1 of 3 nights");
  });

  it("13. Glasgow, 1 night at £33.33 → £1.6665 → £1.67 (half up)", () => {
    expect(calc("glasgow", { checkIn: "2027-02-01", nights: "1", price: "33.33" }).totalPence).toBe(167);
  });

  it("14. validation: 0 nights, a negative price, 0 guests → errors, no result", () => {
    const a = calculateLevy(area("edinburgh"), inputs({ checkIn: "2026-08-01", nights: "0", price: "150" }), figures);
    expect(a.ok).toBe(false);
    expect(!a.ok && a.errors.nights).toMatch(/1 to 365/);
    const b = calculateLevy(area("edinburgh"), inputs({ checkIn: "2026-08-01", nights: "3", price: "-5" }), figures);
    expect(!b.ok && b.errors.price).toBe("Enter a price of £0 or more.");
    const c = calculateLevy(area("cardiff"), inputs({ checkIn: "2027-05-01", nights: "3", guests: "0" }), figures);
    expect(!c.ok && c.errors.guests).toMatch(/1 to 30/);
    const d = calculateLevy(area("edinburgh"), inputs({ checkIn: "", nights: "3", price: "" }), figures);
    expect(!d.ok && d.missing).toEqual(["the check-in date", "the price per night"]);
    expect(parsePounds("abc")).toBeNaN();
    expect(parsePounds("£1,200.5")).toBe(120050);
  });

  it("15. another council or England → no levy data, no calculation", () => {
    expect(resolveChoice("scotland-other", figures)).toEqual({ kind: "other", id: "scotland-other", name: "Another Scottish council" });
    expect(resolveChoice("england", figures).kind).toBe("other");
    expect(whatThisMeans(null, null)).toMatch(/don’t have a levy for this area/);
  });

  it("16. changing a stored figure changes the results", () => {
    const f = withArea("edinburgh", { rate: "6" });
    expect(calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150" }, f).totalPence).toBe(4500);
    const noCap = withArea("edinburgh", { nightCap: "" });
    expect(calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150" }, noCap).totalPence).toBe(5250);
    // A new area is just a new row.
    const leeds: Figures = {
      ...figures,
      "levy.calc.test-city": { ...figures["levy.calc.glasgow"], key: "levy.calc.test-city", value: { name: "Test City", nation: "england", order: "9", type: "percent", rate: "2", nightCap: "", start: "2027-01-01", url: "" } },
    };
    expect(listAreas(leeds).map((a) => a.id)).toContain("test-city");
    expect(calc("test-city", { checkIn: "2027-02-01", nights: "2", price: "100" }, leeds).totalPence).toBe(400);
  });

  it("17. fees: ignored with a note unless the area includes them", () => {
    const off = calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150", fees: "70" });
    expect(off.totalPence).toBe(3750);
    expect(off.notes).toContain(FEES_NOTE);
    expect(off.stayPricePence).toBe(105000 + 7000);
    const on = calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150", fees: "70" }, withArea("edinburgh", { feesIncluded: "yes" }));
    expect(on.totalPence).toBe(4000);
    expect(on.lines[1]).toMatch(/^Fees £70\.00 × 5\/7 nights × 5% = £2\.50 \(fees split evenly/);
  });

  it("19. Cardiff needs guests and accommodation type, not prices", () => {
    const c = resolveChoice("cardiff", figures);
    expect(c.kind).toBe("area");
    if (c.kind === "area") expect(fieldsFor(c.area)).toMatchObject({ guests: true, accommodation: true, price: false, exemption: false });
    if (resolveChoice("edinburgh", figures).kind === "area") expect(fieldsFor(area("edinburgh")).exemption).toBe(true);
  });

  it("VAT and money helpers", () => {
    expect(exVat(12000, 20)).toBe(10000);
    expect(exVat(10000, 20)).toBe(8333);
    expect(formatPence(123456)).toBe("£1,234.56");
    expect(formatPence(5)).toBe("£0.05");
  });
});

describe("levy log", () => {
  const entry = (id: string, checkIn: string, levyPence: number, ref = ""): LogEntry => ({
    id,
    reference: ref,
    areaId: "edinburgh",
    areaName: "Edinburgh",
    checkIn,
    nights: 3,
    guests: null,
    chargeableNights: 3,
    levyPence,
    inputs: emptyInputs(),
  });

  it("18. totals by quarter and month, and the CSV", () => {
    const log = [entry("a", "2027-01-10", 1500, "Smith, J"), entry("b", "2027-02-03", 2000), entry("c", "2027-04-20", 1250)];
    const t = logTotals(log);
    expect(t.quarters).toEqual([
      { key: "2027-Q1", label: "Jan–Mar 2027", stays: 2, levyPence: 3500 },
      { key: "2027-Q2", label: "Apr–Jun 2027", stays: 1, levyPence: 1250 },
    ]);
    expect(t.months.map((m) => m.label)).toEqual(["Jan 2027", "Feb 2027", "Apr 2027"]);
    const csv = logCsv(log).trimEnd().split("\r\n");
    expect(csv[0]).toBe("Reference,Area,Check-in,Nights,Guests,Chargeable nights,Levy (£)");
    expect(csv).toHaveLength(4);
    expect(csv[1]).toBe('"Smith, J",Edinburgh,2027-01-10,3,,3,15.00');
  });
});

describe("what this means", () => {
  it("follows the result", () => {
    const ed = area("edinburgh");
    expect(whatThisMeans(ed, calc("edinburgh", { checkIn: "2026-08-01", nights: "7", price: "150" }))).toBe(
      "Add £37.50 to this guest’s total. Show it clearly in your price, and check whether your booking platform collects it for you. The levy only applies to the first 5 nights, so nights after that are free of levy.",
    );
    expect(whatThisMeans(ed, calc("edinburgh", { checkIn: "2026-07-22", nights: "4", price: "100" }))).toContain("Only the nights from 24 July 2026 are charged.");
    expect(whatThisMeans(area("cardiff"), calc("cardiff", { checkIn: "2027-03-31", nights: "1" }))).toMatch(/^No levy is due for these dates\. Cardiff’s levy starts 1 April 2027/);
  });
});
