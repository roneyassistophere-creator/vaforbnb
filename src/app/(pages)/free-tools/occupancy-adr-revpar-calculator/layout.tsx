import { PageShell } from "@/components/layout/PageShell";
import { pricingHref } from "@/content/tools/bookingPerformanceId";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/** SEO wrapper for /free-tools/occupancy-adr-revpar-calculator: WebPage, BreadcrumbList, FAQPage, WebApplication. */
export const metadata = createMetadata(seo);

export default function PerfLayout({ children }: LayoutProps<"/free-tools/occupancy-adr-revpar-calculator">) {
  return (
    <PageShell seo={seo} flavor="tools" faq={faq} schema={schema} headerCta={{ label: "Pricing optimisation", href: pricingHref }}>
      {children}
    </PageShell>
  );
}
