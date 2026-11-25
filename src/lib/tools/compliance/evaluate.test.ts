import { describe, expect, it } from "vitest";
import { rulesSeed } from "@/data/compliance/rules.seed";
import { figuresSeed } from "@/data/figures.seed";
import {
  emptyAnswers,
  evaluate,
  matches,
  setSingle,
  toggleExtra,
  type Answers,
  type ComplianceResult,
  type Facts,
  type Figures,
} from "./index";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const TODAY = "2026-11-24";

function run(a: Partial<Answers>, today = TODAY): ComplianceResult {
  const outcome = evaluate({ ...emptyAnswers(), ...a }, rulesSeed, figures, today);
  if (!outcome.ok) throw new Error(`Unexpected validation error: ${JSON.stringify(outcome.errors)}`);
  return outcome.result;
}
const ids = (r: ComplianceResult, g: keyof ComplianceResult["groups"]) => r.groups[g].map((x) => x.ruleId);
const allIds = (r: ComplianceResult) => [...ids(r, "must-do"), ...ids(r, "coming-soon"), ...ids(r, "check-contract")];

const london: Partial<Answers> = { nation: "london", letType: "whole-home", mainHome: "no", gas: "yes", ownership: ["owned"], extras: ["none"] };
const edinburgh: Partial<Answers> = {
  nation: "scotland",
  area: "edinburgh",
  letType: "whole-home",
  mainHome: "no",
  gas: "no",
  ownership: ["leasehold"],
  extras: ["provide-tv"],
};

