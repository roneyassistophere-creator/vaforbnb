import { toolById, toolLink } from "@/content/tools/catalog";
import { anchors } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";
import type { RelatedLink } from "@/components/service/ServiceBlocks";

/** All copy for /services/listing-optimisation. */

export const keyPoints = [
  "Airbnb has launched AI search in the US. Guests search “using your own words or voice”. No UK date yet.",
  "Guests describe needs (“quiet”, “near the station”, “a desk”), not just a city and dates.",
  "AI can only match, summarise and compare what your listing actually says and shows.",
  "The fix: specific, consistent facts. Every true amenity, every room captioned, minutes to named places.",
  "Price, photos, reviews and responsiveness still matter. AI readiness is a new layer on top.",
];

export const facts = [
  { n: "< 50", t: "characters: Airbnb’s recommended title length" },
  { n: "5", t: "photos make up the top of your listing page" },
  { n: "500", t: "characters in the main description" },
  { n: "10%+", t: "discounts at this level are shown in search" },
];

export const launched = [
  { k: "AI SEARCH", h: "Search in your own words or by voice", t: "Guests describe needs. Your listing must clearly contain the answers.", violet: true },
  { k: "AI FILTERS", h: "Keywords surface related filters", t: "Airbnb’s example: “baby” brings up cribs and toys. Unticked amenities can hide you.", violet: false },
  { k: "AI DESCRIPTIONS", h: "Results highlight key features", t: "Guests may see an AI summary first. It can only highlight what it can find.", violet: true },
  { k: "AI COMPARISON", h: "Saved homes, side by side", t: "You’re judged next to competitors on facts: beds, desk, parking, distances.", violet: false },
  { k: "AI HOST TOOLS", h: "Price ranges and earnings insights", t: "Announced for later in 2026. Useful, but still needs a human check.", violet: true },
];

type Ev = [string, string][];
export const needs: { t: string; short: string; q: string; title: string; vague: Ev; ready: Ev }[] = [
  { t: "Quiet", short: "quiet", q: "a quiet place to sleep well", title: "Top-floor flat near the canal", vague: [["Amenities", "nothing relevant"], ["Photo caption", "none"], ["Description", "“peaceful flat” (no reason given)"]], ready: [["Description", "top floor, double glazing, bedroom at the back"], ["House rules", "quiet hours 10pm–8am"], ["Photo caption", "“Bedroom with blackout blinds, faces the courtyard”"]] },
  { t: "15 min from the station", short: "near the station", q: "15 minutes from the station", title: "Two-bed flat in the city centre", vague: [["Description", "“close to transport”"], ["Neighbourhood", "no named places"], ["Photo caption", "none"]], ready: [["Description", "“12-minute walk (0.6 miles) to [Station name]”"], ["Neighbourhood", "station, supermarket and hospital with minutes"], ["Photo caption", "“Street view: 2 minutes to the bus stop”"]] },
  { t: "A desk for work", short: "a desk", q: "quiet flat for a work trip with a proper desk", title: "Bright flat with a workspace", vague: [["Amenities", "dedicated workspace not ticked"], ["Photo caption", "desk visible, no caption"], ["Description", "“laptop friendly”"]], ready: [["Amenities", "dedicated workspace ticked"], ["Photo caption", "“Desk 120 cm, ergonomic chair, 300 Mbps Wi-Fi”"], ["Description", "Wi-Fi speed test photo mentioned"]] },
  { t: "Dog + garden", short: "dog friendly with a garden", q: "dog friendly with an enclosed garden", title: "Cottage with a garden", vague: [["Amenities", "pets allowed not ticked"], ["Photo caption", "garden photo, no detail"], ["Description", "“pets welcome”"]], ready: [["Amenities", "pets allowed ticked"], ["Photo caption", "“Fully enclosed garden, 1.5 m fence”"], ["Description", "nearest dog walk named, 3 minutes away"]] },
  { t: "Van parking", short: "van parking", q: "parking for two work vans", title: "Three-bed house", vague: [["Amenities", "free parking ticked"], ["Photo caption", "none"], ["Description", "“parking available”"]], ready: [["Amenities", "free parking ticked"], ["Photo caption", "“Driveway fits 2 vans, no height barrier”"], ["Description", "parking photo and space size stated"]] },
  { t: "Travelling with a baby", short: "baby-friendly", q: "somewhere with a cot and high chair for our baby", title: "Family flat by the park", vague: [["Amenities", "cot and high chair not ticked"], ["Photo caption", "none"], ["Description", "“family friendly”"]], ready: [["Amenities", "cot, high chair and stair gate ticked"], ["Photo caption", "“Travel cot set up in the main bedroom”"], ["Description", "park and playground with walking minutes"]] },
  { t: "Step-free", short: "step-free access", q: "step-free entrance and walk-in shower", title: "Ground-floor apartment", vague: [["Accessibility", "features not ticked"], ["Photo caption", "none"], ["Description", "“accessible”"]], ready: [["Accessibility", "step-free entrance and shower ticked"], ["Photo caption", "“Level entrance, 90 cm doorway”"], ["Description", "door widths and shower type stated"]] },
  { t: "For contractors", short: "contractor-ready", q: "house for 4 workers with laundry and parking for a month", title: "Four-bed house near the ring road", vague: [["Description", "“ideal for workers”"], ["Bed list", "unclear"], ["Amenities", "washer not ticked"]], ready: [["Bed list", "4 single beds in 3 rooms"], ["Amenities", "washer, dryer and free parking ticked"], ["Description", "invoices available, monthly discount on"]] },
];

