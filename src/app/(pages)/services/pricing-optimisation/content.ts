import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/pricing-optimisation. */

export const AIRBNB_HOST_FEE = 0.155;

export const heroChips = ["More profit per month", "Fewer turnovers", "Value guests feel", "You approve big changes"];

export const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Example March calendar for the hero tracker. */
export const calendar = (() => {
  const booked = [1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 20, 21, 22, 23, 24, 27, 28];
  const events = [14, 15, 21, 22];
  const weekends = [6, 7, 13, 14, 20, 21, 27, 28];
  const cells: { d: number | null; p: number; kind: "booked" | "event" | "open" | "blank" }[] = [];
  for (let i = 0; i < 6; i++) cells.push({ d: null, p: 0, kind: "blank" });
  for (let d = 1; d <= 31; d++) {
    const isB = booked.includes(d);
    const isE = events.includes(d);
    cells.push({ d, p: isE ? 165 : weekends.includes(d) ? 125 : 98, kind: isB ? "booked" : isE ? "event" : "open" });
  }
  return cells;
})();

export const receipts = {
  occupancy: {
    label: "CHASING OCCUPANCY",
    sub: "26 nights · 87% occupancy · 13 turnovers",
    rows: [
      { k: "Booking revenue (26 × £85)", v: "£2,210" },
      { k: "Airbnb host fee (15.5%)", v: "−£342.55" },
      { k: "Turnovers (13 × £55)", v: "−£715" },
      { k: "Average stay", v: "2 nights" },
    ],
    keep: "£1,152",
  },
  profit: {
    label: "PRICING FOR PROFIT",
    sub: "21 nights · 70% occupancy · 7 turnovers",
    rows: [
      { k: "Booking revenue (21 × £110)", v: "£2,310" },
      { k: "Airbnb host fee (15.5%)", v: "−£358.05" },
      { k: "Turnovers (7 × £55)", v: "−£385" },
      { k: "Average stay", v: "3 nights" },
    ],
    keep: "£1,567",
    badge: "About £414 more",
  },
};

export const kpis = [
  { k: "Average occupancy", v: "56%", r: "41% Jan to 70% Aug" },
  { k: "Average nightly rate", v: "£135", r: "£125 Jan to £152 Aug" },
  { k: "Booking window", v: "25.7 days", r: "15 days Jan, 38 Aug" },
  { k: "Typical stay", v: "4 nights", r: "Steady all year" },
];

export const seasons = [
  { k: "PEAK · JUL–AUG", t: "68–70% occupancy · £149–£152 a night · booked 37–38 days ahead", dark: true },
  { k: "SPRING AND SEPTEMBER", t: "58–62% occupancy · £131–£138 a night", dark: false, kc: "text-brand" },
  { k: "OFF-PEAK · NOV–MAR", t: "41–49% occupancy · £125–£140 a night · shortest booking windows", dark: false, kc: "text-body" },
];

export const toolVsHuman = [
  { a: "Reads market demand and adjusts prices daily", b: "Checks the comparison listings are really like yours: area, size, type, standard" },
  { a: "Applies seasonality and day-of-week patterns", b: "Knows your hot tub, parking or view beat the neighbourhood average" },
  { a: "Reacts to booking pace in your market", b: "Spots an event the day it’s announced, before bookings show in the data" },
  { a: "Drops prices as dates get closer", b: "Checks whether competitors are already full before dropping yours" },
  { a: "Follows the rules you give it", b: "Sets those rules from your costs, your profit target and your goals" },
  { a: "Suggests a base price", b: "Decides whether to accept it, based on your reviews, standard and results" },
];

export const compChecks = [
  "Total price for the same dates, after fees",
  "How much of their calendar is booked (full = room to charge more)",
  "Minimum stays, discounts and cancellation policies",
  "Ratings and reviews compared with yours",
  "What they offer that you don’t, and vice versa",
];

export const propertyTypes = [
  { h: "City-centre flat", d: "Weekends, events and short breaks; business travel midweek.", a: "Weekend and event premiums; flexible 1–2 nights midweek." },
  { h: "Coastal or rural cottage", d: "Strong summer and school holidays; quiet winter.", a: "Early premiums for peak weeks; longer-stay offers in winter." },
  { h: "Contractor or corporate house", d: "Weekday, multi-week stays, steady all year.", a: "Weekly and monthly pricing; less weekend focus." },
  { h: "Student city or hospital area", d: "Graduations, open days, visiting families, staff stays.", a: "Premiums on university dates; longer stays for staff." },
];

export const overrides = [
  { d: "3 Mar", c: "+£40", r: "Concert announced at the arena; tool not yet reacting" },
  { d: "9 Mar", c: "−£15", r: "One-night gap between two stays; opened a 1-night minimum" },
  { d: "18 Mar", c: "Hold", r: "Tool dropped price, but 9 of 11 competitors are full" },
];

