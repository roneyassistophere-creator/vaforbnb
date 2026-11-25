import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { allFigureKeys } from "@/lib/tools/london-nights";
import { LondonNightsCounter } from "./LondonNightsCounter";

/** Server side: reads the stored figures (cached) and hands the browser only the ones it needs. */
export async function LondonNightsSection() {
  const figures = await getFigures();
  return <LondonNightsCounter figures={pickFigures(figures, allFigureKeys)} />;
}
