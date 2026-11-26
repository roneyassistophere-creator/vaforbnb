import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/booking-performance";
import { PerfTool } from "./PerfTool";

/** Server side: reads the stored figures (cached) and hands the browser only what it needs. */
export async function PerfSection() {
  const figures = await getFigures();
  return <PerfTool figures={pickFigures(figures, figureKeys)} />;
}
