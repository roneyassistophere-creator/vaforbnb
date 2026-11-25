import { routes } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/long-stay";

/**
 * Page copy for /free-tools/long-stay-discount-calculator. Thresholds, fees
 * and note triggers are stored figures; text that quotes them is built below.
 */

export const pricingHref = `${routes.services}/pricing-optimisation`;
export const listingHref = `${routes.services}/listing-optimisation`;

export const hero = {
  shortAnswer:
    "Compare filling a period with short stays against one discounted long stay. Enter your rate, the period, your discount, expected short-stay occupancy, average stay, turnover cost and platform fee. You’ll see which earns more, the biggest discount that still beats short stays, and how many turnovers you’d save.",
  badges: ["Get more bookings", "All UK"],
  kitBadge: "Get more bookings kit · step 5",
  privacy: "Your numbers stay on your device.",
};

export const whatThisMeansFallback = "Enter your numbers to see which earns more on your figures, and by how much. The result updates as you type.";

export const nextStep = {
  eyebrow: "Next step",
  title: "Want help pricing long stays?",
  text: "Our pricing team sets your weekly and monthly discounts, minimum stays and seasonal rates, and keeps checking them against demand.",
  cta: "Pricing optimisation",
  href: pricingHref,
};

export const kitDone = {
  eyebrow: "Get more bookings kit · complete",
  title: "Kit complete",
  text: "You’ve scored your listing, sharpened your title, rebuilt your description, planned your photos and checked your long-stay pricing.",
  hub: "Back to all free tools",
  service: "Want us to do all of this for you? Listing optimisation",
  serviceHref: listingHref,
};

/** How it works: the formulas in plain English, the platform thresholds and sources (from stored figures). */
export function howItWorksSections(c: Content): { id: string; title: string; text: string; list?: string[] }[] {
  const pct = (x: number) => `${+(x * 100).toFixed(2)}%`;
  return [
    {
      id: "short",
      title: "Short stays",
      text: "Nights booked = period × occupancy. Stays (and turnovers) = nights booked ÷ average stay. Net = nights booked × rate × (1 − platform fee) − turnovers × turnover cost − nights booked × running cost.",
    },
    {
      id: "long",
      title: "One long stay",
      text: "Net = period × rate × (1 − discount) × (1 − long-stay fee) − one turnover − mid-stay cleans − period × running cost. The difference is the long-stay net minus the short-stay net.",
    },
    {
      id: "break-even",
      title: "Break-even figures",
      text: "The break-even discount is the biggest discount at which the long stay still earns as much as short stays. The break-even occupancy is how busy short stays would need to be to earn as much as this long stay. Money is worked out at full precision and rounded only for display.",
    },
    {
      id: "thresholds",
      title: "Platform thresholds and figures",
      text: "These figures are stored, checked regularly and shown with their sources.",
      list: [
        `Weekly discounts apply to stays of ${c.weeklyMin}+ nights; monthly discounts to ${c.monthlyMin}+ nights (Airbnb Help Centre).`,
        `Discounts of ${pct(c.highlightMin)} or more are highlighted to guests (Airbnb Help Centre; to be confirmed).`,
        `Fee presets: Airbnb host-only fee ${pct(c.fees.airbnb)}; direct booking card fee ${pct(c.fees.direct)} (typical UK rate). Check your own.`,
        `London: stays of ${c.londonLongStay}+ consecutive nights aren’t short stays (Deregulation Act 2015, s.44).`,
      ],
    },
  ];
}

export const howItWorks = {
  intro: "The calculator compares the same period two ways: filled with short stays at your expected occupancy, or taken by one guest at your discount. It never tells you what to do: it shows what your numbers say.",
};

export const limits = {
  title: "Limits",
  points: [
    "Occupancy is your estimate. Real bookings change, so try a few values and save them as scenarios.",
    "Platform fees vary by fee setting, location and currency. Check your own payout details.",
    "It doesn’t include tax, guest-paid fees or cancellations.",
    "A long stay is one guest: a single cancellation can leave the whole period empty.",
  ],
  disclaimer:
    "Estimates only. Real occupancy changes, and platform fees vary by fee setting and location. In London, stays of 90+ consecutive nights don’t count as short stays. Very long stays used as someone’s main home can become a tenancy, so check the UK Rules Hub. Not financial, tax or legal advice.",
};

export const related = { title: "Related tools", ids: ["short-let-profit-calculator", "london-90-night-counter", "short-let-vs-long-let"] };

export const changelogNotes: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: short stays vs one long stay, break-even discount and occupancy, sensitivity table, chart and saved scenarios." },
];

/** FAQ. The weekly and monthly thresholds come from stored figures. */
export function faqFor(c: Pick<Content, "weeklyMin" | "monthlyMin" | "londonLongStay">): FaqEntry[] {
  return [
    { q: "Should I offer a monthly discount on Airbnb?", a: "Often, especially in quiet months. This tool shows whether your discount beats what you’d expect from short stays." },
    { q: "When do weekly and monthly discounts apply?", a: `On Airbnb, weekly discounts apply to stays of ${c.weeklyMin} nights or more and monthly discounts to stays of ${c.monthlyMin} nights or more.` },
    { q: "What is a break-even discount?", a: "The biggest discount you can give a long stay and still earn the same as short stays, after fees and turnovers." },
    {
      q: "Do long stays count towards London’s 90-night limit?",
      a: `Stays of ${c.londonLongStay} or more consecutive nights don’t count as short stays. Shorter long stays, like ${c.monthlyMin} nights, still count. Use our London 90-night counter.`,
    },
    { q: "Are long stays riskier?", a: "Very long stays, where the guest treats it as their main home, can raise tenancy questions. Check the UK Rules Hub before accepting stays of several months." },
  ];
}
