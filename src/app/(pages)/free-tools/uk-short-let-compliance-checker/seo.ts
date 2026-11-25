import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { toolPath } from "@/content/tools/complianceChecker";
import { absoluteUrl, definePageSeo } from "@/lib/seo";

/** SEO for /free-tools/uk-short-let-compliance-checker. Edit freely. */
export const seo = definePageSeo({
  path: toolPath,
  title: "Short-Let Compliance Checker (UK) | VA for BnB",
  absoluteTitle: true,
  description:
    "Answer six questions and get the UK short-let rules that apply to your property, from licences to gas checks, with official sources. Free.",
  keywords: [
    "short-let compliance checker",
    "Airbnb rules UK",
    "holiday let regulations UK",
    "Airbnb licence Scotland",
    "London 90 day rule",
    "holiday let gas safety",
  ],
  navKey: "freeTools",
  breadcrumbs: [
    { name: "Free tools", path: routes.freeTools },
    { name: "UK compliance checker", path: toolPath },
  ],
  schemaType: "WebPage",
  changeFrequency: "monthly",
  priority: 0.8,
  lastModified: brand.content.rulesLastCheckedISO,
});

/** Extra structured data: the tool as a free web application. */
export const schema: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "UK short-let compliance checker",
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
