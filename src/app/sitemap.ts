import type { MetadataRoute } from "next";
import { citySeo } from "@/app/(pages)/free-tools/uk-event-calendar/seo";
import { absoluteUrl } from "@/lib/seo";
import { allPages } from "@/lib/pages";
import { getPublicEventData } from "@/lib/server/events";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Event calendar city pages: only once the tool is live and a city lists enough upcoming events.
  const ev = await getPublicEventData();
  const cityPages = ev.cities
    .filter((c) => c.covered)
    .map((c) => citySeo(c, ev.today.slice(0, 4), ev.events.filter((e) => e.city === c.slug).length, ev.settings.cityNoindexMin));
  return [...allPages, ...cityPages]
    .filter((p) => !p.noIndex)
    .map((p) => ({
      url: absoluteUrl(p.path),
      ...(p.lastModified ? { lastModified: p.lastModified } : {}),
      changeFrequency: p.changeFrequency ?? "monthly",
      priority: p.priority ?? 0.7,
    }));
}
