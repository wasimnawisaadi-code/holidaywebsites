import { chromium } from "playwright";
import fs from "node:fs";
const BASE = process.argv[2] ?? "http://localhost:5200";
const OUT = process.argv[3] ?? "scripts/__shots";
const ROUTES = ["/","/plan","/contact","/uae","/customized-tours","/deals","/holidays","/activities"];
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
fs.mkdirSync(OUT, { recursive: true });
for (const r of ROUTES) {
  await page.goto(BASE + r, { waitUntil: "networkidle" });
  // Scroll through so every IntersectionObserver reveal fires, and stay at the
  // bottom rather than jumping back up — scrolling to top re-hides nothing but
  // does leave lazy images mid-decode.
  await page.evaluate(async () => {
    for (let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}
  });
  await page.evaluate(() => window.scrollTo(0,0));
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).filter(i=>!i.complete).map(i=>new Promise(r=>{i.onload=i.onerror=r})));
  });
  const name = (r === "/" ? "home" : r.replace(/\//g,"")) + ".png";
  await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
  console.log("shot", name);
}
await b.close();
