/**
 * Booking performance calculator (occupancy, ADR, RevPAR): editable stored content.
 * Seeded into the `figures` table (key "bookingPerformance.content").
 * Every value here is an ASSUMPTION or our wording, not an official figure.
 */
export const model = {
  version: 1,
  versionDate: "2026-11-26",
  /** ASSUMPTION: weekend nights (0 = Sunday … 5 = Friday, 6 = Saturday). Friday and Saturday nights. */
  weekendNights: [5, 6],
  /** ASSUMPTION: an unbooked run between two bookings counts as a gap up to this many nights. */
  gapMaxNights: 2,
  /** ASSUMPTION: a before/after RevPAR change smaller than this (%) is "No real change". */
  noChangePercent: 2,
};

/** Insight rules: conditions in the calculator, thresholds and wording here. Up to `max`, highest impact first. */
export const insights = {
  max: 5,
  thresholds: { nearlyFullPercent: 85, emptyPercent: 50, minGaps: 2, weekdayGapPoints: 20 },
  rules: [
    { id: "flags", enabled: true, text: "Check {n} flagged bookings for possible double bookings." },
    { id: "nearlyFull", enabled: true, text: "You’re nearly full. Testing a higher price could raise RevPAR." },
    { id: "empty", enabled: true, text: "Over half your available nights are empty. Longer stays or event pricing could fill them.", tool: "long-stay-discount-calculator", linkLabel: "Long-stay discount calculator", tool2: "uk-event-calendar", link2Label: "UK event calendar" },
    { id: "gaps", enabled: true, text: "{n} short gaps left {x} nights unsold. A shorter minimum stay or gap-night discount could fill them.", tool: "long-stay-discount-calculator", linkLabel: "Long-stay discount calculator" },
    { id: "weekday", enabled: true, text: "Weekdays are your weak spot ({w}% vs {k}% at weekends). Consider weekday or longer-stay offers." },
    { id: "opposite", enabled: true, text: "Your price change and occupancy moved in opposite directions. Overall, RevPAR {dir} by {x}." },
    { id: "yoyUp", enabled: true, text: "RevPAR is up {y}% on last year. You earned more per available night." },
    { id: "yoyDown", enabled: true, text: "RevPAR is down {y}%. Check which effect caused it in the breakdown." },
  ],
};

export const wording = {
  beforeAfter: { worked: "Worked: RevPAR up {x} ({y}%)", didnt: "Didn’t work: RevPAR down", none: "No real change" },
  whatThisMeans: {
    noData: "Enter your nights and revenue to see what your numbers mean.",
    high: "Your calendar is busy: {occ} of available nights sold. With demand this strong, your price (ADR {adr}) is the lever to test next, and RevPAR tells you whether a higher price earns more overall.",
    mid: "You sold {occ} of available nights at {adr} on average, earning {revpar} for every night you could have sold. Track RevPAR month by month: it rises when either price or occupancy improves without the other falling too far.",
    low: "Fewer than half your available nights sold ({occ}). Filling more nights, with longer stays, event pricing or a shorter minimum stay, would lift RevPAR faster than a price change.",
    always: "These are your figures, not market benchmarks.",
  },
};

/** "Try an example" for each mode (clearly labelled as example data). */
export const examples = {
  note: "Example data: replace it with your own figures.",
  quick: { nights: 30, booked: 18, blocked: 0, revenue: 1980, cleaning: 0, feePercent: 0, bookings: 6, lastYear: { nights: 30, booked: 15, blocked: 0, revenue: 1800 } },
  monthly: {
    year: 2026,
    thisYear: [
      [0, 17, 1870],
      [0, 15, 1590],
      [0, 19, 2090],
      [2, 20, 2240],
      [0, 22, 2530],
      [0, 23, 2760],
      [3, 26, 3380],
      [0, 28, 3640],
      [0, 21, 2520],
      [0, 19, 2180],
      [0, 0, 0],
      [0, 0, 0],
    ],
    lastYear: [
      [0, 14, 1500],
      [0, 13, 1350],
      [0, 17, 1820],
      [2, 18, 1980],
      [0, 21, 2310],
      [0, 22, 2530],
      [3, 25, 3125],
      [0, 27, 3375],
      [0, 19, 2185],
      [0, 18, 1980],
      [0, 16, 1700],
      [4, 18, 2160],
    ],
    filledMonths: 10,
  },
  bookings: {
    start: "2027-03-01",
    end: "2027-04-01",
    rows: [
      { checkIn: "2027-02-28", checkOut: "2027-03-03", revenue: 300, channel: "Airbnb", bookedOn: "2027-02-01", cleaning: 0 },
      { checkIn: "2027-03-05", checkOut: "2027-03-08", revenue: 360, channel: "Airbnb", bookedOn: "2027-02-10", cleaning: 0 },
      { checkIn: "2027-03-10", checkOut: "2027-03-12", revenue: 240, channel: "Direct", bookedOn: "2027-03-01", cleaning: 0 },
      { checkIn: "2027-03-30", checkOut: "2027-04-02", revenue: 330, channel: "Booking.com", bookedOn: "2027-03-02", cleaning: 0 },
    ],
  },
};
