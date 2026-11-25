import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/airbnb-photo-shot-list";
const KEYS = ["vaforbnb:tool:airbnb-photo-shot-list:v1", "vaforbnb:tool:airbnb-photo-shot-list:list:v1", "vaforbnb:handoff:listing-text", "vaforbnb:handoff:kit-basics"];
/** Facts, captions and notes that must never leave the device. */
const SECRETS = ["Piccadilly", "blackout", "300 Mbps", "Zebedee", "Quillstone", "keypad"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

function watch(page: Page) {
  const seen: { url: string; body: string }[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/static/")) return;
    seen.push({ url: decodeURIComponent(r.url()), body: r.postData() ?? "" });
  });
  return seen;
}
const noLeaks = (seen: { url: string; body: string }[]) => {
  for (const s of seen) for (const secret of SECRETS) expect(`${s.url} ${s.body}`.toLowerCase(), `request leaked "${secret}"`).not.toContain(secret.toLowerCase());
};

async function open(page: Page, query = "") {
  await page.goto(PATH);
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  await page.goto(PATH + query);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}
const tiles = (page: Page) => page.locator("[data-grid-tile]");
const card = (page: Page, id: string) => page.locator(`[data-shot="${id}"]`);

test("example list: first five, reorder a shot into the first five with buttons and by dragging; the grid updates", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(page.locator("[data-totals]")).toHaveText("17 shots planned · 7 rooms in the photo tour");
  await expect(tiles(page)).toHaveText(["1 · CoverCanal view", "2Living room", "3Bedroom 1", "4Kitchen", "5Workspace"]);
  await expect(card(page, "workspace:wide").locator("[data-reason]")).toContainText("Remote workers look for a workspace.");
  await expect(card(page, "stairs:wide")).toContainText("Honesty shot");
  await expect(card(page, "bedroom-1:wide").locator("input[id^=cap-]")).toHaveValue("Bedroom 1: king bed, blackout blinds");

  // Buttons: move Bathroom 1 up into the first five.
  const id = "bathroom-1:wide";
  while ((await card(page, id).getAttribute("data-position")) !== "5") await card(page, id).getByRole("button", { name: /Move Bathroom 1 up/ }).click();
  await expect(tiles(page).nth(4)).toContainText("Bathroom 1");
  await expect(card(page, id)).toContainText("First five");
  await expect(card(page, "workspace:wide")).not.toContainText("First five");
  // Drag (Playwright can only drag between cards that are on screen together): Bedroom 2 onto the card above it.
  const before = Number(await card(page, "bedroom-2:wide").getAttribute("data-position"));
  const above = page.locator(`[data-shot][data-position="${before - 1}"]`);
  await above.scrollIntoViewIfNeeded();
  await card(page, "bedroom-2:wide").locator("[draggable=true]").dragTo(above.locator("h4"));
  await expect(card(page, "bedroom-2:wide")).toHaveAttribute("data-position", String(before - 1));
  // Persists, then Reset restores the recommended order.
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(tiles(page).nth(4)).toContainText("Bathroom 1");
  await expect(card(page, "bedroom-2:wide")).toHaveAttribute("data-position", String(before - 1));
  await page.getByRole("button", { name: "Reset to recommended order" }).click();
  await expect(tiles(page)).toHaveText(["1 · CoverCanal view", "2Living room", "3Bedroom 1", "4Kitchen", "5Workspace"]);

  // Vague word in an edited caption: amber note.
  await card(page, "kitchen:wide").locator("input[id^=cap-]").fill("Lovely kitchen");
  await expect(card(page, "kitchen:wide").locator("[data-vague]")).toContainText("Lovely");
  noLeaks(seen);
});

