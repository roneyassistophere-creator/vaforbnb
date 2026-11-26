import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/short-vs-long";
import { SvlTool } from "./SvlTool";

/** Server side: reads the stored figures (cached) and hands the browser only what it needs. */
export async function SvlSection() {
  const figures = await getFigures();
  return <SvlTool figures={pickFigures(figures, figureKeys)} />;
}
