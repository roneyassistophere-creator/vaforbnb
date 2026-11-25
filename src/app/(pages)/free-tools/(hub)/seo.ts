import { isLive, tools } from "./content";
import { brand } from "@/config/brand";
import { absoluteUrl, definePageSeo } from "@/lib/seo";
import { routes } from "@/config/navigation";

/** SEO for /free-tools. Edit freely. */
export const seo = definePageSeo({
  path: routes.freeTools,
  title: "Free Airbnb Host Tools for UK Hosts",
  description: `${brand.stats.freeToolsCount} free tools for UK short-let hosts: a compliance checker, profit calculator, AI-readiness listing scorer, London 90-night counter and more. No login, nothing stored.`,
  keywords: [
    "free Airbnb host tools",
    "Airbnb profit calculator UK",
    "short-let compliance checker",
    "London 90 night counter",
    "Airbnb listing checker",
  ],
  navKey: "freeTools",
  breadcrumbs: [{ name: "Free tools", path: routes.freeTools }],
  schemaType: "CollectionPage",
  changeFrequency: "weekly",
  priority: 0.8,
  lastModified: brand.content.rulesLastCheckedISO,
});

/** Extra structured data for this page (JSON-LD): every live tool. */
export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free tools for UK short-let hosts",
    itemListElement: tools
      .filter((t) => isLive(t))
      .map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "WebApplication",
          name: t.name,
          description: t.q,
          ...(t.href ? { url: absoluteUrl(t.href) } : {}),
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
        },
      })),
  },
];
