import { brand } from "./brand";
import { packages, servicesByPack, serviceHref } from "@/content/services";
import { toolById, toolLink } from "@/content/tools/catalog";

/** Every page route in one place. Change a URL here and all links follow. */
export const routes = {
  home: "/",
  services: "/services",
  whoWeHelp: "/who-we-help",
  freeTools: "/free-tools",
  ukRules: "/uk-short-let-rules",
  pricing: "/pricing",
} as const;

export type NavKey = keyof typeof routes;

/** Deep links into sections of existing pages. */
export const anchors = {
  /** A service's own page (e.g. /services/guest-communication), or its hub card if it has no page. */
  service: (id: string) => serviceHref(id),
  tool: (id: string) => `${routes.freeTools}#${id}`,
  complianceChecker: `${routes.freeTools}/uk-short-let-compliance-checker`,
  rulesList: `${routes.ukRules}#rules`,
  rulesChecklist: `${routes.ukRules}#checklist`,
  rulesAlerts: `${routes.ukRules}#alerts`,
  servicesPackages: `${routes.services}#packages`,
  servicesHowWeWork: `${routes.services}#every-service`,
  pricingEstimator: `${routes.pricing}#estimate`,
  /** Opens the matching tab on /who-we-help (read client-side from the hash). */
  persona: (id: string) => `${routes.whoWeHelp}#for-${id}`,
};

export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = { heading: string; line: string; links: NavLink[] };
export type NavItem = { key: NavKey; label: string; href: string; dropdown?: NavGroup[] };

/** Services dropdown: one column per package, built from src/content/services.ts. */
export const servicesMenu: NavGroup[] = packages.map((p) => ({
  heading: p.title,
  line: p.line,
  links: servicesByPack(p.key).map((s) => ({
    label: s.name,
    href: serviceHref(s.id),
    note: s.comingSoon ? "Coming soon" : undefined,
  })),
}));

export const mainNav: NavItem[] = [
  { key: "services", label: "Services", href: routes.services, dropdown: servicesMenu },
  { key: "whoWeHelp", label: "Who we help", href: routes.whoWeHelp },
  { key: "freeTools", label: "Free tools", href: routes.freeTools },
  { key: "ukRules", label: "UK rules", href: routes.ukRules },
  { key: "pricing", label: "Pricing", href: routes.pricing },
];

export const headerCtas = {
  secondary: { label: "Free audit", href: brand.links.freeAudit },
  primary: { label: "Book a call", href: brand.links.bookCall },
};

export type FooterLink = { label: string; href: string };
export type FooterColumn = { heading: string; links: FooterLink[] };

export const footerColumns: FooterColumn[] = [
  {
    heading: "Run",
    links: [
      { label: "Guest communication", href: anchors.service("guest") },
      { label: "Listing optimisation", href: anchors.service("listing") },
      { label: "Pricing optimisation", href: anchors.service("pricing") },
      { label: "Cleaning coordination", href: anchors.service("clean") },
    ],
  },
  {
    heading: "Grow & Build",
    links: [
      { label: "Direct booking websites", href: anchors.service("website") },
      { label: "SEO for short lets", href: anchors.service("seo") },
      { label: "Social media", href: anchors.service("social") },
      { label: "Systemise your business", href: anchors.service("sops") },
    ],
  },
  {
    heading: "Free",
    links: [
      { label: "UK rules hub", href: routes.ukRules },
      { label: "Free tools", href: routes.freeTools },
      { label: "UK event calendar", href: toolLink(toolById("uk-event-calendar")!) },
      { label: "Checklists", href: anchors.rulesChecklist },
      { label: "Finance sheet", href: brand.downloads.financeSheet },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Pricing", href: routes.pricing },
      { label: "Who we help", href: routes.whoWeHelp },
      { label: "All services", href: routes.services },
      { label: "Contact", href: brand.links.contact },
    ],
  },
];
