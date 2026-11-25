import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/longStayId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/long-stay-discount-calculator. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Weekly & Monthly Discount Calculator for Airbnb | VA for BnB",
  absoluteTitle: true,
  description: "Compare filling a month with short stays against one discounted long stay, after fees and turnovers. Find your break-even discount. Free UK tool.",
  keywords: ["Airbnb monthly discount", "Airbnb weekly discount", "long stay discount calculator", "28 night stay", "mid-term let"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Get more bookings", path: jobHref("bookings") },
    { name: "Long-stay discount calculator", path: toolPath },
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
    name: "Long-stay discount calculator",
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
