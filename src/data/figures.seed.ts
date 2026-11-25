import type { Figure } from "@/lib/tools/figures";
import { countries, exemptNationalities } from "./countries";
import * as ai from "./aiReadiness";
import * as hr from "./houseRules";
import * as tc from "./titleChecker";
import * as ps from "./photoShotList";
import * as db from "./descriptionBuilder";

/**
 * Seed values for figures and dates used by the tools. The live values are in
 * the `figures` database table (edit them there, e.g. with `npm run db:studio`).
 * Seeding never overwrites a row that already exists.
 *
 * `verify: true` = confirm the value and source before launch.
 * Dates are ISO (YYYY-MM-DD) and shown as "31 March 2027".
 */
const checked = "2026-11-17";

export const figuresSeed: Figure[] = [
  {
    key: "rulesLastChecked",
    value: "2026-11-17",
    label: "Date the UK rules were last checked",
    sourceTitle: "VA for BnB editorial check",
    sourceUrl: null,
    lastChecked: checked,
    verify: true,
  },
  {
    key: "england.register.by",
    value: "March 2027",
    label: "England short-let register: expected fully operational by",
    sourceTitle: "GOV.UK",
    sourceUrl: null,
    lastChecked: checked,
    verify: true,
  },
  {
    key: "wales.register.deadline",
    value: "2027-03-31",
    label: "Wales visitor accommodation register: deadline",
    sourceTitle: "Welsh Government",
    sourceUrl: "https://www.gov.wales",
    lastChecked: checked,
    verify: true,
  },
  {
    key: "tax.property.rates2027",
    value: "22%, 42% and 47%",
    label: "Property income tax rates from April 2027",
    sourceTitle: "GOV.UK",
    sourceUrl: null,
    lastChecked: checked,
    verify: true,
  },
  {
    key: "tax.property.from",
    value: "2027-04-06",
    label: "Property income tax rates change from",
    sourceTitle: "GOV.UK",
    sourceUrl: null,
    lastChecked: checked,
    verify: true,
  },
  {
    key: "levy.edinburgh",
    value: { rate: "5% of the accommodation cost, first 5 nights", start: "2026-07-24" },
    label: "Edinburgh visitor levy",
    sourceTitle: "City of Edinburgh Council",
    sourceUrl: "https://www.edinburgh.gov.uk",
    lastChecked: checked,
    verify: false,
  },
  {
    key: "levy.glasgow",
    value: { rate: "5% of the accommodation cost", start: "2027-01-01" },
    label: "Glasgow visitor levy",
    sourceTitle: "Glasgow City Council",
    sourceUrl: "https://www.glasgow.gov.uk",
    lastChecked: checked,
    verify: true,
  },
  {
    key: "levy.aberdeen",
    value: { rate: "7% of the accommodation cost", start: "2027-04-01" },
    label: "Aberdeen visitor levy",
    sourceTitle: "Aberdeen City Council",
    sourceUrl: "https://www.aberdeencity.gov.uk",
    lastChecked: checked,
    verify: true,
  },
  {
    key: "levy.stirling",
    value: { rate: "3% of the accommodation cost", start: "2027-06-01" },
    label: "Stirling visitor levy",
    sourceTitle: "Stirling Council",
    sourceUrl: "https://www.stirling.gov.uk",
    lastChecked: checked,
    verify: true,
  },
  {
    key: "levy.west-dunbartonshire",
    value: { rate: "5% of the accommodation cost", start: "2027-07-01" },
    label: "West Dunbartonshire visitor levy",
    sourceTitle: "West Dunbartonshire Council",
    sourceUrl: "https://www.west-dunbarton.gov.uk",
    lastChecked: checked,
    verify: true,
  },
  {
    key: "levy.cardiff",
    value: { rate: "£1.30 per person per night (75p at hostels and campsites)", start: "2027-04-01" },
    label: "Cardiff visitor levy",
    sourceTitle: "Cardiff Council",
    sourceUrl: "https://www.cardiff.gov.uk",
    lastChecked: checked,
    verify: true,
  },

  /* ---- Business rates qualifier ----------------------------------------- */
  ...businessRates(),

  /* ---- London 90-night counter ------------------------------------------- */
  ...londonNights(),
  ...certificates(),
  ...visitorLevy(),
  ...guestRegister(),
  ...houseRules(),
  ...aiReadiness(),
  ...titleChecker(),
  ...photoShotList(),
  ...descriptionBuilder(),
];

