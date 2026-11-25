import { areaOptions, extraOptions, gasOptions, letTypeOptions, nationOptions, needsArea, ownershipOptions, yesNoOptions } from "./questions";
import type { Answers, CompleteAnswers, Extra, Facts, Ownership, ValidationErrors } from "./types";

export const emptyAnswers = (): Answers => ({ ownership: [], extras: [] });

const values = <T extends string>(opts: { value: T }[]) => opts.map((o) => o.value);
const NATIONS = values(nationOptions);
const LET = values(letTypeOptions);
const YESNO = values(yesNoOptions);
const GAS = values(gasOptions);
const OWN = values(ownershipOptions);
const EXTRAS = values(extraOptions);

/* ---- Updating answers --------------------------------------------------- */

type SingleKey = "nation" | "area" | "letType" | "mainHome" | "gas";

/** Set a single-choice answer. Changing the nation clears the area. */
export function setSingle(answers: Answers, key: SingleKey, value: string): Answers {
  const next = { ...answers, [key]: value } as Answers;
  if (key === "nation" && value !== answers.nation) delete next.area;
  return next;
}

/** Tick or untick an ownership option. */
export function toggleOwnership(answers: Answers, value: Ownership, checked: boolean): Answers {
  const set = new Set(answers.ownership);
  if (checked) set.add(value);
  else set.delete(value);
  return { ...answers, ownership: OWN.filter((o) => set.has(o)) };
}

/** Tick or untick an extra. "None" clears the others; any other option clears "None". */
export function toggleExtra(answers: Answers, value: Extra, checked: boolean): Answers {
  let next: Extra[];
  if (!checked) next = answers.extras.filter((e) => e !== value);
  else if (value === "none") next = ["none"];
  else next = [...answers.extras.filter((e) => e !== "none" && e !== value), value];
  return { ...answers, extras: EXTRAS.filter((e) => next.includes(e)) };
}

/* ---- Validation --------------------------------------------------------- */

export type ValidationResult = { ok: true; answers: CompleteAnswers } | { ok: false; errors: ValidationErrors };

export function validate(answers: Answers): ValidationResult {
  const errors: ValidationErrors = {};
  const a = answers;

  if (!a.nation || !NATIONS.includes(a.nation)) errors.nation = "Choose where your property is.";
  if (needsArea(a.nation)) {
    const allowed = areaOptions[a.nation as "scotland" | "wales"].map((o) => o.value);
    if (!a.area || !allowed.includes(a.area)) errors.area = "Choose your council area.";
  } else if (a.area) {
    errors.area = "A council area is only needed in Scotland or Wales.";
  }
  if (!a.letType || !LET.includes(a.letType)) errors.letType = "Choose what you let.";
  if (!a.mainHome || !YESNO.includes(a.mainHome)) errors.mainHome = "Choose yes or no.";
  if (!a.gas || !GAS.includes(a.gas)) errors.gas = "Choose yes, no or not sure.";

  if (!Array.isArray(a.ownership) || a.ownership.length === 0) errors.ownership = "Tick at least one option.";
  else if (a.ownership.some((o) => !OWN.includes(o)) || new Set(a.ownership).size !== a.ownership.length)
    errors.ownership = "Choose from the options shown.";

  if (!Array.isArray(a.extras) || a.extras.some((e) => !EXTRAS.includes(e)) || new Set(a.extras).size !== a.extras.length)
    errors.extras = "Choose from the options shown.";
  else if (a.extras.includes("none") && a.extras.length > 1) errors.extras = "“None of these” can’t be combined with other options.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, answers: a as CompleteAnswers };
}

/** Is a single question answered validly (used to enable Next)? */
export function isAnswered(key: keyof Answers, answers: Answers): boolean {
  if (key === "extras") return true; // optional: no ticks means none apply
  const result = validate(answers);
  return result.ok || !(key in result.errors);
}

/* ---- Facts -------------------------------------------------------------- */

export function deriveFacts(a: CompleteAnswers): Facts {
  return {
    nation: a.nation,
    region: a.nation === "london" ? "england" : a.nation,
    area: needsArea(a.nation) ? (a.area ?? null) : null,
    letType: a.letType,
    mainHome: a.mainHome,
    gasOn: a.gas === "yes" || a.gas === "not-sure",
    ownership: a.ownership,
    extras: a.extras.filter((e): e is Exclude<Extra, "none"> => e !== "none"),
  };
}

/* ---- Reading saved answers --------------------------------------------- */

/** Turn anything (e.g. JSON from localStorage) into safe Answers; drops unknown values. */
export function sanitizeAnswers(input: unknown): Answers {
  const a = emptyAnswers();
  if (!input || typeof input !== "object") return a;
  const o = input as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, allowed: T[]) => (allowed.includes(v as T) ? (v as T) : undefined);

  a.nation = pick(o.nation, NATIONS);
  if (needsArea(a.nation)) a.area = pick(o.area, areaOptions[a.nation as "scotland" | "wales"].map((x) => x.value));
  a.letType = pick(o.letType, LET);
  a.mainHome = pick(o.mainHome, YESNO);
  a.gas = pick(o.gas, GAS);
  a.ownership = Array.isArray(o.ownership) ? OWN.filter((x) => (o.ownership as unknown[]).includes(x)) : [];
  const extras = Array.isArray(o.extras) ? EXTRAS.filter((x) => (o.extras as unknown[]).includes(x)) : [];
  a.extras = extras.includes("none") && extras.length > 1 ? extras.filter((e) => e !== "none") : extras;
  for (const k of Object.keys(a) as (keyof Answers)[]) if (a[k] === undefined) delete a[k];
  return a;
}
