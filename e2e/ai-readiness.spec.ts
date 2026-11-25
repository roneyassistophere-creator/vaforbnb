import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/free-tools/airbnb-ai-readiness-score";
const KEYS = ["vaforbnb:tool:airbnb-ai-readiness-score:v1", "vaforbnb:tool:airbnb-ai-readiness-score:history:v1", "vaforbnb:handoff:listing-text", "vaforbnb:handoff:listing-title", "vaforbnb:handoff:audit-prefill"];
const SECRETS = ["Zebedee", "Spacious flat", "Lovely flat", "city centre", "Quillstone"];

test.use({ locale: "en-GB", timezoneId: "Europe/London" });

function watch(page: Page) {
  const seen: { method: string; url: string; body: string }[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_next/static/")) return;
    seen.push({ method: r.method(), url: decodeURIComponent(r.url()), body: r.postData() ?? "" });
  });
  return seen;
}
const noLeaks = (seen: { method: string; url: string; body: string }[]) => {
  for (const s of seen) for (const secret of SECRETS) expect(`${s.url} ${s.body}`, `request leaked "${secret}"`).not.toContain(secret);
};

async function open(page: Page, query = "") {
  await page.goto(PATH + query);
  await page.evaluate((keys) => keys.forEach((k) => localStorage.removeItem(k)), KEYS);
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
}

const step = (page: Page, n: number) => page.locator(`#air-step-btn-${n}`);

async function fillMid(page: Page) {
  await page.getByLabel("Title", { exact: true }).fill("Lovely flat in Leeds");
  await page.getByLabel(/^Listing description/).fill("Spacious flat with WiFi and parking. 10 minutes to the city centre.");
  await step(page, 1).click();
  await page.getByLabel("Town or city (optional)").fill("Leeds");
  await step(page, 3).click();
  await page.getByRole("checkbox", { name: "Wi-Fi", exact: true }).check();
  await page.getByRole("radio", { name: "Free parking" }).check();
  await page.getByRole("switch", { name: "Bed sizes are listed for every bedroom" }).check();
}

test("mid fixture scores 42 with fixes D, B, H; no listing text is sent", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await fillMid(page);
  await page.getByRole("button", { name: "Score my listing" }).click();
  const panel = page.locator("[data-score-panel]");
  await expect(panel).toContainText("42 / 100");
  await expect(panel.locator("[data-band]")).toHaveText("Needs work");
  await expect(page.locator("[data-fix]")).toHaveCount(3);
  expect(await page.locator("[data-fix]").evaluateAll((els) => els.map((e) => e.getAttribute("data-fix")))).toEqual(["D", "B", "H"]);
  await expect(page.locator('[data-fix="D"]')).toContainText("+11 points available");

  // Live update once scored: adding a fact raises B.
  await step(page, 0).click();
  await page.getByLabel(/^Listing description/).fill("Spacious flat with WiFi and parking. 10 minutes to the city centre. Wi-Fi is 300 Mbps.");
  await expect(panel).not.toContainText("42 / 100");
  await expect(panel.locator("[data-change]")).toContainText("since your last score");

  // A bar opens the breakdown at that check.
  await page.locator('[data-check-bar="A"]').click();
  await expect(page.getByRole("tab", { name: "Score breakdown" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-breakdown="A"]')).toContainText("Title is 20 characters (limit 50): +4");
  noLeaks(seen);
  expect(seen.filter((s) => s.method === "POST" && !s.url.includes("__nextjs"))).toEqual([]);
});

test("example, then the improved version: the score rises and history shows both", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.getByText("You’re looking at an example listing (invented), not your own.")).toBeVisible();
  const first = Number((await page.locator("[data-score-panel] svg + div").first().innerText()).split("/")[0]);
  expect(first).toBeLessThan(50);
  await page.getByRole("button", { name: "See the improved version →" }).click();
  await expect(page.locator("[data-score-panel] [data-band]")).toHaveText("AI-ready");
  await expect(page.locator("[data-change]")).toContainText(/^\+\d+ since your last score/);
  await page.getByRole("tab", { name: "History" }).click();
  await expect(page.locator("[data-history] tbody tr")).toHaveCount(2);
});

test("simulator chips and highlighted text", async ({ page }) => {
  const seen = watch(page);
  await open(page);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("tab", { name: "Guest search simulator" }).click();
  await expect(page.locator("[data-illustration]")).toContainText("Illustration");
  await page.locator('[data-sim-chip="quiet-station-desk"]').click();
  await expect(page.locator("[data-sim-verdict]")).toHaveText("No clear evidence for this search.");
  await expect(page.locator('[data-sim-row="workspace"]')).toContainText("Missing. Add:");

  await page.getByLabel("Type what a guest might search").fill("flat with a jacuzzi and parking");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("Not checked: jacuzzi")).toBeVisible();
  await expect(page.locator('[data-sim-row="parking"]')).toHaveAttribute("data-covered", "yes");

  await page.getByRole("tab", { name: "Your text, highlighted" }).click();
  await expect(page.locator("[data-highlight-counts]")).toContainText(/^\d+ vague words · \d+ facts with units/);
  const vague = page.locator('[data-highlighted] [data-mark="vague"]');
  expect(await vague.count()).toBeGreaterThanOrEqual(5);
  await vague.first().click();
  await expect(page.getByText(/give the size \(for example ‘12 m²’\)/).last()).toBeVisible();

  await page.getByRole("button", { name: "See the improved version →" }).click();
  await page.getByRole("tab", { name: "Your text, highlighted" }).click();
  expect(await page.locator('[data-highlighted] [data-mark="unit"], [data-highlighted] [data-mark="phrase"]').count()).toBeGreaterThan(2);
  expect(seen.filter((s) => s.method === "POST" && !s.url.includes("__nextjs"))).toEqual([]);
});

