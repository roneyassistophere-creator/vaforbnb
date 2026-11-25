import { getFigures } from "@/lib/server/figures";
import { formatDate } from "@/lib/tools/figures";
import { InfoBadge } from "./Badges";

/** "Rules last checked [date]" badge, from the stored `rulesLastChecked` figure (built into the HTML). */
export async function RulesLastCheckedBadge() {
  const figures = await getFigures();
  const v = figures.rulesLastChecked?.value;
  return <InfoBadge dot="#2E8B57">Rules last checked {typeof v === "string" ? formatDate(v) : "monthly"}</InfoBadge>;
}
