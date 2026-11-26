import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/booking-performance";

/** Page copy for /free-tools/occupancy-adr-revpar-calculator. Assumptions come from stored content. */

export const hero = {
  shortAnswer:
    "Enter the nights in the period, nights booked, any nights you blocked for yourself, and your accommodation revenue. You'll get your occupancy, average daily rate (ADR) and revenue per available night (RevPAR), with last year's comparison, targets and plain-English insights. Or paste your bookings and we'll work it all out.",
  privacy: "Your figures and bookings stay on your device.",
};

export const faq: FaqEntry[] = [
  { q: "What is RevPAR?", a: "Revenue per available night: your accommodation revenue divided by the nights you could have sold. It's the same as occupancy × ADR." },
  { q: "What is ADR?", a: "Average daily rate: your accommodation revenue divided by the nights you actually sold." },
  { q: "Is high occupancy always good?", a: "No. A full calendar at low prices can earn less than fewer nights at better prices. RevPAR shows the balance." },
  { q: "Should I include cleaning fees?", a: "Leave them out of revenue, so your ADR reflects your nightly price. We show a separate “total revenue per available night” if you add cleaning income." },
  { q: "Do nights I block count?", a: "No. Nights you block for yourself or for maintenance are removed from available nights, so they don't lower your occupancy." },
  { q: "How do I know if a price change worked?", a: "Compare RevPAR before and after. If RevPAR went up, the change earned more per available night, even if occupancy fell." },
];

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function howItWorks(c: Content): { id: string; title: string; text: string; assumption?: string }[] {
  const weekend = c.model.weekendNights.map((d) => DAY[d]).join(" and ");
  return [
    { id: "formulas", title: "The formulas", text: "Available nights = nights in the period − nights you blocked. Occupancy = booked ÷ available. ADR = revenue ÷ booked (shown as “–” if nothing was booked). RevPAR = revenue ÷ available, which equals occupancy × ADR. TRevPAR adds cleaning income; net RevPAR takes off your platform fee." },
    { id: "definitions", title: "Definitions", text: "Revenue is accommodation revenue only, without cleaning fees. Blocked nights are your own use or maintenance and are removed from available nights. With dates, the first night counts and the end date doesn’t: 1 to 31 March is 30 nights." },
    { id: "compare", title: "Comparisons", text: `Occupancy changes are in percentage points; ADR and RevPAR in £ and %. The RevPAR breakdown is exact: change in occupancy × last year’s ADR (the occupancy effect) plus this year’s occupancy × change in ADR (the price effect). A before/after RevPAR change under ${c.model.noChangePercent}% counts as “No real change”. Totals and portfolios are worked out from the sums, never by averaging percentages.`, assumption: `The ${c.model.noChangePercent}% “no real change” line is our choice.` },
    {
      id: "bookings",
      title: "How booking lists are split",
      text: `Each booking’s nights run from check-in to the night before check-out, with its revenue spread evenly across them. Only nights inside your period count, so a booking crossing the start or end contributes just those nights. A night two bookings share counts once (and is flagged); a booked night inside a blocked range counts as booked. Gap nights are unbooked, unblocked runs of up to ${c.model.gapMaxNights} nights between two bookings.`,
      assumption: `Weekend nights are ${weekend} nights; gaps are runs of up to ${c.model.gapMaxNights} nights. Both are editable.`,
    },
  ];
}

export const limits = {
  title: "Limits",
  points: ["It only uses the figures and bookings you enter: there’s no market data.", "Revenue is spread evenly across a booking’s nights, so weekend and weekday ADR are estimates when prices vary by night.", "It doesn’t include refunds, cancellations or platform adjustments unless you enter them."],
};

export const related = { title: "Related tools", ids: ["short-let-profit-calculator", "direct-booking-savings", "long-stay-discount-calculator"] };