/** AI-readiness listing scorer: scoring model v2, listing limits and the background source (structured content). */
function aiReadiness(): Figure[] {
  const ours = { sourceTitle: "VA for BnB AI-readiness scoring model (editable)", sourceUrl: null };
  const airbnb = { sourceTitle: "Airbnb listing editor: title and description limits", sourceUrl: "https://www.airbnb.co.uk/help" };
  const row = (key: string, value: Figure["value"], label: string, src: { sourceTitle: string; sourceUrl: string | null }, verify: boolean): Figure => ({
    key,
    value,
    unit: null,
    label,
    ...src,
    lastChecked: checked,
    verify,
  });
  return [
    row("aiReadiness.model", { json: ai.model }, `AI-readiness scorer: scoring model v${ai.model.version} (patterns, word lists, needs, guest types, triggers, points, bands, templates)`, ours, true),
    row("aiReadiness.limits", { json: ai.limits }, "AI-readiness scorer: title and description section character limits", airbnb, true),
    row("aiReadiness.source", { json: ai.source }, "AI-readiness scorer: Airbnb AI search announcement", { sourceTitle: ai.source.title, sourceUrl: ai.source.url }, true),
  ];
}

/** Airbnb title checker: limit, word lists, patterns, separators, templates and messages (structured content). */
function titleChecker(): Figure[] {
  const ours = { sourceTitle: "VA for BnB title checker rules (editable)", sourceUrl: null };
  const airbnb = { sourceTitle: tc.source.title, sourceUrl: tc.source.url };
  const row = (key: string, value: Figure["value"], unit: string | null, label: string, src: { sourceTitle: string; sourceUrl: string | null }, verify: boolean): Figure => ({
    key,
    value,
    unit,
    label,
    ...src,
    lastChecked: "2026-11-25",
    verify,
  });
  // The limit and counting method are their own rows (each with a VERIFY flag), so they're left out of the rules.
  const { limit, counting, ...rest } = tc.rules;
  return [
    row("titleChecker.limit", limit, "characters", "Title checker: Airbnb's recommended maximum title length (fewer than this is advised; longer titles get cut off)", airbnb, true),
    row("titleChecker.counting", counting, null, "Title checker: how characters are counted (graphemes = as people see them, an emoji counts as 1)", airbnb, true),
    row("titleChecker.rules", { json: rest }, null, `Title checker: rules v${tc.rules.version} (word lists, patterns, separators, builder templates, messages)`, ours, false),
    row("titleChecker.source", { json: tc.source }, null, "Title checker: Airbnb's title guidance", airbnb, true),
    row("titleChecker.contactSource", { json: tc.contactSource }, null, "Title checker: source for the no-contact-details check", { sourceTitle: tc.contactSource.title, sourceUrl: tc.contactSource.url }, true),
  ];
}

/** Photo shot list planner: order rules, counts, shot/caption/light/season/prep content (structured), plus the VERIFY limits. */
function photoShotList(): Figure[] {
  const ours = { sourceTitle: "VA for BnB photo shot list rules (editable)", sourceUrl: null };
  const airbnb = { sourceTitle: ps.source.title, sourceUrl: ps.source.url };
  const row = (key: string, value: Figure["value"], unit: string | null, label: string, src: { sourceTitle: string; sourceUrl: string | null }, verify: boolean): Figure => ({
    key,
    value,
    unit,
    label,
    ...src,
    lastChecked: "2026-11-25",
    verify,
  });
  // The caption limit and photo-count range are their own rows (each with a VERIFY flag), so they're left out of the rules.
  const { captionLimit, photoCount, ...rest } = ps.rules;
  return [
    row("photoShotList.rules", { json: rest }, null, `Photo shot list planner: rules v${ps.rules.version} (order lists, guest priorities, shots per item, shot, staging, caption, light, season and prep content)`, ours, false),
    row("photoShotList.captionLimit", captionLimit, "characters", "Photo shot list planner: caption length shown in the counter (Airbnb doesn't publish a limit)", airbnb, true),
    row("photoShotList.photoCount", { json: photoCount }, null, "Photo shot list planner: recommended photo range (warnings outside it), Airbnb's minimum, and the typical range in the FAQ", airbnb, true),
    row("photoShotList.source", { json: ps.source }, null, "Photo shot list planner: Airbnb's photo guidance", airbnb, true),
  ];
}

