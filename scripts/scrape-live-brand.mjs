/**
 * Scrapes the real Nawi Saadi site for its actual brand palette and type.
 *
 * The rebuild's colours were sampled from the logo and then drifted per-page.
 * The owner's live site at nawisaadi.com is the real reference, so this pulls
 * the rendered computed styles (not the stylesheet source, which may be
 * minified/framework-generated) and ranks colours by how much screen area they
 * actually cover — a colour used once on a tiny badge should not outrank the
 * page ground.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const URL = process.argv[2] || "https://www.nawisaadi.com/";
const OUT = "scripts/__brand";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(3000);

const data = await page.evaluate(() => {
  const bg = new Map();
  const fg = new Map();
  const fonts = new Map();

  const bump = (map, key, weight) => {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + weight);
  };

  const transparent = (c) => !c || c === "transparent" || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(c);

  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    const area = Math.max(0, r.width) * Math.max(0, r.height);
    if (area <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;

    if (!transparent(cs.backgroundColor)) bump(bg, cs.backgroundColor, area);

    // Only count text colour where there is actual text.
    const text = (el.textContent || "").trim();
    const own = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent || "").trim().length > 0,
    );
    if (own && text.length > 0) {
      const chars = Math.min(text.length, 400);
      bump(fg, cs.color, chars);
      bump(fonts, `${cs.fontFamily.split(",")[0].replace(/["']/g, "")} @${cs.fontWeight}`, chars);
    }
  }

  const top = (map, n) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => ({ value: k, score: Math.round(v) }));

  return {
    title: document.title,
    backgrounds: top(bg, 14),
    textColors: top(fg, 10),
    fonts: top(fonts, 8),
  };
});

console.log("TITLE:", data.title);
console.log("\n=== BACKGROUNDS (by screen area) ===");
for (const b of data.backgrounds) console.log("  ", b.value.padEnd(26), b.score);
console.log("\n=== TEXT COLOURS (by character count) ===");
for (const c of data.textColors) console.log("  ", c.value.padEnd(26), c.score);
console.log("\n=== FONTS ===");
for (const f of data.fonts) console.log("  ", f.value.padEnd(40), f.score);

await page.screenshot({ path: `${OUT}/live-top.png` });
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/live-mid.png` });
await page.evaluate(() => window.scrollTo(0, 2200));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/live-low.png` });

fs.writeFileSync(`${OUT}/palette.json`, JSON.stringify(data, null, 2));
await browser.close();
console.log("\nscreenshots + palette.json written to", OUT);
