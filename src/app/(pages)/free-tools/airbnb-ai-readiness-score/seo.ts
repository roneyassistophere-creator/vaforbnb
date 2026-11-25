import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/aiReadinessId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/airbnb-ai-readiness-score. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Airbnb AI Search Listing Score (Free) | VA for BnB",
  absoluteTitle: true,
  description: "Score your Airbnb listing for AI search in 3 minutes. Find vague words, missing facts and amenities, and get your top 3 fixes with examples. Free, UK hosts.",
  keywords: ["Airbnb AI search", "Airbnb listing score", "AI-readiness score", "Airbnb description checker", "Airbnb listing optimisation UK"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Get more bookings", path: jobHref("bookings") },
    { name: "AI-readiness listing scorer", path: toolPath },
  ],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.8,
  lastModified: "2026-11-25",
});

export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI-readiness listing scorer",
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
