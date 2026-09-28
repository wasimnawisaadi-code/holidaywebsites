/**
 * End-to-end test against a real Supabase project, through the real admin UI.
 *
 * Unlike verify-portal.mjs this writes data: it signs in, creates a trip, moves
 * its progress, publishes it, and then opens the customer link to check that
 * what the office did is what the customer sees. It is the only check that
 * exercises the whole loop — auth, the service-role write path, token minting,
 * the customer read path and the draft/publish gate — in one pass.
 *
 * The trip it creates is named "DEMO — …" so nobody mistakes it for a real
 * customer. Delete it from the admin, or in SQL:
 *     delete from trips where trip_code in (select trip_code from trip_overview
 *       where customer_name like 'DEMO%');
 *
 * Needs the portal's env exported and a preview running:
 *     set -a; . ./.env.local; set +a
 *     npx vite preview --port 4201 &
 *     node scripts/e2e-live.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PORTAL_BASE_URL || "http://localhost:4201";
const EMAIL = (process.env.TRIP_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "")
  .split(",")[0]
  ?.trim();
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Export TRIP_ADMIN_EMAILS and ADMIN_PASSWORD first (see header).");
  process.exit(2);
}

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("  [page error]", e.message));

// ---- 1. sign in -----------------------------------------------------------
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.fill("#admin-email", EMAIL);
await page.fill("#admin-password", PASSWORD);
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("button", { name: "+ New trip" }).waitFor({ timeout: 20000 });
check("admin sign-in succeeds with an allowlisted address", true);

// ---- 2. create a trip -----------------------------------------------------
const customer = `DEMO — Ahmed Mohammed ${Date.now().toString().slice(-4)}`;
await page.getByRole("button", { name: "+ New trip" }).click();
await page.fill('input[name="customerName"]', customer);
await page.fill('input[name="phone"]', "+971500000000");
await page.fill('input[name="destination"]', "Dubai + Abu Dhabi");
await page.fill('input[name="title"]', "Five nights in the UAE");
await page.fill('input[name="startDate"]', "2026-09-28");
await page.fill('input[name="endDate"]', "2026-10-03");
await page.getByRole("button", { name: "Create trip & generate link" }).click();

const created = page.getByText(/Trip NST-\d{6}-\d{3} created/);
await created.waitFor({ timeout: 20000 });
const code = (await created.innerText()).match(/NST-\d{6}-\d{3}/)?.[0] ?? "";
check("trip is created with an NST- reference", /^NST-260928-\d{3}$/.test(code), code);
await page.getByRole("button", { name: "Done" }).click();

// ---- 3. find it in the list and read its link -----------------------------
const row = page.locator("article", { hasText: customer });
await row.waitFor({ timeout: 20000 });
check("new trip appears in the dashboard list", (await row.count()) === 1);
check("new trip starts as a draft", (await row.innerText()).toLowerCase().includes("draft"));

await row.getByRole("button", { name: "Link & progress" }).click();
const link = await row.locator("input[readonly]").inputValue();
const token = link.split("/t/")[1] ?? "";
check(
  "link carries a 48-character hex token",
  /^[0-9a-f]{48}$/.test(token),
  `${token.slice(0, 8)}…`,
);
check("link does NOT contain the guessable trip code", !link.includes(code));

// ---- 4. the draft gate: unpublished means invisible -----------------------
const probe = await ctx.newPage();
await probe.goto(link, { waitUntil: "domcontentloaded" });
const draftBody = (await probe.locator("body").innerText()).toLowerCase();
check(
  "an UNPUBLISHED trip's link shows 'can't find this trip'",
  draftBody.includes("find this trip"),
);
await probe.close();

// ---- 5. move progress -----------------------------------------------------
await row.getByLabel("Progress stage").selectOption("driver_on_the_way");
const note = "Ahmed is 10 minutes away, silver Toyota Hiace.";
await row.getByPlaceholder(/Note for the customer/).fill(note);
await row.getByRole("button", { name: "Save update" }).click();
// Wait for the outcome, not for a guessed duration. A fixed pause was how an
// earlier version of these tests went green or red depending on how fast the
// database region answered that minute.
const rowAgain = page.locator("article", { hasText: customer });
await rowAgain.getByText(/Driver on the way · \d+%/).waitFor({ timeout: 45000 });

// ---- 6. publish -----------------------------------------------------------
if (!(await rowAgain.getByRole("button", { name: "Publish to customer" }).isVisible())) {
  await rowAgain.getByRole("button", { name: "Link & progress" }).click();
}
await rowAgain.getByRole("button", { name: "Publish to customer" }).click();
await rowAgain.getByRole("button", { name: "Unpublish" }).waitFor({ timeout: 45000 });

// ---- 7. the customer's view -----------------------------------------------
const cust = await browser.newContext({ viewport: { width: 390, height: 844 } });
const phone = await cust.newPage();
phone.on("pageerror", (e) => console.log("  [customer page error]", e.message));
await phone.goto(link, { waitUntil: "networkidle" });
const custBody = await phone.locator("body").innerText();

check("customer link renders after publishing", !custBody.toLowerCase().includes("find this trip"));
check("customer sees the trip title", custBody.includes("Five nights in the UAE"));
check("customer sees their trip code", custBody.includes(code));
check("customer sees 'prepared for' their name", custBody.includes(customer));
check(
  "customer sees the live status in plain words",
  custBody.includes("Your driver is on the way"),
);
check("customer sees the office's note", custBody.includes(note));
check(
  "progress bar reflects the stage",
  /\b3\d%/.test(custBody),
  custBody.match(/\b\d{1,3}%/)?.[0],
);
check(
  "customer is told the office can see page opens",
  custBody.toLowerCase().includes("can see when this page is opened"),
);

await phone.screenshot({ path: "scripts/__e2e-customer.png", fullPage: true });

// ---- 8. analytics: the open was recorded ----------------------------------
await page.reload({ waitUntil: "networkidle" });
const rowFinal = await page.locator("article", { hasText: customer }).innerText();
check("dashboard records that the customer opened the link", /Opened \d+×/.test(rowFinal));

console.log(`\nTRIP_CODE=${code}`);
console.log(`TOKEN=${token}`);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
