import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/profitId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/short-let-profit-calculator. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Holiday Let & Airbnb Profit Calculator UK | VA for BnB",
  absoluteTitle: true,
  description: "Work out your real monthly profit, cash flow, break-even occupancy and minimum nightly rate for a UK short let, after platform fees, cleaning and bills. Free.",
  keywords: ["Airbnb profit calculator", "holiday let calculator", "short let profit", "break-even occupancy", "Airbnb cash flow", "holiday let tax", "ROI"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Know my numbers", path: jobHref("numbers") },
    { name: "Short-let profit calculator", path: toolPath },
  ],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.8,
  lastModified: "2026-11-26",
});

export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Short-let profit calculator",
    url: absoluteUrl(toolPath),
    description: seo.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    areaServed: { "@type": "Country", name: "GB" },
    provider: { "@id": `${brand.siteUrl}/#organization` },
  },
];
