import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * UK event calendar (public). Needs the SAMPLE events locally:
 *   npm run db:seed:sample-events   and   EVENTS_SHOW_SAMPLE=on in .env
 */
const PATH = "/free-tools/uk-event-calendar";
const KEY = "vaforbnb:tool:uk-event-calendar:v1";
// Manchester city centre, slightly off so the numbers are easy to spot if leaked.
const COORDS = { latitude: 53.47123, longitude: -2.23987 };

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

function watch(page: Page) {
  const seen: { url: string; body: string }[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/")) return;
    seen.push({ url: decodeURIComponent(r.url()), body: r.postData() ?? "" });
  });
  return seen;
}

async function open(page: Page, path = PATH) {
  await page.goto(path);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.goto(path);
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const tool = (page: Page) => page.locator("[data-tool]");
const town = (page: Page) => page.getByRole("combobox", { name: "Your town or city" });

test("search Manchester by an alias, month view, open a day, star 2 events, add all to calendar", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await town(page).fill("Salford");
  await page.getByRole("option", { name: /Salford/ }).click();
  await expect(tool(page).locator("[data-summary]")).toContainText("near Manchester in the next 90 days");
  // Liverpool (about 31 miles) is outside 25 miles, inside 50.
  await expect(tool(page).locator("[data-event*='liverpool']")).toHaveCount(0);
  await tool(page).locator("[data-distance='50']").click();
  await expect(tool(page).locator("[data-event*='liverpool']").first()).toBeVisible();
  await tool(page).locator("[data-distance='25']").click();

  // Star one from the list.
  await tool(page).locator("[data-list] [data-event]").first().locator("[data-star]").click();

  await tool(page).locator("[data-view='month']").click();
  await expect(page.locator("[data-month-view]")).toBeVisible();
  const busy = page.locator("[data-month-view] [data-day]:not([disabled])").filter({ has: page.locator(".size-1\\.5") });
  await busy.first().click();
  const panel = page.locator("[data-day-panel]");
  await expect(panel.locator("[data-event]").first()).toBeVisible();
  // Star a second (unstarred) one from the day panel: step through days until one has it.
  const unstarred = page.locator("[data-day-panel] [data-star][aria-pressed='false']");
  for (let i = 1; (await unstarred.count()) === 0 && i < (await busy.count()); i++) await busy.nth(i).click();
  await unstarred.first().click();

  const mine = page.locator("[data-my-events-panel]");
  await expect(mine).toContainText("My events (2)");
  await mine.locator("summary").click();
  await expect(mine.locator("[data-starred]")).toHaveCount(2);
  await mine.locator("[data-reminder='4']").click();
  const dl = page.waitForEvent("download");
  await mine.locator("[data-add-all]").click();
  const file = readFileSync(await (await dl).path(), "utf8");
  expect(file).toContain("BEGIN:VCALENDAR");
  expect(file.match(/BEGIN:VEVENT/g)?.length).toBe(2);
  expect(file).toContain("DTSTART;VALUE=DATE:");
  expect(file).toContain("TRIGGER:-P28D");
  expect(file).toContain("\r\n");

  // Starred events stay on this device.
  for (const r of seen) {
    expect(r.body).not.toContain("sample-");
    expect(r.url).not.toContain("starred");
  }
});

test("keyboard: arrow keys move between days in the month grid", async ({ page }) => {
  await open(page, `${PATH}/manchester`);
  await tool(page).locator("[data-view='month']").click();
  const focused = page.locator("[data-month-view] [data-day][tabindex='0']");
  const first = await focused.getAttribute("data-day");
  await focused.focus();
  await expect(focused).toBeFocused();
  await page.keyboard.press("ArrowRight");
  // Focus moves on the next animation frame.
  await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute("data-day"))).not.toBe(first);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toMatch(/^\d+ \w+, (no events|\d+ events?)/);
});

test.describe("use my location: allowed", () => {
  test.use({ geolocation: COORDS, permissions: ["geolocation"] });
  test("picks the nearest covered city and sends no coordinates", async ({ page }) => {
    const seen = watch(page);
    await open(page);
    await tool(page).locator("[data-locate]").click();
    await expect(tool(page).locator("[data-locate]")).toContainText("Near Manchester");
    await expect(tool(page).locator("[data-summary]")).toContainText("near your location");
    for (const r of seen) {
      expect(r.url + r.body).not.toContain("53.47");
      expect(r.url + r.body).not.toContain("2.239");
    }
  });
});

test.describe("use my location: denied", () => {
  test.use({ permissions: [] });
  test("shows a friendly message and the picker still works", async ({ page, context }) => {
    await context.clearPermissions();
    await open(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "geolocation", {
        value: { getCurrentPosition: (_ok: unknown, err: (e: { code: number }) => void) => err({ code: 1 }) },
      });
    });
    await tool(page).locator("[data-locate]").click();
    await expect(tool(page).locator("[data-town-message]")).toContainText("We couldn’t get your location. Type your town instead.");
    await town(page).fill("Edinburgh");
    await town(page).press("Enter");
    await expect(tool(page).locator("[data-summary]")).toContainText("near Edinburgh");
  });
});

