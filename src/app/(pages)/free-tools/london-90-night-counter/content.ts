import { routes } from "@/config/navigation";
import { fillTemplate, type Figures } from "@/lib/tools/figures";
import type { FaqEntry } from "@/lib/seo";

/**
 * Page copy for /free-tools/london-90-night-counter.
 * {london.maxShortLetNights}, {london.longStayMinNights} and
 * {london.warnAtNights} are filled from the stored figures.
 */

export const hero = {
  title: "How many of my London 90 nights have I used?",
  shortAnswer:
    "Add your bookings from every platform and direct bookings. The counter shows how many nights you’ve used this calendar year, how many are left, and warns you about overlapping dates.",
  badges: ["London", "Stay legal"],
};

export const rulesHub = {
  rule: `${routes.ukRules}#london-90-nights`,
  planning: `${routes.ukRules}#planning-permission`,
};

export const nextStep = {
  eyebrow: "Next step",
  title: "Fill the gaps with longer stays",
  text: "Stays of {london.longStayMinNights} nights or more don’t count towards the limit. Our pricing team sets minimum stays and monthly rates so quiet months still earn.",
  cta: "See pricing optimisation",
  href: "/services/pricing-optimisation",
  secondary: { label: "Read the London 90-night rule in the UK Rules Hub", href: rulesHub.rule },
};

export const howItWorks = {
  title: "How it works",
  points: [
    "A booking’s nights are every date from check-in up to, but not including, check-out. Check-in 12 May and check-out 16 May is 4 nights: 12, 13, 14 and 15 May.",
    "Each night counts in the year of its date. A stay over New Year is split: 31 December counts in the old year and 1 January in the new one.",
    "A single stay of {london.longStayMinNights} or more consecutive nights isn’t a short stay, so none of its nights count. A stay one night shorter counts in full.",
    "If two bookings share a night, it counts once, and both bookings are flagged so you can check for a double booking.",
    "The count is per property and per calendar year, across every platform and direct booking. You’re shown “Getting close” from {london.warnAtNights} nights.",
    "Dates are counted as calendar dates, so clock changes can’t add or lose a night.",
  ],
  sourceKey: "london.maxShortLetNights",
};

export const limits = {
  title: "Limits",
  text: "The counter only knows the bookings you add, so include every platform and direct stay. It doesn’t decide whether you need planning permission: your borough does. The limit applies in Greater London, and only when the person providing the stays pays council tax on the property. Your lease, mortgage or borough may have stricter conditions.",
  disclaimer: "General information, not legal advice. Check with your borough’s planning team if you’re unsure.",
};

export const related = { title: "Related tools", ids: ["uk-compliance-checker", "long-stay-discount-calculator", "booking-performance"] };

export const changelog: { date: string; note: string }[] = [
  { date: "2026-11-24", note: "First version: counts nights per property and calendar year, with overlaps, long stays, CSV and calendar import, and backups." },
];

export function buildFaq(figures: Figures): FaqEntry[] {
  const f = (s: string) => fillTemplate(s, figures);
  return [
    {
      q: "What is the 90-day rule in London?",
      a: f(
        "Whole homes can be let for short stays for up to {london.maxShortLetNights} nights in a calendar year without planning permission, as long as the person providing them pays council tax on the property.",
      ),
    },
    {
      q: "Does it count all platforms?",
      a: "Yes. The limit is per property, not per platform. Airbnb only tracks its own bookings, so add every platform and direct booking here.",
    },
    {
      q: f("Do stays of {london.longStayMinNights} nights or more count?"),
      a: f("No. A stay of {london.longStayMinNights} or more consecutive nights isn’t a short stay, so it doesn’t count towards the {london.maxShortLetNights}."),
    },
    {
      q: f("What happens after {london.maxShortLetNights} nights?"),
      a: f(
        "You need planning permission from your borough to keep offering short stays that year, or you can take only stays of {london.longStayMinNights}+ consecutive nights.",
      ),
    },
    {
      q: "When does the count reset?",
      a: "On 1 January. The limit is per calendar year, not per 12 months from your first booking.",
    },
  ];
}
