import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { toolPath } from "@/content/tools/certificateReminders";
import { getFigures } from "@/lib/server/figures";
import { pickFigures } from "@/lib/tools/figures";
import { figureKeys } from "@/lib/tools/certificates";
import { CertificateReminders } from "./CertificateReminders";

/** Server side: reads the stored figures (cached) and hands the browser only the ones it needs. */
export async function CertificateRemindersSection() {
  const figures = await getFigures();
  return <CertificateReminders figures={pickFigures(figures, figureKeys)} site={{ url: brand.siteUrl, toolPath, rulesPath: routes.ukRules }} />;
}
