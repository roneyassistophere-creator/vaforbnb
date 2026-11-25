import { brand } from "@/config/brand";
import { prices, showPrice } from "@/config/pricing";
import { anchors, routes } from "@/config/navigation";
import type { IconName } from "@/lib/icons";
import type { FaqEntry } from "@/lib/seo";
import type { PackageKey } from "@/content/services";

/** All copy for the home page. */

export const hero = {
  eyebrow: "Airbnb virtual assistant team · UK",
  titleStart: "Your UK Airbnb virtual assistant team.",
  titleEm: "We run the daily work,",
  titleEnd: "you keep the control.",
  lead: `We answer your guests, manage pricing and listings, coordinate cleaners and repairs, and keep your reviews and numbers on track. A whole trained team, not one person, working ${brand.hours.sentence}. You approve every big decision.`,
  primaryCta: "Get a free listing audit",
  secondaryCta: "Book a 20-minute call",
  trust: ["A team, not one VA", brand.hours.short, "You approve big changes", `${brand.stats.propertiesSupported} properties supported`],
};

type Status = "ok" | "neutral";
export const today = {
  label: "Today, handled for you",
  day: "Tuesday",
  status: `Team online · until ${brand.hours.closesAt}`,
  items: [
    { time: "08:04", text: "Replied to early check-in request", status: "Done", tone: "ok" as Status },
    { time: "09:30", text: "Cleaner confirmed for Flat 2 turnover", status: "Done", tone: "ok" as Status },
    { time: "11:15", text: "Check-out photos received", status: "Done", tone: "ok" as Status },
    { time: "13:40", text: "Guest asked about parking: answered", status: "Done", tone: "ok" as Status },
    { time: "15:00", text: "Boiler engineer booked for Thursday", status: "Booked", tone: "neutral" as Status },
    { time: "17:20", text: "Review reply drafted for 5★ stay", status: "Sent", tone: "ok" as Status },
  ],
  pending: "1 price change waiting for your OK",
  note: "Illustration of a typical day. Your tasks depend on your package.",
};

export type Pain = {
  id: string;
  label: string;
  cost: string;
  fix: string;
  services: string[];
  pack: PackageKey;
  freeTool: string;
};

export const pains: Pain[] = [
  { id: "msgs", label: "Guest messages at all hours", cost: "Your evenings and your focus", fix: "Every guest message answered, from enquiry to review", services: ["Guest communication"], pack: "run", freeTool: "Guest message templates" },
  { id: "clean", label: "Chasing cleaners", cost: "Stress, refunds and bad reviews", fix: "Turnovers booked, confirmed and photographed", services: ["Cleaning coordination", "Laundry and maintenance"], pack: "run", freeTool: "Cleaning checklist" },
  { id: "empty", label: "Empty nights", cost: "Lost income every week", fix: "A listing built for search and AI search, plus long-stay pricing", services: ["Listing optimisation", "Pricing optimisation"], pack: "run", freeTool: "AI-readiness listing scorer" },
  { id: "price", label: "Guessing my prices", cost: "Money left on the table", fix: "Human-led pricing checked weekly, aimed at profit", services: ["Pricing optimisation"], pack: "run", freeTool: "Short-let profit calculator" },
  { id: "reviews", label: "Reviews slipping", cost: "Fewer bookings and lower rank", fix: "Quick answers, problems fixed fast, calm review replies", services: ["Review management", "Guest communication"], pack: "run", freeTool: "Guest message templates" },
  { id: "rules", label: "Keeping up with rules", cost: "Fines, licence and insurance risk", fix: "Certificate dates tracked and rules explained in plain English", services: ["Laundry and maintenance"], pack: "run", freeTool: "UK compliance checker" },
  { id: "profit", label: "Not sure I’m profitable", cost: "Decisions made in the dark", fix: "A monthly profit report for every property", services: ["Finance check"], pack: "run", freeTool: "Short-let profit calculator" },
  { id: "ota", label: "Too reliant on Airbnb", cost: "Fees and risk on one platform", fix: "Your own booking site, found on Google and social", services: ["Direct booking websites", "SEO for short lets", "Social media"], pack: "grow", freeTool: "Direct booking savings calculator" },
  { id: "va", label: "Retraining every new VA", cost: "Weeks lost each time someone leaves", fix: "Written SOPs any VA can follow from day one", services: ["Systemise your business"], pack: "build", freeTool: "Hosting time calculator" },
];

