import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/short-let-profit-calculator";
const KEYS = ["vaforbnb:tool:short-let-profit-calculator:v1", "vaforbnb:tool:short-let-profit-calculator:scenarios:v1", "vaforbnb:handoff:profit-inputs"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

function watch(page: Page) {
  const seen: { url: string; body: string }[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/")) return;
    seen.push({ url: decodeURIComponent(r.url()), body: r.postData() ?? "" });
  });
  return seen;
}

async function open(page: Page, query = "") {
  await page.goto(PATH);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  await page.goto(PATH + query);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}
const tool = (page: Page) => page.locator("[data-tool]");
const headline = (page: Page) => page.locator("[data-headline]");

/** The brief's base example: rate 100, 60%, stay 3, one 15.5% fee, turnover 50, bills 1,200 (no mortgage). */
async function base(page: Page) {
  await page.getByLabel("Average nightly rate").fill("100");
  await page.getByLabel("Average length of stay").fill("3");
  await page.getByRole("textbox", { name: "Occupancy" }).fill("60");
  await page.getByLabel("Simple: one average platform fee").check();
  await page.getByLabel("Average platform fee", { exact: true }).fill("15.5");
  await page.getByLabel("Turnover cost per stay").fill("50");
  await page.getByLabel("Mortgage payment a month").fill("0");
  await page.getByLabel("Of which interest").fill("0");
  for (const l of ["Energy standing charges and base use", "Broadband and TV", "Council tax or business rates", "Software"]) await page.getByLabel(l, { exact: true }).fill("0");
  for (const l of ["Insurance a year", "Safety certificates a year", "Accountant fees a year"]) await page.getByLabel(l, { exact: true }).fill("0");
  await page.getByLabel("Other monthly", { exact: true }).fill("1200");
}

test("Quick mode: the base example gives the brief's figures; Detailed keeps values and Copy January works", async ({ page }) => {
  await open(page);
  // Starting values are labelled as examples.
  await expect(page.locator("[data-example-banner]")).toContainText("Example figures");
  await base(page);
  await expect(page.locator("[data-example-banner]")).toHaveCount(0);
  await expect(headline(page).locator("[data-profit]")).toContainText("£37 / month");
  await expect(headline(page).locator("[data-profit]")).toContainText("£447 / year");
  await expect(headline(page).locator("[data-tile='break-even']")).toContainText("58.2%");
  await expect(headline(page).locator("[data-tile='break-even']")).toContainText("You’re at 60.0% · 1.8 points above");
  await expect(headline(page).locator("[data-tile='min-rate']")).toContainText("£97.58");
  await expect(headline(page).locator("[data-status]")).toHaveText("Profitable, but a thin margin");
  await expect(page.locator("[data-target]")).toContainText("£130.02 a night");
  await expect(page.locator("[data-target]")).toContainText("82.4% occupancy");

  await tool(page).locator("[data-mode='detailed']").click();
  await expect(page.locator("[data-month-table]")).toBeVisible();
  await expect(page.getByLabel("March nightly rate")).toHaveValue("100");
  await expect(page.getByLabel("March occupancy %")).toHaveValue("60");
  await page.getByLabel("January nightly rate").fill("150");
  await page.locator("[data-copy-january]").click();
  await expect(page.getByLabel("December nightly rate")).toHaveValue("150");
  await expect(page.locator("[data-tab='months']")).toBeVisible();
  await page.locator("[data-tab='months']").click();
  await expect(page.locator("[data-month-summary]")).toBeVisible();
  await tool(page).locator("[data-mode='quick']").click();
  await expect(page.getByLabel("Average nightly rate")).toHaveValue("100");
});

test("dragging the occupancy slider updates the headline, money flow and sensitivity live", async ({ page }) => {
  await open(page);
  const before = await headline(page).locator("[data-profit]").innerText();
  await page.locator("[data-tab='flow']").click();
  const flowBefore = await page.locator("[data-flow='booking']").innerText();
  const slider = page.locator("[data-slider='p-occ']");
  await slider.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(headline(page).locator("[data-profit]")).not.toHaveText(before);
  await expect(page.locator("[data-flow='booking']")).not.toHaveText(flowBefore);
  await page.locator("[data-tab='needle']").click();
  await expect(page.locator("[data-lever-chart] [data-lever]").first()).toBeVisible();
  await expect(page.locator("[data-lever-list]")).toContainText("Raising your price 10% adds");
});

test("tax estimate: both columns with labels; companies get a message", async ({ page }) => {
  await open(page);
  await page.locator("[data-tab='tax']").click();
  await page.getByRole("tabpanel").getByLabel("Show a tax estimate").check();
  await expect(page.locator("[data-tax-col='current']")).toHaveText("Current rates");
  await expect(page.locator("[data-tax-col='from2027']")).toHaveText("From 6 April 2027");
  await expect(page.getByRole("tabpanel").getByText("Estimate", { exact: true })).toBeVisible();
  await page.getByRole("tabpanel").getByLabel("Through a company").check();
  await expect(page.locator("[data-tax-unavailable]")).toHaveText("Tax estimate not available for companies in this tool.");
});

