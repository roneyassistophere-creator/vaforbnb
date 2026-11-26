/**
 * Short-let vs long-let comparison: editable stored content.
 * Seeded into the `figures` table ("shortVsLong.content"); the periodic
 * certificate intervals are their own rows (VERIFY per nation). Tax rates
 * and VAT are shared figures (tax.propertyIncome, tax.scotland, vat.standardRate).
 */
export const model = {
  version: 1,
  versionDate: "2026-11-26",
  /** "About the same" when the monthly difference is smaller than this (£). */
  aboutSamePounds: 25,
  maxScenarios: 5,
  compareMax: 3,
};

/** Starting values. ASSUMPTION where marked on the page. */
export const defaults = {
  tenancyMonths: 24,
  voidWeeks: 2,
  longHours: 2,
  rentGrowthPercent: 0,
  shortGrowthPercent: 0,
};

/** "Try an example": the brief's test 1. */
export const example = {
  note: "Example data: £1,500 a month short-let profit against a £1,200 long-let rent. Replace with your own figures.",
  shortProfit: 1500,
  includesShared: true,
  rent: 1200,
  agent: "collection" as const,
  agentPercent: 10,
  voidWeeks: 2,
  landlordMonthly: 100,
};

/** "Who pays what": stored, editable. */
export const whoPays = [
  { item: "Energy", short: "You (short let)", long: "Usually the tenant (long let)" },
  { item: "Broadband", short: "You (short let)", long: "Usually the tenant (long let)" },
  { item: "Council tax or business rates", short: "You (short let)", long: "Usually the tenant (long let)" },
  { item: "Cleaning and laundry", short: "You (short let)", long: "Usually the tenant (long let)" },
  { item: "Furnishing and replacements", short: "You (short let)", long: "You, if let furnished; often unfurnished" },
  { item: "Safety certificates", short: "You (short let)", long: "You (long let): gas safety, EICR, EPC" },
];

/**
 * "Other things to weigh": factual and neutral. Regulatory lines are read
 * from the UK Rules Hub entries named in `rules` (with the hub's date).
 */
export const weigh = [
  { id: "stability", title: "Income stability", text: "Long lets give steadier monthly rent. Short-let income changes with seasons and demand. The profit calculator’s month view shows your loss months.", tool: "short-let-profit-calculator", linkLabel: "Profit calculator" },
  { id: "time", title: "Your time and workload", text: "Short lets need guest messages, cleaning and pricing. Long lets need less day-to-day work, but you’re responsible for repairs and compliance.", tool: "hosting-time-calculator", linkLabel: "Hosting time calculator" },
  { id: "flexibility", title: "Flexibility", text: "With a short let you can block dates for yourself. With a long let, the tenant has the right to live there, and ending a tenancy follows legal rules." },
  { id: "regulation", title: "Regulation", text: "The rules differ by nation. From the UK Rules Hub:", rules: ["renters-rights-act", "scotland-tenancies", "wales-occupation-contracts", "london-90-nights", "scotland-licence", "wales-register"] },
  { id: "wear", title: "Wear and tear", text: "More guest turnovers mean more frequent refreshes. Tenants mean fewer changeovers, but you have less oversight." },
  { id: "tax", title: "Tax and VAT", text: "Both are taxed as property income now. VAT-registered short-let businesses charge VAT, while residential long lets are generally exempt.", rules: ["fhl-abolished", "vat"] },
];

export const wording = {
  winner: { short: "Short-letting earns {d} more a month ({y} a year)", long: "Long-letting earns {d} more a month ({y} a year)", same: "About the same" },
  whatThisMeans: {
    short: "On your figures, short-letting earns about {d} more a month{perHour}. A long let would need a rent of {rent} to match.",
    long: "On your figures, a long let earns about {d} more a month and takes less of your time. Check the switching costs and payback in the 5-year view.",
    same: "The money is close. Your choice may come down to time, flexibility and how steady you want your income.",
  },
  afterTaxNote: "Estimate. Assumes both options stay within the same tax band and doesn’t include allowances, VAT or capital gains.",
};