export const oldNew = [
  { k: "The search", a: "Manchester · 12–15 March · 2 guests", b: "“A quiet flat for a work trip, 15 minutes from the station, with a proper desk”" },
  { k: "Who appears", a: "Location, dates, guests, price, ticked filters", b: "Those, plus how well your facts match what the guest described" },
  { k: "What guests see", a: "Photo, title, price, rating", b: "All of that, plus an AI summary of key features" },
  { k: "How guests compare", a: "Opening tabs one by one", b: "An AI side-by-side comparison of saved homes" },
];

export const struggle = [
  { b: "Vague words.", t: "“Cosy”, “close to everything” and “great location” give AI nothing to match." },
  { b: "Missing amenities.", t: "If “dedicated workspace” isn’t ticked, a guest asking for a desk may never see you." },
  { b: "Unlabelled photos.", t: "A desk in a photo with no caption is easy to miss." },
  { b: "Contradictions.", t: "“Sleeps 6” in the title and beds for 4 confuse guests and any summary built from them." },
  { b: "Overselling.", t: "Side-by-side comparisons expose exaggeration fast, and accuracy ratings suffer." },
];

export const rules8 = [
  { h: "Facts beat adjectives", t: "“28 m² living room”, “300 Mbps”, “6-minute walk to the beach”." },
  { h: "Tick every true amenity", t: "And none that aren’t. Words become filters; filters decide who appears." },
  { h: "Caption every room", t: "Bed size, desk, view, parking. Fix wrong room assignments in the photo tour." },
  { h: "Explain the “why”", t: "Guests ask for “quiet” or “bright”. Give the evidence: double glazing, south-facing." },
  { h: "Named places, real minutes", t: "Stations, hospitals, stadiums, offices, beaches: “[Place], 10 minutes on foot”." },
  { h: "Keep everything consistent", t: "Title, description, beds, amenities, house rules and photos tell one story." },
  { h: "Be honest about downsides", t: "Stairs, street noise, no lift. Comparisons expose surprises." },
  { h: "Deliver what you describe", t: "Reviews that confirm your listing build trust and protect your quality score." },
];

export const readinessChecks = [
  "Every true amenity ticked",
  "Every room photographed and captioned",
  "Exact bed sizes and sleeping arrangements",
  "Wi-Fi speed stated in Mbps",
  "Minutes to 3 to 5 named places",
  "Who it’s ideal for, stated plainly",
  "Honest notes on stairs, noise, parking limits",
  "Title, description, amenities and photos consistent",
  "Accessibility details accurate",
  "Clear house rules (pets, quiet hours, check-in)",
];