test("PDF without and with email, and the CSV; no figures sent, only the optional lead", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByLabel("Average nightly rate").fill("123.45");
  // Without email.
  await page.locator("[data-pdf]").click();
  let dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download the PDF" }).click();
  expect((await dl).suggestedFilename()).toMatch(/^short-let-profit-report-\d{4}-\d{2}-\d{2}\.pdf$/);
  await expect(page.getByText("Your PDF has downloaded.")).toBeVisible();
  await page.keyboard.press("Escape");
  // With email (consent ticked).
  await page.route("**/api/leads", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await page.locator("[data-pdf]").click();
  await page.getByRole("checkbox", { name: /Email me occasional/ }).check();
  await page.locator("dialog input[name=email]").fill("host@example.com");
  dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download the PDF" }).click();
  await dl;
  await page.keyboard.press("Escape");
  // CSV.
  dl = page.waitForEvent("download");
  await page.locator("[data-csv]").click();
  const csv = readFileSync(await (await dl).path(), "utf8");
  expect(csv).toContain("Guest booking value");
  expect(csv).toContain("Average nightly rate");

  const lead = seen.filter((r) => r.url.includes("/api/leads"));
  expect(lead).toHaveLength(1);
  expect(Object.keys(JSON.parse(lead[0].body)).sort()).toEqual(["consentText", "email", "firstName", "timestamp", "toolSlug", "website"]);
  for (const r of seen) expect(r.url + r.body).not.toContain("123.45");
});

test("refresh keeps the inputs; Clear my data empties them", async ({ page }) => {
  await open(page);
  await page.getByLabel("Average nightly rate").fill("111");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Average nightly rate")).toHaveValue("111");
  await page.locator("[data-clear]").click();
  await page.locator("[data-clear-confirm]").click();
  await expect(page.getByLabel("Average nightly rate")).toHaveValue("100");
  expect(await page.evaluate(() => localStorage.getItem("vaforbnb:tool:short-let-profit-calculator:scenarios:v1"))).toBe("[]");
});

test("scenarios: save, compare side by side with differences highlighted", async ({ page }) => {
  await open(page);
  await page.locator("[data-tab='scenarios']").click();
  await page.getByLabel("Scenario name").fill("Now");
  await page.locator("[data-save-scenario]").click();
  await page.getByLabel("Average nightly rate").fill("130");
  await page.locator("[data-tab='scenarios']").click();
  await page.getByLabel("Scenario name").fill("Higher price");
  await page.locator("[data-save-scenario]").click();
  await expect(page.locator("[data-compare]")).toBeVisible();
  await expect(page.locator("[data-compare] tr[data-differs]").filter({ hasText: "Nightly rate" })).toBeVisible();
});

test("starter kits: New host kit badge and next step; Growing host kit badge", async ({ page }) => {
  await open(page, "?kit=new-host");
  await expect(page.locator("[data-kit-badge]")).toHaveText("New host kit · step 2");
  await expect(page.locator("[data-next-step='kit']")).toContainText("Next in your kit: House rules generator");
  await page.goto(`${PATH}?kit=growing`);
  await expect(page.locator("[data-kit-badge]")).toHaveText("Growing host kit · step 1");
  await expect(page.locator("[data-next-step='service']")).toContainText("Get this done for you every month");
});

test("the page HTML has the H1, How it works, FAQ and changelog without JavaScript", async ({ request }) => {
  const html = await (await request.get(PATH)).text();
  expect(html).toContain("Am I actually making money from my");
  expect(html).toContain("How it works");
  expect(html).toContain("What’s the difference between profit and cash flow?");
  expect(html).toContain("ASSUMPTION");
  expect(html).toMatch(/Model v(<!-- -->)?2/);
  expect(html).toContain('"@type":"WebApplication"');
});

test.describe("phone (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("no sideways scroll, sticky profit bar, charts fit with table alternatives", async ({ page }) => {
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator("[data-mobile-bar]")).toBeVisible();
    await expect(page.locator("[data-mobile-bar]")).toContainText("Profit £301/month");
    await expect(page.locator("[data-mobile-bar]")).toContainText("Cash £101/month");
    await page.locator("[data-mobile-bar] button").click();
    await page.locator("[data-tab='flow']").click();
    const box = await page.locator("[data-waterfall]").boundingBox();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
    await expect(page.locator("[data-flow-table]")).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const small = await page
      .locator("[data-tool] button:visible")
      .evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent?.trim()));
    expect(small).toEqual([]);
  });
});
