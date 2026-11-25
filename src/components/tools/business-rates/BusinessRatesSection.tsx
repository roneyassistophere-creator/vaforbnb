import { getFigures } from "@/lib/server/figures";
import { allFigureKeys } from "@/lib/tools/business-rates";
import { pickFigures } from "@/lib/tools/figures";
import { BusinessRatesChecker } from "./BusinessRatesChecker";

/** Server side: reads the stored figures (cached) and hands the browser only the ones it needs. */
export async function BusinessRatesSection() {
  const figures = await getFigures();
  return <BusinessRatesChecker figures={pickFigures(figures, allFigureKeys)} />;
}
