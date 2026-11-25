import { brand } from "@/config/brand";
import { definePageSeo } from "@/lib/seo";
import { routes } from "@/config/navigation";

/** SEO for /uk-short-let-rules. Edit freely. */
export const seo = definePageSeo({
  path: routes.ukRules,
  title: "UK Airbnb & Short-Let Rules (2026 Guide)",
  description:
    "Every UK short-let rule in one place: London’s 90-night limit, Scotland licensing, Wales registration, NI certification, fire and gas safety, tax and visitor levies. Checked monthly, with sources.",
  keywords: [
    "UK Airbnb rules",
    "short-let rules UK",
    "London 90 day rule",
    "Scotland short-term let licence",
    "Wales holiday let registration",
    "holiday let fire risk assessment",
  ],
  navKey: "ukRules",
  breadcrumbs: [{ name: "UK short-let rules", path: routes.ukRules }],
  schemaType: "WebPage",
  changeFrequency: "weekly",
  priority: 0.9,
  lastModified: brand.content.rulesLastCheckedISO,
});

/** Extra structured data for this page (JSON-LD): the guide as an article. */
export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "UK short-let rules, in one place",
    dateModified: brand.content.rulesLastCheckedISO,
    author: { "@type": "Person", name: brand.team.founder.name, jobTitle: brand.team.founder.role },
    publisher: { "@id": `${brand.siteUrl}/#organization` },
    mainEntityOfPage: `${brand.siteUrl}${seo.path}`,
  },
];
