import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const box = await p.evaluate(() => {
  const s = [...document.querySelectorAll("section")].find(x => x.textContent?.includes("Fourteen journeys"));
  const r = s.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: s.offsetHeight };
});
let bad = 0;
for (let i = 0; i <= 13; i++) {
  const frac = i / 13;
  await p.evaluate(v => window.scrollTo(0, v), Math.round(box.top + (box.h - 900) * frac));
  await p.waitForTimeout(2200); // let damping settle fully
  const r = await p.evaluate(() => {
    const meta = [...document.querySelectorAll("p")].find(e => /· \d+ nights/.test(e.textContent || ""));
    const bars = [...document.querySelectorAll("span")].filter(s => s.className.includes("h-0.5") && s.className.includes("flex-1"));
    const lit = bars.map((b, idx) => b.className.includes("#c8a028") ? idx : -1).filter(x => x >= 0);
    return { meta: meta?.textContent?.trim(), lit };
  });
  const ok = r.lit.length === 1;
  if (!ok) bad++;
  console.log(`${String(Math.round(frac*100)).padStart(3)}%  lit=[${r.lit.join(",")}]  ${r.meta}  ${ok ? "" : "<-- ambiguous"}`);
}
console.log(bad === 0 ? "\nPASS: exactly one card active at every stop." : `\nFAIL: ${bad} ambiguous stop(s).`);
await b.close();
