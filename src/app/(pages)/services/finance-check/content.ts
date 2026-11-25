import { prices, showPrice } from "@/config/pricing";
import type { FaqEntry } from "@/lib/seo";

/** All copy and example figures for /services/finance-check. */

export type SheetTab = "bookings" | "expenses" | "report";

export const sheetGrids: Record<SheetTab, { label: string; cols: string; head: string[]; rows: { c: string[]; bold?: boolean }[] }> = {
  bookings: {
    label: "Bookings",
    cols: "1.3fr 1fr 0.8fr 0.6fr 1fr 1fr 1fr",
    head: ["Property", "Channel", "Check-in", "Nights", "Value £", "Commission £", "Net £"],
    rows: [
      { c: ["Flat 2", "Airbnb", "03/10", "3", "345.00", "53.48", "291.52"] },
      { c: ["Seaview Cottage", "Direct", "10/10", "7", "980.00", "0.00", "965.30"] },
      { c: ["", "", "", "", "", "", ""] },
      { c: ["", "", "", "", "", "", ""] },
    ],
  },
  expenses: {
    label: "Expenses",
    cols: "0.8fr 1.3fr 1.5fr 1.6fr 1fr",
    head: ["Date", "Property", "Category", "Description", "Amount £"],
    rows: [
      { c: ["01/10", "Flat 2", "Mortgage or rent", "Monthly mortgage", "650.00"] },
      { c: ["06/10", "Flat 2", "Cleaning", "Turnover clean", "45.00"] },
      { c: ["06/10", "Flat 2", "Laundry & linen", "2 bed sets", "31.90"] },
      { c: ["12/10", "Seaview", "Maintenance", "Fix dripping tap", "60.00"] },
      { c: ["01/10", "All", "Software", "Pricing tool", "40.00"] },
    ],
  },
  report: {
    label: "Monthly Report",
    cols: "1.6fr 1fr 1fr 1fr",
    head: ["October", "Flat 2", "Seaview", "All"],
    rows: [
      { c: ["Net income", "291.52", "965.30", "1,256.82"] },
      { c: ["Total costs", "726.90", "60.00", "826.90"] },
      { c: ["Profit or loss", "(435.38)", "905.30", "429.92"], bold: true },
      { c: ["Occupancy", "9.7%", "22.6%", "16.1%"] },
      { c: ["Avg nightly rate", "115.00", "140.00", "132.50"] },
    ],
  },
};

export const toc = [
  ["s1", "Payouts aren’t profit"],
  ["s2", "What goes in"],
  ["s3", "Sample report"],
  ["s4", "Extra checks"],
  ["s5", "Break-even calculator"],
  ["s6", "UK changes"],
  ["s7", "How it works"],
  ["s8", "What you receive"],
  ["s9", "Honest expectations"],
] as const;

export const fall = [
  { t: "Booking value", l: "0%", w: "100%", c: "#14212B", v: "£1,325.00", tc: "#14212B", fw: 700 },
  { t: "Commissions and fees", l: "94.9%", w: "5.1%", c: "#F0595A", v: "(£68.18)", tc: "#B8383A", fw: 500 },
  { t: "Net income", l: "0%", w: "94.9%", c: "#46525C", v: "£1,256.82", tc: "#14212B", fw: 700 },
  { t: "Costs (all)", l: "32.4%", w: "62.4%", c: "#F0595A", v: "(£826.90)", tc: "#B8383A", fw: 500 },
  { t: "Profit this month", l: "0%", w: "32.4%", c: "#1F6B45", v: "£429.92", tc: "#1F6B45", fw: 800 },
];

export const incomeFields = [
  { a: "Property, channel, booking ref", b: "Traceable to Airbnb, Booking.com, Vrbo or direct" },
  { a: "Check-in, check-out, nights", b: "For occupancy and average nightly rate" },
  { a: "Booking value", b: "What the guest paid, incl. cleaning fees" },
  { a: "Commission and payment fees", b: "What each channel really costs" },
  { a: "Net payout and payout date", b: "Matched to what reached your bank" },
  { a: "Status", b: "Confirmed, cancelled or refunded" },
];

export const varCosts = ["Cleaning (each turnover)", "Laundry and linen", "Consumables", "Maintenance and repairs", "Furnishing and replacements", "Marketing"];
export const fixCosts = ["Mortgage or rent", "Electricity", "Gas", "Water", "Council tax or business rates", "Broadband and TV", "Insurance", "Software", "Management or VA fees", "Licences", "Accountancy"];

export type Report = {
  t: string;
  lines: { k: string; v: string; total?: boolean }[];
  pl: string;
  neg: boolean;
  why: string;
  kpis: { k: string; v: string }[];
};

