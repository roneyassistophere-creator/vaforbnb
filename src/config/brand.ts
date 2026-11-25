/**
 * Brand configuration — the single source of truth for site-wide brand,
 * contact and business details. Edit values here; every page, the header,
 * footer, SEO tags and structured data read from this file.
 *
 * Values marked `TODO` are placeholders carried over from the design files
 * and need confirming before launch.
 */

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vaforbnb.com" // TODO: confirm production domain
).replace(/\/$/, "");

const email = "hello@vaforbnb.com"; // TODO: confirm inbox

const mailto = (subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`;

export const brand = {
  name: "VA for BnB",
  legalName: "VA for BnB", // TODO: registered company name
  /** Wordmark pieces, rendered as va<light>for</light>bnb */
  wordmark: { start: "va", middle: "for", end: "bnb" },
  tagline: "Airbnb virtual assistant team for UK hosts",
  shortDescription:
    "The Airbnb virtual assistant team for UK hosts and property managers.",
  siteUrl,
  locale: "en_GB",
  language: "en-GB",
  country: "GB",
  areaServed: ["England", "Scotland", "Wales", "Northern Ireland"],

  colors: {
    ink: "#14212B",
    inkDeep: "#0E1820",
    coral: "#F0595A",
    brand: "#B8383A",
    sand: "#F7F3EC",
    white: "#FFFFFF",
  },

  contact: {
    email,
    phone: "", // TODO: add if you want a phone number shown
    whatsapp: "", // TODO: e.g. "https://wa.me/44..."
  },

  hours: {
    /** "Mon–Sat, 8am–8pm" */
    range: "Mon–Sat, 8am–8pm",
    /** "Mon–Sat, 8am–8pm UK" */
    short: "Mon–Sat, 8am–8pm UK",
    /** "Mon–Sat, 8am–8pm UK time" */
    label: "Mon–Sat, 8am–8pm UK time",
    /** "Monday to Saturday, 8am–8pm UK time" */
    sentence: "Monday to Saturday, 8am–8pm UK time",
    /** "Monday to Saturday, 8am–8pm" */
    sentenceShort: "Monday to Saturday, 8am–8pm",
    closesAt: "8pm",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "20:00",
    timezone: "Europe/London",
  },

  team: {
    location: "Dhaka",
    founder: { name: "Kazi Rajib", role: "Founder" },
  },

  /** Figures shown in copy. Replace bracketed placeholders with real numbers. */
  stats: {
    propertiesSupported: "[X]", // TODO
    freeToolsCount: 23,
    startWithinDays: "[X]", // TODO
  },

  /** Primary calls to action. Swap the mailto links for a booking page or form when ready. */
  links: {
    bookCall: mailto("Book a 20-minute call"), // TODO: e.g. a Calendly / Cal.com URL
    freeAudit: mailto("Free listing audit"), // TODO: e.g. an audit request form
    quote: mailto("Quote request"),
    contact: `mailto:${email}`,
  },

  /** Leave empty to hide. */
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    tiktok: "",
  },

  legal: {
    registeredIn: "Registered in the UK",
    disclaimer: "General information, not legal or tax advice.",
    copyrightYear: 2026,
    /** Set paths once these pages exist; until then they render as plain text. */
    privacyUrl: null as string | null,
    termsUrl: null as string | null,
  },

  /** Dates shown on the rules hub and tools pages. Update after each monthly check. */
  content: {
    rulesLastChecked: "17 November 2026",
    rulesLastCheckedShort: "17 Nov 2026",
    rulesLastCheckedISO: "2026-11-17",
  },

  /** Downloadable files in /public */
  downloads: {
    financeSheet: "/downloads/VAforBnB-Short-Let-Finance-Sheet.xlsx",
    /** Google Sheets copy of the finance sheet. Leave empty to hide the "Open in Google Sheets" buttons. */
    financeSheetGoogle: "", // TODO
  },

  seo: {
    titleTemplate: "%s | VA for BnB",
    defaultTitle: "Airbnb Virtual Assistant Team for UK Hosts | VA for BnB",
    defaultDescription:
      "VA for BnB is a UK Airbnb virtual assistant team. We answer guests, manage pricing and listings, coordinate cleaners and keep your reviews and numbers on track, Mon–Sat, 8am–8pm UK time.",
    keywords: [
      "Airbnb virtual assistant",
      "Airbnb VA UK",
      "short-let virtual assistant",
      "serviced accommodation virtual assistant",
      "property management virtual assistant",
    ],
    twitterHandle: "", // TODO: e.g. "@vaforbnb"
  },
} as const;

export type Brand = typeof brand;
