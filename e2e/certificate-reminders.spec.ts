import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { addDays, addMonths, formatDmy } from "../src/lib/tools/dates";

const PATH = "/free-tools/holiday-let-certificate-reminders";
const STORAGE_KEY = "vaforbnb:tool:holiday-let-certificate-reminders:v1";
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const back = (months: number, days = 0) => formatDmy(addDays(addMonths(TODAY, -months), days));

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

async function open(page: Page, query = "") {
  await page.goto(PATH + query);
  await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const summary = (page: Page) => page.locator("[data-result-panel]");
const table = (page: Page) => page.getByRole("region", { name: /^Due dates: .* table$/ });

async function typeDate(page: Page, label: string, dmy: string) {
  await page.getByLabel(label, { exact: true }).fill(dmy);
}

test("enter four dates by keyboard only; summary, table and timeline update", async ({ page }) => {
  await open(page);
  const tabTo = async (label: string) => {
    for (let k = 0; k < 25; k++) {
      await page.keyboard.press("Tab");
      const here = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement | null;
        return el?.id ? (document.querySelector(`label[for="${el.id}"]`)?.textContent ?? "") : "";
      });
      if (here === label) return;
    }
    throw new Error(`Couldn't tab to ${label}`);
  };
  await page.getByRole("heading", { name: "Your checks" }).click(); // start the tab order near the checks
  const entries: [string, string][] = [
    ["Date of your last gas safety check", back(12, 25)], // due soon
    ["Date of your last EICR", back(24)], // OK
    ["Date you last reviewed your fire risk assessment", back(13)], // overdue
    ["Date of your last PAT test", back(4)], // OK
  ];
  for (const [label, dmy] of entries) {
    await tabTo(label);
    await page.keyboard.type(dmy);
  }
  await expect(summary(page)).toContainText(/1\s*overdue/);
  await expect(summary(page)).toContainText(/1\s*due soon/);
  await expect(summary(page)).toContainText(/2\s*OK/);
  await expect(summary(page)).toContainText("Fire risk assessment review");
  const rows = table(page).locator("tbody tr");
  await expect(rows.first()).toContainText("Fire risk assessment review");
  await expect(rows.first()).toContainText("Overdue by");
  await expect(rows.nth(1)).toContainText("Gas safety check");
  // Timeline: three markers in the next 12 months; the EICR (due in 3 years) is listed under "Later".
  const timeline = page.getByRole("region", { name: "The next 12 months" });
  await expect(timeline.getByRole("button")).toHaveCount(3);
  await expect(timeline).toContainText(/Later:.*Electrical report \(EICR\)/);
});

test("?item=gas scrolls to and highlights the gas card", async ({ page }) => {
  await page.goto(`${PATH}?item=gas`);
  const card = page.locator("#item-gas");
  await expect(card).toHaveAttribute("data-highlighted", "");
  await expect(card).toBeInViewport();
});

test("calendar file is valid .ics with one event per dated item", async ({ page }) => {
  await open(page);
  await typeDate(page, "Date of your last gas safety check", back(10));
  await typeDate(page, "Date you last reviewed your fire risk assessment", back(13));
  await typeDate(page, "Policy renewal date", formatDmy(addMonths(TODAY, 3)));
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Add all to my calendar/ }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toBe(`vaforbnb-reminders-my-property-${TODAY}.ics`);
  const ics = readFileSync(await file.path(), "utf8");
  expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
  expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
  expect(ics).toContain("SUMMARY:OVERDUE: Fire risk assessment review – My property");
  expect(ics).toContain("TRIGGER:-P30D");
  expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);

  // Leaving overdue items out drops that event.
  await page.getByRole("switch", { name: /Include overdue items/ }).click();
  await expect(page.getByRole("button", { name: /^Add all to my calendar \(2 reminders\)/ })).toBeVisible();
});

test("refresh keeps the dates; Clear all my data empties them", async ({ page }) => {
  await open(page);
  await typeDate(page, "Date of your last gas safety check", back(6));
  await expect(summary(page)).toContainText("Gas safety check");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Date of your last gas safety check", { exact: true })).toHaveValue(back(6));
  await page.getByRole("button", { name: "Clear all my data" }).click();
  await page.getByRole("button", { name: "Yes, delete everything" }).click();
  await expect(page.getByLabel("Date of your last gas safety check", { exact: true })).toHaveValue("");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Date of your last gas safety check", { exact: true })).toHaveValue("");
});

