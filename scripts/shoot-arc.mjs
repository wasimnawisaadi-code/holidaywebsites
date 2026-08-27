import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__arc", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
// locate the arc section
const box = await p.evaluate(() => {
  const secs = [...document.querySelectorAll("section")];
  const s = secs.find(x => x.textContent?.includes("Fourteen journeys"));
  if (!s) return null;
  const r = s.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: s.offsetHeight };
});
if (!box) { console.log("ARC SECTION NOT FOUND"); await b.close(); process.exit(1); }
console.log("arc top=" + Math.round(box.top) + " height=" + box.h);
for (let i = 0; i < 5; i++) {
  const frac = i / 4;
  await p.evaluate(v => window.scrollTo(0, v), Math.round(box.top + (box.h - 900) * frac));
  await p.waitForTimeout(1800);
  const caption = await p.evaluate(() => {
    const el = [...document.querySelectorAll("p")].find(e => /· \d+ nights/.test(e.textContent || ""));
    const title = el?.parentElement?.querySelector("p:nth-child(2)");
    return { meta: el?.textContent?.trim(), title: title?.textContent?.trim() };
  });
  await p.screenshot({ path: `scripts/__arc/arc-${i}.png` });
  console.log(`shot ${i} @${Math.round(frac*100)}%  caption: ${caption.meta} | ${caption.title}`);
}
await b.close();