/** AI-ready description builder: sentence templates, short forms, tone swaps, compaction steps (structured). Limits are the scorer's aiReadiness.limits. */
function descriptionBuilder(): Figure[] {
  return [
    {
      key: "descriptionBuilder.templates",
      value: { json: db.templates },
      unit: null,
      label: `AI-ready description builder: templates v${db.templates.version} (sentences, hooks, short forms, tone swaps, Make it fit steps, honest notes)`,
      sourceTitle: "VA for BnB description templates (editable)",
      sourceUrl: null,
      lastChecked: "2026-11-25",
      verify: false,
    },
  ];
}

/** House rules generator: templates, checker lists, platform labels, limits (structured content). */
function houseRules(): Figure[] {
  const ours = { sourceTitle: "VA for BnB house rules library (editable)", sourceUrl: null };
  const airbnb = { sourceTitle: "Airbnb Help Centre: house rules and listing settings", sourceUrl: "https://www.airbnb.co.uk/help" };
  const row = (key: string, value: Figure["value"], label: string, src: { sourceTitle: string; sourceUrl: string | null }, verify: boolean, unit: string | null = null): Figure => ({
    key,
    value,
    unit,
    label,
    ...src,
    lastChecked: checked,
    verify,
  });
  return [
    row("houseRules.sections", { json: hr.sections }, "House rules: sections, in order", ours, false),
    row("houseRules.templates", { json: hr.templates }, "House rules: rule templates (friendly and short wording, locked rules, listing and sign flags)", ours, true),
    row(
      "houseRules.checker",
      { json: { ...hr.checker, limits: hr.checkerLimits } },
      "House rules: fair-rules checker word lists and messages",
      { sourceTitle: "Equality Act 2010; DMCC Act 2024; Airbnb camera and party policies", sourceUrl: "https://www.legislation.gov.uk/ukpga/2010/15" },
      true,
    ),
    row("houseRules.platformLabels", { json: hr.platformLabels }, "House rules: Airbnb and Booking.com setting labels", airbnb, true),
    row("houseRules.listingLimit", 1000, "House rules: character limit of the listing’s additional rules box", airbnb, true, "characters"),
  ];
}

/** Guest register builder: who to record, what to record and how long to keep it. */
function guestRegister(): Figure[] {
  const order = { sourceTitle: "Immigration (Hotel Records) Order 1972", sourceUrl: "https://www.legislation.gov.uk/uksi/1972/1689" };
  const row = (key: string, value: Figure["value"], unit: string | null, label: string, src: { sourceTitle: string; sourceUrl: string | null }, verify: boolean): Figure => ({
    key,
    value,
    unit,
    label,
    ...src,
    lastChecked: checked,
    verify,
  });
  return [
    row("guestRegister.minAge", 16, "years", "Guest register: record every guest this age or older", order, false),
    row("guestRegister.retentionMonths", 12, "months", "Guest register: keep records for at least this many months", order, false),
    row(
      "guestRegister.exemptNationalities",
      exemptNationalities,
      null,
      "Guest register: nationalities that need only name, nationality and arrival date (British, Irish, Commonwealth). Code: name",
      { sourceTitle: "Immigration (Hotel Records) Order 1972, article 4; Commonwealth Secretariat member list", sourceUrl: "https://thecommonwealth.org/our-member-countries" },
      true,
    ),
    row(
      "guestRegister.extraFields",
      { idNumber: "required", placeOfIssue: "required", nextDestination: "required", nextAddress: "optional" },
      null,
      "Guest register: extra details for other guests (required or optional)",
      order,
      false,
    ),
    row("guestRegister.countries", countries, null, "Guest register: nationality choices. Code: name", { sourceTitle: "ISO 3166 country list, plus British nationality categories", sourceUrl: null }, false),
  ];
}

