import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/house-rules-generator";
const STORAGE_KEY = "vaforbnb:tool:house-rules-generator:v1";
const SECRETS = ["Zebedee", "Quillstone", "bay 77"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

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
    localStorage.removeItem("vaforbnb:handoff:house-rules");
  }, STORAGE_KEY);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const full = (page: Page) => page.locator("[data-full-rules]");
const section = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(`^\\d?✓? ?${name}`) });

test("answer every section by keyboard; the preview updates live", async ({ page }) => {
  const check = watch(page);
  await open(page);
  await page.getByLabel("Property name (optional)").focus();
  await page.keyboard.type("Zebedee Quillstone");
  await expect(full(page)).toContainText("House rules – Zebedee Quillstone");

  // Tone: arrow keys move between the radio chips.
  await page.getByRole("radio", { name: "Friendly" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(full(page)).toContainText("Maximum 4 guests.");
  await page.keyboard.press("ArrowLeft");
  await expect(full(page)).toContainText("The home is for up to four guests.");

  // Open each section with the keyboard (Enter on its header) and answer something.
  const openSection = async (name: string) => {
    await page.getByRole("button", { name: new RegExp(name) }).first().focus();
    await page.keyboard.press("Enter");
  };
  await openSection("Arrival and departure");
  await page.getByLabel("Check-in from").fill("16:00"); // native time field: segments differ by browser
  await expect(full(page)).toContainText("Check-in is from 4pm.");

  await openSection("^\\d?Guests$|^\\d ?Guests|Guests$");
  await page.getByRole("button", { name: "Increase: Maximum guests" }).focus();
  await page.keyboard.press("Enter");
  await expect(full(page)).toContainText("up to five guests");

  await openSection("Pets");
  await page.getByRole("radio", { name: "Pets welcome" }).focus();
  await page.keyboard.press("Space");
  await expect(full(page)).toContainText("Pets are welcome (up to one).");
  await expect(full(page)).toContainText("Assistance dogs are always welcome.");

  await openSection("Noise and parties");
  await expect(page.locator("#hr-panel-4").getByText("Always included:")).toBeVisible();
  await openSection("Smoking");
  await openSection("Parking, rubbish and the home");
  await page.getByLabel("Parking (optional)").focus();
  await page.keyboard.type("Space in bay 77.");
  await expect(full(page)).toContainText("Space in bay 77.");

  await openSection("Cameras and extra rules");
  await page.getByRole("button", { name: "+ Add a rule" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.type("£50 fine for smoking");
  await expect(page.locator('[data-warning="charges"]')).toBeVisible();
  await expect(page.getByText("8 of 8 sections done")).toBeVisible();
  check();
});

test("preview tabs, copy and both PDFs", async ({ page, context }) => {
  const check = watch(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.getByText("You’re looking at example answers.")).toBeVisible();

  await page.getByRole("button", { name: "Copy text" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("ARRIVAL AND DEPARTURE");

  let dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  let file = await dl;
  expect(file.suggestedFilename()).toBe("flat-2-harbour-view-house-rules.pdf");
  expect(readFileSync(await file.path()).subarray(0, 4).toString()).toBe("%PDF");

  await page.getByRole("tab", { name: "Listing version" }).click();
  const listing = await page.locator("[data-listing]").innerText();
  await expect(page.locator("[data-counter]")).toContainText(`${listing.length} / 1000 characters`);
  expect(listing).not.toContain("Check-in is from");

  await page.getByRole("tab", { name: "Platform settings" }).click();
  await expect(page.getByLabel("Pets allowed: No")).toBeVisible();
  await page.getByLabel("Quiet hours: 10pm–8am").first().check();

  await page.getByRole("tab", { name: "Printable sign" }).click();
  await expect(page.locator("[data-sign]")).toContainText("Need help? Message us.");
  dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  file = await dl;
  expect(file.suggestedFilename()).toBe("flat-2-harbour-view-house-rules-sign.pdf");
  expect(readFileSync(await file.path()).subarray(0, 4).toString()).toBe("%PDF");
  check();
});

test("refresh keeps the answers; Clear my answers resets them", async ({ page }) => {
  await open(page);
  await page.getByLabel("Property name (optional)").fill("Quillstone Cottage");
  await expect(full(page)).toContainText("Quillstone Cottage");
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Property name (optional)")).toHaveValue("Quillstone Cottage");
  await page.getByRole("button", { name: "Clear my answers" }).click();
  await page.getByRole("button", { name: "Yes, clear" }).click();
  await expect(page.getByLabel("Property name (optional)")).toHaveValue("");
  await expect(full(page)).not.toContainText("Quillstone");
});

test("checker leaves out an indoor camera rule and keeps the locked rules", async ({ page }) => {
  await open(page);
  await section(page, "Cameras and extra rules").click();
  await page.getByRole("button", { name: "+ Add a rule" }).click();
  await page.getByLabel("Extra rule 1", { exact: true }).fill("Camera in the living room");
  await expect(page.locator('[data-warning="indoor"]')).toContainText("Left out:");
  await expect(full(page)).not.toContainText("living room");
  await page.getByLabel("Extra rule 1", { exact: true }).fill("No dogs at all");
  await expect(page.locator('[data-warning="dogs"]')).toBeVisible();
  await expect(full(page)).toContainText("assistance dogs are always welcome");
  await expect(page.getByRole("radio", { name: /indoor/i })).toHaveCount(0);
});

test("390px: no horizontal scroll; the Preview my rules sheet opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await expect(page.locator("[data-full-rules]")).toBeHidden();
  await page.getByRole("button", { name: "Preview my rules" }).click();
  const sheet = page.getByRole("dialog", { name: "Preview my rules" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("[data-full-rules]")).toContainText("No parties or events");
  await expect(page.getByRole("button", { name: "← Back to questions" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "← Back to questions" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Preview my rules" })).toBeVisible();
});

test("from the kit: badge, and the next card saves the rules for the Welcome guide builder", async ({ page }) => {
  const check = watch(page);
  await open(page, "?kit=new-host");
  await expect(page.getByText("New host kit · step 3")).toBeVisible();
  await page.getByLabel("Property name (optional)").fill("Zebedee Flat");
  await expect(page.getByRole("heading", { name: "Next in your kit: Welcome guide builder" })).toBeVisible();
  await page.getByRole("link", { name: /Save my rules for the welcome guide|Continue to the Welcome guide builder/ }).click();
  await expect(page).toHaveURL(/\/free-tools(\/welcome-guide-builder|#welcome-guide-builder|\?|$)/);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("vaforbnb:handoff:house-rules") ?? "null"));
  expect(saved.kind).toBe("house-rules");
  expect(saved.data.title).toBe("House rules – Zebedee Flat");
  expect(saved.data.sections.map((s: { key: string }) => s.key)).toEqual(["arrival", "guests", "pets", "noise", "smoking", "home", "help"]);
  check();
});

test("hub: live under Stay legal with Text + PDF", async ({ page }) => {
  await page.goto("/free-tools?job=stay-legal");
  const card = page.locator("#house-rules-generator");
  await expect(card).not.toContainText("Coming soon");
  await expect(card).toContainText("Text + PDF");
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));
});