export const included = [
  { n: "AI", h: "AI search readiness", t: "Amenities, captions, facts and consistency checked so AI search can match, summarise and compare you accurately." },
  { n: "01", h: "Audit and diagnosis", t: "A scored review of your listing and Airbnb performance data, to find where guests drop off." },
  { n: "02", h: "Competitor analysis", t: "8 to 12 comparable listings near you: price, photos, title, amenities, reviews, settings." },
  { n: "03", h: "Photos", t: "Cover choice, photo order, photo tour rooms and captions, plus a re-shoot list if needed." },
  { n: "04", h: "Title and description", t: "Rewritten for search and conversion, in your voice." },
  { n: "05", h: "Amenities", t: "A full check, so you appear in every search filter you qualify for." },
  { n: "06", h: "Longer stays", t: "Weekly and monthly discounts, and copy for contractors, relocations and remote workers." },
  { n: "07", h: "Seasonal and event updates", t: "Cover, title and description changes for Christmas, race days, festivals and concerts." },
  { n: "08", h: "Other platforms", t: "Consistent listings on Booking.com, Vrbo and more, through your channel manager." },
  { n: "09", h: "Ongoing checks", t: "Monthly performance and competitor reviews, with every change logged and measured." },
];

export const toc = [
  { href: "#ai", label: "AI search" },
  { href: "#diagnose", label: "Diagnose" },
  { href: "#ranking", label: "Ranking" },
  { href: "#photos", label: "Photos" },
  { href: "#title", label: "Title" },
  { href: "#description", label: "Description" },
  { href: "#amenities", label: "Amenities" },
  { href: "#longstays", label: "Longer stays" },
  { href: "#events", label: "Events" },
  { href: "#platforms", label: "Other platforms" },
  { href: "#faq", label: "FAQ" },
];

export const funnel = [
  { w: "100%", h: "First-page impressions", t: "How often guests see you on the first page of search.", fix: "price for your dates, availability, Instant Book, booking restrictions, reviews." },
  { w: "47%", h: "Search to listing", t: "How many of those guests click through to your listing.", fix: "cover photo, title, price shown in search, rating and badges." },
  { w: "6%", h: "Listing to booking", t: "How many visitors to your listing go on to book.", fix: "photo order, description, amenities, reviews, house rules, minimum stay." },
];

export const ranking = [
  { f: "Price", o: "Total price checks against comparable listings" },
  { f: "Quality", o: "Photos, captions, description, amenities, reviews" },
  { f: "Popularity", o: "Cover photo and title that win the click and the save" },
  { f: "Availability", o: "Calendar open far enough ahead, fewer blocked dates" },
  { f: "Responsiveness", o: "Fast replies through our guest communication service" },
  { f: "Instant Book and restrictions", o: "Minimum stay and gap-night rules that don’t block bookings" },
  { f: "Hospitality and Superhost", o: "Accuracy, check-in clarity and review management" },
];

export const topFive = [
  { n: 2, t: "Living space", r: "6px" },
  { n: 3, t: "Main bedroom", r: "6px 16px 6px 6px" },
  { n: 4, t: "Kitchen", r: "6px" },
  { n: 5, t: "Second selling point", r: "6px 6px 16px 6px" },
];

export const cover = [
  { b: "Your strongest selling point,", t: "not just the nicest room: a hot tub, a view, a garden, a fireplace." },
  { b: "Bright, wide, uncluttered:", t: "daylight with lights on, landscape, straight vertical lines." },
  { b: "Readable on a phone:", t: "one clear subject beats a busy scene." },
  { b: "Tested:", t: "swap it and compare search-to-listing conversion after 2 to 3 weeks." },
];

export const photoTour = [
  "At least one photo per room, so every room appears in the tour. Check Airbnb’s AI room sorting by hand.",
  "A caption for every room, in the words guests filter for: “King bed, blackout blinds”.",
  "Minimum 1024 × 683 pixels. Bigger is better.",
  "Photograph the entrance and key safe, parking, workspace and washing machine.",
  "Accessibility photos: step-free entrance, door widths, shower access.",
];

export const photoMistakes = [
  "Dark or yellow evening photos",
  "Fisheye lenses that make rooms look bigger",
  "Clutter: toiletries, cables, bins, personal photos",
  "Shots from the doorway at head height",
  "No photos of the bathroom or kitchen",
  "Logos, phone numbers or websites in photos",
];

