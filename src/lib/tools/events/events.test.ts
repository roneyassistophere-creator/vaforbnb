/**
 * Event calendar tests. Fixed today: 2026-11-26 (London). All events here are
 * SAMPLE test data: never published on the live site.
 */
import { describe, expect, it } from "vitest";
import * as seed from "@/data/events";
import {
  auditRecord,
  closeSuggestion,
  draftFromSuggestion,
  confirmDue,
  coverage,
  csvTemplate,
  emptyEvent,
  eventDays,
  eventsByDay,
  eventsCsv,
  eventsIcs,
  findCity,
  findDuplicates,
  lookupTown,
  milesBetween,
  monthGrid,
  nextYearCopy,
  noFilters,
  parseCsv,
  previewImport,
  publicDefaults,
  rangeFor,
  recheckDue,
  reviewCovers,
  search,
  startingSoon,
  validateEvent,
  whatThisMeans,
  BANK_HOLIDAY,
  type AdminEvent,
  type City,
  type PublicEvent,
  type Settings,
} from ".";

const TODAY = "2026-11-26";
const S: Settings = seed.settings;
const city = (slug: string, name: string, latitude: number, longitude: number, nation: City["nation"] = "england", aliases: string[] = [], covered = true): City => ({ slug, name, nation, region: null, latitude, longitude, covered, aliases, intro: null });
const CITIES: City[] = [
  city("manchester", "Manchester", 53.4808, -2.2426, "england", ["Salford", "Trafford", "Stockport"]),
  city("north-20", "SAMPLE Town 20", 53.7703, -2.2426),
  city("north-30", "SAMPLE Town 30", 53.915, -2.2426),
  city("london", "London", 51.5074, -0.1278),
  city("liverpool", "Liverpool", 53.4084, -2.9916),
  city("edinburgh", "Edinburgh", 55.9533, -3.1883, "scotland"),
  city("wigan", "Wigan", 53.5448, -2.6318, "england", [], false),
];
const CATS = seed.categories.map((c) => ({ ...c }));
let n = 0;
const ev = (over: Partial<PublicEvent> = {}): PublicEvent => ({
  slug: `sample-${++n}`,
  name: `SAMPLE event ${n}`,
  category: "music",
  startDate: "2026-12-10",
  endDate: over.startDate ?? "2026-12-10",
  startTime: null,
  dateStatus: "confirmed",
  city: "manchester",
  venue: "SAMPLE venue",
  latitude: null,
  longitude: null,
  demand: "medium",
  demandReason: null,
  shortDescription: null,
  sourceTitle: "Official site",
  sourceUrl: "https://example.org/",
  lastChecked: "2026-11-20",
  featured: false,
  ...over,
});
const man = CITIES[0];
const range90 = rangeFor("next90", TODAY, S);
const find = (events: PublicEvent[], over: Partial<Parameters<typeof search>[1]> = {}) =>
  search({ events, cities: CITIES, bankHolidays: seed.bankHolidays }, { center: man, nation: "england", distance: 25, range: range90, filters: noFilters(), today: TODAY, ...over }, S);
const admin = (over: Partial<AdminEvent> = {}): AdminEvent => ({ ...emptyEvent(), name: "SAMPLE Concert", slug: "sample-concert-2027", category: "music", startDate: "2027-01-20", endDate: "2027-01-20", city: "manchester", sourceTitle: "Official site", sourceUrl: "https://example.org/", status: "draft", ...over });

