import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { isToolLive, jobHref } from "@/content/tools/catalog";
import { cityPath, toolPath, toolSlug } from "@/content/tools/eventCalendarId";
import { absoluteUrl, definePageSeo, type PageSeo } from "@/lib/seo";
import type { City, PublicEvent } from "@/lib/tools/events";

/**
 * SEO for /free-tools/uk-event-calendar and its city pages. Edit freely.
 * Until the tool is set live in src/content/tools/catalog.ts, every page is
 * kept out of search results and the sitemap.
 */
const crumbs = [
  { name: "Free tools", path: routes.freeTools },
  { name: "Get more bookings", path: jobHref("bookings") },
  { name: "UK event calendar", path: toolPath },
];

export const seo = definePageSeo({
  path: toolPath,
  title: "UK Events Calendar for Airbnb Hosts | VA for BnB",
  absoluteTitle: true,
  description: "See upcoming UK events near your short let, from festivals to sport and concerts, so you can plan prices and listing updates early. Free.",
  keywords: ["UK events calendar", "events near my Airbnb", "Airbnb event pricing", "festivals", "concerts", "football", "graduation", "Christmas markets", "bank holidays"],
  noIndex: !isToolLive(toolSlug),
  navKey: "freeTools",
  breadcrumbs: crumbs,
  schemaType: "WebPage",
  changeFrequency: "weekly",
  priority: 0.7,
  lastModified: "2026-11-26",
});

/** City page SEO. Kept out of search results until it lists enough upcoming events. */
export function citySeo(city: City, year: string, upcoming: number, minEvents: number): PageSeo {
  return definePageSeo({
    path: cityPath(city.slug),
    title: `${city.name} Events for Airbnb Hosts (${year}) | VA for BnB`,
    absoluteTitle: true,
    description: `Upcoming events in and around ${city.name} that bring visitors, with dates, venues and official sources. Plan your short-let prices early.`,
    noIndex: !isToolLive(toolSlug) || upcoming < minEvents,
    navKey: "freeTools",
    breadcrumbs: [...crumbs, { name: city.name, path: cityPath(city.slug) }],
    schemaType: "CollectionPage",
    changeFrequency: "weekly",
    priority: 0.6,
  });
}

export const webApplication = (path: string, description: string): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "UK event calendar",
  url: absoluteUrl(path),
  description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  areaServed: { "@type": "Country", name: "GB" },
  provider: { "@id": `${brand.siteUrl}/#organization` },
});

/**
 * Event items: only when switched on in Admin › Settings (off by default),
 * and only for published events with a confirmed date. VERIFY search engines'
 * current event guidelines for listing sites before switching on.
 */
export function eventItems(events: PublicEvent[], cities: Map<string, City>, on: boolean): Record<string, unknown>[] {
  if (!on) return [];
  return events
    .filter((e) => e.dateStatus === "confirmed")
    .slice(0, 20)
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.name,
      startDate: e.startTime ? `${e.startDate}T${e.startTime}` : e.startDate,
      endDate: e.endDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: e.venue ?? cities.get(e.city)?.name ?? "", address: { "@type": "PostalAddress", addressLocality: cities.get(e.city)?.name ?? "", addressCountry: "GB" } },
      url: e.sourceUrl,
      ...(e.shortDescription ? { description: e.shortDescription } : {}),
    }));
}
