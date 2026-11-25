import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import { addMonths } from "../dates";
import type { Figures } from "../figures";
import { escapeIcsText, foldIcsLine, parseIcs } from "../ics";
import {
  blankProperty,
  buildAllSchedules,
  buildCalendarFile,
  buildSchedule,
  dueDate,
  exampleProperty,
  FUTURE_ERROR,
  googleLinkFor,
  status,
  statusLabel,
  whatThisMeans,
  type PropertyData,
  type ScheduleRow,
  type Settings,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const TODAY = "2026-11-25";
const NOW = new Date("2026-11-25T10:00:00Z");
const site = { url: "https://www.vaforbnb.co.uk", toolPath: "/free-tools/holiday-let-certificate-reminders", rulesPath: "/uk-short-let-rules" };
const settings: Settings = { secondReminder: false, includeOverdue: true, scope: "property" };

const prop = (over: Partial<PropertyData> = {}): PropertyData => ({ ...blankProperty("flat-2", "Flat 2"), ...over });
const row = (rows: ScheduleRow[], key: string) => rows.find((r) => r.key === key)!;
const withFigure = (key: string, value: number): Figures => ({ ...figures, [key]: { ...figures[key], value } });

describe("due dates", () => {
  it("1. gas: last 15 Jan 2026 → due 15 Jan 2027, reminder 16 Dec 2026", () => {
    const r = row(buildSchedule(prop({ dates: { gas: "2026-01-15" } }), figures, TODAY), "gas");
    expect(r.due).toBe("2027-01-15");
    expect(r.remindOn).toBe("2026-12-16");
  });

  it("2. EICR without a report date → last + 60 months", () => {
    expect(dueDate("eicr", prop({ dates: { eicr: "2022-03-01" } }), figures).due).toBe("2027-03-01");
  });

  it("3. EICR report's next inspection date overrides the interval", () => {
    const d = dueDate("eicr", prop({ dates: { eicr: "2022-03-01" }, eicrNext: "2028-06-30" }), figures);
    expect(d.due).toBe("2028-06-30");
    expect(d.basis).toMatch(/report/);
  });

  it("4. month end: 31 Jan + 1 month", () => {
    expect(dueDate({ id: "c", name: "Test", mode: "interval", last: "2026-01-31", months: 1 }, prop(), figures).due).toBe("2026-02-28");
    expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
  });

  it("5. leap day: gas 29 Feb 2024 → 28 Feb 2025", () => {
    expect(dueDate("gas", prop({ dates: { gas: "2024-02-29" } }), figures).due).toBe("2025-02-28");
  });

  it("6. FRA 1 Oct 2025 → due 1 Oct 2026 → overdue by 55 days", () => {
    const r = row(buildSchedule(prop({ dates: { fra: "2025-10-01" } }), figures, TODAY), "fra");
    expect(r.due).toBe("2026-10-01");
    expect(r.status).toBe("overdue");
    expect(r.days).toBe(-55);
    expect(statusLabel(r)).toBe("Overdue by 55 days");
  });

  it("7. gas 20 Dec 2025 → due 20 Dec 2026 → due soon, 25 days", () => {
    const r = row(buildSchedule(prop({ dates: { gas: "2025-12-20" } }), figures, TODAY), "gas");
    expect(r.due).toBe("2026-12-20");
    expect(r.status).toBe("soon");
    expect(r.days).toBe(25);
    expect(statusLabel(r)).toBe("Due in 25 days");
  });

  it("8. PAT 1 Jun 2026 → due 1 Jun 2027 → OK", () => {
    const r = row(buildSchedule(prop({ dates: { pat: "2026-06-01" } }), figures, TODAY), "pat");
    expect(r.due).toBe("2027-06-01");
    expect(r.status).toBe("ok");
    expect(statusLabel(r)).toBe("Due 1 Jun 2027");
  });

  it("11. insurance renewal is the due date itself", () => {
    const r = row(buildSchedule(prop({ dates: { insurance: "2027-04-01" } }), figures, TODAY), "insurance");
    expect(r.due).toBe("2027-04-01");
    expect(r.status).toBe("ok");
  });

  it("12. a last-done date in the future → error and no result", () => {
    const r = row(buildSchedule(prop({ dates: { gas: "2026-12-01" } }), figures, TODAY), "gas");
    expect(r.error).toBe(FUTURE_ERROR);
    expect(r.due).toBeNull();
    expect(r.status).toBe("missing");
    // Renewal dates may be in the past (= overdue).
    expect(row(buildSchedule(prop({ dates: { insurance: "2026-11-01" } }), figures, TODAY), "insurance").status).toBe("overdue");
  });

  it("13. an empty item → Missing, not in the calendar file", () => {
    const rows = buildSchedule(prop(), figures, TODAY);
    expect(rows.every((r) => r.status === "missing")).toBe(true);
    expect(statusLabel(rows[0])).toBe("Add a date");
    expect(parseIcs(buildCalendarFile(rows, settings, NOW, figures, site))).toHaveLength(0);
  });

  it("14. gas done early (within 2 months of the old due date) keeps the anniversary", () => {
    // Pure date logic: the last check is after the test's "today", so this calls dueDate directly.
    expect(dueDate("gas", prop({ dates: { gas: "2026-12-01" }, gasPrevDue: "2027-01-15" }), figures).due).toBe("2028-01-15");
    // On the window's edges.
    expect(dueDate("gas", prop({ dates: { gas: "2026-11-15" }, gasPrevDue: "2027-01-15" }), figures).due).toBe("2028-01-15");
    expect(dueDate("gas", prop({ dates: { gas: "2027-01-15" }, gasPrevDue: "2027-01-15" }), figures).due).toBe("2028-01-15");
    // Done late: runs from the check date.
    expect(dueDate("gas", prop({ dates: { gas: "2027-02-01" }, gasPrevDue: "2027-01-15" }), figures).due).toBe("2028-02-01");
  });

  it("15. gas done too early → runs from the check date", () => {
    expect(dueDate("gas", prop({ dates: { gas: "2026-10-01" }, gasPrevDue: "2027-01-15" }), figures).due).toBe("2027-10-01");
    expect(dueDate("gas", prop({ dates: { gas: "2026-11-14" }, gasPrevDue: "2027-01-15" }), figures).due).toBe("2027-11-14");
  });

  it("17. PAT interval chosen by the host (24 months)", () => {
    expect(dueDate("pat", prop({ dates: { pat: "2026-06-01" }, patMonths: 24 }), figures).due).toBe("2028-06-01");
    // A value that isn't one of the stored options falls back to the default.
    expect(dueDate("pat", prop({ dates: { pat: "2026-06-01" }, patMonths: 7 }), figures).due).toBe("2027-06-01");
  });

  it("18. changing a stored figure changes the results", () => {
    expect(dueDate("gas", prop({ dates: { gas: "2026-01-15" } }), withFigure("cert.gas.months", 6)).due).toBe("2026-07-15");
    const soonWindow = withFigure("cert.dueSoonDays", 20);
    expect(status("2026-12-20", TODAY, soonWindow).status).toBe("ok");
    const tags: Figures = { ...figures, "cert.tag.eicr": { ...figures["cert.tag.eicr"], value: { england: "required", scotland: "required", wales: "recommended", ni: "recommended" } } };
    expect(row(buildSchedule(prop(), tags, TODAY), "eicr").tag).toBe("required");
  });
});

describe("status and sorting", () => {
  it("due today is due soon, yesterday is overdue, the window edge is due soon", () => {
    expect(status("2026-11-25", TODAY, figures)).toEqual({ status: "soon", days: 0 });
    expect(status("2026-11-24", TODAY, figures)).toEqual({ status: "overdue", days: -1 });
    expect(status("2027-01-24", TODAY, figures)).toEqual({ status: "soon", days: 60 });
    expect(status("2027-01-25", TODAY, figures)).toEqual({ status: "ok", days: 61 });
  });

  it("16. overdue first, then due soon, OK and missing, each by date", () => {
    const rows = buildSchedule(
      prop({
        dates: { gas: "2025-12-20", fra: "2025-10-01", pat: "2026-06-01", insurance: "2026-11-20", legionella: "2025-12-01" },
      }),
      figures,
      TODAY,
    );
    expect(rows.map((r) => [r.key, r.status])).toEqual([
      ["fra", "overdue"],
      ["insurance", "overdue"],
      ["gas", "soon"],
      ["pat", "ok"],
      ["legionella", "ok"],
      ["eicr", "missing"],
    ]);
  });
});

describe("nations and gas", () => {
  it("9. no gas → gas item hidden and not in the calendar file", () => {
    const rows = buildSchedule(prop({ hasGas: false, dates: { gas: "2026-01-15", fra: "2026-03-01" } }), figures, TODAY);
    expect(rows.some((r) => r.key === "gas")).toBe(false);
    const ev = parseIcs(buildCalendarFile(rows, settings, NOW, figures, site));
    expect(ev.map((e) => e.title)).toEqual(["Fire risk assessment review due – Flat 2"]);
  });

  it("10. tags and items by nation", () => {
    const scot = buildSchedule(prop({ nation: "scotland" }), figures, TODAY);
    expect(row(scot, "eicr").tag).toBe("required");
    expect(row(scot, "pat").tag).toBe("required");
    expect(scot.some((r) => r.key === "licence")).toBe(true);
    expect(scot.some((r) => r.key === "niCert")).toBe(false);

    const eng = buildSchedule(prop({ nation: "england" }), figures, TODAY);
    expect(eng.some((r) => r.key === "licence")).toBe(false);
    expect(row(eng, "eicr").tag).toBe("recommended");
    expect(row(eng, "gas").tag).toBe("required");

    const london = buildSchedule(prop({ nation: "london" }), figures, TODAY);
    expect(london.map((r) => [r.key, r.tag])).toEqual(eng.map((r) => [r.key, r.tag]));

    const ni = buildSchedule(prop({ nation: "ni" }), figures, TODAY);
    expect(ni.some((r) => r.key === "niCert")).toBe(true);
    expect(ni.some((r) => r.key === "licence")).toBe(false);
  });
});

describe("calendar file", () => {
  const gasRows = () => buildSchedule(prop({ dates: { gas: "2026-01-15" } }), figures, TODAY);

  it("19. follows the iCalendar format", () => {
    const ics = buildCalendarFile(gasRows(), settings, NOW, figures, site);
    expect(ics.split("\r\n").length).toBeGreaterThan(5);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270115");
    expect(ics).toContain("DTEND;VALUE=DATE:20270116");
    expect(ics).toContain("DTSTAMP:20261125T100000Z");
    expect(ics).toContain("TRIGGER:-P30D");
    expect(ics).not.toContain("TRIGGER:-P7D");
    expect(ics).not.toContain("RRULE");

    const two = buildCalendarFile(gasRows(), { ...settings, secondReminder: true }, NOW, figures, site);
    expect(two).toContain("TRIGGER:-P30D");
    expect(two).toContain("TRIGGER:-P7D");

    const later = buildCalendarFile(gasRows(), settings, new Date("2027-01-02T09:00:00Z"), figures, site);
    expect(parseIcs(later)[0].uid).toBe(parseIcs(ics)[0].uid);

    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });

  it("19. escapes text and parses back to the same events", () => {
    const rows = buildSchedule(prop({ name: "Flat 2, Leith; Top floor", dates: { gas: "2026-01-15", fra: "2026-03-01", insurance: "2027-04-01" } }), figures, TODAY);
    const ics = buildCalendarFile(rows, settings, NOW, figures, site);
    expect(ics).toContain("Flat 2\\, Leith\\; Top floor");
    const events = parseIcs(ics);
    expect(events).toHaveLength(3);
    expect(events.map((e) => [e.title, e.date])).toEqual([
      ["Gas safety check due – Flat 2, Leith; Top floor", "2027-01-15"],
      ["Fire risk assessment review due – Flat 2, Leith; Top floor", "2027-03-01"],
      ["Insurance renewal due – Flat 2, Leith; Top floor", "2027-04-01"],
    ]);
    expect(events[0].description).toContain("Last done: 15 January 2026");
    expect(events[0].description).toContain("https://www.vaforbnb.co.uk/uk-short-let-rules#gas-safety");
    expect(events[0].description).toContain("update the date at www.vaforbnb.co.uk/free-tools/holiday-let-certificate-reminders");
    expect(events[0].end).toBe("2027-01-16");
  });

  it("folds long lines at 75 octets without splitting characters", () => {
    const long = `DESCRIPTION:${escapeIcsText("Gas safety check – Flat 2 ".repeat(10))}`;
    const folded = foldIcsLine(long);
    for (const l of folded.split("\r\n")) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(long);
  });

  it("20. overdue items: on today with no alarm, or left out", () => {
    const rows = buildSchedule(prop({ dates: { fra: "2025-10-01" } }), figures, TODAY);
    const on = parseIcs(buildCalendarFile(rows, settings, NOW, figures, site));
    expect(on).toHaveLength(1);
    expect(on[0].title).toBe("OVERDUE: Fire risk assessment review – Flat 2");
    expect(on[0].date).toBe(TODAY);
    expect(on[0].triggers).toEqual([]);
    expect(parseIcs(buildCalendarFile(rows, { ...settings, includeOverdue: false }, NOW, figures, site))).toHaveLength(0);
  });

  it("21. two properties stay separate; All properties holds both", () => {
    const a = prop({ id: "a", name: "Flat A", dates: { gas: "2026-01-15" } });
    const b = prop({ id: "b", name: "Cottage B" });
    expect(buildSchedule(b, figures, TODAY).every((r) => r.status === "missing")).toBe(true);
    const b2 = { ...b, dates: { gas: "2026-02-10" } };
    expect(row(buildSchedule(a, figures, TODAY), "gas").due).toBe("2027-01-15");
    const all = parseIcs(buildCalendarFile(buildAllSchedules([a, b2], figures, TODAY), settings, NOW, figures, site));
    expect(all.map((e) => e.title)).toEqual(["Gas safety check due – Flat A", "Gas safety check due – Cottage B"]);
    expect(new Set(all.map((e) => e.uid)).size).toBe(2);
  });

  it("Google Calendar link has the title, all-day dates and description", () => {
    const url = new URL(googleLinkFor(gasRows().find((r) => r.key === "gas")!, settings, figures, TODAY, site)!);
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("text")).toBe("Gas safety check due – Flat 2");
    expect(url.searchParams.get("dates")).toBe("20270115/20270116");
    expect(url.searchParams.get("details")).toContain("Gas Safe");
  });
});

describe("example and text", () => {
  it("example: one overdue, one due soon, the rest OK", () => {
    const rows = buildSchedule(exampleProperty(TODAY), figures, TODAY);
    const by = (s: string) => rows.filter((r) => r.status === s).length;
    expect([by("overdue"), by("soon"), by("missing")]).toEqual([1, 1, 0]);
    expect(by("ok")).toBe(rows.length - 2);
  });

  it("what this means follows the result", () => {
    const over = buildSchedule(prop({ dates: { fra: "2025-10-01" } }), figures, TODAY);
    expect(whatThisMeans(over, figures)).toMatch(/^1 check is overdue\..*Add the dates you’re missing/);
    const soon = buildSchedule(prop({ hasGas: true, dates: { gas: "2025-12-20" } }), figures, TODAY);
    expect(whatThisMeans(soon, figures)).toMatch(/^1 check is due in the next 60 days/);
  });
});
