/** Types for the London 90-night counter. */

export type Platform = "airbnb" | "booking" | "vrbo" | "direct" | "other";

export const platformLabels: Record<Platform, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  vrbo: "Vrbo",
  direct: "Direct",
  other: "Other",
};

export type Booking = {
  id: string;
  /** YYYY-MM-DD */
  checkIn: string;
  /** YYYY-MM-DD (the morning guests leave; that night isn't counted) */
  checkOut: string;
  platform: Platform;
  /** Name of the platform when "Other". */
  otherPlatform?: string;
  /** Booking reference or guest name (kept on this device only). */
  reference?: string;
  note?: string;
  /** Part of the "Try an example" data. */
  example?: boolean;
};

export type Property = { id: string; name: string; bookings: Booking[] };

export type Store = {
  version: 1;
  properties: Property[];
  activePropertyId: string;
  /** Quick check answers. */
  wholeHome: boolean;
  paysCouncilTax: boolean;
};

export type Status = "ok" | "approaching" | "reached" | "over";

export type Overlap = { a: string; b: string; dates: string[] };

export type BookingNights = {
  /** Total nights of the booking, all years. */
  total: number;
  /** Nights of the booking that fall in the selected year. */
  inYear: number;
  /** Nights this booking adds to the count (after long stays and overlaps). */
  counted: number;
  longStay: boolean;
  /** Ids of bookings sharing a counted night in the selected year. */
  overlapsWith: string[];
};

export type DayKind = "counted" | "overlap" | "longStay";

export type NightsResult = {
  year: number;
  limit: number;
  warnAt: number;
  longStayMin: number;
  used: number;
  usedSoFar: number;
  bookedAhead: number;
  left: number;
  overBy: number;
  status: Status;
  /** The limit-th counted night, once reached. */
  ninetiethNightDate: string | null;
  /** Every counted night in the year, sorted. */
  countedDates: string[];
  overlaps: Overlap[];
  /** Ids of bookings of the long-stay length or more. */
  longStays: string[];
  /** Counted nights per platform label (sums to `used`). */
  perPlatform: Record<string, number>;
  perBooking: Record<string, BookingNights>;
  /** For the calendar: what each date in the year is, and which bookings are on it. */
  days: Record<string, { kind: DayKind; bookingIds: string[] }>;
};
