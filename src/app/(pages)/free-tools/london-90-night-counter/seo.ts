import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/londonNightsId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/london-90-night-counter. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "London 90-Day Rule Calculator for Airbnb | VA for BnB",
  absoluteTitle: true,
  description: "Count your London short-let nights across Airbnb, Booking.com and direct bookings. See nights used and left under the 90-night rule. Free.",
  keywords: ["London 90 day rule", "Airbnb 90 day rule London calculator", "London short let nights", "90 night limit counter", "London Airbnb planning permission"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Stay legal", path: jobHref("legal") },
    { name: "London 90-night counter", path: toolPath },
  ],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.7,
  lastModified: brand.content.rulesLastCheckedISO,
});

export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "London 90-night counter",
    url: absoluteUrl(toolPath),
    description: seo.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    areaServed: { "@type": "City", name: "London", containedInPlace: { "@type": "Country", name: "GB" } },
    provider: { "@id": `${brand.siteUrl}/#organization` },
  },
];
