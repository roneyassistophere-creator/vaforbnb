import type { IconName } from "@/lib/icons";
import { slugify } from "@/lib/slug";
import { toolPath as businessRatesPath, toolSlug as businessRatesSlug } from "./businessRates";
import { toolPath as compliancePath, toolSlug as complianceSlug } from "./complianceChecker";
import { toolPath as certPath, toolSlug as certSlug } from "./certificateRemindersId";
import { toolPath as londonPath, toolSlug as londonSlug } from "./londonNightsId";
import { toolPath as levyPath, toolSlug as levySlug } from "./visitorLevyId";
import { toolPath as registerPath, toolSlug as registerSlug } from "./guestRegisterId";
import { toolPath as houseRulesPath, toolSlug as houseRulesSlug } from "./houseRulesId";
import { toolPath as aiReadinessPath, toolSlug as aiReadinessSlug } from "./aiReadinessId";
import { toolPath as titleCheckerPath, toolSlug as titleCheckerSlug } from "./titleCheckerId";
import { toolPath as photoShotListPath, toolSlug as photoShotListSlug } from "./photoShotListId";
import { toolPath as descriptionBuilderPath, toolSlug as descriptionBuilderSlug } from "./descriptionBuilderId";

/**
 * Every free tool. Used by the tools hub, tool pages and the links into tools
 * from other pages. A tool shows as live (and pages link to it) only when
 * `status` is "live".
 */

/** Tools with a phase above this are hidden from the hub, except the next phase. */
export const launchedPhase = 5;

export type JobKey = "legal" | "bookings" | "numbers" | "time";
export const jobs: Record<JobKey, { t: string; slug: string; sub: string; c: string; tint: string; icon: IconName }> = {
  legal: { t: "Stay legal", slug: "stay-legal", sub: "Rules, licences, safety and levies", c: "#14212B", tint: "#E8EEF3", icon: "shield" },
  bookings: { t: "Get more bookings", slug: "get-more-bookings", sub: "Listings, photos, AI search, long stays", c: "#B8383A", tint: "#FDECEC", icon: "trend" },
  numbers: { t: "Know my numbers", slug: "know-my-numbers", sub: "Profit, fees, performance", c: "#1F6B45", tint: "#E3F3EA", icon: "chart" },
  time: { t: "Save time", slug: "save-time", sub: "Messages, guides, checklists, restocking", c: "#5B3FA0", tint: "#F0ECF8", icon: "stopwatch" },
};
export const jobOrder: JobKey[] = ["legal", "bookings", "numbers", "time"];

/** Hub URL with a job pre-selected, e.g. /free-tools?job=stay-legal. */
export const jobHref = (job: JobKey) => `/free-tools?job=${jobs[job].slug}`;
export const jobFromSlug = (slug: string | null): JobKey | null =>
  (jobOrder.find((k) => jobs[k].slug === slug || k === slug) as JobKey | undefined) ?? null;

export type ToolStatus = "live" | "coming-soon";

export type Tool = {
  /** Card id on the hub (#id). */
  id: string;
  job: JobKey;
  name: string;
  q: string;
  mins: number;
  out: string;
  nations: string;
  phase: number;
  keywords: string;
  /** URL slug, set once the tool has its own page. */
  slug?: string;
  /** The tool's page, once built. */
  href?: string;
  /** Only "live" tools show as Free and are linked from other pages. */
  status?: ToolStatus;
  /** Shown in the hub's Featured tool section. */
  featured?: boolean;
  /** Small badge on the hub card, e.g. "New". */
  badge?: string;
  /** Starter kit the tool belongs to. */
  kit?: "new-host" | "more-bookings" | "growing";
  /** Hub card ids of related tools. */
  related?: string[];
  /** The next step after using the tool. */
  nextStep?: { label: string; href: string };
};