test("shoot-day mode: mark 3 taken, close the page, reopen and carry on; finish shows the summary", async ({ page, context }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Start shoot-day mode" }).click();
  const mode = page.locator("[data-shoot-mode]");
  await expect(mode).toBeVisible();
  await expect(mode.getByRole("heading", { level: 2 })).toContainText("Canal view");
  await expect(mode.locator('[aria-live="polite"]')).toContainText("Shot 1 of 17, Canal view");
  for (let n = 0; n < 3; n++) await mode.getByRole("button", { name: "Taken ✓" }).click();
  await expect(mode.locator("[data-shoot-progress]")).toHaveText("3 of 17 taken");
  await expect(mode.locator("[data-shoot-area]")).toContainText("Kitchen");

  // Close the page entirely and come back.
  await page.close();
  const again = await context.newPage();
  await again.goto(PATH);
  await expect(again.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(again.locator("[data-progress]")).toHaveText("3 of 17 taken");
  await again.getByRole("button", { name: "Start shoot-day mode" }).click();
  const m2 = again.locator("[data-shoot-mode]");
  await expect(m2.locator("[data-shoot-area]")).toContainText("Kitchen");
  await expect(m2.locator("[data-shoot-progress]")).toHaveText("3 of 17 taken");
  for (let n = 0; n < 14; n++) await m2.getByRole("button", { name: "Taken ✓" }).click();
  await expect(m2.locator("[data-shoot-finish]")).toContainText("All 17 shots taken");
  await expect(m2.locator("[data-shoot-finish]")).toContainText("Next: upload in this order and paste your captions.");
  await m2.getByRole("button", { name: "Back to the list and captions" }).click();
  await expect(again.locator("[data-progress]")).toHaveText("17 of 17 taken");
});

test("copy all captions; download the PDF and the CSV (made on the device)", async ({ page, context }) => {
  const seen = watch(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.locator("[data-toolbar]").getByRole("button", { name: "Copy all captions" }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip.split("\n")[0]).toBe("1. Canal view: Canal view");
  expect(clip).toContain("17. Local area: Piccadilly station: 12-minute walk to Piccadilly station");

  const [csv] = await Promise.all([page.waitForEvent("download"), page.locator("[data-download=csv]").click()]);
  expect(csv.suggestedFilename()).toMatch(/^photo-shot-list-\d{4}-\d{2}-\d{2}\.csv$/);
  const text = readFileSync((await csv.path())!, "utf8").replace(/^﻿/, "");
  expect(text.split("\r\n")[0]).toBe("#,Area,Shot type,First five,Caption,What to show,Taken");
  expect(text.split("\r\n").filter(Boolean)).toHaveLength(18);

  const [pdf] = await Promise.all([page.waitForEvent("download"), page.locator("[data-download=pdf]").click()]);
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);
  expect(readFileSync((await pdf.path())!).subarray(0, 4).toString()).toBe("%PDF");

  // Captions tab: per-caption copy, and the hint on where captions go.
  await page.getByRole("tab", { name: "Captions" }).click();
  await expect(page.locator("[data-captions-tab]")).toContainText("Photo tour");
  noLeaks(seen);
});

test("arrive from the kit with imported data, Undo import, then continue to the long-stay discount calculator", async ({ page }) => {
  const seen = watch(page);
  await page.goto(PATH);
  await page.evaluate((keys) => {
    keys.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(
      "vaforbnb:handoff:listing-text",
      JSON.stringify({
        format: "vaforbnb-handoff",
        version: 1,
        kind: "listing-text",
        source: "ai-ready-description-builder",
        createdAt: "2026-11-25T10:00:00.000Z",
        data: {
          title: "Quillstone flat",
          description: "",
          sections: null,
          details: { town: "Manchester", station: "Piccadilly station", landmark: "", propertyType: "flat", bedrooms: 2, maxGuests: 4 },
          guestTypes: ["remote"],
          uncoveredNeeds: [],
          vagueWords: [],
          facts: { beds: ["king", "double"], wifiMbps: 300, view: "canal", standout: "view", workspace: "full", workspaceLocation: "bedroom 2", places: [{ name: "Piccadilly station", minutes: 12, mode: "walk" }] },
        },
      }),
    );
  }, KEYS);
  await page.goto(`${PATH}?kit=more-bookings`);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.locator("[data-kit-badge]")).toHaveText("Get more bookings kit · step 4");
  await expect(page.locator("[data-imported]")).toContainText("Imported from your description");
  await expect(tiles(page).first()).toContainText("Canal view");
  await expect(page.locator('[data-shot="local-1:wide"] input[id^=cap-]')).toHaveValue("12-minute walk to Piccadilly station");

  // Undo import, then reload: the import isn't applied again.
  await page.locator("[data-undo-import]").click();
  await expect(page.locator("[data-imported]")).toHaveCount(0);
  await expect(tiles(page).first()).not.toContainText("Canal view");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.locator("[data-imported]")).toHaveCount(0);

  const next = page.locator('[data-next-step="kit"]');
  await expect(next).toContainText("Next in your kit: Long-stay discount calculator");
  await next.locator("[data-kit-next]").click();
  await expect(page.locator("[data-next-saved]")).toContainText("Saved on this device");
  const basics = await page.evaluate(() => JSON.parse(localStorage.getItem("vaforbnb:handoff:kit-basics") ?? "null"));
  expect(Object.keys(basics.data).sort()).toEqual(["bedrooms", "guestTypes"]);
  noLeaks(seen);
});