export const weHandle = [
  "Daily price moves within your agreed minimum and maximum",
  "Orphan and gap-night adjustments",
  "Small event premiums on agreed dates",
  "Fixing errors and sync issues",
];

export const weAsk = [
  "Changing your minimum, base or maximum price",
  "New or bigger discounts",
  "Changes to minimum stay or check-in rules",
  "Any override outside your agreed range",
];

export const events = [
  { k: "LIVE", t: "Stadium and arena concerts, football and rugby" },
  { k: "RACING", t: "Cheltenham, the Grand National, Royal Ascot, local courses" },
  { k: "SEASONAL", t: "Festivals, Christmas markets, New Year’s Eve" },
  { k: "BUSINESS", t: "Graduations, conferences, exhibitions, trade shows" },
  { k: "HOLIDAYS", t: "School holidays and bank holidays" },
];

export type TipCat = "SETTINGS" | "CALENDAR" | "DISCOUNTS" | "MARKET";
export const tipFilters: { label: string; cat: TipCat | null }[] = [
  { label: "All", cat: null },
  { label: "Settings", cat: "SETTINGS" },
  { label: "Calendar", cat: "CALENDAR" },
  { label: "Discounts", cat: "DISCOUNTS" },
  { label: "Market", cat: "MARKET" },
];

export const tips: { cat: TipCat; h: string; t: string }[] = [
  { cat: "SETTINGS", h: "Set your minimum from your costs, not a guess.", t: "Add up cleaning, laundry, utilities and the platform fee per night and per stay. PriceLabs advises covering costs with your minimum price, not your base." },
  { cat: "SETTINGS", h: "Reprice for the 15.5% host fee.", t: "If your prices haven’t changed since the switch, your payout has dropped." },
  { cat: "MARKET", h: "Before you drop your price, check the market.", t: "If similar listings are also empty, it’s a quiet period and a cut won’t help much." },
  { cat: "SETTINGS", h: "Change price in steps of 5% to 10%.", t: "Then wait a couple of weeks, as PriceLabs recommends, so you can see what worked." },
  { cat: "CALENDAR", h: "Fill orphan nights.", t: "A one or two-night gap rarely sells with a 3-night minimum. Allow a shorter stay for that gap, with a small discount." },
  { cat: "CALENDAR", h: "Use minimum stays on busy nights.", t: "On event weekends, a 2 or 3-night minimum stops a one-night booking blocking a better stay." },
  { cat: "CALENDAR", h: "Price weekends and weekdays differently.", t: "City flats often earn more Friday and Saturday; contractor homes often earn more midweek." },
  { cat: "DISCOUNTS", h: "Use long-stay discounts in quiet months.", t: "Weekly (7+) and monthly (28+) discounts cut turnovers, and Airbnb shows discounts of 10% or more in search." },
  { cat: "DISCOUNTS", h: "Check discount stacking on Booking.com.", t: "Genius and mobile promotions can compound: 10% plus 10% off £200 gives £162, not £160. Test what guests actually pay." },
  { cat: "MARKET", h: "Review your base price every quarter.", t: "And after a renovation, a new amenity, or a change in local supply." },
  { cat: "MARKET", h: "Start new listings slightly lower.", t: "Then raise prices as reviews and bookings build." },
  { cat: "DISCOUNTS", h: "Look at the total for a short stay.", t: "Compare a 2-night total, including cleaning, with similar listings. The nightly rate alone can hide an uncompetitive total." },
];

export const valuePoints = [
  "If the price goes up, the stay should justify it: accurate photos, good linen, clear check-in, fast replies.",
  "If reviews mention value, we look at price and what’s included before anything else.",
  "Small extras lift perceived value: a welcome note, local tips, coffee, a smooth check-out.",
];

export const included = [
  { h: "Tool set-up and tuning", t: "PriceLabs or your tool: base, minimum, maximum, seasons, customisations" },
  { h: "Monthly revenue target", t: "Agreed before each month, tracked all month" },
  { h: "Weekly competitor checks", t: "8 to 12 comparable listings: price, availability, settings, reviews" },
  { h: "Event and demand calendar", t: "Events priced early, minimum stays on busy nights" },
  { h: "Overrides and gap nights", t: "Manual changes when the tool is wrong, all logged" },
  { h: "Discounts and stay rules", t: "Weekly, monthly, last-minute and orphan-night settings" },
  { h: "Multi-platform checks", t: "Airbnb, Booking.com and Vrbo consistent; stacking checked" },
  { h: "Monthly report", t: "Revenue, occupancy, average rate, what changed and why" },
  { h: "Approval for major changes", t: "Nothing big changes without your yes" },
];

