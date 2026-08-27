import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:5200";
const ROUTES = ["/","/deals","/customized-tours","/holidays","/activities","/about","/contact","/plan","/countries","/uae","/dubai"];
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const r of ROUTES) {
  await page.goto(BASE + r, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,60)); }
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(700);
  const clip = await page.evaluate(() => {
    const f = document.querySelector("footer");
    const h = f ? f.getBoundingClientRect().top + window.scrollY : document.body.scrollHeight;
    return { x: 0, y: 0, width: document.documentElement.clientWidth, height: Math.max(Math.round(h), 200) };
  });
  const buf = await page.screenshot({ clip });
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(buf).resize(400).raw().toBuffer({ resolveWithObject: true });
  let blue = 0, total = info.width * info.height;
  for (let i = 0; i < data.length; i += info.channels) {
    const R = data[i], G = data[i+1], B = data[i+2];
    // "blue" = clearly blue-dominant pixel
    if (B > R + 18 && B > G + 10) blue++;
  }
  console.log(`${r.padEnd(20)} blue ${(100*blue/total).toFixed(1)}%`);
}
await b.close();
