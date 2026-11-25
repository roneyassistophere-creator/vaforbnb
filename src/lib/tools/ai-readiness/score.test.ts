import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import { analyseText, snippet } from "@/lib/tools/listing-text";
import type { Figures } from "../figures";
import { makeHandoff } from "../handoff";
import {
  addToHistory,
  changeSinceLast,
  changeText,
  cleanHistory,
  cleanInputs,
  defaultInputs,
  descriptionHandoff,
  exampleInputs,
  fixListText,
  improvedExampleInputs,
  readContent,
  scoreListing,
  simulateSearch,
  titleHandoff,
  whatThisMeans,
  type Content,
  type HistoryEntry,
  type Inputs,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const NOW = new Date("2026-11-25T12:00:00Z");
const make = (over: Partial<Inputs> = {}, description?: string): Inputs => {
  const d = defaultInputs();
  return { ...d, ...over, sections: { ...d.sections, ...(over.sections ?? {}), ...(description !== undefined ? { description } : {}) } };
};
const score = (i: Inputs, c: Content = content) => scoreListing(i, c, NOW);
const pts = (s: ReturnType<typeof score>) => Object.fromEntries(s.checks.map((c) => [c.id, c.points]));

const FULL = make(
  {
    title: "Quiet 2-bed flat, 8 min walk to Piccadilly",
    landmark: "Piccadilly",
    propertyType: "flat",
    guestTypes: ["remote"],
    amenities: ["wifi", "workspace", "washer", "selfCheckin", "kitchen"],
    parking: "free",
    captions: true,
    bedSizes: true,
    honest: true,
  },
  "Bright 2-bedroom flat (45 m²) on a quiet residential street with double glazing.\n\nIt's a 12-minute walk to Piccadilly station and 8 minutes to the hospital by car. Wi-Fi is 300 Mbps. There's a desk with a monitor in the second bedroom.\n\nFree parking on the driveway for one car. Self check-in with a keypad. Full kitchen with oven, hob and dishwasher, plus a washing machine.\n\nThe flat is on the second floor with no lift.",
);

const MID = make(
  { title: "Lovely flat in Leeds", town: "Leeds", amenities: ["wifi"], parking: "free", bedSizes: true },
  "Spacious flat with WiFi and parking. 10 minutes to the city centre.",
);

describe("model v2: scoring", () => {
  it("1. empty inputs score 10, Needs work", () => {
    const s = score(defaultInputs());
    expect(pts(s)).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 10, F: 0, G: 0, H: 0 });
    expect(s.total).toBe(10);
    expect(s.band.label).toBe("Needs work");
    expect(s.version).toBe(2);
  });

  it("2. three vague hits → E = 4, all three found with positions", () => {
    const s = score(make({}, "Cosy flat, great location, close to everything"));
    expect(s.checks.find((c) => c.id === "E")!.points).toBe(4);
    expect(s.analysis.vague.map((v) => v.text)).toEqual(["Cosy", "great location", "close to everything"]);
    const t = s.analysis.text;
    for (const v of s.analysis.vague) expect(t.slice(v.start, v.end)).toBe(v.text);
  });

  it("3. full-marks fixture scores 100, AI-ready", () => {
    const s = score(FULL);
    expect(pts(s)).toEqual({ A: 10, B: 15, C: 15, D: 15, E: 10, F: 15, G: 10, H: 10 });
    expect(s.total).toBe(100);
    expect(s.band.label).toBe("AI-ready");
    expect(s.analysis.units).toHaveLength(5);
    expect(s.analysis.phrases).toHaveLength(3);
    expect(s.checks[0].reasons.map((r) => [r.text, r.points])).toEqual([
      ["Title is 42 characters (limit 50)", 4],
      ["Mentions ‘flat’", 2],
      ["Mentions ‘Piccadilly’", 2],
      ["Concrete feature: ‘2’", 2],
    ]);
    expect(s.needs.map((n) => [n.id, n.covered])).toEqual([
      ["fast-wifi", true],
      ["workspace", true],
      ["quiet", true],
    ]);
    expect(s.fixes).toEqual([]);
  });

  it("4. mid fixture scores 42, Needs work, fixes D then B then H", () => {
    const s = score(MID);
    expect(pts(s)).toEqual({ A: 8, B: 5, C: 8, D: 4, E: 6, F: 6, G: 5, H: 0 });
    expect(s.total).toBe(42);
    expect(s.band.label).toBe("Needs work");
    expect(s.fixes.map((f) => [f.check, f.points])).toEqual([
      ["D", 11],
      ["B", 10],
      ["H", 10],
    ]);
    expect(s.fixes[0].needs).toEqual(["Fast Wi-Fi", "Self check-in", "Kitchen"]);
    expect(s.checks[0].reasons.map((r) => r.text)).toContain("No number or key amenity in the title");
  });

  it("5. a title over 50 characters gets no length points and a Shorten quick win", () => {
    const title = "Bright and quiet two bedroom flat near Leeds station with a desk";
    const s = score(make({ title }));
    expect(s.checks[0].reasons[0].points).toBe(0);
    expect(s.quickWins.map((q) => q.text)).toContain(`Shorten title by ${title.length - 50} characters.`);
  });

  it("6. cozy and Cosy both count as vague", () => {
    const s = score(make({}, "A cozy room. Cosy too."));
    expect(s.analysis.vague.map((v) => v.term)).toEqual(["cosy", "cosy"]);
    expect(s.checks.find((c) => c.id === "E")!.points).toBe(6);
  });

  it("7. units: matches and non-matches", () => {
    const u = (t: string) => analyseText(t, content.model).units.length;
    for (const t of ["300Mbps", "300 Mbps", "45m²", "45 sq m", "12-minute", "3 miles", "2km"]) expect(u(t), t).toBe(1);
    expect(u("4 bedrooms")).toBe(0);
    expect(u("2 m")).toBe(0);
  });

  it("8. location phrases", () => {
    const p = (t: string) => analyseText(t, content.model).phrases;
    expect(p("5 mins from the beach")).toHaveLength(1);
    const leeds = p("10 minute walk to Leeds station");
    expect(leeds).toHaveLength(1);
    expect(leeds[0].transport).toBe("station");
    expect(score(make({}, "It's a 10 minute walk to Leeds station.")).checks.find((c) => c.id === "C")!.points).toBe(11);
    expect(p("A few minutes away from the beach")).toHaveLength(0);
  });

  it("9. several guest types → union of needs, no duplicates", () => {
    const s = score(make({ guestTypes: ["families", "pets"] }));
    const ids = s.needs.map((n) => n.id);
    expect(ids).toEqual(["family", "outdoor", "kitchen", "laundry", "sleeping", "pets", "parking"]);
    expect(ids.filter((x) => x === "outdoor")).toHaveLength(1);
  });

  it("10. quick wins: text mentions parking but nothing ticked; washing machine ticked but not mentioned", () => {
    const s = score(make({ amenities: ["washer"] }, "Free parking outside."));
    const q = s.quickWins.map((x) => x.text);
    expect(q).toContain("Tick Parking (free or paid) in your Airbnb amenities.");
    expect(q).toContain("Mention washing machine in your description so guests know the details.");
  });

  it("11. Wi-Fi speed answered yes but no Mbps in the text → quick win", () => {
    expect(score(make({ wifiSpeed: true }, "Fast Wi-Fi.")).quickWins.map((q) => q.id)).toContain("wifi-speed");
    expect(score(make({ wifiSpeed: true }, "Wi-Fi is 100 Mbps.")).quickWins.map((q) => q.id)).not.toContain("wifi-speed");
  });

  it("12. H readability: shouting loses the caps point; a well-laid-out description gets 6/6", () => {
    const shouty =
      "AMAZING FLAT GREAT VIEWS BEST PRICE in the middle of town. The kitchen has an oven and a hob. The living room has a sofa and a television. There is a small garden at the back with a table for four people.";
    const h = (t: string) => score(make({}, t)).checks.find((c) => c.id === "H")!;
    expect(shouty.length).toBeGreaterThanOrEqual(200);
    expect(h(shouty).reasons.find((r) => r.text.includes("capital-letter"))!.points).toBe(0);
    const calm =
      "The flat is on the first floor. It has two bedrooms.\n\nThe kitchen has an oven and a hob. There is a washing machine. The living room has a sofa.\n\nThe garden has a table for four. Parking is on the street. We are happy to help with anything.";
    expect(calm.length).toBeGreaterThanOrEqual(200);
    expect(h(calm).points).toBe(6);
  });

  it("15. changing stored content changes results without code changes", () => {
    const edited: Content = {
      ...content,
      model: { ...content.model, vague: [...content.model.vague, { term: "charming", variants: ["charming"], suggestion: "say what makes it special" }], points: { ...content.model.points, E: { max: 10, perHit: 5 } } },
    };
    const i = make({}, "A charming flat.");
    expect(score(i).checks.find((c) => c.id === "E")!.points).toBe(10);
    expect(score(i, edited).checks.find((c) => c.id === "E")!.points).toBe(5);
  });

  it("the example loads a weak listing; the improved version scores much higher", () => {
    const weak = score(exampleInputs());
    const strong = score(improvedExampleInputs());
    expect(weak.band.label).toBe("Needs work");
    expect(strong.total - weak.total).toBeGreaterThanOrEqual(40);
    expect(strong.band.label).toBe("AI-ready");
  });

  it("fix examples use the host's details, with placeholders when missing", () => {
    const withStation = score(make({ station: "Leeds station" }, "A flat."));
    const c = withStation.fixes.find((f) => f.check === "C")!;
    expect(c.example).toBe("Add ‘8-minute walk to Leeds station’.");
    const none = score(make({}, "A flat."));
    expect(none.fixes.find((f) => f.check === "C")!.example).toBe("Add ‘8-minute walk to [your station]’.");
  });

  it("What this means follows the band; the fix list is copyable text", () => {
    const s = score(MID);
    expect(whatThisMeans(s, content.model)).toMatch(/^Your listing relies on vague words/);
    const g = score({ ...FULL, captions: false, bedSizes: false, honest: false, amenities: ["kitchen"] });
    expect(g.total).toBe(74);
    expect(g.band.label).toBe("Getting there");
    expect(whatThisMeans(g, content.model)).toBe("A few fixes will make a real difference. Start with your top three. They’re worth up to 26 points.");
    expect(fixListText(s)).toContain("1. Guest-needs coverage (+11 points available)");
  });
});

