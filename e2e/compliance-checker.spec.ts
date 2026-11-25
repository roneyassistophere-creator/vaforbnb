import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/uk-short-let-compliance-checker";
const STORAGE_KEY = "vaforbnb:tool:uk-short-let-compliance-checker:v1";

async function open(page: Page, { fresh = true } = {}) {
  await page.goto(PATH);
  if (fresh) {
    await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
    await page.reload();
  }
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const pick = (page: Page, label: string) => page.getByLabel(label, { exact: true }).click();

/** Case 1: London, whole home, not main home, gas, owned, none. */
async function answerCase1(page: Page) {
  await pick(page, "London");
  await pick(page, "The whole home");
  await pick(page, "No");
  await pick(page, "Yes");
  await pick(page, "I own it outright");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await pick(page, "None of these");
  await page.getByRole("button", { name: "See my checklist" }).click();
}

test("completes case 1 and shows the right groups", async ({ page }) => {
  await open(page);
  await expect(page.getByText("Question 1 of 6")).toBeVisible();
  await answerCase1(page);
  await expect(page.getByRole("heading", { name: "These rules apply to your property" })).toBeVisible();
  await expect(page.getByText("12 rules apply: 10 must do now, 2 coming soon")).toBeVisible();
  await expect(page.locator('[data-rule-id="london-90-nights"]')).toBeVisible();
  await expect(page.locator('[data-rule-id="commercial-waste"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: /Check your contract/ })).toHaveCount(0);
  // The results never claim the host is compliant (the FAQ and How it works mention the word on purpose).
  await expect(page.locator("[data-print-area]").getByText(/compliant|you’re all set|you're all set/i)).toHaveCount(0);
});

test("Back keeps answers", async ({ page }) => {
  await open(page);
  await pick(page, "London");
  await pick(page, "The whole home");
  await expect(page.getByText("Question 3 of 6")).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("The whole home", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("London", { exact: true })).toBeChecked();
});

test("Scotland adds the council question, and changing nation clears it", async ({ page }) => {
  await open(page);
  await pick(page, "Scotland");
  await expect(page.getByText("Question 2 of 7")).toBeVisible();
  await pick(page, "Edinburgh");
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "Back" }).click();
  await pick(page, "England (outside London)");
  await expect(page.getByText("Question 2 of 6")).toBeVisible();
});

test("refresh keeps answers and Clear empties them", async ({ page }) => {
  await open(page);
  await pick(page, "Wales");
  await pick(page, "Cardiff");
  await expect(page.getByText("Question 3 of 7")).toBeVisible();
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByText("Question 3 of 7")).toBeVisible();
  await expect(page.getByLabel("Your checklist so far")).toContainText("Cardiff");
  await page.getByRole("button", { name: "Clear my saved answers" }).click();
  await expect(page.getByText("Question 1 of 6")).toBeVisible();
  await expect(page.getByLabel("Wales", { exact: true })).not.toBeChecked();
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).not.toContain("cardiff");
});

test("Details link opens the right Rules Hub card", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  const card = page.locator('[data-rule-id="london-90-nights"]');
  const link = card.getByRole("link", { name: "Details in the Rules Hub →" });
  await expect(link).toHaveAttribute("href", "/uk-short-let-rules#london-90-nights");
  await link.click();
  await expect(page).toHaveURL(/\/uk-short-let-rules#london-90-nights$/);
  const target = page.locator("#london-90-nights");
  await expect(target.getByRole("button", { expanded: true })).toBeVisible();
  await expect(target).toBeInViewport();
});

test("no horizontal scroll at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.getByRole("heading", { name: "These rules apply to your property" })).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
});

test("print view shows the checklist only", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: "These rules apply to your property" })).toBeVisible();
  await expect(page.locator("header").first()).toBeHidden();
  await expect(page.locator("footer").first()).toBeHidden();
  await expect(page.getByRole("heading", { name: "What this means" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Questions about UK short-let rules" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Copy checklist" })).toBeHidden();
  // Steps are shown in print even though they're collapsed on screen.
  await expect(page.locator('[data-rule-id="fire-risk-assessment"] ul')).toBeVisible();
});

test("email request sends only lead fields", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();

  let body: Record<string, unknown> | null = null;
  await page.route("**/api/leads", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });

  await page.getByRole("button", { name: "Download the PDF" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: /^Email/ }).fill("host@example.com");
  await dialog.getByLabel("First name (optional)").fill("Sam");
  await dialog.getByRole("checkbox").check();
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download the PDF" }).click();
  expect((await download).suggestedFilename()).toBe("uk-short-let-checklist.pdf");

  expect(body).not.toBeNull();
  expect(Object.keys(body!).sort()).toEqual(["consentText", "email", "firstName", "timestamp", "toolSlug", "website"]);
  expect(body!.toolSlug).toBe("uk-short-let-compliance-checker");
  expect(body!.website).toBe("");
  const text = JSON.stringify(body);
  for (const leaked of ["london", "whole-home", "mortgaged", "rules", "mustDo"]) expect(text).not.toContain(leaked);
});

test("no lead is sent when the consent box is left unticked", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  let called = false;
  await page.route("**/api/leads", (route) => {
    called = true;
    return route.fulfill({ status: 200, body: "{}" });
  });
  await page.getByRole("button", { name: "Download the PDF" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("dialog").getByRole("button", { name: "Download the PDF" }).click();
  await download;
  expect(called).toBe(false);
});
