import type { DayField, Inputs, Nation } from "@/lib/tools/business-rates/types";

/**
 * The business rates qualifier: identity and interface text.
 * Thresholds, caps, premiums and dates are NOT here: they're stored figures
 * (src/data/figures.seed.ts). Text below can use {figure.key} placeholders.
 */
export const toolSlug = "holiday-let-business-rates-checker";
export const toolPath = `/free-tools/${toolSlug}`;
export const storageKey = `vaforbnb:tool:${toolSlug}:v1`;

export const nationOptions: { value: Nation; label: string }[] = [
  { value: "england", label: "England (includes London)" },
  { value: "scotland", label: "Scotland" },
  { value: "wales", label: "Wales" },
  { value: "ni", label: "Northern Ireland" },
];

type FieldText = { label: string; hint: string; tip: string };

const availableTip =
  "Count every day paying guests could have booked it, on any platform or your own website, whether or not they did. Don’t count days you blocked for yourself, family or repairs.";
const letTip =
  "Count the nights paying guests actually stayed, on normal commercial terms. A 3-night stay is 3 days. Don’t count free or discounted stays for you, friends or family.";

/** Field text. Scotland asks about "this year" and "last year". */
export const fieldText: Record<DayField, FieldText> & { scotland: Partial<Record<DayField, FieldText>> } = {
  availableLast: {
    label: "Days it was available to let in the last 12 months",
    hint: "Days the calendar was open for bookings.",
    tip: availableTip,
  },
  availableNext: {
    label: "Days you plan to make it available in the next 12 months",
    hint: "Your honest plan for the coming year.",
    tip: "Count the days you intend to keep the calendar open for paying guests. Keep proof that you advertised it, such as listing screenshots.",
  },
  letLast: {
    label: "Days it was actually let in the last 12 months",
    hint: "Count short lets only. Don’t count days you, friends or family stayed for free.",
    tip: letTip,
  },
  letYear2: {
    label: "Days it was actually let the year before",
    hint: "Needed to average over 2 years.",
    tip: letTip,
  },
  letYear3: {
    label: "Days it was actually let two years before (optional)",
    hint: "Add this to average over 3 years.",
    tip: letTip,
  },
  charityDays: {
    label: "Days let free or cheaply to a charity (optional)",
    hint: "Up to {wales.businessRates.maxCharityDays} days can count.",
    tip: "Days the property was let free of charge or at a reduced rate to a charity can count towards the let days, up to the limit shown. Keep a record of each stay.",
  },
  scotland: {
    availableNext: {
      label: "Days it will be available to let this year",
      hint: "Days you’ll keep the calendar open in this financial year.",
      tip: availableTip,
    },
    letLast: {
      label: "Days it was actually let last year",
      hint: "Count short lets only. Don’t count days you, friends or family stayed for free.",
      tip: letTip,
    },
  },
};

export const copy = {
  nationLegend: "Where is your property?",
  nationHint: "The tests are different in each nation.",
  daysTitle: "Your days",
  averagingLabel: "Average my let days over {wales.businessRates.averagingYears} years",
  averagingHint: "Useful if one year was quieter than usual.",
  tryExample: "Try an example",
  reset: "Reset",
  privacy: "Nothing you enter leaves your browser.",
  clear: "Clear my saved answers",
  resultTitle: "Your result",
  incomplete: "Add your days to see your result",
  incompleteHint: "Fill in the days on the left. The result updates as you type.",
  passes: "Meets the tests",
  notYet: "Not yet",
  copyResult: "Copy result",
  copied: "Result copied",
  copyHeading: "Holiday let business rates check",
  disclaimer: "General information, not legal or tax advice. Check with the Valuation Office Agency, your assessor or your council.",
  niMessage: "Northern Ireland has its own rating system, so this checker doesn’t cover it. Check with Land & Property Services.",
  niLink: { label: "Land & Property Services (nidirect)", href: "https://www.nidirect.gov.uk/land-and-property-services" },
};

/** "Try an example": England, 150 / 150 / 62. */
export const example: { nation: Nation; inputs: Inputs } = {
  nation: "england",
  inputs: { availableLast: "150", availableNext: "150", letLast: "62" },
};
