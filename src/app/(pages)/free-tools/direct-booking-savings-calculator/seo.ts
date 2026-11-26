import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { toolPath, toolSlug } from "@/content/tools/directBookingId";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/**
 * SEO for /free-tools/direct-booking-savings-calculator. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, the page is
 * kept out of search results and the sitemap.
 */
export const seo = definePageSeo({
  path: toolPath,
  title: "Airbnb Fee vs Direct Booking Calculator UK | VA for BnB",
  absoluteTitle: true,
  description: "See how much platform fees cost you per booking and per year, and what direct bookings would really save after payment and website costs. Free UK tool.",
  keywords: ["Airbnb fees", "Airbnb commission", "direct bookings", "booking website", "Airbnb service fee", "host fee"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "Know my numbers", path: jobHref("numbers") },
    { name: "Direct booking savings", path: toolPath },
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
    name: "Direct booking savings calculator",
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
