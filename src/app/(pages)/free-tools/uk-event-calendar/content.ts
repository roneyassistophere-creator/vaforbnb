import { cityPath } from "@/content/tools/eventCalendarId";
import type { FaqEntry } from "@/lib/seo";
import type { City, Settings } from "@/lib/tools/events";

/** Page copy for /free-tools/uk-event-calendar and the city pages. Event data lives in the admin area. */

export const hero = {
  h1: "What events are coming near my property?",
  cityH1: (city: string) => `Events coming up in ${city} for short-let hosts`,
  shortAnswer:
    "Pick your town and dates to see upcoming events that bring visitors: festivals, sport, concerts, conferences and university dates. Each event shows its official source and when we last checked it, so you can plan prices and listing updates early.",
  cityAnswer: (city: string) =>
    `Upcoming events in and around ${city} that bring visitors: festivals, sport, concerts, conferences and university dates. Each event shows its official source and when we last checked it, so you can plan prices and listing updates early.`,
  privacy: "Your location and starred events stay on your device.",
};

export function howItWorks(s: Pick<Settings, "recheckDays" | "demandCriteria">): { id: string; title: string; text: string }[] {
  return [
    { id: "chosen", title: "How events are chosen", text: "We list events big enough to bring visitors from outside the area: major sport, stadium and arena concerts, festivals, large conferences, university graduations, long-running shows, seasonal markets and bank holidays." },
    { id: "sources", title: "Official sources only", text: "Every event links to its official source, such as the organiser, venue or council website. We never publish an event without one." },
    { id: "demand", title: "How demand is estimated", text: s.demandCriteria },
    { id: "checks", title: "How often we check", text: `Our team re-checks upcoming events at least every ${s.recheckDays} days, and each event shows the date we last checked it. Dates not yet confirmed by the organiser are marked “Expected date”.` },
    { id: "past", title: "Past events disappear automatically", text: "An event drops off the calendar once its end date has passed (London time), so the list only shows what’s still to come." },
  ];
}

export const limits = {
  title: "Limits",
  points: [
    "We cover the cities listed below. Smaller local events may not be included.",
    "Distances are straight-line miles from the city centre (or your location), not travel time.",
    "Demand levels are our estimate. Your own booking data is the best guide for your property.",
  ],
  disclaimer: "Event dates can change or be cancelled. Always confirm with the official event website before changing prices. Demand levels are our estimate, not a guarantee of bookings.",
};

export function faqFor(cities: City[], s: Pick<Settings, "demandCriteria">): FaqEntry[] {
  const covered = cities.filter((c) => c.covered).map((c) => c.name);
  return [
    { q: "Why should hosts track local events?", a: "Demand rises around big events. Planning early lets you set prices, minimum stays and listing updates in time." },
    { q: "Which cities are covered?", a: covered.length ? `${covered.join(", ")}. Each city has its own page, listed below.` : "We’re adding cities now. Check back soon." },
    { q: "How often is it updated?", a: "Our team checks events regularly. Each event shows the date we last checked it." },
    { q: "What does “expected date” mean?", a: "The organiser hasn’t confirmed the date yet. We show the usual timing, and update it once it’s announced." },
    { q: "How is demand estimated?", a: `Our estimate, based on the event’s size, how much of the city it affects, and past demand. ${s.demandCriteria}` },
  ];
}

export const cityLinks = (cities: City[]) => cities.filter((c) => c.covered).map((c) => ({ name: c.name, href: cityPath(c.slug) }));

export const related = {
  title: "Related tools",
  ids: ["long-stay-discount-calculator", "short-let-profit-calculator", "visitor-levy-calculator"],
};
