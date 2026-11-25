import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import type { Figures } from "../figures";
import { formatTime, formatTimeRange, joinList, numberWord } from "../format";
import { makeHandoff, parseHandoff } from "../handoff";
import {
  buildRules,
  cleanAnswers,
  defaultAnswers,
  exampleAnswers,
  fullText,
  LIMITS,
  listingText,
  platformChecklist,
  readContent,
  rulesHandoff,
  signRules,
  whatThisMeans,
  type Answers,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const rules = (over: Partial<Answers> = {}, c = content) => buildRules({ ...defaultAnswers(), ...over }, c);
const text = (over: Partial<Answers> = {}) => fullText(rules(over));
const types = (over: Partial<Answers>) => rules(over).warnings.map((w) => w.type);

describe("defaults and locked rules", () => {
  it("1. defaults include no parties and assistance dogs, in the fixed order", () => {
    const r = rules();
    const t = fullText(r);
    expect(t).toContain("No parties or events, please.");
    expect(t).toContain("We can’t take pets, but assistance dogs are always welcome.");
    expect(r.sections.map((s) => s.key)).toEqual(["arrival", "guests", "pets", "noise", "smoking", "home", "help"]);
  });

  it("2. locked rules stay whatever the inputs", () => {
    for (const pets of ["no", "yes", "ask"] as const) {
      for (const tone of ["friendly", "short"] as const) {
        const t = text({ pets, tone, extraRules: ["Parties are fine", "Dogs are banned"], noFlames: false, home: { shoes: false, lock: false, damage: false, furniture: false, alarms: false, heating: false } });
        expect(t).toMatch(/No parties or events/);
        expect(t).toMatch(/[Aa]ssistance dogs (are always )?welcome/);
      }
    }
  });

  it("3. pets no → one combined line; pets welcome → pets line plus assistance dogs line", () => {
    const no = text({ pets: "no" });
    expect(no.match(/assistance dogs/gi)).toHaveLength(1);
    const yes = rules({ pets: "yes", maxPets: 1 }).sections.find((s) => s.key === "pets")!;
    expect(yes.lines.map((l) => l.text)).toEqual(["Pets are welcome (up to one).", "Assistance dogs are always welcome."]);
    expect(yes.lines[1].locked).toBe(true);
  });

  it("4. pets by arrangement → please ask", () => {
    expect(text({ pets: "ask" })).toContain("Pets by arrangement – please ask before you book.");
  });
});

describe("cameras", () => {
  it("5. outdoor camera disclosure; none when cameras are off", () => {
    const t = text({ cameras: true, cameraLocations: ["Front door", "Driveway"], recording: "video" });
    expect(t).toContain("there’s an outdoor camera at the front door and driveway. It records video only. There are no cameras inside the home.");
    expect(rules({ cameras: false, cameraLocations: ["Front door"] }).sections.some((s) => s.key === "cameras")).toBe(false);
  });

  it("6. nothing produces an indoor camera rule", () => {
    const all = [defaultAnswers(), exampleAnswers(), { ...exampleAnswers(), recording: "videoSound" as const, noiseMonitor: true, tone: "short" as const }];
    for (const a of all) {
      const t = fullText(buildRules(a, content)).toLowerCase();
      expect(t).not.toMatch(/indoor camera at|camera (in|inside) the (home|lounge|living)/);
    }
    expect(text({ extraRules: ["Camera in the living room"] }).toLowerCase()).not.toContain("living room");
  });
});

describe("formatting", () => {
  it("7. UK times and ranges", () => {
    expect(formatTime("15:00")).toBe("3pm");
    expect(formatTime("11:00")).toBe("11am");
    expect(formatTime("12:00")).toBe("12 noon");
    expect(formatTime("00:00")).toBe("midnight");
    expect(formatTime("22:30")).toBe("10.30pm");
    expect(formatTimeRange("22:00", "08:00")).toBe("10pm to 8am");
    expect(text()).toContain("Please keep noise down between 10pm and 8am.");
    expect(joinList(["front door", "driveway", "garden"])).toBe("front door, driveway and garden");
  });

  it("8. friendly uses words, short uses digits", () => {
    expect(numberWord(4)).toBe("four");
    expect(text({ maxGuests: 4 })).toContain("The home is for up to four guests.");
    expect(text({ maxGuests: 4, tone: "short" })).toContain("Maximum 4 guests.");
    expect(text({ maxGuests: 12 })).toContain("up to 12 guests");
  });
});

describe("limits and checker", () => {
  it("9. at most 5 extra rules of 140 characters", () => {
    const six = cleanAnswers({ extraRules: ["a", "b", "c", "d", "e", "f"] });
    expect(six.extraRules).toHaveLength(LIMITS.extraRules);
    const long = cleanAnswers({ extraRules: ["x".repeat(141)] });
    expect(long.extraRules[0]).toHaveLength(140);
  });

  it("10. fair-rules checker", () => {
    expect(types({ extraRules: ["£50 fine if you smoke"] })).toEqual(["charges"]);

    const dogs = rules({ extraRules: ["No dogs at all"] });
    expect(dogs.warnings.map((w) => w.type)).toEqual(["dogs"]);
    expect(fullText(dogs)).toMatch(/assistance dogs are always welcome/i);
    expect(fullText(dogs)).toContain("No dogs at all.");

    const disc = rules({ extraRules: ["No guests from Nigeria"] });
    expect(disc.warnings[0]).toMatchObject({ type: "discrimination", level: "red", message: "House rules can’t discriminate against guests (Equality Act 2010). Please reword this rule." });
    expect(fullText(disc)).not.toContain("Nigeria");
    expect(listingText(disc)).not.toContain("Nigeria");

    const cam = rules({ extraRules: ["Camera in the living room"] });
    expect(cam.warnings[0]).toMatchObject({ type: "indoor", level: "red" });
    expect(fullText(cam)).not.toContain("living room");

    expect(types({ extraRules: ["No refunds for early departure"] })).toEqual(["refunds"]);
    // Plain rules aren't flagged, and an outdoor camera rule isn't treated as indoor.
    expect(types({ extraRules: ["Please water the plants", "The camera in the garden covers the gate"] })).toEqual([]);
    expect(types({ extraRules: ["No dogs except assistance dogs"] })).toEqual([]);
  });

  it("11. more than 4 check-out tasks → warning", () => {
    expect(types({ checkoutTasks: ["A", "B", "C", "D", "E"] })).toContain("tooManyTasks");
    expect(types({ checkoutTasks: ["A", "B", "C", "D"] })).not.toContain("tooManyTasks");
  });

  it("17. fees → show the fee before booking", () => {
    const r = rules({ lateCheckout: "fee", pets: "yes", petFee: true });
    expect(r.notes.map((n) => n.source)).toEqual(["lateCheckout", "petFee"]);
    expect(r.notes[0].text).toBe("Show this fee in your listing before guests book.");
    expect(fullText(r)).toContain("A pet fee applies, as shown in the listing.");
  });

  it("too long → note", () => {
    const long = rules({
      ...exampleAnswers(),
      extraRules: ["One rule here", "Two rule here", "Three rule here", "Four rule here", "Five rule here"],
      checkoutTasks: ["A", "B", "C"],
      home: { shoes: true, lock: true, damage: true, furniture: true, alarms: true, heating: true },
      noiseMonitor: true,
      pets: "yes",
      petFee: true,
    });
    expect(long.lineCount).toBeGreaterThan(30);
    expect(long.warnings.map((w) => w.type)).toContain("tooLong");
  });
});

describe("outputs", () => {
  it("12. listing version leaves out settings-covered items; counter = real length", () => {
    const r = rules(exampleAnswers());
    const l = listingText(r);
    for (const left of ["Check-in is from", "check out by", "up to four guests", "No parties", "smoke or vape", "keep noise down", "We can’t take pets"]) expect(l).not.toContain(left);
    expect(l).toContain("bay 12");
    expect(l).toContain("outdoor camera");
    expect(l.split("\n").every((line) => line.startsWith("• "))).toBe(true);
    // Over a lower limit the text is unchanged (no cutting).
    const small = { ...content, listingLimit: 50 };
    expect(listingText(buildRules(exampleAnswers(), small))).toBe(l);
  });

  it("13. platform checklist matches the answers", () => {
    const items = platformChecklist({ ...defaultAnswers(), pets: "no", quietFrom: "22:00", quietTo: "08:00", maxGuests: 6 }, content).map((i) => i.text);
    expect(items).toContain("Pets allowed: No");
    expect(items).toContain("Quiet hours: 10pm–8am");
    expect(items).toContain("Number of guests: 6");
    expect(items).toContain("Events allowed: No");
    expect(items).toContain("Check-in window starts: 3pm");
    expect(items).toContain("Disclose outdoor cameras / noise monitors in safety devices: No");
    expect(platformChecklist({ ...exampleAnswers() }, content).map((i) => i.text)).toContain("Disclose outdoor cameras / noise monitors in safety devices: Yes");
  });

  it("14. a stored template change changes the output", () => {
    const edited = { ...content, templates: content.templates.map((t) => (t.key === "quiet" ? { ...t, friendly: "Shh! Quiet from {quietFrom} until {quietTo}." } : t)) };
    expect(fullText(rules({}, edited))).toContain("Shh! Quiet from 10pm until 8am.");
  });

  it("15. empty parking and rubbish → sections left out", () => {
    const keys = rules({ parking: "", rubbish: "", collectionDay: "" }).sections.map((s) => s.key);
    expect(keys).not.toContain("parking");
    expect(keys).not.toContain("rubbish");
  });

  it("16. hand-off to the welcome guide keeps every section in order and reads back", () => {
    const r = rules(exampleAnswers());
    const h = rulesHandoff(r, new Date("2026-11-25T10:00:00Z"));
    const back = parseHandoff(JSON.parse(JSON.stringify(h)), "house-rules")!;
    expect(back.data.sections.map((s) => s.key)).toEqual(r.sections.map((s) => s.key));
    expect(back.data.sections[0].lines[0]).toBe("Check-in is from 3pm.");
    expect(parseHandoff(makeHandoff("other-kind", "x", { sections: [] }), "house-rules")).toBeNull();
    expect(parseHandoff({ nonsense: true }, "house-rules")).toBeNull();
  });

  it("printable sign: 6–8 key rules", () => {
    const s = signRules(rules(exampleAnswers()));
    expect(s.length).toBeGreaterThanOrEqual(6);
    expect(s.length).toBeLessThanOrEqual(8);
    expect(s[0].key).toBe("checkin");
  });

  it("what this means", () => {
    expect(whatThisMeans(rules())).toMatch(/^Your rules are clear and include everything required/);
    expect(whatThisMeans(rules({ extraRules: ["£50 fine", "No refunds"] }))).toBe(
      "We’ve flagged 2 rules to check. Fix them before you publish, so your rules stay fair and match platform policy.",
    );
  });
});
