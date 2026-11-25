import type { IconName } from "@/lib/icons";

export type PackageKey = "run" | "grow" | "build";
export type GoalKey = "time" | "bookings" | "guests" | "numbers" | "direct" | "systems";

export type Service = {
  id: string;
  /** URL segment under /services, or null if the service has no page yet. */
  slug: string | null;
  pack: PackageKey;
  name: string;
  /** One-liner used on the home page package explorer. */
  summary: string;
  /** Benefit line used on the services hub. */
  benefit: string;
  included: string[];
  goals: GoalKey[];
  keywords: string;
  icon: IconName;
  tag?: string;
  comingSoon?: boolean;
};

/** The full service catalogue, shared by Home, Services and Pricing. */
export const services: Service[] = [
  {
    id: "guest",
    slug: "guest-communication",
    pack: "run",
    name: "Guest communication",
    summary: "Every message answered, from enquiry to review",
    benefit: "Every guest message answered, from enquiry to review.",
    included: ["General replies in under 5 minutes, in our hours", "Airbnb, Booking.com, Vrbo, WhatsApp, email", "Check-in guides and issue handling"],
    goals: ["time", "guests"],
    keywords: "messages inbox replies guests chat",
    icon: "chat",
    tag: "Most popular",
  },
  {
    id: "listing",
    slug: "listing-optimisation",
    pack: "run",
    name: "Listing optimisation",
    summary: "A listing ready for search and AI search",
    benefit: "A listing ready for search and Airbnb’s AI search.",
    included: ["Title, description and photo order", "Clear facts guests search for", "Amenities and house rules checked"],
    goals: ["bookings"],
    keywords: "listing photos title description ai search airbnb",
    icon: "list",
    tag: "AI search ready",
  },
  {
    id: "pricing",
    slug: "pricing-optimisation",
    pack: "run",
    name: "Pricing optimisation",
    summary: "Prices set for profit, checked weekly",
    benefit: "Prices set for profit, not just a full calendar.",
    included: ["Weekly competitor checks", "Events and seasons planned early", "Big changes sent to you for approval"],
    goals: ["bookings", "numbers"],
    keywords: "pricing price rates pricelabs dynamic revenue",
    icon: "tag",
  },
  {
    id: "clean",
    slug: "cleaning-coordination",
    pack: "run",
    name: "Cleaning coordination",
    summary: "Turnovers booked, confirmed and photographed",
    benefit: "Turnovers booked, confirmed and photographed.",
    included: ["Cleaners scheduled and reminded", "Timestamped before and after photos", "Back-up plan for no-shows"],
    goals: ["time", "guests"],
    keywords: "cleaners cleaning turnover housekeeping",
    icon: "clean",
  },
  {
    id: "laundry",
    slug: "laundry-and-maintenance",
    pack: "run",
    name: "Laundry and maintenance",
    summary: "Linen, repairs and safety checks organised",
    benefit: "Linen, repairs and safety checks organised.",
    included: ["Linen orders matched to bookings", "Trades found and quoted, you choose", "Certificate dates tracked"],
    goals: ["time"],
    keywords: "laundry linen maintenance repairs handyman gas safety",
    icon: "tool",
  },
  {
    id: "reviews",
    slug: "review-management",
    pack: "run",
    name: "Review management",
    summary: "More reviews, and calm, honest replies",
    benefit: "More reviews, and calm, honest replies.",
    included: ["Personal review requests after each stay", "Replies to every review", "Every guest asked the same way"],
    goals: ["guests", "bookings"],
    keywords: "reviews ratings reply feedback",
    icon: "star",
  },
  {
    id: "finance",
    slug: "finance-check",
    pack: "run",
    name: "Finance check",
    summary: "Your real profit, every month",
    benefit: "Your real profit, property by property.",
    included: ["Monthly profit report", "Every booking, fee and bill", "Free finance sheet to start"],
    goals: ["numbers"],
    keywords: "finance profit accounts money report bookkeeping",
    icon: "pound",
  },
  {
    id: "website",
    slug: "direct-booking-websites",
    pack: "grow",
    name: "Direct booking websites",
    summary: "Your own site, synced with your channel manager",
    benefit: "Your own booking site, synced with your channel manager.",
    included: ["Built and connected to your channel manager", "Payments set up", "Yours to keep"],
    goals: ["direct"],
    keywords: "website direct booking site channel manager hostaway lodgify",
    icon: "web",
  },
  {
    id: "seo",
    slug: "seo-for-short-lets",
    pack: "grow",
    name: "SEO for short lets",
    summary: "Found on Google by longer-stay guests",
    benefit: "Found on Google by longer-stay guests.",
    included: ["Area and stay-type pages", "Contractor and relocation keywords", "Monthly progress report"],
    goals: ["direct", "bookings"],
    keywords: "seo google search ranking",
    icon: "search",
  },
  {
    id: "social",
    slug: "social-media",
    pack: "grow",
    name: "Social media",
    summary: "A brand guests remember and book again",
    benefit: "A brand guests remember and book again.",
    included: ["Posts from your real daily work", "Instagram, Facebook, TikTok", "Direct booking enquiries, not just likes"],
    goals: ["direct"],
    keywords: "social media instagram facebook tiktok content",
    icon: "share",
  },
  {
    id: "sops",
    slug: "systemise-your-business",
    pack: "build",
    name: "Systemise your business",
    summary: "The SOPs we train our own team with, tailored to you",
    benefit: "The SOPs we train our own team with, tailored to you.",
    included: ["Ready SOP library or custom SOPs", "Train any new VA fast", "Updated as your business changes"],
    goals: ["systems", "time"],
    keywords: "sop sops systems process training va",
    icon: "book",
  },
  {
    id: "cohost",
    /** No page yet. */
    slug: null,
    pack: "build",
    name: "Co-hosting support",
    summary: "Coming soon",
    benefit: "Details coming soon.",
    included: ["Page in progress", "Ask us on a call", "Shared hosting with clear roles"],
    goals: ["systems"],
    keywords: "co-host cohost cohosting",
    icon: "key",
    tag: "Coming soon",
    comingSoon: true,
  },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const serviceByName = (name: string) => services.find((s) => s.name === name);

export type PackageInfo = {
  key: PackageKey;
  n: string;
  title: string;
  /** Short tagline */
  line: string;
  unit: string;
  /** Badge colours on the services hub */
  bg: string;
  fg: string;
};

export const packages: PackageInfo[] = [
  { key: "run", n: "1", title: "Run", line: "The daily work, done properly", unit: "per property / month", bg: "#14212B", fg: "#FFFFFF" },
  { key: "grow", n: "2", title: "Grow", line: "More direct bookings and a stronger brand", unit: "", bg: "#F0595A", fg: "#14212B" },
  { key: "build", n: "3", title: "Build", line: "Systems that last", unit: "", bg: "#F7F3EC", fg: "#14212B" },
];

/** URL of a service's page, falling back to its card on the services hub. */
export const serviceHref = (id: string) => {
  const s = serviceById(id);
  return s?.slug ? `/services/${s.slug}` : `/services#${id}`;
};

/** Services that have their own page, grouped for the header dropdown. */
export const servicesByPack = (pack: PackageKey) => services.filter((s) => s.pack === pack);
