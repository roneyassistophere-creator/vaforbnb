import { describe, expect, it } from "vitest";
import { figuresSeed } from "@/data/figures.seed";
import { readContent as readScorer } from "../ai-readiness/content";
import { analyseText } from "../listing-text";
import type { Figures } from "../figures";
import { makeHandoff } from "../handoff";
import {
  addCustomShot,
  applyListState,
  buildShotList,
  captionFor,
  captionsText,
  cleanListState,
  cleanSetup,
  defaultListState,
  exampleSetup,
  factsFromHandoff,
  firstFive,
  lightTip,
  listItems,
  mergeImport,
  moveShot,
  moveTo,
  photographerBrief,
  prepSections,
  progress,
  readContent,
  removeShot,
  resetOrder,
  seasonNotes,
  shotListCsv,
  sizeBedrooms,
  standoutOptions,
  toggleTaken,
  whatThisMeans,
  type Setup,
} from ".";

const figures: Figures = Object.fromEntries(figuresSeed.map((f) => [f.key, f]));
const content = readContent(figures);
const R = content.rules;
const ex = () => exampleSetup(R);
const make = (over: Partial<Setup> = {}) => sizeBedrooms({ ...ex(), ...over }, over.bedrooms ?? ex().bedrooms);
const build = (s: Setup, c = content) => buildShotList(s, c);
const five = (s: Setup) => firstFive(s, R).map((f) => f.item.key);
/** Areas in order after the first five, skipping more shots of first-five rooms (each area once). */
const tourAreas = (s: Setup) => {
  const list = build(s);
  const fiveKeys = new Set(list.firstFive.map((f) => f.item.key));
  return [...new Set(list.shots.filter((x) => !x.isFirstFive && !fiveKeys.has(x.itemKey)).map((x) => x.itemKey))];
};
const caption = (s: Setup, key: string) => {
  const it = listItems(s, R).find((i) => i.key === key)!;
  return captionFor(it, s, R);
};

