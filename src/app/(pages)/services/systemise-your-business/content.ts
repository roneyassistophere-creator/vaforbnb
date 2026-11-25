import { anchors } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/systemise-your-business. */

const N = "#14212B";
const W = "#FFFFFF";
const CO = "#F0595A";
const SG = "#5E8C7E";

export const docs = [
  { t: "Check-in day", code: "GC-04", area: "Guest communication", c: CO, p: "Every guest arrives knowing exactly how to get in, and feels looked after from the first message.", meta: [{ k: "WHEN", v: "Arrival day, 10am" }, { k: "WHO", v: "Guest comms VA" }, { k: "TOOLS", v: "Channel manager inbox" }], steps: ["Confirm the turnover is complete and photos are uploaded.", "Send the check-in message using template T-06.", "Check the guest has read it by 2pm. If not, follow up on WhatsApp.", "After check-in time, send the “settling in” message."], e: "the property isn’t ready by check-in time, or the guest can’t get in after two attempts." },
  { t: "Booking a turnover clean", code: "CL-01", area: "Cleaning coordination", c: SG, p: "Every turnover is booked, confirmed and evidenced, with no gaps between guests.", meta: [{ k: "WHEN", v: "New booking received" }, { k: "WHO", v: "Ops VA" }, { k: "TOOLS", v: "Calendar, cleaner group" }], steps: ["Add the clean to the cleaning calendar.", "Message the cleaner with date, times and guest count.", "Get confirmation within 2 hours; if none, contact the backup cleaner.", "On the day, check timestamped before and after photos."], e: "no cleaner is confirmed 24 hours before check-in, or damage is found." },
  { t: "Weekly price check", code: "PR-02", area: "Pricing", c: "#C9A227", p: "Prices stay on track for the monthly revenue target, without leaving money on the table.", meta: [{ k: "WHEN", v: "Every Monday" }, { k: "WHO", v: "Pricing VA" }, { k: "TOOLS", v: "Pricing tool, comp set" }], steps: ["Check pacing against this month’s revenue target.", "Review the comp set for the next 30 days.", "Check local events for the next 90 days.", "Log suggested overrides in the pricing sheet."], e: "a change is more than [X]% from the base price, or minimum stay rules need changing." },
  { t: "Replying to a bad review", code: "RV-03", area: "Reviews", c: "#8A6FB0", p: "A calm, honest reply that shows future guests how we handle problems.", meta: [{ k: "WHEN", v: "Within 24 hours" }, { k: "WHO", v: "Reviews VA" }, { k: "TOOLS", v: "OTA review page" }], steps: ["Read the full stay: messages, cleaning photos, issues.", "Draft a reply: thank, own it, explain the fix. Never argue.", "Send the draft to the host for approval.", "Post, and log the fix in the property notes."], e: "the review mentions safety, discrimination or a legal claim." },
  { t: "Onboarding a new VA", code: "TM-01", area: "Team", c: N, p: "A new team member gets the right access and the right training, safely.", meta: [{ k: "WHEN", v: "Day one" }, { k: "WHO", v: "Host or team lead" }, { k: "TOOLS", v: "Password manager" }], steps: ["Share the SOP folder and the 4-week training plan.", "Add access by role (co-host permissions, password manager).", "Book shadowing sessions for week one.", "Sign the data processing agreement."], e: "the VA needs access beyond their role." },
];

export const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/** t = training, w = working independently, y = your time, - = nothing */
export const simRows = {
  without: [
    { t: "VA 1", p: "t t t w w w - - - - - -" },
    { t: "VA 2", p: "- - - - - - t t t w w -" },
    { t: "Your time", p: "y y y - - - y y y - - y" },
  ],
  with: [
    { t: "VA 1", p: "t w w w w w - - - - - -" },
    { t: "VA 2", p: "- - - - - - t w w w w w" },
    { t: "Your time", p: "y - - - - - y - - - - -" },
  ],
};

export const simText = {
  without: { h: "Without SOPs:", t: "you train every VA hand to hand, from scratch. When someone leaves, their know-how leaves too, and you start again." },
  with: { h: "With SOPs:", t: "a new VA learns from the documents first, comes to you with better questions, and your business fundamentals stay intact." },
};

export const who = [
  { k: "In-house", c: CO, f: N, h: "You have an in-house VA", t: "Everyone follows the same steps, whoever is working." },
  { k: "Current VA", c: N, f: W, h: "You already work with a VA", t: "Fill the gaps. Stop answering the same questions twice." },
  { k: "Hiring", c: SG, f: W, h: "You want to hire a VA", t: "Hand your new VA a complete training manual on day one." },
  { k: "Growing", c: "#C9A227", f: N, h: "You’re growing your team", t: "Add people and properties without everything depending on you." },
];

