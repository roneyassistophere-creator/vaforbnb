import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/london-90-night-counter";
const STORAGE_KEY = "vaforbnb:tool:london-90-night-counter:v1";
const YEAR = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric" }).format(new Date()));
const d = (m: number, day: number) => `${YEAR}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

async function open(page: Page) {
  await page.goto(PATH);
  await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const form = (page: Page) => page.getByRole("form", { name: /Add a booking|Edit booking/ });
const result = (page: Page) => page.locator("[data-result-panel]");

async function addBooking(page: Page, checkIn: string, checkOut: string, platform: string, reference = "") {
  const f = form(page);
  await f.getByLabel("Check-in date").fill(checkIn);
  await f.getByLabel("Check-out date").fill(checkOut);
  await f.getByLabel(platform, { exact: true }).check();
  if (reference) await f.getByLabel("Reference or guest name (optional)").fill(reference);
  await f.getByRole("button", { name: "Add booking" }).click();
}

test("adds three bookings with the keyboard only; totals update after each", async ({ page }) => {
  await open(page);
  // Dates are set with fill(): typing into Chrome's native date field from a test
  // depends on its internal day/month/year segments. Everything else is keys only.
  const tabUntil = async (label: string) => {
    for (let k = 0; k < 8; k++) {
      await page.keyboard.press("Tab");
      if (await page.evaluate((l) => (document.activeElement as HTMLElement | null)?.closest("label")?.textContent?.startsWith(l) ?? false, label)) return;
    }
    throw new Error(`Couldn't tab to ${label}`);
  };
  const entries: [string, string, number][] = [
    [d(3, 1), d(3, 5), 4],
    [d(4, 10), d(4, 13), 7],
    [d(6, 1), d(6, 8), 14],
  ];
  for (const [i, [cin, cout, total]] of entries.entries()) {
    await form(page).getByLabel("Check-in date").fill(cin);
    await form(page).getByLabel("Check-out date").fill(cout);
    await form(page).getByLabel("Check-out date").focus();
    await tabUntil("Nights"); // nights (filled itself)
    await expect(form(page).getByLabel("Nights")).toHaveValue(String(entries[i][2] - (i ? entries[i - 1][2] : 0)));
    await page.keyboard.press("Tab"); // platform group
    if (i === 0) await page.keyboard.press("Space"); // first radio: Airbnb (kept for the next booking)
    await page.keyboard.press("Tab"); // reference
    await page.keyboard.press("Tab"); // note (last field)
    await page.keyboard.press("Enter"); // Enter in the last field adds the booking
    await expect(result(page)).toContainText(`${total} of 90 nights`);
  }
  await expect(page.getByText(/Added: 7 nights \(1–8 Jun\) on Airbnb/)).toBeVisible();
});

test("edit a booking, then delete it and undo", async ({ page }) => {
  await open(page);
  await addBooking(page, d(5, 12), d(5, 16), "Airbnb", "Guest A");
  await expect(result(page)).toContainText("4 of 90 nights");
  await page.getByRole("button", { name: /^Edit booking 12–16 May/ }).click();
  await expect(form(page).getByLabel("Check-in date")).toHaveValue(d(5, 12));
  await form(page).getByLabel("Nights").fill("6");
  await expect(form(page).getByLabel("Check-out date")).toHaveValue(d(5, 18));
  await form(page).getByRole("button", { name: "Save changes" }).click();
  await expect(result(page)).toContainText("6 of 90 nights");

  await page.getByRole("button", { name: /^Delete booking 12–18 May/ }).click();
  await expect(result(page)).toContainText("0 of 90 nights");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(result(page)).toContainText("6 of 90 nights");
});

test("validation: check-out before check-in, and duplicate warning", async ({ page }) => {
  await open(page);
  await addBooking(page, d(5, 12), d(5, 12), "Airbnb");
  await expect(page.getByText("Check-out must be after check-in.")).toBeVisible();
  await addBooking(page, d(5, 12), d(5, 15), "Airbnb");
  await addBooking(page, d(5, 12), d(5, 15), "Airbnb");
  await expect(page.getByText("This looks like a booking you’ve already added.")).toBeVisible();
  await form(page).getByRole("button", { name: "Cancel" }).click();
  await expect(result(page)).toContainText("3 of 90 nights");
});

