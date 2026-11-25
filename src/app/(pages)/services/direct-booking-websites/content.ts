import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/direct-booking-websites. */

export type ThemeKey = "coastal" | "city" | "country";
export const themes: Record<ThemeKey, { label: string; bg: string; fg: string; acc: string; accFg: string; imgs: string[]; names: string[] }> = {
  coastal: { label: "Coastal", bg: "#EAF4F4", fg: "#0F2E33", acc: "#1F6F75", accFg: "#FFFFFF", imgs: ["#BFDCDD", "#A9CFD1", "#D6E8E2"], names: ["Harbour Stays", "Harbour View Apt", "Dune Cottage", "Lighthouse Loft"] },
  city: { label: "City", bg: "#14212B", fg: "#FFFFFF", acc: "#F0595A", accFg: "#14212B", imgs: ["#46525C", "#5F6B75", "#3A4A56"], names: ["Canal & Co", "Canal Loft", "Market St Studio", "Mill Apartment"] },
  country: { label: "Country", bg: "#F3EFE4", fg: "#2B3420", acc: "#4E6B2E", accFg: "#FFFFFF", imgs: ["#D8D2BC", "#C9D4B5", "#E6DCC6"], names: ["Meadow Lets", "Oak Barn", "Orchard Cottage", "Brook House"] },
};

export const why = [
  { k: "no-commission", h: "Bookings without the commission", t: "Guests who book direct don’t pay through an OTA, so you keep more of each booking." },
  { k: "your-guests", h: "Your guests, your relationship", t: "With consent, welcome back repeat guests and share offers by email." },
  { k: "trust", h: "Trust and credibility", t: "Show guests, landlords and partners you’re a real business, not just a listing." },
  { k: "independence", h: "Less dependence on one platform", t: "Fee, rule or ranking changes don’t take your business with them." },
  { k: "portfolio", h: "A home for your portfolio", t: "Landlords look for your website before they call." },
];

export type SourceKey = "airbnb" | "booking" | "direct";
export const sources: Record<SourceKey, { t: string; c: string; fg: string; i: string }> = {
  airbnb: { t: "Airbnb", c: "#F0595A", fg: "#14212B", i: "A" },
  booking: { t: "Booking.com", c: "#14212B", fg: "#FFFFFF", i: "B" },
  direct: { t: "Your website", c: "#1F6B45", fg: "#FFFFFF", i: "W" },
};

export const miniCal = ["#E2E6EA", "#E2E6EA", "#F0595A", "#F0595A", "#E2E6EA", "#E2E6EA", "#E2E6EA", "#E2E6EA", "#14212B", "#14212B", "#E2E6EA", "#E2E6EA", "#E2E6EA", "#E2E6EA"];
export const dbPages = ["Property pages", "Live calendar", "Booking and checkout", "Local area guide", "Discount codes", "FAQs"];
export const pmPages = ["Portfolio", "For landlords", "Services and fees", "Case studies", "About and team", "Owner enquiry form"];

export const landlord = [
  { h: "What you do:", t: "services clearly listed, with who handles what." },
  { h: "How you charge:", t: "your model and fees, or “from” prices." },
  { h: "Your results:", t: "real, permission-based case studies." },
  { h: "How you look after their home:", t: "cleaning, maintenance, guest vetting, reporting." },
  { h: "Compliance:", t: "licensing, safety checks and local rules." },
  { h: "One clear next step:", t: "owner enquiry form or call booking." },
];

export const blueprint = [
  { t: "HERO · what we do + “List your property”", h: 64 },
  { t: "SERVICES & FEES", h: 54 },
  { t: "CASE STUDIES · real results", h: 72 },
  { t: "HOW WE CARE FOR YOUR HOME", h: 54 },
  { t: "COMPLIANCE", h: 44 },
  { t: "OWNER ENQUIRY FORM", h: 64 },
];

