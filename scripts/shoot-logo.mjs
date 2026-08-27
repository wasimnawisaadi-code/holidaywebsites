import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__logo", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
// over the dark hero
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.locator("header").screenshot({ path: "scripts/__logo/header-over-hero.png" });
// scrolled -> light header
await p.evaluate(() => window.scrollTo(0, 1400));
await p.waitForTimeout(1200);
await p.locator("header").screenshot({ path: "scripts/__logo/header-light.png" });
console.log("done");
await b.close();
