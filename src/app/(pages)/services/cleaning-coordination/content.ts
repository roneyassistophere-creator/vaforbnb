import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy for /services/cleaning-coordination. */

export const status = [
  { t: "Scheduled", d: "Added when the booking came in", time: "2 Nov", done: true },
  { t: "Cleaner confirmed", d: "Access and notes checked", time: "Yesterday", done: true },
  { t: "Reminder sent", d: "Times and special tasks", time: "08:30", done: true },
  { t: "Before photos received", d: "18 photos, 1 video", time: "11:12", done: true },
  { t: "After photos received", d: "24 photos, 2 videos", time: "14:42", done: true },
  { t: "Checked and ready", d: "Check-in details sent to guest", time: "14:55", done: false },
];

/** [basic forwarding, VA for BnB] */
export const comparePairs: [string, string][] = [
  ["Sends the cleaner a list of check-outs", "Schedules each turnover, confirms 24 hours before, reminds on the day"],
  ["Hopes the clean happened", "Gets timestamped before and after photos and videos, every turnover"],
  ["Finds problems in a guest review", "Checks the photos before check-in and fixes issues first"],
  ["Scrambles when a cleaner cancels", "Has a backup cleaner list ready for your area"],
  ["Notices empty coffee jars after a complaint", "Tracks supplies through the cleaner’s report and restocks"],
  ["Has nothing to show Airbnb in a dispute", "Sends dated evidence, filed by booking, within minutes"],
];

export const facts = [
  { n: "62%", t: "of UK adults wouldn’t book a property that looks dirty or outdated in photos or reviews.", m: "One “not clean” review can cost future bookings.", s: "YouGov, July 2025, 2,108 UK adults" },
  { n: "8%", t: "have cancelled or left a stay after finding signs of previous guests, like used towels.", m: "A missed bed change can lose the whole booking.", s: "YouGov, July 2025" },
  { n: "72h", t: "Airbnb gives guests 72 hours from discovery to report an issue, and tells them to take photos.", m: "Guests gather evidence. You need yours too.", s: "Airbnb Help, article 2993" },
  { n: "14 days", t: "to file an AirCover damage request after check-out, with photos or videos and receipts.", m: "Without before photos, a claim is hard to prove.", s: "Airbnb Help, article 279" },
];

export const track = [
  { w: "Booking in", t: "Turnover added; cleaner told the date, window and guest count", hot: false },
  { w: "Any change", t: "Early check-in, late check-out, cancellations passed on at once", hot: false },
  { w: "24 hours before", t: "Cleaner confirmed, access checked, notes passed on", hot: false },
  { w: "Morning of", t: "Reminder with times and special tasks", hot: false },
  { w: "On arrival", t: "“Before” photos and a walk-through video", hot: true },
  { w: "During", t: "We follow up if we haven’t heard by the agreed time", hot: false },
  { w: "Finished", t: "“After” photos and videos, low supplies, damage, repairs", hot: true },
  { w: "Before check-in", t: "Photos checked against the checklist; fixes asked for; marked ready", hot: false },
  { w: "After check-in", t: "Evidence filed by date and booking; issues passed on", hot: false },
];

export const shotLists = {
  before: [
    { a: "Kitchen", t: "Worktops, sink, hob, inside the oven and fridge, bins" },
    { a: "Bathrooms", t: "Overall condition, towels used, any damage" },
    { a: "Bedrooms", t: "Beds as left, stains, damage" },
    { a: "Living areas", t: "Furniture, carpets, walls, any damage" },
    { a: "Whole property", t: "Walk-through video of every room" },
    { a: "Anything unusual", t: "Close-ups of damage, stains, missing items" },
  ],
  after: [
    { a: "Kitchen", t: "Inside oven, microwave and fridge; hob; sink; worktops; stocked supplies" },
    { a: "Bathrooms", t: "Toilet, shower or bath, plughole, mirror, fresh towels and toiletries" },
    { a: "Bedrooms", t: "Made beds, under the beds, wardrobe and drawers" },
    { a: "Living areas", t: "Sofa and cushions, floors, remotes, surfaces" },
    { a: "Whole property", t: "Walk-through video of every room" },
    { a: "Anything unusual", t: "Close-ups of anything reported or repaired" },
  ],
  stamps: { before: "16/11 11:12", after: "16/11 14:42" },
};

export const tiles = [
  { l: "Oven", bg: "#D9DEE3" },
  { l: "Fridge", bg: "#E4E8EC" },
  { l: "Hob", bg: "#CFD6DC" },
  { l: "Bathroom", bg: "#DDE3E8" },
  { l: "Bedroom", bg: "#E8E2D8" },
  { l: "Living room", bg: "#D6DDE2" },
];

