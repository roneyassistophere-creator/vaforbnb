/**
 * Short-let profit calculator: editable stored content.
 *
 * Seeded into the `figures` table and read from there, so every constant,
 * preset, threshold, example, lever size and insight wording can be changed
 * without a code change. Official rates and thresholds are their own rows
 * (with sources and VERIFY flags) in figures.seed.ts.
 *
 * Percentages are whole numbers here (15.5 = 15.5%); the calculator converts
 * them to decimals.
 */

/** The calculation model and its assumptions. */
export const model = {
  version: 2,
  versionDate: "2026-11-26",
  /** ASSUMPTION: average days in a month, used by Quick mode (365.25 ÷ 12 ≈ 30.44, rounded). */
  daysPerMonth: 30.4,
  /** "Profitable, but a thin margin" below this many occupancy points above break-even. */
  thinMarginPoints: 10,
  /** ASSUMPTION shown as a hint on the maintenance reserve (not used unless the host enters it). */
  reserveHintPercent: 5,
  /** "What moves the needle": each change, applied one at a time. */
  levers: { ratePercent: 10, occupancyPoints: 5, stayNights: 1, turnoverPounds: 10, feePoints: 1, directPoints: 10 },
  maxScenarios: 5,
  compareMax: 3,
  /** Target solver starting value (£ a month). */
  defaultTarget: 500,
};

type Months12 = [number, number, number, number, number, number, number, number, number, number, number, number];

/** "Apply a shape": multipliers on the host's Quick rate and occupancy, January to December. */
export const shapes: { id: string; label: string; rate: Months12; occupancy: Months12 }[] = [
  {
    id: "city",
    label: "City steady",
    rate: [0.92, 0.9, 0.95, 1, 1, 1.05, 1.08, 1.08, 1.02, 1, 0.97, 1.03],
    occupancy: [0.85, 0.85, 0.95, 1, 1.05, 1.08, 1.1, 1.1, 1.05, 1, 0.95, 0.92],
  },
  {
    id: "coastal",
    label: "Coastal summer peak",
    rate: [0.75, 0.75, 0.85, 0.95, 1, 1.15, 1.35, 1.4, 1.05, 0.9, 0.8, 0.95],
    occupancy: [0.45, 0.5, 0.7, 0.9, 1, 1.25, 1.5, 1.55, 1.15, 0.85, 0.6, 0.7],
  },
  {
    id: "countryside",
    label: "Countryside weekends",
    rate: [0.9, 0.9, 0.95, 1, 1.05, 1.05, 1.1, 1.1, 1.05, 1, 0.95, 1],
    occupancy: [0.7, 0.75, 0.9, 1, 1.05, 1.15, 1.25, 1.25, 1.05, 0.95, 0.8, 0.9],
  },
];

/** The figures a host types (the shape of the starting values and the examples). Money in £, percentages 0–100. */
export type ExampleFigures = {
  rate: number;
  occupancy: number;
  avgStay: number;
  cleaningFee: number;
  ownerNights: number;
  channels: { airbnb: number; booking: number; direct: number; other: number };
  bookingFee: number;
  otherFee: number;
  turnover: number;
  consumables: number;
  running: number;
  monthly: { mortgagePayment: number; mortgageInterest: number; rent: number; energy: number; broadband: number; councilTax: number; software: number; serviceCharge: number; other: number };
  annual: { insurance: number; groundRent: number; licence: number; safety: number; tvLicence: number; accountant: number; other: number };
  setupCosts: number;
  cashInvested: number;
  shape: string;
};

/** Starting values when the page opens: clearly marked as example figures to replace. */
export const defaults: ExampleFigures = {
  rate: 100,
  occupancy: 60,
  avgStay: 3,
  cleaningFee: 0,
  ownerNights: 0,
  channels: { airbnb: 100, booking: 0, direct: 0, other: 0 },
  bookingFee: 15,
  otherFee: 0,
  turnover: 50,
  consumables: 0,
  running: 0,
  monthly: { mortgagePayment: 700, mortgageInterest: 500, rent: 0, energy: 120, broadband: 35, councilTax: 150, software: 40, serviceCharge: 0, other: 0 },
  annual: { insurance: 450, groundRent: 0, licence: 0, safety: 250, tvLicence: 0, accountant: 400, other: 0 },
  setupCosts: 0,
  cashInvested: 0,
  shape: "city",
};

