import { PageShell } from "@/components/layout/PageShell";
import { getFigures } from "@/lib/server/figures";
import { createMetadata } from "@/lib/seo";
import { readContent } from "@/lib/tools/long-stay";
import { faqFor, pricingHref } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/long-stay-discount-calculator
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage (thresholds from stored figures), WebApplication.
 */
export const metadata = createMetadata(seo);

export default async function LongStayLayout({ children }: LayoutProps<"/free-tools/long-stay-discount-calculator">) {
  const c = readContent(await getFigures());
  return (
    <PageShell seo={seo} flavor="tools" faq={faqFor(c)} schema={schema} headerCta={{ label: "Pricing optimisation", href: pricingHref }}>
      {children}
    </PageShell>
  );
}
