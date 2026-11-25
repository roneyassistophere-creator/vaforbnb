export { scenariosKey, storageKey, toolPath, toolSlug } from "./longStayId";

/**
 * Interface copy for the Long-stay discount calculator. Thresholds, fee
 * presets, the highlight threshold, note triggers, defaults and sensitivity
 * steps are stored figures (platform.*, fees.*, longStay.settings).
 */

export const rulesHref = { london: "/uk-short-let-rules#london-90-nights", tenancy: "/uk-short-let-rules#renters-rights-act" };

export const disclaimer =
  "Estimates only. Real occupancy changes, and platform fees vary by fee setting and location. In London, stays of 90+ consecutive nights don’t count as short stays. Very long stays used as someone’s main home can become a tenancy, so check the UK Rules Hub. Not financial, tax or legal advice.";

export const copy = {
  privacy: "Your numbers stay on your device.",
  rate: { label: "Nightly rate (£)", hint: "Your usual short-stay rate for this period." },
  period: { legend: "Period", custom: "Custom", customLabel: "Nights (1–{max})", nights: "{n} nights" },
  threshold: { weekly: "Counts as a weekly stay on Airbnb", monthly: "Counts as a monthly stay on Airbnb", tooShort: "Too short for a weekly discount" },
  discount: { label: "Long-stay discount (%)", guest: "Guest pays {nightly} a night · {total} for the stay", badge: "Big enough to be highlighted to guests" },
  occupancy: { label: "Expected short-stay occupancy for this period (%)", hint: "How busy would short stays realistically be in these dates? Check last year’s same month." },
  avg: { label: "Average short stay (nights)", hint: "Decimals are fine, for example 2.5." },
  turnover: { label: "Turnover cost (£)", hint: "Cleaning plus laundry per changeover." },
  fee: { legend: "Platform fee", airbnb: "Airbnb host-only fee ({n}%)", direct: "Direct booking card fee ({n}%)", custom: "Custom", label: "Platform fee (%)", hint: "Check your own fee in your platform’s earnings or payout details." },
  more: { toggle: "More costs", hint: "Optional: running costs, mid-stay cleans and a different long-stay fee." },
  running: { label: "Running cost per occupied night (£)", hint: "Long stays use more electricity and heating because every night is occupied." },
  midCleans: { label: "Mid-stay cleans for the long stay", hint: "Many hosts offer a weekly clean on monthly stays." },
  midCleanCost: { label: "Cost per mid-stay clean (£)", hint: "Leave empty to use your turnover cost." },
  longFee: { label: "Long-stay fee (%)", hint: "If the long stay is booked on a different channel. Leave empty to use the platform fee." },
  london: "My property is in London",
  buttons: { example: "Try an example", reset: "Reset", clear: "Clear my data", yesClear: "Yes, clear", cancel: "Cancel", undoImport: "Undo import" },
  exampleBanner: "A £100-a-night flat over 28 nights, so you can see a full result. It isn’t yours.",
  exampleHint: "Want to see how it works first? Load an example.",
  clearConfirm: "Clear your numbers and saved scenarios from this device?",
  storageFailed: "This browser isn’t letting us save, so your numbers won’t be remembered after you leave. The calculator still works.",
  imported: "Imported from {tool}",
  toolNames: { "short-let-profit-calculator": "the Short-let profit calculator", "london-90-night-counter": "the London 90-night counter" } as Record<string, string>,
  result: {
    heading: "Result",
    invalid: "Fix the highlighted fields to see your result.",
    short: "Short stays",
    long: "One long stay",
    nightsBooked: "Nights booked",
    stays: "Stays",
    nights: "Nights",
    guestRate: "Guest rate",
    net: "Net income",
    copy: "Copy result",
    save: "Save scenario",
    live: "{headline}. Short stays {short}, long stay {long}.",
  },
  notes: {
    london90: "In London, a stay of 90+ consecutive nights doesn’t count towards the 90-night limit.",
    londonCounts: "In London, stays under 90 consecutive nights still count towards the 90-night limit.",
    tenancy: "Very long stays can raise tenancy questions if the guest treats it as their main home. Check the UK Rules Hub.",
    occupancyAboveBreakEven: "At this occupancy, short stays earn more. Only discount if you doubt that occupancy.",
    rulesLink: "UK Rules Hub",
  },
  chart: { heading: "Net income compared", breakEven: "Long stay at the break-even discount", alt: "Short stays {short}, long stay {long}." },
  table: { heading: "Net income at different discounts", discount: "Discount", longNet: "Long-stay net", difference: "Difference vs short stays", better: "Better", yours: "your discount", long: "Long", short: "Short", same: "About the same" },
  scenarios: {
    heading: "Saved scenarios",
    nameLabel: "Name this scenario",
    namePlaceholder: "e.g. January, 25% off",
    save: "Save",
    empty: "Save a scenario to compare different discounts or periods side by side.",
    compare: "Compare (up to {n})",
    remove: "Delete",
    load: "Load",
    full: "You can save {n} scenarios. Saving another replaces the oldest.",
    saved: "Saved.",
  },
  sticky: "{headline}",
};
