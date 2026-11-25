import { resultLines, testRowText, walesLine } from "./evaluate";
import type { Outcome } from "./types";

const nationNames = { england: "England", scotland: "Scotland", wales: "Wales", ni: "Northern Ireland" } as const;
const outcomeNames = { passes: "Meets the tests", "not-yet": "Not yet", incomplete: "Add your days to see your result", "not-covered": "Not covered" } as const;

/** Plain-text result for "Copy result". */
export function resultText(o: Outcome, opts: { heading: string; rulesChecked: string; disclaimer: string }): string {
  const lines = [opts.heading, `Nation: ${nationNames[o.nation]}`, `Result: ${outcomeNames[o.overall]}`, ""];
  for (const t of o.tests) lines.push(`${t.passed ? "[x]" : "[ ]"} ${testRowText(t)}`);
  if (o.wales) lines.push(walesLine(o.wales));
  const extra = resultLines(o);
  if (extra.length) lines.push("", ...extra);
  for (const w of o.warnings) lines.push(`Note: ${w.message}`);
  lines.push("", `Rules last checked ${opts.rulesChecked}`, opts.disclaimer);
  return lines.join("\n") + "\n";
}
