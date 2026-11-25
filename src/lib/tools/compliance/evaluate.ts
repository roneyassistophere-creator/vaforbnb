import { deriveFacts, validate } from "./answers";
import { fillTemplate, formatDate } from "./format";
import { matches } from "./matches";
import { areaName } from "./questions";
import type {
  Answers,
  ComplianceResult,
  ComplianceRule,
  Facts,
  Figures,
  ResultRule,
  RuleGroup,
  RuleStatus,
  ValidationErrors,
} from "./types";

export type EvaluateOutcome = { ok: true; result: ComplianceResult } | { ok: false; errors: ValidationErrors };

export const groupOrder: RuleGroup[] = ["must-do", "coming-soon", "check-contract"];

type Resolved = { group: RuleGroup; status: RuleStatus; summary: string };

/**
 * Work out a rule's group, status and summary text. Rules whose dataKeys
 * point at a dated figure (e.g. "levy.{area}") are grouped by date: on or
 * after the start date → Must do now, before → Coming soon. If the host's
 * area has no figure, `summaryOther` is used and the rule is Coming soon.
 */
function resolveRule(rule: ComplianceRule, facts: Facts, figures: Figures, today: string): Resolved | null {
  const tokens: Record<string, string> = { area: areaName(facts.area) ?? "" };
  let group = rule.group;
  let status = rule.status;

  for (const rawKey of rule.dataKeys ?? []) {
    const perArea = rawKey.includes("{area}");
    const key = rawKey.replace("{area}", facts.area ?? "");
    const value = figures[key]?.value;

    if (perArea && !value) {
      if (!rule.summaryOther) return null;
      return { group: "coming-soon", status: "coming", summary: fillTemplate(rule.summaryOther, figures, tokens) };
    }
    if (value && typeof value === "object" && !Array.isArray(value) && !("json" in value) && typeof value.rate === "string" && typeof value.start === "string") {
      const started = today >= value.start;
      group = started ? "must-do" : "coming-soon";
      status = started ? "law-now" : "coming";
      tokens["dated.rate"] = value.rate;
      tokens["dated.start"] = formatDate(value.start);
      tokens["dated.sinceFrom"] = started ? "since" : "from";
    }
  }

  return { group, status, summary: fillTemplate(rule.summary, figures, tokens) };
}

/**
 * Which rules apply to this property?
 * @param today YYYY-MM-DD in Europe/London (pass a fixed date in tests).
 */
export function evaluate(answers: Answers, rules: ComplianceRule[], figures: Figures, today: string): EvaluateOutcome {
  const checked = validate(answers);
  if (!checked.ok) return { ok: false, errors: checked.errors };

  const facts = deriveFacts(checked.answers);
  const groups: Record<RuleGroup, ResultRule[]> = { "must-do": [], "coming-soon": [], "check-contract": [] };

  const ordered = rules.filter((r) => r.active).sort((a, b) => a.order - b.order);
  for (const rule of ordered) {
    if (!matches(rule.conditions, facts)) continue;
    const resolved = resolveRule(rule, facts, figures, today);
    if (!resolved) continue;
    const source = rule.sourcesByRegion?.[facts.region] ?? { title: rule.sourceTitle, url: rule.sourceUrl };
    groups[resolved.group].push({
      ruleId: rule.ruleId,
      title: rule.title,
      status: resolved.status,
      group: resolved.group,
      summary: resolved.summary,
      whatToDo: rule.whatToDo,
      source,
      rulesHubAnchor: rule.rulesHubAnchor,
    });
  }

  const counts = {
    mustDo: groups["must-do"].length,
    comingSoon: groups["coming-soon"].length,
    checkContract: groups["check-contract"].length,
    total: 0,
  };
  counts.total = counts.mustDo + counts.comingSoon + counts.checkContract;

  return { ok: true, result: { groups, counts, gasNotSure: checked.answers.gas === "not-sure" } };
}

/** Rules that would apply to the answers given so far (for the live tally). */
export function partialCounts(answers: Answers, rules: ComplianceRule[], figures: Figures, today: string) {
  // Fill unanswered questions with the least-inclusive choice so the tally only grows.
  const filled: Answers = {
    nation: answers.nation,
    area: answers.area,
    letType: answers.letType ?? "room-in-my-home",
    mainHome: answers.mainHome ?? "yes",
    gas: answers.gas ?? "no",
    ownership: answers.ownership.length ? answers.ownership : ["owned"],
    extras: answers.extras,
  };
  if (!filled.nation) return null;
  if ((filled.nation === "scotland" || filled.nation === "wales") && !filled.area) {
    filled.area = filled.nation === "scotland" ? "scotland-other" : "wales-other";
  }
  const outcome = evaluate(filled, rules, figures, today);
  return outcome.ok ? outcome.result.counts : null;
}
