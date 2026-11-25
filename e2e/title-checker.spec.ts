import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/airbnb-title-checker";
const SCORER = "/free-tools/airbnb-ai-readiness-score";
const KEYS = [
  "vaforbnb:tool:airbnb-title-checker:v1",
  "vaforbnb:tool:airbnb-title-checker:compare:v1",
  "vaforbnb:tool:airbnb-ai-readiness-score:v1",
  "vaforbnb:tool:airbnb-ai-readiness-score:history:v1",
  "vaforbnb:handoff:listing-title",
  "vaforbnb:handoff:listing-text",
  "vaforbnb:handoff:scorer-prefill",
];
/** Text that must never leave the device. */
const SECRETS = ["Lovely 2 Bed", "Quillstone", "Zebedee", "Manchester City Centre", "canal view"];

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

const title = (page: Page) => page.getByLabel("Your Airbnb title");
const panel = (page: Page) => page.locator("[data-results]");
const status = (page: Page, id: string) => panel(page).locator(`[data-check="${id}"]`);

test("the example title: checklist, highlights and counter update live as you type; nothing is sent", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(title(page)).toHaveValue("Lovely 2 Bed Flat in Manchester City Centre!!! ★");
  await expect(page.locator("[data-counter]")).toHaveText(/48 \/ 50/);
  await expect(page.locator("[data-counter]")).toHaveAttribute("data-counter", "warn");
  await expect(panel(page).locator("[data-verdict]")).toHaveAttribute("data-verdict", "fixes");
  await expect(panel(page).locator("[data-passed]")).toHaveText("5 of 12 checks passed");
  for (const id of ["punctuation", "symbols", "city", "bedrooms"]) await expect(status(page, id)).toHaveAttribute("data-status", "fix");
  for (const id of ["vague", "feature", "location"]) await expect(status(page, id)).toHaveAttribute("data-status", "tip");
  // Highlights: underlined marks with check numbers, not colour alone.
  const hl = panel(page).locator("[data-highlighted-title]");
  await expect(hl.locator('[data-mark="fix"]')).toHaveCount(4);
  await expect(hl).toContainText("Fix, check 4: No emoji or decorative symbols");

  // Live: fix it by typing.
  await title(page).fill("Garden flat · parking · 6 min to Piccadilly station");
  await expect(page.locator("[data-counter]")).toHaveAttribute("data-counter", "over");
  await expect(status(page, "length")).toHaveAttribute("data-status", "fix");
  await expect(page.locator("[data-card-title]")).toHaveText(/…$/);
  await title(page).fill("Garden flat · parking · 6 min to the tram");
  await expect(panel(page).locator("[data-verdict]")).toHaveAttribute("data-verdict", "strong");
  await expect(hl.locator('[data-mark="fix"]')).toHaveCount(0);
  await expect(page.locator("[data-example-banner]")).toHaveCount(0);
  await expect(page.locator("[data-what-this-means]")).toContainText("follows Airbnb’s guidance");
  // The polite update for screen readers.
  await expect(page.locator("[data-live]")).toContainText("Strong", { timeout: 5000 });
  noLeaks(seen);
});

test("build titles, use one, compare two, pick one", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByRole("tab", { name: "Title builder" }).click();
  await expect(page.getByText("Pick at least one standout feature")).toBeVisible();
  await page.getByRole("checkbox", { name: "canal view" }).check();
  await page.getByRole("radio", { name: "free parking" }).check();
  await page.getByRole("radio", { name: "Minutes to a place" }).check();
  await page.locator("#tc-hook-place").fill("the tram");
  await page.getByRole("radio", { name: "Flat", exact: true }).last().check();
  const cards = page.locator("[data-suggestion]");
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(3);
  expect(count).toBeLessThanOrEqual(6);
  for (const t of await cards.locator("> p").allTextContents()) expect([...t].length).toBeLessThanOrEqual(50);

  const first = (await cards.nth(0).locator("> p").textContent())!;
  const second = (await cards.nth(1).locator("> p").textContent())!;
  const third = (await cards.nth(2).locator("> p").textContent())!;
  await cards.nth(0).getByRole("button", { name: "Compare" }).click();
  await cards.nth(1).getByRole("button", { name: "Compare" }).click();
  await expect(cards.nth(0).getByRole("button", { name: /Added to compare/ })).toBeDisabled();
  await cards.nth(2).getByRole("button", { name: "Use this" }).click();
  await expect(title(page)).toHaveValue(third);
  await expect(title(page)).toBeFocused();

  await page.getByRole("tab", { name: /Compare titles \(2\)/ }).click();
  const compare = page.locator("[data-compare-card]");
  await expect(compare).toHaveCount(2);
  await expect(compare.nth(0)).toContainText(first);
  await expect(compare.nth(0).locator("[data-search-card]")).toBeVisible();
  await compare.nth(1).getByRole("button", { name: "Pick this one" }).click();
  await expect(title(page)).toHaveValue(second);
  noLeaks(seen);
});

