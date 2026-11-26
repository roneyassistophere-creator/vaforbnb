import { brand } from "@/config/brand";

/** Booking performance calculator: copy used by the tool (page copy is in the page's content.ts). */
export const copy = {
  disclaimer: "Use the same definitions every time, for example always excluding cleaning fees, so comparisons are fair. These are your figures, not market benchmarks.",
  pdfModal: {
    title: "Get your performance report",
    intro: "Your PDF is made on this device and downloads straight away. Your figures and bookings are never sent to us. Add your email only if you’d like occasional pricing tips.",
    consent: `Email me occasional pricing tips and updates from ${brand.name}. Unsubscribe any time.`,
    submit: "Download the PDF",
    done: "Your PDF has downloaded.",
    error: "Your PDF has downloaded, but we couldn’t save your email. Try again later.",
  },
  nextStep: { eyebrow: "Next step", title: "Want us to grow your RevPAR?", text: "Our pricing team adjusts your prices and minimum stays every day around demand, events and gaps, and reports RevPAR month by month.", cta: "Pricing optimisation" },
  kit: { badge: "Growing host kit · step 3", eyebrow: "Growing host kit · step 3 of 5", title: "Next in your kit: Direct booking savings", text: "You know your occupancy, ADR and RevPAR. Next, see what platform fees cost you each year.", cta: "Direct booking savings" },
};
