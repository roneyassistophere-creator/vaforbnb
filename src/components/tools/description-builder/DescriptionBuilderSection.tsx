import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/description-builder";
import { DescriptionBuilderTool } from "./DescriptionBuilderTool";

/** Server side: reads the stored templates and the scorer's model and limits (cached), and hands the browser only those. */
export async function DescriptionBuilderSection() {
  const figures = await getFigures();
  return <DescriptionBuilderTool figures={pickFigures(figures, figureKeys)} />;
}
