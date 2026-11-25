import type { CheckerRule, RuleSection, RuleTemplate } from "@/data/houseRules";
import { jsonFigure, numberFigure, type Figures } from "../figures";

export type WarningType = "charges" | "discrimination" | "dogs" | "indoor" | "refunds" | "tooManyTasks" | "tooLong" | "fee";

export type Content = {
  sections: RuleSection[];
  templates: RuleTemplate[];
  checker: Record<"charges" | "discrimination" | "dogs" | "indoor" | "refunds", CheckerRule>;
  limits: {
    maxTasks: number;
    tooManyTasks: { message: string; why: string; anchor: string };
    maxLines: number;
    tooLong: { message: string; why: string; anchor: string };
    feeNote: string;
  };
  platformLabels: { airbnb: { key: string; label: string }[]; booking: { key: string; label: string }[] };
  listingLimit: number;
};

/** Read the stored content once (throws loudly if a stored item is malformed). */
export function readContent(figures: Figures): Content {
  const checker = jsonFigure<Content["checker"] & { limits: Content["limits"] }>(figures, "houseRules.checker");
  const { limits, ...rules } = checker;
  return {
    sections: jsonFigure(figures, "houseRules.sections"),
    templates: jsonFigure(figures, "houseRules.templates"),
    checker: rules,
    limits,
    platformLabels: jsonFigure(figures, "houseRules.platformLabels"),
    listingLimit: numberFigure(figures, "houseRules.listingLimit"),
  };
}

export type Warning = {
  /** Which answer it's about, e.g. "extra-0", "parking", "tasks". */
  source: string;
  type: WarningType;
  level: "amber" | "red";
  message: string;
  why: string;
  anchor: string;
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-word (or whole-phrase) match, case-insensitive. "£" matches anywhere. */
const has = (text: string, word: string) => (/^\W/.test(word) ? text.includes(word) : new RegExp(`(^|[^a-z0-9])${escape(word.toLowerCase())}($|[^a-z0-9])`).test(text));

/** Check one piece of host-written text. `isRule` adds the assistance-dogs check (extra rules only). */
export function checkText(text: string, source: string, content: Content, isRule = false): Warning[] {
  const t = text.toLowerCase();
  if (!t.trim()) return [];
  const out: Warning[] = [];
  const add = (type: keyof Content["checker"]) => {
    const r = content.checker[type];
    out.push({ source, type, level: r.level, message: r.message, why: r.why, anchor: r.anchor });
  };
  const c = content.checker;
  if (c.discrimination.words.some((w) => has(t, w))) add("discrimination");
  if (c.indoor.words.some((w) => has(t, w)) && !(c.indoor.except ?? []).some((w) => has(t, w))) add("indoor");
  if (c.charges.words.some((w) => has(t, w))) add("charges");
  if (c.refunds.words.some((w) => has(t, w))) add("refunds");
  if (isRule && (c.dogs.restrict ?? []).some((w) => has(t, w)) && c.dogs.words.some((w) => has(t, w)) && !(c.dogs.except ?? []).some((w) => has(t, w))) add("dogs");
  return out;
}

/** Red warnings leave the rule out of every output until it's reworded. */
export const isExcluded = (warnings: Warning[], source: string) => warnings.some((w) => w.source === source && w.level === "red");
