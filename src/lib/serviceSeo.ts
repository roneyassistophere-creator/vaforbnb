import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { serviceById, serviceHref } from "@/content/services";
import { definePageSeo, type PageSeo } from "./seo";

type Options = Omit<PageSeo, "path" | "navKey" | "breadcrumbs"> & {
  /** Extra JSON-LD nodes for the page. */
  extraSchema?: Record<string, unknown>[];
};

/**
 * SEO for an individual service page. Fills in the URL, nav highlight,
 * breadcrumbs (Home › Services › Name) and a schema.org Service node from the
 * service catalogue, so each page's seo.ts only sets the copy.
 */
export function defineServiceSeo(serviceId: string, opts: Options) {
  const service = serviceById(serviceId);
  if (!service) throw new Error(`Unknown service id: ${serviceId}`);
  const path = serviceHref(serviceId);
  const { extraSchema = [], ...rest } = opts;

  const seo = definePageSeo({
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.8,
    ...rest,
    path,
    navKey: "services",
    breadcrumbs: [
      { name: "Services", path: routes.services },
      { name: service.name, path },
    ],
  });

  const schema: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: seo.description,
      serviceType: service.name,
      url: `${brand.siteUrl}${path}`,
      provider: { "@id": `${brand.siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: brand.hours.days,
        opens: brand.hours.opens,
        closes: brand.hours.closes,
      },
    },
    ...extraSchema,
  ];

  return { seo, schema };
}
