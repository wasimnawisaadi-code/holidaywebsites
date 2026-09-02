/**
 * Builds small variants of the destination photography.
 *
 * The homepage marquee displays these in a 360x230 slot and was loading the
 * full 1600px file for each one — a 603KB photograph rendered into a space
 * that can show about 20 times fewer pixels than it contains. Twenty-one of
 * them loaded before a visitor had scrolled at all, which was 4.4MB of the
 * homepage's 7.2MB.
 *
 * The originals stay: the same images are country heroes elsewhere and need
 * their full width there. These variants are offered alongside them through
 * srcset so the browser takes whichever fits the slot it is painting into.
 *
 *   node scripts/generate-thumbnails.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const WIDTH = 720;             // 360px slot at devicePixelRatio 2
const DIR = "public/images/destinations";

const files = fs.readdirSync(DIR).filter((f) => /\.(webp|jpe?g|png)$/i.test(f) && !f.includes("-sm."));
let before = 0, after = 0, made = 0;

for (const f of files) {
  const src = path.join(DIR, f);
  const dest = path.join(DIR, f.replace(/\.(webp|jpe?g|png)$/i, "-sm.webp"));
  try {
    const meta = await sharp(src).metadata();
    if ((meta.width ?? 0) <= WIDTH) continue;   // already small enough
    await sharp(src).resize({ width: WIDTH }).webp({ quality: 78, effort: 5 }).toFile(dest);
    before += fs.statSync(src).size;
    after += fs.statSync(dest).size;
    made++;
  } catch { /* a file that will not decode is left alone */ }
}

console.log(`  ${made} thumbnails written at ${WIDTH}px`);
console.log(`  the same images at full size: ${(before / 1048576).toFixed(1)} MB`);
console.log(`  as thumbnails:                ${(after / 1048576).toFixed(1)} MB`);
console.log(`  saving when a small slot uses them: ${(100 - (after / before) * 100).toFixed(0)}%`);
