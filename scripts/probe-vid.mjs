import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("scripts/__vid", { recursive: true });
const names = ["girl-travel-1", "girl-travel-2"];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
await p.goto("http://localhost:5199/", { waitUntil: "domcontentloaded" });
for (const v of names) {
  const meta = await p.evaluate(async (name) => {
    document.body.innerHTML = `<video id="probe" width="960" height="540" style="position:fixed;inset:0;object-fit:cover;z-index:99999;background:#000" src="/videos/${name}.mp4" muted></video>`;
    const el = document.getElementById("probe");
    return await new Promise((r) => {
      const t = setTimeout(() => r({ err: "timeout" }), 10000);
      el.onloadeddata = async () => {
        clearTimeout(t);
        el.currentTime = el.duration * 0.4;
        await new Promise((s) => {
          el.onseeked = s;
          setTimeout(s, 2500);
        });
        r({ d: +el.duration.toFixed(1), w: el.videoWidth, h: el.videoHeight });
      };
      el.onerror = () => {
        clearTimeout(t);
        r({ err: "load" });
      };
    });
  }, v);
  if (meta.err) {
    console.log(`${v}: ERROR ${meta.err}`);
    continue;
  }
  await p.waitForTimeout(300);
  await p.screenshot({ path: `scripts/__vid/${v}.png` });
  console.log(`${v}: ${meta.d}s  ${meta.w}x${meta.h}`);
}
await b.close();
