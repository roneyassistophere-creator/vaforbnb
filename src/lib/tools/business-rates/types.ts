/** Types for the holiday let business rates qualifier. */

export type Nation = "england" | "scotland" | "wales" | "ni";
export type CoveredNation = Exclude<Nation, "ni">;

export type DayField = "availableLast" | "availableNext" | "letLast" | "letYear2" | "letYear3" | "charityDays";

/** What the host typed. Strings keep exactly what was entered so mistakes can be explained. */
export type Inputs = Partial<Record<DayField, string | number>> & { averaging?: boolean };

export type TestId = "availableLast" | "availableNext" | "let";

export type DayTest = {
  id: TestId;
  name: string;
  required: number;
  value: number;
  passed: boolean;
  /** max(0, required − value) */
  daysNeeded: number;
};

export type Warning = { code: "let-exceeds-available" | "charity-capped"; message: string };

export type WalesBreakdown = {
  averaged: boolean;
  /** Let days per year used for the average (last year first). */
  years: number[];
  /** Let days used: last year, or the average rounded down. */
  letUsed: number;
  /** The exact average before rounding down (null when not averaging). */
  average: number | null;
  charityEntered: number;
  charityCounted: number;
  total: number;
};

export type Overall = "passes" | "not-yet" | "incomplete" | "not-covered";

export type Outcome = {
  nation: Nation;
  overall: Overall;
  tests: DayTest[];
  daysNeeded: Partial<Record<TestId, number>>;
  /** Maximum second-home council tax premium for the nation, in %. */
  premiumMax: number | null;
  warnings: Warning[];
  /** Inline errors per field (negative, decimal, over the limit). */
  errors: Partial<Record<DayField, string>>;
  /** Required fields still empty. */
  missing: DayField[];
  wales?: WalesBreakdown;
};
