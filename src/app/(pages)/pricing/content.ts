import { brand } from "@/config/brand";
import type { PriceKey } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /pricing. Numbers live in src/config/pricing.ts. */

export const hero = {
  titleStart: "Simple monthly pricing.",
  titleAccent: "No commission on your bookings.",
  lead: `${brand.name} charges a clear monthly fee per property for Airbnb virtual assistant support, not a percentage of your income. Choose a package or single services, and start with a free listing audit.`,
  trust: ["No commission on bookings", "No passwords shared", brand.hours.short, "Free listing audit first"],
};

export const packageCards: {
  t: string;
  who: string;
  priceKey: PriceKey;
  unit: string;
  cta: string;
  href: string;
  popular: boolean;
  inc: string[];
}[] = [
  {
    t: "Run",
    who: "The daily work, done properly. For hosts who want their evenings back.",
    priceKey: "run",
    unit: "per property / month",
    cta: "Start with a free audit",
    href: brand.links.freeAudit,
    popular: true,
    inc: ["Guest communication, enquiry to review", "Listing optimisation, AI search ready", "Weekly pricing checks", "Cleaning coordination with photos", "Laundry and maintenance organised", "Review management", "Monthly finance check"],
  },
  {
    t: "Grow",
    who: "More direct bookings and a brand guests come back to.",
    priceKey: "grow",
    unit: "per service / month · website one-off",
    cta: "Talk about growth",
    href: brand.links.bookCall,
    popular: false,
    inc: ["Direct booking website", "Channel manager and payments set up", "SEO for short lets", "Social media management", "Monthly progress report"],
  },
  {
    t: "Build",
    who: "Systems that let your business run without you in every detail.",
    priceKey: "build",
    unit: "one-off · custom quote",
    cta: "Talk about systems",
    href: brand.links.bookCall,
    popular: false,
    inc: ["SOP library we train our team with", "Custom SOPs for your properties", "Training support for your VA", "Co-hosting support (coming soon)"],
  },
];

export const vatNote =
  "All prices exclude VAT if applicable [confirm]. Your cleaners, trades, platform fees and software subscriptions are paid by you directly.";

export type AddOn = { key: PriceKey; t: string; s: string; type: "monthly" | "oneoff" };
export const addOns: AddOn[] = [
  { key: "websiteOneOff", t: "Direct booking website", s: "Built, connected and yours to keep", type: "oneoff" },
  { key: "seoMonthly", t: "SEO for short lets", s: "Monthly, found on Google", type: "monthly" },
  { key: "socialMonthly", t: "Social media", s: "Monthly, posts from your real work", type: "monthly" },
  { key: "sopOneOff", t: "Systemise your business (SOPs)", s: "One-off library, tailored to you", type: "oneoff" },
];

export const singles: { t: string; s: string; p: "Run" | "Grow" | "Build"; b: string; serviceId: string }[] = [
  { t: "Guest communication", s: "Every message, enquiry to review", p: "Run", b: "Monthly, per property", serviceId: "guest" },
  { t: "Listing optimisation", s: "Search and AI search ready", p: "Run", b: "One-off or monthly", serviceId: "listing" },
  { t: "Pricing optimisation", s: "Weekly checks, profit first", p: "Run", b: "Monthly, per property", serviceId: "pricing" },
  { t: "Cleaning coordination", s: "Turnovers booked and photographed", p: "Run", b: "Monthly, per property", serviceId: "clean" },
  { t: "Laundry and maintenance", s: "Linen, repairs, safety dates", p: "Run", b: "Monthly, per property", serviceId: "laundry" },
  { t: "Review management", s: "Requests and replies", p: "Run", b: "Monthly, per property", serviceId: "reviews" },
  { t: "Finance check", s: "Monthly profit report", p: "Run", b: "Monthly, per property", serviceId: "finance" },
  { t: "Direct booking website", s: "Built and connected", p: "Grow", b: "One-off, optional care plan", serviceId: "website" },
  { t: "SEO for short lets", s: "Found on Google", p: "Grow", b: "Monthly", serviceId: "seo" },
  { t: "Social media", s: "A brand guests remember", p: "Grow", b: "Monthly", serviceId: "social" },
  { t: "Systemise your business", s: "SOP library or custom SOPs", p: "Build", b: "One-off", serviceId: "sops" },
  { t: "Co-hosting support", s: "Coming soon", p: "Build", b: "To be confirmed", serviceId: "cohost" },
];

export const included = [
  "A trained team, not one VA",
  brand.hours.label,
  "Your approval for big changes",
  "Co-host access, no passwords shared",
  "Written SOPs for your properties",
  "A clear monthly report",
];

export const excluded = [
  "Cleaner and trade invoices",
  "Platform and payment fees",
  "Linen, supplies and guest amenities",
  "Software such as your channel manager or pricing tool",
  "Licence, registration and certificate fees",
  "Advertising spend, if you choose to run ads",
];

export const faq: FaqEntry[] = [
  { q: "Why a monthly fee and not a commission?", a: "Our work doesn’t change when your income goes up, so our price doesn’t either. You keep more of what you earn, and you can see exactly what you pay each month." },
  { q: "Is there a set-up fee?", a: "[Your answer, for example: no set-up fee for Run. Websites and SOP libraries are priced one-off.]" },
  { q: "Is there a minimum contract?", a: "[Your terms, for example: monthly rolling with 30 days’ notice.]" },
  { q: "Do prices include VAT?", a: "[Confirm whether prices include or exclude VAT.]" },
  { q: "Do you charge more for more properties?", a: "Run is priced per property. For larger portfolios we offer a custom quote [confirm any portfolio discount]." },
  { q: "What isn’t included?", a: "Cleaner and trade invoices, platform fees, linen, supplies and software subscriptions like your channel manager or pricing tool. You pay these directly." },
  { q: "Can I change packages later?", a: "Yes. You can add services, move between packages or reduce what you need as your business changes [confirm notice period]." },
  { q: "How do I pay?", a: "[Your payment method, for example monthly by card or direct debit, invoiced in advance.]" },
];