export const proofRules = [
  { h: "Timestamped", t: "Date and time visible, or the original file data kept." },
  { h: "Original files", t: "Messaging apps can compress photos and strip date and location data, so cleaners upload originals to a shared folder." },
  { h: "Organised", t: "Filed by date, property and booking reference: found in seconds." },
  { h: "Kept", t: "Stored for [60 days] after check-out, longer if an issue is open." },
];

export const cases = [
  { if: "A guest says the fridge or oven was dirty", we: "reply kindly with the timestamped “after” photos and offer to fix anything still wrong.", why: "Most complaints settle before they become a refund request or a review." },
  { if: "A guest asks Airbnb for a cleanliness refund", we: "give you, or Airbnb, the dated photos and videos from that turnover.", why: "Shows the property was cleaned before they arrived." },
  { if: "A guest leaves damage or extra mess", we: "pull the “before” photos, plus quotes or receipts, within the 14-day window.", why: "Gives you the evidence AirCover asks for." },
  { if: "Something is missing", we: "compare the before photos with your inventory photos.", why: "Shows what was there, and when." },
  { if: "A cleaner is blamed unfairly", we: "show the after photos and walk-through video.", why: "Protects a good cleaner from a wrong accusation." },
];

export const fair = [
  "Agree it with cleaners upfront, so it never feels like an ambush",
  "Keep it short, friendly and occasional",
  "Use it to improve the checklist, not to catch people out",
  "Thank cleaners when the spot is perfect",
];

export const stock = [
  { n: "Toilet roll", w: "80%", low: false, st: "OK" },
  { n: "Coffee", w: "18%", low: true, st: "LOW" },
  { n: "Tea", w: "60%", low: false, st: "OK" },
  { n: "Sugar", w: "45%", low: false, st: "OK" },
  { n: "Hand soap", w: "22%", low: true, st: "LOW" },
  { n: "Dishwasher tabs", w: "70%", low: false, st: "OK" },
  { n: "Bin bags", w: "55%", low: false, st: "OK" },
  { n: "Spare linen sets", w: "100%", low: false, st: "2 SETS" },
];

export const stockCats = [
  { h: "Kitchen", t: "Tea, coffee, sugar, milk, oil, sponges, bin bags" },
  { h: "Bathroom", t: "Toilet roll, soap, shampoo, body wash" },
  { h: "Cleaning", t: "Sprays, cloths, mop heads, vacuum bags" },
  { h: "Laundry", t: "Linen, towels, detergent, wear" },
  { h: "Small items", t: "Bulbs, remote batteries, kitchen roll" },
];

export const backup = [
  { h: "Back-to-back turnovers:", t: "the cleaner gets the exact window and we follow up through it." },
  { h: "Early check-in or late check-out:", t: "checked against the cleaning schedule before anyone says yes." },
  { h: "Last-minute bookings:", t: "the cleaner is told at once, and we confirm they can do it." },
  { h: "A cleaner cancels or is ill:", t: "we contact your backup list straight away and keep you updated." },
  { h: "No backup yet?", t: "We help you build one: [two or three local cleaners per area, briefed on your checklist]." },
];

export const log = [
  { t: "07:40", d: "Cleaner messages: unwell, can’t make the 11:00 turnover", c: "#F0595A" },
  { t: "07:45", d: "Backup cleaner contacted with the window and access notes", c: "#14212B" },
  { t: "08:10", d: "Backup confirmed for 11:15", c: "#14212B" },
  { t: "08:12", d: "Host updated; checklist and photo routine sent to backup", c: "#14212B" },
  { t: "14:50", d: "After photos checked; property ready for 15:00 check-in", c: "#1F6B45" },
];

export const quad = [
  { h: "Guests", t: "A clean, stocked home that matches the photos, ready on time.", bg: "#14212B", fg: "#FFFFFF" },
  { h: "Cleaners", t: "Schedules in advance, realistic windows, one checklist, quick answers, and photos that protect them from unfair blame.", bg: "#FDECEC", fg: "#14212B" },
  { h: "Hosts", t: "Proof of every clean, early warning of problems, fewer surprises in reviews.", bg: "#F7F3EC", fg: "#14212B" },
  { h: "Your VA", t: "Clear standards to check against, so feedback is about the checklist, never personal.", bg: "#EDF1F4", fg: "#14212B" },
];

export const missed = [
  "Inside the oven, microwave and fridge, including door seals",
  "Under beds and sofas, and behind doors",
  "Plugholes, shower screens, base of the toilet",
  "Inside drawers and wardrobes",
  "Skirting boards, light switches, door handles",
  "Outdoor entrances, bins and patios",
  "Smells: fresh air, not heavy air freshener",
];

