import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__home", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const h = await p.evaluate(() => document.body.scrollHeight);
const shots = 7;
for (let i = 0; i < shots; i++) {
  const y = Math.round((h - 900) * (i / (shots - 1)));
  await p.evaluate(v => window.scrollTo(0, v), y);
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `scripts/__home/home-${i}.png` });
}
console.log("pageHeight=" + h + " shots=" + shots);
await b.close();
