import type { Answers, Extra, GasAnswer, LetType, Nation, Ownership, YesNo } from "./types";

/** Question definitions: the options shown to hosts and the values stored. */

export type Option<V extends string = string> = { value: V; label: string };

export type QuestionKey = "nation" | "area" | "letType" | "mainHome" | "gas" | "ownership" | "extras";

export type Question = {
  key: QuestionKey;
  title: string;
  hint?: string;
  multi?: boolean;
  /** Label used in the answer recap and tally. */
  short: string;
};

export const nationOptions: Option<Nation>[] = [
  { value: "england", label: "England (outside London)" },
  { value: "london", label: "London" },
  { value: "scotland", label: "Scotland" },
  { value: "wales", label: "Wales" },
  { value: "ni", label: "Northern Ireland" },
];

export const areaOptions: Record<"scotland" | "wales", Option[]> = {
  scotland: [
    { value: "edinburgh", label: "Edinburgh" },
    { value: "glasgow", label: "Glasgow" },
    { value: "aberdeen", label: "Aberdeen" },
    { value: "stirling", label: "Stirling" },
    { value: "west-dunbartonshire", label: "West Dunbartonshire" },
    { value: "scotland-other", label: "Another Scottish council" },
  ],
  wales: [
    { value: "cardiff", label: "Cardiff" },
    { value: "wales-other", label: "Another Welsh council" },
  ],
};

/** Areas without their own figures (a council that may add a levy later). */
export const otherAreas = ["scotland-other", "wales-other"];

export const letTypeOptions: Option<LetType>[] = [
  { value: "whole-home", label: "The whole home" },
  { value: "room-in-my-home", label: "A room in my home" },
];

export const yesNoOptions: Option<YesNo>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const gasOptions: Option<GasAnswer>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
];

export const ownershipOptions: Option<Ownership>[] = [
  { value: "owned", label: "I own it outright" },
  { value: "mortgaged", label: "It has a mortgage" },
  { value: "leasehold", label: "It’s leasehold" },
  { value: "rent-to-rent", label: "I rent it from a landlord" },
];

export const extraOptions: Option<Extra>[] = [
  { value: "serve-food", label: "I serve food or breakfast" },
  { value: "provide-tv", label: "Guests can watch live TV or BBC iPlayer" },
  { value: "cctv-or-doorbell-camera", label: "I have a camera or video doorbell" },
  { value: "direct-bookings", label: "I take direct bookings" },
  { value: "none", label: "None of these" },
];

export const questions: Record<QuestionKey, Question> = {
  nation: { key: "nation", title: "Where is your property?", hint: "Rules differ across the UK.", short: "Where" },
  area: { key: "area", title: "Which council area is it in?", hint: "Some councils charge a visitor levy.", short: "Council" },
  letType: { key: "letType", title: "What do you let to guests?", hint: "Some rules only apply to whole homes.", short: "Letting" },
  mainHome: { key: "mainHome", title: "Is it your main home?", hint: "Where you live most of the time.", short: "Main home" },
  gas: { key: "gas", title: "Does the property have a gas supply?", hint: "A gas boiler, hob or fire.", short: "Gas" },
  ownership: { key: "ownership", title: "How do you hold the property?", hint: "Tick all that apply.", multi: true, short: "Ownership" },
  extras: { key: "extras", title: "Do any of these apply?", hint: "Tick all that apply.", multi: true, short: "Extras" },
};

/** Options for a question, given the answers so far (area depends on nation). */
export function optionsFor(key: QuestionKey, answers: Answers): Option[] {
  switch (key) {
    case "nation":
      return nationOptions;
    case "area":
      return answers.nation === "scotland" || answers.nation === "wales" ? areaOptions[answers.nation] : [];
    case "letType":
      return letTypeOptions;
    case "mainHome":
      return yesNoOptions;
    case "gas":
      return gasOptions;
    case "ownership":
      return ownershipOptions;
    case "extras":
      return extraOptions;
  }
}

export const needsArea = (nation?: Nation) => nation === "scotland" || nation === "wales";

/** The questions to ask, in order. The area question only shows for Scotland and Wales. */
export function questionSequence(answers: Answers): QuestionKey[] {
  return ["nation", ...(needsArea(answers.nation) ? (["area"] as const) : []), "letType", "mainHome", "gas", "ownership", "extras"];
}

export function labelFor(key: QuestionKey, value: string, answers: Answers): string {
  return optionsFor(key, answers).find((o) => o.value === value)?.label ?? value;
}

export function areaName(area: string | null | undefined): string | null {
  if (!area) return null;
  for (const list of Object.values(areaOptions)) {
    const o = list.find((x) => x.value === area);
    if (o) return o.label;
  }
  return null;
}
