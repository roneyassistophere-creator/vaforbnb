import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/occupancy-adr-revpar-calculator";
const KEYS = ["vaforbnb:tool:occupancy-adr-revpar-calculator:v1", "vaforbnb:handoff:profit-inputs", "vaforbnb:handoff:booking-performance", "vaforbnb:tool:short-let-profit-calculator:v1"];

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
const tile = (page: Page, id: string) => page.locator(`[data-tiles] [data-tile='${id}']`);

test("Quick example: tiles; last year gives deltas and the breakdown; before/after verdict", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(tile(page, "occupancy").locator("[data-value]")).toHaveText("60.0%");
  await expect(tile(page, "adr").locator("[data-value]")).toHaveText("£110.00");
  await expect(tile(page, "revpar").locator("[data-value]")).toHaveText("£66.00");
  await expect(tile(page, "occupancy").locator("[data-delta]")).toHaveText("▲ +10.0 pts up vs last year");
  await expect(tile(page, "adr").locator("[data-delta]")).toHaveText("▼ −£10.00 down vs last year");
  await expect(page.locator("[data-summary]")).toHaveText("You sold 18 of 30 available nights at an average of £110, earning £66 for every night you could have sold.");
  await page.locator("[data-tab='compare']").click();
  await expect(page.locator("[data-breakdown-text]")).toHaveText("Occupancy effect +£12.00 · Price effect −£6.00 · Total +£6.00");
  await page.locator("#b\\.nights").fill("30");
  await page.locator("#b\\.booked").fill("15");
  await page.locator("#b\\.revenue").fill("1800");
  await page.locator("#a\\.nights").fill("30");
  await page.locator("#a\\.booked").fill("18");
  await page.locator("#a\\.revenue").fill("1980");
  await expect(page.locator("[data-ba-verdict]")).toHaveText("Worked: RevPAR up £6.00 (10.0%)");
  await page.locator("#a\\.revenue").fill("1820");
  await expect(page.locator("[data-ba-verdict]")).toHaveText("No real change");
  // Targets.
  await page.getByText("Targets (optional)").click();
  await page.getByLabel("RevPAR target").fill("73.5");
  await expect(page.locator("[data-target-need]")).toHaveText("You need either 66.8% occupancy at your ADR, or £122.50 at your occupancy.");
});

test("validation: inline errors and no result", async ({ page }) => {
  await open(page);
  await page.getByLabel("Nights booked").fill("40");
  await expect(page.getByText("Booked nights can’t be more than available nights.")).toBeVisible();
  await expect(page.locator("[data-no-result]")).toBeVisible();
  await expect(page.locator("[data-results]")).toHaveCount(0);
});