describe("evaluate: spec cases", () => {
  it("1. London, whole home, not main home, gas, owned, none", () => {
    const r = run(london);
    expect(r.counts.mustDo).toBe(10);
    expect(ids(r, "must-do")).toEqual(expect.arrayContaining(["london-90-nights", "commercial-waste"]));
    expect(ids(r, "coming-soon")).toEqual(["england-register-2027", "property-tax-2027"]);
    expect(r.counts.checkContract).toBe(0);
    expect(r.counts.total).toBe(12);
  });

  it("2. Same as 1 but it's the main home", () => {
    const r = run({ ...london, mainHome: "yes" });
    expect(r.counts.mustDo).toBe(9);
    expect(allIds(r)).not.toContain("london-90-nights");
  });

  it("3. England, whole home, not main, gas, owned", () => {
    const r = run({ nation: "england", letType: "whole-home", mainHome: "no", gas: "yes", ownership: ["owned"] });
    expect(allIds(r)).toEqual(expect.arrayContaining(["england-planning-local", "england-register-2027", "commercial-waste"]));
    expect(allIds(r)).not.toContain("london-90-nights");
  });

  it("4. England, room in my home, main home, no gas, owned", () => {
    const r = run({ nation: "england", letType: "room-in-my-home", mainHome: "yes", gas: "no", ownership: ["owned"] });
    expect(r.counts.mustDo).toBe(7);
    expect(allIds(r)).not.toContain("gas-safety-annual");
    expect(allIds(r)).not.toContain("commercial-waste");
    expect(ids(r, "coming-soon")).toEqual(["england-register-2027", "property-tax-2027"]);
  });

  it("5. Scotland Edinburgh, leasehold, TV, on 2026-11-24", () => {
    const r = run(edinburgh, "2026-11-24");
    expect(r.counts.mustDo).toBe(12);
    expect(ids(r, "must-do")).toEqual(
      expect.arrayContaining([
        "scotland-licence",
        "scotland-licence-number-in-listings",
        "scotland-control-area",
        "scotland-eicr-pat",
        "tv-licence-hotel-units",
        "visitor-levy",
      ]),
    );
    expect(r.counts.comingSoon).toBe(0);
    expect(ids(r, "check-contract")).toEqual(["lease-covenant"]);
    expect(allIds(r)).not.toContain("property-tax-2027");
    expect(allIds(r)).not.toContain("commercial-waste");
    const levy = r.groups["must-do"].find((x) => x.ruleId === "visitor-levy")!;
    expect(levy.status).toBe("law-now");
    expect(levy.summary).toBe("Edinburgh charges a visitor levy of 5% of the accommodation cost, first 5 nights, since 24 July 2026.");
  });

  it("6. Scotland Glasgow on 2026-11-24: levy is coming soon", () => {
    const r = run({ ...edinburgh, area: "glasgow" }, "2026-11-24");
    expect(r.counts.mustDo).toBe(11);
    expect(ids(r, "coming-soon")).toEqual(["visitor-levy"]);
    const levy = r.groups["coming-soon"][0];
    expect(levy.status).toBe("coming");
    expect(levy.summary).toContain("from 1 January 2027");
  });

  it("7. Scotland Glasgow on 2027-02-01: levy is must do now", () => {
    const r = run({ ...edinburgh, area: "glasgow" }, "2027-02-01");
    expect(ids(r, "must-do")).toContain("visitor-levy");
    expect(r.counts.comingSoon).toBe(0);
  });

  it("8. Wales Cardiff, room, main home, gas, rent-to-rent, food", () => {
    const r = run({
      nation: "wales",
      area: "cardiff",
      letType: "room-in-my-home",
      mainHome: "yes",
      gas: "yes",
      ownership: ["rent-to-rent"],
      extras: ["serve-food"],
    });
    expect(r.counts.mustDo).toBe(8);
    expect(ids(r, "coming-soon")).toEqual(["wales-registration-2027", "visitor-levy", "property-tax-2027"]);
    expect(ids(r, "check-contract")).toEqual(["rent-to-rent-consent"]);
    expect(allIds(r)).not.toContain("commercial-waste");
  });

  it("9. Northern Ireland, whole home, not main, no gas, mortgaged, camera + direct bookings", () => {
    const r = run({
      nation: "ni",
      letType: "whole-home",
      mainHome: "no",
      gas: "no",
      ownership: ["mortgaged"],
      extras: ["cctv-or-doorbell-camera", "direct-bookings"],
    });
    expect(r.counts.mustDo).toBe(9);
    expect(ids(r, "must-do")).toEqual(
      expect.arrayContaining(["ni-tourism-certificate", "cctv-data-protection", "no-14-day-cancellation"]),
    );
    expect(ids(r, "coming-soon")).toEqual(["property-tax-2027"]);
    expect(ids(r, "check-contract")).toEqual(["mortgage-consent"]);
    expect(allIds(r)).not.toContain("commercial-waste");
  });

  it("10. Gas not sure: gas rule included and note flagged", () => {
    const r = run({ ...london, gas: "not-sure" });
    expect(ids(r, "must-do")).toContain("gas-safety-annual");
    expect(r.gasNotSure).toBe(true);
    expect(run(london).gasNotSure).toBe(false);
  });

  it("11. All three ownership types: all contract rules, in order", () => {
    const r = run({ ...london, ownership: ["mortgaged", "leasehold", "rent-to-rent"] });
    expect(ids(r, "check-contract")).toEqual(["mortgage-consent", "lease-covenant", "rent-to-rent-consent"]);
  });

  it("12. “None” plus another extra keeps only the last choice", () => {
    let a = toggleExtra(emptyAnswers(), "none", true);
    a = toggleExtra(a, "serve-food", true);
    expect(a.extras).toEqual(["serve-food"]);
    a = toggleExtra(a, "provide-tv", true);
    a = toggleExtra(a, "none", true);
    expect(a.extras).toEqual(["none"]);
  });

  it("13. An inactive rule is never returned", () => {
    const rules = rulesSeed.map((r) => (r.ruleId === "fire-risk-assessment" ? { ...r, active: false } : r));
    const outcome = evaluate({ ...emptyAnswers(), ...london }, rules, figures, TODAY);
    expect(outcome.ok && outcome.result.groups["must-do"].map((x) => x.ruleId)).not.toContain("fire-risk-assessment");
  });

  it("14. Changing nation from Scotland to England clears the area and the levy", () => {
    let a: Answers = { ...emptyAnswers(), ...edinburgh };
    a = setSingle(a, "nation", "england");
    expect(a.area).toBeUndefined();
    expect(allIds(run(a))).not.toContain("visitor-levy");
  });

  it("15. Invalid answers return errors and no results", () => {
    const outcome = evaluate({ ...emptyAnswers(), nation: "scotland", letType: "whole-home" }, rulesSeed, figures, TODAY);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.errors).toHaveProperty("area");
      expect(outcome.errors).toHaveProperty("mainHome");
      expect(outcome.errors).toHaveProperty("gas");
      expect(outcome.errors).toHaveProperty("ownership");
    }
    const bad = evaluate({ ...emptyAnswers(), ...london, extras: ["none", "serve-food"] }, rulesSeed, figures, TODAY);
    expect(bad.ok).toBe(false);
    expect("result" in bad).toBe(false);
  });
});

