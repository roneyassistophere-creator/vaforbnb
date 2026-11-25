import { formatDmy, formatMedium } from "../dates";
import { toCsv } from "../csv";
import { escapeHtml, htmlTable, printableDocument } from "../printable";
import { countryName, guestNeedsExtra, platformLabels, type Lists, type Stay } from "./rules";

/** CSV columns, in this exact order. */
export const registerColumns = [
  "Booking reference",
  "Property",
  "Platform",
  "Arrival date",
  "Departure date",
  "Full name",
  "Nationality",
  "Second nationality",
  "Passport or ID number",
  "Place of issue",
  "Next destination",
  "Next destination address",
  "Recorded on",
] as const;

const dmy = (iso?: string) => (iso ? formatDmy(iso) : "");

/** One row per adult guest. Extra details are only written for guests who need them. */
export function registerRows(stays: Stay[], lists: Lists, propertyName: (id: string) => string): string[][] {
  return stays.flatMap((s) =>
    s.guests.map((g) => {
      const extra = guestNeedsExtra(g, lists);
      return [
        s.reference,
        propertyName(s.propertyId),
        s.platform ? platformLabels[s.platform] : "",
        dmy(s.arrival),
        dmy(s.departure),
        g.fullName,
        countryName(g.nationality, lists),
        countryName(g.nationality2, lists),
        extra ? (g.idNumber ?? "") : "",
        extra ? countryName(g.placeOfIssue, lists) : "",
        extra ? (g.nextDestination ?? "") : "",
        extra ? (g.nextAddress ?? "") : "",
        dmy(s.recordedOn),
      ];
    }),
  );
}

/** The register as CSV: UTF-8 with a byte-order mark, formula-safe. */
export function buildCsv(stays: Stay[], lists: Lists, propertyName: (id: string) => string, columns: readonly string[] = registerColumns): string {
  return toCsv([...columns], registerRows(stays, lists, propertyName), { bom: true });
}

export const exampleRow = [
  "EXAMPLE – delete",
  "Flat 2",
  "Airbnb",
  "25/11/2026",
  "28/11/2026",
  "Amélie Martin",
  "France",
  "",
  "12AB34567",
  "France",
  "Paris",
  "",
  "25/11/2026",
];

export const blankCsv = (withExample: boolean) => toCsv([...registerColumns], withExample ? [exampleRow] : [], { bom: true });

export function recordNote(lists: Lists): string {
  return `Record every guest aged ${lists.minAge} or over: full name, nationality and arrival date. If they aren’t a British, Irish or Commonwealth citizen, also record their passport or ID number, place of issue and next destination (with the address if known). Keep records for at least ${lists.retentionMonths} months.`;
}

/** A printable A4 landscape register of saved stays. */
export function buildPrintable(stays: Stay[], lists: Lists, propertyName: (id: string) => string, o: { title?: string; subtitle?: string } = {}): string {
  const header = ["Arrival", "Departure", "Ref.", "Full name", "Nationality", "Passport / ID", "Issued in", "Next destination"];
  const rows = registerRows(stays, lists, propertyName).map((r) => [r[3], r[4], r[0], r[5], [r[6], r[7]].filter(Boolean).join(" / "), r[8], r[9], [r[10], r[11]].filter(Boolean).join(", ")]);
  return printableDocument({
    title: o.title ?? "Guest register",
    subtitle: o.subtitle,
    orientation: "landscape",
    body: htmlTable(header, rows),
    footer: recordNote(lists),
  });
}

/** Blank printable register: 15 rows. */
export function blankPrintable(lists: Lists, property: string, withExample: boolean): string {
  const header = ["Arrival", "Departure", "Full name", "Nationality", "Passport / ID number", "Place of issue", "Next destination (and address if known)"];
  const example = ["25/11/2026", "28/11/2026", "Amélie Martin", "France", "12AB34567", "France", "Paris"];
  const rows = [...(withExample ? [example] : []), ...Array.from({ length: 15 - (withExample ? 1 : 0) }, () => header.map(() => ""))];
  return printableDocument({
    title: `Guest register${property.trim() ? ` – ${property.trim()}` : ""}`,
    subtitle: withExample ? "The first row is an EXAMPLE – delete or cross it out." : undefined,
    orientation: "landscape",
    body: htmlTable(header, rows, { className: "blank", rowClass: (i) => (withExample && i === 0 ? "example" : "") }),
    footer: recordNote(lists),
  });
}

/** A one-page check-in card a guest fills in by hand. */
export function checkInCard(lists: Lists, property: string): string {
  const line = (label: string) => `<div class="line"><span>${escapeHtml(label)}</span></div>`;
  const body = `
<p>Welcome! UK law asks us to record a few details for every guest aged ${lists.minAge} or over. Please fill in one card per adult guest.</p>
<div class="box"><h2>Every guest</h2>${line("Full name")}${line("Nationality")}${line("Date of arrival")}</div>
<div class="box extra"><h2>Only if you’re not a British, Irish or Commonwealth citizen</h2>${line("Passport or ID number")}${line("Place of issue")}${line("Next destination after this stay")}${line("Address of your next destination (if known)")}</div>
<p class="note">Privacy: we use these details only to keep the guest record the law requires, store them securely, and delete them after ${lists.retentionMonths} months. Please don’t send photos of passports.</p>`;
  return printableDocument({ title: `Guest check-in card${property.trim() ? ` – ${property.trim()}` : ""}`, orientation: "portrait", body });
}

export const fileSlug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "all-properties";
export const registerFileName = (property: string | null, today: string, ext = "csv") => `guest-register-${property ? fileSlug(property) : "all-properties"}-${today}.${ext}`;

export const savedMessage = (s: Stay) => `Saved: ${s.guests.length} ${s.guests.length === 1 ? "guest" : "guests"}, arriving ${formatMedium(s.arrival)}`;