export const process = [
  { h: "Free pricing review", t: "Your listing, settings and competitors." },
  { h: "Agree your goals", t: "Costs, minimum, target and what needs approval." },
  { h: "Set up or fix your tool", t: "Connected and configured properly." },
  { h: "Monthly target, weekly checks", t: "Managed against the target all month." },
  { h: "Monthly report", t: "What happened, what changed, next month’s plan." },
];

export const honest = [
  { b: "We can’t control demand.", t: "A quiet month is still quiet; we make the most of it." },
  { b: "No guaranteed figures.", t: "We show you the numbers every month instead." },
  { b: "Some nights stay empty on purpose.", t: "Selling below your costs isn’t a win." },
  { b: "Pricing works best with a strong listing.", t: "Pair it with listing optimisation and fast replies." },
];

export const proofRows = [
  { l: "[1-bed flat, city]", p: "[Year on year]", b: "[Revenue £X · ADR £X · X%]", a: "[Revenue £X · ADR £X · X%]" },
  { l: "[3-bed contractor house]", p: "[Period]", b: "[X turnovers a month]", a: "[X turnovers a month]" },
];

export const reviewItems = [
  "How your prices compare with 8 to 12 similar listings",
  "Whether your minimum covers your costs after the 15.5% fee",
  "Gaps and settings costing you bookings",
  "3 changes to make first",
];

export const toolOptions = ["PriceLabs", "Beyond", "Wheelhouse", "Smart Pricing", "None"];

export const packageCta = {
  title: `Pricing optimisation from ${showPrice(prices.run)} a month`,
  text: `With guest communication, listing optimisation, cleaning coordination and review management. Pricing tool subscription not included. [Standalone from ${showPrice(prices.run)} per listing.]`,
};

export const faq: FaqEntry[] = [
  { q: "How much should I charge for my Airbnb?", a: "Start from comparable listings in your area (same size, type and standard), then adjust for what makes yours better or worse, your reviews and your costs. Your minimum should cover costs after Airbnb’s 15.5% fee; a pricing tool then moves the price with demand." },
  { q: "Is PriceLabs worth it?", a: "For most hosts, yes: it updates prices daily using market data. But results depend on its settings, especially base and minimum prices, and it can’t judge your property’s quality or see an event before bookings show it." },
  { q: "Why is my pricing tool setting prices so low?", a: "Usually a minimum that’s too low, last-minute discounts that are too aggressive, or comparison listings that aren’t really like yours." },
  { q: "Should I use Airbnb Smart Pricing?", a: "It’s a simple, free start within a minimum and maximum you set, but it only prices Airbnb and gives limited control." },
  { q: "What is a good occupancy rate for an Airbnb in the UK?", a: "About 56% on average in the 12 months to January 2026 (PriceLabs), from 41% in January to 70% in August. Profit matters more than occupancy." },
  { q: "Should I lower my price if I have no bookings?", a: "Not straight away. Check whether similar listings are also empty, whether your listing is strong, and whether settings are blocking bookings. Then change price in small steps." },
  { q: "How do I price for events near me?", a: "Add a premium and a minimum stay as soon as the event is announced, then review weekly." },
  { q: "Do you change prices without asking me?", a: "Day-to-day changes stay within the range you agree. Changes to your minimum, base or maximum, new discounts and rule changes always come to you first." },
  { q: "Do I need to pay for a pricing tool?", a: "Usually, yes. We work with your tool or help you choose one; the subscription is separate from our fee." },
  { q: "What is Airbnb pricing optimization?", a: "The same as pricing optimisation (UK spelling): setting and adjusting prices to earn the most profit from your calendar, not just the most bookings." },
];

export const sources =
  "Airbnb, Simplifying Airbnb service fees · Airbnb Help, Smart Pricing; pricing rule-sets; weekly and monthly discounts · PriceLabs, base price guide; customisations list; UK market report · Key Data UK Spring 2026 Index (Property Reporter) · Wheelhouse, RevPAR vs occupancy · SmartOrder, Booking.com Genius discount stacking.";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["fee-change", "Airbnb fee change"],
  ["profit", "Profit vs occupancy"],
  ["uk-market", "UK market"],
  ["tool-vs-human", "Tool vs human"],
  ["how", "How we set prices"],
  ["events", "Events"],
  ["tips", "12 pricing tips"],
  ["value", "Value for money"],
  ["included", "What’s included"],
  ["proof", "Proof"],
  ["review", "Free pricing review"],
  ["call", "Run package"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "Prices reviewed and updated every month.",
  label: "Free pricing review",
  href: "#review",
};
