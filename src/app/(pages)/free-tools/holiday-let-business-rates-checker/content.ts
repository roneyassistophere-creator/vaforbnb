import { anchors, routes } from "@/config/navigation";
import { numberFigure, fillTemplate, type Figures } from "@/lib/tools/figures";
import type { FaqEntry } from "@/lib/seo";

/**
 * Page copy for /free-tools/holiday-let-business-rates-checker.
 * Every threshold, cap and premium is a {figure.key} placeholder filled from
 * the stored figures, so changing a figure updates this page too.
 */

export const hero = {
  title: "Does my holiday let qualify for business rates?",
  shortAnswer:
    "Enter your nation, the days your property is available and the days it was actually let. You’ll see whether it meets the tests for business rates, and how many more days you need if it doesn’t.",
  nations: ["England", "Scotland", "Wales"],
  job: "Stay legal",
};

export const rulesHub = {
  england: `${routes.ukRules}#business-rates-england`,
  scotland: `${routes.ukRules}#business-rates-scotland`,
  wales: `${routes.ukRules}#business-rates-wales`,
  premium: `${routes.ukRules}#second-homes-premium`,
  all: anchors.rulesList,
};

export const nextStep = {
  eyebrow: "Next step",
  title: "Know your real profit: monthly finance check",
  text: "Business rates or council tax is one of your biggest fixed costs. Our team closes your books every month and shows what each property really earns.",
  cta: "See the finance check",
  href: "/services/finance-check",
  secondary: { label: "Read the full rules in the UK Rules Hub", href: rulesHub.all },
};

/** "How it works": the tests for each nation, written from the stored figures. */
export const howItWorks = {
  title: "How it works",
  intro: "The checker compares your days with the tests for your nation. Each test uses the official figure shown below.",
  nations: [
    {
      key: "england" as const,
      name: "England (including London)",
      text: "It must have been available to let for at least {england.businessRates.minAvailableDays} days in the last 12 months, you must plan to make it available for at least {england.businessRates.minAvailableDays} days in the next 12 months, and it must have been actually let for at least {england.businessRates.minLetDays} days in the last 12 months.",
      sourceKey: "england.businessRates.minAvailableDays",
      rulesHub: rulesHub.england,
    },
    {
      key: "scotland" as const,
      name: "Scotland",
      text: "It must be available to let for at least {scotland.businessRates.minAvailableDays} days in the year, and have been actually let for at least {scotland.businessRates.minLetDays} days. Your local assessor decides.",
      sourceKey: "scotland.businessRates.minAvailableDays",
      rulesHub: rulesHub.scotland,
    },
    {
      key: "wales" as const,
      name: "Wales",
      text: "It must have been available to let for at least {wales.businessRates.minAvailableDays} days in the last 12 months and planned for the next 12 months, and actually let for at least {wales.businessRates.minLetDays} days. The let days can be averaged over {wales.businessRates.averagingYears} years, and up to {wales.businessRates.maxCharityDays} days let free or cheaply to a charity can count.",
      sourceKey: "wales.businessRates.minAvailableDays",
      rulesHub: rulesHub.wales,
    },
  ],
  premium: {
    name: "If it doesn’t meet the tests",
    text: "The property pays council tax instead. Many councils add a second-home premium of up to {premiumText}.",
    sourceKeys: ["england.councilTax.secondHomePremiumMax", "scotland.councilTax.secondHomePremiumMax", "wales.councilTax.secondHomePremiumMax"],
    rulesHub: rulesHub.premium,
  },
  note: "Count days, not stays: a 3-night booking is 3 days. Only count stays on normal commercial terms, not free stays for you, friends or family.",
};

export const limits = {
  title: "Limits",
  text: "Meeting the tests doesn’t mean automatic business rates. The assessor decides, and small business rate relief has its own conditions. This tool checks day counts only. It doesn’t cover Northern Ireland, valuations or the amount you’d pay.",
  disclaimer: "General information, not legal or tax advice. Check with the Valuation Office Agency, your assessor or your council.",
};

export const related = {
  title: "Related tools",
  ids: ["short-let-profit-calculator", "uk-compliance-checker"],
};

export const changelog: { date: string; note: string }[] = [
  { date: "2026-11-24", note: "First version: day-count tests for England, Scotland and Wales, including Welsh averaging and charity days." },
];

/** "up to 100% in England and Scotland, and up to 300% in Wales" (merges nations with the same figure). */
export function premiumText(figures: Figures): string {
  const p = {
    England: numberFigure(figures, "england.councilTax.secondHomePremiumMax"),
    Scotland: numberFigure(figures, "scotland.councilTax.secondHomePremiumMax"),
    Wales: numberFigure(figures, "wales.councilTax.secondHomePremiumMax"),
  };
  const groups = new Map<number, string[]>();
  for (const [n, v] of Object.entries(p)) groups.set(v, [...(groups.get(v) ?? []), n]);
  const parts = [...groups.entries()].map(([v, ns]) => `${v}% in ${ns.length > 1 ? `${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}` : ns[0]}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")}, and up to ${parts[parts.length - 1]}` : parts[0];
}

/** FAQ, filled from the stored figures. Also published as FAQPage structured data. */
export function buildFaq(figures: Figures): FaqEntry[] {
  const f = (s: string) => fillTemplate(s, figures, { premiumText: premiumText(figures) });
  return [
    {
      q: "How many days must a holiday let be let for business rates in England?",
      a: f("It must be available to let for at least {england.businessRates.minAvailableDays} days and actually let for at least {england.businessRates.minLetDays} days."),
    },
    {
      q: "What are the rules in Wales?",
      a: f(
        "Available for at least {wales.businessRates.minAvailableDays} days and let for at least {wales.businessRates.minLetDays} days. The let days can be averaged over {wales.businessRates.averagingYears} years, and up to {wales.businessRates.maxCharityDays} days let free or cheaply to charities can count.",
      ),
    },
    {
      q: "What about Scotland?",
      a: f("Available for at least {scotland.businessRates.minAvailableDays} days in the year and actually let for at least {scotland.businessRates.minLetDays} days. The local assessor decides."),
    },
    {
      q: "What if I don’t qualify?",
      a: f("You pay council tax instead, and many councils charge a second-home premium: up to {premiumText}."),
    },
  ];
}