describe("order rules (stored)", () => {
  it("1. the example: first five, then the photo tour in order, view not repeated", () => {
    const s = ex();
    const list = build(s);
    expect(five(s)).toEqual(["view", "livingSpace", "bedroom-1", "kitchen", "workspace"]);
    expect(list.firstFive[4].reason).toBe("Remote workers look for a workspace.");
    expect(list.shots.slice(0, 5).map((x) => x.area)).toEqual(["Canal view", "Living room", "Bedroom 1", "Kitchen", "Workspace"]);
    expect(list.shots.slice(0, 5).every((x) => x.isFirstFive)).toBe(true);
    expect(list.shots[0].isCover).toBe(true);
    expect(tourAreas(s)).toEqual(["bedroom-2", "bathroom-1", "laundry", "stairs", "entrance", "parking", "local-1"]);
    expect(list.shots.filter((x) => x.itemKey === "view")).toHaveLength(1);
    const stairs = list.shots.find((x) => x.itemKey === "stairs")!;
    expect(stairs.honestyShot).toBe(true);
    expect(stairs.reasonForPosition).toBe("Honesty shot: helps avoid surprises.");
    expect(stairs.group).toBe("extras");
    expect(whatThisMeans(list, R)[1]).toBe("We’ve added a photo of the stairs because you mentioned it. Showing it builds trust and protects your reviews.");
  });

  it("2. captions for the example use only the host's facts, with no vague words", () => {
    const s = ex();
    const expected: Record<string, string> = {
      "bedroom-1": "Bedroom 1: king bed, blackout blinds",
      workspace: "Desk, chair and monitor in bedroom 2, 300 Mbps Wi-Fi",
      entrance: "Self check-in with a keypad",
      parking: "Permit parking for 1 car",
      "local-1": "12-minute walk to Piccadilly station",
      stairs: "Stairs to the second floor (no lift)",
    };
    for (const [k, v] of Object.entries(expected)) expect(caption(s, k), k).toBe(v);
    const scorer = readScorer(figures).model;
    for (const x of build(s).shots) expect(analyseText(x.caption, scorer).vague, x.caption).toEqual([]);
  });

  it("3. standout = living room: living, bedroom 1, kitchen, guest priority, then the next fill item; no duplicates", () => {
    const s = make({ standout: "livingSpace" });
    const f = five(s);
    expect(f).toEqual(["livingSpace", "bedroom-1", "kitchen", "workspace", "bathroom-1"]);
    expect(new Set(f).size).toBe(5);
    // The living room's wide shot is the cover, so it isn't counted twice.
    expect(build(s).shots.filter((x) => x.itemKey === "livingSpace")).toHaveLength(3);
  });

  it("4. studio: slot 3 is the sleeping area, no Bedroom 1", () => {
    const s = make({ bedrooms: 0, beds: ["double"], workspace: "none" });
    expect(five(s)[2]).toBe("sleeping");
    expect(build(s).shots.some((x) => x.area === "Bedroom 1")).toBe(false);
    expect(caption(s, "sleeping")).toBe("Sleeping area: double bed");
    expect(build(s).shots.find((x) => x.itemKey === "livingSpace")!.area).toBe("Main room");
  });

  it("5. kitchen-diner: slot 2, slot 4 falls to the next fill item, no separate kitchen or dining", () => {
    const s = make({ kitchenDiner: true, kitchen: true, dining: true, living: false });
    const f = five(s);
    expect(f[1]).toBe("kitchenDiner");
    expect(f[3]).toBe("workspace");
    expect(f[4]).toBe("bathroom-1");
    const keys = build(s).shots.map((x) => x.itemKey);
    expect(keys).not.toContain("kitchen");
    expect(keys).not.toContain("dining");
    expect(keys).not.toContain("livingSpace");
  });

  it("6. families with a private garden and no second selling point: slot 5 is the garden", () => {
    const s = make({ guestTypes: ["families"], outdoor: ["privateGarden"] });
    expect(five(s)[4]).toBe("outdoor:privateGarden");
    expect(firstFive(s, R)[4].reason).toBe("Families look for outside space.");
  });

  it("7. a chosen second selling point (hot tub) overrides the guest priority", () => {
    const s = make({ extras: ["hotTub"], second: "hotTub" });
    expect(five(s)[4]).toBe("hotTub");
    expect(firstFive(s, R)[4].reason).toBe("Your second selling point, chosen by you.");
  });

  it("8. the standout can't also be the second selling point", () => {
    const s = make({ outdoor: ["privateGarden"], standout: "outdoor:privateGarden", second: "outdoor:privateGarden" });
    const f = five(s);
    expect(f.filter((k) => k === "outdoor:privateGarden")).toHaveLength(1);
    expect(f[4]).toBe("workspace");
    // The picker offers the same options; the tool removes the standout from the second list.
    expect(standoutOptions(s, R).map((o) => o.key)).toContain("outdoor:privateGarden");
  });

  it("9. photo tour rule: every ticked room or feature appears at least once", () => {
    const s = make({
      bedrooms: 3,
      beds: ["king", "twin", "bunk"],
      ensuites: [true, false, false],
      bathrooms: 2,
      dining: true,
      laundry: ["washer", "dryer"],
      outdoor: ["balcony", "privateGarden"],
      extras: ["hotTub", "pool", "gamesRoom", "gym", "fireplace", "evCharger"],
      access: ["stepFree", "wideDoors", "walkInShower", "grabRails", "groundFloorBedroom"],
      stairs: true,
      places: [
        { name: "Piccadilly station", minutes: 12, mode: "walk" },
        { name: "the beach", minutes: 5, mode: "drive" },
      ],
    });
    const keys = new Set(build(s).shots.map((x) => x.itemKey));
    for (const i of listItems(s, R)) expect(keys.has(i.key), i.key).toBe(true);
    for (const k of ["view", "livingSpace", "kitchen", "dining", "bedroom-3", "bathroom-2", "ensuite-1", "workspace", "laundry", "outdoor:balcony", "outdoor:privateGarden", "hotTub", "pool", "gamesRoom", "gym", "fireplace", "stairs", "entrance", "parking", "access:grabRails", "evCharger", "local-2"])
      expect(keys.has(k), k).toBe(true);
  });

  it("10. the shot total is the sum of the stored per-item counts (example: 17)", () => {
    const list = build(ex());
    // cover (view) 1 + living 3 + bedroom 1 2 + kitchen 2 + workspace 1 + bedroom 2 2 + bathroom 1 + laundry 1 + stairs 1 + entrance 1 + parking 1 + local 1
    expect(1 + 3 + 2 + 2 + 1 + 2 + 1 + 1 + 1 + 1 + 1 + 1).toBe(17);
    expect(list.shots).toHaveLength(17);
    expect(list.totals).toMatchObject({ shots: 17, photos: 17 });
    const sum = list.items.reduce((n, i) => n + (R.shots[i.kind] ?? R.shots.default).length, 0);
    expect(list.totals.shots).toBe(sum);
    expect(list.totals.rooms).toBe(7);
    expect(list.totals.warning).toBeNull();
    const tiny = build(make({ bedrooms: 0, beds: [""], workspace: "none", laundry: [], view: "", standout: "", parking: "", places: [], honest: [] }));
    expect(tiny.totals.warning).toMatch(/only about \d+ photos/);
  });

  it("11. light tips: east → morning, unknown → daylight, outdoor → golden hour", () => {
    expect(build(make({ windows: "east" })).shots.find((x) => x.itemKey === "bedroom-1")!.bestLight).toBe("Shoot this room in the morning");
    expect(lightTip("", "", R, "bedroom")).toBe("Shoot in daylight, mid-morning to mid-afternoon");
    expect(lightTip("unknown", "", R, "bedroom")).toBe("Shoot in daylight, mid-morning to mid-afternoon");
    expect(build(make({ windows: "east", outdoor: ["patio"] })).shots.find((x) => x.itemKey === "outdoor:patio")!.bestLight).toBe("Golden hour (the hour before sunset) for outside shots");
    expect(lightTip("west", "", R)).toBe("Shoot this room in the afternoon");
  });

  it("12. winter with a log burner: the fireplace line and the festive decorations line", () => {
    const notes = seasonNotes(make({ season: "winter", extras: ["fireplace"] }), R);
    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatch(/log burner lit/);
    expect(notes[1]).toMatch(/festive decorations/);
    expect(seasonNotes(make({ season: "winter", extras: [] }), R)).toHaveLength(1);
  });

  it("13. reordering persists on the device; Reset restores the recommended order", () => {
    const list = build(ex());
    let st = defaultListState();
    let shots = applyListState(list, st, R);
    const original = shots.map((x) => x.id);
    // Move "bedroom-2:wide" up into the first five.
    const target = shots.findIndex((x) => x.id === "bedroom-2:wide");
    st = moveTo(st, shots, target, 2);
    shots = applyListState(list, cleanListState(JSON.parse(JSON.stringify(st))), R);
    expect(shots[2].id).toBe("bedroom-2:wide");
    expect(shots[2].isFirstFive).toBe(true);
    expect(shots[5].isFirstFive).toBe(false);
    st = moveShot(st, shots, "bedroom-2:wide", -1);
    expect(applyListState(list, st, R)[1].id).toBe("bedroom-2:wide");
    expect(applyListState(list, resetOrder(st), R).map((x) => x.id)).toEqual(original);
  });

  it("14. a missing fact drops only its part of a caption", () => {
    expect(caption(make({ wifiMbps: null }), "workspace")).toBe("Desk, chair and monitor in bedroom 2");
    expect(caption(make({ wifiMbps: null, workspace: "desk", workspaceLocation: "" }), "workspace")).toBe("Desk");
    expect(caption(make({ parkingSpaces: null }), "parking")).toBe("Permit parking");
    expect(caption(make({ checkIn: "" }), "entrance")).toBe("Front entrance");
    expect(caption(make({ checkInTime: "3pm" }), "entrance")).toBe("Self check-in with a keypad from 3pm");
    expect(caption(make({ floor: "" }), "stairs")).toBe("Stairs (no lift)");
    expect(caption(make({ places: [{ name: "the beach", minutes: null, mode: "walk" }] }), "local-1")).toBe("The beach");
    expect(caption(make({ beds: ["", "double"], blackout: [false, false] }), "bedroom-1")).toBe("Bedroom 1");
    expect(caption(make({ kitchenItems: ["oven", "hob", "dishwasher"] }), "kitchen")).toBe("Kitchen with oven, hob and dishwasher");
    expect(caption(make({ viewFrom: "the balcony" }), "view")).toBe("Canal view from the balcony");
  });

  it("15. stored order, counts and caption templates drive the output, no code change", () => {
    const rules = figures["photoShotList.rules"];
    const json = (rules.value as { json: typeof R }).json;
    const edit = (patch: Partial<typeof R>): Figures => ({ ...figures, "photoShotList.rules": { ...rules, value: { json: { ...json, ...patch } } } });
    // Order: bathroom before the main bedroom in the fill order.
    const fillOrder = ["livingSpace", "bathroom1", "kitchen", "secondOrPriority", "mainBedroom"];
    const c1 = readContent(edit({ firstFive: { slots: ["livingSpace", "bathroom1", "kitchen", "secondOrPriority"], fill: fillOrder } }));
    expect(firstFive(ex(), c1.rules).map((f) => f.item.key)).toEqual(["view", "livingSpace", "bathroom-1", "kitchen", "workspace"]);
    // Count: bathrooms get 2 shots.
    const c2 = readContent(edit({ shots: { ...json.shots, bathroom: [{ id: "wide", type: "wide" }, { id: "detail", type: "detail" }] } }));
    expect(buildShotList(ex(), c2).shots).toHaveLength(18);
    // Caption template.
    const c3 = readContent(edit({ captions: { ...json.captions, parking: "Parking: {parkingType}" } }));
    expect(captionFor({ kind: "parking", key: "parking" }, ex(), c3.rules)).toBe("Parking: Permit parking");
    // Photo-count range.
    const c4 = readContent({ ...figures, "photoShotList.photoCount": { ...figures["photoShotList.photoCount"], value: { json: { ...content.photoCount, min: 20 } } } });
    expect(buildShotList(ex(), c4).totals.warning).toMatch(/at least 20/);
  });

  it("16. import from the shared format prefills, and never overwrites what the host filled", () => {
    const h = makeHandoff("listing-text", "ai-ready-description-builder", {
      title: "Canal-view flat",
      description: "",
      sections: null,
      details: { town: "Manchester", station: "Piccadilly station", landmark: "", propertyType: "flat", bedrooms: 2, maxGuests: 4 },
      guestTypes: ["remote", "business"],
      uncoveredNeeds: [],
      vagueWords: [],
      facts: { beds: ["king", "double"], wifiMbps: 300, standout: "view", view: "canal", places: [{ name: "Piccadilly station", minutes: 12, mode: "walk" }], honest: ["stairsNoLift"], floor: "2", checkIn: "keypad" },
    });
    const facts = factsFromHandoff(JSON.parse(JSON.stringify(h)).data)!;
    expect(facts).toMatchObject({ bedrooms: 2, guestTypes: ["remote", "business"], wifiMbps: 300, view: "canal", standout: "view", floor: "2" });
    expect(facts.places).toEqual([{ name: "Piccadilly station", minutes: 12, mode: "walk" }]);

    const blank = cleanSetup({});
    const a = mergeImport(blank, facts);
    expect(a.setup).toMatchObject({ bedrooms: 2, beds: ["king", "double"], wifiMbps: 300, view: "canal", standout: "view", checkIn: "keypad" });
    expect(a.kept).toEqual([]);

    // The host already chose a different Wi-Fi speed and check-in: kept, and reported.
    const mine = { ...blank, wifiMbps: 80, checkIn: "smartLock" };
    const b = mergeImport(mine, facts);
    expect(b.setup.wifiMbps).toBe(80);
    expect(b.setup.checkIn).toBe("smartLock");
    expect(b.kept.sort()).toEqual(["checkIn", "wifiMbps"]);
    expect(b.setup.view).toBe("canal");
    // Asked: replace them too.
    expect(mergeImport(mine, facts, true).setup.wifiMbps).toBe(300);

    // Today's scorer/title-checker hand-off (no facts) still imports the basics; a place without minutes.
    const old = factsFromHandoff({ details: { town: "Leeds", station: "Leeds station", landmark: "", propertyType: "studio", bedrooms: 1, maxGuests: 2 }, guestTypes: ["couples"] })!;
    expect(old).toEqual({ bedrooms: 0, guestTypes: ["couples"], places: [{ name: "Leeds station", minutes: null, mode: "walk" }] });
    expect(factsFromHandoff(null)).toBeNull();
  });
});

