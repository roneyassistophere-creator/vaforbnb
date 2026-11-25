import { PageShell } from "@/components/layout/PageShell";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /services
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Adds structured data (page, breadcrumbs, FAQ + ./seo.ts `schema`), header and footer.
 * Edit ./seo.ts to change SEO; this file rarely needs touching.
 */
export const metadata = createMetadata(seo);

export default function ServicesLayout({ children }: LayoutProps<"/services">) {
  return (
    <PageShell seo={seo} flavor="services" faq={faq} schema={schema}>
      {children}
    </PageShell>
  );
}
