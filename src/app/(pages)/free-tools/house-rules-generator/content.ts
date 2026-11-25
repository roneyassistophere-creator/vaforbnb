import { routes } from "@/config/navigation";
import type { FaqEntry } from "@/lib/seo";

/** Page copy for /free-tools/house-rules-generator. Rule wording itself is stored content. */

export const hero = {
  title: "What should my house rules say?",
  shortAnswer:
    "Answer a few questions about check-in, guests, pets, smoking, quiet hours, parking and rubbish. You’ll get clear, friendly house rules to copy into your listing, set up in your platform settings, and print for your welcome guide.",
  badges: ["All UK", "Stay legal"],
  kitBadge: "New host kit · step 3",
};

export const rulesHub = {
  dogs: `${routes.ukRules}#assistance-dogs`,
  cameras: `${routes.ukRules}#cameras`,
  pricing: `${routes.ukRules}#all-in-pricing`,
  cancellation: `${routes.ukRules}#cancellation-policy`,
  fire: `${routes.ukRules}#fire-risk-assessment`,
};

export const nextStep = {
  eyebrow: "Next step",
  title: "Make your listing clearer",
  text: "Clear rules are one part of a listing guests trust. Our listing team makes your title, description, photos, rules and settings tell one consistent story.",
  cta: "See listing optimisation",
  href: "/services/listing-optimisation",
  secondary: { label: "Keep guests informed: Guest communication", href: "/services/guest-communication" },
};

export const howItWorks: { title: string; text: string; source: string; href: string }[] = [
  {
    title: "Assistance dogs are always welcome",
    text: "Refusing a disabled guest because of their assistance dog is likely to be unlawful, even with a no-pets rule, so this line is always included.",
    source: "Equality Act 2010",
    href: rulesHub.dogs,
  },
  { title: "No parties or events", text: "Airbnb doesn’t allow parties or events, so every set of rules says so clearly.", source: "Airbnb party and events policy", href: rulesHub.cameras },
  {
    title: "Cameras are disclosed, never indoors",
    text: "Indoor cameras aren’t allowed on Airbnb, so there’s no option for them. Outdoor cameras and video doorbells are described in your rules.",
    source: "Airbnb policy on security cameras (from 30 April 2024)",
    href: rulesHub.cameras,
  },
  {
    title: "No hidden charges",
    text: "Fees such as a pet fee or late check-out fee must be shown before guests book. The checker flags fines and charges written into rules.",
    source: "Digital Markets, Competition and Consumers Act 2024",
    href: rulesHub.pricing,
  },
  {
    title: "Fair to every guest",
    text: "The checker flags rules that could discriminate or contradict your cancellation policy, and leaves out anything that can’t be published.",
    source: "Equality Act 2010; your platform’s cancellation policy",
    href: rulesHub.cancellation,
  },
  {
    title: "Matches your listing",
    text: "The guest limit should match your listing and fire risk assessment, and the platform checklist keeps your settings and written rules the same.",
    source: "Fire safety guidance for paying guest accommodation",
    href: rulesHub.fire,
  },
];

export const limits = {
  title: "Limits",
  text: "The generator writes rules from your answers and our stored wording. It can’t know every local rule, lease condition or platform change, and the checker looks for common problems rather than reviewing every word. Platform menu names change: check the settings checklist against your platform.",
  disclaimer: "General information, not legal advice. Rules must be fair, match your listing, and any charges must be shown before guests book.",
};

export const related = { title: "Related tools", ids: ["welcome-guide-builder", "guest-register-builder"] };

export const changelog: { date: string; note: string }[] = [
  { date: "2026-11-25", note: "First version: house rules in four formats, a platform settings checklist, a printable sign and a fair-rules checker." },
];

export const faq: FaqEntry[] = [
  { q: "Can I refuse pets?", a: "Yes, but you must welcome assistance dogs, even with a no-pets rule." },
  { q: "Can I have cameras at my Airbnb?", a: "Not indoors. Airbnb bans indoor cameras. Outdoor cameras and video doorbells must be disclosed in your listing." },
  { q: "Can I ban parties?", a: "Yes. Airbnb doesn’t allow parties or events, and your rules should say so clearly." },
  {
    q: "Can I charge guests for breaking rules?",
    a: "Any charge must be fair and shown before guests book. Hidden fines in house rules can be unfair to consumers. Use your platform’s damage and resolution process instead.",
  },
  {
    q: "What rules should every listing have?",
    a: "Check-in and check-out times, the maximum number of guests, no parties, quiet hours, how to deal with rubbish, and how to report a problem.",
  },
];
