import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/guest-register";
import { GuestRegisterTool } from "./GuestRegisterTool";

/** Server side: reads the stored figures (cached) and hands the browser only the ones it needs. */
export async function GuestRegisterSection() {
  const figures = await getFigures();
  return <GuestRegisterTool figures={pickFigures(figures, figureKeys)} />;
}
