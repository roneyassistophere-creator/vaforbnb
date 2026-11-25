import { PageShell } from "@/components/layout/PageShell";
import { createMetadata } from "@/lib/seo";
import { faq } from "./content";
import { schema, seo } from "./seo";

/**
 * SEO wrapper for /
 * - Title, description, canonical and social tags come from ./seo.ts
 * - Adds structured data (page, breadcrumbs, FAQ + ./seo.ts `schema`), header and footer.
 * Edit ./seo.ts to change SEO; this file rarely needs touching.
 */
export const metadata = createMetadata(seo);

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <PageShell seo={seo} flavor="home" faq={faq} schema={schema}>
      {children}
    </PageShell>
  );
}
