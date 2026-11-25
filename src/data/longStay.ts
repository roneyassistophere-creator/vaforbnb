/**
 * Long-stay discount calculator: editable assumptions (stored content).
 *
 * Seeded into the `figures` table and read from there, so the defaults,
 * sensitivity steps and note triggers can be edited without a code change.
 * The platform thresholds, fee presets and highlight threshold are their own
 * figures (platform.*, fees.*), and the London long-stay figure is shared
 * with the London 90-night counter (london.longStayMinNights).
 */
export const settings = {
  version: 1,
  versionDate: "2026-11-25",
  /** Starting values (assumptions). Percentages are whole numbers here; the tool stores them as decimals. */
  defaults: { nightlyRate: 100, periodNights: 28, discountPercent: 20, occupancyPercent: 60, averageStay: 3, turnoverCost: 50 },
  /** Period preset chips (nights). */
  periodPresets: [7, 14, 28, 30],
  periodMax: 180,
  discountMax: 60,
  /** Sensitivity table rows (discount %); the host's own discount is added and highlighted. */
  sensitivitySteps: [0, 5, 10, 15, 20, 25, 30, 40],
  /** "About the same" when |difference| is below this many pounds. */
  aboutSameMargin: 10,
  /** Show the tenancy note from this many nights. */
  tenancyNoteMinNights: 60,
  /** Most saved scenarios on the device, and how many the compare view shows. */
  maxScenarios: 5,
  compareMax: 3,
};