describe("public search (stored settings, SAMPLE data)", () => {
  it("1. city filter by distance: 25 miles includes 20, excludes 30; 50 includes 30", () => {
    const list = [ev({ city: "manchester" }), ev({ city: "north-20" }), ev({ city: "north-30" })];
    expect(find(list).events.map((e) => [e.city, e.miles])).toEqual([
      ["manchester", 0],
      ["north-20", 20],
    ]);
    expect(find(list, { distance: 50 }).events.map((e) => e.city)).toEqual(["manchester", "north-20", "north-30"]);
  });

  it("2. aliases: 'Salford' selects the Manchester area", () => {
    expect(findCity("Salford", CITIES)?.slug).toBe("manchester");
    expect(findCity("salford ", CITIES)?.slug).toBe("manchester");
    expect(findCity("Manc", CITIES)?.slug).toBe("manchester");
  });

  it("3. 'Next 90 days' runs 2026-11-26 to 2027-02-24", () => {
    expect(range90).toEqual({ from: "2026-11-26", to: "2027-02-24" });
    const list = [ev({ startDate: "2026-11-26", endDate: "2026-11-26" }), ev({ startDate: "2027-02-24", endDate: "2027-02-24" }), ev({ startDate: "2027-02-25", endDate: "2027-02-25" })];
    expect(find(list).events.map((e) => e.startDate)).toEqual(["2026-11-26", "2027-02-24"]);
    expect(rangeFor("next30", TODAY, S)).toEqual({ from: TODAY, to: "2026-12-26" });
    expect(rangeFor("thisMonth", TODAY, S)).toEqual({ from: TODAY, to: "2026-11-30" });
    expect(rangeFor("nextMonth", TODAY, S)).toEqual({ from: "2026-12-01", to: "2026-12-31" });
  });

  it("4. past events disappear after their end date", () => {
    const list = [ev({ startDate: "2026-11-24", endDate: "2026-11-25" }), ev({ startDate: "2026-11-24", endDate: "2026-11-26" })];
    expect(find(list, { range: { from: "2026-11-01", to: "2026-12-31" } }).events.map((e) => e.endDate)).toEqual(["2026-11-26"]);
  });

  it("5. a multi-day event: one list card, three calendar days", () => {
    const e = ev({ startDate: "2026-12-01", endDate: "2026-12-03" });
    const r = find([e]);
    expect(r.events).toHaveLength(1);
    expect(eventDays(e)).toEqual(["2026-12-01", "2026-12-02", "2026-12-03"]);
    const byDay = eventsByDay(r.events);
    expect([...byDay.keys()]).toEqual(["2026-12-01", "2026-12-02", "2026-12-03"]);
    expect(monthGrid("2026-12")[0]).toEqual(["", "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06"]);
  });

  it("6. drafts and archived events never appear (the loader only passes published, non-sample events)", async () => {
    const { toPublic } = await import("./public");
    const rows = [
      { ...admin({ status: "published", slug: "a" }), isSample: false },
      { ...admin({ status: "draft", slug: "b" }), isSample: false },
      { ...admin({ status: "archived", slug: "c" }), isSample: false },
      { ...admin({ status: "published", slug: "d" }), isSample: true },
      { ...admin({ status: "published", slug: "e", sourceUrl: "http://insecure.example/" }), isSample: false },
    ];
    expect(toPublic(rows, { allowSample: false }).map((e) => e.slug)).toEqual(["a"]);
    expect(toPublic(rows, { allowSample: true }).map((e) => e.slug)).toEqual(["a", "d"]);
  });

  it("7. category and High demand filters combine; chip counts match", () => {
    const list = [ev({ category: "sport", demand: "high" }), ev({ category: "sport", demand: "low" }), ev({ category: "music", demand: "high" }), ev({ category: "music", demand: "medium" })];
    const all = find(list);
    expect(all.counts.sport).toBe(2);
    expect(all.counts.music).toBe(2);
    const high = find(list, { filters: { ...noFilters(), highOnly: true } });
    expect(high.counts).toMatchObject({ sport: 1, music: 1, [BANK_HOLIDAY]: 0 });
    const sportHigh = find(list, { filters: { categories: ["sport"], highOnly: true, confirmedOnly: false } });
    expect(sportHigh.events).toHaveLength(1);
    expect(sportHigh.events).toHaveLength(high.counts.sport);
    expect(find(list, { filters: { ...noFilters(), categories: ["music"] } }).events).toHaveLength(all.counts.music);
  });

  it("8. Confirmed only hides expected and TBA; TBA is in the list, never on the grid", () => {
    const tba = ev({ dateStatus: "tba", startDate: "2027-01-01", endDate: "2027-01-01" });
    const list = [ev(), ev({ dateStatus: "expected" }), tba];
    expect(find(list).events).toHaveLength(3);
    expect(find(list, { filters: { ...noFilters(), confirmedOnly: true } }).events.map((e) => e.dateStatus)).toEqual(["confirmed"]);
    expect(eventDays(tba)).toEqual([]);
    expect([...eventsByDay(find(list).events).values()].flat().some((e) => e.dateStatus === "tba")).toBe(false);
  });

  it("9. bank holidays follow the city's nation (St Andrew's Day for Scotland only)", () => {
    const scot = find([], { center: CITIES[5], nation: "scotland" }).bankHolidays.map((b) => b.name);
    expect(scot).toContain("St Andrew’s Day");
    const eng = find([]).bankHolidays.map((b) => b.name);
    expect(eng).not.toContain("St Andrew’s Day");
    expect(eng).toContain("Christmas Day");
  });

  it("10. distances round to the nearest mile from stored coordinates (London–Manchester ≈ 163)", () => {
    expect(Math.abs(Math.round(milesBetween(CITIES[3], man)) - 163)).toBeLessThanOrEqual(1);
    expect(Math.round(milesBetween(man, CITIES[4]))).toBe(31);
    // Event coordinates win over the city's.
    expect(find([ev({ city: "manchester", latitude: 53.7703, longitude: -2.2426 })]).events[0].miles).toBe(20);
  });

  it("11. calendar file: all-day, reminder weeks before, CRLF, unique UID, DTSTART;VALUE=DATE", () => {
    const a = ev({ slug: "sample-fest-2026", name: "SAMPLE Fest", startDate: "2026-12-01", endDate: "2026-12-03" });
    const b = ev({ slug: "sample-match-2026", name: "SAMPLE Match", startDate: "2026-12-12", endDate: "2026-12-12" });
    const ics = eventsIcs([a, b], 6, new Date("2026-11-26T09:00:00Z"));
    expect(ics).toContain("DTSTART;VALUE=DATE:20261201\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20261204\r\n");
    expect(ics).toContain("TRIGGER:-P42D");
    expect(ics.split("\r\n").length).toBeGreaterThan(10);
    expect(ics.replace(/\r\n/g, "")).not.toContain("\n");
    const uids = ics.match(/^UID:.*$/gm)!;
    expect(new Set(uids).size).toBe(2);
  });

  it("12. an uncovered town suggests the nearest covered city, with the distance", () => {
    const r = lookupTown("Wigan", CITIES);
    expect(r.kind).toBe("uncovered");
    if (r.kind === "uncovered") expect(r.nearest).toMatchObject({ city: { slug: "manchester" }, miles: 17 });
    expect(lookupTown("Atlantis", CITIES).kind).toBe("unknown");
  });

  it("what this means: found, high demand soon, none", () => {
    const soon = ev({ name: "SAMPLE Derby", demand: "high", startDate: "2026-12-05", endDate: "2026-12-05" });
    expect(whatThisMeans(find([soon]), TODAY, S)).toBe(
      "1 event could raise demand near you. Star the ones that matter and set reminders, so you can review prices and minimum stays a few weeks before. SAMPLE Derby is less than a month away. Check your price and availability now.",
    );
    expect(whatThisMeans(find([]), TODAY, S)).toMatch(/^No big events found/);
  });
});

