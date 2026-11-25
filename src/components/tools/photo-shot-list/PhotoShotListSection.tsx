import { getFigures } from "@/lib/server/figures";
import { jsonFigure, pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/photo-shot-list";
import type { Model } from "@/lib/tools/ai-readiness";
import { PhotoShotListTool } from "./PhotoShotListTool";

/** Server side: reads the stored rules (cached), plus the AI-readiness scorer's vague-word list for captions. */
export async function PhotoShotListSection() {
  const figures = await getFigures();
  let vague: string[] = [];
  try {
    vague = jsonFigure<Model>(figures, "aiReadiness.model").vague.flatMap((v) => v.variants);
  } catch {
    // Without the list, captions just aren't checked for vague words.
  }
  return <PhotoShotListTool figures={pickFigures(figures, figureKeys)} vague={vague} />;
}