/** Where each free-tool name in the pain picker links to. */
export const freeToolLinks: Record<string, string> = {
  "Guest message templates": anchors.tool("guest-message-generator"),
  "Cleaning checklist": anchors.tool("cleaning-checklist-generator"),
  "AI-readiness listing scorer": anchors.tool("ai-readiness-listing-scorer"),
  "Short-let profit calculator": anchors.tool("short-let-profit-calculator"),
  "UK compliance checker": anchors.complianceChecker,
  "Direct booking savings calculator": anchors.tool("direct-booking-savings"),
  "Hosting time calculator": anchors.tool("hosting-time-calculator"),
};

export const defaultPains = ["msgs", "empty"];

export const outcomes = [
  { h: "Your time back", t: "General guest replies in under 5 minutes during our hours, from enquiry to review.", l: "Guest communication", href: anchors.service("guest") },
  { h: "Happier guests, better reviews", t: "Clear check-in, quick answers, problems fixed fast, calm and honest review replies.", l: "Review management", href: anchors.service("reviews") },
  { h: "More bookings, fewer gaps", t: "Listings built for search and Airbnb’s AI search, plus longer stays in quiet months.", l: "Listing optimisation", href: anchors.service("listing") },
  { h: "Prices that earn more", t: "Human-led pricing on top of your tools, aimed at profit, not just a full calendar.", l: "Pricing optimisation", href: anchors.service("pricing") },
  { h: "Turnovers you don’t chase", t: "Cleaners scheduled and confirmed, timestamped photos, linen and repairs organised.", l: "Cleaning coordination", href: anchors.service("clean") },
  { h: "Numbers you understand", t: "A monthly profit report for each property: every booking, fee and bill.", l: "Finance check", href: anchors.service("finance") },
  { h: "Peace of mind on the rules", t: "Certificate dates tracked, guest records kept, UK rules explained in plain English.", l: "UK Rules Hub", href: routes.ukRules },
  { h: "Room to grow", t: "Direct bookings, SOPs and systems, so adding a property doesn’t mean adding stress.", l: "Grow and Build", href: anchors.servicesPackages },
];

export const steps = [
  { n: "1", when: "Day 1", h: "Free audit and call", t: "Send us your listing and tell us what’s taking your time. We show you what we’d fix first, with no obligation.", pts: ["Listing and pricing review", "Honest advice, even if we’re not a fit"] },
  { n: "2", when: "Week 1", h: "We learn your way", t: "We set up access through co-host permissions, then write down how you like things done.", pts: ["No passwords shared", "Your tone, rules, limits and contacts", "Written SOPs for your properties"] },
  { n: "3", when: "Every day", h: "We run it, you stay in control", t: "Our team handles the daily work. Major changes come to you for approval.", pts: ["Big price moves need your OK", "Clear monthly report"] },
];

export const packageIntro: Record<PackageKey, { title: string; who: string; unit: string }> = {
  run: { title: "Run", who: "For hosts who want the daily work off their phone: messages, cleaners, pricing and reviews.", unit: "per property / month" },
  grow: { title: "Grow", who: "For hosts ready to rely less on Airbnb and win more direct, repeat and longer-stay bookings.", unit: "" },
  build: { title: "Build", who: "For hosts and operators who want a business that runs without them in every detail.", unit: "" },
};

export const compare = {
  columns: ["One freelance VA", brand.name, "Management company"],
  rows: [
    ["Cover for sickness and holidays", "Often none", "Yes, the team covers", "Yes"],
    ["Written processes (SOPs)", "Depends on the person", "Yes, every task", "Usually"],
    ["You stay in control", "Yes", "Yes, you approve big decisions", "Often less control"],
    ["Your listing stays yours", "Yes", "Yes", "Sometimes on their account"],
    ["How you pay", "Hourly", "Simple monthly package", "Usually a commission"],
    ["Training and quality checks", "Up to you", "Done by us", "Done by them"],
  ],
  note: "Typical models, not named companies.",
};

