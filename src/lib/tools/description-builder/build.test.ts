import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import { makeHandoff } from "../handoff";
import { analyseText } from "../listing-text";
import { descriptionHandoff } from "../ai-readiness/handoffs";
import { defaultInputs as scorerDefaults } from "../ai-readiness/inputs";
import { factsFromHandoff, mergeImport as plannerMerge, cleanSetup } from "../photo-shot-list";
import {
  buildDescription,
  cleanFacts,
  defaultFacts,
  exampleFacts,
  factIntegrity,
  factsFromListingText,
  highlightsFromHouseRules,
  joinList,
  listingTextHandoff,
  makeItFit,
  mergeImport,
  minutesPhrase,
  needsPanel,
  readContent,
  readiness,
  scorerPrefillHandoff,
  sizeBedrooms,
  vagueHits,
  type Facts,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const T = content.templates;
const ex = () => exampleFacts(T);
const make = (over: Partial<Facts> = {}) => sizeBedrooms({ ...ex(), ...over }, over.bedrooms ?? ex().bedrooms);
const build = (f: Facts, fitSteps = 0, c = content) => buildDescription(f, c, { fitSteps });

const TEST1 =
  "2-bedroom flat in Ancoats with a canal view from the living room. 12-minute walk to Piccadilly station. Ideal for remote workers and couples: 300 Mbps Wi-Fi and a desk, chair and monitor in bedroom 2. 45 m², sleeps 4: king in bedroom 1, double in bedroom 2. 5-minute walk to Northern Quarter and 10-minute drive to Etihad Stadium. Please note: second floor, no lift.";

/** Over the limit: a 60-character standout, 5 places, a sign-off and 3 honest notes. */
const LONG = () =>
  make({
    standout: "a private south-facing garden with a hot tub and fire pit set",
    places: [
      { name: "Manchester Piccadilly station", minutes: 12, mode: "walk", type: "station" },
      { name: "the Northern Quarter bars and cafes", minutes: 5, mode: "walk", type: "cityCentre" },
      { name: "Etihad Stadium and the Co-op Live arena", minutes: 10, mode: "drive", type: "stadium" },
      { name: "Manchester Royal Infirmary", minutes: 15, mode: "bus", type: "hospital" },
      { name: "University of Manchester", minutes: 20, mode: "tram", type: "university" },
    ],
    honest: ["stairsNoLift", "streetNoise", "compactKitchen"],
    signOff: "Message us any time with questions about your stay here.",
  });

describe("building the description (stored templates)", () => {
  it("1. the example's listing description is exact, and within 500", () => {
    const b = build(ex());
    expect(b.sections.listing).toBe(TEST1);
    expect(b.counts.listing).toBeLessThanOrEqual(500);
    expect(content.limits.listing).toBe(500);
    expect(b.overLimitBy).toBe(0);
    expect(b.sections.space).toContain("Bedroom 1: king bed.");
    expect(b.sections.space).toContain("Workspace: a desk, chair and monitor in bedroom 2.");
    expect(b.sections.space).toContain("Wi-Fi: 300 Mbps.");
    expect(b.sections.access).toContain("The flat is on the second floor and there’s no lift.");
    expect(b.sections.notes).toBe("The flat is on the second floor and there’s no lift.");
  });

  it("2. the scorer's analyser on the listing description: 5 facts with units, 3 minutes phrases with the transport bonus, 0 vague words", () => {
    const a = analyseText(TEST1, content.scorer.model);
    expect(a.units.map((u) => u.text)).toEqual(["12-minute", "300 Mbps", "45 m²", "5-minute", "10-minute"]);
    expect(a.phrases).toHaveLength(3);
    expect(a.phrases.some((p) => p.transport)).toBe(true);
    expect(a.vague).toEqual([]);
    const r = readiness(ex(), { ...build(ex()), sections: { listing: TEST1, space: "", access: "", notes: "" } }, content);
    const pts = Object.fromEntries(r.checks.map((x) => [x.id, x.points]));
    expect(pts.B).toBe(15);
    expect(pts.C).toBe(15);
    expect(pts.E).toBe(10);
    expect(r.max).toBe(65);
  });

  it("3. fact integrity: every number in the output comes from the answers", () => {
    const f = { ...ex(), checkIn: "keypad", checkInTime: "15:00", checkOutTime: "10:30", parking: "permit", parkingSpaces: 1, outdoor: "balcony", outdoorSeating: 2 };
    const b = build(f);
    expect(factIntegrity(b.sections, f)).toEqual({ ok: true, stray: [] });
    expect(b.sections.access).toContain("Self check-in with a keypad from 3pm.");
    expect(b.sections.access).toContain("Check-out by 10:30am.");
    expect(factIntegrity({ ...b.sections, listing: `${b.sections.listing} 7 nights.` }, f)).toEqual({ ok: false, stray: ["7"] });
  });

  it("4. Place-first and Guest-first hooks use their templates with the same facts", () => {
    expect(build(make({ hook: "place" })).sections.listing).toMatch(/^12-minute walk to Piccadilly station: a 2-bedroom flat in Ancoats with a canal view from the living room\. Ideal for remote workers and couples:/);
    const g = build(make({ hook: "guest" })).sections.listing;
    expect(g).toMatch(/^For remote workers and couples: a 2-bedroom flat in Ancoats with a canal view from the living room\. 12-minute walk to Piccadilly station\. With 300 Mbps Wi-Fi and a desk, chair and monitor in bedroom 2\./);
    // Guest-first without guests falls back to Feature-first.
    expect(build(make({ hook: "guest", guestTypes: [] })).sections.listing).toMatch(/^2-bedroom flat in Ancoats/);
  });

  it("5. studio: 'Studio in Ancoats with …', never '0-bedroom'", () => {
    const b = build(make({ bedrooms: 0, beds: ["double"] }));
    expect(b.sections.listing).toMatch(/^Studio in Ancoats with a canal view from the living room\./);
    expect(b.sections.listing).not.toContain("0-bedroom");
    expect(b.sections.listing).toContain("sleeps 4: double bed.");
    expect(b.sections.space).toContain("Sleeping area: double bed.");
  });

  it("6. minutes phrases: public transport and singular", () => {
    expect(minutesPhrase({ name: "Royal Infirmary", minutes: 15, mode: "bus" }, T)).toBe("15 minutes by bus to Royal Infirmary");
    expect(minutesPhrase({ name: "the beach", minutes: 1, mode: "walk" }, T)).toBe("1-minute walk to the beach");
    expect(minutesPhrase({ name: "Spinningfields", minutes: 8, mode: "tram" }, T)).toBe("8 minutes by tram to Spinningfields");
    expect(minutesPhrase({ name: "X", minutes: 12, mode: "walk" }, T, true)).toBe("12-min walk to X");
    expect(minutesPhrase({ name: "", minutes: 12, mode: "walk" }, T)).toBe("");
  });

  it("7. no guest types: no 'Ideal for' sentence in Feature-first", () => {
    expect(build(make({ guestTypes: [] })).sections.listing).not.toContain("Ideal for");
  });

  it("8. empty optional fields: no empty sentences, no 'undefined', no double spaces or stray punctuation", () => {
    const f = { ...defaultFacts(), standout: "a roof terrace", places: [{ name: "Leeds station", minutes: 8, mode: "walk", type: "station" }] };
    const b = build(f);
    expect(b.sections.listing).toBe("1-bedroom flat with a roof terrace. 8-minute walk to Leeds station.");
    for (const s of Object.values(b.sections)) {
      expect(s).not.toMatch(/undefined|null|NaN/);
      expect(s).not.toMatch(/ {2,}|\.\.|,\.|\s[.,:]|:\s*\.|\(\)/);
    }
    expect(b.sections.space).toBe("1 bathroom.");
    expect(b.sections.access).toBe("You’ll have the whole flat to yourself.");
    expect(b.sections.notes).toBe("");
  });

  it("9. over the limit: Make it fit applies the steps in order until it fits; moved items appear in their new section; undo restores", () => {
    const f = LONG();
    const b0 = build(f);
    expect(b0.overLimitBy).toBeGreaterThan(0);
    const fit = makeItFit(f, content);
    expect(fit.built.overLimitBy).toBe(0);
    expect(fit.fitSteps).toBeGreaterThan(0);
    const order = fit.built.movedItems.map((m) => m.id);
    expect(order).toEqual(T.fitSteps.map((s) => s.id).filter((id) => order.includes(id)));
    expect(order[0]).toBe("signOff");
    // Every moved item is in its new section.
    expect(fit.built.sections.listing).not.toContain("Message us any time");
    expect(fit.built.sections.notes).toContain("Message us any time with questions about your stay here.");
    if (order.includes("place3")) expect(fit.built.sections.space).toMatch(/Also nearby: 10-(minute|min) drive to Etihad Stadium/);
    expect(fit.built.movedItems[0].message).toBe("Moved ‘your sign-off’ to Other things to note.");
    // Undo one step: back to the previous state.
    const undo = build(f, fit.fitSteps - 1);
    expect(undo.sections.listing).not.toBe(fit.built.sections.listing);
    expect(build(f, 0).sections).toEqual(b0.sections);
    // Facts are never deleted: every place is still somewhere.
    const all = Object.values(fit.built.sections).join(" ");
    for (const p of f.places) expect(all).toContain(p.name);
  });

  it("10. all ticked honest notes are always in Other things to note, whatever Make it fit does", () => {
    const f = LONG();
    for (let n = 0; n <= T.fitSteps.length; n++) {
      const notes = build(f, n).sections.notes;
      expect(notes).toContain("The flat is on the second floor and there’s no lift.");
      expect(notes).toContain("You may hear street or traffic noise.");
      expect(notes).toContain("The kitchen is compact.");
    }
  });

  it("11. vague guard flags the host's words; the template library contains no vague words", () => {
    expect(vagueHits("cosy and stunning", content).map((h) => h.term)).toEqual(["cosy", "stunning"]);
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") strings.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => k !== "example" && walk(x));
    };
    walk(T);
    expect(strings.length).toBeGreaterThan(100);
    const hits = strings.flatMap((s) => vagueHits(s, content).map((h) => `${h.text} in "${s}"`));
    expect(hits).toEqual([]);
  });

  it("12. warm tone changes only connecting words: facts and numbers are the same", () => {
    const plain = build(make({ honest: ["stairsNoLift"], checkIn: "meet" }));
    const warm = build(make({ honest: ["stairsNoLift"], checkIn: "meet", tone: "warm" }));
    expect(warm.sections.listing).toContain("Made for remote workers and couples");
    expect(warm.sections.listing).toContain("Good to know: second floor, no lift.");
    const nums = (s: string) => s.match(/\d+(?:\.\d+)?/g);
    for (const id of ["listing", "space", "access", "notes"] as const) {
      expect(nums(warm.sections[id])).toEqual(nums(plain.sections[id]));
      expect(warm.sections[id].replace(/Made for|Ideal for|Good to know:|Please note:|You get the whole|You’ll have the whole|We’ll be there|We’ll meet you/g, "")).toBe(
        plain.sections[id].replace(/Made for|Ideal for|Good to know:|Please note:|You get the whole|You’ll have the whole|We’ll be there|We’ll meet you/g, ""),
      );
    }
    for (const s of Object.values(warm.sections)) expect(vagueHits(s, content)).toEqual([]);
  });

  it("13. guest-needs panel: remote workers without a workspace → ✗; with a desk → ✓", () => {
    const f = make({ workspace: "none", workspaceLocation: "", guestTypes: ["remote"] });
    const p = needsPanel(f, build(f), content);
    expect(p[0].label).toBe("Remote workers");
    expect(p[0].needs.find((n) => n.id === "workspace")!.covered).toBe(false);
    const g = { ...f, workspace: "desk" as const };
    expect(needsPanel(g, build(g), content)[0].needs.find((n) => n.id === "workspace")!.covered).toBe(true);
    expect(needsPanel(g, build(g), content)[0].needs.find((n) => n.id === "fast-wifi")!.covered).toBe(true);
  });

  it("14. import from the shared format prefills, and doesn't overwrite what the host filled", () => {
    const h = descriptionHandoff(
      { ...scorerDefaults(), title: "Canal flat", town: "Manchester", station: "Piccadilly station", landmark: "", propertyType: "flat", bedrooms: 2, maxGuests: 4, guestTypes: ["remote"] },
      { needs: [], analysis: { vague: [] } } as never,
    );
    const imported = factsFromListingText(JSON.parse(JSON.stringify(h)).data, T)!;
    expect(imported).toMatchObject({ propertyType: "flat", bedrooms: 2, maxGuests: 4, town: "Manchester", guestTypes: ["remote"], title: "Canal flat" });
    expect(imported.places).toEqual([{ name: "Piccadilly station", minutes: null, mode: "walk", type: "station" }]);
    const a = mergeImport(defaultFacts(), imported);
    expect(a.facts).toMatchObject({ bedrooms: 2, maxGuests: 4, town: "Manchester", guestTypes: ["remote"] });
    expect(a.kept).toEqual([]);
    const mine = { ...defaultFacts(), town: "Salford", guestTypes: ["families"] };
    const b = mergeImport(mine, imported);
    expect(b.facts.town).toBe("Salford");
    expect(b.facts.guestTypes).toEqual(["families"]);
    expect(b.kept.sort()).toEqual(["guestTypes", "town"]);
    expect(mergeImport(mine, imported, true).facts.town).toBe("Manchester");
    expect(factsFromListingText(null)).toBeNull();
    // House rule highlights, from the House rules generator's structured part.
    expect(highlightsFromHouseRules({ title: "x", sections: [], highlights: { checkin: "15:00", checkout: "10:00", pets: "no", maxPets: null, parties: true } })).toEqual({ checkin: "15:00", checkout: "10:00", pets: "no", maxPets: null, parties: true });
    const notes = build({ ...ex(), houseRules: { checkin: "15:00", checkout: "10:00", pets: "no", maxPets: null, parties: true } }).sections.notes;
    expect(notes).toContain("House rules: check-in from 3pm, check-out by 10am.");
    expect(notes).toContain("No pets.");
    expect(notes).toContain("No parties or events.");
    expect(notes).toContain("Assistance dogs are always welcome.");
  });

  it("15. a stored template or limit changes the output, no code change", () => {
    const rows = figures["descriptionBuilder.templates"];
    const json = (rows.value as { json: typeof T }).json;
    const edited: Figures = { ...figures, "descriptionBuilder.templates": { ...rows, value: { json: { ...json, listing: { ...json.listing, honest: "Heads up: {honest}." } } } } };
    expect(buildDescription(ex(), readContent(edited)).sections.listing).toContain("Heads up: second floor, no lift.");
    const lim = figures["aiReadiness.limits"];
    const lj = (lim.value as { json: { sections: { id: string; limit: number }[] } }).json;
    const smaller: Figures = { ...figures, "aiReadiness.limits": { ...lim, value: { json: { ...lj, sections: lj.sections.map((s) => (s.id === "description" ? { ...s, limit: 300 } : s)) } } } };
    const c300 = readContent(smaller);
    expect(c300.limits.listing).toBe(300);
    expect(buildDescription(ex(), c300).overLimitBy).toBe(TEST1.length - 300);
  });

  it("16. lists: 'A and B', 'A, B and C'", () => {
    expect(joinList(["A", "B"])).toBe("A and B");
    expect(joinList(["A", "B", "C"])).toBe("A, B and C");
    expect(joinList(["A"])).toBe("A");
    expect(joinList([])).toBe("");
  });
});