export const benefits = [
  { h: "You stop starting over", t: "A VA leaving doesn’t mean losing months of knowledge." },
  { h: "You save your time", t: "New team members learn by themselves first." },
  { h: "Consistency", t: "The same standard on every booking, whoever is on shift." },
  { h: "Your way, written down", t: "House rules, tone, pricing limits and preferences stay intact." },
  { h: "Fewer mistakes", t: "Clear steps and escalation rules catch problems early." },
  { h: "Easier to grow", t: "Documented systems are easier to scale, delegate and hand over." },
];

export const folders = [
  { t: "Guest comms", d: "Every message from enquiry to review, with templates and response standards.", items: ["Enquiries and booking confirmation", "Pre-arrival and check-in day", "During the stay and check-out", "Complaints and difficult guests"], c: CO, f: N },
  { t: "Bookings & vetting", d: "How to review requests and handle special enquiries.", items: ["Reviewing booking requests", "Guest vetting", "Long-stay and contractor enquiries", "Cancellations and changes"], c: "#E8B4B4", f: N },
  { t: "Pricing", d: "Human-led pricing on top of your tools.", items: ["Weekly competitor check", "Monthly revenue target", "Overrides and events", "When to ask the host"], c: "#C9A227", f: N },
  { t: "Cleaning", d: "Turnovers that are booked, confirmed and evidenced.", items: ["Scheduling turnovers", "Before/after photos and videos", "Back-to-backs and backup cleaners", "Spot checks"], c: SG, f: W },
  { t: "Laundry & maintenance", d: "Linen, issues and trades, handled step by step.", items: ["Linen orders", "Reporting issues", "Getting quotes and booking trades", "Emergencies"], c: "#9DB8C9", f: N },
  { t: "Reviews", d: "Asking for and replying to reviews the right way.", items: ["Reading the stay", "Asking for reviews", "Replying to good and bad reviews"], c: "#8A6FB0", f: W },
  { t: "Listings", d: "Keeping listings accurate and fresh.", items: ["Updating photos and descriptions", "Seasonal changes", "House rules"], c: "#D9A066", f: N },
  { t: "Finance", d: "Monthly numbers per property.", items: ["Monthly report per property", "Logging expenses", "Checking payouts"], c: "#6B9A6B", f: W },
  { t: "Emergencies", d: "What counts as urgent, and who to call.", items: ["Urgent vs non-urgent", "Who to call", "Out-of-hours plan"], c: "#B8383A", f: W },
  { t: "Tools & access", d: "Your systems, and who can do what.", items: ["Channel manager and inbox", "Shared drive", "Password manager and permission levels", "Offboarding checklist"], c: N, f: W },
  { t: "New property", d: "Everything needed to go live.", items: ["Property profile", "Access details", "Local suppliers", "First-listing checklist"], c: "#7C8C99", f: W },
  { t: "Daily routines", d: "The rhythm that keeps everything on track.", items: ["Opening checklist", "Handover notes", "Weekly review"], c: "#D7CDBB", f: N },
];

export const parts = [
  { t: "Purpose", d: "Why the task matters" },
  { t: "When and who", d: "Trigger, timing, owner" },
  { t: "Tools", d: "Which systems are used" },
  { t: "Step by step", d: "Numbered steps, screenshots, recordings" },
  { t: "Templates", d: "Ready-to-use messages and checklists" },
  { t: "Escalation", d: "When to stop and ask the host" },
  { t: "Quality check", d: "How to know it was done right" },
  { t: "Version and date", d: "So everyone uses the latest one" },
];

/** Skeleton line sizes [height, width] for each anatomy block. */
export const blockLines: [string, string][][] = [
  [["18px", "55%"]],
  [["10px", "30%"], ["10px", "30%"]],
  [["10px", "45%"]],
  [["10px", "90%"], ["10px", "80%"], ["10px", "85%"]],
  [["26px", "100%"]],
  [["14px", "70%"]],
  [["10px", "60%"]],
  [["8px", "25%"]],
];

export const options = [
  { k: "READY-MADE", t: "SOP library", d: "Our ready-made SOPs, used to train our own team.", b: "hosts who want a proven starting point", price: prices.sopOneOff, flow: "How you get the library", steps: [0, 4] },
  { k: "MOST POPULAR", t: "Tailored SOPs", d: "The library adapted to your properties, tools, rules and tone.", b: "most hosts with a VA or planning to hire", price: prices.sopTailored, flow: "How we tailor your SOPs", steps: [0, 2, 3, 4, 5] },
  { k: "CUSTOM", t: "Built from scratch", d: "We learn how you work and document your whole business.", b: "larger operators, SA businesses, unusual set-ups", price: prices.sopCustom, flow: "How we build your SOPs from scratch", steps: [0, 1, 2, 3, 4, 5] },
];

