import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/visitorLevyId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/uk-visitor-levy-calculator. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "UK Tourist Tax Calculator: Edinburgh, Cardiff & More | VA for BnB",
  absoluteTitle: true,
  description: "Calculate the visitor levy for a stay in Edinburgh, Glasgow, Aberdeen, Stirling, West Dunbartonshire or Cardiff, using each area’s rules. Free.",
  keywords: ["tourist tax calculator", "Edinburgh visitor levy calculator", "Cardiff visitor levy", "Glasgow visitor levy", "UK tourist tax Airbnb"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Stay legal", path: jobHref("legal") },
    { name: "Visitor levy calculator", path: toolPath },
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
    name: "Visitor levy calculator",
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
