import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/social-media. */

const N = "#14212B";
const W = "#FFFFFF";
const CO = "#F0595A";
const TI = "#FDECEC";
const CR = "#F7F3EC";

export const highlights = [
  { t: "New", c: CO },
  { t: "Stays", c: CR },
  { t: "Area", c: TI },
  { t: "Reviews", c: N },
];

export const profileGrid = [
  { t: "NEW IN [AREA]", c: CO, f: N },
  { t: "TOUR", c: "#CFE1E2", f: N },
  { t: "TEAM", c: N, f: W },
  { t: "GUIDE", c: CR, f: N },
  { t: "BEFORE/AFTER", c: N, f: W },
  { t: "REVIEW", c: TI, f: N },
  { t: "TURNOVER", c: "#D8D2BC", f: N },
  { t: "EVENT", c: CO, f: N },
  { t: "LONG STAYS", c: "#CFE1E2", f: N },
];

export const stories = [
  { h: "#fit", n: "?", t: "Right for you" },
  { h: "#why", n: "★", t: "Why" },
  { h: "#funnel", n: "→", t: "Bookings" },
  { h: "#pillars", n: "5", t: "Pillars" },
  { h: "#month", n: "12", t: "Plan" },
  { h: "#platforms", n: "@", t: "Platforms" },
  { h: "#rules", n: "!", t: "Rules" },
  { h: "#faq", n: "?!", t: "FAQ" },
];

export const fit = [
  { k: "1–2 PROPERTIES", t: "Happy on Airbnb, not looking to grow yet", v: "OPTIONAL", vb: "#EEF0F2", vf: N, x: "A tidy profile and occasional posts are enough for now. Put your budget into your listing and pricing first." },
  { k: "GROWING", t: "I have a brand name and a direct booking website", v: "GREAT FIT", vb: "#DDF1E5", vf: "#1F6B45", x: "Social media gives your website traffic, trust and returning guests. This is where it starts paying back." },
  { k: "EXPANDING", t: "I run SA or manage properties for landlords", v: "STRONG FIT", vb: "#DDF1E5", vf: "#1F6B45", x: "An active page shows guests, companies and landlords that you’re a real, growing business. Every new property becomes proof." },
];

export const why = [
  { h: "Found outside the OTAs", t: "People discover places to stay on social, then look for a way to book.", bg: CO, fg: N, r: "-1deg" },
  { h: "Trust before booking", t: "Real properties, a real team and real updates show you’re genuine.", bg: W, fg: N, r: "1deg" },
  { h: "Guests come back direct", t: "Past guests who follow you see new properties and book with you next time.", bg: CR, fg: N, r: "-0.5deg" },
  { h: "Your brand, not theirs", t: "Your profile builds your name, not the platform’s.", bg: W, fg: N, r: "0.8deg" },
  { h: "Proof of growth", t: "Every new property, refurb and great review shows you’re expanding.", bg: TI, fg: N, r: "-1deg" },
  { h: "It wins landlords too", t: "For property managers, an active page says “professional team”.", bg: CO, fg: N, r: "0.6deg" },
];

type ScreenItem = { t: string; bg: string; fg: string; h?: number; w: number; al?: "flex-start" | "flex-end" };
export const funnel: { t: string; d: string; app: string; bg: string; foot: string; items: ScreenItem[] }[] = [
  { t: "Discover", d: "They see a reel of your new apartment.", app: "Explore", bg: "#F2F4F6", foot: "Reach: people outside the OTAs", items: [{ t: "NEW IN [AREA] · 2-bed with parking", bg: CO, fg: N, h: 220, w: 800 }, { t: "“Ready for you” · turnover clip", bg: N, fg: W, h: 120, w: 800 }] },
  { t: "Follow", d: "Your content is useful and trustworthy.", app: "[Your Brand] Stays", bg: W, foot: "Trust: a real, active business", items: [{ t: "Following ✓", bg: TI, fg: N, w: 800 }, { t: "Local guide: 5 coffee spots near the flat", bg: CR, fg: N, h: 120, w: 700 }, { t: "Meet the team behind your stay", bg: CR, fg: N, h: 120, w: 700 }] },
  { t: "Visit", d: "The link in your bio goes to your website.", app: "yourbrand.co.uk", bg: W, foot: "Tracked link: we count these visits", items: [{ t: "[Your Brand] Stays", bg: N, fg: W, h: 140, w: 800 }, { t: "Check availability →", bg: CO, fg: N, w: 800 }, { t: "Long stays · Contractors · Business", bg: "#F2F4F6", fg: N, w: 600 }] },
  { t: "Enquire", d: "They message you on social, WhatsApp or email.", app: "Messages", bg: W, foot: "Enquiry received", items: [{ t: "Hi! Is the 2-bed free 3–24 March? It’s for 2 engineers. Is there parking for a van?", bg: "#F2F4F6", fg: N, w: 500, al: "flex-start" }] },
  { t: "Convert", d: "Our team replies fast with a booking link.", app: "Messages", bg: W, foot: `Replied by ${brand.name} · ${brand.hours.range}`, items: [{ t: "Hi! Is the 2-bed free 3–24 March? It’s for 2 engineers. Is there parking for a van?", bg: "#F2F4F6", fg: N, w: 500, al: "flex-start" }, { t: "Yes, it’s free, with off-road parking for a van. Here’s your direct booking link with the full price for 21 nights: [link]", bg: CO, fg: N, w: 600, al: "flex-end" }] },
  { t: "Return", d: "They keep following, and book direct next time.", app: "Messages", bg: W, foot: "Returning guest, booked direct", items: [{ t: "Saw your new place in [area]! Can we book it for the next project?", bg: "#F2F4F6", fg: N, w: 500, al: "flex-start" }, { t: "Lovely to hear from you again! Sending the details now.", bg: CO, fg: N, w: 600, al: "flex-end" }] },
];