export const docLines = [
  "Strip beds, start laundry",
  "Kitchen: inside oven and fridge",
  "Bathroom: plughole and toilet base",
  "Restock: tea, coffee, toiletries",
  "Upload before and after photos",
];

export const steps = [
  { n: "01", h: "Onboarding call", t: "Your properties, cleaners, standards and supplies." },
  { n: "02", h: "Set up", t: "Schedule, checklist, photo folder, supply levels, backup contacts." },
  { n: "03", h: "Brief your cleaners", t: "We introduce ourselves and explain the photo routine." },
  { n: "04", h: "Run every turnover", t: "Schedule, confirm, remind, follow up, check, file." },
  { n: "05", h: "Monthly summary", t: "Turnovers, issues found, supplies bought, improvements." },
];

export const honest = [
  { b: "Quality depends on your cleaners.", t: "We coordinate, check and give feedback; we don’t clean ourselves." },
  { b: "Our team works 8am–8pm UK, Mon–Sat.", t: "Sunday turnovers are confirmed in advance; photos checked first thing Monday." },
  { b: "Evidence helps; it doesn’t decide.", t: "Airbnb makes the final call on refunds and claims." },
  { b: "You pay cleaners directly,", t: "at the rates you agree with them." },
];

export const proof = [
  { v: "[X]", k: "Turnovers coordinated last quarter", e: "Schedule export, dated" },
  { v: "[X]%", k: "Turnovers with full before and after photos", e: "Photo folder screenshot" },
  { v: "[X.X]", k: "Cleanliness rating across client listings", e: "Airbnb category screenshot" },
  { v: "[X] / [X]", k: "Cancellations covered by a backup", e: "Log, dated" },
];

export const packageCta = {
  title: `Cleaning coordination from ${showPrice(prices.run)} a month`,
  text: "With guest communication, pricing, listing optimisation and review management. Cleaners’ fees and supplies are paid by you, separately.",
};

export const faq: FaqEntry[] = [
  { q: "How do I manage Airbnb cleaners remotely?", a: "One schedule linked to your bookings, a confirmation the day before, before and after photos every time, and a backup cleaner list. That’s what our team runs for you each day." },
  { q: "What if a guest says my Airbnb wasn’t clean?", a: "Reply quickly and politely, offer to fix it, keep it on the platform, and send timestamped photos from the clean. Airbnb tells guests to message the host first and gives them 72 hours to report an issue." },
  { q: "How long do I have to make an Airbnb damage claim?", a: "Airbnb asks hosts to file a reimbursement request within 14 days of the guest’s check-out, with photos or videos and estimates or receipts." },
  { q: "Should my cleaner take photos after every clean?", a: "Yes. Before photos record how the guest left it; after photos record how the next guest found it. Both matter in disputes." },
  { q: "What if my cleaner cancels at the last minute?", a: "We contact your backup cleaners straight away and keep you updated. No backups yet? We help you set them up." },
  { q: "Do you provide the cleaners?", a: "[We coordinate your existing cleaners, and can help you find and brief local cleaners if needed.] You pay cleaners directly." },
  { q: "How do you check the cleaning is good enough?", a: "Every photo set is checked against the checklist before check-in, and we can do random video spot checks on cleaning days." },
  { q: "What supplies should an Airbnb always have?", a: "Toilet roll, soap, shampoo, body wash, tea, coffee, sugar, washing-up liquid, sponges, bin bags, spare linen and towels, and cleaning materials." },
  { q: "Is the cleaning checklist really free?", a: "Yes. Download it from our free resources, with no obligation." },
];

export const sources =
  "YouGov, Top booking factors for UK travellers (July 2025) · Airbnb Help, place not clean at check-in (article 2993) · Airbnb Help, damage reimbursement (article 279) · Airbnb Resource Centre, 5-step cleaning process · Timemark, cleaning disputes guide.";

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["compare", "Why coordination"],
  ["facts", "Why turnovers matter"],
  ["turnover", "Booking to check-in"],
  ["photo-standard", "Photo standard"],
  ["evidence", "When things go wrong"],
  ["spot-checks", "Video spot checks"],
  ["restocking", "Restocking"],
  ["backup", "Backup cleaners"],
  ["fair", "Fair for everyone"],
  ["checklist", "Cleaning checklist"],
  ["maintenance", "Maintenance issues"],
  ["process", "How it works"],
  ["proof", "Proof"],
  ["call", "Run package"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "Every turnover tracked, checked and photographed.",
  label: "Free cleaning checklist",
  href: "#checklist",
};
