import { definePageSeo } from "@/lib/seo";
import { routes } from "@/config/navigation";

/** SEO for /pricing. Edit freely. */
export const seo = definePageSeo({
  path: routes.pricing,
  title: "Airbnb Virtual Assistant Pricing UK",
  description:
    "Simple monthly pricing per property, with no commission on your bookings. Compare the Run, Grow and Build packages, estimate your cost and start with a free listing audit.",
  keywords: [
    "Airbnb virtual assistant cost UK",
    "Airbnb VA pricing",
    "Airbnb management fees",
    "short-let management cost",
  ],
  navKey: "pricing",
  breadcrumbs: [{ name: "Pricing", path: routes.pricing }],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.9,
  lastModified: "2026-11-24",
});

/** Extra structured data for this page (JSON-LD). */
export const schema: Record<string, unknown>[] = [];
