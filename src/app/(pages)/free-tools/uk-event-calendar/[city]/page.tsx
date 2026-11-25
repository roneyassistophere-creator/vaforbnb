import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { pricingHref } from "@/content/tools/eventCalendarId";
import { cities as seedCities } from "@/data/events";
import { getPublicEventData } from "@/lib/server/events";
import { createMetadata } from "@/lib/seo";
import type { PublicData } from "@/lib/tools/events";
import { faqFor } from "../content";
import { EventCalendarPage } from "../sections";
import { citySeo, eventItems, webApplication } from "../seo";

/**
 * /free-tools/uk-event-calendar/[city]: the tool preset to one covered city.
 * Kept out of search results while it lists fewer than the stored minimum of
 * upcoming events (Admin › Settings). Cities added in the admin area work
 * straight away (rendered on first visit, then cached).
 */
/** Awaiting params outside Suspense keeps ISR for cities added later (see the Next.js cache components guide). */
export const instant = false;

export function generateStaticParams() {
  return seedCities.map((c) => ({ city: c.slug }));
}

/** Upcoming events within the default distance of the city (what the page shows first). */
function cityContext(data: PublicData & { today: string }, slug: string) {
  const city = data.cities.find((c) => c.slug === slug && c.covered);
  if (!city) return null;
  const upcoming = data.events.filter((e) => e.city === slug).length;
  return { city, upcoming, seo: citySeo(city, data.today.slice(0, 4), upcoming, data.settings.cityNoindexMin) };
}

export async function generateMetadata({ params }: PageProps<"/free-tools/uk-event-calendar/[city]">): Promise<Metadata> {
  const ctx = cityContext(await getPublicEventData(), (await params).city);
  return ctx ? createMetadata(ctx.seo) : { title: "City not found", robots: { index: false } };
}

export default async function EventCityPage({ params }: PageProps<"/free-tools/uk-event-calendar/[city]">) {
  const { city: slug } = await params;
  const all = await getPublicEventData();
  const ctx = cityContext(all, slug);
  if (!ctx) notFound();
  const { today, ...data } = all;
  const cities = new Map(data.cities.map((c) => [c.slug, c]));
  return (
    <PageShell
      seo={ctx.seo}
      flavor="tools"
      faq={faqFor(data.cities, data.settings)}
      schema={[webApplication(ctx.seo.path, ctx.seo.description), ...eventItems(data.events.filter((e) => e.city === slug), cities, data.settings.eventStructuredData)]}
      headerCta={{ label: "Pricing optimisation", href: pricingHref }}
    >
      <EventCalendarPage seo={ctx.seo} data={data} today={today} city={ctx.city} />
    </PageShell>
  );
}
