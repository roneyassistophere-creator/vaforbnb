import { routes } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/photo-shot-list";

/**
 * Page copy for /free-tools/airbnb-photo-shot-list. Order rules, counts and
 * tips are stored content (src/data/photoShotList.ts); text that quotes them
 * is built from the stored values below.
 */

export const listingOptimisationHref = `${routes.services}/listing-optimisation#photos`;

export const hero = {
  shortAnswer:
    "Tick your rooms and features, then choose your standout feature and who usually stays. You’ll get your photo order, starting with the five that sit at the top of your listing, a full shot list covering every room, ready-made captions with your real details, and a shoot-day checklist for your phone.",
  badges: ["Get more bookings", "All UK"],
  kitBadge: "Get more bookings kit · step 4",
  privacy: "Everything stays on your device.",
};

export const whatThisMeansFallback =
  "Once you tick your rooms, this explains how to use your photo order. Upload in order, lead with your strongest photo, and caption every one.";

export const nextStep = {
  eyebrow: "Next step",
  title: "Want us to plan your shoot and write your captions?",
  text: "Our listing team plans your shot list, chooses your cover photo and photo order, and writes captions from your real details.",
  cta: "Listing optimisation",
  href: listingOptimisationHref,
};

export const kitNext = {
  eyebrow: "Get more bookings kit · step 5",
  title: "Next in your kit: Long-stay discount calculator",
  live: "Work out whether a weekly or monthly discount fills more nights.",
  soon: "Coming soon. Your basics are saved on this device, ready for it.",
  cta: "Continue to the long-stay discount calculator",
  save: "Save for the long-stay discount calculator",
  saved: "Saved on this device. The long-stay discount calculator is coming soon.",
};

/** How it works, built from the stored rules. */
export function howItWorksSections(c: Content): { id: string; title: string; text: string; list?: string[] }[] {
  const R = c.rules;
  const fillNames: Record<string, string> = {
    livingSpace: "living space",
    mainBedroom: "main bedroom",
    kitchen: "kitchen",
    secondOrPriority: "your second selling point, or the shot your guests look for first",
    bathroom1: "bathroom",
    bedroom2: "second bedroom",
    outdoor: "outside space",
    workspace: "workspace",
  };
  const guest = R.guestTypes.map((g) => `${g.label}: ${R.guestPriority[g.id]?.[0]?.reason ?? ""}`.trim());
  const P = c.photoCount;
  return [
    { id: "cover", title: "The cover photo", text: "Your standout feature becomes photo 1, the big image guests see in search. If it’s a room, the wide shot of that room is your cover, so it isn’t repeated." },
    {
      id: "first-five",
      title: "The first five",
      text: `Photos 1 to 5 sit at the top of your listing. After the cover, each slot takes the next item that exists from this order, and nothing appears twice: ${R.firstFive.fill.map((f) => fillNames[f] ?? f).join(", ")}.`,
      list: guest,
    },
    {
      id: "photo-tour",
      title: "The photo tour",
      text: `Airbnb groups photos by room, so every room gets at least one photo. After the first five come the remaining bedrooms, bathrooms, dining area, workspace, laundry, outside space and extras, then the entrance, parking, accessibility features and local area. If you mention stairs with no lift or a shared entrance, we add an honesty shot so guests aren’t surprised. Most homes need around ${P.typicalFrom}–${P.typicalTo} photos; Airbnb asks for at least ${P.platformMin}.`,
    },
    { id: "captions", title: "Captions", text: "Each caption is built from a stored template and only the facts you enter, like bed sizes, Wi-Fi speed or minutes to a station. A missing fact drops that part of the caption, so it never says something you didn’t tell us. Captions are checked for vague words." },
  ];
}

export const howItWorks = {
  intro: "The planner follows a fixed set of stored rules, so the same answers always give the same plan. The order lists, guest priorities, shots per room, templates and tips are stored content we review and update.",
};

export const limits = {
  title: "Limits",
  points: [
    "It plans photos from what you tick. It can’t see your property, so check every shot makes sense in your space.",
    "The order is a recommendation. You know your best feature: move shots if you need to.",
    "Airbnb doesn’t publish a caption limit, and where photos are cropped varies by screen.",
    "Light tips are general. Weather and nearby buildings change how light falls in a room.",
  ],
  disclaimer:
    "Photos must show the property accurately. Don’t use heavy filters, misleading angles or photos that hide problems. A professional photographer can help, especially for your cover photo.",
};

export const related = { title: "Related tools", ids: ["ai-ready-description-builder", "ai-readiness-listing-scorer", "cleaning-checklist-generator"] };

export const changelogNotes: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: photo order, shot list with captions, prep checklist, light and kit tips, shoot-day mode and exports." },
];

/** FAQ. The photo-count range comes from stored data. */
export function faqFor(c: Pick<Content, "photoCount">): FaqEntry[] {
  const P = c.photoCount;
  return [
    { q: "What should my Airbnb cover photo be?", a: "Your single strongest selling point, bright and wide, and easy to read on a small phone screen." },
    {
      q: "What order should my Airbnb photos go in?",
      a: "Cover photo first, then the living space, main bedroom, kitchen and your second selling point, then every other room, then extras like the entrance and parking.",
    },
    {
      q: "How many photos does a listing need?",
      a: `Enough to show every space guests use, with at least one per room so it appears in the photo tour. Most homes need around ${P.typicalFrom}–${P.typicalTo}.`,
    },
    {
      q: "Should I caption photos?",
      a: "Yes. Captions with specifics, like “King bed, blackout blinds” or “Desk by the window, 300 Mbps Wi-Fi”, help guests understand what they’re seeing.",
    },
    {
      q: "Can I use a phone?",
      a: "Yes. Shoot in daylight with the lights on, in landscape, from a corner at chest height, and avoid the ultra-wide lens setting if it bends the walls.",
    },
  ];
}
