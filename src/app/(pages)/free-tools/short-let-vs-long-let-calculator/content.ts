import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/short-vs-long";

/** Page copy for /free-tools/short-let-vs-long-let-calculator. Rates and intervals come from stored figures. */

export const hero = {
  shortAnswer:
    "Bring your short-let profit from the profit calculator, or type it in. Then add your likely long-let rent, agent fees, empty weeks and landlord costs. You'll see both monthly figures on a fair, like-for-like basis, the difference per month, year and over 5 years, the rent that would match short-letting, and your profit per hour of work.",
  privacy: "Your figures stay on your device.",
};

export const faq: FaqEntry[] = [
  { q: "Is Airbnb more profitable than renting?", a: "Sometimes, but not always once fees, cleaning, bills, empty nights and your time are counted. This tool compares your own numbers fairly." },
  { q: "What are void weeks?", a: "Weeks with no tenant, for example between tenancies, while you find a new tenant or redecorate." },
  { q: "Who pays the bills on a long let?", a: "Usually the tenant pays energy, broadband and council tax. On a short let, you pay them. The calculator accounts for this." },
  { q: "Are short lets and long lets taxed differently?", a: "Since 6 April 2025, furnished holiday lets are taxed like other property income, so the rates and mortgage interest rules are now the same for both. VAT can differ: residential long lets are generally exempt, while VAT-registered short-let businesses charge VAT." },
  { q: "Did the Renters' Rights Act change long lets?", a: "Yes. In England, assured shorthold tenancies and Section 21 “no-fault” evictions have been replaced by periodic assured tenancies (from 1 May 2026). Scotland and Wales have their own systems. See the UK Rules Hub." },
  { q: "What does “profit per hour” mean?", a: "Your monthly profit divided by the hours you spend on that property each month. It shows what your time is really earning." },
];

export function howItWorks(c: Content): { id: string; title: string; text: string; assumption?: string }[] {
  return [
    { id: "long", title: "Long let, a month", text: `Rent received = rent × (52 − void weeks) ÷ 52. Take off agent fees (a % of rent received, plus VAT if quoted without), a tenant-find fee spread over the tenancy, landlord costs (insurance, maintenance, gas safety ÷ 12, EICR ÷ ${c.eicrMonths}, EPC ÷ ${c.epcMonths}, licence ÷ its months, arrears allowance, bills you still pay) and the costs either way.` },
    { id: "short", title: "Short let, a month", text: "Your short-let profit, minus the costs either way only if your profit doesn’t already include them. Profit from the profit calculator already does." },
    { id: "fair", title: "The fair-comparison rules", text: "Costs you pay whichever you choose (mortgage interest, service charge, ground rent, buildings insurance) are counted once on each side. Bills a tenant usually pays (energy, broadband, council tax) aren’t on the long-let side unless you say you’d still pay them." },
    { id: "break-even", title: "Break-even and 5 years", text: "The break-even rent puts the costs that scale with rent (agent %, maintenance %, arrears %) in the divisor and the fixed costs on top, so it’s exact. The 5-year view recalculates each year with rent and profit growth, and takes a one-off switching cost off the side you’d switch to." },
    { id: "time-tax", title: "Time and tax", text: "Profit per hour = monthly net ÷ hours a month. Both options are taxed as property income at the same rates, so the after-tax difference is the difference × (1 − your band rate).", assumption: `Long-let hours default to ${c.defaults.longHours} a month, and rent and profit growth to ${c.defaults.rentGrowthPercent}%. Change them to suit you.` },
  ];
}

export const limits = {
  title: "Limits",
  points: ["It only uses your figures: rents, voids and costs vary by area and over time.", "It doesn’t include capital gains, stamp duty, allowances or VAT in the after-tax view.", "Legal duties differ across England, Scotland, Wales and Northern Ireland: check the UK Rules Hub and take advice."],
};

export const related = { title: "Related tools", ids: ["short-let-profit-calculator", "hosting-time-calculator", "long-stay-discount-calculator"] };
