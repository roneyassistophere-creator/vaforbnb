import { routes } from "@/config/navigation";
import { formatDate, type Figures } from "@/lib/tools/figures";
import { formatPence, parseArea, rateText } from "@/lib/tools/visitor-levy";
import type { FaqEntry } from "@/lib/seo";

/**
 * Page copy for /free-tools/uk-visitor-levy-calculator.
 * Rates, caps and dates are read from the stored figures (`levy.calc.<area>`).
 */

export const hero = {
  title: "How much visitor levy do I charge?",
  shortAnswer:
    "Pick the area, enter the stay dates, nights, guests and price per night. You’ll see the levy for that stay under the area’s rules, or a note if the levy isn’t in force yet for those dates.",
  badges: ["Scotland", "Wales", "Stay legal"],
};

export const rulesHub = { levy: `${routes.ukRules}#visitor-levy`, pricing: `${routes.ukRules}#all-in-pricing` };

export const nextStep = {
  eyebrow: "Next step",
  title: "Set prices that include the levy",
  text: "Guests compare total prices. Our pricing team builds the levy and fees into your rates, so your listing stays competitive and your advertised price is the price guests pay.",
  cta: "See pricing optimisation",
  href: "/services/pricing-optimisation",
  secondary: { label: "Tourist taxes in the UK Rules Hub", href: rulesHub.levy },
};

export const limits = {
  title: "Limits",
  text: "The calculator uses the rate, night cap and start date for each area, and charges by the date of each night. It doesn’t know your council’s full exemptions (for example, some stays for medical treatment or by disabled guests), refunds, or whether your booking platform collects the levy for you. It doesn’t file returns. Councils that aren’t listed may add a levy later.",
  disclaimer: "General information, not tax advice. Exemptions, refunds and how you pay vary by area. Check your council’s levy page.",
};

export const related = { title: "Related tools", ids: ["short-let-profit-calculator", "uk-compliance-checker"] };

/** Rate and date changes are logged here. */
export const changelog: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: Edinburgh, Glasgow, Aberdeen, Stirling, West Dunbartonshire and Cardiff, with rates last checked 17 November 2026." },
];

export function buildFaq(f: Figures): FaqEntry[] {
  const ed = parseArea("edinburgh", f);
  const cardiff = parseArea("cardiff", f);
  return [
    {
      q: "Is there a tourist tax on Airbnbs in the UK?",
      a: "Yes in Edinburgh now, with more areas in Scotland and Wales from 2027. Short lets are included.",
    },
    {
      q: "How much is the Edinburgh levy?",
      a: ed
        ? `${rateText(ed)} of the accommodation cost, excluding VAT${ed.nightCap ? `, on the first ${ed.nightCap} nights of a stay` : ""}.`
        : "Check the City of Edinburgh Council’s levy page.",
    },
    {
      q: "How does the Cardiff levy work?",
      a: cardiff
        ? `It’s a fixed amount per person per night: ${formatPence(cardiff.rate)} for most accommodation${cardiff.lowerRate !== null ? ` and ${cardiff.lowerRate < 100 ? `${cardiff.lowerRate}p` : formatPence(cardiff.lowerRate)} for hostels and campsites` : ""}, from ${formatDate(cardiff.start)}.`
        : "Check the Welsh Government’s visitor levy page.",
    },
    {
      q: "Is there a tourist tax in England?",
      a: "Not yet. Mayors and strategic authorities are getting powers to introduce one. We’ll add areas when they confirm.",
    },
    {
      q: "Do I have to show the levy in my price?",
      a: "Your advertised price should include any compulsory charges guests have to pay. Check whether your booking platform collects the levy for you.",
    },
  ];
}
