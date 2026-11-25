import { routes } from "@/config/navigation";
import { monthsText } from "@/lib/tools/certificates";
import { numberFigure, type Figures } from "@/lib/tools/figures";
import type { FaqEntry } from "@/lib/seo";

/**
 * Page copy for /free-tools/holiday-let-certificate-reminders.
 * Every interval and window is read from the stored figures.
 */

export const hero = {
  title: "When are my holiday let safety checks due?",
  shortAnswer:
    "Enter the date of your last gas safety check, electrical report, fire risk assessment review and appliance tests, plus your licence and insurance renewal dates. See what’s due or overdue, and add reminders to your calendar with one download.",
  badges: ["All UK", "Stay legal"],
};

export const nextStep = {
  eyebrow: "Next step",
  title: "Want us to book these for you?",
  text: "We book your checks with your trades, chase the certificates and keep your dates up to date, alongside laundry and maintenance.",
  cta: "See laundry and maintenance",
  href: "/services/laundry-and-maintenance",
};

const months = (f: Figures, key: string) => monthsText(numberFigure(f, key));

/** "How it works": one line per check, each with the figure that sets its source. */
export function howItWorks(f: Figures): { text: string; sourceKey?: string; anchor?: string }[] {
  return [
    { text: `Gas safety check: every ${months(f, "cert.gas.months")}, by a Gas Safe registered engineer.`, sourceKey: "cert.gas.months", anchor: "gas-safety" },
    {
      text: `Gas checks done early: if the check was up to ${months(f, "cert.gas.earlyWindowMonths")} before the old due date and you enter that date, the new due date runs from the old one.`,
      sourceKey: "cert.gas.earlyWindowMonths",
    },
    {
      text: `Electrical report (EICR): every ${months(f, "cert.eicr.months")}, or the next inspection date written on your report if you enter it.`,
      sourceKey: "cert.eicr.months",
      anchor: "electrical-safety",
    },
    { text: `Fire risk assessment: reviewed every ${months(f, "cert.fra.reviewMonths")}, and after any significant change.`, sourceKey: "cert.fra.reviewMonths", anchor: "fire-risk-assessment" },
    { text: `Portable appliance testing: every ${months(f, "cert.pat.months")} as a starting point. You can change it.`, sourceKey: "cert.pat.months", anchor: "electrical-safety" },
    { text: `Legionella risk assessment: reviewed every ${months(f, "cert.legionella.reviewMonths")} as a starting point, sooner after changes.`, sourceKey: "cert.legionella.reviewMonths", anchor: "legionella" },
    { text: "Licence, Tourism NI certificate and insurance: the renewal or expiry date you enter is the due date.", anchor: "scotland-licence" },
    {
      text: `Months are calendar months. If the day doesn’t exist in the month, the last day is used: 31 January + 1 month is 28 February (29 in a leap year). “Due soon” means within ${numberFigure(f, "cert.dueSoonDays")} days. Dates use UK time.`,
      sourceKey: "cert.dueSoonDays",
    },
  ];
}

export const limits = {
  title: "Limits",
  text: "The tool only knows the dates you enter. It doesn’t check that the work was done, or that a certificate is valid. Your council licence, Tourism NI, your insurer, lender or lease may set different or extra checks. The intervals are general starting points: if your engineer or electrician gives a shorter one, use theirs. The calendar file doesn’t update itself.",
  disclaimer: "General information, not legal advice. Use the dates on your certificates if they differ, and follow your engineer’s or electrician’s advice.",
};

export const rulesLinks = [
  { label: "Gas safety", href: `${routes.ukRules}#gas-safety` },
  { label: "Electrical safety", href: `${routes.ukRules}#electrical-safety` },
  { label: "Fire risk assessment", href: `${routes.ukRules}#fire-risk-assessment` },
  { label: "Legionella", href: `${routes.ukRules}#legionella` },
  { label: "Scotland licence", href: `${routes.ukRules}#scotland-licence` },
  { label: "Tourism NI certificate", href: `${routes.ukRules}#ni-certificate` },
  { label: "Insurance", href: `${routes.ukRules}#insurance` },
];

export const related = { title: "Related tools", ids: ["uk-compliance-checker", "cleaning-checklist-generator"] };

export const changelog: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: due dates for gas, EICR, fire risk assessment, PAT, legionella, licences and insurance, with calendar reminders." },
];

export function buildFaq(f: Figures): FaqEntry[] {
  return [
    {
      q: "How often do holiday lets need a gas safety check?",
      a: `Every ${months(f, "cert.gas.months")}, by a Gas Safe registered engineer.`,
    },
    {
      q: "Is an EICR required for a holiday let?",
      a: "In Scotland, yes, as a condition of the short-term let licence. Elsewhere it’s strongly advised and expected by most insurers. Use the next inspection date on your report.",
    },
    {
      q: "How often should I review my fire risk assessment?",
      a: `Usually every ${numberFigure(f, "cert.fra.reviewMonths") === 12 ? "year" : months(f, "cert.fra.reviewMonths")}, and after any significant change to the property.`,
    },
    {
      q: "How often should appliances be PAT tested?",
      a: `There’s no single fixed interval in law. We use ${months(f, "cert.pat.months")} as a starting point; follow your electrician’s advice. Scottish licences require PAT testing.`,
    },
    {
      q: "Will the reminders update themselves?",
      a: "No. When a check is done, enter the new date here and download a fresh calendar file.",
    },
  ];
}