describe("list state, prep and exports", () => {
  it("taken ticks, progress, custom shots and removal", () => {
    const list = build(ex());
    let st = defaultListState();
    let shots = applyListState(list, st, R);
    for (const x of shots.slice(0, 3)) st = toggleTaken(st, x.id);
    expect(progress(shots, st)).toEqual({ taken: 3, total: 17, done: false });
    st = addCustomShot(st, "Welcome hamper", "Welcome hamper on arrival", 1000);
    shots = applyListState(list, st, R);
    expect(shots).toHaveLength(18);
    expect(shots[17]).toMatchObject({ area: "Welcome hamper", caption: "Welcome hamper on arrival", custom: true });
    st = removeShot(st, "parking:wide");
    st = { ...st, captions: { "kitchen:wide": "Kitchen with oven and hob" } };
    shots = applyListState(list, cleanListState(JSON.parse(JSON.stringify(st))), R);
    expect(shots.some((x) => x.id === "parking:wide")).toBe(false);
    expect(shots.find((x) => x.id === "kitchen:wide")!.caption).toBe("Kitchen with oven and hob");
    expect(cleanListState({ taken: "x", custom: [{ id: "evil", name: "x" }] })).toMatchObject({ taken: [], custom: [] });
  });

  it("prep checklist: whole home first, then each room with a stored list", () => {
    const p = prepSections(build(ex()).items, R);
    expect(p[0].title).toBe("Whole home");
    expect(p[0].items[0].text).toBe("All lights on (warm white)");
    expect(p.map((x) => x.key)).toContain("bedroom-1");
    expect(p.find((x) => x.key === "bathroom-1")!.items.map((i) => i.text)).toContain("Toilet seat down");
  });

  it("exports: captions in order, a safe CSV, and the photographer brief", () => {
    const shots = applyListState(build(ex()), defaultListState(), R);
    const caps = captionsText(shots).split("\n");
    expect(caps[0]).toBe("1. Canal view: Canal view");
    expect(caps[2]).toBe("3. Bedroom 1: Bedroom 1: king bed, blackout blinds");
    const csv = shotListCsv(shots, toggleTaken(defaultListState(), shots[0].id));
    const lines = csv.replace(/^﻿/, "").split("\r\n");
    expect(lines[0]).toBe("#,Area,Shot type,First five,Caption,What to show,Taken");
    expect(lines[1]).toMatch(/^1,Canal view,Wide,yes,Canal view,.*,yes$/);
    expect(lines).toHaveLength(19);
    expect(photographerBrief(shots, R, "Canal flat")).toContain("1. Canal view, 2. Living room, 3. Bedroom 1, 4. Kitchen, 5. Workspace");
  });
});
