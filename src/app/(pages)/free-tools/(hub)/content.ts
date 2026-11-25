import { brand } from "@/config/brand";
import type { IconName } from "@/lib/icons";
import type { FaqEntry } from "@/lib/seo";
import { toolPath as compliancePath, toolSlug as complianceSlug } from "@/content/tools/complianceChecker";
import { toolPath as aiReadinessPath, toolSlug as aiReadinessSlug } from "@/content/tools/aiReadinessId";
import { isLive as liveTool, toolBySlug } from "@/content/tools/catalog";
import { toolPath as profitPath, toolSlug as profitSlug } from "@/content/tools/profitId";

/** All copy and data for /free-tools. */

/** The tools themselves (jobs, list, status) live in the shared catalogue. */
export { jobFromSlug, jobHref, jobOrder, jobs, launchedPhase, isLive, tools, type JobKey, type Tool } from "@/content/tools/catalog";

export const hero = {
  title: "Free tools for UK short-let hosts",
  lead: `${brand.stats.freeToolsCount} free tools, built by a team that runs short lets every day. Check your rules, get your listing ready for AI search, know your real profit, and build the documents you need. No login, and nothing you type is stored.`,
  searchPlaceholder: "Search tools: levy, towels, profit, London…",
  promises: ["No login", "Nothing you type is stored", "Official UK sources", "Checked monthly"],
};

export const kits = [
  { tag: "New host kit", tint: "#E8EEF3", fg: "#14212B", t: "Set up the right way", d: "Your first short let, or a check you’ve covered the basics.", steps: ["Compliance checker", "Profit calculator", "House rules generator", "Welcome guide builder", "Certificate reminders"], href: compliancePath, toolSlug: complianceSlug },
  { tag: "Get more bookings kit", tint: "#FDECEC", fg: "#8E2729", t: "Fill the gaps", d: "When your calendar has too many empty nights.", steps: ["AI-readiness scorer", "Title checker", "Description builder", "Photo shot list planner", "Long-stay discount calculator"], href: liveTool(toolBySlug(aiReadinessSlug)) ? `${aiReadinessPath}?kit=more-bookings` : "#ai-readiness-listing-scorer", toolSlug: aiReadinessSlug },
  { tag: "Growing host kit", tint: "#F0ECF8", fg: "#5B3FA0", t: "Run it like a business", d: "Several properties and you need systems.", steps: ["Profit calculator", "Hosting time calculator", "Booking performance", "Direct booking savings", "Linen and supplies calculator"], href: liveTool(toolBySlug(profitSlug)) ? `${profitPath}?kit=growing` : "#short-let-profit-calculator", toolSlug: profitSlug },
];

export const trust: { h: string; t: string; icon: IconName }[] = [
  { h: "Official sources", t: "Every UK rule, rate and threshold comes from GOV.UK, HMRC, councils or the law, and each tool shows its sources.", icon: "bookLines" },
  { h: "Checked every month", t: "We re-check every figure monthly and after any announcement. Each tool shows the date it was last checked.", icon: "calendar" },
  { h: "Nothing you type is stored", t: "Calculations happen in your browser. We only see your email if you choose to download a report.", icon: "lock" },
  { h: "Built by people who do the work", t: `Our team runs UK short lets every day, ${brand.hours.sentenceShort}. These are the tools we wished we had.`, icon: "team" },
];

export const faq: FaqEntry[] = [
  { q: "Are the tools really free?", a: "Yes. Every tool is free with no login. We only ask for your email if you want a downloadable report, and that’s your choice." },
  { q: "Do you save what I type?", a: "No. Calculations run in your browser and aren’t sent to us. Your browser may remember your last inputs so you don’t retype them; you can clear them at any time." },
  { q: "How accurate are the tools?", a: "Every UK figure comes from an official source, is checked monthly, and shows its last-checked date. Estimates, such as tax, are clearly labelled." },
  { q: "Are these legal or tax advice?", a: "No. They’re general information to help you plan. Check important decisions with your council, an accountant or a solicitor." },
  { q: "Do they work for Scotland, Wales and Northern Ireland?", a: "Yes. Where rules differ, tools ask where your property is and use the right rules for that nation." },
  { q: "Can I share results with my accountant?", a: "Yes. Most tools let you copy the result or download a PDF, calendar file or spreadsheet." },
];

/** Featured alongside the compliance checker (shown once the tool is live). */
export const featuredAi = {
  slug: aiReadinessSlug,
  href: aiReadinessPath,
  tag: "New · Get more bookings",
  title: "Is your listing ready for Airbnb’s AI search?",
  text: "Paste your listing and get a readiness score out of 100, your top three fixes with example sentences, and a guest search simulator.",
  cta: "Check my AI readiness",
};
