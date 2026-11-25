import { brand } from "@/config/brand";
import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/laundry-and-maintenance. */

const INK = "#14212B";
const CORAL = "#F0595A";
const PINK = "#FDECEC";
const GREEN = "#1F6B45";
const GOLD = "#C9A227";

export const checklistHref = `mailto:${brand.contact.email}?subject=${encodeURIComponent("Send me the maintenance checklist")}`;

export const glance = [
  { k: "Who does the work", a: "Your laundry or linen hire company, and your cleaner", b: "Your existing handyman, or a local trade you choose" },
  { k: "What we do", a: "Orders, delivery timing, collections, counts, issues, invoices", b: "Scope, find or brief the trade, quotes, booking, follow-up, completion photos" },
  { k: "Who pays", a: "You pay the laundry company directly", b: "You pay the tradesperson directly" },
  { k: "Your decisions", a: "Which company, how many sets, budget", b: "Which quote, anything over your agreed limit" },
  { k: "Our hours", a: "8am–8pm UK time, Monday to Saturday", b: "8am–8pm UK time, Monday to Saturday" },
];

export const linenOptions = [
  { t: "Linen hire", tag: "Busy city lets", how: "A company supplies hotel-style sets, collects the used ones and delivers fresh.", best: "Busy city lets with frequent turnovers.", watch: "Delivery windows, minimum orders, set sizes and coverage area." },
  { t: "You own it, a laundry washes it", tag: "Your own style", how: "Your sets are collected, washed and returned.", best: "Hosts who want their own style and quality.", watch: "Turnaround time; you need enough sets in rotation." },
  { t: "Cleaner washes on site", tag: "Larger homes", how: "The cleaner washes and dries as part of the turnover.", best: "Larger homes with a washer and dryer, or rural lets.", watch: "Drying time on same-day turnovers; agree the rate." },
];

export const linenSets = [
  { t: "On the bed", bg: "#FFFFFF" },
  { t: "In the wash", bg: "#F5F2EC" },
  { t: "Spare", bg: PINK },
];

export const areas = ["All", "London", "Manchester", "Birmingham", "National"] as const;

export const companies = [
  { n: "Airlinen", o: "On-demand linen and towels, toiletries and consumables, plus turnover cleaning. 90-minute delivery slots, 7 days a week; pay-as-you-go and same-day bookings.", where: "London · across the UK", tags: ["London", "National"] },
  { n: "Laundryheap Linen", o: "Hotel-grade linen and towel rental, no deposit, from £15.95 + VAT per set. Next-day delivery in most areas, 8am–8pm windows; rental up to 14 days as standard.", where: "Greater London (inside the M25)", tags: ["London"] },
  { n: "Love2Laundry", o: "Linen hire and laundering for hospitality and short lets. 24-hour turnaround, fixed or on-demand.", where: "London · Birmingham · Manchester · Liverpool · Nottingham · York · Coventry · Oxford · Preston", tags: ["London", "Birmingham", "Manchester"] },
  { n: "LinenBnB", o: "Linen rental subscription and turnover cleaning for short lets (founded 2016).", where: "London", tags: ["London"] },
  { n: "Blossom & Browne", o: "Commercial laundry and linen services for serviced apartments and hotels.", where: "Check coverage", tags: [] as string[] },
  { n: "Elis", o: "Large-scale hospitality linen hire and laundry.", where: "National · larger operators", tags: ["National"] },
];

export const laundrySteps = [
  { h: "Plan:", t: "sets per turnover from guests and beds; stock levels agreed." },
  { h: "Order:", t: "placed as bookings come in, adjusted when they change." },
  { h: "Time it:", t: "deliveries before the cleaner, collections after." },
  { h: "Tell everyone:", t: "times, access and where bags go, for cleaner and driver." },
  { h: "Check counts:", t: "the cleaner confirms in and out, with a photo." },
  { h: "Report problems:", t: "stains, tears, short or wrong deliveries, same day." },
  { h: "Check invoices:", t: "matched to what was delivered before you pay." },
];

export const hours = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

