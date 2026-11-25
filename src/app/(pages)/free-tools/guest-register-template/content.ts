import { routes } from "@/config/navigation";
import { numberFigure, type Figures } from "@/lib/tools/figures";
import type { FaqEntry } from "@/lib/seo";

/**
 * Page copy for /free-tools/guest-register-template.
 * The minimum age and retention months are read from the stored figures.
 */

export const hero = {
  title: "What guest records must I keep?",
  badges: ["All UK", "Stay legal"],
};

export const shortAnswer = (f: Figures) =>
  `UK law requires holiday lets to record details of every guest aged ${numberFigure(f, "guestRegister.minAge")} or over and keep them for at least ${numberFigure(f, "guestRegister.retentionMonths")} months. Download a ready guest register, or fill in a stay’s guests here. We’ll only ask for passport details when a guest’s nationality needs them.`;

export const links = {
  rulesHub: `${routes.ukRules}#guest-register`,
  rightToRent: `${routes.ukRules}#right-to-rent`,
  law: "https://www.legislation.gov.uk/uksi/1972/1689",
  ico: "https://ico.org.uk/for-organisations/advice-for-small-organisations/",
};

export const nextStep = {
  eyebrow: "Next step",
  title: "Want us to collect guest details for you?",
  text: "We collect guest details at check-in for you, ask only for what’s needed, and keep your register up to date as part of guest communication.",
  cta: "See guest communication",
  href: "/services/guest-communication",
  secondary: { label: "Guest records in the UK Rules Hub", href: links.rulesHub },
};

export function howItWorks(f: Figures): string[] {
  const age = numberFigure(f, "guestRegister.minAge");
  const months = numberFigure(f, "guestRegister.retentionMonths");
  return [
    `Who: every guest aged ${age} or over, at any paid sleeping accommodation, including holiday lets and Airbnbs. Under-${age}s are a count only.`,
    "Everyone: full name, nationality and date of arrival.",
    "Also, for guests who aren’t British, Irish or Commonwealth citizens: passport or other ID number, where it was issued, and their next destination, with the address if known. EU citizens (except Irish citizens) are included.",
    "Dual nationals: if either nationality is British, Irish or Commonwealth, only the basic details are needed.",
    `Keep each record for at least ${months} months after the stay. After that, delete it unless you have another reason to keep it (UK GDPR). The tool reminds you, and never deletes anything on its own.`,
  ];
}

export const limits = {
  title: "Limits",
  text: "The tool shows the details to record and keeps them on this device. It doesn’t check ID documents, and it can’t back up your register for you: download a CSV copy now and then. If you clear this browser’s data, the register is gone. Some councils, licences or platforms may ask for more.",
  disclaimer:
    "General information, not legal advice. This isn’t a Right to Rent check, which applies to some longer stays. Store records securely and only for as long as you need them.",
};

export const related = { title: "Related tools", ids: ["uk-compliance-checker", "welcome-guide-builder"] };

export const changelog: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: record stays with guided guest details, templates, a guest check-in card, a guest message, retention reminders and an optional passcode lock." },
];

export function buildFaq(f: Figures): FaqEntry[] {
  const age = numberFigure(f, "guestRegister.minAge");
  const months = numberFigure(f, "guestRegister.retentionMonths");
  return [
    { q: "Do Airbnb hosts have to keep guest records?", a: `Yes. Record the full name and nationality of every guest aged ${age} or over, and their date of arrival.` },
    {
      q: "Do I need passport details?",
      a: "Only for guests who aren’t British, Irish or Commonwealth citizens. For them, record their passport or ID number, where it was issued, and their next destination (with the address if known).",
    },
    { q: "Do EU guests need passport details?", a: "Yes. Since the UK left the EU, EU citizens (except Irish citizens) aren’t exempt, so record their passport or ID details too." },
    { q: "How long do I keep the records?", a: `At least ${months} months. After that, delete them unless you have another reason to keep them (UK GDPR).` },
    { q: "Can I keep the records digitally?", a: "Yes, as long as they’re stored securely and you can show them if the police ask." },
    { q: "Is this the same as a Right to Rent check?", a: "No. Right to Rent checks are for tenancies and some longer stays, not normal holiday lets. See the UK Rules Hub." },
  ];
}
