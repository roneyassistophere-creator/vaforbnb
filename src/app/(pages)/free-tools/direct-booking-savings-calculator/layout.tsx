import { PageShell } from "@/components/layout/PageShell";
import { directWebsitesHref } from "@/content/tools/directBookingId";
import { getFigures } from "@/lib/server/figures";
import { createMetadata } from "@/lib/seo";
import { readContent } from "@/lib/tools/direct-booking";
import { faqFor } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /free-tools/direct-booking-savings-calculator
 * - Structured data: WebPage, BreadcrumbList, FAQPage (fee presets from stored figures), WebApplication.
 */
export const metadata = createMetadata(seo);

export default async function DirectBookingLayout({ children }: LayoutProps<"/free-tools/direct-booking-savings-calculator">) {
  const c = readContent(await getFigures());
  return (
    <PageShell seo={seo} flavor="tools" faq={faqFor(c)} schema={schema} headerCta={{ label: "Direct booking websites", href: directWebsitesHref }}>
      {children}
    </PageShell>
  );
}
