import { PageShell } from "@/components/layout/PageShell";
import { createMetadata } from "@/lib/seo";
import { auditHref, faq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/airbnb-ai-readiness-score
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage, WebApplication.
 */
export const metadata = createMetadata(seo);

export default function AiReadinessLayout({ children }: LayoutProps<"/free-tools/airbnb-ai-readiness-score">) {
  return (
    <PageShell seo={seo} flavor="tools" faq={faq} schema={schema} headerCta={{ label: "Free AI-readiness audit", href: auditHref }}>
      {children}
    </PageShell>
  );
}