export const flow = [
  { t: "Discovery call", d: "How you run things, your tools and what’s different." },
  { t: "Walk-throughs", d: "You or your VA show key tasks on screen; we record with permission." },
  { t: "Draft", d: "We write the SOPs with templates and escalation rules." },
  { t: "Your review", d: "You correct anything that isn’t how you do it." },
  { t: "Final set", d: "Delivered in [Google Docs / Notion / PDF], by area." },
  { t: "Handover", d: "Optional session walking your VA through it." },
];

export const trainingWeeks = [
  { t: "Learn", d: "Read the SOPs, watch the recordings and shadow live tasks. No guest-facing work alone yet.", v: [10, 5, 0, 15, 20] },
  { t: "Practise", d: "Do tasks with checks: you or a senior VA review before anything goes out.", v: [45, 35, 25, 40, 50] },
  { t: "Own it", d: "Handle routine tasks independently, with spot-checks and daily handover notes.", v: [80, 70, 55, 75, 80] },
  { t: "Run it", d: "Full routine, a weekly review, and update the SOPs whenever something changes.", v: [95, 90, 75, 90, 95] },
];

export const meterTasks = ["Guest messages", "Cleaning coordination", "Pricing changes", "Reviews", "Daily routines"];

export const access = [
  { no: "Passwords in SOPs", h: "Use a password manager", t: "Share access by role. Never write passwords into a document." },
  { no: "Full access for everyone", h: "Use platform permissions", t: "Airbnb lets you add co-hosts with different permission levels." },
  { no: "No data agreement", h: "Put it in writing", t: "Under UK GDPR, anyone handling guest data for you needs a written contract." },
  { no: "Access left open", h: "Offboard properly", t: "Remove access the day someone leaves. It’s in the checklist." },
];

export const honest = [
  { b: "SOPs speed up training, but don’t replace it.", t: "A new VA still needs supervision and feedback in the first weeks." },
  { b: "SOPs need updating.", t: "When your tools, rules or properties change, update the SOP. We can do it for you." },
  { b: "Yours to use in your business.", t: "[Confirm terms: custom SOPs owned by you; library licensed for your own business, not resale.]" },
];

export const priceRows = [
  { t: "SOP library", v: `from ${showPrice(prices.sopOneOff)}`, dark: false },
  { t: "Tailored SOPs", v: `from ${showPrice(prices.sopTailored)}`, dark: true },
  { t: "Built from scratch", v: `from ${showPrice(prices.sopCustom)}`, dark: false },
];

export const faq: FaqEntry[] = [
  { q: "What is an SOP for an Airbnb business?", a: "A written, step-by-step guide to how a task is done, like check-in day or booking a cleaner, so anyone on your team can do it the same way." },
  { q: "Are these the SOPs you use for your own VAs?", a: "Yes. The library is built from the SOPs we use to train our own team." },
  { q: "Can you customise SOPs to how I run my properties?", a: "Yes. We tailor the library to your properties, tools, rules and tone, or build your SOPs from scratch." },
  { q: "Can I share the SOPs with my VA?", a: "Yes. They’re made to be shared with your in-house VA, current VA or a new hire." },
  { q: "How long does it take to train a VA with SOPs?", a: "It depends on the person and your business. Our suggested plan is four weeks from learning to working independently, with checks along the way." },
  { q: "Do SOPs replace training?", a: "No. They make training faster and more consistent, but new team members still need supervision and feedback at first." },
  { q: "What format are the SOPs in?", a: "[Google Docs / Notion / PDF], organised by area, with templates and screen recordings where useful." },
  { q: "Do you update SOPs when my business changes?", a: "Yes, with an optional update plan." },
];

export const related = [
  { label: "Co-hosting", href: anchors.service("cohost") },
  { label: "Guest message templates", href: anchors.tool("guest-message-generator") },
  { label: "Free checklists", href: anchors.rulesChecklist },
  { label: "Guest communication", href: anchors.service("guest") },
  { label: "Pricing optimisation", href: anchors.service("pricing") },
];

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["va-change", "When your VA changes"],
  ["who", "Who it’s for"],
  ["library", "SOP library"],
  ["anatomy", "Anatomy of an SOP"],
  ["options", "Options"],
  ["training", "Training plan"],
  ["access", "Safe access"],
  ["price", "Price"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "SOPs your VA can follow from day one.",
  label: "Book a call",
  href: "#price",
};
