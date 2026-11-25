import { routes } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";

/** Page copy for /free-tools/airbnb-ai-readiness-score. Scoring content is stored (src/data/aiReadiness.ts). */

export const auditHref = `${routes.services}/listing-optimisation#audit`;
export const listingAiHref = `${routes.services}/listing-optimisation#ai`;

export const hero = {
  title: "Is my listing ready for Airbnb’s AI search?",
  shortAnswer:
    "Airbnb’s AI search lets guests describe what they need in their own words, like ‘a quiet flat near the station with a desk’. It’s starting in the US. Paste your listing, tick your amenities and answer a few questions. You’ll get a readiness score out of 100, your top three fixes with example sentences, and a simulator showing which guest searches your listing can answer.",
  badges: ["New", "Get more bookings", "All UK"],
  honest: "Scores readiness, not ranking",
  kitBadge: "Get more bookings kit · step 1",
};

export const keyPoints = [
  "Guests can now search in their own words (US first, no UK date yet).",
  "Specific facts are easier to match than vague words.",
  "Minutes to named places, Wi-Fi speed, bed sizes and parking details matter.",
  "Prepare now and you’re ready on day one.",
];

export const whatThisMeansFallback =
  "Once you score your listing, this explains what your band means and where to start. Clear facts help guests today, whatever happens with AI search.";

export const nextStep = {
  eyebrow: "Next step",
  title: "Get a free AI-readiness audit from our team",
  text: "Our listing team checks your title, description, amenities, photo captions and settings, and sends you the fixes that matter most. Free, with no obligation.",
  cta: "Get a free AI-readiness audit",
  href: auditHref,
};

export const howItWorks = {
  intro:
    "Your title and description are checked for eight things. Every pattern, word list and point value is stored content we can update without changing the tool, and the model version is shown in the changelog.",
  /** What each check looks for, in plain English (points come from the stored model). */
  checks: {
    A: "Title within the limit, says what the place is, names a station or landmark (not the town, which search already shows), and has a key amenity or a number with a unit (not the bedroom count).",
    B: "Numbers with units: Mbps, minutes, m², sq ft, metres, miles or km. Three or more scores full points.",
    C: "‘[n] minutes to [place]’ phrases, plus a bonus when one names a station, tube, tram, metro, bus stop or airport.",
    D: "Evidence for what your guest types ask for (or the core needs: fast Wi-Fi, parking, self check-in, a kitchen).",
    E: "Words that give no facts, such as ‘cosy’, ‘great location’ or ‘stunning’. Two points off for each.",
    F: "Wi-Fi, a dedicated workspace, a washing machine and self check-in ticked, and your parking situation stated.",
    G: "A caption on every room photo, and the bed size in every bedroom.",
    H: "Honest limits mentioned, then (for 200+ characters) paragraphs, short sentences and no shouting.",
  } as Record<string, string>,
  honest:
    "This tool scores readiness, not ranking. It measures how clearly your listing states the specific facts guests ask for, which any search system, and any guest, can use. It doesn’t predict where you’ll appear, and it doesn’t use Airbnb’s systems.",
};

export const limits = {
  title: "Limits",
  text: "The scorer reads only what you paste and tick. It can’t see your photos, price, reviews, calendar or the rest of your listing, and it looks for patterns rather than understanding every sentence. Character limits and section names are set by Airbnb and can change.",
  disclaimer:
    "Price, photos, reviews, responsiveness and availability still matter, and this tool can’t see them. A high score doesn’t guarantee a ranking or bookings. Airbnb hasn’t published how AI search ranks listings.",
};

export const related = { title: "Related tools", ids: ["airbnb-title-checker", "ai-ready-description-builder", "photo-shot-list-planner"] };

export const changelogNotes: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "Scoring v3: the title check no longer rewards the town or a bedroom count, which search already shows. It now matches the Airbnb title checker." },
  { date: "2026-11-25", note: "First version: readiness score, top three fixes, guest search simulator, highlighted text and score history." },
];

export const faq: FaqEntry[] = [
  { q: "What is Airbnb AI search?", a: "Announced in Airbnb’s 2026 Fall Update, it lets guests search using their own words or voice, starting in the US." },
  { q: "When is it coming to the UK?", a: "Airbnb hasn’t announced a UK date. Preparing now means you’re ready on day one, and clearer listings help guests today anyway." },
  {
    q: "How is my score worked out?",
    a: "Eight checks of the facts in your listing: title, facts with units, minutes to named places, the needs of your guest types, vague words, key amenities, room details and clarity. Each check shows exactly why you got its points.",
  },
  {
    q: "Which words should I avoid?",
    a: "Words that give no facts, like ‘cosy’, ‘great location’ or ‘close to everything’. Replace them with specifics, such as ‘12 m² bedroom’ or ‘8-minute walk to Leeds station’.",
  },
  { q: "Does a high score guarantee bookings?", a: "No. It measures how clear and specific your listing is, not your ranking. Airbnb hasn’t published how its AI search works." },
  { q: "Is my listing text stored?", a: "No. It’s analysed on your device and never sent to us. The PDF report is made on your device too; if you add your email, only your email and first name are sent." },
];
