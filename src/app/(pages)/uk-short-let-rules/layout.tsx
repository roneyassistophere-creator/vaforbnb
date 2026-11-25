import { PageShell } from "@/components/layout/PageShell";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /uk-short-let-rules
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Adds structured data (page, breadcrumbs, FAQ + ./seo.ts `schema`), header and footer.
 * Edit ./seo.ts to change SEO; this file rarely needs touching.
 */
export const metadata = createMetadata(seo);

export default function UkRulesLayout({ children }: LayoutProps<"/uk-short-let-rules">) {
  return (
    <PageShell seo={seo} flavor="rules" faq={faq} schema={schema}>
      {children}
    </PageShell>
  );
}
