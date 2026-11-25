import { addDays, formatLong } from "../dates";
import { formatPence, type Area } from "./areas";
import { statusText, type LevyInputs, type LevyResult } from "./calculate";

/** "What this means": 2–3 sentences chosen by the result. */
export function whatThisMeans(area: Area | null, r: LevyResult | null): string {
  if (!area) return "We don’t have a levy for this area in our data yet. Check your council’s website.";
  if (!r) return `Add the stay details to see the levy for a stay in ${area.name}.`;
  if (r.status === "exempt") return `This booking is exempt because it was booked and paid before ${formatLong(area.exemptBookedPaidBefore!)}. Keep the booking and payment record as proof.`;
  if (r.status === "notInForce") return `No levy is due for these dates. ${area.name}’s levy starts ${formatLong(area.start)}, so check bookings for stays after that.`;
  const out = [`Add ${formatPence(r.totalPence)} to this guest’s total. Show it clearly in your price, and check whether your booking platform collects it for you.`];
  if (r.status === "partly") out.push(`Only the nights from ${formatLong(area.start)} are charged. The earlier nights aren’t.`);
  if (r.capped && area.nightCap) out.push(`The levy only applies to the first ${area.nightCap} nights, so nights after that are free of levy.`);
  return out.join(" ");
}

/** Plain text for "Copy result". */
export function resultText(area: Area, inputs: LevyInputs, r: LevyResult, o: { rulesChecked: string; disclaimer: string }): string {
  const nights = r.nights.length;
  const out = [
    `Visitor levy: ${area.name}`,
    `Stay: ${formatLong(inputs.checkIn)} to ${formatLong(addDays(inputs.checkIn, nights))} (${nights} ${nights === 1 ? "night" : "nights"})`,
    `Status: ${statusText(r)}`,
    ...(r.exemptReason ? [r.exemptReason] : []),
    ...r.lines,
    ...r.notes,
    `Levy for this stay: ${formatPence(r.totalPence)}`,
    ...(r.stayPricePence !== null ? [`Guest pays: ${formatPence(r.stayPricePence + r.totalPence)}`] : []),
    "",
    `Rates last checked ${o.rulesChecked}.`,
    o.disclaimer,
  ];
  return out.join("\n");
}
