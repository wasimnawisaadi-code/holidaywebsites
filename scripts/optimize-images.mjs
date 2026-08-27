/**
 * Re-encodes the site's photography in place.
 *
 * public/images was 710MB of camera-original JPEGs — several over 10MB each,
 * served directly to browsers. That is both a slow site (a 12MB hero image is
 * seconds of load on mobile data) and a repository too large to push
 * comfortably.
 *
 * Every file keeps its exact name, extension and container format, so no
 * reference anywhere in src/ has to change. Only the pixel dimensions and the
 * encoder quality change: nothing is downscaled below 1920px on its long edge,
 * which is still larger than any slot the design actually renders.
 *
 * Skips anything that is already small, and never writes a file that came out
 * bigger than the original.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOTS = ["public/images"];
const MAX_EDGE = 1920;
const JPEG_Q = 80;
const WEBP_Q = 80;
const PNG_EFFORT = 8;
// Below this, re-encoding costs more in quality than it saves in bytes.
const SKIP_UNDER = 150 * 1024;

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const files = [];
for (const root of ROOTS) {
  if (fs.existsSync(root)) walk(root, files);
}

let before = 0;
let after = 0;
let done = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

  const startSize = fs.statSync(file).size;
  before += startSize;

  if (startSize < SKIP_UNDER) {
    after += startSize;
    skipped++;
    continue;
  }

  try {
    // Read into memory first. Passing sharp the path keeps a handle open on
    // Windows, and writing back to that same path then fails with EBUSY /
    // "unknown error" — which is what killed 613 of the first 1000 files.
    const input = fs.readFileSync(file);

    const meta = await sharp(input, { failOn: "none" }).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

    let pipeline = sharp(input, { failOn: "none" }).rotate();
    if (longest > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: (meta.width ?? 0) >= (meta.height ?? 0) ? MAX_EDGE : undefined,
        height: (meta.height ?? 0) > (meta.width ?? 0) ? MAX_EDGE : undefined,
        withoutEnlargement: true,
      });
    }

    if (ext === ".png") pipeline = pipeline.png({ compressionLevel: 9, effort: PNG_EFFORT });
    else if (ext === ".webp") pipeline = pipeline.webp({ quality: WEBP_Q });
    else pipeline = pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true });

    const buf = await pipeline.toBuffer();

    // Never make a file bigger than it already was.
    if (buf.length < startSize) {
      fs.writeFileSync(file, buf);
      after += buf.length;
      done++;
    } else {
      after += startSize;
      skipped++;
    }
  } catch (err) {
    after += startSize;
    failed++;
    console.log("FAILED", file, err.message);
  }

  if ((done + skipped + failed) % 100 === 0) {
    console.log(`  ...${done + skipped + failed}/${files.length}`);
  }
}

const mb = (n) => (n / 1048576).toFixed(0) + "MB";
console.log("\nre-encoded :", done);
console.log("skipped    :", skipped);
console.log("failed     :", failed);
console.log("before     :", mb(before));
console.log("after      :", mb(after));
console.log("saved      :", mb(before - after), `(${Math.round((1 - after / before) * 100)}%)`);
