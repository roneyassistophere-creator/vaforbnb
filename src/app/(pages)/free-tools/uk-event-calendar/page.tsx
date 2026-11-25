import { PageShell } from "@/components/layout/PageShell";
import { getPublicEventData } from "@/lib/server/events";
import { createMetadata } from "@/lib/seo";
import { pricingHref } from "@/content/tools/eventCalendarId";
import { faqFor } from "./content";
import { EventCalendarPage } from "./sections";
import { eventItems, seo, webApplication } from "./seo";

/**
 * /free-tools/uk-event-calendar
 * Event data comes from the admin area (cached, refreshed straight away on
 * admin changes). The first events, How it works and the FAQ are in the HTML.
 * Structured data: WebPage, BreadcrumbList, FAQPage, WebApplication (Event items off by default).
 */
export const metadata = createMetadata(seo);

export default async function UkEventCalendarPage() {
  const { today, ...data } = await getPublicEventData();
  const cities = new Map(data.cities.map((c) => [c.slug, c]));
  return (
    <PageShell
      seo={seo}
      flavor="tools"
      faq={faqFor(data.cities, data.settings)}
      schema={[webApplication(seo.path, seo.description), ...eventItems(data.events, cities, data.settings.eventStructuredData)]}
      headerCta={{ label: "Pricing optimisation", href: pricingHref }}
    >
      <EventCalendarPage seo={seo} data={data} today={today} />
    </PageShell>
  );
}
