import { routes } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/title-checker";

/**
 * Page copy for /free-tools/airbnb-title-checker. The limit, word lists and
 * check messages are stored content (src/data/titleChecker.ts); text that
 * quotes them is built from the stored values below, so it never goes stale.
 */

export const listingOptimisationHref = `${routes.services}/listing-optimisation`;

export const hero = {
  shortAnswer:
    "Paste your title. The checker counts characters against Airbnb’s 50-character guidance and flags capitals, repeated punctuation, emoji, details search already shows, and vague openings. Then it builds better titles for you that fit.",
  badges: ["Get more bookings", "All UK"],
  kitBadge: "Get more bookings kit · step 2",
  privacy: "Your title is checked on your device.",
};

/** Short answer with the stored limit (the brief's wording, with the number from stored data). */
export const shortAnswer = (limit: number) => hero.shortAnswer.replace("50-character", `${limit}-character`);

export const whatThisMeansFallback =
  "Once you type your title, this explains your verdict and what to change first. Every check follows Airbnb’s published title guidance.";

export const nextStep = {
  eyebrow: "Next step",
  title: "Check your whole listing: AI-readiness scorer",
  text: "Your title is one part. The AI-readiness scorer checks your description, amenities and the facts guests search for, and gives you your top three fixes.",
  cta: "Check your whole listing",
  secondary: { label: "Or let our team optimise your listing", href: listingOptimisationHref },
};

const list = (xs: string[], n = xs.length) => xs.slice(0, n).map((x) => `‘${x}’`).join(", ") + (xs.length > n ? " and more" : "");

/** "What it looks for", per check, filled from the stored rules. */
export function howItWorksRows(c: Content): { id: string; name: string; kind: "fix" | "tip"; looksFor: string; source: { title: string; url: string | null } }[] {
  const r = c.rules;
  const airbnb = { title: "Airbnb title guidance", url: c.source.url };
  const ours = { title: "VA for BnB clarity guidance", url: null };
  const looksFor: Record<string, string> = {
    length: `1 to ${c.limit} characters, counted as people see them (an emoji counts as one). Longer titles get cut off in search.`,
    caps: `Words of ${r.caps.minLetters} or more letters in capitals. Short abbreviations like ‘TV’ or ‘EV’ are fine.`,
    punctuation: `The same mark twice in a row (${r.punctuation.noRepeat.map((m) => m + m).join(" ")}), or more than one ‘!’.`,
    symbols: `Emoji and decorative symbols such as ★ ♥ ✓ ✨. Separators like ${r.symbols.allowed.slice(0, 6).join(" ")} are fine.`,
    city: "Your town or city as a whole word, when you’ve added it. It’s fine as part of a station or landmark, like ‘Leeds station’.",
    bedrooms: "A bedroom count, such as ‘2 bed’, ‘2BR’ or ‘two-bedroom’ (or ‘studio’ with 0 bedrooms). A Tip if you haven’t added your bedrooms.",
    contact: `Phone numbers (${r.contact.phoneMinDigits}+ digits), email addresses, web addresses and @handles.`,
    vague: `An opening word like ${list(r.vagueStart, 5)}.`,
    feature: `One standout feature, such as ${list(r.features, 6)}.`,
    location: "Your station or landmark, or a phrase like ‘5 min to the tram’, ‘8-minute walk’, ‘near …’ or ‘by the …’.",
    claims: `Claims guests can’t check: ${list(r.claims.map((x) => x.word))}. ‘Luxury’ is fine with a hot tub, pool or sauna.`,
    repeats: `The same word of ${r.repeats.minLetters}+ letters twice (small words like ‘with’ are ignored).`,
  };
  const sources: Record<string, { title: string; url: string | null }> = {
    length: airbnb,
    caps: airbnb,
    punctuation: airbnb,
    symbols: airbnb,
    city: airbnb,
    bedrooms: airbnb,
    contact: { title: c.contactSource.title, url: c.contactSource.url },
  };
  return r.checks.map((k) => ({ id: k.id, name: k.name, kind: k.kind, looksFor: looksFor[k.id] ?? "", source: sources[k.id] ?? ours }));
}

export const howItWorks = {
  intro:
    "Your title goes through 12 checks as you type. Fix checks follow Airbnb’s published guidance and listing rules. Tip checks are about clarity: things that could make your title stronger. The character limit, word lists and patterns are stored content we review and update, shown with their sources.",
};

export const limits = {
  title: "Limits",
  points: [
    "It reads your title only. It can’t see your photos, price, reviews, calendar or the rest of your listing.",
    "Word lists can’t catch every vague word, claim or feature, and a Tip is a suggestion, not a rule.",
    "Airbnb doesn’t say how it counts emoji and special characters. We count them as people see them.",
    "Where a title gets cut off depends on the device and screen, so the search card is an illustration.",
  ],
  disclaimer:
    "A good title helps win the click. Your cover photo, price and reviews matter too. This tool checks clarity and Airbnb’s published guidance, not ranking.",
};

export const related = { title: "Related tools", ids: ["ai-readiness-listing-scorer", "ai-ready-description-builder"] };

export const changelogNotes: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: 12 checks, live counter, search card preview, title builder and compare." },
];

/** FAQ. The character limit comes from stored data. */
export function faqFor(limit: number): FaqEntry[] {
  return [
    { q: "How long can an Airbnb title be?", a: `Airbnb recommends fewer than ${limit} characters, because longer titles get cut off.` },
    {
      q: "Should I put my city in the title?",
      a: "No. Search already shows the location, so use the space for a selling point. A nearby landmark or station is different: it helps guests picture where you are.",
    },
    {
      q: "Should I put the number of bedrooms in the title?",
      a: "No. Search already shows it. Use the space for something guests can’t see elsewhere, like “free parking” or “canal view”.",
    },
    { q: "Can I use emoji or capitals?", a: "Airbnb advises against emoji and all-caps words. They look like spam and can be cut or shown oddly." },
    { q: "What makes a strong title?", a: "One standout feature, one benefit and one location hook, for example “Canal-view flat · free parking · 5 min to the tram”." },
  ];
}
