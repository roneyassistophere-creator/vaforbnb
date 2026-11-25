import { anchors, routes } from "@/config/navigation";
import { isToolLive } from "@/content/tools/catalog";
import { toolPath as profitPath, toolSlug as profitSlug } from "@/content/tools/profitId";
import type { FaqEntry } from "@/lib/seo";

/**
 * Page copy for /free-tools/uk-short-let-compliance-checker.
 * The checker's own text is in src/content/tools/complianceChecker.ts;
 * rules and figures are in the database.
 */

export const hero = {
  title: "Which short-let rules apply to my property?",
  shortAnswer:
    "Answer six quick questions about where your property is, how you let it and what you provide. You’ll get a checklist of the UK rules that apply, sorted into Must do now, Coming soon and Check your contract, each with its official source.",
  kitBadge: "New host kit · step 1",
};

export const nextStep = {
  eyebrow: "New host kit · step 2",
  title: "Next in your kit: Profit calculator",
  text: "Now you know the rules, check the numbers. Find out what your short let really earns after fees, cleaning and bills.",
  cta: "Go to the profit calculator",
  href: isToolLive(profitSlug) ? `${profitPath}?kit=new-host` : anchors.tool("short-let-profit-calculator"),
};

export const howItWorks = {
  title: "How it works",
  points: [
    "Each answer switches rules on or off from our UK Rules Hub. For example, choosing London and a whole home that isn’t your main home adds the 90-night limit.",
    "Dates decide some groups. A visitor levy moves from Coming soon to Must do now on the day it starts.",
    "Every rule shows its official source and links to the full explanation in the Rules Hub.",
    "The checker shows which rules apply so you can check each one. It never says you are compliant.",
  ],
};

export const limits = {
  title: "Limits",
  text: "Councils can add their own local conditions, such as planning policies or licence conditions. This checker covers the main national rules, not every local policy.",
  disclaimer: "General information, not legal advice. Check each rule with its official source.",
};

/**
 * FAQ. Also published as FAQPage structured data. These answers are page
 * copy: if a date changes, update it here as well as in the figures table.
 */
export const faq: FaqEntry[] = [
  {
    q: "Is Airbnb legal in the UK?",
    a: "Yes, but the rules depend on where you are. Scotland needs a licence. Northern Ireland needs Tourism NI certification. Wales needs registration by 31 March 2027. London limits whole-home short lets to 90 nights a year without planning permission.",
  },
  {
    q: "Do I need a licence for Airbnb in England?",
    a: "Not yet. A national register is expected to be fully operational by March 2027.",
  },
  {
    q: "What rules apply to every UK holiday let?",
    a: "A fire risk assessment, a yearly gas check if you have gas, furniture fire safety, a legionella assessment, keeping guest records and all-in pricing.",
  },
  {
    q: "Does this tell me I’m compliant?",
    a: "No. It shows which rules apply so you can check each one.",
  },
];

/**
 * Related tools (hub card ids from src/content/tools/catalog.ts). Names and
 * Free / Coming soon come from the catalogue. `whenLive` tools only appear
 * once they're set live.
 */
export const related = {
  title: "Related tools",
  ids: ["certificate-reminders", "london-90-night-counter"],
  whenLive: ["business-rates-qualifier"],
};

export const rulesHubCta = {
  text: "Want the full detail? Every rule is explained in plain English in our UK Rules Hub.",
  label: "Open the UK Rules Hub",
  href: routes.ukRules,
};
