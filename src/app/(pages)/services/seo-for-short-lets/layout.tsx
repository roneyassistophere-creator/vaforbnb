import { PageShell } from "@/components/layout/PageShell";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /services/seo-for-short-lets
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Adds structured data (page, breadcrumbs, Service, FAQ), header and footer.
 */
export const metadata = createMetadata(seo);

export default function SeoForShortLetsLayout({ children }: LayoutProps<"/services/seo-for-short-lets">) {
  return (
    <PageShell seo={seo} flavor="service" faq={faq} schema={schema} headerCta={{ label: "Free SEO check", href: "#check" }}>
      {children}
    </PageShell>
  );
}