test("refresh keeps the inputs; Clear my data empties them", async ({ page }) => {
  await open(page);
  await page.getByLabel("Title", { exact: true }).fill("Zebedee flat");
  await page.getByLabel(/^Listing description/).fill("A flat with a desk.");
  await page.getByRole("button", { name: "Score my listing" }).click();
  await page.reload();
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Zebedee flat");
  await expect(page.locator("[data-score-panel]")).toContainText("/ 100");
  await page.getByRole("button", { name: "Clear my data" }).click();
  await page.getByRole("button", { name: "Yes, clear" }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("");
  await expect(page.locator("[data-score-panel]")).toContainText("Your score appears here");
  expect(await page.evaluate((k) => localStorage.getItem(k), KEYS[1])).toBe("[]");
});

test("390px: no horizontal scroll, sticky score bar after scoring", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const noScroll = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await noScroll();
  await expect(page.locator("[data-sticky-score]")).toHaveCount(0);
  await page.getByRole("button", { name: "Try an example" }).click();
  await expect(page.locator("[data-sticky-score]")).toBeVisible();
  await expect(page.locator("[data-sticky-score]")).toContainText(/^Score: \d+ · See fixes$/);
  await noScroll();
  for (const t of ["Guest search simulator", "Your text, highlighted", "Score breakdown", "History"]) {
    await page.getByRole("tab", { name: t }).click();
    await noScroll();
  }
});

test("report: only lead fields are sent, and the PDF is made on the device", async ({ page }) => {
  const seen = watch(page);
  await page.route("**/api/leads", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await open(page);
  await fillMid(page);
  await page.getByRole("button", { name: "Score my listing" }).click();
  await page.getByRole("button", { name: "Get the report (PDF)" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/^Email/).fill("host@example.com");
  await dialog.getByLabel("First name (optional)").fill("Sam");
  await dialog.getByRole("checkbox").check();
  const dl = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download the PDF" }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toMatch(/^ai-readiness-report-\d{4}-\d{2}-\d{2}\.pdf$/);
  expect(readFileSync(await file.path()).subarray(0, 4).toString()).toBe("%PDF");
  const posts = seen.filter((s) => s.method === "POST" && s.url.endsWith("/api/leads"));
  expect(posts).toHaveLength(1);
  expect(Object.keys(JSON.parse(posts[0].body)).sort()).toEqual(["consentText", "email", "firstName", "timestamp", "toolSlug", "website"]);
  noLeaks(seen);
});

test("from the kit: badge, and the next card saves the title for the title checker", async ({ page }) => {
  await open(page, "?kit=more-bookings");
  await expect(page.getByText("Get more bookings kit · step 1")).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Quillstone flat");
  await page.getByLabel(/^Listing description/).fill("A flat.");
  await page.getByRole("button", { name: "Score my listing" }).click();
  await expect(page.getByRole("heading", { name: "Next in your kit: Airbnb title checker" })).toBeVisible();
  await page.getByRole("button", { name: "Send to the description builder →" }).click();
  await expect(page.getByText(/Saved on this device/)).toBeVisible();
  await page.getByRole("link", { name: /Save my title for the title checker|Continue to the title checker/ }).click();
  await expect(page).toHaveURL(/\/free-tools(\/airbnb-title-checker|#airbnb-title-checker)/);
  const t = await page.evaluate(() => JSON.parse(localStorage.getItem("vaforbnb:handoff:listing-title") ?? "null"));
  expect(t.data.title).toBe("Quillstone flat");
  const d = await page.evaluate(() => JSON.parse(localStorage.getItem("vaforbnb:handoff:listing-text") ?? "null"));
  expect(d.data.description).toBe("A flat.");
});

test("hub: first in Get more bookings, Coming soon, with the New badge", async ({ page }) => {
  await page.goto("/free-tools?job=get-more-bookings");
  const card = page.locator("#ai-readiness-listing-scorer");
  await expect(card).toContainText("Coming soon");
  await expect(card).toContainText("New");
  await expect(card).toContainText("Score + fixes");
  const names = await page.locator("#all [id] p.font-extrabold").allTextContents();
  expect(names.slice(0, 6)).toEqual(["AI-readiness listing scorer", "Airbnb title checker", "AI-ready description builder", "Photo shot list planner", "Long-stay discount calculator", "UK event calendar"]);
});
