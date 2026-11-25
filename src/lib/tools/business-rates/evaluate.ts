import { numberFigure, numberListFigure, type Figures } from "../figures";
import type { CoveredNation, DayField, DayTest, Inputs, Nation, Outcome, TestId, WalesBreakdown, Warning } from "./types";

/** Day counts are whole numbers from 0 to this. */
export const MAX_DAYS = 366;

/** Figure keys this tool reads. */
export const figureKeys = {
  minAvailable: (n: CoveredNation) => `${n}.businessRates.minAvailableDays`,
  minLet: (n: CoveredNation) => `${n}.businessRates.minLetDays`,
  premiumMax: (n: CoveredNation) => `${n}.councilTax.secondHomePremiumMax`,
  maxCharityDays: "wales.businessRates.maxCharityDays",
  averagingYears: "wales.businessRates.averagingYears",
  rulesLastChecked: "rulesLastChecked",
};

export const allFigureKeys = [
  ...(["england", "scotland", "wales"] as const).flatMap((n) => [figureKeys.minAvailable(n), figureKeys.minLet(n), figureKeys.premiumMax(n)]),
  figureKeys.maxCharityDays,
  figureKeys.averagingYears,
  figureKeys.rulesLastChecked,
];

/* ---- Which fields each nation asks for ---------------------------------- */

export function fieldsFor(nation: Nation, averaging = false): DayField[] {
  switch (nation) {
    case "england":
      return ["availableLast", "availableNext", "letLast"];
    case "scotland":
      return ["availableNext", "letLast"];
    case "wales":
      return ["availableLast", "availableNext", "letLast", ...(averaging ? (["letYear2", "letYear3"] as const) : []), "charityDays"];
    case "ni":
      return [];
  }
}

export function requiredFor(nation: Nation, averaging = false): DayField[] {
  if (nation === "wales") return ["availableLast", "availableNext", "letLast", ...(averaging ? (["letYear2"] as const) : [])];
  return fieldsFor(nation, averaging);
}

/* ---- Parsing ------------------------------------------------------------ */

export type Parsed = { state: "empty" } | { state: "ok"; value: number } | { state: "error"; message: string };

/** Read one day count. Empty means "not entered"; never returns NaN. */
export function parseDays(raw: string | number | undefined | null): Parsed {
  if (raw === undefined || raw === null) return { state: "empty" };
  const s = String(raw).trim();
  if (s === "") return { state: "empty" };
  if (/^-/.test(s)) return { state: "error", message: "Days can’t be negative." };
  if (!/^\d+$/.test(s)) return { state: "error", message: /^\d*[.,]\d*$/.test(s) ? "Use whole days, without decimals." : "Enter a number of days." };
  const n = Number(s);
  if (n > MAX_DAYS) return { state: "error", message: `Enter a number from 0 to ${MAX_DAYS}.` };
  return { state: "ok", value: n };
}

/* ---- Evaluate ------------------------------------------------------------ */

const plural = (n: number) => (n === 1 ? "day" : "days");

/**
 * Does the property meet the day-count tests for business rates?
 * Every threshold, cap and premium comes from `figures`.
 */
