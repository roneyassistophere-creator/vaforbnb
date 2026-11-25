import type { Metadata } from "next";
import { brand } from "@/config/brand";
import type { NavKey } from "@/config/navigation";

/**
 * Per-page SEO definition. Each route folder has a `seo.ts` exporting one of
 * these — that file is the place to tweak titles, descriptions, social cards,
 * indexing and structured data for that page (there is no CMS).
 */
export type PageSeo = {
  /** Route path, e.g. "/pricing". Used for canonical URL, OG url and breadcrumbs. */
  path: string;
  /** Page title. The brand suffix is added automatically unless `absoluteTitle` is true. */
  title: string;
  absoluteTitle?: boolean;
  /** ~150–160 characters. */
  description: string;
  keywords?: string[];
  /** Overrides for social cards; fall back to title/description. */
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute or root-relative image URL. Defaults to the generated /opengraph-image. */
  ogImage?: string;
  /** Set true to keep a page out of search results. */
  noIndex?: boolean;
  /** Which main-nav item is highlighted. */
  navKey?: NavKey;
  /** Breadcrumb trail after "Home". Omit on the home page. */
  breadcrumbs?: { name: string; path?: string }[];
  /** schema.org type for the page node. */
  schemaType?: "WebPage" | "CollectionPage" | "AboutPage" | "FAQPage";
  /** Sitemap hints. */
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
  /** ISO date the page content last changed (used in sitemap). */
  lastModified?: string;
};

export const definePageSeo = (seo: PageSeo) => seo;

export const absoluteUrl = (path = "/") =>
  path.startsWith("http") ? path : `${brand.siteUrl}${path === "/" ? "" : path}`;

const fullTitle = (seo: PageSeo) =>
  seo.absoluteTitle ? seo.title : brand.seo.titleTemplate.replace("%s", seo.title);

/** Build a Next.js `Metadata` object from a PageSeo definition. */
export function createMetadata(seo: PageSeo): Metadata {
  const title = fullTitle(seo);
  const ogTitle = seo.ogTitle ?? title;
  const ogDescription = seo.ogDescription ?? seo.description;
  const images = seo.ogImage ? [{ url: seo.ogImage }] : undefined;

  return {
    title: seo.absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.path },
    openGraph: {
      type: "website",
      url: seo.path,
      siteName: brand.name,
      locale: brand.locale,
      title: ogTitle,
      description: ogDescription,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(brand.seo.twitterHandle ? { site: brand.seo.twitterHandle } : {}),
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    robots: seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
  };
}

/* --------------------------------------------------------------------------
   Structured data (JSON-LD)
   -------------------------------------------------------------------------- */

type Json = Record<string, unknown>;

const ORG_ID = `${brand.siteUrl}/#organization`;
const SITE_ID = `${brand.siteUrl}/#website`;

export function organizationSchema(): Json {
  const sameAs = Object.values(brand.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: brand.name,
    legalName: brand.legalName,
    url: brand.siteUrl,
    logo: `${brand.siteUrl}/icon.svg`,
    description: brand.shortDescription,
    email: brand.contact.email,
    ...(brand.contact.phone ? { telephone: brand.contact.phone } : {}),
    areaServed: brand.areaServed.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: brand.hours.days,
        opens: brand.hours.opens,
        closes: brand.hours.closes,
      },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: brand.siteUrl,
    name: brand.name,
    inLanguage: brand.language,
    publisher: { "@id": ORG_ID },
  };
}

export function webPageSchema(seo: PageSeo): Json {
  return {
    "@context": "https://schema.org",
    "@type": seo.schemaType ?? "WebPage",
    "@id": `${absoluteUrl(seo.path)}#webpage`,
    url: absoluteUrl(seo.path),
    name: fullTitle(seo),
    description: seo.description,
    inLanguage: brand.language,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    ...(seo.lastModified ? { dateModified: seo.lastModified } : {}),
  };
}

export function breadcrumbSchema(seo: PageSeo): Json | null {
  if (!seo.breadcrumbs?.length) return null;
  const trail = [{ name: "Home", path: "/" }, ...seo.breadcrumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path ?? seo.path),
    })),
  };
}

export type FaqEntry = { q: string; a: string };

export function faqSchema(faq: FaqEntry[]): Json | null {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