export const reports: Report[] = [
  {
    t: "Flat 2",
    lines: [
      { k: "Bookings / nights", v: "1 / 3" },
      { k: "Booking value", v: "£345.00" },
      { k: "Commissions and fees", v: "(£53.48)" },
      { k: "Net income", v: "£291.52", total: true },
      { k: "Cleaning and laundry", v: "(£76.90)" },
      { k: "Mortgage", v: "(£650.00)" },
      { k: "Total costs", v: "(£726.90)", total: true },
    ],
    pl: "(£435.38)",
    neg: true,
    why: "Mortgage paid in a month with one short booking: exactly what a monthly report makes visible.",
    kpis: [
      { k: "Occupancy", v: "9.7%" },
      { k: "Avg nightly rate", v: "£115.00" },
      { k: "Profit per night", v: "(£145.13)" },
      { k: "Cost per stay", v: "£76.90" },
    ],
  },
  {
    t: "Seaview Cottage",
    lines: [
      { k: "Bookings / nights", v: "1 / 7" },
      { k: "Booking value", v: "£980.00" },
      { k: "Commissions and fees", v: "(£14.70)" },
      { k: "Net income", v: "£965.30", total: true },
      { k: "Maintenance", v: "(£60.00)" },
      { k: "Other costs", v: "£0.00" },
      { k: "Total costs", v: "(£60.00)", total: true },
    ],
    pl: "£905.30",
    neg: false,
    why: "A week-long direct booking with no commission: the strongest result this month.",
    kpis: [
      { k: "Occupancy", v: "22.6%" },
      { k: "Avg nightly rate", v: "£140.00" },
      { k: "Profit per night", v: "£129.33" },
      { k: "Commission", v: "0.0%" },
    ],
  },
  {
    t: "All properties",
    lines: [
      { k: "Bookings / nights", v: "2 / 10" },
      { k: "Booking value", v: "£1,325.00" },
      { k: "Commissions and fees", v: "(£68.18)" },
      { k: "Net income", v: "£1,256.82", total: true },
      { k: "Property costs", v: "(£786.90)" },
      { k: "Shared costs", v: "(£40.00)" },
      { k: "Total costs", v: "(£826.90)", total: true },
    ],
    pl: "£429.92",
    neg: false,
    why: "Overall profit, even though one property made a loss.",
    kpis: [
      { k: "Occupancy", v: "16.1%" },
      { k: "Avg nightly rate", v: "£132.50" },
      { k: "Profit per night", v: "£42.99" },
      { k: "Commission", v: "4.0%" },
    ],
  },
];

export const checks = [
  { h: "Channel mix", t: "How much income comes from each platform and from direct bookings, and what each costs." },
  { h: "Payout reconciliation", t: "Every payout matched to a booking and your bank, so missing payouts are caught." },
  { h: "Refunds and claims", t: "Cancellations, refunds and damage claims tracked separately." },
  { h: "Cost per stay", t: "Cleaning and laundry per booking: are short stays worth it?" },
  { h: "Profit per night", t: "Whether a booking made money, not just filled a night." },
  { h: "Break-even nights", t: "Nights needed to cover fixed costs each month." },
  { h: "Bills that jump", t: "A flag when a bill is unusually high versus previous months." },
  { h: "Year to date", t: "And the same month last year, allowing for seasons." },
  { h: "Next month on the books", t: "Income already booked, so there are no surprises." },
];

export const changes = [
  { d: "6 April 2025", h: "Furnished holiday lettings tax rules abolished", t: "Mortgage interest on residential lets now gets basic-rate relief only; capital allowances on new spending replaced by replacement of domestic items relief. (1 April 2025 for companies.)", s: "HMRC Property Income Manual, PIM4165", dot: "#F0595A" },
  { d: "6 April 2026", h: "Making Tax Digital starts above £50,000", t: "Landlords with qualifying income over £50,000 keep digital records and send quarterly updates.", s: "GOV.UK, MTD for Income Tax", dot: "#14212B" },
  { d: "2026", h: "Airbnb moves hosts to a single 15.5% fee", t: "Commission now comes out of your payout; prices may need reviewing.", s: "Airbnb Resource Centre", dot: "#14212B" },
  { d: "6 April 2027", h: "Making Tax Digital extends above £30,000", t: "More hosts brought in. Monthly digital records make it far easier.", s: "GOV.UK, MTD for Income Tax", dot: "#F0595A" },
  { d: "Ongoing", h: "Business rates or council tax", t: "In England, a self-catering let is rated for business rates only if available 140+ days a year and actually let 70+. Wales: 252 and 182 days.", s: "VisitBritain, Business rates", dot: "#FFFFFF", tool: "holiday-let-business-rates-checker" },
] as { d: string; h: string; t: string; s: string; dot: string; /** Tool slug linked once live. */ tool?: string }[];