/** "Start from an example": each one is labelled as example figures to replace. */
export const examples: { id: string; label: string; note: string; figures: ExampleFigures }[] = [
  {
    id: "city-flat",
    label: "City flat",
    note: "A one-bed city-centre flat with a repayment mortgage. Example figures: replace with your own.",
    figures: {
      rate: 110,
      occupancy: 70,
      avgStay: 2.5,
      cleaningFee: 0,
      ownerNights: 0,
      channels: { airbnb: 75, booking: 15, direct: 10, other: 0 },
      bookingFee: 15,
      otherFee: 0,
      turnover: 45,
      consumables: 6,
      running: 4,
      monthly: { mortgagePayment: 850, mortgageInterest: 520, rent: 0, energy: 95, broadband: 35, councilTax: 160, software: 45, serviceCharge: 120, other: 0 },
      annual: { insurance: 450, groundRent: 250, licence: 0, safety: 250, tvLicence: 175, accountant: 450, other: 0 },
      setupCosts: 6500,
      cashInvested: 46500,
      shape: "city",
    },
  },
  {
    id: "coastal-cottage",
    label: "Coastal cottage",
    note: "A two-bed seaside cottage, busy in summer, with family use in quiet weeks. Example figures: replace with your own.",
    figures: {
      rate: 145,
      occupancy: 55,
      avgStay: 4,
      cleaningFee: 60,
      ownerNights: 21,
      channels: { airbnb: 55, booking: 20, direct: 25, other: 0 },
      bookingFee: 15,
      otherFee: 0,
      turnover: 70,
      consumables: 10,
      running: 6,
      monthly: { mortgagePayment: 950, mortgageInterest: 640, rent: 0, energy: 140, broadband: 40, councilTax: 0, software: 50, serviceCharge: 0, other: 30 },
      annual: { insurance: 650, groundRent: 0, licence: 0, safety: 300, tvLicence: 175, accountant: 500, other: 300 },
      setupCosts: 12000,
      cashInvested: 82000,
      shape: "coastal",
    },
  },
  {
    id: "rent-to-rent",
    label: "Rent-to-rent flat",
    note: "A rented two-bed flat let as serviced accommodation with the landlord’s consent. Example figures: replace with your own.",
    figures: {
      rate: 95,
      occupancy: 72,
      avgStay: 2.2,
      cleaningFee: 0,
      ownerNights: 0,
      channels: { airbnb: 80, booking: 20, direct: 0, other: 0 },
      bookingFee: 15,
      otherFee: 0,
      turnover: 40,
      consumables: 5,
      running: 4,
      monthly: { mortgagePayment: 0, mortgageInterest: 0, rent: 1250, energy: 110, broadband: 35, councilTax: 150, software: 45, serviceCharge: 0, other: 0 },
      annual: { insurance: 350, groundRent: 0, licence: 0, safety: 200, tvLicence: 175, accountant: 400, other: 0 },
      setupCosts: 5000,
      cashInvested: 7500,
      shape: "city",
    },
  },
];

/**
 * Smart insights. The conditions are in the calculator; the thresholds,
 * wording and links are here. {placeholders} are filled from the host's own
 * figures. `tier` 1 shows first (urgent), then by £ impact.
 */
export const insights = {
  max: 6,
  thresholds: {
    /** Short stays: average stay below this AND turnovers + consumables above this share of booking value. */
    shortStayNights: 2.5,
    turnoverSharePercent: 20,
    /** Fees: weighted platform fee above this AND direct share below this. */
    feePercent: 12,
    directSharePercent: 10,
  },
  rules: [
    { id: "loss", enabled: true, tier: 1, text: "At these figures you lose {loss} a month. You’d need {minRate} a night, or {beOcc} occupancy, to break even." },
    { id: "lossUnreachable", enabled: true, tier: 1, text: "At these figures you lose {loss} a month, and higher occupancy alone can’t fix it. Look at your price, fees and turnover costs first." },
    { id: "cashSqueeze", enabled: true, tier: 1, text: "You make a profit on paper, but your mortgage capital repayments mean you’re {short} short each month." },
    { id: "vatOver", enabled: true, tier: 1, text: "Your figures are over the VAT registration threshold. You may need to register.", link: "/uk-short-let-rules#vat", linkLabel: "VAT and short lets" },
    { id: "thin", enabled: true, tier: 2, text: "A small drop in occupancy would push you into a loss. You’re only {margin} points above break-even." },
    { id: "shortStays", enabled: true, tier: 2, text: "Your stays average {stay} nights, which means {turnovers} turnovers a year. If the same nights came in stays 1 night longer, you’d save {saving} a year (if your occupancy stayed the same).", tool: "long-stay-discount-calculator", linkLabel: "Long-stay discount calculator" },
    { id: "fees", enabled: true, tier: 2, text: "Moving {points}% of your nights to direct bookings would save about {saving} a year in fees, at your fee rates.", tool: "direct-booking-savings", linkLabel: "Direct booking savings calculator" },
    { id: "lossMonths", enabled: true, tier: 2, text: "You lose money in {months}. Longer stays or event pricing could fill these months.", tool: "long-stay-discount-calculator", linkLabel: "Long-stay discount calculator", tool2: "uk-event-calendar", link2Label: "UK event calendar" },
    { id: "priceLever", enabled: true, tier: 2, text: "Price is your biggest lever: +{pct}% adds {gain} a year." },
    { id: "vatClose", enabled: true, tier: 2, text: "You’re getting close to the VAT threshold.", link: "/uk-short-let-rules#vat", linkLabel: "VAT and short lets" },
    { id: "mtd", enabled: true, tier: 2, text: "Making Tax Digital for Income Tax is likely to apply to you {from}. Count all your property and self-employment income together.", link: "/uk-short-let-rules#making-tax-digital", linkLabel: "Making Tax Digital" },
    { id: "tax2027", enabled: true, tier: 2, text: "From April 2027, your estimated tax rises by {rise} a year." },
  ],
};

/** Plain-English lines for "What moves the needle" ({gain} = £ a year). */
export const leverText = {
  rate: "Raising your price {size}% adds {gain} a year",
  occupancy: "{size} more points of occupancy adds {gain} a year",
  stay: "Stays {size} night longer (same occupancy) adds {gain} a year",
  turnover: "Cutting your turnover cost by {size} adds {gain} a year",
  fee: "Paying {size} point less in platform fees adds {gain} a year",
  direct: "Moving {size} points of bookings to direct adds {gain} a year",
};
