import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/direct-booking";
import { DirectBookingTool } from "./DirectBookingTool";

/** Server side: reads the stored figures (cached) and hands the browser only what it needs. */
export async function DirectBookingSection() {
  const figures = await getFigures();
  return <DirectBookingTool figures={pickFigures(figures, figureKeys)} />;
}
