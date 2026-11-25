import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/seo-for-short-lets. */

/** Domain shown in the faux search-result "breadcrumbs" above each heading. */
export const host = brand.siteUrl.replace(/^https?:\/\/(www\.)?/, "");

export const guests = [
  { t: "Contractors", q: "contractor accommodation [town] parking for vans", title: "Contractor Accommodation in [Town] | Parking, Monthly Rates", d: "Houses for 4–8 workers with van parking, washing machines and invoicing. Monthly rates available. Call or email for availability." },
  { t: "Business stays", q: "serviced apartment [city] for business", title: "Business Serviced Apartments in [City] | Desk, Fast Wi-Fi", d: "Quiet apartments near [business district] with a proper desk, fast Wi-Fi and company invoicing." },
  { t: "Relocations", q: "furnished short let [area] monthly pet friendly", title: "Monthly Furnished Short Lets in [Area] | Pets Welcome", d: "Family-friendly homes for relocations and insurance stays. Flexible dates, monthly pricing." },
  { t: "NHS staff", q: "short let near [hospital]", title: "Short Lets Near [Hospital] | Walking Distance", d: "Quiet apartments a short walk from [hospital], with parking and flexible stays for visiting professionals." },
];

export const otherResults = [
  { url: "airbnb.co.uk › [town]", t: "Monthly rentals in [Town] - Airbnb", d: "Find places to stay in [Town] for a month or longer…" },
  { url: "booking.com › [town]", t: "Apartments in [Town] - Booking.com", d: "Compare prices and book apartments in [Town]…" },
  { url: "directory-site.co.uk", t: "Accommodation directory: [Town]", d: "Listings from local providers…" },
];

export const verdicts = [
  { max: 3, k: "NOT YET", bg: "#F2F4F6", fg: "#14212B", h: "Save your money for now.", t: "With one to three properties, your money works harder on listing optimisation, pricing and a simple, well-built website. We’ll set up the SEO basics when we build your site, and tell you when it’s worth more." },
  { max: 10, k: "WORTH CONSIDERING", bg: "#FFF4D6", fg: "#6B4A00", h: "A focused plan could pay off.", t: "Especially in towns with business travel, construction projects, hospitals or universities. Start small, around your best guest types." },
  { max: Infinity, k: "USUALLY WORTH IT", bg: "#DDF1E5", fg: "#1F6B45", h: "SEO can become a real asset.", t: "More nights to fill, more locations to rank for, and longer-stay enquiries can be very valuable. This is where SEO earns its keep." },
];

export const traits = [
  { h: "They search Google directly", t: "With the location and what they need." },
  { h: "They know OTA prices include fees", t: "Many look for a direct, better-value option." },
  { h: "They prefer to call or email", t: "Invoices, van parking, beds, flexible dates." },
  { h: "Their stays are longer", t: "Weeks or months, often midweek, fewer turnovers." },
  { h: "They come back", t: "A happy company may book for the next project." },
];

export const searchMap = [
  { g: "Contractors and work crews", s: "contractor accommodation [town] parking for vans", p: "Contractor stays page: parking, beds, laundry, invoicing, monthly rates" },
  { g: "Companies and business travellers", s: "serviced apartment [city] for business", p: "Business stays page: desk, Wi-Fi, location, invoicing, booking process" },
  { g: "Relocations and insurance placements", s: "furnished short let [area] monthly, pet friendly", p: "Long stays page: monthly pricing, pets, family-friendly homes" },
  { g: "NHS and visiting professionals", s: "short let near [hospital]", p: "Location page: walking times, parking, quiet streets" },
  { g: "Event and leisure guests", s: "[event] accommodation [town]", p: "Event and local guide pages, updated each season" },
];

export const street = {
  without: {
    label: "(no sign)",
    postT: "Unnamed road",
    rows: [
      "Found mainly by people who already know your business name",
      "Pages may be missing from Google’s index or hard to understand",
      "One generic home page trying to rank for everything",
      "No idea what’s working",
      "Dependent on Airbnb and Booking.com for most demand",
    ],
  },
  with: {
    label: "Contractor stays · [Town]",
    postT: "Contractor stays → 200m",
    rows: [
      "Found by people searching for what you offer, where you offer it",
      "Pages indexed, fast, mobile-friendly and clearly structured",
      "Dedicated pages for each location and guest type",
      "Search Console and analytics show searches, clicks and enquiries",
      "A growing stream of direct enquiries alongside the platforms",
    ],
  },
};

export const areas = [
  { t: "Keyword research", h: "Real searches, not guesses.", pts: ["Searches for your locations, property types and guest types", "Longer-stay and business terms prioritised", "A keyword map: one clear page per search intent"] },
  { t: "Technical SEO", h: "A site Google can read easily.", pts: ["Indexing, sitemap and Search Console set-up", "Speed and mobile experience", "Structured data and fixing duplicate pages"] },
  { t: "Page structure", h: "One page for each guest and place.", pts: ["Location pages", "Contractor, business and long-stay pages", "Property pages with clear facts"] },
  { t: "Content", h: "Written from real hosting experience.", pts: ["Original local guides", "Honest FAQs guests actually ask", "Seasonal and event pages"] },
  { t: "Local SEO", h: "Consistent everywhere.", pts: ["Same business details across directories", "Google Business Profile only where eligible", "Local area signals on every location page"] },
  { t: "Reviews", h: "Fair, consistent review collection.", pts: ["Every guest invited the same way", "Replies that help future guests", "Linked with our review management service"] },
  { t: "Links and mentions", h: "Earned, never bought.", pts: ["Genuine local partnerships", "Local PR and community mentions", "We never buy links"] },
  { t: "Tracking and reporting", h: "You see what’s working.", pts: ["Rankings for key searches", "Clicks and direct enquiries", "Clear next steps every month"] },
];

