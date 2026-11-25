import { brand } from "@/config/brand";
import type { Answers, ComplianceResult } from "@/lib/tools/compliance";

/**
 * Interface text for the UK short-let compliance checker. Rule wording,
 * figures and dates are NOT here: they live in the database (see
 * src/data/compliance/rules.seed.ts and src/data/figures.seed.ts).
 */

export const toolSlug = "uk-short-let-compliance-checker";
export const toolPath = `/free-tools/${toolSlug}`;
export const storageKey = `vaforbnb:tool:${toolSlug}:v1`;

export const checkerCopy = {
  tryExample: "Try an example",
  back: "Back",
  next: "Next",
  seeResults: "See my checklist",
  gasNote: "If you’re not sure, check. We’ve included the gas rule to be safe.",
  tallyTitle: "Your checklist so far",
  tallyEmpty: "Answer the first question to see your count.",
  privacy: "Nothing you enter leaves your browser.",
  clear: "Clear my saved answers",
  resultsHeading: "These rules apply to your property",
  yourAnswers: "Your answers",
  edit: "Edit",
  stepsLabel: "What to do",
  detailsLabel: "Details in the Rules Hub →",
  actions: {
    copy: "Copy checklist",
    copied: "Checklist copied",
    print: "Print",
    pdf: "Download the PDF",
    restart: "Start again",
  },
  pdfModal: {
    title: "Download your checklist",
    intro:
      "Your PDF is created on this device, so nothing you answered is sent to us. Want updates when UK rules change? Add your email and tick the box.",
    consent: `Email me occasional updates and rule changes from ${brand.name}. Unsubscribe any time.`,
    submit: "Download the PDF",
    done: "Your PDF has downloaded.",
    error: "Your PDF has downloaded, but we couldn’t save your email. Please try again later.",
  },
};

/** Rules with a helper tool: a button on the rule card, shown once the tool is live. */
/** `query` opens the tool with one item highlighted, e.g. ?item=gas. "{area}" is replaced with the host’s council area. */
export const ruleTools: Record<string, { slug: string; label: string; query?: string }> = {
  "london-90-nights": { slug: "london-90-night-counter", label: "Count my nights" },
  "gas-safety-annual": { slug: "holiday-let-certificate-reminders", label: "Set a reminder", query: "?item=gas" },
  "fire-risk-assessment": { slug: "holiday-let-certificate-reminders", label: "Set a reminder", query: "?item=fra" },
  "scotland-eicr-pat": { slug: "holiday-let-certificate-reminders", label: "Set a reminder", query: "?item=eicr" },
  "legionella-assessment": { slug: "holiday-let-certificate-reminders", label: "Set a reminder", query: "?item=legionella" },
  "visitor-levy": { slug: "uk-visitor-levy-calculator", label: "Calculate the levy", query: "?area={area}" },
  "guest-register-1972": { slug: "guest-register-template", label: "Make my guest register" },
  "assistance-dogs": { slug: "house-rules-generator", label: "Write my house rules" },
  "cctv-data-protection": { slug: "house-rules-generator", label: "Write my house rules" },
  "no-14-day-cancellation": { slug: "house-rules-generator", label: "Write my house rules" },
};

/** Extra related tools by nation, shown under the results' page once live (hub card ids). */
export const relatedByNation: Partial<Record<NonNullable<Answers["nation"]>, string[]>> = {
  london: ["london-90-night-counter"],
};

/** "Try an example": London, whole home, not main home, gas, mortgaged, direct bookings. */
export const exampleAnswers: Answers = {
  nation: "london",
  letType: "whole-home",
  mainHome: "no",
  gas: "yes",
  ownership: ["mortgaged"],
  extras: ["direct-bookings"],
};

/* ---- "What this means": 2–3 sentences chosen by the result ---------------- */

export const whatThisMeansDefault =
  "Your checklist shows which national rules apply to your property, sorted by urgency. Start with Must do now, put the Coming soon items in your diary, and check your mortgage, lease or tenancy for anything under Check your contract.";

export function whatThisMeans(result: ComplianceResult, answers: Answers): string {
  const has = (id: string) => Object.values(result.groups).some((g) => g.some((r) => r.ruleId === id));
  const first: Record<NonNullable<Answers["nation"]>, string> = {
    scotland: "In Scotland the licence comes first: you can’t take bookings without one, and your licence number must appear in every listing.",
    ni: "In Northern Ireland your Tourism NI certificate comes first: you need it before you advertise or take bookings.",
    wales: "In Wales the safety basics apply from your first booking, and registration is on its way, so get your certificates in order now.",
    london: has("london-90-nights")
      ? "In London the 90-night limit is the rule hosts most often break: count nights across every platform and direct booking."
      : "In London the national safety rules apply from your first booking, and your borough decides on planning.",
    england:
      "In England there’s no licence yet, but the safety rules apply from your first booking, and your council decides whether you need planning permission.",
  };
  const parts = [first[answers.nation ?? "england"]];
  if (result.counts.comingSoon > 0) parts.push("The Coming soon items have dates attached, so add them to your diary now.");
  parts.push(
    result.counts.checkContract > 0
      ? "Check your contract early: if your lender, freeholder or landlord doesn’t allow short lets, the other rules won’t matter."
      : "Each rule links to its official source, so you can check the detail yourself.",
  );
  return parts.join(" ");
}
