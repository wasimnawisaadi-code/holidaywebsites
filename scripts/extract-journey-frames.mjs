/**
 * Extracts a scroll-scrubbable frame sequence from a source video.
 *
 * There is no ffmpeg on this machine, so the frames are pulled through a real
 * browser: the video is seeked to each timestamp and the current frame is drawn
 * to a canvas and encoded as WebP. Seeking (rather than playing and grabbing)
 * is what guarantees an exact, evenly-spaced sequence.
 *
 * Two sizes are written so mobile does not download desktop-resolution frames:
 *   public/frames/journey/desktop/f_0001.webp  (1280 wide)
 *   public/frames/journey/mobile/f_0001.webp   ( 720 wide)
 *
 * Everything the player needs is written to manifest.json alongside them, so
 * the component never hardcodes a frame count.
 *
 *   node scripts/extract-journey-frames.mjs [frameCount]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const BASE = process.env.BASE_URL || "http://localhost:5199";
const VIDEO = "/videos/luxury-journey.mp4";
const COUNT = Number(process.argv[2] || 120);
const OUT = "public/frames/journey";
const DESKTOP_W = 1280;
const MOBILE_W = 720;

fs.mkdirSync(path.join(OUT, "desktop"), { recursive: true });
fs.mkdirSync(path.join(OUT, "mobile"), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
// A bare same-origin page: navigating to the app itself meant React hydrated
// and replaced document.body, destroying the <video> between frames.
await page.goto(BASE + "/__grab.html", { waitUntil: "domcontentloaded" });

// Build the capture rig once and keep the same page context for every frame —
// re-navigating between frames tears down the <video> and loses the decode.
const meta = await page.evaluate(async (src) => {
  const v = document.getElementById("v");
  v.src = src;
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("metadata timeout")), 30000);
    v.onloadeddata = () => { clearTimeout(t); res(); };
    v.onerror = () => { clearTimeout(t); rej(new Error("video load error")); };
  });
  const c = document.getElementById("c");
  c.width = v.videoWidth;
  c.height = v.videoHeight;
  return { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
}, VIDEO);

console.log(`source: ${meta.width}x${meta.height}, ${meta.duration.toFixed(2)}s`);
console.log(`extracting ${COUNT} frames...`);

let written = 0;
for (let i = 0; i < COUNT; i++) {
  // Stop a hair short of the end: seeking exactly to `duration` can land past
  // the last decodable frame and return the previous one twice.
  const t = (i / (COUNT - 1)) * (meta.duration - 0.05);

  const dataUrl = await page.evaluate(async (time) => {
    const v = document.getElementById("v");
    const c = document.getElementById("c");
    await new Promise((res) => {
      const done = () => res();
      v.onseeked = done;
      v.currentTime = time;
      setTimeout(done, 4000);
    });
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  }, t);

  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  const name = `f_${String(i + 1).padStart(4, "0")}.webp`;

  await sharp(buf).resize({ width: DESKTOP_W }).webp({ quality: 72 })
    .toFile(path.join(OUT, "desktop", name));
  await sharp(buf).resize({ width: MOBILE_W }).webp({ quality: 66 })
    .toFile(path.join(OUT, "mobile", name));

  written++;
  if (written % 20 === 0) console.log(`  ${written}/${COUNT}`);
}

await browser.close();

const size = (dir) =>
  fs.readdirSync(path.join(OUT, dir)).reduce(
    (t, f) => t + fs.statSync(path.join(OUT, dir, f)).size, 0);

const manifest = {
  count: written,
  pattern: "f_{n}.webp",
  pad: 4,
  desktop: { dir: "/frames/journey/desktop", width: DESKTOP_W },
  mobile: { dir: "/frames/journey/mobile", width: MOBILE_W },
  source: { duration: meta.duration, width: meta.width, height: meta.height },
  aspect: meta.width / meta.height,
};
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`\nwrote ${written} frames`);
console.log(`desktop: ${(size("desktop") / 1048576).toFixed(1)}MB`);
console.log(`mobile : ${(size("mobile") / 1048576).toFixed(1)}MB`);
console.log("manifest:", path.join(OUT, "manifest.json"));
