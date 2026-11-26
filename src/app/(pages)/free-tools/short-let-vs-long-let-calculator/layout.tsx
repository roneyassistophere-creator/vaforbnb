import { PageShell } from "@/components/layout/PageShell";
import { financeCheckHref } from "@/content/tools/shortVsLongId";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/** SEO wrapper for /free-tools/short-let-vs-long-let-calculator: WebPage, BreadcrumbList, FAQPage, WebApplication. */
export const metadata = createMetadata(seo);

export default function SvlLayout({ children }: LayoutProps<"/free-tools/short-let-vs-long-let-calculator">) {
  return (
    <PageShell seo={seo} flavor="tools" faq={faq} schema={schema} headerCta={{ label: "Finance check", href: financeCheckHref }}>
      {children}
    </PageShell>
  );
}