describe("matches()", () => {
  const facts: Facts = {
    nation: "london",
    region: "england",
    area: null,
    letType: "whole-home",
    mainHome: "no",
    gasOn: true,
    ownership: ["mortgaged", "leasehold"],
    extras: ["provide-tv"],
  };

  it("16a. {} is always true", () => expect(matches({}, facts)).toBe(true));
  it("16b. nested all inside any", () => {
    expect(matches({ any: [{ field: "nation", eq: "wales" }, { all: [{ field: "region", eq: "england" }, { field: "gasOn", eq: true }] }] }, facts)).toBe(true);
    expect(matches({ any: [{ field: "nation", eq: "wales" }, { all: [{ field: "region", eq: "england" }, { field: "gasOn", eq: false }] }] }, facts)).toBe(false);
  });
  it("16c. includes works on arrays", () => {
    expect(matches({ field: "ownership", includes: "leasehold" }, facts)).toBe(true);
    expect(matches({ field: "extras", includes: "serve-food" }, facts)).toBe(false);
  });
  it("16d. in works", () => expect(matches({ field: "region", in: ["england", "wales"] }, facts)).toBe(true));
});

describe("figures in text", () => {
  it("fills every placeholder for every nation and area", () => {
    const cases: Partial<Answers>[] = [
      london,
      { ...london, nation: "england" },
      { ...london, nation: "ni" },
      ...["edinburgh", "glasgow", "aberdeen", "stirling", "west-dunbartonshire", "scotland-other"].map((area) => ({ ...edinburgh, area })),
      ...["cardiff", "wales-other"].map((area) => ({ ...london, nation: "wales" as const, area })),
    ];
    for (const c of cases) {
      const r = run({ ...c, extras: ["serve-food", "provide-tv", "cctv-or-doorbell-camera", "direct-bookings"], ownership: ["mortgaged", "leasehold", "rent-to-rent"] });
      for (const g of Object.values(r.groups)) for (const rule of g) expect(rule.summary, rule.ruleId).not.toMatch(/[{}]/);
    }
  });

  it("uses the council text for areas without a levy, in Coming soon", () => {
    const r = run({ ...edinburgh, area: "scotland-other" });
    const levy = r.groups["coming-soon"].find((x) => x.ruleId === "visitor-levy")!;
    expect(levy.summary).toMatch(/^Your council may introduce a visitor levy/);
  });

  it("dates come from figures", () => {
    const r = run({ ...london, nation: "wales", area: "cardiff" });
    expect(r.groups["coming-soon"].find((x) => x.ruleId === "wales-registration-2027")!.summary).toContain("31 March 2027");
    const moved: Figures = { ...figures, "wales.register.deadline": { ...figures["wales.register.deadline"], value: "2027-06-30" } };
    const o = evaluate({ ...emptyAnswers(), ...london, nation: "wales", area: "cardiff" }, rulesSeed, moved, TODAY);
    expect(o.ok && o.result.groups["coming-soon"].find((x) => x.ruleId === "wales-registration-2027")!.summary).toContain("30 June 2027");
  });

  it("uses the nation's fire safety source", () => {
    const src = (a: Partial<Answers>) => run(a).groups["must-do"].find((x) => x.ruleId === "fire-risk-assessment")!.source.title;
    expect(src(london)).toMatch(/GOV\.UK/);
    expect(src(edinburgh)).toBe("Fire (Scotland) Act 2005");
    expect(src({ ...london, nation: "ni" })).toMatch(/Northern Ireland/);
  });
});
