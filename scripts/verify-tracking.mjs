/**
 * Proves the measurement stack actually fires, in a real browser.
 *
 * Every part of Google Ads tracking fails silently by design — a wrong tag id,
 * a label that never got pasted, a dataLayer push in a shape GTM cannot match.
 * None of it errors, none of it warns, and the first sign of trouble is an
 * empty conversions column three weeks into a campaign that has spent real
 * money. So this checks the things that would otherwise only be discovered
 * that way.
 *
 * Run against a preview build:
 *   npx vite preview --port 4173
 *   node scripts/verify-tracking.mjs
 *
 * Or against production:
 *   node scripts/verify-tracking.mjs https://www.nawisaadiholidays.com
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:4173";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage();

// Requests to Google, so we can see what actually left the browser rather
// than trusting what the page says it did.
const beacons = [];
page.on("request", (r) => {
  const url = r.url();
  if (/google-analytics\.com|googletagmanager\.com|googleadservices\.com|google\.com\/(ads\/)?ccm/.test(url)) {
    beacons.push(url);
  }
});

// A landing straight off an ad click, which is the only moment the gclid is
// readable. Nothing downstream works if this is not captured here.
const landing = `${BASE}/holidays?gclid=TEST_GCLID_123&utm_source=google&utm_medium=cpc&utm_campaign=holidays_test&keyword=dubai%20holiday%20packages`;
await page.goto(landing, { waitUntil: "networkidle" });

// ---- tags present ---------------------------------------------------------
const html = await page.content();
check("GTM container loads", /googletagmanager\.com\/gtm\.js/.test(beacons.join(" ")) || /GTM-/.test(html), beacons.find((b) => b.includes("gtm.js")) ?? "");
check("GTM noscript iframe present", /googletagmanager\.com\/ns\.html/.test(html));
check("gtag.js loads", beacons.some((b) => b.includes("/gtag/js")), beacons.find((b) => b.includes("/gtag/js")) ?? "");

// ---- consent mode ---------------------------------------------------------
// Read from dataLayer rather than the HTML: what matters is that the default
// landed in the queue before the tags read it, not that the string is present.
const consent = await page.evaluate(() => {
  const dl = window.dataLayer || [];
  return dl
    .filter((e) => e && e[0] === "consent")
    .map((e) => [e[1], e[2]]);
});
check("Consent Mode v2 default is set", consent.some(([kind]) => kind === "default"), JSON.stringify(consent[0]?.[1] ?? {}));
check(
  "ad_user_data and ad_storage granted",
  consent.some(([kind, v]) => kind === "default" && v?.ad_storage === "granted" && v?.ad_user_data === "granted"),
);

// ---- click id capture -----------------------------------------------------
const stored = await page.evaluate(() => {
  try {
    return JSON.parse(localStorage.getItem("ns-click-attribution") || "null");
  } catch {
    return null;
  }
});
check("gclid captured from the landing URL", stored?.gclid === "TEST_GCLID_123", JSON.stringify(stored ?? {}));
check("campaign and keyword captured", stored?.utm_campaign === "holidays_test" && Boolean(stored?.keyword));

// ---- the gclid survives navigation ---------------------------------------
// The failure this guards against: a visitor lands on an ad, browses to a
// package page, and enquires there. If the gclid only lived in the URL it is
// gone by then, and the conversion can never be tied back to the ad.
await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
const afterNav = await page.evaluate(() => {
  try {
    return JSON.parse(localStorage.getItem("ns-click-attribution") || "null");
  } catch {
    return null;
  }
});
check("gclid survives a page with no gclid in the URL", afterNav?.gclid === "TEST_GCLID_123");

// ---- dataLayer events in a shape GTM can trigger on -----------------------
// Back to a page with WhatsApp buttons. The click is intercepted so the test
// does not actually open wa.me.
await page.goto(`${BASE}/holidays`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (a && /wa\.me/.test(a.getAttribute("href") || "")) e.preventDefault();
  });
});

const waLink = page.locator('a[href*="wa.me"]').first();
const hasWa = (await waLink.count()) > 0;
if (hasWa) {
  await waLink.click({ force: true });
  await page.waitForTimeout(400);
}

const pushes = await page.evaluate(() =>
  (window.dataLayer || [])
    .filter((e) => e && typeof e === "object" && !Array.isArray(e) && typeof e.event === "string")
    .map((e) => ({ event: e.event, action: e.ns_conversion_action, value: e.ns_value })),
);

check("WhatsApp link found on /holidays", hasWa);
check(
  "ns_whatsapp_click reaches dataLayer as a GTM-triggerable event",
  pushes.some((p) => p.event === "ns_whatsapp_click"),
  JSON.stringify(pushes.filter((p) => p.event?.startsWith("ns_")).slice(0, 6)),
);
check(
  "the event carries a conversion action and value",
  pushes.some((p) => p.event === "ns_whatsapp_click" && p.action === "whatsapp_lead" && p.value > 0),
);

// ---- Ads tag state --------------------------------------------------------
// Not a failure before the account exists — but it must be reported loudly,
// because this is the one thing that silently spends money while measuring
// nothing.
const adsConfigured = /AW-\d+/.test(html) || beacons.some((b) => /AW-\d+/.test(b));
console.log(
  adsConfigured
    ? "\nGoogle Ads tag: CONFIGURED"
    : "\nGoogle Ads tag: NOT YET SET — paste AW-XXXXXXXXXX and the conversion labels into src/lib/ads.ts.\n  Everything above works without it; no conversion will reach Ads until it is set.",
);

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