export const titles = [
  { weak: "Lovely 2 Bed Flat in Manchester", good: "Canal-view flat · free parking · fast Wi-Fi", len: "42", why: "Leads with the view; city already shows in search." },
  { weak: "Cosy Cottage!!!", good: "Hot tub cottage, dog friendly, near the beach", len: "44", why: "Three reasons to click; no repeated punctuation." },
  { weak: "3 Bedroom House Near City Centre", good: "Contractor-ready 3-bed · parking for 3 vans", len: "43", why: "Speaks to a high-value long-stay audience." },
  { weak: "Studio Apartment", good: "Quiet studio with desk, 5 min to the station", len: "44", why: "Answers a remote worker’s two questions." },
];

export const descSteps = [
  { b: "A hook:", t: "the single best thing about staying here." },
  { b: "Who it’s for:", t: "couples, families with a dog, contractors." },
  { b: "Three features with numbers:", t: "king bed, 300 Mbps Wi-Fi, parking for two." },
  { b: "Location in minutes:", t: "4-minute walk to the station." },
  { b: "A friendly close:", t: "invite them to book." },
];

export const amenities = [
  { h: "Pool", t: "Rare in the UK: make it your cover" },
  { h: "Free parking", t: "Say how many cars or vans fit" },
  { h: "Wi-Fi", t: "Put the Mbps in a caption" },
  { h: "Heating or AC", t: "Tick heating; mention fans in summer" },
  { h: "Kitchen", t: "List the key equipment" },
  { h: "Hot tub", t: "A major draw for rural lets" },
  { h: "Washer or dryer", t: "Essential for longer stays" },
  { h: "Self check-in", t: "Show the key safe or smart lock" },
  { h: "TV", t: "Mention streaming apps" },
  { h: "BBQ grill", t: "A summer cover candidate" },
];

export const guestFavourite = [
  "Overall ratings, review feedback and guest-host communication",
  "Category ratings: check-in, cleanliness, accuracy, communication, location, value",
  "Cancellation rate and the rate of removed reviews",
  "Quality incidents reported to Airbnb",
  "At least 5 reviews in 4 years, with 1 in the past 2 years",
];

export const longStayGuests = [
  { h: "Contractors and crews", want: "Van parking, separate beds, a washing machine, flexible check-in.", show: "“Contractor-ready” title, parking photo, bed list." },
  { h: "Relocations and insurance moves", want: "Full kitchen, laundry, family and pet space, monthly price.", show: "Monthly discount, pets considered, storage." },
  { h: "Remote workers", want: "A real desk, fast Wi-Fi, quiet, natural light.", show: "Desk photo, speed test screenshot, noise notes." },
  { h: "NHS and visiting professionals", want: "Near the hospital or office, easy parking, quiet.", show: "Minutes to the hospital, parking details." },
];

export const events = [
  { m: "FEB – MAR", ev: "Six Nations rugby; Cheltenham Festival", up: "Title: minutes to the stadium or racecourse" },
  { m: "APRIL", ev: "Easter holidays; Grand National at Aintree", up: "Family features; racecourse distance" },
  { m: "MAY – JUNE", ev: "Bank holidays; Royal Ascot; Glastonbury years", up: "Garden photos; “near [venue]”" },
  { m: "JULY", ev: "Wimbledon; British Grand Prix at Silverstone", up: "Family and parking features" },
  { m: "AUGUST", ev: "Edinburgh Fringe; Notting Hill Carnival", up: "Summer cover; walking times to venues" },
  { m: "SEP – OCT", ev: "University move-in; half term; conferences", up: "Workspace and parking; mid-week stays" },
  { m: "NOV – DEC", ev: "Christmas markets; Christmas and New Year’s Eve", up: "Cosy winter cover; festive first line" },
  { m: "ALL YEAR", ev: "Stadium concerts, football, local festivals", up: "Event phrase in the title for those dates" },
];

export const competitorChecks = [
  { w: "Total price, same dates", s: "Is price holding you back?" },
  { w: "Cover and first five photos", s: "Who wins the click, and why" },
  { w: "Title and opening line", s: "Which selling points they lead with" },
  { w: "Amenities ticked", s: "Filters you are missing" },
  { w: "Rating, reviews, badges", s: "How much trust you need to build" },
  { w: "Minimum stay, policy, Instant Book", s: "Settings that make them easier to book" },
  { w: "Long-stay discounts", s: "Are you competitive for weekly and monthly?" },
];