describe("admin rules", () => {
  it("13. validation: end before start; missing or non-https source can't publish; unknown city", () => {
    expect(validateEvent(admin({ endDate: "2027-01-19" }), CITIES, CATS).endDate).toBe("End date can’t be before the start date.");
    expect(validateEvent(admin({ sourceUrl: "" }), CITIES, CATS, true).sourceUrl).toMatch(/official source link \(starting https:\/\/\)/);
    expect(validateEvent(admin({ sourceUrl: "http://example.org" }), CITIES, CATS, true).sourceUrl).toBeTruthy();
    expect(validateEvent(admin({ city: "atlantis" }), CITIES, CATS).city).toBe("Pick a city from the list.");
    expect(validateEvent(admin(), CITIES, CATS, true)).toEqual({});
  });

  it("14. duplicates: same city, similar name, within 3 days", () => {
    const existing = [admin({ id: "1", slug: "manchester-christmas-markets-2026", name: "Manchester Christmas Markets", startDate: "2026-11-13" })];
    expect(findDuplicates(admin({ name: "Christmas Markets Manchester", startDate: "2026-11-15" }), existing, S.duplicateDays)).toHaveLength(1);
    expect(findDuplicates(admin({ name: "Christmas Markets Manchester", startDate: "2026-11-20" }), existing, S.duplicateDays)).toHaveLength(0);
    expect(findDuplicates(admin({ name: "Christmas Markets Manchester", startDate: "2026-11-15", city: "london" }), existing, S.duplicateDays)).toHaveLength(0);
    expect(findDuplicates(admin({ name: "Food Festival", startDate: "2026-11-14" }), existing, S.duplicateDays)).toHaveLength(0);
  });

  it("15. next year's copy: new draft, +1 year, expected, no last check", () => {
    const c = nextYearCopy(admin({ id: "x", name: "SAMPLE Fringe", startDate: "2026-08-07", endDate: "2026-08-31", status: "published", lastChecked: "2026-07-01", dateStatus: "confirmed" }));
    expect(c).toMatchObject({ id: undefined, startDate: "2027-08-07", endDate: "2027-08-31", dateStatus: "expected", lastChecked: null, status: "draft", slug: "sample-fringe-2027" });
    // Usual week set: same weekday, same week of the month (2nd Saturday of August).
    const w = nextYearCopy(admin({ startDate: "2026-08-08", endDate: "2026-08-09", recurrence: "annual", usualMonth: 8, usualWeek: 2 }));
    expect(w.startDate).toBe("2027-08-14");
    expect(new Date(`${w.startDate}T12:00:00Z`).getUTCDay()).toBe(6);
    expect(w.endDate).toBe("2027-08-15");
  });

  it("16. re-check queue", () => {
    const pub = (startIn: number, checkedAgo: number) => admin({ status: "published", startDate: addDaysT(startIn), endDate: addDaysT(startIn), lastChecked: addDaysT(-checkedAgo) });
    expect(recheckDue([pub(60, 40)], TODAY, S)).toHaveLength(1);
    expect(recheckDue([pub(60, 10)], TODAY, S)).toHaveLength(0);
    expect(recheckDue([pub(200, 40)], TODAY, S)).toHaveLength(0);
    expect(confirmDue([admin({ dateStatus: "expected", startDate: addDaysT(30), endDate: addDaysT(30) })], TODAY, S)).toHaveLength(1);
    expect(startingSoon([pub(10, 1), pub(20, 1)], TODAY, S)).toHaveLength(1);
  });

  it("17. coverage and launch readiness", () => {
    const list = [
      ...Array.from({ length: 5 }, (_, i) => admin({ slug: `m${i}`, status: "published", city: "manchester", startDate: addDaysT(10 + i), endDate: addDaysT(10 + i) })),
      ...Array.from({ length: 4 }, (_, i) => admin({ slug: `l${i}`, status: "published", city: "london", startDate: addDaysT(10 + i), endDate: addDaysT(10 + i) })),
      admin({ slug: "far", status: "published", city: "london", startDate: addDaysT(120), endDate: addDaysT(120) }),
      admin({ slug: "draft", status: "draft", city: "london", startDate: addDaysT(5), endDate: addDaysT(5) }),
    ];
    const c = coverage(list, CITIES, TODAY, S);
    expect(c.rows.find((r) => r.city.slug === "manchester")).toMatchObject({ count: 5, ready: true });
    expect(c.rows.find((r) => r.city.slug === "london")).toMatchObject({ count: 4, ready: false });
    expect(c.rows.some((r) => r.city.slug === "wigan")).toBe(false);
    expect(c).toMatchObject({ ready: 1, needed: 10, launchReady: false });
    expect(reviewCovers(["a", "b", "c", "d"], ["a", "b", "c", "d", "e"], S)).toBe(true);
    expect(reviewCovers(["a", "b", "c"], ["a", "b", "c", "d", "e"], S)).toBe(false);
  });

  it("18. CSV import: valid rows as drafts, bad rows with reasons, duplicates flagged; export then re-import updates by slug", () => {
    const head = "name,category,startDate,endDate,dateStatus,city,venue,postcode,latitude,longitude,demand,demandReason,shortDescription,sourceTitle,sourceUrl,secondSourceUrl,recurrence,status";
    const csv = [
      head,
      "SAMPLE Gig,music,2027-01-10,,confirmed,manchester,SAMPLE Arena,,,,high,Sold out,,Official site,https://example.org/gig,,none,",
      "SAMPLE Match,Sport,2027-01-12,2027-01-12,expected,Manchester,,,,,medium,,,Club,https://example.org/match,,none,",
      "SAMPLE Bad date,music,2027-13-40,,confirmed,manchester,,,,,low,,,Site,https://example.org/,,none,",
      "SAMPLE No city,music,2027-01-10,,confirmed,atlantis,,,,,low,,,Site,https://example.org/,,none,",
      "SAMPLE Insecure,music,2027-01-10,,confirmed,manchester,,,,,low,,,Site,http://example.org/,,none,",
      '"SAMPLE Christmas Markets, Manchester",seasonal,2026-11-14,,confirmed,manchester,,,,,high,,,Council,https://example.org/xmas,,annual,',
    ].join("\r\n");
    const existing = [admin({ id: "e1", slug: "manchester-christmas-markets-2026", name: "Manchester Christmas Markets", startDate: "2026-11-13", category: "seasonal" })];
    const p = previewImport(csv, { cities: CITIES, categories: CATS, existing, settings: S, publish: false });
    expect(p.headerError).toBeNull();
    expect(p.rows.map((r) => r.errors.length === 0)).toEqual([true, true, false, false, false, true]);
    expect(p.rows[2].errors[0]).toMatch(/Bad start date/);
    expect(p.rows[3].errors[0]).toBe("Unknown city “atlantis”.");
    expect(p.rows[4].errors[0]).toMatch(/must start https/);
    expect(p.rows[0].event).toMatchObject({ status: "draft", endDate: "2027-01-10", slug: "sample-gig-2027", demand: "high" });
    expect(p.rows[1].event).toMatchObject({ category: "sport", city: "manchester", dateStatus: "expected" });
    expect(p.rows[5].duplicateOf).toMatch(/Manchester Christmas Markets/);

    const exported = eventsCsv([p.rows[0].event!]);
    const again = previewImport(exported, { cities: CITIES, categories: CATS, existing: [{ ...p.rows[0].event!, id: "saved-1" }], settings: S, publish: false });
    expect(again.rows[0]).toMatchObject({ updatesSlug: "sample-gig-2027", duplicateOf: null });
    expect(again.rows[0].event?.id).toBe("saved-1");
    expect(parseCsv(csvTemplate())[0]).toContain("sourceUrl");
    expect(previewImport("name,city\nx,y", { cities: CITIES, categories: CATS, existing: [], settings: S, publish: false }).headerError).toMatch(/Missing columns/);
  });

  it("19. a suggestion becomes a prefilled draft; rejecting closes it and deletes the email", () => {
    const sug = { id: "s1", name: "SAMPLE Food Fair", date: "2027-03-14", town: "Salford", sourceUrl: "https://example.org/fair", email: "fan@example.org", message: "Big one", status: "new" as const, note: null, closedAt: null };
    const d = draftFromSuggestion(sug, CITIES);
    expect(d).toMatchObject({ name: "SAMPLE Food Fair", startDate: "2027-03-14", endDate: "2027-03-14", city: "manchester", sourceUrl: "https://example.org/fair", status: "draft" });
    const closed = closeSuggestion(sug, "rejected", "Not a visitor event", new Date("2026-11-26T10:00:00Z"));
    expect(closed).toMatchObject({ status: "rejected", email: null, note: "Not a visitor event", closedAt: "2026-11-26T10:00:00.000Z" });
  });

  it("20. a stored setting changes the public default, no code change", () => {
    expect(publicDefaults(S).distance).toBe(25);
    expect(publicDefaults({ ...S, defaultDistance: 10 }).distance).toBe(10);
    expect(publicDefaults({ ...S, defaultRangeDays: 30 }).range).toBe("next30");
  });

  it("21. audit records keep the user, action and only the changed fields", () => {
    const r = auditRecord("editor@example.org", "edit", "event", "e1", "Changed the date", { name: "A", startDate: "2027-01-01", updatedAt: 1 }, { name: "A", startDate: "2027-01-02", updatedAt: 2 });
    expect(r).toEqual({ userEmail: "editor@example.org", action: "edit", entity: "event", entityId: "e1", summary: "Changed the date", changes: { startDate: { from: "2027-01-01", to: "2027-01-02" } } });
    expect(auditRecord("a@b.c", "delete", "event", "e1", "Deleted").changes).toBeNull();
  });
});

function addDaysT(n: number) {
  const d = new Date(`${TODAY}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
