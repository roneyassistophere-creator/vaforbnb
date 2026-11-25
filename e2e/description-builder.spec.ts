import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/airbnb-description-builder";
const KEYS = [
  "vaforbnb:tool:airbnb-description-builder:v1",
  "vaforbnb:tool:airbnb-ai-readiness-score:v1",
  "vaforbnb:tool:airbnb-ai-readiness-score:history:v1",
  "vaforbnb:tool:airbnb-photo-shot-list:v1",
  "vaforbnb:handoff:listing-text",
  "vaforbnb:handoff:scorer-prefill",
  "vaforbnb:handoff:house-rules",
];
/** Facts and description text that must never leave the device. */
const SECRETS = ["Ancoats", "canal view", "Piccadilly", "300 Mbps", "Northern Quarter", "Quillstone", "second floor"];
const TEST1 =
  "2-bedroom flat in Ancoats with a canal view from the living room. 12-minute walk to Piccadilly station. Ideal for remote workers and couples: 300 Mbps Wi-Fi and a desk, chair and monitor in bedroom 2. 45 m², sleeps 4: king in bedroom 1, double in bedroom 2. 5-minute walk to Northern Quarter and 10-minute drive to Etihad Stadium. Please note: second floor, no lift.";

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

async function open(page: Page, query = "", seed?: (keys: string[]) => void) {
  await page.goto(PATH);
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  if (seed) await page.evaluate(seed, KEYS);
  await page.goto(PATH + query);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}
const out = (page: Page) => page.locator("[data-output-desktop]");
const tab = (page: Page, name: string) => out(page).getByRole("tab", { name: new RegExp(`^${name}`) });
const text = (page: Page, id: string) => out(page).locator(`[data-section-text=${id}]`);

test("the example fills all four tabs, with live counters; the listing description is exact; nothing is sent", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(text(page, "listing")).toHaveValue(TEST1);
  await expect(out(page).locator("[data-section-count=listing]")).toHaveText(/366 \/ 500/);
  for (const [name, id, has] of [
    ["The space", "space", "Bedroom 1: king bed."],
    ["Guest access", "access", "You’ll have the whole flat to yourself."],
    ["Other things to note", "notes", "The flat is on the second floor and there’s no lift."],
  ] as const) {
    await tab(page, name).click();
    await expect(text(page, id)).toContainText(has);
    await expect(out(page).locator(`[data-section-count=${id}]`)).toHaveText(/\d+ \/ 10000/);
  }
  await expect(out(page).locator("[data-mini-score]")).toHaveText(/\d+ of 65/);
  await expect(out(page).locator("[data-integrity]")).toContainText("All facts from your answers ✓");
  await expect(out(page).locator('[data-needs-guest=remote] [data-need="workspace"]')).toHaveAttribute("data-covered", "yes");
  await expect(out(page).locator('[data-needs-guest=remote] [data-need="quiet"]')).toHaveAttribute("data-covered", "no");

  // Live: add a quiet street, and the need is covered.
  await out(page).getByRole("button", { name: "Add it: Quiet for Remote workers" }).click();
  await expect(page.locator("#db-quiet")).toBeFocused();
  await page.getByRole("checkbox", { name: "Residential street" }).check();
  await expect(out(page).locator('[data-needs-guest=remote] [data-need="quiet"]')).toHaveAttribute("data-covered", "yes");
  await tab(page, "The space").click();
  await expect(text(page, "space")).toContainText("Residential street.");

  // Vague guard on the standout feature.
  await page.locator("#db-step-btn-1").click();
  await page.getByLabel(/^Standout feature/).fill("a cosy and stunning loft");
  await expect(page.locator("#db-standout-vague")).toContainText("cosy");
  noLeaks(seen);
});

test("edit a section, lock it, change the form: the locked section keeps its edits; an unlocked edit asks first", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await tab(page, "Guest access").click();
  await text(page, "access").fill("Quillstone access text, written by me.");
  await expect(tab(page, "Guest access")).toContainText("Edited");
  await out(page).locator("[data-lock=access]").check();
  // Change the form: the check-in method.
  await page.locator("#db-step-btn-3").click();
  await page.getByRole("radio", { name: "Keypad" }).check();
  await expect(text(page, "access")).toHaveValue("Quillstone access text, written by me.");
  await expect(out(page).locator("[data-update-prompt]")).toHaveCount(0);
  // Unlocked edit: changing the form asks.
  await out(page).locator("[data-lock=access]").uncheck();
  await page.getByRole("radio", { name: "Smart lock" }).check();
  await expect(out(page).locator("[data-update-prompt]")).toContainText("Your edits will be replaced");
  await out(page).getByRole("button", { name: "Keep", exact: true }).click();
  await expect(text(page, "access")).toHaveValue("Quillstone access text, written by me.");
  await page.getByRole("radio", { name: "Keypad" }).check();
  await out(page).getByRole("button", { name: "Update", exact: true }).click();
  await expect(text(page, "access")).toContainText("Self check-in with a keypad.");
  // Locks survive a reload.
  await text(page, "access").fill("My words again.");
  await out(page).locator("[data-lock=access]").check();
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await tab(page, "Guest access").click();
  await expect(text(page, "access")).toHaveValue("My words again.");
});