export const whoTabs = [
  { id: "side", tab: "Side-hustle hosts", tag: "1 to 5 properties · full-time job", h: "Hosting that fits around your life", t: "We take the messages, cleaners and pricing off your phone, so you can focus on your job and family, and still grow your income.", cta: "See the Run package", href: anchors.servicesPackages, pts: ["Guest messages answered during the day, so you’re not replying in meetings", "Cleaners confirmed and turnovers photographed", "Prices checked weekly, with big changes sent to you first", "A monthly profit report you can actually read"] },
  { id: "sa", tab: "SA and rent-to-rent", tag: "Serviced accommodation operators", h: "Keep operations running while you find the next deal", t: "A serviced accommodation virtual assistant team that handles the daily work across your units, so you can spend your time on growth.", cta: "Talk about your units", href: brand.links.bookCall, pts: ["Guest communication across Airbnb, Booking.com and direct", "Turnovers, linen and maintenance coordinated across units", "Monthly P&L for each unit", "SOPs so standards stay the same as you scale"] },
  { id: "pm", tab: "Property managers", tag: "Managing homes for owners", h: "Take on more homes without more staff", t: "A property management virtual assistant team for guest messages, turnovers and owner reporting, working inside your existing systems.", cta: "See how we work with managers", href: anchors.persona("pm"), pts: ["Works in the channel manager you already use", "Owner reports prepared every month", "Trades found and quoted, owner or you approve", "Your brand and tone, written into our SOPs"] },
  { id: "london", tab: "London hosts", tag: "London Airbnb management support", h: "Built for London’s rules and guests", t: "We help London hosts keep within the 90-night limit for whole-home short lets, attract contractor and business stays, and stand out in a busy market.", cta: "London hosts: talk to us", href: brand.links.bookCall, pts: ["90-night tracking across every platform you list on", "Listings and pricing aimed at contractors and longer stays", "Guest vetting within platform rules and UK law", "Clear guidance from our UK Rules Hub"] },
  { id: "scale", tab: "Building systems", tag: "Scaling your business", h: "A business that doesn’t need you in every detail", t: "SOPs, finance reporting and direct booking websites that make your short-let business easier to run, sell or hand over.", cta: "See the Build package", href: anchors.servicesPackages, pts: ["The SOPs we train our own team with", "Finance reporting across your portfolio", "A direct booking website you own", "Train any new VA without starting again"] },
];

export const cases = [
  { tag: "[2-bed flat, Manchester]", big: "[4.6 → 4.9]", what: "[Guest communication + reviews]", q: "[Short quote from the client about the result]", who: "[First name · area · property type]" },
  { tag: "[SA operator, 8 units]", big: "[X hrs/week]", what: "[Run package]", q: "[Short quote from the client about time saved]", who: "[First name · area · property type]" },
  { tag: "[Cottage, Cornwall]", big: "[X% → Y%]", what: "[Listing + long-stay pricing]", q: "[Short quote about winter occupancy, same months]", who: "[First name · area · property type]" },
];

export const aiSearch = {
  badge: "New · Airbnb AI search",
  title: "Is your listing ready for",
  titleEm: "Airbnb’s AI search?",
  lead: "Airbnb now lets guests in the US search in their own words. A UK date hasn’t been announced. Listings with clear, specific facts will be easiest to match. Check yours in 3 minutes, free.",
  source: "Source: Airbnb 2026 Fall Update, 30 September 2026.",
  query: "“quiet flat near the station with a desk”",
  facts: [
    { t: "Quiet street, double glazing", s: "Clear", good: true },
    { t: "6-minute walk to the station", s: "Clear", good: true },
    { t: "Desk and fast wifi (speed listed)", s: "Clear", good: true },
    { t: "“Great location!”", s: "Vague", good: false },
  ],
  note: "Illustration. Airbnb hasn’t published how matching works.",
};

export const freebies: { t: string; s: string; tag: string; icon: IconName; href: string }[] = [
  { t: "UK short-let rules hub", s: "Every UK rule in one place, checked monthly, with sources", tag: "Guide", icon: "book", href: routes.ukRules },
  { t: "UK compliance checker", s: "Which rules apply to your property, in 2 minutes", tag: "Tool", icon: "check", href: anchors.complianceChecker },
  { t: "Short-let profit calculator", s: "Your real profit and break-even", tag: "Tool", icon: "calc", href: anchors.tool("short-let-profit-calculator") },
  { t: "AI-readiness listing scorer", s: "Is your listing ready for AI search?", tag: "Tool", icon: "spark", href: anchors.tool("ai-readiness-listing-scorer") },
  { t: "Free checklists", s: "Cleaning, safety, inventory and maintenance", tag: "Download", icon: "list", href: anchors.rulesChecklist },
  { t: "Monthly finance sheet", s: "A ready-made profit spreadsheet", tag: "Download", icon: "sheet", href: brand.downloads.financeSheet },
];