export const gantt = [
  { who: "Guest", bars: [{ l: "0%", w: "33.3%", c: "#E2E6EA", fg: INK, t: "Checking out" }, { l: "77.8%", w: "22.2%", c: PINK, fg: INK, t: "Check-in 15:00" }] },
  { who: "Linen company", bars: [{ l: "16.7%", w: "16.7%", c: CORAL, fg: INK, t: "Delivery 09:30–11:00" }, { l: "72.2%", w: "7%", c: CORAL, fg: INK, t: "Collect" }] },
  { who: "Cleaner", bars: [{ l: "33.3%", w: "38.9%", c: INK, fg: "#FFFFFF", t: "Turnover 11:00–14:30 · photos" }] },
  { who: brand.name, bars: [{ l: "5.5%", w: "9%", c: "#E3F3EA", fg: GREEN, t: "Confirm" }, { l: "34%", w: "9%", c: "#E3F3EA", fg: GREEN, t: "Counts" }, { l: "72.5%", w: "5%", c: "#E3F3EA", fg: GREEN, t: "✓" }] },
];

export const tradeSteps = [
  { h: "Scope it", t: "What’s needed, with photos from the cleaner or guest.", c: "#FFFFFF" },
  { h: "Shortlist", t: "Local options, reviews checked, registrations where required.", c: "#FFFFFF" },
  { h: "Quotes", t: "[2 or 3] quotes: what’s included, price, earliest date.", c: "#FFFFFF" },
  { h: "You choose", t: "A simple side-by-side comparison. You pick.", c: CORAL },
  { h: "We coordinate", t: "Booking, access, timing around guests, follow-up, completion photos.", c: "#FFFFFF" },
  { h: "You pay", t: "The trade invoices you directly. We log the job and keep their details.", c: INK },
];

export const quotes = [
  { n: "Quote A", p: "£[X]", inc: "[Mow, edges, waste removal]", date: "[Date]", rev: "[Rating, platform]" },
  { n: "Quote B", p: "£[X]", inc: "[Mow, edges, hedge trim, waste]", date: "[Date, no guests in]", rev: "[Rating, platform]" },
  { n: "Quote C", p: "£[X]", inc: "[Mow only]", date: "[Date]", rev: "[Rating, platform]" },
];

export const tradeChecks = [
  { h: "Gas Safe", t: "Registration and ID checked for any gas work." },
  { h: "Registered electrician", t: "For example NICEIC or NAPIT, beyond simple jobs." },
  { h: "Reviews", t: "Recent reviews on Checkatrade, MyBuilder, Rated People or Google." },
  { h: "Insurance", t: "Public liability for anything significant." },
  { h: "Written quote", t: "Scope, price and timing before anyone starts." },
];

export const triage = [
  { lvl: "Urgent", tc: "#B8383A", c: CORAL, ex: "No heating or hot water in winter, a leak, no power, a lockout, security", aim: "Acknowledged in minutes during our hours; right person contacted straight away; guest kept updated." },
  { lvl: "Before next check-in", tc: "#8A6A00", c: GOLD, ex: "Broken appliance, Wi-Fi down, blocked drain, faulty lock", aim: "Fixed before the next guest arrives, or the guest told in advance." },
  { lvl: "Scheduled", tc: INK, c: INK, ex: "Painting, garden tidy, sealant, small wear and tear", aim: "Booked on empty days, so no guest is disturbed." },
  { lvl: "Preventive", tc: GREEN, c: GREEN, ex: "Boiler service, gutters, deep clean, alarm tests", aim: "On a calendar, with reminders before they’re due." },
];

