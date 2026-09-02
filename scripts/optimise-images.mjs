/**
 * Converts the site's photography to WebP and caps its dimensions.
 *
 * The library was 392 JPEGs and 13 PNGs weighing 98MB of the 129MB actually
 * referenced by the site — JPEG because that is what came out of the cameras
 * and the stock libraries, not because anything chose it. WebP at the same
 * visual quality is routinely 25-35% smaller, and several files were also far
 * larger in pixels than any slot that displays them: a 2.5MB frame rendered
 * into a 600px card is 2.4MB of bandwidth nobody sees.
 *
 * Everything is re-encoded from the original, never from an already-compressed
 * intermediate, so this does not stack generation loss. Sources are left on
 * disk until the references are rewritten and the build passes; run with
 * --clean afterwards to remove them.
 *
 *   node scripts/optimise-images.mjs           # convert + report
 *   node scripts/optimise-images.mjs --clean   # delete the converted originals
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const MAX_W = 1600; // nothing on the site displays wider than this
const QUALITY = 80;
const clean = process.argv.includes("--clean");

/** Only touch what the site actually references — spares are left alone. */
function referenced() {
  const out = new Set();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name)) {
        for (const m of fs.readFileSync(p, "utf8").matchAll(/"(\/images\/[^"]+)"/g)) out.add(m[1]);
      }
    }
  };
  walk("src");
  return [...out];
}

const targets = referenced().filter((r) => /\.(jpe?g|png)$/i.test(r));
let before = 0,
  after = 0,
  done = 0,
  failed = 0;
const map = {};

for (const rel of targets) {
  const src = path.join("public", rel);
  if (!fs.existsSync(src)) continue;
  const dest = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const relDest = rel.replace(/\.(jpe?g|png)$/i, ".webp");
  try {
    const meta = await sharp(src).metadata();
    const resize = (meta.width ?? 0) > MAX_W ? { width: MAX_W } : undefined;
    let img = sharp(src);
    if (resize) img = img.resize(resize);
    await img.webp({ quality: QUALITY, effort: 5 }).toFile(dest);

    const b = fs.statSync(src).size,
      a = fs.statSync(dest).size;
    // If WebP somehow loses, keep the original rather than ship a bigger file.
    if (a >= b) {
      fs.unlinkSync(dest);
      continue;
    }
    before += b;
    after += a;
    done++;
    map[rel] = relDest;
    if (clean) fs.unlinkSync(src);
  } catch (e) {
    failed++;
    console.log(`  FAILED ${rel}: ${String(e.message).slice(0, 60)}`);
  }
}

fs.writeFileSync("scripts/__image-map.json", JSON.stringify(map, null, 2));
console.log(`\n  converted ${done} of ${targets.length}   failed ${failed}`);
console.log(`  ${(before / 1048576).toFixed(1)} MB  ->  ${(after / 1048576).toFixed(1)} MB`);
console.log(
  `  saved ${((before - after) / 1048576).toFixed(1)} MB (${(100 - (after / before) * 100).toFixed(0)}%)`,
);
console.log(`  map written to scripts/__image-map.json`);