test("390px: no horizontal scroll; shoot-day buttons are big and in the thumb zone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  for (const t of ["Photo order", "Prep checklist", "Light and kit", "Captions"]) {
    await page.getByRole("tab", { name: t }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), t).toBeLessThanOrEqual(390);
  }
  await expect(page.locator("[data-sticky-see]")).toBeVisible();
  await page.getByRole("button", { name: "Start shoot-day mode" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const name of ["Taken ✓", "Skip"]) {
    const b = (await page.getByRole("button", { name, exact: true }).boundingBox())!;
    expect(b.height, name).toBeGreaterThanOrEqual(56);
    expect(b.y, `${name} in the lower half`).toBeGreaterThan(844 / 2);
    expect(b.y + b.height).toBeLessThanOrEqual(844);
  }
  const taken = (await page.getByRole("button", { name: "Taken ✓" }).boundingBox())!;
  expect(taken.width).toBeGreaterThan(300);
});

test("setup by keyboard and taps: steps tick off, the list updates live, standout picker excludes itself from second", async ({ page }) => {
  await open(page);
  await page.locator("#ps-step-btn-0").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#ps-step-0")).toBeHidden();
  await page.keyboard.press("Enter");
  await page.getByRole("checkbox", { name: "Private garden" }).check();
  await page.getByRole("button", { name: "Next: What sells it →" }).click();
  await expect(page.locator("#ps-step-btn-0")).toContainText("✓");
  await page.getByRole("radio", { name: "Private garden" }).first().check();
  await expect(tiles(page).first()).toContainText("Private garden");
  await expect(page.locator('[role=radiogroup], fieldset').filter({ hasText: "Second selling point" }).getByRole("radio", { name: "Private garden" })).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Families" }).check();
  await expect(page.locator("[data-totals]")).toContainText("shots planned");
});

test("page: SEO, structured data and static sections are in the HTML without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(PATH);
  await expect(page).toHaveTitle("Airbnb Photo Order & Shot List Planner | VA for BnB");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /cover photo, first five, every room for the photo tour/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Which photos do I need, and in what order?");
  await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toContainText("Get more bookings");
  for (const h of ["What this means", "How it works", "Limits", "Questions about Airbnb photos", "Related tools", "Changelog"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
  await expect(page.locator("[data-how]")).toHaveCount(4);
  await expect(page.locator("[data-disclaimer]")).toContainText("Photos must show the property accurately.");
  await expect(page.getByText("Most homes need around 20–30.")).toBeAttached();
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  for (const t of ['"FAQPage"', '"WebApplication"', '"BreadcrumbList"', '"BusinessApplication"', '"GB"']) expect(ld).toContain(t);
  await ctx.close();
});

test("hub: 4th in Get more bookings and live; linked from the scorer and the Listing optimisation page", async ({ page }) => {
  await page.goto("/free-tools?job=get-more-bookings");
  await expect(page.getByRole("button", { name: /Get more bookings/ })).toHaveAttribute("aria-pressed", "true");
  const card = page.locator("#photo-shot-list-planner");
  await expect(card).toHaveAttribute("href", PATH);
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("Which photos, in what order?");
  await expect(card).toContainText("Shot list + PDF");
  const names = await page.locator("#all [id] p.font-extrabold").allTextContents();
  expect(names.slice(0, 4)).toEqual(["AI-readiness listing scorer", "Airbnb title checker", "AI-ready description builder", "Photo shot list planner"]);
  await page.goto("/services/listing-optimisation");
  await expect(page.locator("[data-photo-planner-link] a")).toHaveAttribute("href", PATH);

  // The scorer's room details fix card: "Plan my photos and captions" carries the details across.
  await page.goto("/free-tools/airbnb-ai-readiness-score");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.getByRole("button", { name: "Try an example" }).click();
  // The example's top fixes include room details (G).
  await page.locator('[data-fix="G"] [data-plan-photos]').click();
  await expect(page).toHaveURL(`${PATH}?from=airbnb-ai-readiness-score`);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  // The scorer's example has 2 bedrooms and remote workers: imported.
  await expect(page.locator("[data-imported]")).toContainText("Imported from your AI-readiness score");
  await expect(page.locator("[data-grid-tile]").filter({ hasText: "Bedroom 1" })).toHaveCount(1);
});