test("arrive from the kit with the scorer's title, then continue to the description builder", async ({ page }) => {
  const seen = watch(page);
  // Step 1 of the kit: the AI-readiness scorer.
  await page.goto(SCORER);
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  await page.goto(`${SCORER}?kit=more-bookings`);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Quillstone flat in Leeds!!");
  await page.getByLabel(/^Listing description/).fill("A quiet flat.");
  await page.locator("#air-step-btn-1").click();
  await page.getByLabel("Town or city (optional)").fill("Leeds");
  await page.getByLabel("Nearest station or stop (optional)").fill("Leeds station");
  await page.getByRole("button", { name: "Score my listing" }).click();
  await page.getByRole("button", { name: "Send to the description builder →" }).click();
  await page.getByRole("link", { name: "Continue to the title checker →" }).click();

  // Step 2: this tool, prefilled.
  await expect(page).toHaveURL(`${PATH}?kit=more-bookings`);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.locator("[data-kit-badge]")).toHaveText("Get more bookings kit · step 2");
  await expect(page.locator("[data-imported]")).toContainText("Imported from your AI-readiness score");
  await expect(title(page)).toHaveValue("Quillstone flat in Leeds!!");
  await expect(page.locator("#tc-town")).toHaveValue("Leeds");
  await expect(page.locator("#tc-place")).toHaveValue("Leeds station");
  await expect(status(page, "city")).toHaveAttribute("data-status", "fix");

  await title(page).fill("Quillstone flat · parking · 6 min to Leeds station");
  await expect(panel(page).locator("[data-verdict]")).toHaveAttribute("data-verdict", "strong");
  const next = page.locator('[data-next-step="kit"]');
  await expect(next).toContainText("Next in your kit: AI-ready description builder");
  await next.getByRole("button", { name: /description builder/ }).click();
  await expect(page.locator("[data-next-saved]")).toContainText("Saved on this device");
  const d = await page.evaluate(() => JSON.parse(localStorage.getItem("vaforbnb:handoff:listing-text") ?? "null"));
  expect(d.source).toBe("airbnb-title-checker");
  expect(d.data.title).toBe("Quillstone flat · parking · 6 min to Leeds station");
  expect(d.data.description).toBe("A quiet flat.");
  expect(d.data.details).toMatchObject({ town: "Leeds", station: "Leeds station" });
  noLeaks(seen);
});

test("refresh keeps the inputs and compared titles; Clear my data empties them", async ({ page }) => {
  await open(page);
  await title(page).fill("Zebedee cottage with log burner");
  await page.getByRole("button", { name: /Add details for smarter checks/ }).click();
  await page.locator("#tc-town").fill("York");
  await page.getByRole("tab", { name: "Compare titles" }).click();
  await page.getByRole("button", { name: "Add my current title" }).click();
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(title(page)).toHaveValue("Zebedee cottage with log burner");
  await expect(page.locator("#tc-town")).toHaveValue("York");
  await page.getByRole("tab", { name: /Compare titles/ }).click();
  await expect(page.locator("[data-compare-card]")).toHaveCount(1);

  await page.getByRole("button", { name: "Clear my data" }).click();
  await page.getByRole("button", { name: "Yes, clear" }).click();
  await expect(title(page)).toHaveValue("");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(title(page)).toHaveValue("");
  await page.getByRole("tab", { name: "Compare titles" }).click();
  await expect(page.locator("[data-compare-card]")).toHaveCount(0);
  const saved = await page.evaluate(() => localStorage.getItem("vaforbnb:tool:airbnb-title-checker:compare:v1"));
  expect(saved === null || saved === "[]").toBe(true);
});