/**
 * Visitor levy calculator. One row per area: add a row to add an area (no code
 * change) as long as it's "percent" or "perPersonNight".
 * Fields (all text): name, nation (scotland | wales | england), order,
 * type (percent | perPersonNight), rate (percent, e.g. "5"; or £ per person
 * per night, e.g. "1.30"), lowerRate (£, hostels and campsites), nightCap
 * (nights, "" = none), start (YYYY-MM-DD), exemptBookedPaidBefore
 * (YYYY-MM-DD or ""), feesIncluded ("yes" | "no"), maxNightsCharged ("" = none),
 * url (official levy page).
 */
function visitorLevy(): Figure[] {
  const area = (key: string, value: Record<string, string>, sourceTitle: string, verify: boolean): Figure => ({
    key: `levy.calc.${key}`,
    value,
    unit: null,
    label: `Visitor levy calculator: ${value.name}`,
    sourceTitle,
    sourceUrl: value.url,
    lastChecked: checked,
    verify,
  });
  const pct = { type: "percent", lowerRate: "", feesIncluded: "no", maxNightsCharged: "", exemptBookedPaidBefore: "" };
  return [
    area(
      "edinburgh",
      { ...pct, name: "Edinburgh", nation: "scotland", order: "1", rate: "5", nightCap: "5", start: "2026-07-24", exemptBookedPaidBefore: "2025-10-01", url: "https://www.edinburgh.gov.uk/visitorlevy" },
      "City of Edinburgh Council: Visitor Levy",
      true,
    ),
    area("glasgow", { ...pct, name: "Glasgow", nation: "scotland", order: "2", rate: "5", nightCap: "", start: "2027-01-01", url: "https://www.glasgow.gov.uk/visitorlevy" }, "Glasgow City Council: Visitor Levy", true),
    area("aberdeen", { ...pct, name: "Aberdeen", nation: "scotland", order: "3", rate: "7", nightCap: "", start: "2027-04-01", url: "https://www.aberdeencity.gov.uk/visitorlevy" }, "Aberdeen City Council: Visitor Levy", true),
    area("stirling", { ...pct, name: "Stirling", nation: "scotland", order: "4", rate: "3", nightCap: "7", start: "2027-06-01", url: "https://www.stirling.gov.uk/visitorlevy" }, "Stirling Council: Visitor Levy", true),
    area(
      "west-dunbartonshire",
      { ...pct, name: "West Dunbartonshire", nation: "scotland", order: "5", rate: "5", nightCap: "", start: "2027-07-01", url: "https://www.west-dunbarton.gov.uk/visitorlevy" },
      "West Dunbartonshire Council: Visitor Levy",
      true,
    ),
    area(
      "cardiff",
      {
        name: "Cardiff",
        nation: "wales",
        order: "6",
        type: "perPersonNight",
        rate: "1.30",
        lowerRate: "0.75",
        nightCap: "",
        start: "2027-04-01",
        exemptBookedPaidBefore: "",
        feesIncluded: "no",
        maxNightsCharged: "",
        url: "https://www.gov.wales/visitor-levy",
      },
      "Welsh Government: Visitor levy",
      true,
    ),
    {
      key: "vat.standardRate",
      value: 20,
      unit: "%",
      label: "UK standard VAT rate",
      sourceTitle: "GOV.UK: VAT rates",
      sourceUrl: "https://www.gov.uk/guidance/rates-of-vat-on-different-goods-and-services",
      lastChecked: checked,
      verify: false,
    },
  ];
}