export const jobs = [
  { d: "04/11", i: "Dripping kitchen tap", f: "Your handyman", p: "Photos · invoice" },
  { d: "09/11", i: "Boiler pressure low", f: "Gas Safe engineer", p: "Photos · record" },
  { d: "12/11", i: "Garden tidy", f: "Quote B gardener", p: "Photos · invoice" },
  { d: "15/11", i: "Blind cord snapped", f: "Your handyman", p: "Photos · invoice" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const year = MONTHS.map((m, i) => {
  const marks = [GREEN];
  if (i === 1 || i === 4 || i === 7 || i === 10) marks.unshift(INK);
  if (i === 8) marks.unshift(CORAL);
  if (i === 9) marks.unshift(GOLD);
  if (i === 10) marks.unshift("#7D98A6");
  if (i === 0) marks.unshift("#B8383A");
  return { m, marks };
});

export const legend = [
  { c: CORAL, h: "Gas safety check", t: "annual, Gas Safe engineer" },
  { c: GOLD, h: "Boiler service", t: "before winter" },
  { c: INK, h: "Deep clean", t: "every 2–3 months" },
  { c: GREEN, h: "Smoke and CO alarm tests", t: "monthly" },
  { c: "#B8383A", h: "Fire risk assessment review", t: "yearly" },
  { c: "#7D98A6", h: "Gutters", t: "autumn" },
];

export const lanes = [
  { h: "You", tone: "coral", items: ["Choose your laundry company and trades", "Approve quotes and anything over your limit", "Pay suppliers and trades directly"] },
  { h: brand.name, tone: "white", items: ["Orders, scheduling and timing", "Finding options and collecting quotes", "Follow-up, completion checks and the job log"] },
  { h: "Your trades and suppliers", tone: "outline", items: ["Deliver, collect and launder", "Quote, do the work, send photos", "Invoice you directly"] },
] as const;

export const steps = [
  { n: "01", h: "Onboarding call", t: "Laundry set-up, handyman, spending limit, priorities." },
  { n: "02", h: "Set up", t: "Contacts, stock levels, access, maintenance calendar, job log." },
  { n: "03", h: "Introductions", t: "We introduce ourselves to your laundry company, cleaner and handyman." },
  { n: "04", h: "Day to day", t: "Orders, deliveries, repairs and follow-ups; you approve big decisions." },
  { n: "05", h: "Monthly summary", t: "Orders, jobs completed, costs and what’s coming up." },
];

export const honest = [
  { b: "We coordinate; we don’t do the work.", t: "So we check reviews, ask for photos and log everything." },
  { b: "Availability isn’t guaranteed.", t: "In busy periods we keep you informed and offer alternatives." },
  { b: "No mark-up on invoices.", t: "You pay suppliers and trades directly, at their prices." },
  { b: "Our hours: 8am–8pm UK, Mon–Sat.", t: "" },
];

export const proof = [
  { k: "Maintenance jobs coordinated last quarter", v: "[X]" },
  { k: "Urgent jobs with a trade contacted in [X] min", v: "[X]%" },
  { k: "Linen deliveries before the cleaner", v: "[X]%" },
];

export const packageCta = {
  title: `Laundry and maintenance coordination from ${showPrice(prices.run)} a month`,
  text: "With guest communication, pricing, cleaning coordination and review management. Laundry, linen hire and trades are paid by you, directly.",
};

export const faqCats = ["All", "Laundry", "Maintenance", "Payments"] as const;
export type FaqCat = (typeof faqCats)[number];

export const faq: (FaqEntry & { cat: Exclude<FaqCat, "All"> })[] = [
  { cat: "Laundry", q: "Should I hire linen or wash it myself?", a: "Linen hire suits busy city lets with frequent turnovers. Owning your linen gives you control over quality; you then need a laundry, or a cleaner who washes, and enough sets in rotation." },
  { cat: "Laundry", q: "Which companies do Airbnb linen hire in the UK?", a: "Hosts use companies such as Airlinen, Laundryheap Linen, Love2Laundry and LinenBnB, mostly in London and larger cities. Coverage and prices vary, so check your postcode. We work with whichever you choose." },
  { cat: "Laundry", q: "How many sets of sheets does an Airbnb need?", a: "If you own your linen, at least three sets per bed: one on the bed, one in the wash, one spare. Keep spare towels for same-day turnovers." },
  { cat: "Maintenance", q: "What happens if something breaks during a stay?", a: "During our hours we acknowledge the guest in minutes, contact your handyman or a suitable local trade, keep the guest updated and follow up until it’s fixed." },
  { cat: "Maintenance", q: "Can you use my own handyman?", a: "Yes. We coordinate with the handyman you already use, and only look for someone new when they can’t help or the job needs a specialist." },
  { cat: "Maintenance", q: "How do you find a new tradesperson?", a: "We shortlist local options, check reviews and required registrations (like Gas Safe for gas work), collect quotes and send you a comparison. You choose; we book and coordinate." },
  { cat: "Maintenance", q: "Do I need a gas safety certificate for a holiday let?", a: "HSE guidance covers holiday accommodation and expects an annual gas safety check by a Gas Safe registered engineer, with the record displayed for stays under 28 days. We remind you before it’s due." },
  { cat: "Payments", q: "Who pays the tradesperson?", a: "You do, directly. We don’t take payment for trades or add a mark-up." },
];

export const sources =
  "Airlinen (KeyNest partner page) · Laundryheap Linen · Love2Laundry hospitality · LinenBnB profile · Airbnb Resource Centre, 5-step cleaning process · HSE, gas safety check records; who needs gas safety checks · Gas Safe Register.";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["glance", "At a glance"],
  ["laundry", "Laundry and linen"],
  ["maintenance", "Maintenance"],
  ["who-does-what", "Who does what"],
  ["process", "How it works"],
  ["call", "Run package"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "Linen and repairs handled, without the chasing.",
  label: "Book a call",
  href: "#call",
};
