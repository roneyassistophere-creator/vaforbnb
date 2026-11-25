import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/long-stay-discount-calculator";
const KEYS = ["vaforbnb:tool:long-stay-discount-calculator:v1", "vaforbnb:tool:long-stay-discount-calculator:scenarios:v1", "vaforbnb:handoff:london-flag", "vaforbnb:handoff:profit-inputs"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

/** Unusual numbers so a leak is easy to spot. */
const SECRETS = ["4321", "2468", "1357"];
function watch(page: Page) {
  const seen: { url: string; body: string }[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/")) return;
    seen.push({ url: decodeURIComponent(r.url()), body: r.postData() ?? "" });
  });
  return seen;
}

async function open(page: Page, query = "", seed?: () => void) {
  await page.goto(PATH);
  // Let the first load finish starting up, so it can't pick up the test's seeded data.
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  if (seed) await page.evaluate(seed);
  await page.goto(PATH + query);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}
const res = (page: Page) => page.locator("[data-result-desktop]");

test("the example, then the discount slider: result, chart and table update live", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(res(page).locator("[data-headline]")).toHaveText(/Long stay earns £703 more/);
  await expect(res(page).locator("[data-break-even-discount]")).toHaveText("Break-even discount: 49.7%. You could discount up to this and still match short stays.");
  await expect(res(page).locator("[data-break-even-occupancy]")).toHaveText("Short stays would need 97.0% occupancy to beat this discount.");
  await expect(res(page).locator("[data-turnovers]")).toHaveText("Turnovers saved: 4.6 (about 5 fewer cleans)");
  await expect(page.locator("[data-guest-rate]")).toHaveText("Guest pays £80.00 a night · £2,240.00 for the stay");
  await expect(page.locator("[data-highlight-badge]")).toBeVisible();
  await expect(page.locator("[data-row='20'][data-own]")).toBeVisible();
  await expect(page.locator("[data-chart] [role=img]")).toHaveAttribute("aria-label", "Short stays £1,140, long stay £1,843.");
  await expect(page.locator("[data-what-this-means]")).toHaveText(/^On these numbers, one long stay earns £703 more/);

  // Move the slider with the keyboard: 20% → 25%.
  const slider = page.locator("[data-slider=ls-discount]");
  await slider.focus();
  for (let n = 0; n < 5; n++) await slider.press("ArrowRight");
  await expect(page.getByLabel("Long-stay discount (%)", { exact: true })).toHaveValue("25");
  await expect(res(page).locator("[data-headline]")).toHaveText(/Long stay earns £585 more/);
  await expect(page.locator("[data-row='25'][data-own]")).toBeVisible();
  await expect(page.locator("[data-row='20'][data-own]")).toHaveCount(0);
  await expect(page.locator("[data-chart] [role=img]")).toHaveAttribute("aria-label", "Short stays £1,140, long stay £1,725.");
  // The number field drives the slider too.
  await page.getByLabel("Long-stay discount (%)", { exact: true }).fill("9");
  await expect(slider).toHaveValue("9");
  await expect(page.locator("[data-highlight-badge]")).toHaveCount(0);
  // Validation: inline message, no NaN, no result.
  await page.getByLabel("Average short stay (nights)").fill("0");
  await expect(page.getByText("Enter an average stay of at least 1 night.")).toBeVisible();
  await expect(res(page)).toContainText("Fix the highlighted fields to see your result.");
  await expect(page.locator("body")).not.toContainText("NaN");
});

test("period chips update the threshold label", async ({ page }) => {
  await open(page);
  await expect(page.locator("[data-threshold]")).toHaveText("Counts as a monthly stay on Airbnb");
  await page.getByRole("radio", { name: "7 nights" }).check();
  await expect(page.locator("[data-threshold]")).toHaveText("Counts as a weekly stay on Airbnb");
  await page.getByRole("group", { name: "Period" }).getByRole("radio", { name: "Custom" }).check();
  await page.getByRole("textbox", { name: "Nights (1–180)" }).fill("6");
  await expect(page.locator("[data-threshold]")).toHaveText("Too short for a weekly discount");
  await page.getByRole("textbox", { name: "Nights (1–180)" }).fill("90");
  await expect(res(page).locator("[data-note=london90]")).toBeVisible();
  await expect(res(page).locator("[data-note=tenancy] a")).toHaveAttribute("href", "/uk-short-let-rules#renters-rights-act");
});

test("save two scenarios, compare them, delete one; Copy result", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await res(page).getByLabel("Name this scenario").fill("Monthly 20%");
  await res(page).locator("[data-save-scenario]").click();
  await page.getByLabel("Long-stay discount (%)", { exact: true }).fill("30");
  await res(page).getByLabel("Name this scenario").fill("Monthly 30%");
  await res(page).locator("[data-save-scenario]").click();
  const compare = page.locator("[data-compare] > li");
  await expect(compare).toHaveCount(2);
  await expect(page.locator("[data-scenario='Monthly 20%']")).toContainText("£1,842.80");
  await expect(page.locator("[data-scenario='Monthly 30%']")).toContainText("30.0%");
  await page.getByRole("button", { name: "Delete: Monthly 20%" }).click();
  await expect(compare).toHaveCount(1);
  await expect(page.locator("[data-scenario='Monthly 30%']")).toBeVisible();

  await res(page).getByRole("button", { name: "Copy result" }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain("Discount: 30.0%");
  expect(clip).toContain("Figures last checked 17 November 2026.");
  expect(clip).toContain("Not financial, tax or legal advice.");
});

