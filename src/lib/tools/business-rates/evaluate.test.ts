import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import { evaluate, resultLines, resultText, shortfallLine, testRowText, walesLine, whatThisMeans, type Inputs, type Nation } from "./index";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const run = (nation: Nation, inputs: Inputs, f: Figures = figures) => evaluate(nation, inputs, f);
const eng = (availableLast: number, availableNext: number, letLast: number) => run("england", { availableLast, availableNext, letLast });
const wal = (inputs: Inputs) => run("wales", { availableLast: 252, availableNext: 252, ...inputs });

describe("business rates: spec cases", () => {
  it("1. England 140/140/70 passes", () => {
    const o = eng(140, 140, 70);
    expect(o.overall).toBe("passes");
    expect(o.tests.every((t) => t.passed)).toBe(true);
    expect(Object.values(o.daysNeeded).every((n) => n === 0)).toBe(true);
  });

  it("2. England 139/140/70: 1 available day needed (last 12 months)", () => {
    const o = eng(139, 140, 70);
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded).toEqual({ availableLast: 1, availableNext: 0, let: 0 });
    expect(shortfallLine(o)).toBe("You need 1 more available day in the last 12 months.");
  });

  it("3. England 140/140/69: 1 let day needed", () => {
    const o = eng(140, 140, 69);
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded.let).toBe(1);
    expect(shortfallLine(o)).toBe("You need 1 more let day.");
  });

  it("4. England 150/130/80: next-12-months availability short by 10", () => {
    const o = eng(150, 130, 80);
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded).toEqual({ availableLast: 0, availableNext: 10, let: 0 });
    expect(shortfallLine(o)).toBe("You need 10 more available days in the next 12 months.");
  });

  it("5. Scotland 140/70 passes", () => {
    const o = run("scotland", { availableNext: 140, letLast: 70 });
    expect(o.overall).toBe("passes");
    expect(o.tests.map((t) => t.id)).toEqual(["availableNext", "let"]);
    expect(resultLines(o)[0]).toContain("Your local assessor decides.");
  });

  it("6. Scotland 140/60: 10 let days needed", () => {
    const o = run("scotland", { availableNext: 140, letLast: 60 });
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded.let).toBe(10);
  });

  it("7. Wales 252/252/182 passes", () => {
    const o = wal({ letLast: 182 });
    expect(o.overall).toBe("passes");
    expect(resultLines(o)[0]).toContain("The Valuation Office Agency decides.");
  });

  it("8. Wales 252/252/180: 2 let days needed", () => {
    const o = wal({ letLast: 180 });
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded.let).toBe(2);
  });

  it("9. Wales let 170 + 14 charity = 184 passes", () => {
    const o = wal({ letLast: 170, charityDays: 14 });
    expect(o.wales?.total).toBe(184);
    expect(o.overall).toBe("passes");
    expect(walesLine(o.wales!)).toBe("Let days used: 170 + 14 charity days = 184");
  });

  it("10. Wales charity 20 counts as 14 and warns", () => {
    const o = wal({ letLast: 170, charityDays: 20 });
    expect(o.wales?.charityCounted).toBe(14);
    expect(o.wales?.total).toBe(184);
    expect(o.warnings.map((w) => w.message)).toContain("Only 14 charity days can count. We’ve used 14.");
  });

  it("11. Wales averaging [170, 194] → 182 passes", () => {
    const o = wal({ averaging: true, letLast: 170, letYear2: 194 });
    expect(o.wales?.letUsed).toBe(182);
    expect(o.overall).toBe("passes");
  });

  it("12. Wales averaging [170, 180, 190] → 180, 2 needed", () => {
    const o = wal({ averaging: true, letLast: 170, letYear2: 180, letYear3: 190 });
    expect(o.wales?.letUsed).toBe(180);
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded.let).toBe(2);
  });

  it("13. Wales averaging [181, 182] → 181.5 rounded down to 181, 1 needed", () => {
    const o = wal({ averaging: true, letLast: 181, letYear2: 182 });
    expect(o.wales?.average).toBe(181.5);
    expect(o.wales?.letUsed).toBe(181);
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded.let).toBe(1);
  });

  it("14. Let days above available days: warning, result still calculated", () => {
    const o = eng(100, 150, 120);
    expect(o.warnings.map((w) => w.code)).toContain("let-exceeds-available");
    expect(o.overall).toBe("not-yet");
    expect(o.tests).toHaveLength(3);
  });

  it("15. Negative, decimal or over-366 input: error, no result", () => {
    for (const bad of ["-5", "70.5", "367", "abc"]) {
      const o = run("england", { availableLast: 140, availableNext: 140, letLast: bad });
      expect(o.overall, bad).toBe("incomplete");
      expect(o.errors.letLast, bad).toBeTruthy();
      expect(o.tests, bad).toEqual([]);
      expect(JSON.stringify(o)).not.toContain("NaN");
    }
  });

  it("16. Missing required field: incomplete", () => {
    const o = run("england", { availableLast: 140, letLast: 70 });
    expect(o.overall).toBe("incomplete");
    expect(o.missing).toEqual(["availableNext"]);
    expect(run("wales", { availableLast: 252, availableNext: 252, letLast: 170, averaging: true }).missing).toEqual(["letYear2"]);
    expect(run("england", { availableLast: "", availableNext: " ", letLast: 70 }).overall).toBe("incomplete");
  });

  it("17. Northern Ireland: not covered, no tests", () => {
    const o = run("ni", { availableLast: 200, letLast: 100 });
    expect(o.overall).toBe("not-covered");
    expect(o.tests).toEqual([]);
    expect(whatThisMeans(o)).toContain("Land & Property Services");
  });

  it("18. Changing a stored figure changes the result", () => {
    const changed: Figures = {
      ...figures,
      "england.businessRates.minLetDays": { ...figures["england.businessRates.minLetDays"], value: 75 },
    };
    expect(eng(140, 140, 70).overall).toBe("passes");
    const o = run("england", { availableLast: 140, availableNext: 140, letLast: 70 }, changed);
    expect(o.overall).toBe("not-yet");
    expect(o.daysNeeded.let).toBe(5);
  });

  it("19. Premium maximum matches the nation", () => {
    expect(eng(10, 10, 1).premiumMax).toBe(100);
    expect(run("scotland", { availableNext: 10, letLast: 1 }).premiumMax).toBe(100);
    expect(wal({ letLast: 1 }).premiumMax).toBe(300);
    expect(resultLines(wal({ letLast: 1 }))[1]).toBe("Until then, council tax applies, and your council may charge a second-home premium of up to 300%.");
  });
});

