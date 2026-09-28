/**
 * Smoke test for the trip portal, in a real browser.
 *
 * Checks the things that must hold before any customer data exists — routing,
 * the token guard, and above all that no server-side secret reaches the client.
 * The last one is the check worth having: a leaked service-role key exposes
 * every customer's documents, and nothing about it is visible by looking at the
 * page.
 *
 *   npx vite build && npx vite preview --port 4200
 *   node scripts/verify-portal.mjs
 */
import { chromium } from "playwright";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://localhost:4200";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

// ---- static analysis of the client bundle, before opening a browser --------
const clientDir = ".output/public/assets";
if (existsSync(clientDir)) {
  const files = readdirSync(clientDir).filter((f) => f.endsWith(".js"));
  const joined = files.map((f) => readFileSync(join(clientDir, f), "utf8")).join("\n");
  check(`client bundle present (${files.length} files)`, files.length > 0);
  check("no service-role key in client bundle", !/SERVICE_ROLE|service_role/.test(joined));
  check("no server-only module in client bundle", !/server-only/.test(joined));
  check("no PostgREST query in client bundle", !/rest\/v1|tracking_token=eq/.test(joined));
  check("no admin password reference in client bundle", !/ADMIN_PASSWORD/.test(joined));
} else {
  check("client bundle present", false, `${clientDir} not found — run vite build first`);
}

const browser = await chromium.launch();
const page = await browser.newPage();

// ---- landing ---------------------------------------------------------------
const landing = await page.goto(BASE, { waitUntil: "domcontentloaded" });
check("landing page responds 200", landing?.status() === 200);
check(
  "landing offers no trip lookup",
  (await page.locator('input[type="search"], input[name*="code" i]').count()) === 0,
  "a lookup box would let someone guess trip codes",
);
check(
  "landing is marked noindex",
  (await page.locator('meta[name="robots"][content*="noindex"]').count()) > 0,
);

// ---- the token guard -------------------------------------------------------
// Below the 32-character minimum, so it is refused without a database round
// trip. The page must be the generic not-found, revealing nothing.
await page.goto(`${BASE}/t/short-token-123`, { waitUntil: "domcontentloaded" });
const body = (await page.locator("body").innerText()).toLowerCase();
check(
  "a too-short token renders the not-found page",
  body.includes("can't find this trip") || body.includes("can’t find this trip"),
);
check(
  "not-found page leaks no internals",
  !body.includes("supabase") && !body.includes("service") && !body.includes("sql"),
);
check(
  "not-found page offers a way to reach the office",
  body.includes("whatsapp") || body.includes("971"),
);

// ---- admin is gated --------------------------------------------------------
await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
const adminBody = (await page.locator("body").innerText()).toLowerCase();
const hasPassword = (await page.locator('input[type="password"]').count()) > 0;
check("admin shows a sign-in form when unauthenticated", hasPassword);
check("admin shows no trip data when unauthenticated", !adminBody.includes("new trip"));

// ---- the editor is gated too ----------------------------------------------
// A signed-out visit to a trip editor must land on the sign-in form.
//
// This check used to assert only that the editor's text was absent, and it
// passed for the wrong reason: the editor route was accidentally nested inside
// the dashboard, which has no <Outlet />, so the editor never rendered for
// ANYONE — signed in or not. "Editor not visible" was true because the editor
// was broken. Asserting where the visitor actually ends up is what would have
// caught that.
await page.goto(`${BASE}/admin/trips/00000000-0000-0000-0000-000000000000`, {
  waitUntil: "networkidle",
});
const editorBody = (await page.locator("body").innerText()).toLowerCase();
check(
  "signed-out editor visit redirects to the sign-in form",
  new URL(page.url()).pathname === "/admin" &&
    (await page.locator('input[type="password"]').count()) > 0,
  new URL(page.url()).pathname,
);
check(
  "no trip content leaks on that redirect",
  !editorBody.includes("add day") && !editorBody.includes("preview as customer"),
);

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