test("refresh keeps the inputs and scenarios; Clear my data empties them", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByLabel("Nightly rate (£)").fill("4321");
  await page.getByLabel("Turnover cost (£)").fill("1357");
  await res(page).getByLabel("Name this scenario").fill("Big one");
  await res(page).locator("[data-save-scenario]").click();
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Nightly rate (£)")).toHaveValue("4321");
  await expect(page.locator("[data-scenario='Big one']")).toBeVisible();
  await page.getByRole("button", { name: "Clear my data" }).click();
  await page.getByRole("button", { name: "Yes, clear" }).click();
  await expect(page.getByLabel("Nightly rate (£)")).toHaveValue("100");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Nightly rate (£)")).toHaveValue("100");
  await expect(page.locator("[data-scenario]")).toHaveCount(0);
  for (const s of seen) for (const secret of SECRETS) expect(`${s.url} ${s.body}`, `request leaked ${secret}`).not.toContain(secret);
});

test("390px: no horizontal scroll, sticky result bar, the table scrolls in its own box", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const bar = page.locator("[data-sticky-result]");
  await expect(bar).toContainText("Long stay earns £703 more");
  const box = page.locator("[data-table-scroll]");
  const [sw, cw] = await box.evaluate((e) => [e.scrollWidth, e.clientWidth]);
  expect(sw).toBeGreaterThan(cw);
  await bar.getByRole("button").click();
  await expect(page.locator("[data-sheet] [data-result]")).toContainText("Break-even discount: 49.7%");
  await page.locator("[data-sheet-close]").click();
  await expect(page.locator("[data-sheet]")).toHaveCount(0);
  const b = (await bar.getByRole("button").boundingBox())!;
  expect(b.height).toBeGreaterThanOrEqual(44);
});

test("in the kit: badge, kit-complete card; the London flag from the 90-night counter imports with Undo", async ({ page }) => {
  await open(page, "?kit=more-bookings", () => {
    localStorage.setItem("vaforbnb:handoff:london-flag", JSON.stringify({ format: "vaforbnb-handoff", version: 1, kind: "london-flag", source: "london-90-night-counter", createdAt: "2026-11-25T10:00:00.000Z", data: { london: true } }));
  });
  await expect(page.locator("[data-kit-badge]")).toHaveText("Get more bookings kit · step 5");
  await expect(page.locator("[data-imported]")).toContainText("Imported from the London 90-night counter");
  await expect(page.getByRole("switch", { name: "My property is in London" })).toBeChecked();
  await expect(res(page).locator("[data-note=londonCounts]")).toBeVisible();
  await expect(page.locator('[data-next-step="kit-complete"]')).toContainText("Kit complete");
  await expect(page.locator('[data-next-step="kit-complete"] a').first()).toHaveAttribute("href", "/free-tools");
  await expect(page.locator("[data-what-this-means]")).toContainText("That’s your Get more bookings kit done.");
  await page.locator("[data-undo-import]").click();
  await expect(page.getByRole("switch", { name: "My property is in London" })).not.toBeChecked();
});

test("page: SEO, structured data and static sections are in the HTML without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(PATH);
  await expect(page).toHaveTitle("Weekly & Monthly Discount Calculator for Airbnb | VA for BnB");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Find your break-even discount/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Should I discount a long stay?");
  await expect(page.getByText(/Figures last checked 17 November 2026/).first()).toBeAttached();
  for (const h of ["What this means", "How it works", "Limits", "Questions about long-stay discounts", "Related tools", "Changelog"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
  await expect(page.getByText("weekly discounts apply to stays of 7 nights or more and monthly discounts to stays of 28 nights or more")).toBeAttached();
  await expect(page.locator("[data-disclaimer]")).toContainText("Not financial, tax or legal advice.");
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  for (const t of ['"FAQPage"', '"WebApplication"', '"BreadcrumbList"', '"BusinessApplication"', '"GB"']) expect(ld).toContain(t);
  await ctx.close();
});

test("hub: 5th in Get more bookings, Coming soon until set live; the Rules Hub tenancy anchor opens", async ({ page }) => {
  await page.goto("/free-tools?job=get-more-bookings");
  await expect(page.getByRole("button", { name: /Get more bookings/ })).toHaveAttribute("aria-pressed", "true");
  const card = page.locator("#long-stay-discount-calculator");
  await expect(card).toContainText("Coming soon");
  await expect(card).toContainText("Should I discount a 28-night stay?");
  const names = await page.locator("#all [id] p.font-extrabold").allTextContents();
  expect(names.slice(0, 5)).toEqual(["AI-readiness listing scorer", "Airbnb title checker", "AI-ready description builder", "Photo shot list planner", "Long-stay discount calculator"]);
  await page.goto("/uk-short-let-rules#renters-rights-act");
  await expect(page.getByText("Is rent-to-rent serviced accommodation still allowed after the Renters’ Rights Act?")).toBeVisible();
});