export const channelManagers = [
  { n: "Hostaway", tag: "BUILDER + API", opt: "Direct booking website builder, plus a public API.", how: "Hostaway’s builder, or a custom WordPress site using the API (for example via a connector plugin)." },
  { n: "Uplisting", tag: "BUILT-IN SITE", opt: "Direct booking website with Stripe payments, deposits or balance payments, security deposits and discount codes.", how: "Uplisting’s website builder, or linked from your own branded site." },
  { n: "Lodgify", tag: "BUILDER", opt: "Built-in website builder with a booking engine.", how: "Lodgify’s builder, styled to your brand." },
  { n: "Tokeet", tag: "API", opt: "API and website tools.", how: "Connected via API to your site." },
  { n: "Others", tag: "IF API", opt: "Guesty, Smoobu, Hospitable, OwnerRez and more: varies by plan.", how: "If your plan includes a booking engine or API, we can usually connect it." },
];

export const builderVsCustom = {
  builder: [
    { k: "SPEED TO LAUNCH", v: "Fastest", w: "95%" },
    { k: "DESIGN FREEDOM", v: "Templates", w: "40%" },
    { k: "SEO AND CONTENT", v: "Basic", w: "35%" },
    { k: "BEST FOR", v: "A few properties, quick start", w: "60%" },
  ],
  custom: [
    { k: "SPEED TO LAUNCH", v: "Longer", w: "45%" },
    { k: "DESIGN FREEDOM", v: "Fully branded", w: "100%" },
    { k: "SEO AND CONTENT", v: "Full control", w: "100%" },
    { k: "BEST FOR", v: "Growing brands, property managers", w: "90%" },
  ],
};

export const payPoints = [
  "Secure card payments via Stripe or your provider",
  "Deposit at booking, balance before arrival",
  "Security deposits or damage holds where supported",
  "Discount codes for returning guests",
  "Booking terms accepted at checkout",
];

export const sitemap = [
  { h: "Property pages", t: "Photos, amenities, rules, live calendar, “Book now”.", bg: "#FDECEC" },
  { h: "Local area guides", t: "Attractions, transport, events: for guests and search.", bg: "#FFFFFF" },
  { h: "Reviews", t: "Real reviews with permission, or Google/Trustpilot.", bg: "#FFFFFF" },
  { h: "For landlords", t: "Your sales page, if you manage properties.", bg: "#F7F3EC" },
  { h: "Guest info", t: "Pre-arrival details and your digital guidebook.", bg: "#FFFFFF" },
  { h: "Legal pages", t: "Privacy, cookies and booking terms.", bg: "#FFFFFF" },
  { h: "SEO basics", t: "Titles, structured data, sitemap, speed, Search Console.", bg: "#EEF1F4" },
  { h: "Analytics", t: "Visits, enquiries and bookings tracked.", bg: "#EEF1F4" },
];

export const ukEssentials = [
  { h: "Privacy and cookies", t: "Privacy policy and cookie consent, in line with UK GDPR and PECR guidance." },
  { h: "ICO data protection fee", t: "Most UK businesses pay a yearly fee (£40 for micro organisations; some exemptions). We remind you to check." },
  { h: "Booking terms", t: "Cancellation, payment terms and house rules, clear before guests pay." },
  { h: "Accessibility", t: "Readable text, good contrast and image descriptions." },
];

export const rightWay = [
  { h: "Google:", t: "local SEO and area guides, plus a Business Profile if you have a staffed office (not for individual holiday homes)." },
  { h: "Social media:", t: "properties and local content on Instagram, Facebook, TikTok." },
  { h: "Repeat guests:", t: "direct guests can opt in to hear from you again." },
  { h: "Partnerships:", t: "local businesses, event organisers, companies sending staff." },
  { h: "Corporate and long stays:", t: "a simple enquiry form for contractors and relocations." },
];

export const buildSteps = [
  { s: "Discovery", h: "Discovery call", t: "Your business, properties, channel manager, brand and goals." },
  { s: "Plan", h: "Plan", t: "Site map, pages, platform (builder or custom) and timeline, agreed in writing." },
  { s: "Content", h: "Content", t: "We write or polish the copy, organise photos and create local area guides." },
  { s: "Design", h: "Design and build", t: "Mobile-first, on brand, fast to load." },
  { s: "Connect", h: "Connect", t: "Channel manager sync, booking engine, payments and analytics." },
  { s: "Test", h: "Test", t: "Real test bookings, calendar checks, payment checks and phone testing." },
  { s: "Launch", h: "Launch and train", t: "We go live, connect your domain and show you how to update it." },
  { s: "Aftercare", h: "Aftercare", t: "[X] weeks of support, then an optional care plan for updates and backups." },
];

