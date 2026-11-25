import { PageShell } from "@/components/layout/PageShell";
import { getFigures } from "@/lib/server/figures";
import { createMetadata } from "@/lib/seo";
import { readContent } from "@/lib/tools/photo-shot-list";
import { faqFor, listingOptimisationHref } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/airbnb-photo-shot-list
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage (photo range from stored data), WebApplication.
 */
export const metadata = createMetadata(seo);

export default async function PhotoShotListLayout({ children }: LayoutProps<"/free-tools/airbnb-photo-shot-list">) {
  const c = readContent(await getFigures());
  return (
    <PageShell seo={seo} flavor="tools" faq={faqFor(c)} schema={schema} headerCta={{ label: "Listing optimisation", href: listingOptimisationHref }}>
      {children}
    </PageShell>
  );
}
