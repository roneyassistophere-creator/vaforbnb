import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import { toolById, toolLink } from "@/content/tools/catalog";
import type { IconName } from "@/lib/icons";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /who-we-help. */

export const hero = {
  titleStart: "Built for UK hosts, operators and",
  titleAccent: "property managers",
  lead: `${brand.name} is an Airbnb virtual assistant team for anyone running short lets in the UK: side-hustle hosts, holiday let owners, serviced accommodation operators, property managers and London hosts. Whatever your setup, we take the daily work off your plate and you keep control.`,
};

type ToolLink = { label: string; href: string };
/** Link to a tool: its page once live, otherwise its card on the tools hub. */
const tool = (label: string, id: string): ToolLink => {
  const t = toolById(id);
  return { label, href: t ? toolLink(t) : anchors.tool(id) };
};

export type Persona = {
  id: string;
  icon: IconName;
  tab: string;
  sub: string;
  tag: string;
  h: string;
  t: string;
  pains: string[];
  take: { h: string; t: string }[];
  services: string[];
  tools: ToolLink[];
  cta: string;
  pkg: string;
  quote: string;
  quoteBy: string;
};

export const personas: Persona[] = [
  {
    id: "side", icon: "house", tab: "Side-hustle hosts", sub: "1–5 homes, full-time job",
    tag: "Side-hustle hosts · 1 to 5 properties", h: "Hosting that fits around your job and family",
    t: "You started hosting to build income, not a second job. We take the messages, cleaners and pricing off your phone, so you can focus on work and still grow.",
    pains: ["Answering guests during meetings and dinners", "Chasing cleaners on changeover days", "Guessing prices and hoping for the best"],
    take: [{ h: "Guest messages", t: "Answered during our hours, from enquiry to review." }, { h: "Cleaners and turnovers", t: "Booked, confirmed and photographed." }, { h: "Weekly price checks", t: "Big changes sent to you first." }, { h: "Monthly profit report", t: "Know what each property really earns." }],
    services: ["Guest communication", "Cleaning coordination", "Pricing optimisation"],
    tools: [tool("Short-let profit calculator", "short-let-profit-calculator"), { label: "UK compliance checker", href: anchors.complianceChecker }, tool("AI-readiness listing scorer", "ai-readiness-listing-scorer")],
    cta: "Get my free audit", pkg: "Run package",
    quote: "[Short quote from a side-hustle host about getting evenings back]", quoteBy: "[First name · area · 2 properties]",
  },
  {
    id: "holiday", icon: "cottage", tab: "Holiday let owners", sub: "Cottages and seaside homes",
    tag: "Holiday let and second-home owners", h: "Fill the quiet months, keep the good reviews",
    t: "Coastal and countryside lets live and die by season. We help fill the gaps with longer stays and smart pricing, and keep guests happy while you’re miles away.",
    pains: ["Empty weeks outside the summer", "Managing guests and cleaners from far away", "Keeping up with rates, levies and rules"],
    take: [{ h: "Seasonal pricing", t: "Events and quiet months planned early." }, { h: "Longer-stay listings", t: "Clear facts for remote workers and families." }, { h: "Remote guest care", t: "Check-in guides and quick answers." }, { h: "Local trades coordinated", t: "Quotes found, you choose." }],
    services: ["Pricing optimisation", "Listing optimisation", "Laundry and maintenance"],
    tools: [tool("AI-readiness listing scorer", "ai-readiness-listing-scorer"), tool("Long-stay discount calculator", "long-stay-discount-calculator"), tool("Business rates qualifier", "business-rates-qualifier"), tool("Visitor levy calculator", "visitor-levy-calculator")],
    cta: "Get my free audit", pkg: "Run package",
    quote: "[Short quote from a holiday let owner about winter bookings]", quoteBy: "[First name · area · cottage]",
  },
  {
    id: "sa", icon: "building", tab: "SA and rent-to-rent", sub: "Serviced accommodation operators",
    tag: "Serviced accommodation virtual assistant", h: "Keep operations running while you find the next deal",
    t: "Every unit adds messages, turnovers and admin. Our serviced accommodation virtual assistant team handles the daily work across your units, so you can spend your time on growth.",
    pains: ["Operations eat the time you need for deals", "Standards slip as units are added", "No clear view of profit per unit"],
    take: [{ h: "Multi-channel guest care", t: "Airbnb, Booking.com, direct and more." }, { h: "Turnovers across units", t: "Cleaners, linen and maintenance coordinated." }, { h: "P&L per unit", t: "Monthly, every booking and bill." }, { h: "SOPs", t: "The same standard in every unit." }],
    services: ["Guest communication", "Cleaning coordination", "Finance check", "Systemise your business"],
    tools: [tool("Short vs long let comparison", "short-let-vs-long-let"), tool("Long-stay discount calculator", "long-stay-discount-calculator"), tool("Booking performance tracker", "booking-performance")],
    cta: "Talk about your units", pkg: "Run + Build",
    quote: "[Short quote from an SA operator about time saved]", quoteBy: "[First name · city · 8 units]",
  },
  {
    id: "pm", icon: "manager", tab: "Property managers", sub: "Managing homes for owners",
    tag: "Property management virtual assistant", h: "Take on more homes without more staff",
    t: "A property management virtual assistant team for guest messages, turnovers and owner reporting, working inside your systems and in your brand’s voice.",
    pains: ["Hiring and training staff for every new home", "Owner reports eating month-end", "Cover for sickness and holidays"],
    take: [{ h: "Works in your channel manager", t: "No new systems to learn." }, { h: "Owner reports", t: "Prepared every month." }, { h: "Your tone and rules", t: "Written into our SOPs." }, { h: "Team cover", t: "No single point of failure." }],
    services: ["Guest communication", "Review management", "Finance check"],
    tools: [tool("Booking performance tracker", "booking-performance"), tool("Certificate reminders", "certificate-reminders")],
    cta: "See how we work with managers", pkg: "Run, custom",
    quote: "[Short quote from a property manager about scaling]", quoteBy: "[First name · company · 20 homes]",
  },
  {
    id: "london", icon: "london", tab: "London hosts", sub: "90-night rule, busy market",
    tag: "London Airbnb management support", h: "Built for London’s rules and guests",
    t: "London hosts face the 90-night limit for whole-home short lets and a crowded market. We help you track nights, target contractors and longer stays, and stand out.",
    pains: ["Tracking the 90 nights across platforms", "Standing out among thousands of listings", "Gaps when the 90 nights run out"],
    take: [{ h: "90-night tracking", t: "Across every platform you list on." }, { h: "Contractor and business stays", t: "Listings and pricing aimed at longer stays." }, { h: "Guest vetting", t: "Within platform rules and UK law." }, { h: "Plain-English rules", t: "From our UK Rules Hub." }],
    services: ["Listing optimisation", "Pricing optimisation", "Guest communication"],
    tools: [tool("London 90-night counter", "london-90-night-counter"), tool("Long-stay discount calculator", "long-stay-discount-calculator"), { label: "UK compliance checker", href: anchors.complianceChecker }],
    cta: "London hosts: talk to us", pkg: "Run package",
    quote: "[Short quote from a London host]", quoteBy: "[First name · borough · 1-bed flat]",
  },
  {
    id: "scale", icon: "chart", tab: "Building systems", sub: "Growing and scaling",
    tag: "Scaling your short-let business", h: "A business that doesn’t need you in every detail",
    t: "SOPs, finance reporting and direct booking websites that make your business easier to run, grow, sell or hand over.",
    pains: ["Everything lives in your head", "Retraining every new VA or staff member", "Too reliant on Airbnb for bookings"],
    take: [{ h: "SOP library", t: "The SOPs we train our own team with." }, { h: "Portfolio reporting", t: "Profit across every property." }, { h: "Direct booking website", t: "Yours to own and grow." }, { h: "Brand and SEO", t: "Found outside the OTAs." }],
    services: ["Systemise your business", "Direct booking websites", "SEO for short lets"],
    tools: [tool("Direct booking savings calculator", "direct-booking-savings"), tool("Hosting time calculator", "hosting-time-calculator")],
    cta: "See the Build package", pkg: "Build + Grow",
    quote: "[Short quote about SOPs and training]", quoteBy: "[First name · company]",
  },
];

