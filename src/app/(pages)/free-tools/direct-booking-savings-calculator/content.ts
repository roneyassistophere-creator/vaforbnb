import type { FaqEntry } from "@/lib/seo";
import type { Content } from "@/lib/tools/direct-booking";
import type { Figures } from "@/lib/tools/figures";
import { money, percent } from "@/lib/tools/format";

/** Page copy for /free-tools/direct-booking-savings-calculator. Fee presets come from stored figures. */

export const hero = {
  shortAnswer:
    "Enter a typical booking and your fees. You’ll see what you keep from each platform compared with the same booking taken directly, how much you pay in fees each year, and what moving some bookings to direct would really save after website and payment costs.",
  privacy: "Your figures stay on your device.",
};

export function faqFor(c: Content): FaqEntry[] {
  return [
    {
      q: "How much does Airbnb charge hosts?",
      a: `It depends on the fee setting on your account. With the host-only fee (we use ${percent(c.fees.airbnbHostOnly)} as a starting point), hosts pay a percentage of the booking. With the split fee, hosts pay less (around ${percent(c.fees.airbnbSplitHost)}) and guests pay a service fee. Check your own payout details and enter your figure.`,
    },
    { q: "Does VAT apply to platform fees?", a: "It can. Check your fee invoices or payout details to see whether VAT is added to your host fee, and set the toggle to match." },
    { q: "Are direct bookings free?", a: `No. You pay card payment fees (we start at ${percent(c.fees.cardPercent)} plus ${money(c.fees.cardFixed)} a payment), plus website, booking system and sometimes damage protection costs, but usually less than platform commission.` },
    { q: "Can I ask Airbnb guests to book direct?", a: "Not through Airbnb. Grow direct bookings through your own website, social media and search engines, and welcome back past guests who find you independently." },
    { q: "How many direct bookings do I need to cover a website?", a: "The calculator works out your break-even number from your own costs and savings per booking." },
    { q: "What do I need before taking direct bookings?", a: "A clear booking site with all-in prices, secure card payments, your terms and cancellation policy, and a plan for damage protection. See the checklist on this page." },
  ];
}

type Src = { title: string; url: string | null };
const src = (f: Figures, key: string): Src => ({ title: f[key]?.sourceTitle ?? "", url: f[key]?.sourceUrl ?? null });

export function howItWorks(c: Content, f: Figures): { id: string; title: string; text: string; sources?: Src[] }[] {
  return [
    { id: "booking", title: "One booking", text: "Booking value = nightly rate × nights + the cleaning fee you charge. Platform payout = booking value − the host fee (plus VAT on the fee if your platform charges it). Direct payout = the direct price (after any discount) − card fee % − fixed fee per payment − damage protection − booking system fee." },
    {
      id: "models",
      title: "Platform fee models",
      text: `Host-only fee: the host pays the whole service fee (starting point ${percent(c.fees.airbnbHostOnly)}). Split fee: the host pays less (around ${percent(c.fees.airbnbSplitHost)}) and the guest pays a service fee on top (starting point ${percent(c.fees.airbnbSplitGuest)}; the guest fee’s own VAT isn’t modelled, so the guest price is approximate). Commission platforms such as Booking.com take a percentage of the booking, plus any payments fee.`,
      sources: [src(f, "fees.airbnbHostOnlyPercent"), src(f, "fees.airbnbSplitGuestPercent")],
    },
    { id: "discount", title: "Break-even direct discount", text: "The biggest discount you could give a direct guest and still keep as much as on the platform: 1 − (platform payout + fixed direct costs) ÷ (booking value × (1 − card fee % − booking system %))." },
    {
      id: "year",
      title: "Your year",
      text: "Fees a year = bookings on each channel × that channel’s fee per booking. Moving to your target direct share takes the extra bookings from your platforms (in proportion, or highest fee first). Gross saving = what each moved booking keeps directly minus what it kept on its platform. If you don’t already run direct bookings, your running costs count as new costs. Net saving = gross saving − new costs.",
    },
    {
      id: "verdict",
      title: "Break-even, payback and verdict",
      text: `Break-even = new running costs ÷ the saving per moved booking, rounded up. Website payback = build cost ÷ (net saving ÷ 12). “Worth it at your figures” means a net saving and payback within ${c.model.worthItMonths} months; “Marginal” means a saving but slower payback; “Not yet” means costs are bigger than the saving. “What would make it work?” solves the direct share for each line.`,
      sources: [src(f, "fees.directCardPercent"), src(f, "vat.standardRate")],
    },
  ];
}

export const limits = {
  title: "Limits",
  points: [
    "It only uses the figures you enter. Your real fees depend on your fee setting, location, VAT and contract.",
    "It doesn’t predict how many direct bookings you’ll get. Platforms bring guests you might not reach yourself.",
    "Taxes, refunds, chargebacks and platform host protection aren’t modelled.",
  ],
};

export const related = { title: "Related tools", ids: ["short-let-profit-calculator", "booking-performance"] };
