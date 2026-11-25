import { routes } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/description-builder";

/**
 * Page copy for /free-tools/airbnb-description-builder. Sentence templates
 * and Make it fit steps are stored content (src/data/descriptionBuilder.ts);
 * limits are the scorer's stored limits. Text that quotes them is built below.
 */

export const listingOptimisationHref = `${routes.services}/listing-optimisation#description`;

export const hero = {
  shortAnswer:
    "Enter your property’s facts: your standout feature, who it’s ideal for, Wi-Fi speed, beds and the places nearby with minutes. The builder writes all four Airbnb description sections, keeps them within the limits, and checks them for vague words. It only uses the facts you enter.",
  badges: ["Get more bookings", "All UK"],
  kitBadge: "Get more bookings kit · step 3",
  privacy: "Everything stays on your device.",
};

export const whatThisMeansFallback =
  "Once you enter your standout feature and a place nearby, this tells you whether your description fits and what to add next. Specific facts are easier for guests, and search, to match.";

export const nextStep = {
  eyebrow: "Next step",
  title: "Score this description",
  text: "The AI-readiness scorer opens with your four sections and details filled in, and shows your top three fixes.",
  cta: "Score this description",
  secondary: { label: "Or let our team write your listing", href: listingOptimisationHref },
};

export const kitNext = {
  eyebrow: "Get more bookings kit · step 4",
  title: "Next in your kit: Photo shot list planner",
  text: "It picks up your rooms, outdoor space, workspace and standout feature, so your photos match your description.",
  cta: "Continue to the photo shot list planner",
};

/** How it works, built from the stored templates and limits. */
export function howItWorksSections(c: Content): { id: string; title: string; text: string; list?: string[] }[] {
  const T = c.templates;
  return [
    {
      id: "facts",
      title: "Facts beat adjectives",
      text: "Guests, and Airbnb’s AI search, can match “12-minute walk to Piccadilly station” or “300 Mbps Wi-Fi”. They can’t match “great location” or “fast internet”. So the builder writes minutes to named places, Wi-Fi speed, bed sizes, parking and workspace, and leaves the adjectives out.",
    },
    {
      id: "order",
      title: "The order sentences are built in",
      text: `The ${c.names.listing.toLowerCase()} is built in a fixed order: your opening hook, who it’s ideal for with their two most useful facts, size and beds, two more places, then a short honest note. ${c.names.space}, ${c.names.access} and ${c.names.notes} hold the rest of the detail.`,
      list: [`${c.names.listing}: up to ${c.limits.listing} characters`, `${c.names.space}: up to ${c.limits.space} characters`, `${c.names.access}: up to ${c.limits.access} characters`, `${c.names.notes}: up to ${c.limits.notes} characters`],
    },
    {
      id: "promise",
      title: "It never invents facts",
      text: "Every sentence comes from a stored template, filled with what you entered. If you don’t enter it, it isn’t written, and every number is checked against your answers. The templates contain no vague words, and your own words are checked as you type. Honest notes you tick always appear in Other things to note.",
    },
    {
      id: "fit",
      title: "How “Make it fit” works",
      text: `If your ${c.names.listing.toLowerCase()} is too long, “Make it fit” moves things, one step at a time, until it fits. Nothing is deleted, and you can undo each step.`,
      list: T.fitSteps.map((s, i) => `${i + 1}. ${s.id === "short" ? "Use short forms, like “12-min walk”" : `Move ${s.label} to ${c.names[s.to]}`}`),
    },
  ];
}

export const howItWorks = {
  intro: "The builder assembles your description from stored sentence templates and your answers, so the same facts always give the same text. It scores the result with the same model as the AI-readiness scorer.",
};

export const limits = {
  title: "Limits",
  points: [
    "It writes only what you enter. It can’t see your photos, reviews, calendar or the rest of your listing.",
    "The readiness score uses five of the AI-readiness scorer’s checks. For the full score, including your title and amenities, use ‘Score this’.",
    "Character limits and section names are set by Airbnb and can change.",
    "Template sentences are clear but plain. Edit any section to add your voice, then lock it.",
  ],
  disclaimer:
    "Check every fact is true before you publish. Overselling hurts your accuracy rating. Airbnb hasn’t published how its AI search works, so this tool helps clarity, not ranking.",
};

export const related = { title: "Related tools", ids: ["ai-readiness-listing-scorer", "airbnb-title-checker", "photo-shot-list-planner"] };

export const changelogNotes: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: 6-step fact form, all four sections, Make it fit, readiness score, guest-needs panel and hand-offs." },
];

/** FAQ. The character limit comes from stored data. */
export function faqFor(c: Pick<Content, "limits" | "names">): FaqEntry[] {
  return [
    {
      q: "How long can an Airbnb description be?",
      a: `The main listing description has a character limit (we count it for you: ${c.limits.listing} characters), and ${c.names.space}, ${c.names.access} and ${c.names.notes} give you more room for details.`,
    },
    { q: "What makes a description AI-ready?", a: "Specific facts: minutes to named places, Wi-Fi speed, bed sizes, parking and clear amenities, written in plain sentences." },
    { q: "Does this tool make things up?", a: "No. It only uses the facts you enter, put into clear sentences. If you don’t enter it, it isn’t written." },
    { q: "Should I mention downsides?", a: "Yes, briefly. Honesty prevents bad surprises and protects your rating. The builder always includes the honest notes you tick." },
    { q: "Can I edit the result?", a: "Yes. Edit any section directly, then lock it so it isn’t overwritten when you change the form." },
  ];
}