export type FitKey = "size" | "role" | "where";
export const fitQuestions: { key: FitKey; q: string; opts: [string, string][] }[] = [
  { key: "size", q: "How many properties?", opts: [["1", "1"], ["2-5", "2–5"], ["6-20", "6–20"], ["20+", "20+"]] },
  { key: "role", q: "What best describes you?", opts: [["own", "I own and host"], ["holiday", "Holiday let owner"], ["sa", "SA / rent-to-rent"], ["pm", "I manage for owners"]] },
  { key: "where", q: "Where are they?", opts: [["london", "London"], ["england", "Rest of England"], ["other", "Scotland, Wales or NI"]] },
];

/** Note shown per persona index once the fit finder is complete. */
export const fitNotes = [
  "We’d start with the daily work: messages, cleaners and pricing.",
  "We’d focus on seasonal pricing, longer stays and remote guest care.",
  "We’d cover operations across your units and write SOPs as you grow.",
  "We’d work inside your systems, in your brand’s voice, with owner reports.",
  "We’d track your 90 nights and aim your listing at longer stays.",
  "With this many homes, systems and reporting will save you the most time.",
];

/** Maps fit-finder answers to a persona index. */
export function matchPersona(f: Record<FitKey, string>): number {
  if (f.role === "pm") return 3;
  if (f.role === "sa") return 2;
  if (f.where === "london" && f.role === "own") return 4;
  if (f.role === "holiday") return 1;
  if (f.size === "6-20" || f.size === "20+") return 5;
  return 0;
}

