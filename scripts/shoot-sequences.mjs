import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("scripts/__shots", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:5199/", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);

const stages = await p.evaluate(() =>
  [...document.querySelectorAll("section[aria-label]")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { label: el.getAttribute("aria-label"), top: r.top + scrollY, h: r.height };
    })
    .filter((s) => s.h > innerHeight * 1.5)
);
console.log(stages.map((s) => `${Math.round(s.top)} +${Math.round(s.h)}  ${s.label}`).join("\n"));

let n = 0;
for (const s of stages) {
  for (const g of [0.15, 0.55, 0.9]) {
    await p.evaluate(([s, g]) => scrollTo(0, s.top + (s.h - innerHeight) * g), [s, g]);
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `scripts/__shots/seq-${String(++n).padStart(2, "0")}.png` });
  }
}
console.log(errs.length ? "ERRORS:\n" + [...new Set(errs)].slice(0, 10).join("\n") : "no errors");
await b.close();
