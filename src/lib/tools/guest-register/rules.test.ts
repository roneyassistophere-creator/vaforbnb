import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import { BOM, parseCsv } from "../csv";
import type { Figures } from "../figures";
import { isSealed, newVaultKey, seal, unseal, WrongPasscodeError } from "../vault";
import {
  blankCsv,
  buildCsv,
  buildPrintable,
  checkInCard,
  copyNextDestination,
  deletePastRetention,
  emptyData,
  guestMessage,
  isPastRetention,
  keepUntil,
  needsExtraDetails,
  readLists,
  registerColumns,
  restoreStays,
  validateGuest,
  validateStay,
  whatThisMeans,
  type Guest,
  type Stay,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const lists = readLists(figures);
const TODAY = "2026-11-25";
const withFigure = (key: string, value: Figures[string]["value"]): Figures => ({ ...figures, [key]: { ...figures[key], value } });

const guest = (over: Partial<Guest>): Guest => ({ id: "g1", fullName: "Sam Taylor", nationality: "GB", ...over });
const stay = (over: Partial<Stay>): Stay => ({ id: "s1", propertyId: "p1", reference: "HM123", arrival: "2026-11-25", under16: 0, guests: [guest({})], recordedOn: TODAY, ...over });

describe("nationality rule", () => {
  it("1–3. British, Irish and Canadian guests need no extra details", () => {
    expect(needsExtraDetails(["GB"], lists)).toBe(false);
    expect(needsExtraDetails(["GB-BNO"], lists)).toBe(false);
    expect(needsExtraDetails(["IE"], lists)).toBe(false);
    expect(needsExtraDetails(["CA"], lists)).toBe(false);
    expect(validateGuest(guest({ nationality: "GB" }), lists)).toEqual({});
  });

  it("4. a French guest needs passport/ID, place of issue and next destination; address optional", () => {
    expect(needsExtraDetails(["FR"], lists)).toBe(true);
    expect(validateGuest(guest({ nationality: "FR" }), lists)).toEqual({
      idNumber: "Add their passport or ID number",
      placeOfIssue: "Add where it was issued",
      nextDestination: "Add where they’re going next",
    });
    expect(validateGuest(guest({ nationality: "FR", idNumber: "12AB", placeOfIssue: "FR", nextDestination: "Paris" }), lists)).toEqual({});
  });

  it("5. an American guest needs extra details", () => {
    expect(needsExtraDetails(["US"], lists)).toBe(true);
  });

  it("6. dual French and Australian → exempt", () => {
    expect(needsExtraDetails(["FR", "AU"], lists)).toBe(false);
    expect(validateGuest(guest({ nationality: "FR", nationality2: "AU" }), lists)).toEqual({});
  });

  it("7. stateless or unknown → extra details", () => {
    expect(needsExtraDetails(["STATELESS"], lists)).toBe(true);
    expect(needsExtraDetails(["UNKNOWN"], lists)).toBe(true);
    expect(needsExtraDetails([], lists)).toBeNull();
  });

  it("16. changing the stored Commonwealth list changes the result", () => {
    const exempt = { ...(figures["guestRegister.exemptNationalities"].value as Record<string, string>) };
    delete exempt.CA;
    const l = readLists(withFigure("guestRegister.exemptNationalities", exempt));
    expect(needsExtraDetails(["CA"], l)).toBe(true);
    expect(needsExtraDetails(["AU"], l)).toBe(false);
  });
});

describe("validation", () => {
  it("8. missing full name", () => {
    expect(validateGuest(guest({ fullName: "  " }), lists).fullName).toBe("Add the guest’s full name");
  });

  it("9. an extra-details guest without a passport number blocks the stay", () => {
    const s = stay({ guests: [guest({ id: "a", nationality: "FR", placeOfIssue: "FR", nextDestination: "Paris" })] });
    const e = validateStay(s, lists);
    expect(e.count).toBe(1);
    expect(e.guests.a.idNumber).toBe("Add their passport or ID number");
  });

  it("10. departure before arrival", () => {
    expect(validateStay(stay({ arrival: "2026-11-25", departure: "2026-11-24" }), lists).stay.departure).toBe("The departure date can’t be before the arrival date");
    expect(validateStay(stay({ arrival: "2026-11-25", departure: "2026-11-25" }), lists).count).toBe(0);
  });

  it("11. under-16s are a count only: no names and no CSV rows", () => {
    const s = stay({ under16: 2, guests: [guest({})] });
    expect(Object.keys(s)).not.toContain("children");
    const rows = parseCsv(buildCsv([s], lists, () => "Flat 2"));
    expect(rows).toHaveLength(2); // header + 1 adult
  });
});

describe("retention", () => {
  it("12. departure + 12 months, on the day = past retention", () => {
    expect(keepUntil(stay({ arrival: "2025-11-20", departure: "2025-11-25" }), figures)).toBe("2026-11-25");
    expect(isPastRetention(stay({ arrival: "2025-11-20", departure: "2025-11-25" }), figures, TODAY)).toBe(true);
    expect(keepUntil(stay({ arrival: "2025-11-20", departure: "2025-11-26" }), figures)).toBe("2026-11-26");
    expect(isPastRetention(stay({ arrival: "2025-11-20", departure: "2025-11-26" }), figures, TODAY)).toBe(false);
  });

  it("13. no departure uses arrival; month end", () => {
    expect(keepUntil(stay({ arrival: "2025-10-31" }), figures)).toBe("2026-10-31");
    expect(isPastRetention(stay({ arrival: "2025-10-31" }), figures, TODAY)).toBe(true);
    expect(keepUntil(stay({ arrival: "2025-08-01", departure: "2025-08-31" }), withFigure("guestRegister.retentionMonths", 6))).toBe("2026-02-28");
  });

  it("17. 24 months retention changes the results", () => {
    const f = withFigure("guestRegister.retentionMonths", 24);
    expect(keepUntil(stay({ arrival: "2025-11-20", departure: "2025-11-25" }), f)).toBe("2027-11-25");
    expect(isPastRetention(stay({ arrival: "2025-11-20", departure: "2025-11-25" }), f, TODAY)).toBe(false);
  });

  it("18. bulk delete removes only past-retention stays; undo restores them", () => {
    const old1 = stay({ id: "old1", arrival: "2025-01-10", departure: "2025-01-12" });
    const old2 = stay({ id: "old2", arrival: "2025-10-31" });
    const recent = stay({ id: "new", arrival: "2026-06-01" });
    const d = { ...emptyData(), stays: [old1, recent, old2] };
    const { data, removed } = deletePastRetention(d, figures, TODAY);
    expect(data.stays.map((s) => s.id)).toEqual(["new"]);
    expect(removed.map((s) => s.id)).toEqual(["old1", "old2"]);
    expect(restoreStays(data, removed).stays.map((s) => s.id).sort()).toEqual(["new", "old1", "old2"]);
  });
});

describe("helpers and files", () => {
  it("14. same next destination copies only to guests who need extra details", () => {
    const g = [
      guest({ id: "a", nationality: "FR", nextDestination: "Paris", nextAddress: "1 Rue X" }),
      guest({ id: "b", nationality: "GB" }),
      guest({ id: "c", nationality: "US" }),
    ];
    const out = copyNextDestination(g, lists);
    expect(out[1].nextDestination).toBeUndefined();
    expect(out[2].nextDestination).toBe("Paris");
    expect(out[2].nextAddress).toBe("1 Rue X");
  });

  it("15. CSV: columns, BOM, quoting, accents, formula guard, one row per adult", () => {
    const s = stay({
      reference: "=SUM(A1)",
      departure: "2026-11-28",
      platform: "airbnb",
      guests: [
        guest({ id: "a", fullName: "Smith, Jr." }),
        guest({ id: "b", fullName: 'Ann "Annie" Lee' }),
        guest({ id: "c", fullName: "José Zoë Łukasz", nationality: "ES", idNumber: "X123", placeOfIssue: "ES", nextDestination: "Madrid" }),
      ],
    });
    const csv = buildCsv([s], lists, () => "Flat 2");
    expect(csv.startsWith(BOM)).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe(registerColumns.join(","));
    expect(lines[1]).toContain('"Smith, Jr."');
    expect(lines[2]).toContain('"Ann ""Annie"" Lee"');
    expect(lines[3]).toContain("José Zoë Łukasz");
    expect(lines[1].startsWith("'=SUM(A1)")).toBe(true);
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(4);
    expect(rows[3]).toEqual(["'=SUM(A1)", "Flat 2", "Airbnb", "25/11/2026", "28/11/2026", "José Zoë Łukasz", "Spain", "", "X123", "Spain", "Madrid", "", "25/11/2026"]);
    // A British guest's row has no extra details.
    expect(rows[1].slice(8, 12)).toEqual(["", "", "", ""]);
  });

  it("templates and printables", () => {
    expect(blankCsv(false).slice(1).trimEnd()).toBe(registerColumns.join(","));
    expect(blankCsv(true)).toContain("EXAMPLE – delete");
    const html = buildPrintable([stay({ guests: [guest({ fullName: "<script>x</script>" })] })], lists, () => "Flat 2", { subtitle: "Flat 2" });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>x");
    expect(html).toContain("counter(pages)");
    expect(checkInCard(lists, "Flat 2")).toContain("Only if you’re not a British, Irish or Commonwealth citizen");
  });

  it("guest message: friendly and email versions, never passport photos", () => {
    const m = guestMessage({ guestName: "Alex", property: "Flat 2", host: "Jo", tone: "friendly", channel: "email" }, lists);
    expect(m.startsWith("Subject: Guest details for your stay at Flat 2\n\nHi Alex, we’re looking forward to your stay at Flat 2!")).toBe(true);
    expect(m).toContain("aged 16 or over");
    expect(m.endsWith("Thank you! Jo")).toBe(true);
    expect(m.toLowerCase()).not.toContain("photo");
  });

  it("what this means follows the state", () => {
    expect(whatThisMeans([], lists, figures, TODAY)).toMatch(/^Record each booking/);
    expect(whatThisMeans([stay({ arrival: "2026-06-01" })], lists, figures, TODAY)).toBe("Your register has 1 stay. Keep it secure and download a backup copy now and then.");
    expect(whatThisMeans([stay({ arrival: "2025-01-01", guests: [guest({ nationality: "FR" })] })], lists, figures, TODAY)).toBe(
      "1 stay is older than 12 months. Delete it unless you have another reason to keep it. Some guests needed extra details because they aren’t British, Irish or Commonwealth citizens.",
    );
  });
});

describe("19. passcode lock", () => {
  it("is unreadable without the passcode, opens with it, and rejects a wrong one", async () => {
    const data = { ...emptyData(), stays: [stay({ guests: [guest({ fullName: "Zebedee Quill", nationality: "FR", idNumber: "PASS999" })] })] };
    const key = await newVaultKey("correct horse", 1000);
    const sealed = await seal(data, key);
    const raw = JSON.stringify(sealed);
    expect(isSealed(sealed)).toBe(true);
    expect(raw).not.toContain("Zebedee");
    expect(raw).not.toContain("PASS999");
    const opened = await unseal<typeof data>(sealed, "correct horse");
    expect(opened.value.stays[0].guests[0].fullName).toBe("Zebedee Quill");
    await expect(unseal(sealed, "wrong")).rejects.toBeInstanceOf(WrongPasscodeError);
    await expect(unseal(sealed, "wrong")).rejects.toThrow("That passcode doesn’t match.");
    expect(JSON.stringify(sealed)).toBe(raw); // unchanged
  });
});

describe("example register", () => {
  it("has three labelled stays (one past retention, some extra details) and clears cleanly", async () => {
    const { exampleRegister, withExample, withoutExample, saveStay } = await import(".");
    const stays = exampleRegister("my-property", TODAY);
    expect(stays).toHaveLength(3);
    expect(stays.every((s) => s.example)).toBe(true);
    expect(stays.filter((s) => isPastRetention(s, figures, TODAY))).toHaveLength(1);
    expect(stays.some((s) => s.guests.some((g) => needsExtraDetails([g.nationality], lists)))).toBe(true);
    for (const s of stays) expect(validateStay(s, lists).count).toBe(0);

    const real = stay({ id: "real" });
    const d = withExample({ ...emptyData(), stays: [real] }, TODAY);
    expect(d.stays).toHaveLength(4);
    expect(d.draft?.stay.example).toBe(true);
    // Editing a sample stay keeps it an example; saving the example form makes a real record.
    expect(saveStay(d, { ...stays[0], reference: "X" }, "example-1").saved.example).toBe(true);
    expect(saveStay(d, d.draft!.stay, null).saved.example).toBeUndefined();
    const cleared = withoutExample(d);
    expect(cleared.stays.map((s) => s.id)).toEqual(["real"]);
    expect(cleared.draft).toBeNull();
  });
});
