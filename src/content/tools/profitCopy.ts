import { brand } from "@/config/brand";

/** Short-let profit calculator: copy used by the tool (the page copy is in the page's content.ts). */
export const copy = {
  disclaimer: "A planning estimate, not accounts or tax advice. Results depend on the figures you enter. Tax depends on your whole situation, including other income and ownership, so speak to an accountant.",
  pdfModal: {
    title: "Get your profit report",
    intro: "Your PDF is made on this device and downloads straight away. Your figures are never sent to us. Add your email only if you’d like occasional money tips for hosts.",
    consent: `Email me occasional short-let money tips and updates from ${brand.name}. Unsubscribe any time.`,
    submit: "Download the PDF",
    done: "Your PDF has downloaded.",
    error: "Your PDF has downloaded, but we couldn’t save your email. Try again later.",
  },
  example: "Example figures: replace with your own. Everything is calculated from what you enter.",
  nextStep: {
    eyebrow: "Next step",
    title: "Get this done for you every month",
    text: "Our Finance check builds a profit and loss report for each property every month, from your real payouts, fees and bills.",
    cta: "Finance check",
    sheet: "Download the free finance sheet",
  },
  kit: {
    newHost: { badge: "New host kit · step 2", eyebrow: "New host kit · step 2 of 5", title: "Next in your kit: House rules generator", text: "You know your numbers. Next, set clear house rules that protect your property and your reviews." },
    growing: { badge: "Growing host kit · step 1" },
  },
};
