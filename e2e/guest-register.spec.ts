import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const PATH = "/free-tools/guest-register-template";
const STORAGE_KEY = "vaforbnb:tool:guest-register-template:v1";
/** Guest data used in the tests: none of it may appear in any network request. */
const SECRETS = ["Zebedee", "Quill", "Amélie", "Ambroise", "ZX987654", "Lyon", "Rue Fictive", "French", "France"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

/** Records every request (except the app's own code bundles) for the privacy check. */
function watch(page: Page) {
  const seen: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/static/")) return;
    seen.push(`${r.method()} ${decodeURIComponent(r.url())} ${r.postData() ?? ""}`);
  });
  return () => {
    for (const s of seen) for (const secret of SECRETS) expect(s, `request leaked "${secret}"`).not.toContain(secret);
    expect(seen.filter((s) => s.startsWith("POST") && !s.includes("__nextjs"))).toEqual([]);
  };
}

async function open(page: Page, query = "") {
  await page.goto(PATH + query);
  await page.evaluate((k) => {
    localStorage.removeItem(k);
    localStorage.removeItem(`${k}:meta`);
  }, STORAGE_KEY);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const card = (page: Page, i: number) => page.locator("[data-guest-card]").nth(i);

/** Choose a nationality by typing and pressing Enter (keyboard only). */
async function pickCountry(box: Locator, label: string, typed: string) {
  const input = box.getByRole("combobox", { name: label, exact: true });
  await input.focus();
  await input.pressSequentially(typed);
  await input.press("Enter");
}

async function fillTwoGuests(page: Page) {
  await page.getByRole("button", { name: "Next: guests →" }).click();
  await card(page, 0).getByLabel("Full name").fill("Zebedee Quill");
  await pickCountry(card(page, 0), "Nationality", "Brit");
  await card(page, 1).getByLabel("Full name").fill("Amélie Ambroise");
  await pickCountry(card(page, 1), "Nationality", "Fran");
  await card(page, 1).getByLabel("Passport or ID number").fill("ZX987654");
  await card(page, 1).getByLabel("Next destination", { exact: true }).fill("Lyon");
  await card(page, 1).getByLabel("Next destination address (optional)").fill("1 Rue Fictive");
  await page.getByRole("button", { name: "Next: review →" }).click();
}

test("2-guest stay by keyboard only; extra fields only for the French guest", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await page.locator("#stay-reference").focus();
  await page.keyboard.type("HMTEST123");
  await page.getByRole("button", { name: "Next: guests →" }).focus();
  await page.keyboard.press("Enter");

  await card(page, 0).getByLabel("Full name").focus();
  await page.keyboard.type("Zebedee Quill");
  await page.keyboard.press("Tab"); // nationality
  await page.keyboard.type("Brit");
  await page.keyboard.press("Enter");
  await expect(card(page, 0)).toContainText("No extra details needed");
  await expect(card(page, 0).getByLabel("Passport or ID number")).toHaveCount(0);

  await card(page, 1).getByLabel("Full name").focus();
  await page.keyboard.type("Amélie Ambroise");
  await page.keyboard.press("Tab");
  await page.keyboard.type("fr");
  await page.keyboard.press("Enter");
  await expect(card(page, 1)).toContainText("Extra details needed");
  await expect(card(page, 1).getByRole("combobox", { name: "Place of issue" })).toHaveValue("France"); // prefilled
  await card(page, 1).getByLabel("Passport or ID number").focus();
  await page.keyboard.type("ZX987654");
  await card(page, 1).getByLabel("Next destination", { exact: true }).focus();
  await page.keyboard.type("Lyon");

  // Next lists nothing missing now; first check validation by clearing the name.
  await card(page, 0).getByLabel("Full name").fill("");
  await page.getByRole("button", { name: "Next: review →" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "1 thing to fix" })).toBeVisible();
  await expect(card(page, 0).getByLabel("Full name")).toBeFocused();
  await page.keyboard.type("Zebedee Quill");
  await page.getByRole("button", { name: "Next: review →" }).focus();
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "Save to my register" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Saved: 2 guests, arriving/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your register/ })).toBeVisible();
  check();
});

test("draft is restored after closing and reopening the page", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await page.locator("#stay-reference").fill("HMDRAFT");
  await page.getByRole("button", { name: "Next: guests →" }).click();
  await card(page, 0).getByLabel("Full name").fill("Zebedee Quill");
  await expect(page.getByText("Draft saved")).toBeVisible();
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(card(page, 0).getByLabel("Full name")).toHaveValue("Zebedee Quill");
  check();
});

test("save, search by name, edit and save again", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await page.locator("#stay-reference").fill("HMSEARCH");
  await fillTwoGuests(page);
  await page.getByRole("button", { name: "Save to my register" }).click();
  await page.getByLabel("Search by guest name or reference").fill("ambroise");
  const row = page.getByRole("button", { name: /Open stay arriving/ });
  await expect(row).toHaveCount(1);
  await row.click();
  await expect(page.getByRole("heading", { name: "Edit stay: Review and save" })).toBeVisible();
  await page.getByRole("button", { name: "Edit Zebedee Quill" }).click();
  await card(page, 0).getByLabel("Full name").fill("Zebedee Quill-Smith");
  await page.getByRole("button", { name: "Next: review →" }).click();
  await page.getByRole("button", { name: "Save to my register" }).click();
  await expect(page.getByText(/Updated: 2 guests/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your register \(1 stay\)/ })).toBeVisible();
  check();
});

