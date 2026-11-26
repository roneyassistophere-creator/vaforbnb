/**
 * Direct booking savings calculator: editable stored content.
 *
 * Seeded into the `figures` table (key "directBooking.content") and read from
 * there. Platform fee presets, VAT, card fees and the policy link are their
 * own rows in figures.seed.ts (shared with the profit calculator where they
 * overlap). Percentages are whole numbers here (15.5 = 15.5%).
 */
export const model = {
  version: 1,
  versionDate: "2026-11-26",
  /** "Worth it" needs website payback within this many months. */
  worthItMonths: 36,
  /** Payback longer than this shows "Over 10 years". */
  paybackCapMonths: 120,
  maxScenarios: 5,
  compareMax: 3,
};

/** Starting values (marked as examples on the page). */
export const defaults = {
  rate: 100,
  nights: 3,
  cleaningFee: 0,
  channels: ["airbnb"] as string[],
  bookingFee: 15,
  bookingPaymentsFee: 0,
  vrboFee: 8,
  otherFee: 0,
  discount: 0,
  damage: 0,
  systemKind: "fixed" as "fixed" | "percent",
  systemFee: 0,
  bookings: 60,
  occupancy: 60,
  avgStay: 3,
  shares: { airbnb: 100, booking: 0, vrbo: 0, other: 0, direct: 0 },
  target: 20,
  fromHighest: false,
  alreadyDirect: false,
  running: { system: 0, hosting: 0, marketing: 0, other: 0 },
  websiteBuild: 0,
};

/** "Try an example": the brief's tests 1 and 4. */
export const example = {
  note: "Example data: a £120 × 3-night booking plus a £40 cleaning fee, and 60 bookings a year. Replace with your own figures.",
  rate: 120,
  nights: 3,
  cleaningFee: 40,
  channels: ["airbnb"] as string[],
  bookings: 60,
  shares: { airbnb: 95, booking: 0, vrbo: 0, other: 0, direct: 5 },
  target: 20,
  alreadyDirect: false,
  running: { system: 30, hosting: 120, marketing: 0, other: 0 },
  websiteBuild: 1500,
};

/** "Before you go direct": each item links to a Rules Hub card, a service or an official page. */
export const checklist = [
  { id: "website", title: "Your own website and booking system", text: "A clear site with live availability and instant booking, connected to your channel manager so nothing double-books.", href: "/services/direct-booking-websites", label: "Direct booking websites" },
  { id: "payments", title: "Secure card payments", text: "Take payment through a trusted card processor, never by bank transfer to strangers. Card details should never pass through your inbox.", href: "/services/direct-booking-websites", label: "How we set up payments" },
  { id: "terms", title: "Terms and a cancellation policy", text: "Written booking terms and a fair cancellation policy that guests accept before they pay.", href: "/uk-short-let-rules#cancellation-policy", label: "Cancellation rules" },
  { id: "pricing", title: "All-in pricing", text: "Show the total price, including any cleaning fee, wherever a price appears.", href: "/uk-short-let-rules#all-in-pricing", label: "All-in pricing rules" },
  { id: "damage", title: "Damage protection or a deposit", text: "Platforms offer some host protection; direct bookings need your own insurance cover or a refundable deposit.", href: "/uk-short-let-rules#insurance", label: "Insurance" },
  { id: "data", title: "Data protection", text: "You’re responsible for guests’ personal data: a privacy notice, secure storage and deleting what you no longer need.", href: "https://ico.org.uk/for-organisations/", label: "ICO guidance" },
  { id: "comms", title: "Guest communication", text: "Fast replies, clear check-in instructions and a way to reach you during the stay, without a platform’s inbox.", href: "/services/guest-communication", label: "Guest communication" },
];

/** Wording chosen by the result ({placeholders} filled from the host's figures). */
export const wording = {
  verdict: { worth: "Worth it at your figures", marginal: "Marginal", notYet: "Not yet" },
  whatThisMeans: {
    worth: "At your figures, taking {target}% of bookings directly would save about {net} a year after costs, and pay back a website in {payback}.",
    worthNoBuild: "At your figures, taking {target}% of bookings directly would save about {net} a year after costs.",
    marginal: "Direct bookings save money per booking, but your running costs eat most of it. You’d need about {share}% direct for a faster payback.",
    notYet: "At this volume, the costs of running direct bookings are more than the fees you’d save. Grow repeat and local bookings first, or reduce running costs.",
    always: "Keep platforms for discovery, and don’t move a platform’s guests off the platform.",
  },
};