test("390px: no horizontal scroll; the counter and checklist are readable; 44px targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  for (const tab of ["Checklist", "Title builder", "Compare titles"]) {
    await page.getByRole("tab", { name: tab }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
  const counter = page.locator("[data-counter]");
  await expect(counter).toBeVisible();
  expect(await counter.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(13);
  const row = panel(page).locator('[data-check="length"]');
  const box = (await row.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(await row.locator("p").first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(13);
  // Checklist sits below the title on mobile.
  const t = (await title(page).boundingBox())!;
  expect((await panel(page).boundingBox())!.y).toBeGreaterThan(t.y);
  for (const name of ["Try an example", "Clear", "Copy title", "Copy checklist"]) {
    const b = (await page.getByRole("button", { name, exact: true }).first().boundingBox())!;
    expect(b.height, name).toBeGreaterThanOrEqual(44);
  }
});

test("keyboard only: type, open details, switch tabs with arrows", async ({ page }) => {
  await open(page);
  await title(page).focus();
  await page.keyboard.type("Sea view flat!");
  await expect(status(page, "punctuation")).toHaveAttribute("data-status", "pass");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Add details for smarter checks/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#tc-town")).toBeVisible();
  await page.getByRole("tab", { name: "Checklist" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Title builder" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Title builder" })).toBeFocused();
});

test("Check your whole listing opens the scorer with the title; Improve my title comes back", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await title(page).fill("Zebedee loft · roof terrace · near the canal");
  await page.locator('[data-next-step="scorer"]').getByRole("link", { name: /Check your whole listing/ }).click();
  await expect(page).toHaveURL(`${SCORER}?from=airbnb-title-checker`);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Zebedee loft · roof terrace · near the canal");
  await expect(page.getByText("Your title came across from the Airbnb title checker")).toBeVisible();

  // From the scorer's breakdown, "Improve my title" brings the title back.
  await page.getByLabel(/^Listing description/).fill("A loft.");
  await page.getByRole("button", { name: "Score my listing" }).click();
  await page.getByRole("tab", { name: "Score breakdown" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Zebedee loft by the canal");
  await page.locator('[data-breakdown="A"] [data-improve-title]').click();
  await expect(page).toHaveURL(`${PATH}?from=airbnb-ai-readiness-score`);
  await expect(title(page)).toHaveValue("Zebedee loft by the canal");
  await expect(page.locator("[data-imported]")).toBeVisible();
  noLeaks(seen);
});

test("page: SEO, structured data and the static sections are in the HTML without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(PATH);
  await expect(page).toHaveTitle("Airbnb Title Checker (50-Character Rule) | VA for BnB");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /under 50 characters, no caps or emoji/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Is my Airbnb title good enough?");
  await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toContainText("Get more bookings");
  for (const h of ["What this means", "How it works", "Limits", "Questions about Airbnb titles", "Related tools", "Changelog"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
  await expect(page.locator("[data-how-row]")).toHaveCount(12);
  await expect(page.locator("[data-disclaimer]")).toContainText("This tool checks clarity and Airbnb’s published guidance, not ranking.");
  await expect(page.getByText("Airbnb recommends fewer than 50 characters, because longer titles get cut off.")).toBeAttached();
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  for (const t of ['"FAQPage"', '"WebApplication"', '"BreadcrumbList"', '"BusinessApplication"', '"GB"']) expect(ld).toContain(t);
  await ctx.close();
});

test("hub: second in Get more bookings, live, with its card text; links from the service page", async ({ page }) => {
  await page.goto("/free-tools?job=get-more-bookings");
  const card = page.locator("#airbnb-title-checker");
  await expect(card).toHaveAttribute("href", PATH);
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("Is my title good enough?");
  await expect(card).toContainText("Result + title ideas");
  await expect(card).toContainText("All UK");
  const names = await page.locator("#all [id] p.font-extrabold").allTextContents();
  expect(names.slice(0, 2)).toEqual(["AI-readiness listing scorer", "Airbnb title checker"]);

  await page.goto("/services/listing-optimisation#title");
  await expect(page.locator("[data-title-checker-link] a")).toHaveAttribute("href", PATH);
});