describe("guest search simulator", () => {
  const q = "quiet flat near the station with a desk";

  it("13. full fixture: clear match; mid fixture: no clear evidence", () => {
    const a = simulateSearch(q, FULL, content, undefined, NOW);
    expect(a.rows.map((r) => [r.id, r.covered])).toEqual([
      ["quiet", true],
      ["near-transport", true],
      ["workspace", true],
    ]);
    expect(a.verdictText).toBe("Clear match: every need has evidence.");
    expect(a.summary).toBe("Your listing answers 3 of 3 needs in this search.");
    const b = simulateSearch(q, MID, content, undefined, NOW);
    expect(b.rows.every((r) => !r.covered)).toBe(true);
    expect(b.verdictText).toBe("No clear evidence for this search.");
  });

  it("14. unknown words are listed as not checked", () => {
    const s = simulateSearch("flat with a jacuzzi", FULL, content);
    expect(s.notCheckedText).toBe("Not checked: jacuzzi");
    expect(s.verdict).toBe("nothing");
  });

  it("snippets are at most 60 characters and keep the match", () => {
    const s = simulateSearch("fast wifi for working remotely", FULL, content);
    const wifi = s.rows.find((r) => r.id === "fast-wifi")!;
    expect(typeof wifi.found).toBe("object");
    const f = wifi.found as { before: string; match: string; after: string };
    expect(f.match).toBe("300 Mbps");
    expect((f.before + f.match + f.after).replace(/…/g, "").length).toBeLessThanOrEqual(60);
    expect(snippet("abc", { start: 0, end: 3, text: "abc" })).toEqual({ before: "", match: "abc", after: "" });
  });

  it("a place in the search that matches the landmark checks for a minutes-to phrase", () => {
    const i = { ...FULL, landmark: "St James's Hospital" };
    const s = simulateSearch("step-free flat near the hospital", i, content);
    const place = s.rows.find((r) => r.id === "place:hospital")!;
    expect(place.label).toBe("Near St James's Hospital");
    expect(place.covered).toBe(true);
    expect(s.notChecked).toEqual([]);
  });

  it("negated evidence doesn't count: ‘no lift’ isn't step-free access, ‘no parking’ isn't a tick suggestion", () => {
    const s = simulateSearch("step-free flat", make({}, "The flat is on the second floor with no lift."), content);
    expect(s.rows[0]).toMatchObject({ id: "step-free", covered: false });
    expect(simulateSearch("flat with a desk", make({}, "There is not a desk."), content).rows[0].covered).toBe(false);
    expect(simulateSearch("flat with a lift", make({}, "Lift to every floor."), content).rows).toHaveLength(0);
    expect(score(make({ parking: "none" }, "Sorry, no parking.")).quickWins.map((q) => q.id)).not.toContain("tick:parking");
    expect(score(make({}, "No through traffic, so it's a quiet street.")).analysis.text).toBeTruthy();
    expect(score(make({ guestTypes: ["remote"] }, "No through traffic here.")).needs.find((n) => n.id === "quiet")!.covered).toBe(true);
  });

  it("amenity-only evidence is explained", () => {
    const s = simulateSearch("self check-in late arrival", make({ amenities: ["selfCheckin"] }, "A flat."), content);
    expect(s.rows[0].found).toBe("Found: Self check-in is ticked in your amenities");
  });
});

