import { brand } from "@/config/brand";
import type { GoalKey } from "@/content/services";
import type { IconName } from "@/lib/icons";
import type { FaqEntry } from "@/lib/seo";

/** All copy for the services hub. Service cards come from src/content/services.ts. */

export const hero = {
  eyebrow: "Services · Run · Grow · Build",
  titleStart: "Short-let services that take the daily work",
  titleAccent: "off your plate",
  lead: `${brand.name} is a UK Airbnb virtual assistant team. Pick the services you need, from guest messages and pricing to direct booking websites and SOPs. One team covers them all, ${brand.hours.sentence}, and you approve every big decision.`,
  finderLabel: "What do you need help with?",
  finderPlaceholder: "Try “cleaners”, “reviews” or “website”",
};

export const goals: { key: "all" | GoalKey; label: string }[] = [
  { key: "all", label: "All services" },
  { key: "time", label: "Save time" },
  { key: "bookings", label: "Get more bookings" },
  { key: "guests", label: "Happier guests" },
  { key: "numbers", label: "Know my numbers" },
  { key: "direct", label: "Grow direct bookings" },
  { key: "systems", label: "Build systems" },
];

export const defaultPlan = ["guest", "clean"];

export const always: { h: string; t: string; icon: IconName }[] = [
  { h: "A team, not one VA", t: "Trained people who cover for each other, so sickness and holidays never leave your guests waiting.", icon: "team" },
  { h: "UK hours, Mon–Sat", t: "8am–8pm UK time, with a clear plan for out-of-hours issues.", icon: "clock" },
  { h: "You approve big decisions", t: "Large price moves, spending and anything unusual come to you first.", icon: "ok" },
  { h: "No passwords shared", t: "Co-host permissions and a password manager, with a UK GDPR data agreement.", icon: "lock" },
  { h: "Written SOPs", t: "How you like things done is written down, so standards stay the same every day.", icon: "doc" },
  { h: "A clear monthly report", t: "What we did, what changed and what we suggest next, in plain English.", icon: "chart" },
];

export const steps = [
  { n: "1", h: "Call and free audit", t: "Tell us what’s taking your time. We review your listing and suggest where to start." },
  { n: "2", h: "Set-up week", t: "Co-host access, your preferences and SOPs written down, cleaners and tools connected." },
  { n: "3", h: "We run it", t: "Daily work handled, approvals sent to you, report every month." },
];

export const faq: FaqEntry[] = [
  { q: "Can I choose single services instead of a package?", a: "Yes. You can start with one service, such as guest communication, and add more later. Packages are simply the easiest way to cover the daily work in one go." },
  { q: "What hours do you work?", a: `Our standard plan covers ${brand.hours.sentence}. We set up clear guest instructions and an emergency plan for other times, and we never promise 24/7 cover we don’t offer.` },
  { q: "Do I have to share my Airbnb password?", a: "No. We use Airbnb’s co-host permissions, so we only get the access we need. Other tools are shared through a password manager." },
  { q: "Do I stay in control?", a: "Yes. Your listings stay in your name. Big price changes, spending and anything unusual come to you for approval first." },
  { q: "Do you work with my cleaners and channel manager?", a: "Yes. We coordinate the cleaners and trades you already use, and work inside your existing channel manager. You pay cleaners and trades directly." },
  { q: "How quickly can you start?", a: `Usually within ${brand.stats.startWithinDays} working days of your call, once access and your SOPs are set up.` },
  { q: "Is there a minimum contract?", a: "[Your terms here, for example monthly rolling with 30 days’ notice.]" },
];
