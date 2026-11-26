import { brand } from "@/config/brand";

/** Short-let vs long-let: copy used by the tool (page copy is in the page's content.ts). */
export const copy = {
  disclaimer: "Estimates from your figures, not financial, tax or legal advice. Long lets have their own legal duties, which differ in England, Scotland, Wales and Northern Ireland. Rents, voids and costs vary. Check with a letting agent and an accountant.",
  pdfModal: {
    title: "Get your comparison report",
    intro: "Your PDF is made on this device and downloads straight away. Your figures are never sent to us. Add your email only if you’d like occasional money tips for hosts.",
    consent: `Email me occasional short-let money tips and updates from ${brand.name}. Unsubscribe any time.`,
    submit: "Download the PDF",
    done: "Your PDF has downloaded.",
    error: "Your PDF has downloaded, but we couldn’t save your email. Try again later.",
  },
  nextStep: { eyebrow: "Next step", title: "Want a clear monthly picture of your short-let profit?", text: "Our Finance check builds a profit and loss report for each property every month, from your real payouts, fees and bills.", cta: "Finance check", recheck: "Recheck your short-let figures in the profit calculator" },
};