export const platforms = [
  { n: "Booking.com", best: "UK and European reach; business travel", note: "Its own photo and content rules; strong for short city stays." },
  { n: "Vrbo (formerly HomeAway)", best: "Families and whole-home stays", note: "HomeAway became Vrbo in the UK in 2020. Clean photos, no text." },
  { n: "Google Vacation Rentals", best: "Guests searching on Google and Maps", note: "Through supported channel managers and booking sites." },
  { n: "Plum Guide, Kid & Coe", best: "Design-led or family-focused homes", note: "Selective: they vet homes before listing." },
  { n: "Sykes Cottages and agencies", best: "Rural and coastal cottages", note: "Commission and contract terms vary." },
  { n: "SpareRoom and corporate housing", best: "Mid-term stays and rooms", note: "Useful for contractor and relocation demand." },
  { n: "Your direct booking site", best: "Repeat guests, no platform fees", note: "See our direct booking website service." },
];

export const process = [
  { h: "Audit and competitor analysis", t: "We score your listing and compare it with the ones beside it." },
  { h: "Plan", t: "We agree the changes; you approve everything first." },
  { h: "Rewrite and rebuild", t: "Title, description, photo order, captions, amenities, settings." },
  { h: "Photo plan", t: "A shot list, or we coordinate a photographer." },
  { h: "Measure", t: "We track conversion data for 2 to 4 weeks and fine-tune." },
  { h: "Maintain", t: "Event updates, monthly competitor checks, every platform in sync." },
];

export const honest = [
  { b: "No one can guarantee a ranking.", t: "Airbnb weighs many factors, and local demand is outside anyone’s control." },
  { b: "Price still matters most.", t: "Optimisation works best alongside sensible pricing." },
  { b: "Results take weeks, not days.", t: "We judge changes on several weeks of data." },
  { b: "AI search details are still emerging.", t: "Airbnb hasn’t published how AI search ranks listings or when it reaches the UK. We’ll adapt as it does." },
  { b: "Accuracy beats hype.", t: "Overselling a listing leads to lower ratings and fewer bookings." },
];

export const proof = [
  { l: "[2-bed flat, city]", c: "[Cover photo, title, amenities]", b: "[X]%", a: "[X]%" },
  { l: "[Cottage, rural]", c: "[Photo order, monthly discount]", b: "[X]%", a: "[X]%" },
];

export const auditItems = ["AI-readiness score", "Cover photo and order", "Title and description", "Amenities and filters", "Settings and discounts", "Competitor snapshot"];

export const packageCta = {
  title: `Included in the Run package, from ${showPrice(prices.run)} a month`,
  text: `Alongside guest communication, pricing, cleaning coordination and review management. One-off listing rebuild from ${showPrice(prices.listingRebuild)}.`,
};

