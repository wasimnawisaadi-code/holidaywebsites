/**
 * Scrubs the homepage scroll film and captures a frame per act so the WebGL
 * output can actually be eyeballed. Usage: node scripts/shoot-journey.mjs [url]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] ?? "http://localhost:5199/";
const OUT = "scripts/__shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on("requestfailed", (r) => errors.push(`404/FAIL: ${r.url()}`));

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/00-hero.png` });

// Find the pinned film stage and scrub through it.
const stage = await page.evaluate(() => {
  const el = document.querySelector('section[aria-label*="Cinematic"]');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
});

if (!stage) {
  console.error("!! Cinematic stage not found in DOM");
} else {
  console.log(`stage top=${Math.round(stage.top)} height=${Math.round(stage.height)}`);
  for (const [name, p] of [
    ["01-dunes", 0.1],
    ["02-ascent", 0.38],
    ["03-orbit", 0.64],
    ["04-arrival", 0.9],
  ]) {
    await page.evaluate(
      ([top, h, prog]) => window.scrollTo(0, top + (h - window.innerHeight) * prog),
      [stage.top, stage.height, p],
    );
    // Let the damped camera settle on the new target.
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${name}.png` });
  }
}

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/05-footer.png` });

console.log(errors.length ? `\nISSUES (${errors.length}):` : "\nNo console errors.");
console.log([...new Set(errors)].slice(0, 25).join("\n"));

await browser.close();