describe("business rates: wording", () => {
  it("mentions only the short tests, joined naturally", () => {
    expect(shortfallLine(eng(130, 120, 62))).toBe(
      "You need 10 more available days in the last 12 months, 20 more available days in the next 12 months and 8 more let days.",
    );
  });

  it("formats a test row", () => {
    const t = eng(150, 150, 62).tests.find((x) => x.id === "let")!;
    expect(testRowText(t)).toBe("Let days, last 12 months: 62 of 70 · 8 more needed");
  });

  it("never promises an outcome", () => {
    const all = [eng(140, 140, 70), eng(10, 10, 1), wal({ letLast: 182 }), run("scotland", { availableNext: 140, letLast: 70 })];
    for (const o of all) {
      const text = [...resultLines(o), whatThisMeans(o)].join(" ");
      expect(text).not.toMatch(/you will pay business rates|exempt from council tax|you qualify\b/i);
    }
  });

  it("what this means covers both shortfalls", () => {
    const t = whatThisMeans(eng(100, 140, 50));
    expect(t).toContain("available for more days");
    expect(t).toContain("Focus on bookings");
  });

  it("copy text includes figures, outcome, date and disclaimer", () => {
    const text = resultText(eng(150, 150, 62), { heading: "Business rates check", rulesChecked: "17 November 2026", disclaimer: "General information." });
    expect(text).toContain("Nation: England");
    expect(text).toContain("Result: Not yet");
    expect(text).toContain("[ ] Let days, last 12 months: 62 of 70 · 8 more needed");
    expect(text).toContain("Rules last checked 17 November 2026");
  });
});
