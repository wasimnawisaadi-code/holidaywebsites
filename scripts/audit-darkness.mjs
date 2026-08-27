/**
 * Flags viewport-sized bands that are predominantly dark, so the site can be
 * kept light-first with navy as an accent.
 *   node scripts/audit-darkness.mjs
 */
import { chromium } from "playwright";
import sharp from "sharp";

const ROUTES = ["/", "/holidays", "/countries", "/activities", "/deals",
                "/customized-tours", "/about", "/contact", "/plan", "/uae", "/dubai"];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 880 } });

for (const route of ROUTES) {
  await p.goto("http://localhost:5199" + route, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(2200);
  const H = await p.evaluate(() => document.body.scrollHeight);
  const steps = Math.min(10, Math.max(3, Math.round(H / 880)));
  const dark = [];
  for (let i = 0; i < steps; i++) {
    const y = Math.round((H - 880) * (i / Math.max(1, steps - 1)));
    await p.evaluate((v) => scrollTo(0, v), y);
    await p.waitForTimeout(700);
    const buf = await p.screenshot();
    const { data } = await sharp(buf).resize(40, 26, { fit: "fill" }).removeAlpha()
      .raw().toBuffer({ resolveWithObject: true });
    let lum = 0, n = 0;
    for (let k = 0; k < data.length; k += 3) {
      lum += 0.2126 * data[k] + 0.7152 * data[k + 1] + 0.0722 * data[k + 2];
      n++;
    }
    const mean = lum / n;
    if (mean < 90) dark.push(`y=${y} (lum ${Math.round(mean)})`);
  }
  console.log(`${dark.length ? "DARK" : " ok "} ${route.padEnd(20)} ${dark.join("  ")}`);
}
await b.close();