export const faq: FaqEntry[] = [
  { q: "What is Airbnb AI search?", a: "Announced in Airbnb’s 2026 Fall Update, it lets guests search using their own words or voice. Keywords surface related filters, results include AI-powered descriptions of key features, and guests can compare saved homes side by side." },
  { q: "When is Airbnb AI search coming to the UK?", a: "Airbnb says it’s starting in the US and hasn’t announced a UK date. Preparing your listing now means you’re ready on day one." },
  { q: "How do I optimise my Airbnb listing for AI search?", a: "Use specific facts instead of adjectives, tick every true amenity, caption every room, give minutes to named places, keep every section consistent, and be honest about downsides." },
  { q: "Does AI search replace normal Airbnb ranking?", a: "No. Price, quality, popularity, availability and responsiveness still matter. AI readiness is an extra layer that helps guests understand and match your listing." },
  { q: "Is Airbnb listing optimization for AI different from SEO?", a: "Similar in spirit: clear, accurate, specific information. On Airbnb, that means amenities, captions and descriptions that answer the needs guests describe." },
  { q: "Why is my Airbnb not getting bookings?", a: "Check where guests drop off in Airbnb’s performance data. Few first-page impressions point to price, availability or booking restrictions; low search-to-listing conversion to the cover photo, title or price; low listing-to-booking conversion to photos, description, reviews or settings." },
  { q: "How do I rank higher on Airbnb?", a: "Airbnb says price, quality and popularity have the strongest influence, alongside availability, responsiveness, Instant Book, fewer booking restrictions and ratings." },
  { q: "What should my Airbnb cover photo be?", a: "Your single strongest selling point, bright and wide in landscape, easy to read on a phone. Test it against an alternative over 2 to 3 weeks." },
  { q: "How many photos should an Airbnb listing have?", a: "Enough to show every space a guest uses, with at least one per room for the photo tour. Most well-presented listings use around 20 to 35; quality and order matter more than number." },
  { q: "How long can an Airbnb title be?", a: "Airbnb recommends fewer than 50 characters. Lead with your standout feature and don’t repeat the city or bed count." },
  { q: "Which amenities do guests search for most?", a: "Airbnb’s 2025 list: pool, free parking, Wi-Fi, air conditioning or heating, kitchen, hot tub, washer or dryer, self check-in, TV and BBQ grill." },
  { q: "How do I become a Guest Favourite?", a: "Airbnb looks at overall and category ratings, communication, cancellation rate, removed reviews and quality incidents, with at least 5 reviews in 4 years (1 in the past 2)." },
  { q: "Should I offer weekly or monthly discounts?", a: "Often, yes, especially in quiet months. Weekly covers 7+ nights, monthly 28+, and discounts of 10% or more show in search." },
  { q: "Can I change my cover photo for Christmas or events?", a: "Yes. A real seasonal photo works on every platform. Avoid logos, contact details and links, and switch back afterwards." },
  { q: "Should I list on Booking.com and Vrbo too?", a: "For most UK hosts, yes, with a channel manager keeping calendars in sync. Adapt the listing to each platform rather than copying it." },
  { q: "Is an Airbnb listing audit worth it?", a: "A good audit shows where guests drop off and what to fix first. Ours is free and includes the 3 changes most likely to help." },
];

export const related: (RelatedLink & { t: string })[] = [
  { k: "Service", h: "Pricing optimisation", t: "Price is Airbnb’s strongest ranking factor.", href: anchors.service("pricing") },
  { k: "Service", h: "Guest communication", t: "Fast, accurate replies, 8am–8pm UK, Mon–Sat.", href: anchors.service("guest") },
  { k: "Free template", h: "Automated guest messages", t: "Booking to review, ready to copy.", href: anchors.tool("guest-message-generator") },
  { k: "Free template", h: "House rules template", t: "Clear rules that protect your ratings.", href: toolLink(toolById("house-rules-generator")!) },
];

export const sources = [
  "Airbnb Newsroom, Airbnb 2026 Fall Update (30 September 2026)",
  "Skift, Airbnb launches AI tools (30 September 2026)",
  "Airbnb, How search works on Airbnb (Resource Centre)",
  "Airbnb, How to organise listing photos into a home tour",
  "Airbnb, Guidelines for writing your listing title",
  "Airbnb, The amenities guests want (2025)",
  "Airbnb Help, Guest favourites and highlights",
  "Airbnb Help, Weekly and monthly discounts",
  "Airbnb Help, Understanding performance data for conversion",
  "Uplisting and IntelliHost, Airbnb funnel analysis, May 2026",
  "IntelliHost, Title length study (INS020)",
  "Skift, Tripadvisor vacation rental bookings, September 2024",
  "Short Term Rentalz, Vrbo replaces HomeAway in the UK, October 2020",
];

/** "On this page" sidebar: [section id, label], in page order. */
export const sidebarToc = [
  ["ai", "AI search"],
  ["included", "What’s included"],
  ["diagnose", "Diagnose"],
  ["ranking", "Ranking"],
  ["photos", "Photos"],
  ["title", "Title"],
  ["description", "Description"],
  ["amenities", "Amenities"],
  ["favourites", "Guest favourites"],
  ["longstays", "Longer stays"],
  ["events", "Events"],
  ["competitors", "Competitors"],
  ["platforms", "Other platforms"],
  ["process", "How it works"],
  ["proof", "Proof"],
  ["audit", "Free audit"],
  ["call", "Run package"],
  ["faq", "FAQ"],
] as const;

export const sidebarCta = {
  text: "A listing built for search, AI and guests.",
  label: "Free listing audit",
  href: "#audit",
};
