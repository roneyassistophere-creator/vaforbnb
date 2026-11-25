import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/long-stay";
import { LongStayTool } from "./LongStayTool";

/** Server side: reads the stored figures (cached) and hands the browser only what it needs. */
export async function LongStaySection() {
  const figures = await getFigures();
  return <LongStayTool figures={pickFigures(figures, figureKeys)} />;
}