const T = (job: JobKey, name: string, q: string, mins: number, out: string, nations: string, phase: number, keywords: string): Tool => ({
  id: slugify(name),
  job,
  name,
  q,
  mins,
  out,
  nations,
  phase,
  keywords,
});

/** Order within a job is the order shown on the hub. */
export const tools: Tool[] = [
  {
    ...T("legal", "UK compliance checker", "Which rules apply to my property?", 2, "Checklist + PDF", "All UK", 1, "rules licence gas fire legal compliance"),
    slug: complianceSlug,
    href: compliancePath,
    status: "live",
    featured: true,
    kit: "new-host",
  },
  {
    ...T("bookings", "AI-readiness listing scorer", "Is my listing ready for Airbnb’s AI search?", 3, "Score + fixes", "All UK", 1, "ai search airbnb ai listing score description title seo ranking"),
    slug: aiReadinessSlug,
    href: aiReadinessPath,
    status: "live",
    badge: "New",
    kit: "more-bookings",
    related: ["airbnb-title-checker", "ai-ready-description-builder", "photo-shot-list-planner"],
    nextStep: { label: "Free AI-readiness audit", href: "/services/listing-optimisation#audit" },
  },
  { ...T("numbers", "Short-let profit calculator", "Am I actually making money?", 3, "Result + PDF", "All UK", 1, "profit tax break-even money"), related: ["visitor-levy-calculator"] },
  {
    ...T("legal", "Business rates qualifier", "Do I qualify for business rates?", 1, "Result", "England · Scotland · Wales", 2, "business rates council tax 140 70 252 182 holiday let second home premium"),
    slug: businessRatesSlug,
    href: businessRatesPath,
    status: "live",
    related: ["short-let-profit-calculator", "uk-compliance-checker"],
    nextStep: { label: "Finance check", href: "/services/finance-check" },
  },
  {
    ...T("legal", "London 90-night counter", "How many of my 90 nights have I used?", 2, "Result + CSV", "London", 2, "london 90 day nights rule counter calendar airbnb booking.com"),
    slug: londonSlug,
    href: londonPath,
    status: "live",
    related: ["uk-compliance-checker", "long-stay-discount-calculator"],
    nextStep: { label: "Pricing optimisation", href: "/services/pricing-optimisation" },
  },
  T("numbers", "Direct booking savings", "How much do platform fees cost me?", 1, "Result", "All UK", 2, "fees airbnb direct booking commission"),
  {
    ...T("legal", "Certificate reminders", "When are my safety checks due?", 2, "Calendar file", "All UK", 2, "gas safety eicr electrical fire risk assessment pat legionella certificate reminder calendar"),
    slug: certSlug,
    href: certPath,
    status: "live",
    kit: "new-host",
    related: ["uk-compliance-checker", "cleaning-checklist-generator"],
    nextStep: { label: "Laundry and maintenance", href: "/services/laundry-and-maintenance" },
  },
  T("numbers", "Booking performance", "What are my occupancy, ADR and RevPAR?", 1, "Result", "All UK", 2, "occupancy adr revpar"),
  T("time", "Hosting time calculator", "How many hours does my listing take?", 2, "Result", "All UK", 3, "hours time workload"),
  {
    ...T("bookings", "Airbnb title checker", "Is my title good enough?", 1, "Result + title ideas", "All UK", 3, "title listing title headline 50 characters airbnb name"),
    slug: titleCheckerSlug,
    href: titleCheckerPath,
    status: "live",
    kit: "more-bookings",
    related: ["ai-readiness-listing-scorer", "ai-ready-description-builder"],
    nextStep: { label: "Listing optimisation", href: "/services/listing-optimisation" },
  },
  T("numbers", "Short-let vs long-let", "Would long-letting pay me more?", 2, "Result", "All UK", 3, "long let rent compare"),
  { ...T("numbers", "Cleaning fee calculator", "What should my cleaning fee be?", 1, "Result", "All UK", 3, "cleaning fee turnover"), related: ["visitor-levy-calculator"] },
  {
    ...T("legal", "Visitor levy calculator", "How much visitor levy do I charge?", 1, "Result + CSV", "Scotland · Wales", 3, "tourist tax visitor levy edinburgh glasgow aberdeen stirling west dunbartonshire cardiff"),
    slug: levySlug,
    href: levyPath,
    status: "live",
    related: ["short-let-profit-calculator", "uk-compliance-checker"],
    nextStep: { label: "Pricing optimisation", href: "/services/pricing-optimisation" },
  },
  T("time", "Guest message generator", "What do I say to this guest?", 1, "Text to copy", "All UK", 4, "message template guest"),
  {
    ...T("bookings", "AI-ready description builder", "How do I write my description?", 3, "Text to copy", "All UK", 4, "description listing description write my listing the space guest access ai search"),
    slug: descriptionBuilderSlug,
    href: descriptionBuilderPath,
    status: "live",
    kit: "more-bookings",
    related: ["ai-readiness-listing-scorer", "airbnb-title-checker", "photo-shot-list-planner"],
    nextStep: { label: "Score this description", href: "/free-tools/airbnb-ai-readiness-score" },
  },
  {
    ...T("bookings", "Photo shot list planner", "Which photos, in what order?", 2, "Shot list + PDF", "All UK", 4, "photos photo order cover photo photo tour captions photography"),
    slug: photoShotListSlug,
    href: photoShotListPath,
    status: "live",
    kit: "more-bookings",
    related: ["ai-ready-description-builder", "ai-readiness-listing-scorer", "cleaning-checklist-generator"],
    nextStep: { label: "Listing optimisation", href: "/services/listing-optimisation" },
  },
  { ...T("bookings", "Long-stay discount calculator", "Should I discount a 28-night stay?", 2, "Result", "All UK", 3, "monthly weekly discount long stay"), kit: "more-bookings" },
  {
    ...T("legal", "Guest register builder", "What guest records must I keep?", 1, "Spreadsheet + printable", "All UK", 4, "guest register guest book passport id hotel records check-in form"),
    slug: registerSlug,
    href: registerPath,
    status: "live",
    related: ["uk-compliance-checker", "welcome-guide-builder", "house-rules-generator"],
    nextStep: { label: "Guest communication", href: "/services/guest-communication" },
  },
  {
    ...T("legal", "House rules generator", "What should my house rules say?", 2, "Text + PDF", "All UK", 4, "house rules airbnb rules quiet hours pets parties check-in check-out"),
    slug: houseRulesSlug,
    href: houseRulesPath,
    status: "live",
    kit: "new-host",
    related: ["welcome-guide-builder", "guest-register-builder"],
    nextStep: { label: "Listing optimisation", href: "/services/listing-optimisation" },
  },
  { ...T("time", "Welcome guide builder", "What goes in my welcome guide?", 5, "Printable PDF", "All UK", 4, "welcome book guide"), kit: "new-host", related: ["certificate-reminders", "guest-register-builder"] },
  { ...T("time", "Cleaning checklist generator", "What should my cleaner check?", 2, "Printable PDF", "All UK", 4, "cleaning checklist"), related: ["certificate-reminders", "photo-shot-list-planner"] },
  T("time", "Linen and supplies calculator", "How much linen and stock do I need?", 2, "Result + spreadsheet", "All UK", 4, "linen towels supplies restock"),
  T("bookings", "UK event calendar", "What events are coming near me?", 1, "Result", "All UK", 5, "events festivals calendar"),
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const toolById = (id: string) => tools.find((t) => t.id === id);
export const isLive = (t?: Tool) => t?.status === "live" && !!t.href;
export const isToolLive = (slug: string) => isLive(toolBySlug(slug));
/** Link to a tool: its page when live, otherwise its card on the hub. */
export const toolLink = (t: Tool) => (isLive(t) ? t.href! : `/free-tools#${t.id}`);
