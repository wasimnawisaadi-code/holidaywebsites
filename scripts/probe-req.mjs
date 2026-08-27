import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("requestfailed", r => console.log("FAILED " + r.url() + "  -> " + (r.failure()?.errorText)));
p.on("response", r => { if (r.url().includes("videos/")) console.log(r.status() + " " + r.url()); });
await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
await b.close();
