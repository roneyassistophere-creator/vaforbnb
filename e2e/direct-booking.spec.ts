import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/direct-booking-savings-calculator";
const KEYS = ["vaforbnb:tool:direct-booking-savings-calculator:v1", "vaforbnb:tool:direct-booking-savings-calculator:scenarios:v1", "vaforbnb:handoff:profit-inputs", "vaforbnb:handoff:direct-booking-mix", "vaforbnb:tool:short-let-profit-calculator:v1"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

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
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  if (seed) await page.evaluate(seed);
  await page.goto(PATH + query);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}
const card = (page: Page, id: string) => page.locator(`[data-card='${id}']`);

test("example, then VAT on the platform fee: the cards update", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await expect(page.locator("[data-example-banner]")).toContainText("Example data");
  await expect(page.locator("[data-booking-value]")).toHaveText("Booking value £400.00");
  await expect(card(page, "airbnb").locator("[data-keep-value]")).toHaveText("You keep £338.00");
  await expect(card(page, "direct").locator("[data-keep-value]")).toHaveText("You keep £393.80");
  await expect(card(page, "direct").locator("[data-saving]")).toContainText("+£55.80 per booking vs Airbnb");
  await expect(card(page, "direct").locator("[data-saving]")).toContainText("+£558.00 per 10 bookings");
  await expect(page.locator("[data-discount='airbnb']")).toHaveText("You could offer direct guests up to 14.2% off and still keep more than on Airbnb.");
  await page.getByLabel("Platform charges VAT on its fee").check();
  await expect(card(page, "airbnb").locator("[data-keep-value]")).toHaveText("You keep £325.60");
  await expect(card(page, "airbnb").locator("[data-fee]")).toContainText("Fees £74.40");
  await expect(card(page, "direct").locator("[data-saving]")).toContainText("+£68.20 per booking");
});

test("split fee shows the guest comparison and price parity", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await page.getByLabel(/Split fee/).check();
  await page.getByLabel("Guest service fee").fill("14");
  await expect(page.locator("[data-guest-compare]")).toContainText("Guests pay £456.00 on Airbnb vs £400.00 direct, so direct guests save £56.00");
  await expect(page.locator("[data-guest-compare]")).toContainText("you’d keep £448.96");
});

test("Your year: the target slider updates bars, verdict and payback live", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await expect(page.locator("[data-year-headline]")).toHaveText("You pay about £3,534 a year in platform fees");
  await expect(page.locator("[data-net]")).toContainText("Gross saving £502 − new direct costs £480 = net saving £22 a year");
  await expect(page.locator("[data-break-even]")).toHaveText("Break-even: 9 direct bookings a year cover your direct running costs.");
  await expect(page.locator("[data-payback]")).toHaveText("Website payback: Over 10 years.");
  await expect(page.locator("[data-verdict]")).toHaveText("Marginal");
  await expect(page.locator("[data-make-it-work]")).toContainText("19.3% direct");
  await expect(page.locator("[data-make-it-work]")).toContainText("34.3% direct");
  const target = await page.locator("[data-stack='target']").innerText();
  const slider = page.locator("[data-slider='b-target']");
  await slider.focus();
  for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-stack='target']")).not.toHaveText(target);
  await expect(page.locator("[data-verdict]")).toHaveText("Worth it at your figures");
  await expect(page.locator("[data-payback]")).not.toHaveText("Website payback: Over 10 years.");
  await page.getByLabel("Booking system or channel manager (a month)").fill("400");
  await expect(page.locator("[data-verdict]")).toHaveText("Not yet");
});

test("validation: inline errors and no result", async ({ page }) => {
  await open(page);
  await page.getByLabel("Nightly rate").fill("0");
  await expect(page.getByText("Enter a nightly rate above £0.")).toBeVisible();
  await expect(page.locator("[data-result-a] [data-no-result]")).toBeVisible();
  await expect(card(page, "direct")).toHaveCount(0);
});

