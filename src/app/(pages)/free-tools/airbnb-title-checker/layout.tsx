import { PageShell } from "@/components/layout/PageShell";
import { getFigures } from "@/lib/server/figures";
import { createMetadata } from "@/lib/seo";
import { readContent } from "@/lib/tools/title-checker";
import { faqFor, listingOptimisationHref } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/airbnb-title-checker
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage (limit from stored data), WebApplication.
 */
export const metadata = createMetadata(seo);

export default async function TitleCheckerLayout({ children }: LayoutProps<"/free-tools/airbnb-title-checker">) {
  const { limit } = readContent(await getFigures());
  return (
    <PageShell seo={seo} flavor="tools" faq={faqFor(limit)} schema={schema} headerCta={{ label: "Listing optimisation", href: listingOptimisationHref }}>
      {children}
    </PageShell>
  );
}