export const sizes = [
  { n: "1", l: "property", h: "Your first let", pts: ["Guest messages and check-in", "Cleaner booked and confirmed", "Listing set up properly"], pkg: "Run" },
  { n: "2–5", l: "properties", h: "Side hustle growing", pts: ["All daily work handled", "Weekly pricing checks", "Profit per property"], pkg: "Run" },
  { n: "6–20", l: "properties", h: "A real business", pts: ["SOPs so standards stay the same", "Team cover across units", "Portfolio reporting"], pkg: "Run + Build" },
  { n: "20+", l: "properties", h: "Scaling operator", pts: ["Custom set-up in your systems", "Owner or investor reporting", "Direct booking growth"], pkg: "Custom" },
];

export const nations = [
  { t: "London", c: "#F0595A", r: "Whole-home short lets are limited to 90 nights a calendar year without planning permission." },
  { t: "Rest of England", c: "#14212B", r: "A national short-let register is planned. Safety, guest records and business rates rules apply now." },
  { t: "Scotland", c: "#5B3FA0", r: "A short-term let licence is needed, and the licence number must appear in your listings." },
  { t: "Wales", c: "#1F6B45", r: "A national registration scheme is coming, plus local tax premiums in some areas." },
  { t: "Northern Ireland", c: "#B8383A", r: "Short lets need a Tourism NI certificate." },
];

export const stack = ["Airbnb", "Booking.com", "Vrbo", "Hostaway", "Uplisting", "Lodgify", "Tokeet", "PriceLabs", "WhatsApp", "Google Workspace"];

export const fitYes = [
  "Want the daily work handled but stay in control of big decisions",
  "Run short lets anywhere in the UK, from 1 property upwards",
  "Value written processes and honest reporting",
  "Already have cleaners and trades, or want help finding them",
  "Want to grow direct bookings over time",
];

export const fitNo = [
  "Need someone on site to meet guests or clean",
  `Need overnight cover on our standard plan (${brand.hours.range})`,
  "Want guaranteed bookings or rankings",
  "Want fake reviews or only happy guests asked to review",
  "Want to share your Airbnb password rather than use co-host access",
];

export const faq: FaqEntry[] = [
  { q: "Do I need several properties to work with you?", a: "No. Many of our clients have one or two properties. Support is set up per property, so you can start small and add more later." },
  { q: "Do you work outside London?", a: "Yes. We support hosts across England, Scotland, Wales and Northern Ireland. Our team works remotely, and on-site work is done by your local cleaners and trades, which we coordinate." },
  { q: "Can you work under my brand as a property manager?", a: "Yes. We can reply to guests in your company’s tone and follow your processes. We’ll agree how to introduce the team to your guests and owners." },
  { q: "Do you help rent-to-rent operators?", a: "Yes, with the daily operations. Your agreement with the landlord, insurance and any permissions are your responsibility, and our UK Rules Hub explains what to check." },
  { q: "Do you help with Scotland licences or Wales registration?", a: "We help you keep dates, records and listing details in order, and point you to the official guidance. We don’t apply for licences on your behalf or give legal advice." },
  { q: "What if my setup doesn’t fit any of these?", a: "Book a call and tell us how you work. If we’re not the right fit, we’ll say so and point you somewhere better." },
];
