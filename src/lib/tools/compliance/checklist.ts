import { groupOrder } from "./evaluate";
import type { ComplianceResult, RuleGroup } from "./types";

export const groupLabels: Record<RuleGroup, string> = {
  "must-do": "Must do now",
  "coming-soon": "Coming soon",
  "check-contract": "Check your contract",
};

/** "14 rules apply: 11 must do now, 2 coming soon, 1 check your contract". Empty groups are left out. */
export function summaryLine(result: ComplianceResult): string {
  const { counts } = result;
  const parts = [
    counts.mustDo && `${counts.mustDo} must do now`,
    counts.comingSoon && `${counts.comingSoon} coming soon`,
    counts.checkContract && `${counts.checkContract} check your contract`,
  ].filter(Boolean);
  return `${counts.total} ${counts.total === 1 ? "rule applies" : "rules apply"}: ${parts.join(", ")}`;
}

/**
 * Plain-text checklist for copying: tick boxes, steps and the Rules Hub link
 * for each rule.
 */
export function checklistText(result: ComplianceResult, opts: { siteUrl: string; rulesHubPath: string; heading: string; dateLabel: string }): string {
  const lines: string[] = [opts.heading, opts.dateLabel, summaryLine(result), ""];
  for (const g of groupOrder) {
    const list = result.groups[g];
    if (!list.length) continue;
    lines.push(groupLabels[g].toUpperCase());
    for (const r of list) {
      lines.push(`[ ] ${r.title}: ${r.summary}`);
      for (const step of r.whatToDo) lines.push(`    - ${step}`);
      lines.push(`    Details: ${opts.siteUrl}${opts.rulesHubPath}#${r.rulesHubAnchor}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}