export const own = [
  "Your domain, registered in your name",
  "Your content and photos",
  "Your guest data, in your accounts",
  "No lock-in: if you leave, the site goes with you",
];

export const honest = [
  { b: "A website doesn’t bring bookings on its own.", t: "It needs promoting: Google, social media, repeat guests, partnerships." },
  { b: "Direct bookings take time.", t: "Most hosts keep Airbnb and Booking.com alongside their site." },
  { b: "Direct bookings aren’t free.", t: "You still pay payment processing, hosting and possibly a booking engine fee." },
  { b: "Features depend on your channel manager.", t: "We tell you upfront what your plan can and can’t do." },
];

export const gallery = [
  { t: "[Client brand]", cm: "[Hostaway]", bg: "#EAF4F4" },
  { t: "[Client brand]", cm: "[Uplisting]", bg: "#F3EFE4" },
  { t: "[Client brand]", cm: "[Lodgify]", bg: "#EEF1F4" },
];

export const plans = [
  { k: "BUILDER SET-UP", price: showPrice(prices.websiteOneOff), t: "Your channel manager’s website builder, set up, branded and connected.", dark: false },
  { k: "CUSTOM SITE", price: showPrice(prices.grow), t: "A fully branded site connected by API, with landlord pages and SEO content.", dark: true },
  { k: "CARE PLAN", price: `${showPrice(prices.websiteCare)}/mo`, t: "Updates, backups, small changes and checks after launch.", dark: false },
];

export const faq: FaqEntry[] = [
  { q: "Do I need a direct booking website for my Airbnb?", a: "Not to start hosting, but it’s one of the best ways to reduce commission costs, build repeat guests and show you’re a real business. For property managers, it’s essential for winning landlords." },
  { q: "Will a website get me bookings on its own?", a: "No. It needs promoting through Google, social media, repeat guests and partnerships. Most hosts use it alongside Airbnb and Booking.com." },
  { q: "Can my website sync with Airbnb and Booking.com calendars?", a: "Yes, through your channel manager. When it offers a booking engine or API, a booking on any channel updates availability everywhere." },
  { q: "Which channel managers can you connect?", a: "Hostaway, Uplisting, Lodgify and Tokeet, and others such as Guesty, Smoobu, Hospitable and OwnerRez where your plan includes a booking engine or API." },
  { q: "How do guests pay?", a: "Usually by card through Stripe or your channel manager’s payment provider, with deposits, balances and security deposits where supported." },
  { q: "Can I tell my Airbnb guests to book direct next time?", a: "Not through Airbnb’s messaging: its off-platform policy doesn’t allow it. Build direct bookings through Google, social media and your own repeat guests instead." },
  { q: "What should a property management website include for landlords?", a: "A portfolio, a clear landlord page with services and fees, real case studies, how you look after properties, compliance, and an easy owner enquiry form." },
  { q: "Do I own the website?", a: "[Yes. Your domain, content and data are yours.]" },
];

export const sourcesNote =
  "Uplisting · Hostaway · WordPress.org HostAway Connector · Boostly Tokeet API docs · Google Hotel Center help · Airbnb off-platform policy (2799) · Airbnb service fees · ICO data protection fee.";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["why", "Why a website"],
  ["sync", "Calendar sync"],
  ["included", "Two kinds of site"],
  ["landlord", "Landlord page"],
  ["channel-managers", "Channel managers"],
  ["payments", "Payments"],
  ["sitemap", "What every site needs"],
  ["uk-essentials", "UK must-haves"],
  ["build", "Build timeline"],
  ["own-it", "No lock-in"],
  ["proof", "Sites we’ve built"],
  ["call", "Grow package"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "A booking site you own, synced with your calendars.",
  label: "Book a website call",
  href: "#call",
};
