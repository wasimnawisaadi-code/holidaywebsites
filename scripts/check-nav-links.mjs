import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:5200";
const SLUGS = ["swiss-alpine-dream","maldives-overwater-escape","cappadocia-sky-turkey","baku-wonders","umrah-17-nights","salalah-khareef-monsoon","japan-golden-route","egypt-pharaohs-nile"];
const b = await chromium.launch();
const page = await b.newPage();
let bad = 0;
for (const s of SLUGS) {
  const url = `${BASE}/holidays/${s}`;
  const r = await page.goto(url, { waitUntil: "domcontentloaded" });
  const h1 = await page.locator("h1").first().textContent().catch(()=>null);
  const ok = r.status() === 200 && h1 && !/not found/i.test(h1);
  if (!ok) bad++;
  console.log(`${ok?" ok ":"FAIL"} ${r.status()} /holidays/${s}  ${(h1||"").trim().slice(0,52)}`);
}
console.log(bad ? `${bad} broken` : "All nav package links resolve.");
await b.close();
