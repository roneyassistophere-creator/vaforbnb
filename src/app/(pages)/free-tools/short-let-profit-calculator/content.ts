import { money } from "@/lib/tools/format";
import type { FaqEntry } from "@/lib/seo";
import { formatDate, type Figures } from "@/lib/tools/figures";
import type { Content } from "@/lib/tools/profit";

/** Page copy for /free-tools/short-let-profit-calculator. Rates and thresholds come from stored figures. */

export const hero = {
  shortAnswer:
    "Enter your nightly rate, occupancy, booking channels, cleaning costs and monthly bills. You’ll see your real monthly and yearly profit, your cash flow after mortgage repayments, the occupancy you need to break even, the minimum price that covers your costs, and what would make the biggest difference. We never guess your earnings: it all comes from your figures.",
  privacy: "Your figures stay on your device.",
};

const p = (x: number) => `${+(x * 100).toFixed(2)}%`;
const rates = (r: Content["tax"]["current"]) => `${p(r.basic)}, ${p(r.higher)} and ${p(r.additional)}`;

export function faqFor(c: Content): FaqEntry[] {
  return [
    { q: "What occupancy do I need to break even?", a: "It depends on your prices and costs. The calculator works out your exact break-even occupancy from your figures." },
    { q: "What’s the difference between profit and cash flow?", a: "Profit counts mortgage interest as a cost. Cash flow also takes off the capital part of your mortgage repayments. You can make a profit and still be short of cash." },
    { q: "Should I include cleaning fees in income?", a: "If guests pay a cleaning fee, enter it as “cleaning fee charged per stay”. It counts as income, and platform fees apply to it. Your actual cleaning cost goes in costs." },
    {
      q: "How is holiday-let income taxed now?",
      a: `Since 6 April 2025, furnished holiday lets are taxed like other property income. Mortgage interest gets a basic-rate tax credit instead of a full deduction. From ${formatDate(c.tax.from2027Date)}, property income rates rise to ${rates(c.tax.from2027)} in England, Wales and Northern Ireland.`,
    },
    { q: "When do I need to register for VAT?", a: `When your VAT-taxable turnover goes over the VAT registration threshold (${money(c.vatThreshold, 0)}) in any rolling 12 months. The calculator warns you if your figures get close.` },
    { q: "Does this include tax?", a: "Only as an optional estimate, clearly labelled. Check your real position with an accountant." },
  ];
}

type Src = { title: string; url: string | null };
const src = (f: Figures, key: string): Src => ({ title: f[key]?.sourceTitle ?? "", url: f[key]?.sourceUrl ?? null });

/** How it works: every formula in plain English, assumptions labelled, sources for official figures. */
export function howItWorks(c: Content, f: Figures): { id: string; title: string; text: string; list?: string[]; assumption?: string; sources?: Src[] }[] {
  const L = c.model.levers;
  return [
    {
      id: "nights",
      title: "Nights, stays and booking value",
      text: `Available nights = days in the month minus your owner-blocked nights. Booked nights = available × occupancy. Stays = booked nights ÷ average stay. Guest booking value = booked nights × nightly rate + stays × the cleaning fee you charge.`,
      assumption: `Quick mode uses ${c.model.daysPerMonth} days a month (365.25 ÷ 12, rounded). Detailed mode uses the real days in each month of the year you choose, including leap years.`,
    },
    {
      id: "fees",
      title: "Fees, VAT and management",
      text: `Platform fees = booking value × your weighted channel fee, plus any fixed fee per direct booking. If you’re VAT registered, your prices include VAT, so the VAT (booking value − booking value ÷ (1 + ${p(c.vatRate)})) comes off first. Management is a percentage of room revenue (or room revenue plus cleaning fees), or a fixed monthly amount.`,
      sources: [src(f, "fees.airbnbHostOnlyPercent"), src(f, "vat.standardRate")],
    },
    {
      id: "profit",
      title: "Profit and cash flow",
      text: "Profit = booking value − VAT − platform fees − management − turnovers, consumables and running costs − reserve − bills. Bills use your mortgage interest only. Cash flow = profit − the capital part of your mortgage payment.",
    },
    {
      id: "break-even",
      title: "Break-even, minimum rate and targets",
      text: "Each booked night contributes its rate after fees, VAT, management and reserve, plus its share of the cleaning fee, minus its share of turnover and consumables, the running cost and any fixed card fee. Break-even occupancy = fixed costs ÷ (available nights × that contribution). The minimum nightly rate is the price at which profit is exactly zero at your occupancy. The target solver does the same with your target profit added to the fixed costs.",
    },
    {
      id: "needle",
      title: "What moves the needle",
      text: `Each change is applied on its own and the yearly profit compared: price +${L.ratePercent}%, occupancy +${L.occupancyPoints} points (up to 100%), stays +${L.stayNights} night, turnover cost −${money(L.turnoverPounds, 0)}, platform fee −${L.feePoints} point, and ${L.directPoints} points of bookings moved to direct from your highest-fee channel.`,
      assumption: "Lever sizes are our choice, to compare like with like. They aren’t predictions.",
    },
    {
      id: "tax",
      title: "Tax estimate (optional)",
      text: `Taxable property profit = your profit plus mortgage interest (it isn’t deductible for residential lets), times your share. Tax = taxable × your band rate, minus a finance cost credit of ${p(c.tax.credit.current)} of the smaller of your interest and your taxable profit. Current rates ${rates(c.tax.current)}; from ${formatDate(c.tax.from2027Date)}, ${rates(c.tax.from2027)} (credit ${p(c.tax.credit.from2027)}). Scotland uses the Scottish bands for ${c.scotland.taxYear}. Rent a Room compares receipts above ${money(c.rentARoom, 0)} with the normal method.`,
      assumption: "Your personal allowance and other income aren’t included. Companies aren’t covered.",
      sources: [src(f, "tax.propertyIncome"), src(f, "tax.scotland"), src(f, "tax.rentARoomThreshold")],
    },
    {
      id: "notices",
      title: "VAT and Making Tax Digital notices",
      text: `We compare your yearly booking value with the VAT registration threshold (${money(c.vatThreshold, 0)}) and say when you’re within ${p(c.vatClose)} of it. Making Tax Digital for Income Tax applies ${c.mtd.map((m) => `${m.from} above ${money(m.min, 0)}`).join(", ")} of qualifying income.`,
      sources: [src(f, "vat.registrationThreshold"), src(f, "tax.mtdThresholds")],
    },
  ];
}

export const limits = {
  title: "Limits",
  points: [
    "It only knows the figures you enter. It never guesses your earnings or uses market data.",
    "Seasonal patterns in Detailed mode are yours to set. The example shapes are only a starting point.",
    "Tax is an estimate for individual owners, without your personal allowance or other income.",
    "Capital allowances, replacement of domestic items relief and capital gains aren’t included.",
  ],
  disclaimer: "A planning estimate, not accounts or tax advice. Results depend on the figures you enter. Tax depends on your whole situation, including other income and ownership, so speak to an accountant.",
};

export const related = {
  title: "Related tools",
  ids: ["direct-booking-savings", "long-stay-discount-calculator", "short-let-vs-long-let"],
};

export const rulesLinks = [
  { label: "Property income tax", href: "/uk-short-let-rules#property-income-tax" },
  { label: "VAT and short lets", href: "/uk-short-let-rules#vat" },
  { label: "Making Tax Digital", href: "/uk-short-let-rules#making-tax-digital" },
  { label: "Furnished holiday lets abolished", href: "/uk-short-let-rules#fhl-abolished" },
];