describe("hand-offs", () => {
  it("the photo planner imports the rooms, standout and details from the builder's hand-off", () => {
    const f = { ...ex(), outdoor: "balcony", checkIn: "keypad", checkInTime: "15:00" };
    const h = listingTextHandoff(f, build(f).sections, "Canal flat");
    expect(h.kind).toBe("listing-text");
    expect(h.source).toBe("airbnb-description-builder");
    const facts = factsFromHandoff(JSON.parse(JSON.stringify(h)).data)!;
    expect(facts).toMatchObject({ bedrooms: 2, beds: ["king", "double"], workspace: "full", wifiMbps: 300, view: "canal", standout: "view", outdoor: ["balcony"], checkIn: "keypad", checkInTime: "3pm", floor: "2", lift: false, honest: ["stairsNoLift"] });
    expect(plannerMerge(cleanSetup({}), facts).setup.places[0]).toEqual({ name: "Piccadilly station", minutes: 12, mode: "walk" });
  });

  it("Score this carries the four sections and details", () => {
    const b = build(ex());
    const h = scorerPrefillHandoff(ex(), b.sections);
    expect(h.kind).toBe("scorer-prefill");
    expect(h.data.sections.description).toBe(TEST1);
    expect(h.data).toMatchObject({ propertyType: "flat", bedrooms: 2, maxGuests: 4, guestTypes: ["remote", "couples"], station: "Piccadilly station", bedSizes: true, honest: true });
    expect(h.data.amenities).toContain("wifi");
    expect(h.data.amenities).toContain("workspace");
    expect(makeHandoff("x", "y", {}).format).toBe("vaforbnb-handoff");
  });

  it("cleans saved facts", () => {
    const c = cleanFacts({ bedrooms: 99, standout: "x".repeat(200), checkInTime: "25:99", places: [{ name: "A", minutes: 500 }], lift: "yes" }, T);
    expect(c.bedrooms).toBe(20);
    expect(c.standout).toHaveLength(60);
    expect(c.checkInTime).toBe("");
    expect(c.places[0].minutes).toBe(120);
    expect(c.lift).toBeNull();
  });
});
