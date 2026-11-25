import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/holiday-let-business-rates-checker";
const STORAGE_KEY = "vaforbnb:tool:holiday-let-business-rates-checker:v1";

async function open(page: Page) {
  await page.goto(PATH);
  await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const field = (page: Page, label: string) => page.getByRole("textbox", { name: label });
const result = (page: Page) => page.locator("[data-result-panel]");

test("England not yet: result updates as you type and shows the days needed", async ({ page }) => {
  await open(page);
  await page.getByLabel("England (includes London)", { exact: true }).click();
  await expect(result(page)).toContainText("Add your days to see your result");

  await field(page, "Days it was available to let in the last 12 months").fill("150");
  await field(page, "Days you plan to make it available in the next 12 months").fill("150");
  await expect(result(page)).toContainText("Add your days to see your result");

  await field(page, "Days it was actually let in the last 12 months").fill("62");
  await expect(result(page)).toContainText("Not yet");
  await expect(result(page)).toContainText("You need 8 more let days.");
  await expect(result(page)).toContainText("8 more days needed");
  await expect(result(page)).toContainText("second-home premium of up to 100%");

  // Typing more updates it straight away.
  await field(page, "Days it was actually let in the last 12 months").fill("70");
  await expect(result(page)).toContainText("Meets the tests");
  await expect(result(page)).toContainText("The Valuation Office Agency decides.");
  await expect(page.getByText("Your property meets the tests. Ask the assessor")).toBeVisible();

  // Invalid input: inline error, no result, never NaN.
  await field(page, "Days it was actually let in the last 12 months").fill("70.5");
  await expect(page.getByText("Use whole days, without decimals.")).toBeVisible();
  await expect(result(page)).toContainText("Add your days to see your result");
  await expect(page.locator("body")).not.toContainText("NaN");
});

test("the + and − buttons step the value", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Increase: Days it was actually let in the last 12 months" }).click();
  await expect(field(page, "Days it was actually let in the last 12 months")).toHaveValue("63");
  await expect(result(page)).toContainText("7 more let days");
});

test("Wales: averaging adds the extra fields", async ({ page }) => {
  await open(page);
  await page.getByLabel("Wales", { exact: true }).click();
  await expect(field(page, "Days it was actually let the year before")).toHaveCount(0);
  await page.getByRole("switch", { name: /Average my let days over 2 or 3 years/ }).check();
  await expect(field(page, "Days it was actually let the year before")).toBeVisible();
  await expect(field(page, "Days it was actually let two years before (optional)")).toBeVisible();

  await field(page, "Days it was available to let in the last 12 months").fill("252");
  await field(page, "Days you plan to make it available in the next 12 months").fill("252");
  await field(page, "Days it was actually let in the last 12 months").fill("170");
  await field(page, "Days it was actually let the year before").fill("194");
  await expect(result(page)).toContainText("Meets the tests");
  await expect(result(page)).toContainText("average of 170, 194");
});

test("changing nation keeps shared numbers and hides the rest", async ({ page }) => {
  await open(page);
  await page.getByLabel("England (includes London)", { exact: true }).click();
  await field(page, "Days it was available to let in the last 12 months").fill("200");
  await field(page, "Days you plan to make it available in the next 12 months").fill("180");
  await page.getByLabel("Scotland", { exact: true }).click();
  await expect(field(page, "Days it was available to let in the last 12 months")).toHaveCount(0);
  await expect(field(page, "Days it will be available to let this year")).toHaveValue("180");
  await page.getByLabel("Northern Ireland", { exact: true }).click();
  await expect(page.getByRole("form", { name: "Business rates qualifier" }).getByText("Northern Ireland has its own rating system")).toBeVisible();
  await expect(result(page)).toContainText("Not covered by this checker");
  await page.getByLabel("England (includes London)", { exact: true }).click();
  await expect(field(page, "Days it was available to let in the last 12 months")).toHaveValue("200");
});

test("refresh keeps inputs and Clear empties them", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(result(page)).toContainText("Not yet");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(field(page, "Days it was actually let in the last 12 months")).toHaveValue("62");
  await expect(result(page)).toContainText("Not yet");
  await page.getByRole("button", { name: "Clear my saved answers" }).click();
  await expect(page.getByLabel("England (includes London)", { exact: true })).not.toBeChecked();
  await expect(result(page)).toContainText("Add your days to see your result");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("England (includes London)", { exact: true })).not.toBeChecked();
});

test("390px: no horizontal scroll, result below the inputs", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const form = await page.getByRole("form", { name: "Business rates qualifier" }).boundingBox();
  const panel = await result(page).boundingBox();
  expect(panel!.y).toBeGreaterThan(form!.y + form!.height - 1);
});

test("Rules Hub links point to the right anchors and open the card", async ({ page }) => {
  await page.goto(PATH);
  for (const a of ["business-rates-england", "business-rates-scotland", "business-rates-wales", "second-homes-premium"]) {
    await expect(page.locator(`a[href="/uk-short-let-rules#${a}"]`).first()).toBeVisible();
  }
  await page.locator('a[href="/uk-short-let-rules#second-homes-premium"]').first().click();
  await expect(page).toHaveURL(/#second-homes-premium$/);
  await expect(page.locator("#second-homes-premium").getByRole("button", { expanded: true })).toBeVisible();
});

test("no network request contains the host's figures", async ({ page }) => {
  await open(page);
  const seen: string[] = [];
  page.on("request", (r) => {
    if (r.url().startsWith("http://localhost") && !r.url().includes("/_next/") && !r.url().includes("__nextjs")) seen.push(`${r.method()} ${r.url()} ${r.postData() ?? ""}`);
  });
  await page.getByLabel("England (includes London)", { exact: true }).click();
  await field(page, "Days it was available to let in the last 12 months").fill("143");
  await field(page, "Days you plan to make it available in the next 12 months").fill("157");
  await field(page, "Days it was actually let in the last 12 months").fill("61");
  await expect(result(page)).toContainText("Not yet");
  await page.waitForTimeout(500);
  for (const s of seen) {
    expect(s).not.toMatch(/\b(143|157|61)\b/);
  }
  expect(seen.filter((s) => s.startsWith("POST"))).toEqual([]);
});

test("the ? tip explains what to count", async ({ page }) => {
  await open(page);
  await page.getByLabel("England (includes London)", { exact: true }).click();
  const tipButton = page.getByRole("button", { name: "What to count: Days it was actually let in the last 12 months" });
  await expect(tipButton).toHaveAttribute("aria-expanded", "false");
  await tipButton.click();
  await expect(tipButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("A 3-night stay is 3 days.").first()).toBeVisible();
});

test("hub: listed under Stay legal as live, and ?job=stay-legal filters", async ({ page }) => {
  await page.goto("/free-tools?job=stay-legal");
  await expect(page.getByRole("button", { name: /Stay legal/ })).toHaveAttribute("aria-pressed", "true");
  const card = page.locator("#business-rates-qualifier");
  await expect(card).toContainText("Free");
  await expect(card).toHaveAttribute("href", "/free-tools/holiday-let-business-rates-checker");
  await expect(card).toContainText("England · Scotland · Wales");
  const order = await page.locator("#all h3:has-text('Stay legal') ~ * p.font-extrabold, #all [id] p.font-extrabold").allTextContents();
  expect(order.slice(0, 7)).toEqual([
    "UK compliance checker",
    "Business rates qualifier",
    "London 90-night counter",
    "Certificate reminders",
    "Visitor levy calculator",
    "Guest register builder",
    "House rules generator",
  ]);
});
