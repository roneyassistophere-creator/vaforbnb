/**
 * UK event calendar: seed data. Every value here can be changed in the admin
 * area (/admin) afterwards; the seed only adds rows that don't exist yet.
 * No events are seeded: real events are added (with official sources) in the
 * admin area. SAMPLE test events live in scripts/seed-sample-events.ts and
 * are never shown on the live site.
 */

/** Settings (stored as the `events.settings` figure; edited in Admin › Settings). */
export const settings = {
  version: 1,
  distances: [10, 25, 50],
  defaultDistance: 25,
  /** Days for the default date range ("Next 90 days"). */
  defaultRangeDays: 90,
  /** A published event is due a re-check when its last check is older than this. */
  recheckDays: 30,
  /** …and it starts within this many days. */
  recheckHorizonDays: 120,
  startingSoonDays: 14,
  /** Expected or TBA events starting within this many days need their date confirmed. */
  confirmWindowDays: 60,
  /** Launch rule: this many cities, each with this many published, sourced upcoming events (within `coverageDays`). */
  launchCities: 10,
  launchEventsPerCity: 5,
  coverageDays: 90,
  /** City pages with fewer upcoming events than this are kept out of search results. */
  cityNoindexMin: 3,
  reminderWeeks: [2, 4, 6, 8],
  defaultReminderWeeks: 6,
  /** "Events last reviewed" moves on when a bulk check covers at least this share of upcoming published events. */
  reviewCoverage: 0.8,
  /** Duplicate warning: same city, similar name, starting within this many days. */
  duplicateDays: 3,
  /** The "This week" strip and the "less than a month away" line. */
  thisWeekDays: 7,
  highDemandSoonDays: 30,
  /** Events rendered into the page HTML for search engines. */
  htmlEventCount: 20,
  /** Weekly reminder email to admins (sent only once an email service is connected). */
  weeklyReminder: false,
  /** Event structured data for search engines (VERIFY current guidelines before turning on). */
  eventStructuredData: false,
  demandCriteria:
    "High: sold-out or near-capacity events with tens of thousands of visitors, or several days that fill the whole city. Medium: large events that fill hotels near the venue or on one or two nights. Low: smaller events that add some demand nearby. It’s our estimate, based on the event’s size, how much of the city it affects, and demand in past years.",
};

export type Nation = "england" | "scotland" | "wales" | "northern-ireland";

/** Covered cities (coordinates are city centres). */
export const cities: { slug: string; name: string; nation: Nation; region: string; latitude: number; longitude: number; aliases: string[] }[] = [
  { slug: "london", name: "London", nation: "england", region: "London", latitude: 51.5074, longitude: -0.1278, aliases: ["Westminster", "Camden", "Greenwich", "Stratford", "Wembley", "Croydon"] },
  { slug: "manchester", name: "Manchester", nation: "england", region: "North West", latitude: 53.4808, longitude: -2.2426, aliases: ["Salford", "Trafford", "Stockport", "Old Trafford", "Ancoats"] },
  { slug: "birmingham", name: "Birmingham", nation: "england", region: "West Midlands", latitude: 52.4862, longitude: -1.8904, aliases: ["Solihull", "Edgbaston", "Digbeth", "Sutton Coldfield"] },
  { slug: "liverpool", name: "Liverpool", nation: "england", region: "North West", latitude: 53.4084, longitude: -2.9916, aliases: ["Birkenhead", "Wirral", "Anfield", "Bootle"] },
  { slug: "leeds", name: "Leeds", nation: "england", region: "Yorkshire and the Humber", latitude: 53.8008, longitude: -1.5491, aliases: ["Headingley", "Horsforth", "Pudsey"] },
  { slug: "sheffield", name: "Sheffield", nation: "england", region: "Yorkshire and the Humber", latitude: 53.3811, longitude: -1.4701, aliases: ["Rotherham", "Meadowhall"] },
  { slug: "newcastle", name: "Newcastle upon Tyne", nation: "england", region: "North East", latitude: 54.9783, longitude: -1.6178, aliases: ["Newcastle", "Gateshead", "Whitley Bay", "Tynemouth"] },
  { slug: "york", name: "York", nation: "england", region: "Yorkshire and the Humber", latitude: 53.96, longitude: -1.0873, aliases: [] },
  { slug: "nottingham", name: "Nottingham", nation: "england", region: "East Midlands", latitude: 52.9548, longitude: -1.1581, aliases: ["West Bridgford", "Beeston"] },
  { slug: "bristol", name: "Bristol", nation: "england", region: "South West", latitude: 51.4545, longitude: -2.5879, aliases: ["Clifton", "Ashton Gate"] },
  { slug: "bath", name: "Bath", nation: "england", region: "South West", latitude: 51.3811, longitude: -2.359, aliases: [] },
  { slug: "cheltenham", name: "Cheltenham", nation: "england", region: "South West", latitude: 51.8994, longitude: -2.0783, aliases: ["Prestbury"] },
  { slug: "oxford", name: "Oxford", nation: "england", region: "South East", latitude: 51.752, longitude: -1.2577, aliases: [] },
  { slug: "cambridge", name: "Cambridge", nation: "england", region: "East of England", latitude: 52.2053, longitude: 0.1218, aliases: [] },
  { slug: "brighton", name: "Brighton", nation: "england", region: "South East", latitude: 50.8225, longitude: -0.1372, aliases: ["Hove"] },
  { slug: "edinburgh", name: "Edinburgh", nation: "scotland", region: "Lothian", latitude: 55.9533, longitude: -3.1883, aliases: ["Leith", "Musselburgh", "Portobello"] },
  { slug: "glasgow", name: "Glasgow", nation: "scotland", region: "Glasgow", latitude: 55.8642, longitude: -4.2518, aliases: ["Paisley", "Hampden"] },
  { slug: "aberdeen", name: "Aberdeen", nation: "scotland", region: "Aberdeenshire", latitude: 57.1497, longitude: -2.0943, aliases: [] },
  { slug: "cardiff", name: "Cardiff", nation: "wales", region: "South Wales", latitude: 51.4816, longitude: -3.1791, aliases: ["Penarth"] },
  { slug: "swansea", name: "Swansea", nation: "wales", region: "South Wales", latitude: 51.6214, longitude: -3.9436, aliases: ["Mumbles"] },
  { slug: "belfast", name: "Belfast", nation: "northern-ireland", region: "Belfast", latitude: 54.5973, longitude: -5.9301, aliases: [] },
];

