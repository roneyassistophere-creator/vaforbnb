import { toolById, toolLink } from "@/content/tools/catalog";
import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";
import type { RelatedLink } from "@/components/service/ServiceBlocks";

/** All copy for /services/guest-communication. */

const price = showPrice(prices.run);

export const hero = {
  kicker: `Answering guests now · 8am–8pm UK, Mon–Sat`,
  title: "Airbnb guest communication, handled from enquiry to review",
  primary: "Book a 20-minute call",
  secondary: "Get the free message templates",
};

export const inbox = [
  { i: "SA", n: "Sarah", ch: "Airbnb", p: "Perfect, thank you so much!", active: true },
  { i: "JM", n: "James", ch: "Booking.com", p: "Can we check in at 2pm?" },
  { i: "PK", n: "Priya", ch: "WhatsApp", p: "Is the parking free?" },
  { i: "TL", n: "Tom", ch: "Vrbo", p: "Do you allow dogs?" },
];

export const glance = [
  { k: "Hours", v: "8am to 8pm UK time (GMT/BST)" },
  { k: "Days", v: "Monday to Saturday" },
  { k: "General replies", v: "Under 5 minutes during our hours" },
  { k: "Situational replies", v: "10 to 15 minutes (needs research)" },
  { k: "Outside our hours", v: "Scheduled messages and guidebook; answered from 8am" },
  { k: "Channels", v: "Airbnb, Booking.com, Vrbo, other OTAs, WhatsApp, email" },
  { k: "Written as", v: "You, in your tone, from your reservations team" },
  { k: "Price", v: `In the Run package, from ${price} a month` },
];

export const journey = [
  { h: "Enquiry", t: "Answer quickly and accurately, check the guest’s profile for red flags, help turn it into a booking.", when: "Under 5 min" },
  { h: "Booking confirmation", t: "A warm confirmation with dates, times and what happens next.", when: "Straight after" },
  { h: "Pre-arrival", t: "Ask arrival time and trip purpose, share travel and parking tips, remind key house rules.", when: "7 and 3 days before" },
  { h: "Check-in", t: "Address, map link, what3words, access steps and Wi-Fi; guide them in if stuck.", when: "Morning of arrival" },
  { h: "During the stay", t: "First-morning check, answer questions, troubleshoot, coordinate cleaner or tradesperson.", when: "Under 5 min to acknowledge" },
  { h: "Check-out", t: "A friendly reminder with no more than four simple tasks; offer late check-out if free.", when: "Evening before" },
  { h: "Review", t: "Thank the guest, request a review, reply to it, and flag any unfair review for you.", when: "Within 24 hours" },
];

export const speed = [
  { h: "General", ex: "Check-in time, Wi-Fi password, parking, “is there a hairdryer?”", time: "Under 5 minutes", note: "", w: "12%", c: "#F0595A" },
  { h: "Situational (needs research)", ex: "Nearest station, restaurants, late-night shops, taxis, local events", time: "10 to 15 minutes", note: "", w: "34%", c: "#F0595A" },
  { h: "Problem during the stay", ex: "Heating off, key safe won’t open, something broken", time: "Under 5 min to acknowledge", note: "then a plan and the right person", w: "12%", c: "#14212B" },
  { h: "Booking and special requests", ex: "Early check-in, extra guests, pets, discounts", time: "Checked against your rules", note: "confirmed with you if outside them", w: "100%", c: "#CBD3D9" },
];

export const steps = [
  { h: "Read and check", t: "The full conversation and your property notes, so we never ask twice.", tone: "plain" },
  { h: "Research", t: "Google Maps for the station, walking time, bus routes, last trains, step-free access.", tone: "plain" },
  { h: "Draft", t: "A clear, friendly answer in your tone, with times and a map link.", tone: "plain" },
  { h: "Double-check", t: "A second look at times, addresses and codes.", tone: "soft" },
  { h: "Send and log", t: "Useful answers go into your guidebook for the next guest.", tone: "dark" },
] as const;

export const channels = [
  { n: "Airbnb", t: "Enquiries, requests, scheduled messages, the stay, reviews and replies" },
  { n: "Booking.com", t: "Guest messages and special requests via extranet or channel manager" },
  { n: "Vrbo", t: "Enquiries and booking requests within the 24-hour window" },
  { n: "Other OTAs", t: "Through Hostaway, Guesty, Smoobu, Hospitable and similar" },
  { n: "WhatsApp", t: "Direct bookings: enquiries, confirmations, check-in, stay support" },
  { n: "Email", t: "Direct enquiries, confirmations and pre-arrival information" },
];

export const proof = [
  { v: "[X]%", k: "Response rate across client listings", e: "Airbnb performance page, dated" },
  { v: "[1 hr]", k: "Response time shown on listings", e: "Screenshot of the listing badge" },
  { v: "[X] min", k: "Average first reply during our hours", e: "Channel manager report, dated" },
  { v: "[X.X]", k: "Communication rating out of 5", e: "Review category screenshot" },
];

