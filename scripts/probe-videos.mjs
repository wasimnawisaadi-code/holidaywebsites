import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__vid", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
for (const v of ["dubai-hero", "world-hero", "travel-hero"]) {
  await p.setContent(`<body style="margin:0;background:#000"><video id="v" src="http://localhost:5199/videos/${v}.mp4" muted></video></body>`);
  const meta = await p.evaluate(() => new Promise(res => {
    const el = document.getElementById("v");
    el.onloadedmetadata = () => res({ d: el.duration, w: el.videoWidth, h: el.videoHeight });
    el.onerror = () => res({ err: true });
  }));
  console.log(v + ": " + JSON.stringify(meta));
  if (meta.err) continue;
  for (const frac of [0.15, 0.55]) {
    await p.evaluate(f => { const el = document.getElementById("v"); el.currentTime = el.duration * f; }, frac);
    await p.waitForTimeout(900);
    await p.evaluate(() => { const el = document.getElementById("v"); el.style.width="1280px"; el.style.height="720px"; el.style.objectFit="cover"; });
    await p.screenshot({ path: `scripts/__vid/${v}-${Math.round(frac*100)}.png` });
  }
}
await b.close();
