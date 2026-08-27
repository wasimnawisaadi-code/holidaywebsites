import { chromium } from "playwright";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const rows = JSON.parse(fs.readFileSync("scripts/__remote-images.json", "utf8"));
// one entry per unique url, listing which countries use it
const byUrl = new Map();
for (const r of rows) {
  if (!byUrl.has(r.url)) byUrl.set(r.url, []);
  byUrl.get(r.url).push(r.slug + "/" + r.kind);
}
const items = [...byUrl.entries()];
const html = `<body style="margin:0;background:#111;font:12px system-ui;color:#eee">
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px">
${items.map(([url, uses], i) => `
<div style="background:#1c1c1c">
  <div style="position:relative"><img src="${url}" style="width:100%;height:150px;object-fit:cover;display:block">
  <span style="position:absolute;top:4px;left:4px;background:#000c;padding:2px 6px;border-radius:3px">#${i}</span></div>
  <div style="padding:6px;line-height:1.35">${uses.slice(0,4).join("<br>")}${uses.length>4?"<br>+"+(uses.length-4)+" more":""}</div>
</div>`).join("")}
</div></body>`;
fs.writeFileSync("scripts/__sheet.html", html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
await p.goto(pathToFileURL("scripts/__sheet.html").href, { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
const h = await p.evaluate(() => document.body.scrollHeight);
const pages = Math.ceil(h / 1000);
for (let i = 0; i < pages; i++) {
  await p.evaluate(y => window.scrollTo(0, y), i * 1000);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `scripts/__vid/sheet-${i}.png` });
}
console.log("unique urls: " + items.length + "  sheets: " + pages);
await b.close();