export function evaluate(nation: Nation, inputs: Inputs, figures: Figures): Outcome {
  const base: Outcome = { nation, overall: "incomplete", tests: [], daysNeeded: {}, premiumMax: null, warnings: [], errors: {}, missing: [] };
  if (nation === "ni") return { ...base, overall: "not-covered" };

  const averaging = nation === "wales" && !!inputs.averaging;
  const premiumMax = numberFigure(figures, figureKeys.premiumMax(nation));
  const minAvailable = numberFigure(figures, figureKeys.minAvailable(nation));
  const minLet = numberFigure(figures, figureKeys.minLet(nation));

  // Parse every field this nation shows.
  const values: Partial<Record<DayField, number>> = {};
  const errors: Partial<Record<DayField, string>> = {};
  for (const f of fieldsFor(nation, averaging)) {
    const p = parseDays(inputs[f]);
    if (p.state === "ok") values[f] = p.value;
    if (p.state === "error") errors[f] = p.message;
  }

  // Warnings (don't block the result).
  const warnings: Warning[] = [];
  const availableRef = values.availableLast ?? values.availableNext;
  if (values.letLast !== undefined && availableRef !== undefined && values.letLast > availableRef) {
    warnings.push({ code: "let-exceeds-available", message: "Days let are higher than days available. Check your numbers." });
  }
  let maxCharity = 0;
  if (nation === "wales") {
    maxCharity = numberFigure(figures, figureKeys.maxCharityDays);
    if ((values.charityDays ?? 0) > maxCharity) {
      warnings.push({ code: "charity-capped", message: `Only ${maxCharity} charity days can count. We’ve used ${maxCharity}.` });
    }
  }

  const missing = requiredFor(nation, averaging).filter((f) => values[f] === undefined && !errors[f]);
  if (Object.keys(errors).length) return { ...base, premiumMax, warnings, errors, missing };

  // Wales: averaging must use an allowed number of years.
  let wales: WalesBreakdown | undefined;
  if (nation === "wales") {
    const years = averaging
      ? ([values.letLast, values.letYear2, values.letYear3].filter((v) => v !== undefined) as number[])
      : values.letLast !== undefined
        ? [values.letLast]
        : [];
    if (averaging && missing.length === 0) {
      const allowed = numberListFigure(figures, figureKeys.averagingYears);
      if (!allowed.includes(years.length)) {
        return { ...base, premiumMax, warnings, errors: { letYear3: `Average over ${allowed.join(" or ")} years.` }, missing };
      }
    }
    if (years.length) {
      const average = averaging ? years.reduce((a, b) => a + b, 0) / years.length : null;
      const letUsed = average === null ? years[0] : Math.floor(average);
      const charityEntered = values.charityDays ?? 0;
      const charityCounted = Math.min(charityEntered, maxCharity);
      wales = { averaged: averaging, years, letUsed, average, charityEntered, charityCounted, total: letUsed + charityCounted };
    }
  }

  if (missing.length) return { ...base, premiumMax, warnings, missing, wales };

  const test = (id: TestId, name: string, required: number, value: number): DayTest => ({
    id,
    name,
    required,
    value,
    passed: value >= required,
    daysNeeded: Math.max(0, required - value),
  });

  const tests: DayTest[] =
    nation === "scotland"
      ? [test("availableNext", "Available days this year", minAvailable, values.availableNext!), test("let", "Let days last year", minLet, values.letLast!)]
      : [
          test("availableLast", "Available days, last 12 months", minAvailable, values.availableLast!),
          test("availableNext", "Available days, next 12 months", minAvailable, values.availableNext!),
          test("let", nation === "wales" ? "Let days" : "Let days, last 12 months", minLet, nation === "wales" ? wales!.total : values.letLast!),
        ];

  return {
    ...base,
    overall: tests.every((t) => t.passed) ? "passes" : "not-yet",
    tests,
    daysNeeded: Object.fromEntries(tests.map((t) => [t.id, t.daysNeeded])),
    premiumMax,
    warnings,
    wales,
  };
}

/* ---- Sentences ------------------------------------------------------------ */

export const decider: Record<CoveredNation, string> = {
  england: "The Valuation Office Agency decides.",
  wales: "The Valuation Office Agency decides.",
  scotland: "Your local assessor decides.",
};

/** "You need 1 more available day in the last 12 months and 8 more let days." Only short tests are mentioned. */
export function shortfallLine(o: Outcome): string {
  const phrase = (t: DayTest) => {
    const n = t.daysNeeded;
    if (t.id === "let") return `${n} more let ${plural(n)}`;
    if (o.nation === "scotland") return `${n} more available ${plural(n)} this year`;
    return t.id === "availableLast" ? `${n} more available ${plural(n)} in the last 12 months` : `${n} more available ${plural(n)} in the next 12 months`;
  };
  const parts = o.tests.filter((t) => !t.passed).map(phrase);
  if (!parts.length) return "";
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `You need ${list}.`;
}

/** "Let days: 62 of 70 · 8 more needed". */
export function testRowText(t: DayTest): string {
  return `${t.name}: ${t.value} of ${t.required}${t.passed ? "" : ` · ${t.daysNeeded} more needed`}`;
}

/** Wales: "Let days used: 182 (average of 170, 194) + 14 charity days = 196". */
export function walesLine(w: WalesBreakdown): string {
  const used = w.averaged ? `${w.letUsed} (average of ${w.years.join(", ")}, rounded down)` : `${w.letUsed}`;
  return `Let days used: ${used} + ${w.charityCounted} charity ${plural(w.charityCounted)} = ${w.total}`;
}

export function resultLines(o: Outcome): string[] {
  if (o.nation === "ni" || o.overall === "not-covered") return [];
  const nation = o.nation as CoveredNation;
  if (o.overall === "passes") {
    return [
      `Your property meets the day-count tests, so it can be assessed for business rates. ${decider[nation]}`,
      "You may be able to get small business rate relief, which has its own conditions.",
    ];
  }
  if (o.overall === "not-yet") {
    return [shortfallLine(o), `Until then, council tax applies, and your council may charge a second-home premium of up to ${o.premiumMax}%.`];
  }
  return [];
}

/** "What this means", chosen by the result. */
export function whatThisMeans(o: Outcome | null): string {
  if (!o || o.overall === "incomplete") return "Enter your days above to see your result.";
  if (o.overall === "not-covered") return "Northern Ireland has its own rating system. Check with Land & Property Services.";
  if (o.overall === "passes")
    return "Your property meets the tests. Ask the assessor to review it if it’s still on council tax. Keep booking records, because you may need to show them.";
  const shortLet = o.tests.some((t) => t.id === "let" && !t.passed);
  const shortAvailable = o.tests.some((t) => t.id !== "let" && !t.passed);
  const parts: string[] = [];
  if (shortAvailable) parts.push("Make the property available for more days in the year, and keep a record that you advertised it.");
  if (shortLet) parts.push("Focus on bookings. More let days, for example longer stays in quiet months, could help you meet the test.");
  return parts.join(" ");
}