test("register CSV and printable register", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await page.locator("#stay-reference").fill("HMCSV");
  await fillTwoGuests(page);
  await page.getByRole("button", { name: "Save to my register" }).click();

  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download register \(CSV\)/ }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toMatch(/^guest-register-all-properties-\d{4}-\d{2}-\d{2}\.csv$/);
  const csv = readFileSync(await file.path(), "utf8");
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  const lines = csv.slice(1).trimEnd().split("\r\n");
  expect(lines[0]).toBe(
    "Booking reference,Property,Platform,Arrival date,Departure date,Full name,Nationality,Second nationality,Passport or ID number,Place of issue,Next destination,Next destination address,Recorded on",
  );
  expect(lines).toHaveLength(3);
  expect(lines[2]).toContain("Amélie Ambroise,France,,ZX987654,France,Lyon,1 Rue Fictive");

  await page.getByRole("button", { name: "Print register" }).click();
  await expect.poll(async () => (await Promise.all(page.frames().map((f) => f.content().catch(() => "")))).some((c) => c.includes("Amélie Ambroise") && c.includes("Guest register"))).toBe(true);
  check();
});

test("templates: blank register (CSV and printable) and check-in card", async ({ page }) => {
  const check = watch(page);
  await open(page, "?tab=templates");
  await expect(page.getByRole("tab", { name: "Download a template" })).toHaveAttribute("aria-selected", "true");

  let dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download spreadsheet" }).click();
  const csv = readFileSync(await (await dl).path(), "utf8");
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  expect(csv).toContain("Booking reference,Property,Platform");

  await page.getByRole("radio", { name: "Printable (A4)" }).check();
  await page.getByLabel("Property name for the header (optional)").fill("Flat 2");
  dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download register" }).click();
  const html = readFileSync(await (await dl).path(), "utf8");
  expect(html).toContain("Guest register – Flat 2");
  expect((html.match(/<tr>/g) ?? []).length).toBe(16); // header + 15 rows

  dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download check-in card" }).click();
  const cardHtml = readFileSync(await (await dl).path(), "utf8");
  expect(cardHtml).toContain("Only if you’re not a British, Irish or Commonwealth citizen");
  check();
});

test("copy the guest message", async ({ page, context }) => {
  const check = watch(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "?tab=message");
  await page.getByLabel("Guest’s name (optional)").fill("Alex");
  await page.getByLabel("Property name (optional)").fill("Flat 2");
  await page.getByRole("radio", { name: "Email" }).check();
  await expect(page.locator("[data-message]")).toContainText("Subject: Guest details for your stay at Flat 2");
  await page.getByRole("button", { name: "Copy message" }).click();
  await expect(page.getByRole("button", { name: "Message copied" })).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("Hi Alex, we’re looking forward to your stay at Flat 2!");
  expect(text.toLowerCase()).not.toContain("photo");
  check();
});

test("390px: no horizontal scroll, full-width inputs, step buttons in thumb reach", async ({ page }) => {
  const check = watch(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Next: guests →" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  const input = await card(page, 1).getByLabel("Full name").boundingBox();
  const box = await card(page, 1).boundingBox();
  expect(input!.width).toBeGreaterThanOrEqual(box!.width - 40); // full width inside its card
  await card(page, 1).getByLabel("Passport or ID number").scrollIntoViewIfNeeded();
  const next = await page.getByRole("button", { name: "Next: review →" }).boundingBox();
  expect(next!.y + next!.height).toBeLessThanOrEqual(844);
  expect(next!.height).toBeGreaterThanOrEqual(44);
  check();
});

test("passcode lock: locked after reload, wrong passcode rejected, right one opens", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await fillTwoGuests(page);
  await page.getByRole("button", { name: "Save to my register" }).click();
  await page.getByRole("button", { name: /Privacy and settings/ }).click();
  await page.getByRole("button", { name: "Lock my register" }).click();
  await page.getByLabel("New passcode").fill("hunter22");
  await page.getByLabel("Type it again").fill("hunter22");
  await page.getByRole("button", { name: "Lock my register" }).click();
  await expect(page.getByText("Passcode set.")).toBeVisible();
  const raw = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  expect(raw).not.toContain("Zebedee");
  expect(raw).not.toContain("ZX987654");

  await page.reload();
  await expect(page.getByRole("heading", { name: /Your register is locked/ })).toBeVisible();
  await page.getByLabel("Passcode").fill("wrong-one");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByText("That passcode doesn’t match")).toBeVisible();
  await page.getByLabel("Passcode").fill("hunter22");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByRole("heading", { name: /Your register \(1 stay\)/ })).toBeVisible();
  check();
});

test("hub: live under Stay legal, card opens the tool", async ({ page }) => {
  await page.goto("/free-tools?job=stay-legal");
  const c = page.locator("#guest-register-builder");
  await expect(c).not.toContainText("Coming soon");
  await expect(c).toContainText("Spreadsheet + printable");
  await c.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));
});

test("Rules Hub and Guest communication page link to the tool", async ({ page }) => {
  await page.goto("/uk-short-let-rules#guest-register");
  await expect(page.getByRole("link", { name: /Make my guest register/ }).first()).toBeVisible();
  await page.goto("/services/guest-communication");
  await expect(page.locator(`a[href="${PATH}"]`).first()).toBeAttached();
});

test("Try an example shows a labelled sample register, and Clear example removes it", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.getByText("You’re looking at example data, not real guests.")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your register \(3 stays\)/ })).toBeVisible();
  await expect(page.locator("#your-register").getByText("Example", { exact: true })).toHaveCount(3);
  await expect(page.getByText(/1 stay is past the 12-month retention period/)).toBeVisible();
  await expect(page.locator("#stay-reference")).toHaveValue("HMEXAMPLE1");
  await page.getByRole("button", { name: "Clear example" }).click();
  await expect(page.getByRole("heading", { name: /Your register/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try an example" })).toBeVisible();
  check();
});
