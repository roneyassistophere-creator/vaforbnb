import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/title-checker";
import { TitleCheckerTool } from "./TitleCheckerTool";

/** Server side: reads the stored rules (cached) and hands the browser only what it needs. */
export async function TitleCheckerSection() {
  const figures = await getFigures();
  return <TitleCheckerTool figures={pickFigures(figures, figureKeys)} />;
}
