import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/uk-visitor-levy-calculator";
const STORAGE_KEY = "vaforbnb:tool:uk-visitor-levy-calculator:v1";

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

async function open(page: Page, query = "") {
  await page.goto(PATH + query);
  await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const total = (page: Page) => page.locator("[data-levy-total]");
const panel = (page: Page) => page.locator("[data-result-panel]");

test("Edinburgh example updates live as nights and price change", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(total(page)).toContainText("£37.50");
  await expect(panel(page)).toContainText("£5.36 per night across 7 nights · charged on 5 nights");
  await expect(panel(page)).toContainText("5 nights × £150.00 × 5% = £37.50");
  await expect(panel(page)).toContainText("In force");
  await expect(panel(page)).toContainText("Not charged (after night 5)");
  await expect(panel(page)).toContainText("Guest pays");
  await expect(panel(page)).toContainText("£1,087.50");
  await expect(page.getByText("Check-out: Sat 8 Aug 2026")).toBeVisible();

  await page.getByRole("button", { name: "Decrease: Nights" }).click();
  await page.getByRole("button", { name: "Decrease: Nights" }).click();
  await page.getByRole("button", { name: "Decrease: Nights" }).click();
  await expect(total(page)).toContainText("£30.00"); // 4 nights × £150 × 5%
  await page.getByLabel("Price per night").fill("200");
  await expect(total(page)).toContainText("£40.00");
  await page.getByLabel("Price per night").fill("-5");
  await expect(page.getByText("Enter a price of £0 or more.")).toBeVisible();
  await expect(total(page)).toContainText("—");
});

test("price changes by night shows date-labelled fields", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("radio", { name: "Price changes by night" }).check();
  for (const label of ["Sat 1 Aug", "Sun 2 Aug", "Mon 3 Aug", "Tue 4 Aug", "Wed 5 Aug"]) await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  await expect(page.getByLabel("Thu 6 Aug", { exact: true })).toHaveCount(0);
  await page.getByLabel("Sat 1 Aug", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Copy first price to all" }).click();
  await expect(total(page)).toContainText("£25.00");
  await page.getByLabel("Wed 5 Aug", { exact: true }).fill("200");
  await expect(total(page)).toContainText("£30.00");
});

test("?area=cardiff shows guests and accommodation type", async ({ page }) => {
  await open(page, "?area=cardiff");
  await expect(page.getByLabel("Area", { exact: true })).toHaveValue("cardiff");
  await expect(page.getByRole("button", { name: /Cardiff/, pressed: true })).toBeVisible();
  await expect(page.getByLabel("Guests", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Hostel, dorm, campsite or tent" })).toBeVisible();
  await expect(page.getByLabel("Price per night")).toHaveCount(0);
  await page.getByLabel("Check-in date", { exact: true }).fill("30/03/2027");
  await page.getByLabel("Nights", { exact: true }).fill("3");
  await page.getByLabel("Guests", { exact: true }).fill("1");
  await expect(total(page)).toContainText("£1.30");
  await expect(panel(page)).toContainText("Partly in force: 1 of 3 nights");
  await expect(panel(page)).toContainText("Not in force yet");
});

test("another council shows a message, no calculator", async ({ page }) => {
  await open(page);
  await page.getByLabel("Area", { exact: true }).selectOption("scotland-other");
  await expect(page.getByText(/We don’t have a levy for this area in our data yet/).first()).toBeVisible();
  await expect(page.getByLabel("Check-in date", { exact: true })).toHaveCount(0);
});

test("levy log: add two stays, refresh keeps them, CSV, clear", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByLabel("Reference (optional)").fill("Booking A");
  await page.getByRole("button", { name: "Add to my levy log" }).click();
  await page.getByLabel("Check-in date", { exact: true }).fill("01/09/2026");
  await page.getByLabel("Nights", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Add to my levy log" }).click();
  await page.getByRole("button", { name: /Levy log/ }).click();
  await expect(page.getByRole("button", { name: /Levy log \(2 stays\)/ })).toBeVisible();

  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  const log = page.locator("#levy-log-body");
  await expect(log).toBeVisible();
  await expect(log).toContainText("Booking A");
  await expect(log).toContainText("Jul–Sep 2026");
  await expect(log).toContainText("£60.00"); // 37.50 + 22.50

  const dl = page.waitForEvent("download");
  await log.getByRole("button", { name: "Download CSV" }).click();
  const csv = readFileSync(await (await dl).path(), "utf8").trimEnd().split("\r\n");
  expect(csv[0]).toBe("Reference,Area,Check-in,Nights,Guests,Chargeable nights,Levy (£)");
  expect(csv).toHaveLength(3);
  expect(csv[1]).toBe("Booking A,Edinburgh,2026-08-01,7,,5,37.50");

  await log.getByRole("button", { name: /^Delete the stay from 1 Sep 2026/ }).click();
  await expect(log).not.toContainText("1 Sep 2026 ·");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(log).toContainText("1 Sep 2026");

  await log.getByRole("button", { name: "Clear log" }).click();
  await log.getByRole("button", { name: "Yes, clear the log" }).click();
  await expect(page.getByRole("button", { name: /Levy log \(0 stays\)/ })).toBeVisible();
});

test("390px: no horizontal scroll, sticky levy bar, night strip scrolls in its box", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByLabel("Nights", { exact: true }).fill("14");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await page.getByLabel("Price per night").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-levy-bar]")).toBeVisible();
  await expect(page.locator("[data-levy-bar]")).toContainText("Levy: £37.50");
  const strip = page.locator("[data-night-strip]");
  await strip.scrollIntoViewIfNeeded();
  expect(await strip.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await expect(page.locator("[data-levy-bar]")).toBeHidden();
});

test("no network request contains prices, dates or references", async ({ page }) => {
  await open(page);
  const seen: string[] = [];
  page.on("request", (r) => {
    if (!r.url().includes("/_next/") && !r.url().includes("__nextjs")) seen.push(`${r.method()} ${r.url()} ${r.postData() ?? ""}`);
  });
  await page.getByLabel("Check-in date", { exact: true }).fill("14/08/2026");
  await page.getByLabel("Nights", { exact: true }).fill("3");
  await page.getByLabel("Price per night").fill("187.45");
  await page.getByLabel("Reference (optional)").fill("Zebedee Quill");
  await page.getByRole("button", { name: "Add to my levy log" }).click();
  await expect(total(page)).toContainText("£28.12");
  await page.waitForTimeout(500);
  for (const s of seen) {
    expect(s).not.toContain("Zebedee");
    expect(s).not.toContain("187.45");
    expect(s).not.toContain("2026-08-14");
  }
  expect(seen.filter((s) => s.startsWith("POST"))).toEqual([]);
});

test("hub: live under Stay legal with Result + CSV, card opens the tool", async ({ page }) => {
  await page.goto("/free-tools?job=stay-legal");
  const card = page.locator("#visitor-levy-calculator");
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("Result + CSV");
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));
});

test("Rules Hub and Pricing page link to the tool", async ({ page }) => {
  await page.goto("/uk-short-let-rules#visitor-levy");
  await expect(page.getByRole("link", { name: /Calculate the levy/ }).first()).toBeVisible();
  await page.goto("/services/pricing-optimisation");
  await expect(page.locator(`a[href="${PATH}"]`).first()).toBeAttached();
});