function certificates(): Figure[] {
  const hseGas = { sourceTitle: "HSE: Gas safety, landlords and holiday accommodation", sourceUrl: "https://www.hse.gov.uk/gas/landlords/" };
  const scotOrder = {
    sourceTitle: "Licensing of Short-term Lets (Scotland) Order 2022, Schedule 3 (mandatory licence conditions)",
    sourceUrl: "https://www.legislation.gov.uk/ssi/2022/32/schedule/3",
  };
  const fire = {
    sourceTitle: "GOV.UK: Making your small paying guest accommodation safe from fire",
    sourceUrl: "https://www.gov.uk/government/publications/making-your-small-paying-guest-accommodation-safe-from-fire",
  };
  const hseLeg = { sourceTitle: "HSE: Legionnaires’ disease", sourceUrl: "https://www.hse.gov.uk/legionnaires/" };
  const ours = { sourceTitle: "VA for BnB assumption (editable)", sourceUrl: null };
  const row = (key: string, value: Figure["value"], unit: string | null, label: string, src: { sourceTitle: string; sourceUrl: string | null }, verify: boolean): Figure => ({
    key,
    value,
    unit,
    label,
    ...src,
    lastChecked: checked,
    verify,
  });
  // Tags: "required" or "recommended" per nation (London follows England). A nation
  // missing from a table means the check doesn't apply there (e.g. the Scottish licence).
  const tagLabel = "required or recommended, by nation (england, scotland, wales, ni)";
  return [
    row("cert.gas.months", 12, "months", "Gas safety check: months between checks", hseGas, false),
    row("cert.gas.earlyWindowMonths", 2, "months", "Gas: a check done up to this many months before the old due date keeps the old anniversary", hseGas, true),
    row("cert.eicr.months", 60, "months", "Electrical report (EICR): months between inspections, unless the report gives a date", scotOrder, true),
    row("cert.fra.reviewMonths", 12, "months", "Fire risk assessment: months between reviews", fire, false),
    row("cert.pat.months", 12, "months", "Portable appliance testing: default months between tests (a starting point)", { sourceTitle: "VA for BnB starting point; PAT is a Scottish licence condition", sourceUrl: null }, true),
    row("cert.pat.monthsOptions", [12, 24, 36], "months", "PAT: intervals the host can choose", ours, false),
    row("cert.legionella.reviewMonths", 24, "months", "Legionella risk assessment: months between reviews (a starting point)", { ...hseLeg, sourceTitle: "VA for BnB starting point; see HSE: Legionnaires’ disease" }, true),
    row("cert.dueSoonDays", 60, "days", "Show “Due soon” this many days before the due date", ours, true),
    row("cert.defaultReminderDays", 30, "days", "Default calendar reminder, days before the due date", ours, true),
    row("cert.reminderDaysOptions", [7, 30, 60], "days", "Calendar reminder choices, days before the due date", ours, false),
    row("cert.secondReminderDays", 7, "days", "Optional second calendar reminder, days before the due date", ours, false),
    row("cert.tag.gas", { england: "required", scotland: "required", wales: "required", ni: "required" }, null, `Gas safety check: ${tagLabel}`, hseGas, false),
    row("cert.tag.eicr", { england: "recommended", scotland: "required", wales: "recommended", ni: "recommended" }, null, `EICR: ${tagLabel}`, scotOrder, true),
    row("cert.tag.fra", { england: "required", scotland: "required", wales: "required", ni: "required" }, null, `Fire risk assessment: ${tagLabel}`, fire, false),
    row("cert.tag.pat", { england: "recommended", scotland: "required", wales: "recommended", ni: "recommended" }, null, `PAT: ${tagLabel}`, scotOrder, true),
    row("cert.tag.legionella", { england: "recommended", scotland: "recommended", wales: "recommended", ni: "recommended" }, null, `Legionella: ${tagLabel}`, hseLeg, true),
    row("cert.tag.licence", { scotland: "required" }, null, `Short-term let licence renewal: ${tagLabel}`, scotOrder, false),
    row("cert.tag.niCert", { ni: "required" }, null, `Tourism NI certificate: ${tagLabel}`, { sourceTitle: "Tourism NI: certification", sourceUrl: "https://www.tourismni.com" }, true),
    row("cert.tag.insurance", { england: "recommended", scotland: "recommended", wales: "recommended", ni: "recommended" }, null, `Insurance renewal: ${tagLabel}`, ours, true),
  ];
}