export const pillars = [
  { t: "Growth and milestones", posts: [{ h: "We’ve just taken on a new home in [area]", fmt: "REEL", cap: "Launch reveal with a countdown to the first guests.", c: CO, f: N }, { h: "Before → after", fmt: "CAROUSEL", cap: "The refurb story, slide by slide.", c: N, f: W }, { h: "Welcome to the team, [name]", fmt: "POST", cap: "New faces show a growing business.", c: CR, f: N }] },
  { t: "Behind the scenes", posts: [{ h: "Turnover day in 30 seconds", fmt: "REEL", cap: "Cleaning checklist in action, start to finish.", c: N, f: W }, { h: "Restock run", fmt: "STORY", cap: "Tea, coffee, the little things guests notice.", c: TI, f: N }, { h: "Getting ready for a work crew", fmt: "CAROUSEL", cap: "Beds, parking, laundry, all set.", c: CO, f: N }] },
  { t: "The properties", posts: [{ h: "Room tour: the [name] apartment", fmt: "REEL", cap: "Walkthrough with the best features first.", c: CR, f: N }, { h: "Perfect for contractors", fmt: "CAROUSEL", cap: "Parking, beds, washing machine, invoices.", c: N, f: W }, { h: "Cosy autumn styling", fmt: "POST", cap: "Seasonal touches that make photos pop.", c: CO, f: N }] },
  { t: "Local guides", posts: [{ h: "5 coffee spots near [property]", fmt: "CAROUSEL", cap: "Saveable, shareable, genuinely useful.", c: TI, f: N }, { h: "Coming up in [town]", fmt: "POST", cap: "Events worth booking a stay for.", c: CO, f: N }, { h: "Best walk within 10 minutes", fmt: "REEL", cap: "Your area, from a guest’s view.", c: N, f: W }] },
  { t: "Guest love and trust", posts: [{ h: "“Spotless, and they replied in minutes.”", fmt: "POST", cap: "A real review, shared with permission.", c: CR, f: N }, { h: "How we fixed it in an hour", fmt: "CAROUSEL", cap: "Problems happen. Show how you solve them.", c: N, f: W }, { h: "FAQ: parking and check-in", fmt: "STORY", cap: "Answer questions before they’re asked.", c: CO, f: N }] },
];

export const pillarKeys = ["Growth", "Behind the scenes", "Properties", "Local guides", "Guest love"];
export const pillarColours = [CO, "#E3E7EB", CR, TI, "#DDF1E5"];

/** [pillar index, post title] for each week of the sample month. */
export const weeks: [number, string][][] = [
  [[0, "New property reveal (reel)"], [3, "Local guide: [area] coffee spots"], [1, "Turnover day behind the scenes"]],
  [[2, "“Perfect for contractors” carousel"], [4, "Guest review (with permission)"], [3, "Upcoming event in [town]"]],
  [[0, "Before and after refurb"], [4, "FAQ: parking and check-in"], [1, "Meet the team"]],
  [[2, "Monthly availability for long stays"], [3, "Local walk or day trip"], [0, "Month in numbers: [real figures]"]],
];

export const audiences = [
  { t: "Leisure guests and families", rec: [0, 1, 3] },
  { t: "Contractors and companies", rec: [2, 1] },
  { t: "Landlords (for property managers)", rec: [2, 1, 0] },
  { t: "Younger travellers", rec: [3, 0, 4] },
];

export const platforms = [
  { n: "Instagram", b: "leisure guests, couples, families, brand building", w: "reels, room tours, stories, highlights per property" },
  { n: "Facebook", b: "local audiences, groups, returning and older guests", w: "community posts, local events, group shares where rules allow" },
  { n: "LinkedIn", b: "companies, contractors, relocation agents, landlords", w: "business stays, growth updates, case studies, founder posts" },
  { n: "TikTok", b: "discovery, younger travellers", w: "short tours, behind-the-scenes clips" },
  { n: "YouTube", b: "longer tours and guides that stay findable", w: "full walkthroughs, area guides, Shorts" },
];