test("Make it fit, undo one step, then copy all sections", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "", () => {
    localStorage.setItem(
      "vaforbnb:tool:airbnb-description-builder:v1",
      JSON.stringify({
        facts: {
          propertyType: "flat",
          bedrooms: 2,
          maxGuests: 4,
          sizeM2: 45,
          area: "Ancoats",
          floor: "2",
          lift: false,
          standout: "a private south-facing garden with a hot tub and fire pit set",
          guestTypes: ["remote", "couples"],
          beds: ["king", "double"],
          workspace: "full",
          workspaceLocation: "bedroom 2",
          wifiMbps: 300,
          places: [
            { name: "Manchester Piccadilly station", minutes: 12, mode: "walk", type: "station" },
            { name: "the Northern Quarter bars and cafes", minutes: 5, mode: "walk", type: "cityCentre" },
            { name: "Etihad Stadium and the Co-op Live arena", minutes: 10, mode: "drive", type: "stadium" },
            { name: "Manchester Royal Infirmary", minutes: 15, mode: "bus", type: "hospital" },
            { name: "University of Manchester", minutes: 20, mode: "tram", type: "university" },
          ],
          honest: ["stairsNoLift", "streetNoise", "compactKitchen"],
          signOff: "Message us any time with questions about your stay here.",
        },
        overrides: {},
        fitSteps: [0],
        example: false,
        visited: [0, 1, 2, 3, 4, 5],
        importedAt: "",
        title: "",
      }),
    );
  });
  await expect(out(page).locator("[data-over]")).toContainText(/Over by \d+ characters/);
  await out(page).locator("[data-make-fit]").click();
  await expect(out(page).locator("[data-over]")).toHaveCount(0);
  await expect(out(page).locator("[data-moved]")).toContainText("Moved ‘your sign-off’ to Other things to note.");
  await tab(page, "Other things to note").click();
  await expect(text(page, "notes")).toContainText("Message us any time with questions about your stay here.");
  await tab(page, "Listing description").click();
  const fitted = await text(page, "listing").inputValue();
  await out(page).locator("[data-undo-fit]").click();
  await expect(text(page, "listing")).not.toHaveValue(fitted);
  await out(page).getByRole("button", { name: "Copy all sections" }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  for (const h of ["Listing description", "The space", "Guest access", "Other things to note"]) expect(clip).toContain(h);
  expect(clip).toContain("The kitchen is compact.");

  const [dl] = await Promise.all([page.waitForEvent("download"), out(page).locator("[data-download]").click()]);
  expect(dl.suggestedFilename()).toMatch(/^airbnb-description-\d{4}-\d{2}-\d{2}\.txt$/);
  expect(readFileSync((await dl.path())!, "utf8")).toContain("Guest access");
});

test("Score this opens the scorer with the sections prefilled; B, C and E match the builder's", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await out(page).locator("[data-score-this]").click();
  await expect(page).toHaveURL("/free-tools/airbnb-ai-readiness-score?from=airbnb-description-builder");
  await expect(page.locator('[data-tool="airbnb-ai-readiness-score"][data-ready]')).toBeVisible();
  await expect(page.getByText("Your four sections came across from the AI-ready description builder")).toBeVisible();
  await expect(page.locator("#air-description")).toHaveValue(TEST1);
  await page.getByRole("tab", { name: "Score breakdown" }).click();
  await expect(page.locator('[data-breakdown="B"]')).toContainText("15 / 15");
  await expect(page.locator('[data-breakdown="C"]')).toContainText("15 / 15");
  await expect(page.locator('[data-breakdown="E"]')).toContainText("10 / 10");
  noLeaks(seen);
});

test("arrive from the kit with imported details; Undo import; continue to the photo planner, which imports them", async ({ page }) => {
  const seen = watch(page);
  await open(page, "?kit=more-bookings", () => {
    localStorage.setItem(
      "vaforbnb:handoff:listing-text",
      JSON.stringify({
        format: "vaforbnb-handoff",
        version: 1,
        kind: "listing-text",
        source: "airbnb-ai-readiness-score",
        createdAt: "2026-11-25T10:00:00.000Z",
        data: { title: "Quillstone flat", description: "", sections: null, details: { town: "Manchester", station: "Piccadilly station", landmark: "", propertyType: "flat", bedrooms: 2, maxGuests: 4 }, guestTypes: ["remote"], uncoveredNeeds: [], vagueWords: [] },
      }),
    );
  });
  await expect(page.locator("[data-kit-badge]")).toHaveText("Get more bookings kit · step 3");
  await expect(page.locator("[data-imported]")).toContainText("Imported from your AI-readiness score");
  await page.locator("#db-step-btn-0").click();
  await expect(page.getByLabel("Town or city (optional)")).toHaveValue("Manchester");
  await page.locator("[data-undo-import]").click();
  await expect(page.getByLabel("Town or city (optional)")).toHaveValue("");

  await page.getByRole("button", { name: "Try an example" }).click();
  const next = page.locator('[data-next-step="kit"]');
  await expect(next).toContainText("Next in your kit: Photo shot list planner");
  await next.locator("[data-kit-next]").click();
  await expect(page).toHaveURL("/free-tools/airbnb-photo-shot-list?kit=more-bookings");
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.locator("[data-imported]")).toContainText("Imported from your description");
  await expect(page.locator("[data-grid-tile]").first()).toContainText("Canal view");
  noLeaks(seen);
});

