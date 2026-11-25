import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/house-rules";
import { HouseRulesTool } from "./HouseRulesTool";

/** Server side: reads the stored content (cached) and hands the browser only what it needs. */
export async function HouseRulesSection() {
  const figures = await getFigures();
  return <HouseRulesTool figures={pickFigures(figures, figureKeys)} />;
}