export const bars = ["18%", "22%", "20%", "28%", "30%", "36%", "40%", "48%", "52%", "61%", "70%", "78%"];

export const gbp = [
  { t: "Each of my holiday homes", h: "Not eligible", bg: "#FDECEC", fg: "#B8383A", x: "Google’s guidelines say rental properties such as vacation homes aren’t eligible. We focus on your website, location pages and reviews instead." },
  { t: "My staffed office that meets customers", h: "Possibly eligible", bg: "#DDF1E5", fg: "#1F6B45", x: "Sales or leasing offices can be eligible if they make in-person contact with customers during stated hours. We check the details before setting anything up." },
  { t: "A virtual office or my home address", h: "Usually not eligible", bg: "#FFF4D6", fg: "#6B4A00", x: "Google requires in-person contact with customers during stated hours. A virtual office alone doesn’t meet that." },
];

export const versus = [
  { k: "Where you appear", seo: "Google’s search results and Maps", geo: "AI answers and summaries" },
  { k: "What helps", seo: "Useful pages, technical health, local signals, reviews", geo: "The same foundations: original first-hand content, clear facts, indexed pages, accurate business information" },
  { k: "What doesn’t help", seo: "Keyword stuffing, bought links", geo: "llms.txt for Google Search, “chunking” pages, rewriting for AI, fake mentions" },
];

export const myths = [
  { t: "Adding an llms.txt file helps you rank in Google’s AI answers.", k: "MYTH", x: "Google says Search doesn’t use llms.txt. Other services might." },
  { t: "You need to rewrite pages into short “chunks” for AI.", k: "MYTH", x: "Google says no special chunking or rewriting is needed for its AI features." },
  { t: "First-hand, original content helps in both search and AI answers.", k: "FACT", x: "Google rewards helpful, people-first content. Your real hosting knowledge is your edge." },
  { t: "Structured data is required to appear in AI answers.", k: "MYTH", x: "Not required for AI features, but still useful for rich results in Search." },
];

export const steps = [
  { n: "Week 1", h: "SEO check", t: "We review your site, portfolio and market, and tell you if SEO is worth it now." },
  { n: "Weeks 2–3", h: "Research", t: "Real search terms for your locations and guest types." },
  { n: "Month 1", h: "Fix foundations", t: "Technical issues, Search Console, speed and structure." },
  { n: "Months 2–3", h: "Build pages", t: "Location, guest-type and property pages, plus local guides." },
  { n: "Ongoing", h: "Local signals", t: "Business details, eligible profiles, reviews and partnerships." },
  { n: "Monthly", h: "Report and refine", t: "Clicks, enquiries and next steps." },
];

export const honest = [
  { b: "No #1 guarantees.", t: "Google says so itself, and warns against anyone who promises it." },
  { b: "SEO takes time.", t: "Expect several months before meaningful results." },
  { b: "SEO needs a good website.", t: "If yours is slow or unclear, we fix that first." },
  { b: "Enquiries still need converting.", t: "Fast, helpful replies win long-stay bookings." },
];

export const proof = [
  { c: "[SA operator, 12 units]", f: "[Contractor stays, [town]]", b: "[X clicks/month]", a: "[X clicks/month]" },
  { c: "[Property manager]", f: "[Business stays, [city]]", b: "[X enquiries/month]", a: "[X enquiries/month]" },
];

export const faq: FaqEntry[] = [
  { q: "Is SEO worth it for my holiday let website?", a: "If you have one to three properties, probably not yet: focus on your listings, pricing and a good website. With a larger portfolio, especially in areas with business and contractor demand, SEO can become a valuable source of direct enquiries." },
  { q: "How do contractors and companies find accommodation?", a: "Many search Google with the location and their needs, such as parking for vans or monthly rates, and contact hosts directly. Pages built for those searches help you appear." },
  { q: "Will my website get traffic without SEO?", a: "Mostly from people who already know your name. Without SEO, Google may not show your pages for the searches guests actually make." },
  { q: "What is GEO, and do I need it separately?", a: "GEO means optimising for AI search answers. Google says optimising for its generative AI features is still SEO, so we use one strategy: clear, first-hand content, technical health and accurate business details." },
  { q: "Can I put my holiday home on Google Maps?", a: "Not as its own Business Profile: Google’s guidelines say rental properties such as vacation homes aren’t eligible. A staffed office that meets customers may be eligible." },
  { q: "How long does SEO take?", a: "Usually several months before meaningful results, depending on your location and competition." },
  { q: "Can you guarantee a number one ranking?", a: "No, and nobody honest can. Google itself says no one can guarantee a number one ranking." },
  { q: "Do you buy links?", a: "Never. We build genuine local partnerships and mentions." },
];

export const related = [
  { label: "Direct booking websites", href: anchors.service("website") },
  { label: "Social media", href: anchors.service("social") },
  { label: "Review management", href: anchors.service("reviews") },
  { label: "Guest communication", href: anchors.service("guest") },
  { label: "Listing optimisation", href: anchors.service("listing") },
];

export const sources =
  "Google Search Central (AI optimisation guide; Do you need an SEO?) · Google Business Profile Help (local ranking; eligibility guidelines) · Google Hotel Center Help (vacation rentals).";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["fit", "Is it right for you?"],
  ["longer-stays", "Longer stays"],
  ["without-seo", "Without SEO"],
  ["included", "What’s included"],
  ["gbp", "Google Business Profile"],
  ["seo-vs-geo", "SEO vs GEO"],
  ["process", "How it works"],
  ["check", "Proof and pricing"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "Get found on Google, not just on Airbnb.",
  label: "Free SEO check",
  href: "#check",
};
