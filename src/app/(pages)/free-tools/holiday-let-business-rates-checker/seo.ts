import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { toolPath, toolSlug } from "@/content/tools/businessRates";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/holiday-let-business-rates-checker. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Holiday Let Business Rates Checker (140/70, 252/182) | VA for BnB",
  absoluteTitle: true,
  description:
    "Check if your holiday let qualifies for business rates: England and Scotland 140/70 days, Wales 252/182. See how many more days you need. Free.",
  keywords: [
    "holiday let business rates",
    "140 70 rule",
    "252 182 rule Wales",
    "self-catering business rates",
    "holiday let council tax",
    "second home premium",
  ],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Stay legal", path: jobHref("legal") },
    { name: "Business rates qualifier", path: toolPath },
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
    name: "Holiday let business rates qualifier",
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
