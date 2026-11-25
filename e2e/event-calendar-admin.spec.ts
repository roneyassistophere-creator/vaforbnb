import { execSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import postgres from "postgres";

/**
 * UK event calendar admin area. Creates two local test logins (re-running
 * resets their passwords) and removes the test events afterwards.
 */
try {
  process.loadEnvFile();
} catch {
  // CI: environment already set.
}

const PASSWORD = "e2e-Test-password-1";
const EDITOR = "e2e-editor@example.com";
const ADMIN = "e2e-admin@example.com";
const RUN = Date.now().toString(36);
const NAME = `E2E Leeds arena night ${RUN}`;

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  const env = { ...process.env, ADMIN_PASSWORD: PASSWORD };
  execSync(`npm run -s admin:create -- ${EDITOR} "E2E Editor" editor`, { env, stdio: "pipe" });
  execSync(`npm run -s admin:create -- ${ADMIN} "E2E Admin"`, { env, stdio: "pipe" });
});

test.afterAll(async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await sql`delete from events where name like ${"E2E %"}`;
  await sql.end();
});

async function login(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

let eventUrl = "";

test("editor: create a draft, preview it, mark it checked; publish is hidden", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/events/new");
  await expect(page.locator("[data-publish]:visible")).toHaveCount(0);
  await page.getByLabel("Event name").fill(NAME);
  await page.getByLabel("Category").selectOption("music");
  const start = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
  await page.getByLabel("Start date").fill(start);
  await page.getByLabel("End date").fill(start);
  await page.getByLabel("City").selectOption("leeds");
  await page.getByLabel("Source name").fill("Official arena website");
  await page.getByLabel("Official source link").fill("https://example.com/e2e-arena");
  await page.locator("[data-preview-toggle]").click();
  await expect(page.locator("[data-preview] [data-event]")).toContainText(NAME);
  await page.getByRole("button", { name: "Save as draft" }).click();
  await expect(page).toHaveURL(/\/admin\/events\/[0-9a-f-]{36}$/);
  eventUrl = page.url();
  await page.locator("[data-save-check]:visible").click();
  await expect(page.getByText("Saved and marked as checked.").locator("visible=true")).toBeVisible();
  await expect(page.locator("[data-publish]:visible")).toHaveCount(0);
});

test("admin: publish it and it shows on the public page with no redeploy", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto(eventUrl);
  await page.locator("[data-publish]:visible").click();
  await expect(page.getByText("Published. It’s on the public page now.").locator("visible=true")).toBeVisible();
  await page.goto("/free-tools/uk-event-calendar/leeds");
  await expect(page.locator("[data-tool][data-ready]")).toBeVisible();
  await expect(page.locator("[data-list]").getByText(NAME)).toBeVisible();
});

test("admin: import a 10-row CSV with 2 bad rows: preview errors, then the summary", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/import");
  await page.waitForLoadState("networkidle"); // the file picker works once the page is interactive
  const head = "name,category,startDate,endDate,dateStatus,city,venue,postcode,latitude,longitude,demand,demandReason,shortDescription,sourceTitle,sourceUrl,secondSourceUrl,recurrence,status";
  const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
  const rows = Array.from({ length: 8 }, (_, i) => `E2E import ${RUN} ${i + 1},sport,${day(30 + i * 5)},${day(30 + i * 5)},confirmed,york,,,,,medium,,,Official site,https://example.com/e2e-${i},,none,`);
  rows.push(`E2E import ${RUN} bad date,sport,2027-13-40,,confirmed,york,,,,,medium,,,Official site,https://example.com/x,,none,`);
  rows.push(`E2E import ${RUN} bad source,sport,${day(60)},${day(60)},confirmed,york,,,,,medium,,,Official site,http://example.com/x,,none,`);
  await page.locator("#import-file").setInputFiles({ name: "events.csv", mimeType: "text/csv", buffer: Buffer.from([head, ...rows].join("\n")) });
  await expect(page.locator("[data-import-counts]")).toContainText("8 ready to import, 2 with problems");
  await expect(page.locator("[data-import-row='10']")).toContainText("✗");
  await expect(page.locator("[data-import-row='11']")).toContainText("✗");
  await page.locator("[data-import-confirm]").click();
  await expect(page.locator("[data-import-summary]")).toHaveText("8 imported, 0 updated, 2 skipped.");
});

test("admin: dashboard cards link to the right queues, with coverage progress", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page.locator("[data-tile='Re-check due']")).toBeVisible();
  await expect(page.locator("[data-coverage]")).toContainText("cities ready for launch");
  await page.locator("[data-tile='Expected dates to confirm']").click();
  await expect(page).toHaveURL(/queue=expected/);
  await page.goto("/admin");
  await page.locator("[data-tile='Re-check due']").click();
  await expect(page).toHaveURL(/queue=recheck/);
});

test("signed out: the admin area redirects to the login page", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/admin/events");
  await expect(page).toHaveURL(/\/admin\/login/);
});
