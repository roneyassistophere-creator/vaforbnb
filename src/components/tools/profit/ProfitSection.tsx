import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/profit";
import { ProfitTool } from "./ProfitTool";

/** Server side: reads the stored figures (cached) and hands the browser only what it needs. */
export async function ProfitSection() {
  const figures = await getFigures();
  return <ProfitTool figures={pickFigures(figures, figureKeys)} />;
}
