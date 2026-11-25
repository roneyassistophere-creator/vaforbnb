import type { settings as seedSettings } from "@/data/events";

/** Settings (the `events.settings` figure, edited in Admin › Settings). */
export type Settings = typeof seedSettings;

export type Nation = "england" | "scotland" | "wales" | "northern-ireland";
export type Demand = "high" | "medium" | "low";
export type DateStatus = "confirmed" | "expected" | "tba";
export type EventStatus = "draft" | "published" | "archived";

export type City = { slug: string; name: string; nation: Nation; region: string | null; latitude: number; longitude: number; covered: boolean; aliases: string[]; intro: string | null };
export type Category = { slug: string; name: string; icon: string | null; sortOrder: number; tip: string | null };
export type BankHoliday = { date: string; name: string; nations: string[] };

/** An event as the public tool sees it (published, sourced, never sample). Dates are YYYY-MM-DD. */
export type PublicEvent = {
  slug: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  dateStatus: DateStatus;
  city: string;
  venue: string | null;
  latitude: number | null;
  longitude: number | null;
  demand: Demand;
  demandReason: string | null;
  shortDescription: string | null;
  sourceTitle: string;
  sourceUrl: string;
  lastChecked: string | null;
  featured: boolean;
};

/** Everything the public page needs (from the database, cached and refreshed on admin changes). */
export type PublicData = { events: PublicEvent[]; cities: City[]; categories: Category[]; bankHolidays: BankHoliday[]; settings: Settings; lastReviewed: string };

/** The bank-holiday "category" slug. */
export const BANK_HOLIDAY = "bank-holidays";
