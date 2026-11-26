import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/bookingPerformanceId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/occupancy-adr-revpar-calculator. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Occupancy, ADR & RevPAR Calculator for Airbnb | VA for BnB",
  absoluteTitle: true,
  description: "Calculate your short let's occupancy, average daily rate and RevPAR in seconds, compare with last year, and see what drove the change. Free tool for UK hosts.",
  keywords: ["occupancy calculator", "ADR calculator", "RevPAR calculator", "average daily rate", "Airbnb KPIs", "year on year"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Know my numbers", path: jobHref("numbers") },
    { name: "Booking performance", path: toolPath },
  ],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.7,
  lastModified: "2026-11-26",
});

export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Occupancy, ADR and RevPAR calculator",
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