test("house rule highlights import into Other things to note", async ({ page }) => {
  await open(page, "", () => {
    localStorage.setItem(
      "vaforbnb:handoff:house-rules",
      JSON.stringify({ format: "vaforbnb-handoff", version: 1, kind: "house-rules", source: "house-rules-generator", createdAt: "2026-11-25T10:00:00.000Z", data: { title: "House rules", sections: [], highlights: { checkin: "15:00", checkout: "10:00", pets: "no", maxPets: null, parties: true } } }),
    );
  });
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.locator("#db-step-btn-5").click();
  await page.locator("[data-import-house-rules]").click();
  await tab(page, "Other things to note").click();
  await expect(text(page, "notes")).toContainText("House rules: check-in from 3pm, check-out by 10am.");
  await expect(text(page, "notes")).toContainText("Assistance dogs are always welcome.");
});

test("390px: no horizontal scroll; the sticky button opens the full-screen sheet and Back to the form closes it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const sticky = page.locator("[data-sticky-see] button");
  await expect(sticky).toHaveText(/See my description \(\d+\/65\)/);
  await sticky.click();
  const sheet = page.locator("[data-sheet]");
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("[data-section-text=listing]")).toHaveValue(TEST1);
  const box = (await sheet.locator("[data-output]").boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await sheet.getByRole("tab", { name: /^The space/ }).click();
  await expect(sheet.locator("[data-section-text=space]")).toContainText("Bedroom 1");
  await sheet.locator("[data-sheet-close]").click();
  await expect(sheet).toHaveCount(0);
  await expect(page.locator("#db-step-btn-0")).toBeVisible();
});

test("page: SEO, structured data and static sections are in the HTML without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(PATH);
  await expect(page).toHaveTitle("Airbnb Description Generator (AI-Ready) | VA for BnB");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /within the character limits, that guests and AI search can match/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How do I write an AI-ready Airbnb description?");
  for (const h of ["What this means", "How it works", "Limits", "Questions about Airbnb descriptions", "Related tools", "Changelog"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
  await expect(page.locator("[data-how]")).toHaveCount(4);
  await expect(page.locator("[data-disclaimer]")).toContainText("this tool helps clarity, not ranking.");
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  for (const t of ['"FAQPage"', '"WebApplication"', '"BreadcrumbList"', '"BusinessApplication"', '"GB"']) expect(ld).toContain(t);
  await ctx.close();
});

test("hub: 3rd in Get more bookings and live; linked from the scorer, house rules and Listing optimisation", async ({ page }) => {
  await page.goto("/free-tools?job=get-more-bookings");
  await expect(page.getByRole("button", { name: /Get more bookings/ })).toHaveAttribute("aria-pressed", "true");
  const card = page.locator("#ai-ready-description-builder");
  await expect(card).toHaveAttribute("href", PATH);
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("How do I write my description?");
  await expect(card).toContainText("Text to copy");
  const names = await page.locator("#all [id] p.font-extrabold").allTextContents();
  expect(names.slice(0, 3)).toEqual(["AI-readiness listing scorer", "Airbnb title checker", "AI-ready description builder"]);

  await page.goto("/services/listing-optimisation");
  await expect(page.locator("[data-description-builder-link] a")).toHaveAttribute("href", PATH);

  // The scorer's guest-needs or vague-word fix card links here.
  await page.goto("/free-tools/airbnb-ai-readiness-score");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('[data-tool="airbnb-ai-readiness-score"][data-ready]')).toBeVisible();
  // A listing whose top fixes include guest-needs coverage (D).
  await page.getByLabel("Title", { exact: true }).fill("Lovely flat in Leeds");
  await page.locator("#air-description").fill("Spacious flat with WiFi and parking. 10 minutes to the city centre.");
  await page.getByRole("button", { name: "Score my listing" }).click();
  await page.locator('[data-fix="D"] [data-write-description]').click();
  await expect(page).toHaveURL(`${PATH}?from=airbnb-ai-readiness-score`);
  await expect(page.locator("[data-imported]")).toContainText("Imported from your AI-readiness score");
});
