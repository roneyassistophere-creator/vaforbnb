import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/config/brand";
import { getFigures } from "@/lib/server/figures";
import { createMetadata } from "@/lib/seo";
import { buildFaq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/guest-register-template
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage (filled from stored figures), WebApplication.
 */
export const metadata = createMetadata(seo);

export default async function GuestRegisterLayout({ children }: LayoutProps<"/free-tools/guest-register-template">) {
  const figures = await getFigures();
  return (
    <PageShell seo={seo} flavor="tools" faq={buildFaq(figures)} schema={schema} headerCta={{ label: "Free listing audit", href: brand.links.freeAudit }}>
      {children}
    </PageShell>
  );
}
