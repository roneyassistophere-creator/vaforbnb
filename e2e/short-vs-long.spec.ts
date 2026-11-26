import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/short-let-vs-long-let-calculator";
const KEYS = ["vaforbnb:tool:short-let-vs-long-let-calculator:v1", "vaforbnb:tool:short-let-vs-long-let-calculator:scenarios:v1", "vaforbnb:handoff:profit-inputs"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

function watch(page: Page) {
  const seen: { url: string; body: string }[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/")) return;
    seen.push({ url: decodeURIComponent(r.url()), body: r.postData() ?? "" });
  });
  return seen;
}

async function open(page: Page, seed?: () => void) {
  await page.goto(PATH);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  if (seed) await page.evaluate(seed);
  await page.goto(PATH);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}
const side = (page: Page, id: string) => page.locator(`[data-head] [data-side='${id}'] [data-net]`);

test("example, then import from the profit calculator: the panel updates live", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(side(page, "short")).toHaveText("£1,500/month");
  await expect(side(page, "long")).toHaveText("£938/month");
  await expect(page.locator("[data-winner]")).toHaveText("Short-letting earns £562 more a month (£6,738 a year)");
  await expect(page.locator("[data-break-even-rent]")).toHaveText("A long-let rent of £1,848.89 would match your short-let profit.");
  await expect(page.locator("[data-min-short]")).toHaveText("Short-letting needs to make at least £938.46 a month to beat this long let.");
  // Simulate the profit calculator's hand-off, then import.
  await page.getByLabel("Short-let monthly profit").fill("0");
  await page.evaluate(() =>
    localStorage.setItem(
      "vaforbnb:handoff:profit-inputs",
      JSON.stringify({ format: "vaforbnb-handoff", version: 1, kind: "profit-inputs", source: "short-let-profit-calculator", createdAt: new Date().toISOString(), data: { monthlyProfit: 1200, sharedCosts: { mortgageInterest: 500, serviceCharge: 0, groundRent: 0, insurance: 0 }, vatRegistered: true } }),
    ),
  );
  await page.locator("[data-import]").click();
  await expect(page.locator("[data-imported]")).toContainText("Imported: profit £1,200/month (includes mortgage interest £500, service charge £0)");
  await expect(page.getByText("Your short-let profit is already after VAT.")).toBeVisible();
  await expect(side(page, "short")).toHaveText("£1,200/month");
  await expect(side(page, "long")).toHaveText("£438/month");
  await page.getByRole("button", { name: "Undo import" }).click();
  await expect(side(page, "short")).toHaveText("£0/month");
});

test("5-year view with a switching cost: the step and payback show", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await page.getByLabel("I long-let now").check();
  await page.locator("[data-tab='five']").click();
  await page.getByLabel("Cost to switch to a short let").fill("5000");
  await expect(page.locator("[data-five-chart]")).toBeVisible();
  await expect(page.locator("[data-five-table]")).toContainText("Switching cost");
  await expect(page.locator("[data-five-table]")).toContainText("−£5,000");
  await expect(page.locator("[data-payback]")).toHaveText("Payback of the switching cost: 8.9 months.");
  await expect(page.locator("[data-panel='five'] h3").nth(1)).toContainText("£28,692 in favour of short-letting");
});

test("Your time: the prompt when hours are empty, then the per-hour figures", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await page.locator("[data-tab='time']").click();
  await expect(page.locator("[data-hours-prompt]")).toContainText("Work out your hosting hours");
  await page.getByLabel("Short-let hours a month").fill("20");
  await page.getByLabel("Value my time at (optional)").fill("15");
  await expect(page.locator("[data-per-hour='short']")).toContainText("£75.00/hour");
  await expect(page.locator("[data-per-hour='long']")).toContainText("£469.23/hour");
  await expect(page.locator("[data-extra-hour]")).toHaveText("Short-letting pays you £31.20 for each extra hour of work.");
  await expect(page.locator("[data-time-adjusted]")).toContainText("£291.54");
  await page.locator("[data-tab='tax']").click();
  await page.getByLabel("Higher rate").check();
  await expect(page.locator("[data-after-tax]")).toHaveText("£336.92");
});

test("validation: void weeks 53 shows an error and no result", async ({ page }) => {
  await open(page);
  await page.getByLabel("Void weeks per year").fill("53");
  await expect(page.getByText("Void weeks must be between 0 and 52.")).toBeVisible();
  await expect(page.locator("[data-no-result]")).toBeVisible();
});

