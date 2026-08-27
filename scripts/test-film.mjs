import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__film", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const box = await p.evaluate(() => {
  const s = [...document.querySelectorAll("section")].find(x => /holiday packages$/im.test(x.textContent || "") && x.querySelector("img"));
  const t = [...document.querySelectorAll("section")].find(x => (x.textContent||"").includes("/ 14 — holiday packages"));
  const el = t || s;
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: el.offsetHeight };
});
let bad = 0;
for (let i = 0; i <= 8; i++) {
  const frac = i / 8;
  await p.evaluate(v => window.scrollTo(0, v), Math.round(box.top + (box.h - 900) * frac));
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const hs = [...document.querySelectorAll("h3")].filter(h => {
      const rect = h.getBoundingClientRect();
      const st = getComputedStyle(h);
      return rect.height > 0 && rect.top < innerHeight && rect.bottom > 0 && +st.opacity > 0.05;
    });
    return { n: hs.length, titles: hs.map(h => h.textContent.trim().slice(0, 42)) };
  });
  if (r.n > 1) bad++;
  console.log(`${String(Math.round(frac*100)).padStart(3)}%  visible headlines=${r.n}  ${r.titles.join("  ||  ")}${r.n>1?"   <-- OVERLAP":""}`);
  if (i === 4) await p.screenshot({ path: "scripts/__film/mid.png" });
}
console.log(bad === 0 ? "\nPASS: never more than one headline visible." : `\nFAIL: ${bad} overlapping frame(s).`);
await b.close();