export const promises = [
  [`Work ${brand.hours.label}, and tell you exactly what’s covered`, "Promise 24/7 cover we don’t offer"],
  ["Ask before big price changes or spending", "Make major decisions without you"],
  ["Use co-host permissions and a password manager", "Ask you to share your Airbnb password"],
  ["Invite every guest to review the same way", "Write fake reviews or only ask happy guests"],
  ["Give honest advice, even when it means less work for us", "Guarantee rankings or bookings"],
  ["Do guest vetting within platform rules and UK law", "Run background checks on guests"],
];

export const priceCards = [
  { key: "run" as const, t: "Run", who: "The daily work, done properly.", unit: "per property / month", inc: ["Guest communication", "Listing and pricing", "Cleaning, laundry, maintenance", "Review management", "Monthly finance check"], popular: true, cta: "Start with a free audit", href: brand.links.freeAudit },
  { key: "grow" as const, t: "Grow", who: "More direct bookings and a stronger brand.", unit: "", inc: ["Direct booking website", "SEO for short lets", "Social media"], popular: false, cta: "Talk about growth", href: brand.links.bookCall },
  { key: "build" as const, t: "Build", who: "Systems that last.", unit: "", inc: ["SOPs and systems", "Co-hosting support (soon)"], popular: false, cta: "Talk about systems", href: brand.links.bookCall },
];

export const faq: FaqEntry[] = [
  { q: "What does an Airbnb virtual assistant do?", a: `An Airbnb VA handles the daily work of hosting remotely: guest messages, pricing, listing updates, coordinating cleaners and maintenance, reviews and reporting. ${brand.name} does this as a team, ${brand.hours.sentence}.` },
  { q: "How much does an Airbnb virtual assistant cost in the UK?", a: `Our packages start from ${showPrice(prices.run)} per month per property. You pay a simple monthly fee rather than a commission on your bookings. See the pricing page for what each package includes.` },
  { q: "Is an Airbnb VA worth it?", a: "If messages, cleaners and pricing are eating your evenings, or you want to add properties without hiring staff, a VA team usually pays for itself in time saved and fewer mistakes. Start with a free audit to see what we’d change." },
  { q: "What’s the difference between a VA, a co-host and a property manager?", a: "A property manager usually takes over the whole property for a commission. A co-host often shares hosting duties on the platform, sometimes including on-site work. A VA team like ours runs the remote work while you keep ownership and control." },
  { q: "Can a virtual assistant manage my Airbnb from another country?", a: `Yes. Our operations team is based in ${brand.team.location} and works UK hours, Monday to Saturday, 8am–8pm. On-site work is done by your local cleaners and trades, which we coordinate.` },
  { q: "Do I have to give you my Airbnb password?", a: "No. Airbnb lets you add co-hosts with different permission levels, so we only get the access we need. Other platforms and tools are shared through a password manager." },
  { q: "What happens outside your hours?", a: `We tell you exactly what’s covered. Our standard plan runs ${brand.hours.sentence}, and we set up clear guest instructions and an emergency plan for other times.` },
  { q: "Can you manage my cleaners and maintenance?", a: "Yes. We schedule and confirm turnovers, ask for timestamped photos, order linen, get quotes and book trades. You pay your cleaners and trades directly." },
  { q: "Do you work with my channel manager?", a: "Yes. We work in the channel manager you already use, and can help set one up if you don’t have one." },
  { q: "I want to hire my own VA. Can you help?", a: "Yes. We share the SOPs we use to train our own team, tailored to your business, so you can train any VA without starting from scratch." },
  { q: "Do you work with property managers and serviced accommodation operators?", a: "Yes. We support single-property hosts, SA and rent-to-rent operators, and property managers with several properties." },
];

export const finalCta = {
  title: "Get your evenings back. Let us run the daily work.",
  text: "Send us your listing for a free audit, or book a 20-minute call. No obligation, and honest advice either way.",
  footnote: `${brand.hours.label} · Team based in ${brand.team.location} · You approve every big change`,
};
