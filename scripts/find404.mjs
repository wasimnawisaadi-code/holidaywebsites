import { chromium } from "playwright";
const b = await chromium.launch();
for (const route of ["/", "/deals"]) {
  const p = await b.newPage();
  const bad = [];
  p.on("response", r => { if (r.status() >= 400) bad.push(r.status() + "  " + r.url()); });
  await p.goto("http://localhost:5199" + route, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  console.log("=== " + route + " ===");
  bad.forEach(x => console.log("  " + x));
  if (!bad.length) console.log("  none");
  await p.close();
}
await b.close();