test("save two scenarios, compare, and Copy summary", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page);
  await page.locator("[data-example]").click();
  await page.getByLabel("Scenario name").fill("20% direct");
  await page.locator("[data-save-scenario]").click();
  await page.getByRole("textbox", { name: "Target direct share" }).fill("40");
  await page.getByLabel("Scenario name").fill("40% direct");
  await page.locator("[data-save-scenario]").click();
  await expect(page.locator("[data-compare] tr[data-differs]").filter({ hasText: "Target direct share" })).toBeVisible();
  await page.getByRole("button", { name: "Copy summary" }).click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("Direct vs Airbnb: +£55.80 per booking");
  expect(text).toContain("Platforms bring guests you might not reach yourself.");
});

test("arrive from the Profit calculator with imported values, then continue in the kit", async ({ page }) => {
  await open(page, "?kit=growing", () => {
    localStorage.setItem(
      "vaforbnb:handoff:profit-inputs",
      JSON.stringify({ format: "vaforbnb-handoff", version: 1, kind: "profit-inputs", source: "short-let-profit-calculator", createdAt: new Date().toISOString(), data: { bookingValueMonthly: 1824, staysMonthly: 6.08, channels: [{ id: "airbnb", sharePercent: 80, feePercent: 15.5 }, { id: "booking", sharePercent: 15, feePercent: 15 }, { id: "direct", sharePercent: 5, feePercent: 1.5 }] } }),
    );
  });
  await expect(page.locator("[data-imported]")).toContainText("Imported from Profit calculator: average booking value, bookings per year, channel mix.");
  await expect(page.getByLabel("Bookings per year")).toHaveValue("73");
  await expect(page.getByLabel("Average booking value")).toHaveValue("300");
  await expect(page.getByLabel("Booking.com share")).toHaveValue("15");
  await expect(page.locator("[data-kit-badge]")).toHaveText("Growing host kit · step 4");
  await expect(page.locator("[data-next-step='kit']")).toContainText("Next in your kit: Linen and supplies calculator");
  await page.locator("[data-kit-next]").click();
  await expect(page).toHaveURL(/\/free-tools(#linen-and-supplies-calculator|\/)/);
});

test("Open in Profit calculator sends the target channel mix", async ({ page }) => {
  await open(page);
  await page.locator("[data-example]").click();
  await page.locator("[data-to-profit]").click();
  await expect(page).toHaveURL(/short-let-profit-calculator/);
  const profit = page.locator("[data-tool='short-let-profit-calculator'][data-ready]");
  await expect(profit).toBeVisible();
  await expect(profit.locator("[data-imported]")).toContainText("Imported from Direct booking savings");
  await expect(profit.getByLabel("Direct share")).toHaveValue("20");
  await expect(profit.getByLabel("Airbnb share")).toHaveValue("80");
});

test("no network request contains the host's figures", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByLabel("Nightly rate").fill("137.77");
  await page.locator("[data-open-year]").click();
  await page.getByLabel("Bookings per year").fill("4321");
  await expect(page.locator("[data-year-headline]")).toBeVisible();
  for (const r of seen) expect(r.url + r.body).not.toMatch(/137\.77|4321/);
});

test("the page HTML has the H1, checklist, How it works and FAQ", async ({ request }) => {
  const html = await (await request.get(PATH)).text();
  expect(html).toContain("cost me?");
  expect(html).toContain("Before you go direct");
  expect(html).toContain("All-in pricing");
  expect(html).toContain("Break-even direct discount");
  expect(html).toContain("Can I ask Airbnb guests to book direct?");
  expect(html).toContain('"@type":"WebApplication"');
});

test.describe("phone (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("no sideways scroll, cards stack, charts fit with text alternatives, 44px targets", async ({ page }) => {
    await open(page);
    await page.locator("[data-example]").click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const a = await card(page, "airbnb").boundingBox();
    const d = await card(page, "direct").boundingBox();
    expect(d!.y).toBeGreaterThan(a!.y + a!.height - 1);
    for (const sel of ["[data-keep-chart]", "[data-fee-chart]"]) {
      const b = await page.locator(sel).boundingBox();
      expect(b!.x + b!.width).toBeLessThanOrEqual(390);
    }
    await expect(page.locator("[data-fee-table]")).toBeAttached();
    const small = await page.locator("[data-tool] button:visible").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent?.trim()));
    expect(small).toEqual([]);
  });
});