test("an unknown town gets a friendly message and an 'ask us to add' link", async ({ page }) => {
  await open(page);
  await town(page).fill("Zzyzx");
  await town(page).press("Enter");
  await expect(tool(page).locator("[data-town-message]")).toContainText("We couldn’t find “Zzyzx”");
  await tool(page).locator("[data-ask-add]").click();
  await expect(page.locator("#suggest input").nth(2)).toHaveValue("Zzyzx");
});

test("a city page is preset to its city and its events are in the HTML", async ({ page, request }) => {
  const html = await (await request.get(`${PATH}/manchester`)).text();
  expect(html).toContain("Events coming up in");
  expect(html).toMatch(/data-event="sample-\d+-manchester"/);
  expect(html).toContain("How it works");
  await open(page, `${PATH}/manchester`);
  await expect(town(page)).toHaveValue("Manchester");
  await expect(tool(page).locator("[data-summary]")).toContainText("near Manchester");
  // Scottish and Welsh city pages link to the visitor levy calculator.
  await page.goto(`${PATH}/edinburgh`);
  await expect(page.locator("[data-levy-link]")).toBeVisible();
});

test("filters: category chips show counts and combine with high demand only", async ({ page }) => {
  await open(page, `${PATH}/london`);
  const sport = tool(page).locator("[data-category='sport']");
  const n = Number(await sport.locator("span").innerText());
  await sport.click();
  await expect(tool(page).locator("[data-list] [data-event]")).toHaveCount(n);
  await tool(page).locator("[data-high-only]").click();
  const highs = await tool(page).locator("[data-list] [data-demand='high']").count();
  await expect(tool(page).locator("[data-list] [data-event]")).toHaveCount(highs);
  await tool(page).locator("[data-clear-filters]").click();
  await expect(tool(page).locator("[data-clear-filters]")).toHaveCount(0);
});

test("suggest an event: server checks the https link, then thanks the host", async ({ page }) => {
  await open(page);
  const f = page.locator("[data-suggest-form]");
  await f.getByLabel("Event name").fill("SAMPLE test suggestion");
  await f.getByLabel("Date (or month, if not confirmed)").fill("March 2027");
  await f.getByLabel("Town or city").fill("Leeds");
  await f.getByLabel("Link to the official event page").fill("https://example.com/sample-suggestion");
  await f.getByRole("button", { name: "Send suggestion" }).click();
  // Repeated local runs can hit the rate limit (5 an hour): that's the server protection working.
  await expect(page.locator("[data-suggest-sent], [data-suggest-form] [role=alert]")).toHaveText(/^(Thanks! We’ll check it and add it if it fits\.|Too many suggestions from here\. Try again in an hour\.)$/);
});

test.describe("phone (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("no sideways scroll, filters wrap or scroll, day panel is a bottom sheet, 44px targets", async ({ page }) => {
    await open(page, `${PATH}/manchester`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const small = await tool(page)
      .locator("button:visible, a.btn:visible")
      .evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent?.trim()));
    expect(small).toEqual([]);
    await tool(page).locator("[data-view='month']").click();
    await expect(page.locator("[data-day-panel]")).toBeHidden();
    await page.locator("[data-month-view] [data-day]:not([disabled])").first().click();
    const sheet = page.locator("[data-day-panel][data-sheet='open']");
    await expect(sheet).toBeVisible();
    const box = await sheet.boundingBox();
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBeGreaterThanOrEqual(840);
    await sheet.locator("[data-sheet-close]").click();
    await expect(page.locator("[data-day-panel]")).toBeHidden();
  });
});

test("live: 6th in Get more bookings; linked from Pricing optimisation, Who we help, the footer and the sitemap", async ({ page, request }) => {
  await page.goto("/free-tools?job=get-more-bookings");
  const card = page.locator("#uk-event-calendar");
  await expect(card).toHaveAttribute("href", PATH);
  await expect(card).not.toContainText("Coming soon");
  // The ?job filter applies just after load: wait for the filtered list.
  await expect.poll(async () => (await page.locator("#all [id] p.font-extrabold").allTextContents())[5]).toBe("UK event calendar");
  await expect(page.locator(`footer a[href="${PATH}"]`)).toBeVisible();
  await page.goto("/services/pricing-optimisation");
  await expect(page.locator("[data-event-calendar-link] a")).toHaveAttribute("href", PATH);
  await page.goto("/who-we-help");
  for (const tab of ["tab-holiday", "tab-london"]) {
    await page.locator(`#${tab}`).click();
    await expect(page.locator(`#persona-panel a[href="${PATH}"]`)).toBeVisible();
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`${PATH}</loc>`);
  const html = await (await request.get(PATH)).text();
  expect(html).not.toMatch(/<meta name="robots" content="noindex/);
});