export const cycle = [
  { when: "All month", h: "Access", t: "Read-only reports and a shared receipts folder. No bank logins.", bg: "#F2F4F6", fg: "#14212B" },
  { when: "All month", h: "Collect", t: "Bookings, payouts and every cost from cleaners, laundry, trades and bills.", bg: "#F2F4F6", fg: "#14212B" },
  { when: "Month end", h: "Categorise", t: "Each item against the right property and category; payouts reconciled.", bg: "#F7F3EC", fg: "#14212B" },
  { when: "By [5th] working day", h: "Report", t: "Your monthly report and updated sheet.", bg: "#FDECEC", fg: "#14212B" },
  { when: "Same week", h: "Review", t: "Notes on anything unusual, plus [3] suggestions.", bg: "#14212B", fg: "#FFFFFF" },
];

export const receive = [
  "A one-page profit and loss report per property, plus a total",
  "Your finance sheet, updated with every booking and cost",
  "Year-to-date totals and a month-by-month chart",
  "Notes on anything unusual, with suggestions",
  "A tidy receipts folder your accountant can use",
];

export const dataCare = [
  { h: "Read-only access", t: "wherever possible. We never make payments from your accounts." },
  { h: "No bank logins.", t: "You share statements or receipts; no passwords needed." },
  { h: "Stored securely", t: "and shared only with you and people you approve, in line with UK GDPR." },
];

export const honest = [
  { b: "We prepare records; we don’t file tax returns.", t: "Your accountant uses our reports." },
  { b: "Only as complete as the receipts.", t: "We chase missing bills; some costs only you know about." },
  { b: "Bookings count in their check-in month.", t: "A stay across two months shows in the month it starts." },
  { b: "Our hours: 8am–8pm UK, Mon–Sat.", t: "Reports arrive on a working day." },
];

export const sheetTabs = [
  { n: "1", h: "Start here", t: "How to use it, colour key, plain-English notes", c: "#F8A3A4" },
  { n: "2", h: "Settings", t: "Month, year, up to 5 properties, tax set-aside %", c: "#F8A3A4" },
  { n: "3", h: "Bookings", t: "300 rows: value, commission, fees, net payout, status", c: "#FFFFFF" },
  { n: "4", h: "Expenses", t: "500 rows, 18 categories, shared costs, receipt check", c: "#FFFFFF" },
  { n: "5", h: "Monthly Report", t: "Profit or loss per property, KPIs, channel mix", c: "#F0595A" },
  { n: "6", h: "Year Overview", t: "12 months side by side, with a chart", c: "#F0595A" },
];

export const packageCta = {
  title: `Monthly finance check from ${showPrice(prices.run)} a month`,
  text: `With guest communication, pricing, cleaning coordination and review management. [Available on its own from ${showPrice(prices.run)} a month.]`,
};

export const faq: FaqEntry[] = [
  { q: "How much does my Airbnb really make after costs?", a: "Take your booking value, subtract platform commissions and payment fees, then subtract every cost: cleaning, laundry, maintenance and fixed bills like mortgage or rent, utilities, council tax, broadband and insurance. What’s left is your profit before tax. Our free sheet does the maths." },
  { q: "What expenses should I track?", a: "Variable costs per stay (cleaning, laundry, consumables, repairs) and fixed monthly costs (mortgage or rent, electricity, gas, water, council tax or business rates, broadband, insurance, software and management fees). Keep receipts for all of them." },
  { q: "Is the finance sheet really free?", a: "Yes. Download it, use it in Excel or Google Sheets and adapt it. It handles up to five properties out of the box." },
  { q: "Do you need my bank login?", a: "No. We work from platform and channel manager reports, plus statements and receipts you share with us." },
  { q: "Are you accountants?", a: "No. We prepare clean, categorised monthly records and reports that make your accountant’s job easier. Always take tax advice from a qualified adviser." },
  { q: "What changed for holiday let tax in 2025?", a: "The furnished holiday lettings tax rules were abolished from 6 April 2025 (1 April for companies). One effect: mortgage interest on residential lets now gets basic-rate relief only. Ask your accountant how it affects you." },
  { q: "Does Making Tax Digital apply to me?", a: "From 6 April 2026, landlords with qualifying income over £50,000 must keep digital records and send quarterly updates; from 6 April 2027, over £30,000." },
  { q: "When do I get my report?", a: "By the [5th] working day of the following month." },
];

export const sources =
  "Airbnb Resource Centre, Simplifying Airbnb service fees · HMRC Property Income Manual PIM4165 · GOV.UK, Making Tax Digital for Income Tax for sole traders and landlords · VisitBritain, Business rates.";
