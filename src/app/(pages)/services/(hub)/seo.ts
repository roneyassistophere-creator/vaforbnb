import { brand } from "@/config/brand";
import { services } from "@/content/services";
import { definePageSeo } from "@/lib/seo";
import { routes } from "@/config/navigation";

/** SEO for /services. Edit freely. */
export const seo = definePageSeo({
  path: routes.services,
  title: "Airbnb & Short-Let Services for UK Hosts",
  description:
    "Guest communication, pricing, listings, cleaning coordination, direct booking websites, SEO and SOPs. One UK Airbnb virtual assistant team for every part of your short let.",
  keywords: [
    "Airbnb management services UK",
    "short-let services",
    "Airbnb guest communication",
    "Airbnb pricing optimisation",
    "cleaning coordination",
    "direct booking website",
  ],
  navKey: "services",
  breadcrumbs: [{ name: "Services", path: routes.services }],
  schemaType: "CollectionPage",
  changeFrequency: "monthly",
  priority: 0.9,
  lastModified: "2026-11-24",
});

/** Extra structured data for this page (JSON-LD): the service catalogue. */
export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brand.name} services`,
    itemListElement: services
      .filter((s) => !s.comingSoon)
      .map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: s.name,
          description: s.benefit,
          provider: { "@id": `${brand.siteUrl}/#organization` },
          areaServed: "GB",
        },
      })),
  },
];