test("save two scenarios, compare; PDF with and without email; only the lead is sent", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.locator("[data-example]").click();
  await page.getByLabel("Short-let monthly profit").fill("1534.21");
  await page.getByLabel("Scenario name").fill("Now");
  await page.locator("[data-save-scenario]").click();
  await page.getByLabel("Expected monthly rent").fill("1400");
  await page.getByLabel("Scenario name").fill("Higher rent");
  await page.locator("[data-save-scenario]").click();
  await expect(page.locator("[data-compare] tr[data-differs]").filter({ hasText: "Rent" })).toBeVisible();
  await page.locator("[data-pdf]").click();
  let dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download the PDF" }).click();
  const file = readFileSync(await (await dl).path(), "latin1");
  expect(file.startsWith("%PDF")).toBe(true);
  await page.keyboard.press("Escape");
  await page.route("**/api/leads", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await page.locator("[data-pdf]").click();
  await page.getByRole("checkbox", { name: /Email me occasional/ }).check();
  await page.locator("dialog input[name=email]").fill("host@example.com");
  dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download the PDF" }).click();
  await dl;
  const leads = seen.filter((r) => r.url.includes("/api/"));
  expect(leads).toHaveLength(1);
  expect(Object.keys(JSON.parse(leads[0].body)).sort()).toEqual(["consentText", "email", "firstName", "timestamp", "toolSlug", "website"]);
  for (const r of seen) expect(r.url + r.body).not.toContain("1534.21");
});

test("the page HTML has the H1, things to weigh (from the Rules Hub), How it works and FAQ", async ({ request }) => {
  const html = await (await request.get(PATH)).text();
  expect(html).toContain("Would long-letting pay me more than");
  expect(html).toContain("Other things to weigh");
  expect(html).toContain("England, long lets");
  expect(html).toContain("The fair-comparison rules");
  expect(html).toContain("What are void weeks?");
  expect(html).toContain('"@type":"WebApplication"');
});

test.describe("phone (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("no sideways scroll, sticky result bar, charts with text alternatives, 44px targets", async ({ page }) => {
    await open(page);
    await page.locator("[data-example]").click();
    await expect(page.locator("[data-mobile-bar]")).toContainText("Short let +£562/month");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator("[data-net-chart] ~ p")).toHaveText("Short let £1,500 a month; long let £938 a month.");
    await page.locator("[data-tab='five']").click();
    await expect(page.locator("[data-five-table]")).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const small = await page.locator("[data-tool] button:visible").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent?.trim()));
    expect(small).toEqual([]);
  });
});

test("live: 4th in Know my numbers; linked from the profit calculator, Finance check, Who we help, Long-stay and the sitemap", async ({ page, request }) => {
  await page.goto("/free-tools?job=know-my-numbers");
  const hub = page.locator("#short-let-vs-long-let");
  await expect(hub).toHaveAttribute("href", PATH);
  await expect(hub).not.toContainText("Coming soon");
  await expect.poll(async () => (await page.locator("#all [id] p.font-extrabold").allTextContents()).slice(0, 4)).toEqual(["Short-let profit calculator", "Direct booking savings", "Booking performance", "Short-let vs long-let"]);
  await page.goto("/services/finance-check");
  await expect(page.locator("[data-svl-link]")).toHaveAttribute("href", PATH);
  await page.goto("/who-we-help");
  for (const tab of ["tab-side", "tab-sa"]) {
    await page.locator(`#${tab}`).click();
    await expect(page.locator(`#persona-panel a[href="${PATH}"]`)).toBeVisible();
  }
  await page.goto("/free-tools/long-stay-discount-calculator");
  await expect(page.locator("[data-related='short-let-vs-long-let']")).toHaveAttribute("href", PATH);
  // The profit calculator's "Compare with long-letting" opens this tool with the figures.
  await page.goto("/free-tools/short-let-profit-calculator");
  const profit = page.locator("[data-tool='short-let-profit-calculator'][data-ready]");
  await expect(profit).toBeVisible();
  await profit.locator("[data-handoff='short-let-vs-long-let']").click();
  await expect(page).toHaveURL(new RegExp(PATH));
  await expect(page.locator("[data-tool='short-let-vs-long-let-calculator'][data-ready] [data-imported]")).toContainText("Imported: profit");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`${PATH}</loc>`);
  expect(await (await request.get(PATH)).text()).not.toMatch(/<meta name="robots" content="noindex/);
});
