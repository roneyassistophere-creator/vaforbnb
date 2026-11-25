import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import { makeHandoff } from "../handoff";
import { applyTitlePrefill, titleHandoff } from "../ai-readiness/handoffs";
import { readContent as readScorer } from "../ai-readiness/content";
import { defaultInputs as scorerDefaults } from "../ai-readiness/inputs";
import {
  addToCompare,
  buildTitles,
  checklistText,
  checkTitle,
  cleanCompare,
  cleanInputs,
  countChars,
  descriptionHandoff,
  exampleInputs,
  noDetails,
  parseTitleImport,
  readContent,
  scorerPrefillHandoff,
  whatThisMeans,
  type BuilderChoices,
  type CheckId,
  type Details,
  type TitleResult,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const D = (over: Partial<Details> = {}): Details => ({ ...noDetails(), ...over });
const check = (t: string, d: Partial<Details> = {}, c = content) => checkTitle(t, D(d), c);
const status = (r: TitleResult, id: CheckId) => r.checks.find((c) => c.id === id)!.status;
const reason = (r: TitleResult, id: CheckId) => r.checks.find((c) => c.id === id)!.reason;
const matched = (r: TitleResult, id: CheckId) => r.checks.find((c) => c.id === id)!.matches.map((m) => m.text);
const fixIds = (r: TitleResult) => r.checks.filter((c) => c.status === "fix").map((c) => c.id);
const tipIds = (r: TitleResult) => r.checks.filter((c) => c.status === "tip").map((c) => c.id);
const chars = (n: number) => "Garden flat with parking near the beach".padEnd(n, "x").slice(0, n);

describe("title checks (stored rules)", () => {
  it("1. the example title: four fixes, three tips, Needs fixes", () => {
    const r = check("Lovely 2 Bed Flat in Manchester City Centre!!! ★", { town: "Manchester", bedrooms: 2 });
    expect(r.length).toBe(48);
    expect(status(r, "length")).toBe("pass");
    expect(fixIds(r)).toEqual(["punctuation", "symbols", "city", "bedrooms"]);
    expect(matched(r, "symbols")).toEqual(["★"]);
    expect(matched(r, "punctuation")).toEqual(["!!!"]);
    expect(matched(r, "city")).toEqual(["Manchester"]);
    expect(matched(r, "bedrooms")).toEqual(["2 Bed"]);
    expect(tipIds(r)).toEqual(expect.arrayContaining(["vague", "feature", "location"]));
    expect(reason(r, "vague")).toBe("Lead with a fact, not ‘Lovely’.");
    expect(r.verdict.label).toBe("Needs fixes");
    expect(whatThisMeans(r, content.rules)).toBe("Fix the 4 items marked ‘Fix’ first. They go against Airbnb’s guidance or may get your title cut off.");
    // Highlights point at the right text.
    for (const c of r.checks) for (const m of c.matches) expect(r.title.slice(m.start, m.end)).toBe(m.text);
  });

  it("2. all-caps words are a fix; a vague opener is a tip", () => {
    const r = check("STUNNING LOFT with views");
    expect(status(r, "caps")).toBe("fix");
    expect(reason(r, "caps")).toBe("Avoid all caps: STUNNING, LOFT.");
    expect(tipIds(r)).toContain("vague");
    expect(reason(r, "vague")).toBe("Lead with a fact, not ‘STUNNING’.");
    // Short capitals (TV, EV, BBQ) are fine.
    expect(status(check("Flat with TV, EV charger and BBQ"), "caps")).toBe("pass");
  });

  it("3. 50 characters passes; 51 is 1 character over", () => {
    expect(status(check(chars(50)), "length")).toBe("pass");
    const r = check(chars(51));
    expect(status(r, "length")).toBe("fix");
    expect(reason(r, "length")).toBe("1 character over. Titles over 50 get cut off.");
    expect(r.counter).toBe("over");
    expect(r.cutAt).toBe(50);
    expect(check(chars(52)).checks[0].reason).toBe("2 characters over. Titles over 50 get cut off.");
    expect(check("").checks[0].reason).toBe("Add a title.");
    expect(check(chars(45)).counter).toBe("warn");
    expect(check(chars(44)).counter).toBe("ok");
  });

  it("4. no fixes, a location tip: Good", () => {
    const r = check("Canal-view flat · free parking · fast Wi-Fi");
    expect(r.length).toBe(43);
    expect(fixIds(r)).toEqual([]);
    expect(tipIds(r)).toEqual(["location"]);
    expect(r.verdict.label).toBe("Good");
  });

  it("5. the town inside the station is fine: Strong", () => {
    const r = check("Garden flat · parking · 6 min to Leeds station", { town: "Leeds", place: "Leeds station" });
    expect(r.length).toBe(46);
    expect(status(r, "city")).toBe("pass");
    expect(status(r, "location")).toBe("pass");
    expect(status(r, "feature")).toBe("pass");
    expect(r.verdict.label).toBe("Strong");
    expect(r.passed).toBe(12);
    // The town on its own is still a fix.
    expect(status(check("Garden flat in Leeds · 6 min to Leeds station", { town: "Leeds", place: "Leeds station" }), "city")).toBe("fix");
  });

  it("6. every bedroom form is a fix when bedrooms are entered; a tip when not", () => {
    for (const t of ["2 bed", "2-bed", "2bed", "2 bedroom", "2 bedrooms", "2BR", "two-bedroom", "two bed", "2 br"]) {
      expect(status(check(`Garden flat, ${t}`, { bedrooms: 2 }), "bedrooms"), t).toBe("fix");
    }
    expect(status(check("Garden studio near the park", { bedrooms: 0 }), "bedrooms")).toBe("fix");
    expect(status(check("Garden studio near the park", { bedrooms: 1 }), "bedrooms")).toBe("pass");
    const tip = check("Garden 2-bed near the park");
    expect(status(tip, "bedrooms")).toBe("tip");
    expect(fixIds(tip)).toEqual([]);
    // "2 bridges" isn't a bedroom count.
    expect(status(check("Flat between 2 bridges", { bedrooms: 2 }), "bedrooms")).toBe("pass");
  });

  it("7. contact details and links are a fix", () => {
    for (const t of ["Call 07700 900123 for deals", "Email me at a@b.com", "See www.myflat.co.uk", "@myflat", "Book at myflat.com", "http://x.io"]) {
      expect(status(check(t), "contact"), t).toBe("fix");
    }
    expect(matched(check("Email me at a@b.com"), "contact")).toEqual(["a@b.com"]);
    expect(status(check("Flat, 6 min to stop 123"), "contact")).toBe("pass");
  });

  it("8. an emoji counts as one character, and is a fix", () => {
    const r = check("Sea view 🌊");
    expect(countChars("Sea view 🌊")).toBe(10);
    expect(r.length).toBe(10);
    expect(status(r, "symbols")).toBe("fix");
    expect(reason(r, "symbols")).toBe("Remove emoji and symbols: 🌊.");
    expect(countChars("Café 👍🏽 🇬🇧")).toBe(8);
    expect(countChars("Sea view 🌊", "codepoints")).toBe(10);
  });

  it("9. allowed separators aren't symbols", () => {
    expect(status(check("Garden flat · parking | desk – beach & pool"), "symbols")).toBe("pass");
    expect(status(check("Flat (with lift) / £60 + parking, it’s near"), "symbols")).toBe("pass");
    for (const s of ["☆", "♥", "✓", "✔", "➤", "✨", "🌟", "•"]) expect(status(check(`Garden flat ${s} parking`), "symbols"), s).toBe("fix");
  });

  it("10. unprovable claims are a tip, unless luxury is backed by a hot tub", () => {
    const r = check("Best cheapest flat in town");
    expect(status(r, "claims")).toBe("tip");
    expect(matched(r, "claims")).toEqual(["Best", "cheapest"]);
    expect(status(check("Luxury cabin with hot tub"), "claims")).toBe("pass");
    expect(status(check("Luxury cabin by the lake"), "claims")).toBe("tip");
  });

  it("11. a repeated meaningful word is a tip", () => {
    const r = check("Quiet flat with garden, flat entrance");
    expect(status(r, "repeats")).toBe("tip");
    expect(reason(r, "repeats")).toBe("‘flat’ appears twice.");
    expect(matched(r, "repeats")).toEqual(["flat", "flat"]);
    expect(status(check("Flat with a view, with parking"), "repeats")).toBe("pass");
  });

  it("12. one ! passes; two is a fix", () => {
    expect(status(check("Sea view flat!"), "punctuation")).toBe("pass");
    expect(status(check("Sea view! Garden!"), "punctuation")).toBe("fix");
    expect(status(check("Sea view flat?? Yes"), "punctuation")).toBe("fix");
    expect(status(check("Garden flat... near the park"), "punctuation")).toBe("fix");
  });

  it("matching ignores case and treats hyphens and spaces the same", () => {
    expect(matched(check("Flat with canal view"), "feature")).toEqual(["canal view"]);
    expect(matched(check("Flat with fast Wi-Fi"), "feature")).toEqual(["fast Wi-Fi"]);
    expect(matched(check("Flat with fast WiFi"), "feature")).toEqual(["fast WiFi"]);
    expect(matched(check("Flat with en-suite"), "feature")).toEqual(["en-suite"]);
    expect(status(check("Flat in Liverpool"), "feature")).toBe("tip");
  });

  it("location hooks: minutes, walks and near-phrases", () => {
    for (const t of ["Flat, 5 min to the tram", "Flat, 5 mins from the beach", "Flat, 8-minute walk", "Flat near Piccadilly", "Flat by the sea", "Flat opposite the park", "Flat next to Hyde Park"]) {
      expect(status(check(t), "location"), t).toBe("pass");
    }
    expect(status(check("Flat with 5 minutes"), "location")).toBe("tip");
  });

  it("a very short title gets the extra tip, and that makes it Good, not Strong", () => {
    const r = check("Garden flat near park");
    expect(r.length).toBe(21);
    expect(r.extraTips).toEqual([]);
    const s = check("Garden flat by sea");
    expect(s.extraTips).toEqual(["There’s room for one more selling point."]);
    expect(s.fixes).toBe(0);
    expect(s.verdict.label).toBe("Good");
  });
});

describe("title builder", () => {
  const choices = (over: Partial<BuilderChoices> = {}): BuilderChoices => ({
    features: [{ id: "canal-view" }],
    benefit: { id: "free-parking" },
    hook: { kind: "minutes", minutes: 5, mode: "walk" },
    separator: "dot",
    maxGuests: null,
    ...over,
  });
  const details = D({ town: "Manchester", place: "the tram", propertyType: "flat", bedrooms: 2 });

  it("13. every suggestion has no fixes, fits, has no town or bedroom count, and the order is stable", () => {
    const a = buildTitles(choices(), details, content);
    expect(a.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(a.suggestions.length).toBeLessThanOrEqual(6);
    expect(a.few).toBe(false);
    for (const s of a.suggestions) {
      expect(s.result.fixes, s.title).toBe(0);
      expect(s.length).toBeLessThanOrEqual(50);
      expect(s.title).not.toMatch(/manchester/i);
      expect(s.title).not.toMatch(/\b(2|two)[\s-]?(bed|br)/i);
    }
    expect(a.suggestions.map((s) => s.title)).toEqual(buildTitles(choices(), details, content).suggestions.map((s) => s.title));
    // Strong first, then closest to 45 characters.
    const ranks = a.suggestions.map((s) => (s.result.verdict.id === "strong" ? 0 : 1));
    expect(ranks).toEqual([...ranks].sort());
    expect(a.suggestions.map((s) => s.title)).toContain("Flat with a canal view · 5 min walk to the tram");
  });

  it("13b. the separator style switch changes the separators", () => {
    const bar = buildTitles(choices({ separator: "bar" }), details, content);
    expect(bar.suggestions.some((s) => s.title.includes(" | "))).toBe(true);
    expect(bar.suggestions.some((s) => s.title.includes(" · "))).toBe(false);
  });

  it("14. a long custom feature leaves fewer than 3 ideas, with the hint", () => {
    const r = buildTitles(choices({ features: [{ custom: "restored Victorian chapel" }], benefit: { id: "long-stays" }, hook: { kind: "minutes", minutes: 12, mode: "walk" } }), D({ place: "Piccadilly station", propertyType: "flat" }), content);
    expect(r.suggestions.length).toBeLessThan(3);
    expect(r.few).toBe(true);
    expect(r.hint).toBe("Pick a shorter feature or hook to see more ideas.");
  });

  it("sleeps {maxGuests} needs a number; a feature that repeats the benefit is skipped", () => {
    const none = buildTitles(choices({ benefit: { id: "sleeps" } }), details, content);
    expect(none.suggestions.some((s) => s.title.includes("sleeps"))).toBe(false);
    const four = buildTitles(choices({ benefit: { id: "sleeps" }, maxGuests: 4 }), details, content);
    expect(four.suggestions.some((s) => s.title.includes("sleeps 4"))).toBe(true);
    const dup = buildTitles(choices({ features: [{ id: "parking" }] }), details, content);
    expect(dup.suggestions.some((s) => /free parking.*free parking/i.test(s.title))).toBe(false);
  });
});

describe("stored content drives the checks", () => {
  it("15. changing the stored limit or the vague list changes results, no code change", () => {
    const f60: Figures = { ...figures, "titleChecker.limit": { ...figures["titleChecker.limit"], value: 60 } };
    const c60 = readContent(f60);
    expect(status(check(chars(51), {}, c60), "length")).toBe("pass");
    expect(reason(check(chars(50), {}, c60), "length")).toBe("50 of 60 characters.");
    expect(reason(check(chars(61), {}, c60), "length")).toBe("1 character over. Titles over 60 get cut off.");

    const rules = figures["titleChecker.rules"];
    const json = (rules.value as { json: typeof content.rules }).json;
    const superb: Figures = { ...figures, "titleChecker.rules": { ...rules, value: { json: { ...json, vagueStart: [...json.vagueStart, "superb"] } } } };
    expect(status(check("Superb flat with parking", {}, content), "vague")).toBe("pass");
    expect(status(check("Superb flat with parking", {}, readContent(superb)), "vague")).toBe("tip");
  });

  it("a malformed stored rule fails loudly", () => {
    const bad: Figures = { ...figures, "titleChecker.rules": { ...figures["titleChecker.rules"], value: { json: { version: 1 } } } };
    expect(() => readContent(bad)).toThrow(/Title checker rules/);
  });
});

describe("device format: import, export, saved inputs", () => {
  it("16. a title from the AI-readiness scorer prefills the title and details", () => {
    const h = titleHandoff({ ...scorerDefaults(), title: " Cosy flat in Leeds!! ", town: "Leeds", station: "Leeds station", landmark: "St James's Hospital", propertyType: "flat", bedrooms: 2, maxGuests: 4 });
    expect(h.kind).toBe("listing-title");
    const i = parseTitleImport(JSON.parse(JSON.stringify(h)).data)!;
    expect(i.title).toBe("Cosy flat in Leeds!!");
    expect(i.details).toEqual({ town: "Leeds", place: "Leeds station", propertyType: "flat", bedrooms: 2 });
    expect(i.maxGuests).toBe(4);
    // No station: the landmark is used. Older hand-offs without bedrooms still import.
    expect(parseTitleImport({ title: "Flat", town: "", station: "", landmark: "the beach", propertyType: "flat" })!.details).toEqual({ town: "", place: "the beach", propertyType: "flat", bedrooms: null });
    expect(parseTitleImport({ title: "" })).toBeNull();
    expect(parseTitleImport("nope")).toBeNull();
  });

  it("the description builder hand-off keeps the scorer's description and updates the title", () => {
    const prev = {
      title: "Old title",
      description: "Quiet flat.",
      sections: null,
      details: { town: "Leeds", station: "Leeds station", landmark: "St James's Hospital", propertyType: "flat", bedrooms: 2, maxGuests: 4 },
      guestTypes: ["remote"],
      uncoveredNeeds: ["fast-wifi"],
      vagueWords: ["cosy"],
    };
    const h = descriptionHandoff("Garden flat · 6 min to Leeds station", D({ town: "Leeds", place: "Leeds station", propertyType: "flat", bedrooms: 2 }), null, prev);
    expect(h.kind).toBe("listing-text");
    expect(h.source).toBe("airbnb-title-checker");
    expect(h.data.title).toBe("Garden flat · 6 min to Leeds station");
    expect(h.data.description).toBe("Quiet flat.");
    expect(h.data.details).toEqual(prev.details);
    expect(h.data.guestTypes).toEqual(["remote"]);
    const fresh = descriptionHandoff("Garden flat near the beach", D({ place: "the beach", propertyType: "cottage" }), 6, null);
    expect(fresh.data.description).toBe("");
    expect(fresh.data.details).toMatchObject({ station: "", landmark: "the beach", propertyType: "cottage", maxGuests: 6 });
  });

  it("the scorer prefill carries the title and details only", () => {
    const h = scorerPrefillHandoff(" Garden flat ", D({ town: "Leeds", place: "the beach", propertyType: "flat", bedrooms: 1 }));
    expect(h.kind).toBe("scorer-prefill");
    expect(h.data).toEqual({ title: "Garden flat", town: "Leeds", place: "the beach", propertyType: "flat", bedrooms: 1 });
    expect(makeHandoff("x", "y", {}).version).toBe(1);
  });

  it("Check your whole listing: the scorer fills the title and puts the place in Station or Landmark", () => {
    const model = readScorer(figures).model;
    const types = ["flat", "house", "cottage", "studio", "room", "other"];
    const station = scorerPrefillHandoff("Garden flat · 6 min to Leeds station", D({ town: "Leeds", place: "Leeds station", propertyType: "flat", bedrooms: 2 }));
    const a = applyTitlePrefill(scorerDefaults(), JSON.parse(JSON.stringify(station)).data, model, types)!;
    expect(a).toMatchObject({ title: "Garden flat · 6 min to Leeds station", town: "Leeds", station: "Leeds station", landmark: "", propertyType: "flat", bedrooms: 2 });
    const beach = applyTitlePrefill(scorerDefaults(), scorerPrefillHandoff("Cottage near the beach", D({ place: "the beach", propertyType: "loft" })).data, model, types)!;
    expect(beach).toMatchObject({ station: "", landmark: "the beach", propertyType: "flat", bedrooms: 1 });
    expect(applyTitlePrefill(scorerDefaults(), { title: "" }, model, types)).toBeNull();
  });

  it("saved inputs and the compare list are cleaned; the example is labelled", () => {
    const c = cleanInputs({ title: 5, details: { bedrooms: 99, propertyType: "castle" }, builder: { features: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }], separator: "zigzag" } }, content.rules);
    expect(c.title).toBe("");
    expect(c.details.bedrooms).toBe(30);
    expect(c.details.propertyType).toBe("");
    expect(c.builder.features).toHaveLength(3);
    expect(c.builder.separator).toBe("dot");
    expect(cleanCompare(["a", "a", " b ", 3, "", "c", "d"])).toEqual(["a", "b", "c"]);
    expect(addToCompare(["a", "b", "c"], "d")).toEqual(["b", "c", "d"]);
    expect(addToCompare(["a", "b"], "a")).toEqual(["b", "a"]);
    const e = exampleInputs(content.rules);
    expect(e.example).toBe(true);
    expect(e.title).toBe("Lovely 2 Bed Flat in Manchester City Centre!!! ★");
    expect(e.details).toMatchObject({ town: "Manchester", bedrooms: 2 });
  });

  it("the copied checklist lists every check with its status and the credit line", () => {
    const r = check("Lovely 2 Bed Flat in Manchester City Centre!!! ★", { town: "Manchester", bedrooms: 2 });
    const t = checklistText(r, content.rules, "Checked with VA for BnB’s Airbnb title checker");
    expect(t).toContain("48 / 50 characters · Needs fixes · 5 of 12 checks passed");
    expect(t).toContain("Fix: No emoji or decorative symbols. Remove emoji and symbols: ★.");
    expect(t).toContain("Tip: Doesn’t start with a vague word. Lead with a fact, not ‘Lovely’.");
    expect(t.trim().endsWith("Checked with VA for BnB’s Airbnb title checker")).toBe(true);
  });
});
