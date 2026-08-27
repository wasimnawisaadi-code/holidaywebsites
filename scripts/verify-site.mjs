/**
 * Whole-site smoke pass: loads every route at desktop and mobile widths,
 * reports console errors, failed requests, and horizontal overflow.
 *
 *   node scripts/verify-site.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://localhost:5199").replace(/\/$/, "");
const ROUTES = [
  "/",
  "/holidays",
  "/countries",
  "/activities",
  "/deals",
  "/customized-tours",
  "/about",
  "/contact",
  "/plan",
  "/uae",
  "/dubai",
];

const browser = await chromium.launch();
let failures = 0;

for (const [label, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  console.log(`\n===== ${label} =====`);
  const page = await browser.newPage({ viewport });

  for (const route of ROUTES) {
    const problems = [];
    const onConsole = (m) => m.type() === "error" && problems.push(m.text().slice(0, 160));
    const onPageError = (e) => problems.push(`JS: ${e.message.slice(0, 160)}`);
    const onFailed = (r) => {
      // Media elements routinely abort their own range requests when a source
      // is swapped or paused off-screen; that is not a broken asset.
      const aborted = (r.failure()?.errorText ?? "").includes("ERR_ABORTED");
      if (aborted && /\.(mp4|webm|mov)(\?|$)/i.test(r.url())) return;
      problems.push(`REQ: ${r.url().slice(0, 120)}`);
    };
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    page.on("requestfailed", onFailed);

    let status = "?";
    try {
      const res = await page.goto(BASE + route, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      status = res?.status() ?? "?";
      await page.waitForTimeout(2200);
    } catch (e) {
      problems.push(`NAV: ${e.message.slice(0, 120)}`);
    }

    // Horizontal overflow is the classic mobile regression.
    const overflow = await page
      .evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      .catch(() => 0);
    if (overflow > 2) problems.push(`OVERFLOW: +${overflow}px`);

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onFailed);

    const unique = [...new Set(problems)];
    if (unique.length) failures++;
    console.log(
      `${unique.length ? "FAIL" : " ok "}  ${status}  ${route}${
        unique.length ? "\n        " + unique.join("\n        ") : ""
      }`,
    );
  }
  await page.close();
}

await browser.close();
console.log(`\n${failures ? `${failures} route(s) with issues.` : "All routes clean."}`);