test("Booking list: import a CSV, open the Calendar, gap nights show in coral", async ({ page }) => {
  await open(page);
  await page.locator("[data-mode='list']").click();
  await page.locator("#l-start").fill("01/03/2027");
  await page.locator("#l-end").fill("01/04/2027");
  const csv = "check-in,check-out,revenue,channel,booked-on,cleaning\n28/02/2027,03/03/2027,300,Airbnb,,\n05/03/2027,08/03/2027,360,Airbnb,,\n10/03/2027,12/03/2027,240,Direct,,\n30/03/2027,02/04/2027,330,Booking.com,,\n12/03/2027,10/03/2027,100,,,";
  await page.locator("#l-import").setInputFiles({ name: "bookings.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.locator("[data-import-counts]")).toHaveText("4 ready to import, 1 with problems (skipped).");
  await expect(page.locator("[data-import-row='6']")).toContainText("Check-out must be after check-in.");
  await page.locator("[data-import-confirm]").click();
  await expect(tile(page, "occupancy").locator("[data-value]")).toHaveText("29.0%");
  await expect(tile(page, "adr").locator("[data-value]")).toHaveText("£113.33");
  await expect(tile(page, "revpar").locator("[data-value]")).toHaveText("£32.90");
  await page.locator("[data-tab='calendar']").click();
  await expect(page.locator("[data-gap-summary]")).toContainText("2 gaps, 4 nights");
  const gap = page.getByRole("button", { name: /^3 March: Gap night/ });
  await expect(gap).toHaveClass(/bg-coral/);
  await page.locator("[data-tab='charts']").click();
  await expect(page.locator("[data-week='weekend']")).toContainText("2 / 8");
  await expect(page.locator("[data-week='weekday']")).toContainText("£111.43");
  await expect(page.locator("[data-insight='gaps']")).toContainText("2 short gaps left 4 nights unsold.");
});

test("Monthly tracker: paste 12 rows, then charts and year-to-date totals update", async ({ page }) => {
  await open(page);
  await page.locator("[data-mode='monthly']").click();
  await page.getByText("Paste from a spreadsheet").click();
  const rows = Array.from({ length: 6 }, () => "0\t15\t1500").join("\n");
  await page.getByLabel(/Paste up to 12 rows/).fill(rows);
  await expect(page.locator("[data-paste-preview]")).toContainText("6 months ready.");
  await page.locator("[data-paste-confirm]").click();
  await expect(page.getByText(/year to date \(6 months\)/)).toBeVisible();
  await expect(tile(page, "adr").locator("[data-value]")).toHaveText("£100.00");
  await page.locator("[data-tab='charts']").click();
  await expect(page.locator("[data-monthly-chart]")).toBeVisible();
  await expect(page.locator("[data-monthly-table] tbody tr").first()).toContainText("£100.00");
  await expect(page.locator("[data-monthly-table] tbody tr").nth(7)).toContainText("–");
});

test("Portfolio: two properties, the total row matches test 6", async ({ page }) => {
  await open(page);
  await page.getByLabel("Nights in the period").fill("30");
  await page.getByLabel("Nights booked").fill("18");
  await page.getByLabel("Accommodation revenue").fill("1980");
  await page.getByRole("button", { name: "Add another property" }).click();
  await page.getByLabel("New property name").fill("Flat 2");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByLabel("Nights in the period").fill("31");
  await page.getByLabel("Nights booked").fill("25");
  await page.getByLabel("Accommodation revenue").fill("2000");
  await page.locator("[data-tab='portfolio']").click();
  const total = page.locator("[data-portfolio-total]");
  await expect(total).toContainText("70.5%");
  await expect(total).toContainText("£92.56");
  await expect(total).toContainText("£65.25");
});

test("refresh keeps the data; Clear my data empties it", async ({ page }) => {
  await open(page);
  await page.getByLabel("Nights booked").fill("12");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Nights booked")).toHaveValue("12");
  await page.locator("[data-clear]").click();
  await page.locator("[data-clear-confirm]").click();
  await expect(page.getByLabel("Nights booked")).toHaveValue("0");
});

test("kit badge and next step; Open in Profit calculator sends ADR and occupancy", async ({ page }) => {
  await open(page, "?kit=growing");
  await expect(page.locator("[data-kit-badge]")).toHaveText("Growing host kit · step 3");
  await expect(page.locator("[data-next-step='kit']")).toContainText("Next in your kit: Direct booking savings");
  await expect(page.locator("[data-kit-next]")).toHaveAttribute("href", "/free-tools/direct-booking-savings-calculator?kit=growing");
  await page.locator("[data-example]").click();
  await page.locator("[data-to-profit]").click();
  const profit = page.locator("[data-tool='short-let-profit-calculator'][data-ready]");
  await expect(profit).toBeVisible();
  await expect(profit.locator("[data-imported]")).toContainText("Imported from Booking performance: ADR £110.00 as your nightly rate, and 60% occupancy.");
  await expect(profit.getByLabel("Average nightly rate")).toHaveValue("110");
});

test("PDF without email, CSV; no figures or bookings in any request", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByLabel("Nights in the period").fill("31");
  await page.getByLabel("Nights booked").fill("19");
  await page.getByLabel("Accommodation revenue").fill("2345.67");
  let dl = page.waitForEvent("download");
  await page.locator("[data-csv]").click();
  expect((await dl).suggestedFilename()).toMatch(/\.csv$/);
  await page.locator("[data-pdf]").click();
  dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download the PDF" }).click();
  expect((await dl).suggestedFilename()).toMatch(/^booking-performance-\d{4}-\d{2}-\d{2}\.pdf$/);
  for (const r of seen) expect(r.url + r.body).not.toContain("2345.67");
  expect(seen.filter((r) => r.url.includes("/api/"))).toHaveLength(0);
});

test("the page HTML has the H1, explainer, How it works and FAQ", async ({ request }) => {
  const html = await (await request.get(PATH)).text();
  expect(html).toContain("occupancy, ADR and RevPAR?");
  expect(html).toContain("Occupancy = how full");
  expect(html).toContain("How booking lists are split");
  expect(html).toContain("Is high occupancy always good?");
  expect(html).toContain('"@type":"WebApplication"');
});

test.describe("phone (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("no sideways scroll, sticky KPI bar, tables scroll inside their boxes, 44px targets", async ({ page }) => {
    await open(page);
    await page.locator("[data-example]").click();
    await expect(page.locator("[data-mobile-bar]")).toHaveText("Occ 60.0% · ADR £110.00 · RevPAR £66.00");
    await page.mouse.wheel(0, 1500);
    const bar = await page.locator("[data-mobile-bar]").boundingBox();
    expect(Math.round(bar!.y)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.locator("[data-mode='monthly']").click();
    const box = page.locator("[data-month-scroll]");
    expect(await box.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const small = await page.locator("[data-tool] button:visible").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent?.trim()));
    expect(small).toEqual([]);
  });
});

test("live: 3rd in Know my numbers; linked from Pricing optimisation, Finance check, the profit calculator, London counter and the sitemap", async ({ page, request }) => {
  await page.goto("/free-tools?job=know-my-numbers");
  const hub = page.locator("#booking-performance");
  await expect(hub).toHaveAttribute("href", PATH);
  await expect(hub).not.toContainText("Coming soon");
  await expect.poll(async () => (await page.locator("#all [id] p.font-extrabold").allTextContents()).slice(0, 3)).toEqual(["Short-let profit calculator", "Direct booking savings", "Booking performance"]);
  await page.goto("/services/pricing-optimisation");
  await expect(page.locator("[data-perf-link]")).toHaveText("Check your RevPAR");
  await page.goto("/services/finance-check");
  await expect(page.locator("[data-perf-link]")).toHaveAttribute("href", PATH);
  await page.goto("/free-tools/short-let-profit-calculator");
  await expect(page.locator("[data-tool='short-let-profit-calculator'][data-ready] [data-track-link]")).toHaveAttribute("href", PATH);
  await expect(page.locator(`[data-related='booking-performance']`)).toHaveAttribute("href", PATH);
  await page.goto("/free-tools/london-90-night-counter");
  await expect(page.locator(`[data-related='booking-performance']`)).toHaveAttribute("href", PATH);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`${PATH}</loc>`);
  expect(await (await request.get(PATH)).text()).not.toMatch(/<meta name="robots" content="noindex/);
});
