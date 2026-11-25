import type { ItemKey } from "./types";

export type ItemDef = {
  key: ItemKey;
  /** Used in links (?item=gas) and card ids. */
  param: string;
  name: string;
  /** "interval": last done + months. "fixed": the date entered is the due date. */
  kind: "interval" | "fixed";
  /** Stored figure with the months between checks. */
  monthsKey?: string;
  /** Stored figure: required or recommended by nation. */
  tagKey: string;
  dateLabel: string;
  hint: string;
  /** One line for the calendar event: what to do. */
  todo: string;
  /** UK Rules Hub anchor. */
  anchor: string;
  needsGas?: boolean;
};

/** The built-in checks, in the order they're shown. */
export const itemDefs: ItemDef[] = [
  {
    key: "gas",
    param: "gas",
    name: "Gas safety check",
    kind: "interval",
    monthsKey: "cert.gas.months",
    tagKey: "cert.tag.gas",
    dateLabel: "Date of your last gas safety check",
    hint: "Every gas appliance and flue, checked by a Gas Safe registered engineer.",
    todo: "Book a Gas Safe registered engineer and keep the new gas safety record.",
    anchor: "gas-safety",
    needsGas: true,
  },
  {
    key: "eicr",
    param: "eicr",
    name: "Electrical report (EICR)",
    kind: "interval",
    monthsKey: "cert.eicr.months",
    tagKey: "cert.tag.eicr",
    dateLabel: "Date of your last EICR",
    hint: "If your report gives a next inspection date, add it: it’s used instead.",
    todo: "Book a qualified electrician for a new EICR and keep the report.",
    anchor: "electrical-safety",
  },
  {
    key: "fra",
    param: "fra",
    name: "Fire risk assessment review",
    kind: "interval",
    monthsKey: "cert.fra.reviewMonths",
    tagKey: "cert.tag.fra",
    dateLabel: "Date you last reviewed your fire risk assessment",
    hint: "Also review it after any big change, like a new layout or more beds.",
    todo: "Review your fire risk assessment, record the findings and test the alarms.",
    anchor: "fire-risk-assessment",
  },
  {
    key: "pat",
    param: "pat",
    name: "Portable appliance testing (PAT)",
    kind: "interval",
    monthsKey: "cert.pat.months",
    tagKey: "cert.tag.pat",
    dateLabel: "Date of your last PAT test",
    hint: "Appliances you provide, like the kettle, toaster and hairdryer.",
    todo: "Book PAT testing for the appliances you provide and keep the record.",
    anchor: "electrical-safety",
  },
  {
    key: "legionella",
    param: "legionella",
    name: "Legionella risk assessment review",
    kind: "interval",
    monthsKey: "cert.legionella.reviewMonths",
    tagKey: "cert.tag.legionella",
    dateLabel: "Date you last reviewed it",
    hint: "A written check of the water system, and any hot tub. Review sooner after changes.",
    todo: "Review your legionella risk assessment and keep the record.",
    anchor: "legionella",
  },
  {
    key: "licence",
    param: "licence",
    name: "Short-term let licence renewal",
    kind: "fixed",
    tagKey: "cert.tag.licence",
    dateLabel: "Licence renewal or expiry date",
    hint: "From your council licence. Councils can take weeks to process a renewal.",
    todo: "Apply to your council to renew your short-term let licence.",
    anchor: "scotland-licence",
  },
  {
    key: "niCert",
    param: "ni",
    name: "Tourism NI certificate",
    kind: "fixed",
    tagKey: "cert.tag.niCert",
    dateLabel: "Certificate expiry date",
    hint: "From your Tourism NI certificate.",
    todo: "Renew your Tourism NI certificate before it expires.",
    anchor: "ni-certificate",
  },
  {
    key: "insurance",
    param: "insurance",
    name: "Insurance renewal",
    kind: "fixed",
    tagKey: "cert.tag.insurance",
    dateLabel: "Policy renewal date",
    hint: "Short-let cover, including public liability. Home insurance often doesn’t cover guests.",
    todo: "Review your short-let insurance before it renews.",
    anchor: "insurance",
  },
];

export const itemDef = (key: ItemKey) => itemDefs.find((d) => d.key === key)!;
export const itemByParam = (param: string) => itemDefs.find((d) => d.param === param);

/** Every stored figure the tool reads. */
export const figureKeys = [
  "cert.gas.months",
  "cert.gas.earlyWindowMonths",
  "cert.eicr.months",
  "cert.fra.reviewMonths",
  "cert.pat.months",
  "cert.pat.monthsOptions",
  "cert.legionella.reviewMonths",
  "cert.dueSoonDays",
  "cert.defaultReminderDays",
  "cert.reminderDaysOptions",
  "cert.secondReminderDays",
  ...itemDefs.map((d) => d.tagKey),
  "rulesLastChecked",
];
