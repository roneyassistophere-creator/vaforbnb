import { PageShell } from "@/components/layout/PageShell";
import { financeCheckHref } from "@/content/tools/profitId";
import { getFigures } from "@/lib/server/figures";
import { createMetadata } from "@/lib/seo";
import { readContent } from "@/lib/tools/profit";
import { faqFor } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/short-let-profit-calculator
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Structured data: WebPage, BreadcrumbList, FAQPage (rates from stored figures), WebApplication.
 */
export const metadata = createMetadata(seo);

export default async function ProfitLayout({ children }: LayoutProps<"/free-tools/short-let-profit-calculator">) {
  const c = readContent(await getFigures());
  return (
    <PageShell seo={seo} flavor="tools" faq={faqFor(c)} schema={schema} headerCta={{ label: "Finance check", href: financeCheckHref }}>
      {children}
    </PageShell>
  );
}
