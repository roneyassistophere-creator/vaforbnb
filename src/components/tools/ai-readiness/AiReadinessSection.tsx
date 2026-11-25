import { getFigures } from "@/lib/server/figures";
import { figureKeys } from "@/lib/tools/ai-readiness";
import { pickFigures } from "@/lib/tools/figures";
import { AiReadinessTool } from "./AiReadinessTool";

/** Server side: reads the stored scoring model (cached) and hands the browser only what it needs. */
export async function AiReadinessSection() {
  const figures = await getFigures();
  return <AiReadinessTool figures={pickFigures(figures, figureKeys)} />;
}
