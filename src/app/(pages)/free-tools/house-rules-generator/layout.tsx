import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/config/brand";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/house-rules-generator
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage, WebApplication.
 */
export const metadata = createMetadata(seo);

export default function HouseRulesLayout({ children }: LayoutProps<"/free-tools/house-rules-generator">) {
  return (
    <PageShell seo={seo} flavor="tools" faq={faq} schema={schema} headerCta={{ label: "Free listing audit", href: brand.links.freeAudit }}>
      {children}
    </PageShell>
  );
}
