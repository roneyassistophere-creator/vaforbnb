import { brand } from "@/config/brand";
import { definePageSeo } from "@/lib/seo";

/** SEO for the home page ( / ). Edit freely. */
export const seo = definePageSeo({
  path: "/",
  title: "Airbnb Virtual Assistant Team for UK Hosts | VA for BnB",
  absoluteTitle: true,
  description: `A trained Airbnb virtual assistant team for UK hosts. We answer guests, manage pricing and listings, coordinate cleaners and keep reviews on track, ${brand.hours.short}.`,
  keywords: [
    "Airbnb virtual assistant UK",
    "Airbnb VA",
    "short-let virtual assistant",
    "Airbnb management support",
    "serviced accommodation VA",
  ],
  ogTitle: "Your UK Airbnb virtual assistant team | VA for BnB",
  ogDescription: "We run the daily work, you keep the control. Guest messages, pricing, cleaners, reviews and reporting for UK hosts.",
  schemaType: "WebPage",
  changeFrequency: "weekly",
  priority: 1,
  lastModified: "2026-11-24",
});

/** Extra structured data for this page (JSON-LD). */
export const schema: Record<string, unknown>[] = [];
