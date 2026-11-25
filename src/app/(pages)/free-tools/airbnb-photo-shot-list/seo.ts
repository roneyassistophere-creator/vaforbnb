import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/photoShotListId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/airbnb-photo-shot-list. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Airbnb Photo Order & Shot List Planner | VA for BnB",
  absoluteTitle: true,
  description: "Get your Airbnb photo order and a full shot list: cover photo, first five, every room for the photo tour, captions with real details and shooting tips. Free.",
  keywords: ["Airbnb photo order", "Airbnb shot list", "Airbnb cover photo", "Airbnb photo tour", "Airbnb photo captions"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Get more bookings", path: jobHref("bookings") },
    { name: "Photo shot list planner", path: toolPath },
  ],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.7,
  lastModified: "2026-11-25",
});

export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Photo shot list planner",
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