describe("history and hand-offs", () => {
  const e = (score: number): HistoryEntry => ({ at: "2026-11-25T10:00:00Z", score, band: "x", version: 2 });

  it("16. keeps the last 5 scores and shows the change since the last one", () => {
    let h: HistoryEntry[] = [];
    for (const n of [10, 20, 30, 40, 42, 60]) h = addToHistory(h, e(n));
    expect(h.map((x) => x.score)).toEqual([20, 30, 40, 42, 60]);
    expect(changeText(changeSinceLast(h))).toBe("+18 since your last score");
    expect(changeText(changeSinceLast([e(50), e(46)]))).toBe("−4 since your last score");
    expect(changeSinceLast([e(1)])).toBeNull();
    expect(cleanHistory([e(1), { bad: true }, e(101)])).toHaveLength(1);
  });

  it("hand-offs carry text and details, never more than needed for the audit", () => {
    const s = score(MID);
    const d = descriptionHandoff(MID, s);
    expect(d.kind).toBe("listing-text");
    expect(d.data.description).toContain("Spacious flat");
    expect(d.data.uncoveredNeeds).toEqual(["fast-wifi", "self-checkin", "kitchen"]);
    expect(d.data.vagueWords).toEqual(["lovely", "spacious"]);
    expect(titleHandoff(MID).data.title).toBe("Lovely flat in Leeds");
    expect(makeHandoff("x", "y", {}).format).toBe("vaforbnb-handoff");
  });

  it("cleans saved inputs", () => {
    const c = cleanInputs({ title: 5, guestTypes: ["a", "a", "b", "c", "d"], bedrooms: 999, wifiSpeed: "yes" });
    expect(c.title).toBe("");
    expect(c.guestTypes).toEqual(["a", "b", "c"]);
    expect(c.bedrooms).toBe(30);
    expect(c.wifiSpeed).toBeNull();
  });
});