export const youDo = [
  "Approve the monthly plan",
  "Send photos and short clips (we send a simple shot list)",
  "Tell us your news: new properties, refurbs, events",
  "Approve offers or special prices",
  "Confirm bookings, or let us do it in your booking system",
];

export const weDo = [
  "Strategy, content pillars and a monthly plan",
  "Captions, hashtags, graphics and video editing",
  "Scheduling and posting",
  `Replies to comments and DMs, ${brand.hours.range}`,
  "Turning enquiries into direct booking requests",
  "Monthly report: reach, link clicks, enquiries",
];

/** ok: true = post it, false = don't, null = only with consent */
export const postRules: { t: string; ok: boolean | null; x: string }[] = [
  { t: "A reel showing the key safe and door code", ok: false, x: "Never show addresses, key safes or codes. It protects your property and guests." },
  { t: "“All 3 flats empty this week!”", ok: false, x: "Don’t reveal that a property is unoccupied. Post availability as dates on your website instead." },
  { t: "A photo of a smiling guest family", ok: null, x: "Only with their permission. Identifiable photos are personal data under UK GDPR." },
  { t: "“From £89 a night” (plus a cleaning fee)", ok: false, x: "Prices must include all mandatory fees. UK law has required this since April 2025." },
  { t: "An influencer’s free stay, posted without a label", ok: false, x: "Free stays given for content are ads. Label them clearly, e.g. “#ad”, per ASA and CMA rules." },
  { t: "Buying 5,000 followers to look bigger", ok: false, x: "Fake followers damage trust, and fake reviews are banned under UK consumer law." },
  { t: "Messaging Airbnb guests to book on Instagram instead", ok: false, x: "Against Airbnb’s off-platform policy. Your social and website do that job instead." },
  { t: "Turnover clip of a spotless kitchen", ok: true, x: "Yes! Behind-the-scenes content builds trust. No guests, no codes, no address." },
];

export const honest = [
  { b: "No follower guarantees.", t: "We focus on the right audience, not big numbers." },
  { b: "It builds over time.", t: "Consistency over months beats one viral post." },
  { b: "Bookings come from the whole system.", t: "Social, a good website, quick replies and great stays work together." },
  { b: "Enquiries, not likes.", t: "Tracked links show what social actually brings in." },
];

export const proof = [
  { c: "[SA operator, 8 units]", pl: "[Instagram, LinkedIn]", b: "[X enquiries/month]", a: "[X enquiries/month]" },
  { c: "[Holiday let brand]", pl: "[Instagram, Facebook]", b: "[X link clicks/month]", a: "[X link clicks/month]" },
];

export const faq: FaqEntry[] = [
  { q: "Is social media worth it for an Airbnb host?", a: "If you have one or two properties and you’re happy on Airbnb, it’s optional. If you’re building a brand, have a direct booking website or plan to expand, social media helps guests find, trust and return to you." },
  { q: "Can I get direct bookings from Instagram?", a: "Yes, when your profile sends people to a booking website or inbox and someone replies quickly. We handle the content and the replies." },
  { q: "What should a short-let business post?", a: "Growth updates like new properties, behind-the-scenes turnovers, property tours, local guides and guest reviews shared with permission." },
  { q: "Do I have to film everything myself?", a: "No. Send short clips and photos, or ask your cleaner to film a quick clip at turnovers. We edit, write and post." },
  { q: "Which platform is best for serviced accommodation?", a: "Usually Instagram for guests and LinkedIn for companies, contractors and landlords. We pick based on who you want to reach." },
  { q: "Can I post photos of my guests?", a: "Only with their permission. Identifiable photos are personal data under UK GDPR." },
  { q: "Do you reply to messages?", a: `Yes, comments and DMs, ${brand.hours.sentence}.` },
  { q: "Can you guarantee followers or bookings?", a: "No. We measure enquiries and link clicks, and build a presence that grows over time." },
];

export const related = [
  { label: "Direct booking websites", href: anchors.service("website") },
  { label: "SEO for short lets", href: anchors.service("seo") },
  { label: "Guest communication", href: anchors.service("guest") },
  { label: "Review management", href: anchors.service("reviews") },
  { label: "Listing optimisation", href: anchors.service("listing") },
];

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["fit", "Is it right for you?"],
  ["why", "Why social"],
  ["funnel", "The funnel"],
  ["pillars", "Content pillars"],
  ["month", "Sample month"],
  ["platforms", "Platforms"],
  ["split", "We do, you do"],
  ["rules", "Post it or not?"],
  ["expectations", "What we measure"],
  ["price", "Proof and price"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "A month of posts planned, made and published.",
  label: "Book a call",
  href: "#price",
};