/** Categories and their host tips. "bank-holidays" is the category bank holidays show under. */
export const categories: { slug: string; name: string; icon: string; sortOrder: number; tip: string }[] = [
  { slug: "sport", name: "Sport", icon: "trophy", sortOrder: 1, tip: "Big matches fill hotels fast. Review your price 6–8 weeks before." },
  { slug: "music", name: "Music", icon: "music", sortOrder: 2, tip: "Stadium and arena shows sell out early. Check your minimum stay for the gig nights." },
  { slug: "festivals", name: "Festivals", icon: "star", sortOrder: 3, tip: "Multi-day festivals fill whole weeks. Set your price and minimum stay for every festival night." },
  { slug: "conferences", name: "Conferences and business", icon: "briefcase", sortOrder: 4, tip: "Delegates book weekdays and need fast Wi-Fi and a desk: say so in your listing." },
  { slug: "university", name: "University", icon: "cap", sortOrder: 5, tip: "Graduations and open days book up early with families. Consider a 2-night minimum." },
  { slug: "theatre", name: "Theatre and shows", icon: "ticket", sortOrder: 6, tip: "Long runs bring steady weekend demand. Check your Friday and Saturday prices." },
  { slug: "seasonal", name: "Seasonal and markets", icon: "gift", sortOrder: 7, tip: "Markets bring weekend visitors for weeks. Review weekend prices for the whole run." },
  { slug: "bank-holidays", name: "Bank holidays", icon: "calendar", sortOrder: 8, tip: "Long weekends bring short breaks. Check your 3-night prices." },
];

/** UK bank holidays 2026–2027 (GOV.UK). Admins add later years in Admin › Bank holidays. */
export const bankHolidaySource = "https://www.gov.uk/bank-holidays";
const EW = "england-and-wales";
const SC = "scotland";
const NI = "northern-ireland";
export const bankHolidays: { date: string; name: string; nations: string[] }[] = [
  { date: "2026-01-01", name: "New Year’s Day", nations: [EW, SC, NI] },
  { date: "2026-01-02", name: "2nd January", nations: [SC] },
  { date: "2026-03-17", name: "St Patrick’s Day", nations: [NI] },
  { date: "2026-04-03", name: "Good Friday", nations: [EW, SC, NI] },
  { date: "2026-04-06", name: "Easter Monday", nations: [EW, NI] },
  { date: "2026-05-04", name: "Early May bank holiday", nations: [EW, SC, NI] },
  { date: "2026-05-25", name: "Spring bank holiday", nations: [EW, SC, NI] },
  { date: "2026-06-15", name: "World Cup bank holiday", nations: [SC] },
  { date: "2026-07-13", name: "Battle of the Boyne (Orangemen’s Day)", nations: [NI] },
  { date: "2026-08-03", name: "Summer bank holiday", nations: [SC] },
  { date: "2026-08-31", name: "Summer bank holiday", nations: [EW, NI] },
  { date: "2026-11-30", name: "St Andrew’s Day", nations: [SC] },
  { date: "2026-12-25", name: "Christmas Day", nations: [EW, SC, NI] },
  { date: "2026-12-28", name: "Boxing Day", nations: [EW, SC, NI] },
  { date: "2027-01-01", name: "New Year’s Day", nations: [EW, SC, NI] },
  { date: "2027-01-04", name: "2nd January", nations: [SC] },
  { date: "2027-03-17", name: "St Patrick’s Day", nations: [NI] },
  { date: "2027-03-26", name: "Good Friday", nations: [EW, SC, NI] },
  { date: "2027-03-29", name: "Easter Monday", nations: [EW, NI] },
  { date: "2027-05-03", name: "Early May bank holiday", nations: [EW, SC, NI] },
  { date: "2027-05-31", name: "Spring bank holiday", nations: [EW, SC, NI] },
  { date: "2027-07-12", name: "Battle of the Boyne (Orangemen’s Day)", nations: [NI] },
  { date: "2027-08-02", name: "Summer bank holiday", nations: [SC] },
  { date: "2027-08-30", name: "Summer bank holiday", nations: [EW, NI] },
  { date: "2027-11-30", name: "St Andrew’s Day", nations: [SC] },
  { date: "2027-12-27", name: "Christmas Day", nations: [EW, SC, NI] },
  { date: "2027-12-28", name: "Boxing Day", nations: [EW, SC, NI] },
];
