import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__tunnel", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const box = await p.evaluate(() => {
  const s = [...document.querySelectorAll("section")].find(x => (x.textContent||"").includes("one travel desk"));
  if (!s) return null;
  const r = s.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: s.offsetHeight };
});
if (!box) { console.log("TUNNEL NOT FOUND"); await b.close(); process.exit(1); }
console.log("tunnel top=" + Math.round(box.top) + " h=" + box.h);
for (let i = 0; i <= 5; i++) {
  const frac = i / 5;
  await p.evaluate(v => window.scrollTo(0, v), Math.round(box.top + (box.h - 900) * frac));
  await p.waitForTimeout(2000);
  const name = await p.evaluate(() => {
    const s = [...document.querySelectorAll("section")].find(x => (x.textContent||"").includes("one travel desk"));
    const el = s?.querySelector("a[href*='/countries/']");
    return el?.textContent?.trim();
  });
  await p.screenshot({ path: `scripts/__tunnel/t-${i}.png` });
  console.log(`${String(Math.round(frac*100)).padStart(3)}%  ${name}`);
}
await b.close();
