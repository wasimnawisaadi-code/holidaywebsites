/**
 * End-to-end test against a real Supabase project, through the real admin UI.
 *
 * Unlike verify-portal.mjs this writes data: it signs in, creates a trip,
 * publishes it, and then opens the customer link to check that
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
const SB = process.env.SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

await row.getByRole("button", { name: "Share link" }).click();
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

const rowAgain = page.locator("article", { hasText: customer });

// ---- 6. publish -----------------------------------------------------------
if (!(await rowAgain.getByRole("button", { name: "Publish to customer" }).isVisible())) {
  await rowAgain.getByRole("button", { name: "Share link" }).click();
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
// Where the trip stands is worked out from its dates (28 Sep – 3 Oct), never
// posted by the office — so the expected words depend on today in Dubai.
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
const expected =
  today < "2026-09-28"
    ? /Your trip starts (tomorrow|in \d+ days)/
    : today > "2026-10-03"
      ? /Thank you for travelling with Nawi Saadi/
      : new RegExp(
          `Day ${Math.round((Date.parse(today) - Date.parse("2026-09-28")) / 86_400_000) + 1} of 6`,
        );
check("customer sees where the trip stands, from its dates", expected.test(custBody));
check(
  "no percentage or progress stages are shown",
  !/\d+\s*%/.test(custBody) && !/live status|complete\b/i.test(custBody),
  custBody.match(/\d+\s*%/)?.[0],
);
check(
  "the customer is not told they are being watched",
  !custBody.toLowerCase().includes("can see when this page is opened"),
);

await phone.screenshot({ path: "scripts/__e2e-customer.png", fullPage: true });

// ---- 8. nothing about the customer is recorded -----------------------------
await page.reload({ waitUntil: "networkidle" });
const rowFinal = await page.locator("article", { hasText: customer }).innerText();
check(
  "the dashboard shows no open count, just that the link is live",
  !/Opened \d+×|Never opened/.test(rowFinal) && rowFinal.includes("Link is live"),
);
const rest = (path) =>
  fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } }).then(
    (r) => r.json(),
  );
const [tripRow] = await rest(`trips?trip_code=eq.${code}&select=id`);
const views = tripRow ? await rest(`trip_views?trip_id=eq.${tripRow.id}&select=id`) : null;
check("opening the link records nothing", Array.isArray(views) && views.length === 0);

console.log(`\nTRIP_CODE=${code}`);
console.log(`TOKEN=${token}`);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