function londonNights(): Figure[] {
  const src = {
    sourceTitle: "Deregulation Act 2015, section 44 (amending the Greater London Council (General Powers) Act 1973, section 25A)",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/2015/20/section/44",
  };
  return [
    { key: "london.maxShortLetNights", value: 90, unit: "nights", label: "London: most short-let nights per calendar year without planning permission", ...src, lastChecked: checked, verify: false },
    { key: "london.longStayMinNights", value: 90, unit: "nights", label: "London: a stay this many consecutive nights or longer isn’t a short stay", ...src, lastChecked: checked, verify: false },
    {
      key: "london.warnAtNights",
      value: 75,
      unit: "nights",
      label: "London: show “Getting close” from this many nights (our assumption)",
      sourceTitle: "VA for BnB assumption (editable)",
      sourceUrl: null,
      lastChecked: checked,
      verify: false,
    },
  ];
}

function businessRates(): Figure[] {
  const england = {
    sourceTitle: "GOV.UK: Business rates for self-catering and holiday let accommodation (Valuation Office Agency)",
    sourceUrl: "https://www.gov.uk/introduction-to-business-rates/self-catering-and-holiday-let-accommodation",
  };
  const scotland = {
    sourceTitle: "Scottish Government / Scottish Assessors: self-catering and non-domestic rates",
    sourceUrl: "https://www.saa.gov.uk",
  };
  const wales = {
    sourceTitle: "Welsh Government: self-catering accommodation and local taxes",
    sourceUrl: "https://www.gov.wales",
  };
  const row = (key: string, value: Figure["value"], unit: string, label: string, src: { sourceTitle: string; sourceUrl: string }, verify = false): Figure => ({
    key,
    value,
    unit,
    label,
    ...src,
    lastChecked: checked,
    verify,
  });
  return [
    row("england.businessRates.minAvailableDays", 140, "days", "England: days available to let (last and next 12 months)", england),
    row("england.businessRates.minLetDays", 70, "days", "England: days actually let (last 12 months)", england),
    row("scotland.businessRates.minAvailableDays", 140, "days", "Scotland: days available to let in the year", scotland, true),
    row("scotland.businessRates.minLetDays", 70, "days", "Scotland: days actually let", scotland, true),
    row("wales.businessRates.minAvailableDays", 252, "days", "Wales: days available to let (last and next 12 months)", wales),
    row("wales.businessRates.minLetDays", 182, "days", "Wales: days actually let (last 12 months, or averaged)", wales),
    row("wales.businessRates.maxCharityDays", 14, "days", "Wales: most days let free or cheaply to a charity that can count", wales),
    row("wales.businessRates.averagingYears", [2, 3], "years", "Wales: let days can be averaged over this many years (from April 2026)", wales, true),
    row(
      "england.councilTax.secondHomePremiumMax",
      100,
      "%",
      "England: maximum council tax second-home premium",
      { sourceTitle: "GOV.UK: Council tax on second homes and empty properties", sourceUrl: "https://www.gov.uk/council-tax/second-homes-and-empty-properties" },
    ),
    row("scotland.councilTax.secondHomePremiumMax", 100, "%", "Scotland: maximum council tax second-home premium", {
      sourceTitle: "Scottish Government: council tax on second homes",
      sourceUrl: "https://www.gov.scot",
    }),
    row("wales.councilTax.secondHomePremiumMax", 300, "%", "Wales: maximum council tax second-home premium", {
      sourceTitle: "Welsh Government: council tax premiums on second homes",
      sourceUrl: "https://www.gov.wales",
    }),
  ];
}