test("a future last-done date shows an error and no result", async ({ page }) => {
  await open(page);
  await typeDate(page, "Date of your last gas safety check", formatDmy(addDays(TODAY, 10)));
  await expect(page.locator("#item-gas")).toContainText("This date can’t be in the future.");
  await expect(page.locator("#item-gas")).not.toContainText("Add to Google Calendar");
});

test("no gas hides the gas check; Scotland adds the licence", async ({ page }) => {
  await open(page);
  await page.getByRole("radio", { name: "No" }).check();
  await expect(page.locator("#item-gas")).toHaveCount(0);
  await page.getByLabel("Where is the property?").selectOption("scotland");
  await expect(page.locator("#item-licence")).toBeVisible();
  await expect(page.locator("#item-eicr")).toContainText("Required");
});

test("example, custom reminder and two properties", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.getByText("You’re looking at example data, not your property.")).toBeVisible();
  await expect(summary(page)).toContainText(/1\s*overdue/);
  await expect(summary(page)).toContainText(/1\s*due soon/);
  await page.getByRole("button", { name: "Clear example" }).click();
  await expect(summary(page)).toContainText(/0\s*overdue/);

  await page.getByRole("button", { name: "Add your own reminder" }).click();
  const form = page.getByRole("form", { name: "Add your own reminder" });
  await form.getByLabel("What is it?").fill("Chimney sweep");
  await form.getByLabel("Date last done", { exact: true }).fill(back(2));
  await form.getByLabel("Repeat every (months)").fill("12");
  await form.getByRole("button", { name: "Add reminder" }).click();
  await expect(page.getByRole("heading", { name: "Chimney sweep" })).toBeVisible();
  await expect(table(page)).toContainText("Chimney sweep");

  await page.getByRole("button", { name: "Add another property" }).click();
  await page.getByLabel("New property name").fill("Cottage B");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(table(page)).not.toContainText("Chimney sweep");
  await page.getByRole("radio", { name: "All properties" }).check();
  await expect(table(page)).toContainText("Chimney sweep");
  await expect(table(page)).toContainText("Cottage B");
});

test("390px: no horizontal scroll, summary first, table scrolls in its box", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  const s = await summary(page).boundingBox();
  const checks = await page.getByRole("heading", { name: "Your checks" }).boundingBox();
  expect(s!.y).toBeLessThan(checks!.y);
  const scroll = await table(page).evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scroll).toBe(true);
});

test("no network request contains dates or property names", async ({ page }) => {
  await open(page);
  const seen: string[] = [];
  page.on("request", (r) => {
    if (!r.url().includes("/_next/") && !r.url().includes("__nextjs")) seen.push(`${r.method()} ${r.url()} ${r.postData() ?? ""}`);
  });
  await page.getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("Property name").fill("Zebedee Cottage");
  await page.getByRole("button", { name: "Save" }).click();
  const gas = back(3);
  await typeDate(page, "Date of your last gas safety check", gas);
  await expect(summary(page)).toContainText("Zebedee Cottage");
  await page.waitForTimeout(500);
  for (const s of seen) {
    expect(s).not.toContain("Zebedee");
    expect(s).not.toContain(gas);
    expect(s).not.toContain(gas.split("/").reverse().join("-"));
  }
  expect(seen.filter((s) => s.startsWith("POST"))).toEqual([]);
});

test("hub: live under Stay legal with Calendar file, card opens the tool", async ({ page }) => {
  await page.goto("/free-tools?job=stay-legal");
  const card = page.locator("#certificate-reminders");
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("Calendar file");
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));
});

test("Rules Hub and Laundry page link to the tool", async ({ page }) => {
  await page.goto("/uk-short-let-rules#gas-safety");
  await expect(page.locator('a[href="/free-tools/holiday-let-certificate-reminders?item=gas"]').first()).toBeVisible();
  await page.goto("/services/laundry-and-maintenance");
  await expect(page.locator(`a[href="${PATH}"]`).first()).toBeAttached();
});
