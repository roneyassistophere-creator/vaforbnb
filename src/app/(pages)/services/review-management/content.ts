import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/review-management. */

export const wall = [
  { stars: 5, who: "Guest · Oct", t: "Spotless, exactly like the photos, and the host replied within minutes when we couldn’t find the parking.", reply: "Thank you, Laura! So glad the parking photos helped in the end. You’re welcome back any time.", offset: "md:mt-10" },
  { stars: 3, who: "Guest · Sep", t: "Great location, but the oven was dirty and the shower was barely warm.", reply: "Thank you for the honest feedback. You’re right, and we’re sorry. Our cleaner now checks the oven at every turnover, and the shower has been fixed.", offset: "" },
  { stars: 5, who: "Guest · Aug", t: "Perfect for our work trip: proper desk, fast Wi-Fi, quiet street. Would book again.", reply: "", offset: "md:mt-16" },
];

export const facts = [
  { n: "Quality", t: "Airbnb names quality, including reviews, among the strongest ranking influences.", s: "Airbnb, How search works" },
  { n: "Bottom 10%", t: "Lowest-rated listings get a label above their reviews; the best get Guest Favourite.", s: "Airbnb Help, article 3495" },
  { n: "3 years", t: "Booking.com’s score uses the last three years, with newer reviews weighted more.", s: "Holidu host guide" },
  { n: "14 days", t: "Airbnb guests have 14 days after check-out to review. That’s the window that matters.", s: "Airbnb Help, article 13" },
];

export const replies = {
  good: {
    label: "Professional reply",
    t: "Thank you for staying with us and for the honest feedback. You’re right: the oven wasn’t up to our standard, and we’re sorry. Our cleaner now checks inside the oven at every turnover, and a plumber has adjusted the shower temperature. We’re glad you enjoyed the location, and we hope to welcome you back.",
    verdict: "They listened, and they fixed it. I’d book.",
    pts: ["Accountable, with no excuses", "Specific fixes future guests can trust", "Warm close that shows care"],
  },
  bad: {
    label: "Defensive reply",
    t: "We are very surprised. Our cleaner is excellent and no other guest has complained about the oven. The shower works fine if you run it for a few minutes, as explained in the guidebook.",
    verdict: "If something goes wrong, I’ll be blamed. Next listing.",
    pts: ["Argues with the guest in public", "Hints the guest was at fault", "No sign anything was fixed"],
  },
};

export const anatomy = [
  { h: "Thank them", t: "For staying and for the feedback, even when it stings.", bg: "#FDE2D4" },
  { h: "Acknowledge, don’t argue", t: "Own what went wrong, without excuses or blame. Never share personal details.", bg: "#FCEFC7" },
  { h: "Show the fix", t: "Say specifically what’s been done.", bg: "#DDEFE4" },
  { h: "Close warmly", t: "A short, genuine line for future guests.", bg: "#DCE6F2" },
];

export const anatomyReply = [
  "Thank you for staying with us and for the honest feedback.",
  "You’re right: the oven wasn’t up to our standard, and we’re sorry.",
  "Our cleaner now checks inside the oven at every turnover, and a plumber has adjusted the shower.",
  "We’re glad you enjoyed the location, and hope to welcome you back.",
];

export const stays = [
  { t: "Smooth stay, happy guest", dot: "#1F6B45", do: "A warm, personal thank-you with a gentle request for an honest review.", msg: "Hi Emma, thank you so much for staying with us, and for leaving the flat so lovely. We hope the trip home was easy. If you have a moment, an honest review really helps small hosts like us. Warm regards, Reservations Team" },
  { t: "A small issue, quickly fixed", dot: "#C9A227", do: "Thank them, acknowledge the issue and what was done, then invite honest feedback.", msg: "Hi James, thank you for staying, and for letting us know about the Wi-Fi on Saturday. Sorry for the hassle; the router has now been replaced. We’d really value your honest feedback on the stay. Warm regards, Reservations Team" },
  { t: "A real problem during the stay", dot: "#B8383A", do: "Make sure it’s resolved and apologise properly first. No cheerful template that ignores what happened.", msg: "Hi Priya, thank you for your patience when the heating failed. We’re truly sorry it affected your stay. An engineer has repaired the boiler, and we’ve added a backup heater. If there’s anything else we can do, please tell us. Warm regards, Reservations Team" },
];

export const catchEarly = [
  { when: "Day one", h: "First-morning check-in", t: "“Is everything as expected?” Most issues are fixable on day one." },
  { when: "During the stay", h: "Fast fixes", t: "Coordinated with your cleaner or handyman." },
  { when: "All stay", h: "Warning signs", t: "Short replies, small complaints, or silence after a reported issue." },
  { when: "After check-out", h: "Private feedback", t: "Airbnb lets guests send private notes; we read and act on them." },
];

export const loop = [
  { cat: "Cleanliness", to: "Your cleaner", fix: "oven and fridge added to the photo list" },
  { cat: "Accuracy", to: "Your listing", fix: "photos and description updated" },
  { cat: "Check-in", to: "Instructions", fix: "clearer key safe photos and directions" },
  { cat: "Value", to: "Pricing", fix: "price reviewed against what’s included" },
  { cat: "Comfort", to: "Maintenance", fix: "mattress topper, blackout blinds" },
  { cat: "Communication", to: "Our messaging team", fix: "faster, clearer pre-arrival message" },
];

export const canGo = [
  { h: "Irrelevant", t: "Not about your listing or the guest’s first-hand stay." },
  { h: "Retaliatory", t: "Written to punish you for reporting a genuine policy breach." },
  { h: "Coerced", t: "Linked to threats, extortion or demands for compensation." },
  { h: "Fake or biased", t: "Not from a real stay, or written by a competitor." },
];

