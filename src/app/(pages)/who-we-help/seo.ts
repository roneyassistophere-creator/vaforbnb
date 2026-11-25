import { definePageSeo } from "@/lib/seo";
import { routes } from "@/config/navigation";

/** SEO for /who-we-help. Edit freely. */
export const seo = definePageSeo({
  path: routes.whoWeHelp,
  title: "Who We Help: Airbnb VA for UK Hosts & Property Managers",
  description:
    "Airbnb virtual assistant support for side-hustle hosts, holiday let owners, serviced accommodation operators, property managers and London hosts across the UK.",
  keywords: [
    "serviced accommodation virtual assistant",
    "property management virtual assistant",
    "holiday let management support",
    "London Airbnb management",
    "rent-to-rent operations support",
  ],
  navKey: "whoWeHelp",
  breadcrumbs: [{ name: "Who we help", path: routes.whoWeHelp }],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.8,
  lastModified: "2026-11-24",
});

/** Extra structured data for this page (JSON-LD). */
export const schema: Record<string, unknown>[] = [];