export const cases = [
  { t: "Locked out after a late arrival", s: "A guest arrived at [time] and the key safe code wasn’t working.", a: "We acknowledged them within [X] minutes, checked the code against the lock app, sent photo-guided steps and arranged the backup key with [the host or a local contact].", o: "Guest inside within [X] minutes; review mentioned “[quote]”." },
  { t: "Heating failure in winter", s: "Guests reported no heating on a cold evening.", a: "We walked them through the boiler reset and pressure check, booked the engineer for the next morning and offered portable heaters as a goodwill gesture.", o: "Problem fixed by [time]; guest left [X] stars." },
  { t: "A party booking request", s: "A local guest with no reviews asked about bringing “a few friends” on a Saturday.", a: "We spotted the red flags, politely restated the maximum guests and no-events rule, and declined in line with the host’s policy.", o: "No disruption to the neighbours, and no damage." },
  { t: "A guest demanding a refund", s: "A guest asked for a partial refund over a minor issue and hinted at a bad review.", a: "We stayed calm and factual, offered a fair fix, and guided it through Airbnb’s Resolution Centre rather than paying off-platform.", o: "Resolved through the platform; review [outcome]." },
];

export const rules = [
  { n: "1", b: "A personal greeting:", t: "first name only, never “Dear Guest”." },
  { n: "2", b: "A warm opening line", t: "about their trip." },
  { n: "3", b: "The answer first:", t: "one topic per message." },
  { n: "4", b: "Specifics, not adjectives:", t: "times, distances, codes, links." },
  { n: "5", b: "A consistent sign-off", t: "from your reservations team." },
  { n: "·", b: "No capitals, blame or jargon,", t: "even when a guest is upset." },
  { n: "·", b: "Keep it on the platform:", t: "Airbnb bans off-platform booking or payment links." },
];

export const compare = {
  cols: ["Doing it yourself", brand.name, "Management company"],
  rows: [
    { k: "Who replies", diy: "You, around your job", va: "Our trained team, as you", mc: "Their staff, often as their brand" },
    { k: "Reply speed", diy: "When you can", va: "Under 5 min (general), 8am–8pm, Mon–Sat", mc: "Varies" },
    { k: "Your control", diy: "Full", va: "Full: your rules, tone, listing", mc: "Limited" },
    { k: "Typical cost", diy: "Your time", va: `From ${price} a month`, mc: "Often a % of booking revenue" },
    { k: "Cleaning, pricing, reviews", diy: "If you do it", va: "Yes, in the Run package", mc: "Yes" },
  ],
};

export const packageCta = {
  title: `Hand over your inbox, from ${price} a month`,
  text: "With listing and pricing optimisation, cleaning and maintenance coordination, review management and a monthly finance check. Monthly rolling. [Your notice period.]",
};

export const faq: FaqEntry[] = [
  { q: "How fast should I reply to Airbnb guests?", a: "Airbnb counts replies within 24 hours towards your response rate, and Superhosts need 90%+. Guests expect faster: 56% expect a reply within an hour if something goes wrong (Vrbo, 2026). We reply to general questions in under 5 minutes during our hours." },
  { q: "Does response time affect my Airbnb ranking?", a: "Yes. Airbnb lists response times and acceptance rate among its search ranking factors, alongside price, quality and popularity." },
  { q: "What hours do you cover?", a: `8am to 8pm UK time, ${brand.hours.days[0]} to ${brand.hours.days[brand.hours.days.length - 1]}. Later messages are answered first thing the next working morning; scheduled messages and your guidebook cover the evening.` },
  { q: "Will guests know it isn’t me replying?", a: "No. We write in your name and tone, using a style guide we agree with you, signed from your reservations team." },
  { q: "Do you need my Airbnb password?", a: "No. We join as a co-host with only the permissions you choose, or work through your channel manager." },
  { q: "Which platforms do you cover?", a: "Airbnb, Booking.com, Vrbo, other booking sites through your channel manager, and direct bookings on WhatsApp and email." },
  { q: "What happens in an emergency?", a: "During our hours we acknowledge it in under 5 minutes and contact the right person straight away. Your guidebook gives guests 999 and the gas emergency line at any hour." },
  { q: "Can you handle reviews too?", a: "Yes. We request reviews, reply to every review in your voice and flag unfair ones for you, as part of the Run package." },
];

export const related: RelatedLink[] = [
  { k: "Free template", h: "Automated guest messages", href: anchors.tool("guest-message-generator") },
  { k: "Free template", h: "House rules template", href: toolLink(toolById("house-rules-generator")!) },
  { k: "Service", h: "Listing optimisation", href: anchors.service("listing") },
  { k: "Service", h: "Review management", href: anchors.service("reviews") },
];

export const sources =
  "Airbnb, How search works on Airbnb · Airbnb Help, Response rate · Hostfully, Airbnb Superhost requirements 2026 · Vrbo Help, Responsiveness metrics · Vrbo / Expedia Group, Built to Stay Report, July 2026 · Airbnb off-platform policy · Enso Connect, Response times in hospitality (industry estimate).";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["glance", "At a glance"],
  ["why", "Why speed matters"],
  ["measure", "How we measure"],
  ["journey", "Every stage"],
  ["standards", "Response times"],
  ["research", "Research questions"],
  ["channels", "Channels"],
  ["templates", "Free templates"],
  ["proof", "Proof"],
  ["hard-moments", "Hard moments"],
  ["great-message", "Great messages"],
  ["comparison", "DIY vs VA vs agency"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "Every guest message answered, day and night.",
  label: "Book a call",
  href: "#call",
};
