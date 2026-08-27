import { chromium } from "playwright";
const b = await chromium.launch();
for (const route of ["/holidays", "/deals"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto("http://localhost:5199" + route, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const bad = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 && r.width > 0) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 110),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    }
    return out.slice(0, 12);
  });
  console.log("=== " + route + " (vw=390) ===");
  bad.forEach(x => console.log(`  right=${x.right} w=${x.w} <${x.tag}> ${x.cls}`));
  if (!bad.length) console.log("  none");
  await p.close();
}
await b.close();
