import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader, type HeaderCta } from "./SiteHeader";
import { breadcrumbSchema, faqSchema, webPageSchema, type FaqEntry, type PageSeo } from "@/lib/seo";

export type Flavor = "home" | "services" | "pricing" | "tools" | "who" | "rules" | "service";

type Props = {
  /** The page's SEO definition (from its co-located seo.ts). */
  seo: PageSeo;
  /** Visual flavor from the theme (display font, heading scale, button radius, page bg). */
  flavor: Flavor;
  /** FAQ entries to publish as FAQPage structured data. */
  faq?: FaqEntry[];
  /** Any extra JSON-LD nodes for this page. */
  schema?: Record<string, unknown>[];
  /** Overrides the header button for this page. */
  headerCta?: HeaderCta;
  children: ReactNode;
};

/**
 * Page wrapper used by every route. It applies the theme flavor, renders the
 * header and footer, and outputs the page's structured data. Title, meta
 * description, canonical and social tags come from `createMetadata(seo)` in
 * the page's `metadata` export.
 */
export function PageShell({ seo, flavor, faq, schema = [], headerCta, children }: Props) {
  return (
    <div className={`page flavor-${flavor} flex min-h-full flex-col`}>
      <JsonLd data={[webPageSchema(seo), breadcrumbSchema(seo), faq ? faqSchema(faq) : null, ...schema]} />
      <SiteHeader active={seo.navKey} cta={headerCta} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
