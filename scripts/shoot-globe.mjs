import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:5201";
const OUT = "scripts/__globe";
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ args: ["--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", m => { if (m.type()==="error") errors.push(m.text()); });
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));

await page.goto(BASE + "/", { waitUntil: "networkidle" });

// Find the globe section by its aria-label.
const sel = 'section[aria-label*="Forty-one countries"]';
await page.waitForSelector(sel, { timeout: 15000 });
const box = await page.locator(sel).boundingBox();
console.log("globe section top:", Math.round(box.y), "height:", Math.round(box.height));

const hasCanvas = await page.locator(sel + " canvas").count();
console.log("canvas present:", hasCanvas);

// Scroll through the pinned stage and shoot at 5 points.
for (let i = 0; i <= 4; i++) {
  const p = i / 4;
  const y = box.y + (box.height - 900) * p;
  await page.evaluate(v => window.scrollTo(0, v), y);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/globe-${i}.png` });
  console.log("shot globe-" + i, "at scrollY", Math.round(y));
}

// Is the canvas actually painting (not a blank/transparent buffer)?
const painted = await page.evaluate((s) => {
  const c = document.querySelector(s + " canvas");
  if (!c) return "no canvas";
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no gl context";
  const px = new Uint8Array(4 * 40 * 40);
  gl.readPixels(c.width/2 - 20, c.height/2 - 20, 40, 40, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let nonEmpty = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 8) nonEmpty++;
  return `gl ok, opaque px in centre: ${nonEmpty}/1600, size ${c.width}x${c.height}`;
}, sel);
console.log("PAINT CHECK:", painted);

console.log("CONSOLE ERRORS:", errors.length ? errors.slice(0,8) : "none");
await b.close();