test("refresh keeps bookings; Clear all my data empties them", async ({ page }) => {
  await open(page);
  await addBooking(page, d(2, 1), d(2, 4), "Booking.com");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(result(page)).toContainText("3 of 90 nights");
  await page.getByRole("button", { name: "Clear all my data" }).click();
  await page.getByRole("button", { name: "Yes, delete everything" }).click();
  await expect(result(page)).toContainText("0 of 90 nights");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(result(page)).toContainText("0 of 90 nights");
});

test("example data shows the overlap and long stay flags", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.getByText("You’re looking at example data, not your bookings.")).toBeVisible();
  await expect(page.getByText(/Overlaps with .* on 15 May/).first()).toBeVisible();
  await expect(page.getByText("Long stay: not counted").first()).toBeVisible();
  await expect(result(page)).toContainText("1 overlap");
  await page.getByRole("button", { name: "Clear example" }).click();
  await expect(result(page)).toContainText("0 of 90 nights");
});

test("download CSV and back up, then restore from backup", async ({ page }) => {
  await open(page);
  await addBooking(page, d(3, 1), d(3, 5), "Airbnb", "Guest A");
  await addBooking(page, d(3, 4), d(3, 7), "Direct", "Guest B");

  const csvDl = page.waitForEvent("download");
  await result(page).getByRole("button", { name: "Download CSV" }).click();
  const csv = readFileSync(await (await csvDl).path(), "utf8");
  expect(csv).toContain(`Nights counted in ${YEAR}`);
  expect(csv).toContain(`${d(3, 1)},${d(3, 5)},Airbnb,Guest A`);
  expect(csv).toContain("Total counted,6");

  const bDl = page.waitForEvent("download");
  await result(page).getByRole("button", { name: "Back up my data" }).click();
  const backupPath = await (await bDl).path();

  await page.getByRole("button", { name: "Clear all my data" }).click();
  await page.getByRole("button", { name: "Yes, delete everything" }).click();
  await expect(result(page)).toContainText("0 of 90 nights");

  await page.locator('input[type="file"][accept^=".json"]').setInputFiles(backupPath);
  await page.getByRole("button", { name: "Yes, restore" }).click();
  await expect(result(page)).toContainText("6 of 90 nights");
  await expect(page.getByText("Guest A")).toBeVisible();
  await expect(page.getByText("Guest B")).toBeVisible();
});

test("CSV import previews rows, skips bad ones, adds on confirm", async ({ page }) => {
  await open(page);
  const csv = `Check-in,Check-out,Platform,Reference\n${d(7, 1)},${d(7, 4)},Airbnb,R1\nnot-a-date,${d(7, 9)},Direct,R2\n`;
  await page.locator('input[type="file"][accept^=".csv"]').setInputFiles({ name: "bookings.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  const preview = page.getByRole("region", { name: "Import preview" });
  await expect(preview).toContainText("Couldn’t read the dates");
  await preview.getByRole("button", { name: "Add 1 booking" }).click();
  await expect(result(page)).toContainText("3 of 90 nights");
});

test("390px: no horizontal scroll, result first, calendar fits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  const panel = await result(page).boundingBox();
  const formBox = await form(page).boundingBox();
  expect(panel!.y).toBeLessThan(formBox!.y);
  const cal = page.getByRole("group", { name: new RegExp(`${YEAR} calendar`) });
  await expect(cal).toBeVisible();
  const calBox = await cal.boundingBox();
  expect(calBox!.x + calBox!.width).toBeLessThanOrEqual(390);
});

test("no network request contains booking data", async ({ page }) => {
  await open(page);
  const seen: string[] = [];
  page.on("request", (r) => {
    if (!r.url().includes("/_next/") && !r.url().includes("__nextjs")) seen.push(`${r.method()} ${r.url()} ${r.postData() ?? ""}`);
  });
  await addBooking(page, d(8, 3), d(8, 9), "Vrbo", "Zebedee Quill");
  await expect(result(page)).toContainText("6 of 90 nights");
  await page.waitForTimeout(500);
  for (const s of seen) {
    expect(s).not.toContain("Zebedee");
    expect(s).not.toContain(d(8, 3));
  }
  expect(seen.filter((s) => s.startsWith("POST"))).toEqual([]);
});

test("hub: live under Stay legal with Result + CSV, card opens the tool", async ({ page }) => {
  await page.goto("/free-tools?job=stay-legal");
  const card = page.locator("#london-90-night-counter");
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("Result + CSV");
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));
});
