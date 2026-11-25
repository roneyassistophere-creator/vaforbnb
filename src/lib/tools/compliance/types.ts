/**
 * Types for the UK short-let compliance checker.
 * Rules and figures are data (stored in Postgres, seeded from src/data); the
 * checker logic in this folder is pure and runs in the browser and in tests.
 */

export type Nation = "england" | "london" | "scotland" | "wales" | "ni";
/** London counts as England for national rules. */
export type Region = "england" | "scotland" | "wales" | "ni";
export type LetType = "whole-home" | "room-in-my-home";
export type YesNo = "yes" | "no";
export type GasAnswer = "yes" | "no" | "not-sure";
export type Ownership = "owned" | "mortgaged" | "leasehold" | "rent-to-rent";
export type Extra = "serve-food" | "provide-tv" | "cctv-or-doorbell-camera" | "direct-bookings" | "none";

/** What the host has answered so far. Optional fields are unanswered. */
export type Answers = {
  nation?: Nation;
  area?: string;
  letType?: LetType;
  mainHome?: YesNo;
  gas?: GasAnswer;
  ownership: Ownership[];
  extras: Extra[];
};

/** A complete, validated set of answers. */
export type CompleteAnswers = Required<Omit<Answers, "area">> & { area?: string };

/** Facts the rule conditions are matched against. */
export type Facts = {
  nation: Nation;
  region: Region;
  area: string | null;
  letType: LetType;
  mainHome: YesNo;
  gasOn: boolean;
  ownership: Ownership[];
  /** Never contains "none". */
  extras: Exclude<Extra, "none">[];
};

/* ---- Conditions (stored as JSON) ---------------------------------------- */

export type FieldCondition = {
  field: keyof Facts;
  eq?: string | boolean;
  in?: Array<string | boolean>;
  /** For array fields: true when the array contains this value. */
  includes?: string;
};
export type Condition =
  | Record<string, never> // {} → always applies
  | { all: Condition[] }
  | { any: Condition[] }
  | FieldCondition;

/* ---- Rules and figures (admin-editable data) ---------------------------- */

export type RuleStatus = "law-now" | "coming" | "platform-rule" | "contract-rule";
export type RuleGroup = "must-do" | "coming-soon" | "check-contract";

export type SourceRef = { title: string; url: string | null };

export type ComplianceRule = {
  ruleId: string;
  title: string;
  status: RuleStatus;
  group: RuleGroup;
  conditions: Condition;
  /** May contain {figure.key} placeholders; see `fillTemplate`. */
  summary: string;
  /**
   * Used when a dated figure this rule needs doesn't exist for the host's area
   * (e.g. visitor levy for "Another Scottish council"). Always "Coming soon".
   */
  summaryOther?: string | null;
  whatToDo: string[];
  sourceTitle: string;
  sourceUrl: string | null;
  /** Per-region source, overriding sourceTitle/sourceUrl. */
  sourcesByRegion?: Partial<Record<Region, SourceRef>> | null;
  rulesHubAnchor: string;
  /**
   * Figures this rule uses. "{area}" is replaced with the host's area,
   * e.g. "levy.{area}". A dated figure (one with a `start`) decides the
   * group: on/after start → Must do now, before → Coming soon.
   */
  dataKeys?: string[] | null;
  order: number;
  /** ISO date. */
  lastChecked: string;
  active: boolean;
  /** True while the rule's source still needs confirming. */
  verify?: boolean;
};

/** Figures are shared by every tool (see src/lib/tools/figures.ts). */
export type { Figure, FigureValue, Figures } from "../figures";

/* ---- Results ------------------------------------------------------------ */

export type ResultRule = {
  ruleId: string;
  title: string;
  status: RuleStatus;
  group: RuleGroup;
  summary: string;
  whatToDo: string[];
  source: SourceRef;
  rulesHubAnchor: string;
};

export type ResultCounts = { mustDo: number; comingSoon: number; checkContract: number; total: number };

export type ComplianceResult = {
  groups: Record<RuleGroup, ResultRule[]>;
  counts: ResultCounts;
  /** The host said "Not sure" about gas: show the gas note. */
  gasNotSure: boolean;
};

export type ValidationErrors = Partial<Record<keyof Answers, string>>;