export const cantGo = ["You disagree with the star rating", "It mentions things outside your control", "It’s the guest’s subjective opinion"];

export const owned = [
  { h: "Google reviews", t: "Can show in Google Search and Maps, where direct guests look first.", bg: "#14212B", fg: "#FFFFFF" },
  { h: "Trustpilot", t: "A company-level reputation if you run several properties.", bg: "#F7F3EC", fg: "#14212B" },
  { h: "Your website", t: "Linked to your Google or Trustpilot reviews, for direct bookings.", bg: "#FDECEC", fg: "#14212B" },
];

export const gatingRules = [
  { who: "Google · Not allowed", q: "selectively soliciting positive reviews from customers" },
  { who: "Trustpilot · Don’t", q: "inviting only those people who you know have had a positive experience" },
  { who: "CMA (UK) · Avoid", q: "encouraging just those who are satisfied to leave reviews" },
];

export const never = [
  "Argue with guests in public replies",
  "Offer refunds, discounts or gifts for reviews",
  "Ask a guest to change or remove a review",
  "Write or buy fake reviews",
  "Invite only happy guests to Google or Trustpilot",
  "Share a guest’s personal details in a reply",
];

export const included = [
  { h: "Every review answered", t: "Airbnb, Booking.com and Vrbo, in your voice." },
  { h: "Bad review handling", t: "Facts checked; reply agreed with you before publishing." },
  { h: "Personal review requests", t: "Timed and worded to how the stay went." },
  { h: "Guest reviews", t: "Fair, factual reviews of every guest." },
  { h: "Removal requests", t: "Evidence-backed, for reviews that break the rules." },
  { h: "Google and Trustpilot", t: "Set-up help and fair invitations to every guest." },
  { h: "Monthly review report", t: "Category ratings, themes and fixes made." },
];

export const process = [
  { n: "01", h: "Review audit", t: "Your last [50] reviews and category ratings, patterns found." },
  { n: "02", h: "Agree your voice", t: "Tone, sign-off and how to handle difficult reviews." },
  { n: "03", h: "Day to day", t: "Every review answered; personal requests sent." },
  { n: "04", h: "Fix the causes", t: "Issues passed to cleaning, maintenance, listing, pricing." },
  { n: "05", h: "Monthly report", t: "Ratings, themes, replies and what changed." },
];

export const honest = [
  { b: "We can’t guarantee 5-star reviews.", t: "No honest service can. We improve the stay and how you respond." },
  { b: "We can’t remove reviews that follow the rules.", t: "We write the best reply instead." },
  { b: "Reviews reflect the whole stay.", t: "Pair this with cleaning and guest communication." },
  { b: "Our hours: 8am–8pm UK, Mon–Sat.", t: "" },
];

export const proof = [
  { k: "Reviews replied to across client listings", v: "[X]%" },
  { k: "Average rating across client listings", v: "[X.XX]" },
  { k: "Listings that gained Guest Favourite", v: "[X]" },
];

export const packageCta = {
  title: `Review management from ${showPrice(prices.run)} a month`,
  text: "With guest communication, pricing, cleaning coordination and the monthly finance check.",
};

export const faq: FaqEntry[] = [
  { q: "How should I respond to a bad Airbnb review?", a: "Thank the guest, acknowledge the problem without arguing, explain specifically what you’ve fixed, and close warmly. You’re writing for future guests, who want to see problems solved." },
  { q: "Can I get a bad Airbnb review removed?", a: "Only if it breaks Airbnb’s reviews policy: irrelevant, retaliatory, coerced or fake, for example. Disagreeing with a rating isn’t enough. Otherwise, a professional reply is your best tool." },
  { q: "How long do guests have to leave an Airbnb review?", a: "14 days after check-out. Reviews publish when both guest and host have reviewed, or when the 14 days end." },
  { q: "Should I use automated review requests?", a: "We don’t. A personal message timed to how the stay went works better, and avoids a cheerful template to a guest who had a problem. Airbnb also prompts guests itself." },
  { q: "How do I get more 5-star reviews?", a: "Deliver a stay that matches the listing, fix issues fast during the stay, communicate warmly, and ask for honest reviews personally. Incentives break platform rules." },
  { q: "Can I ask guests for Google or Trustpilot reviews?", a: "Yes, but invite every guest in the same way. Google and Trustpilot don’t allow asking only happy customers, UK guidance warns against it, and incentives aren’t allowed." },
  { q: "Do you write my guest reviews too?", a: "Yes. Fair, factual reviews of every guest, in your name." },
  { q: "How does Booking.com calculate my review score?", a: "From guests’ overall scores over the last three years, with newer reviews weighted more heavily." },
];

export const sources =
  "Airbnb Help: how reviews work (13), reviews policy (2673), Guest favourites (3495) · Airbnb, How search works · Holidu guide to Booking.com review scores · Search Engine Land on Google review guidelines · Trustpilot Guidelines for Businesses · CMA fake reviews guidance (CMA208).";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["why", "Why ratings matter"],
  ["simulator", "Reply simulator"],
  ["anatomy", "Four-step replies"],
  ["outcome", "After a bad stay"],
  ["prevent", "Prevent bad reviews"],
  ["removal", "Review removal"],
  ["beyond", "Beyond the OTAs"],
  ["never", "What we never do"],
  ["guest-reviews", "Reviewing guests"],
  ["audit", "Free review audit"],
  ["call", "Run package"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "Every review answered, every pattern fixed.",
  label: "Free review audit",
  href: "#audit",
};
