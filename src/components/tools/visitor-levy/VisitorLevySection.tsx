import { getFigures } from "@/lib/server/figures";
import { getLondonToday } from "@/lib/server/today";
import { isLevyFigure } from "@/lib/tools/visitor-levy";
import { VisitorLevyCalculator } from "./VisitorLevyCalculator";

/** Server side: reads the stored figures (cached) and hands the browser only the levy ones. */
export async function VisitorLevySection() {
  const [figures, today] = await Promise.all([getFigures(), getLondonToday()]);
  const levy = Object.fromEntries(Object.entries(figures).filter(([k]) => isLevyFigure(k)));
  return <VisitorLevyCalculator figures={levy} today={today} />;
}
