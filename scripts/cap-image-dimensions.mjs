/**
 * Caps every image at a width the site can actually display.
 *
 * The gallery held a 6720x4480 photograph — a 30-megapixel original straight
 * off a camera, shipped to phones. Nothing on this site renders wider than
 * 1920px, so every pixel past that is downloaded, decoded and thrown away, and
 * decoding is the expensive half on a mid-range phone.
 *
 * Format and filename are preserved so no reference anywhere needs updating.
 */
import sharp from "sharp";
import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join, extname } from "node:path";

const MAX_W = 1920;
const ROOT = "public/images";

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(png|jpe?g|avif|webp)$/i.test(e.name)) files.push(p);
  }
})(ROOT);

let before = 0,
  after = 0,
  touched = 0,
  skipped = 0;
for (const f of files) {
  const size = statSync(f).size;
  let meta;
  try {
    meta = await sharp(f).metadata();
  } catch {
    skipped++;
    continue;
  }
  if (!meta.width || meta.width <= MAX_W) {
    before += size;
    after += size;
    continue;
  }

  const ext = extname(f).toLowerCase();
  const tmp = f + ".tmp";
  try {
    let pipe = sharp(f).resize({ width: MAX_W, withoutEnlargement: true });
    if (ext === ".png") pipe = pipe.png({ compressionLevel: 9, palette: true });
    else if (ext === ".avif") pipe = pipe.avif({ quality: 62, effort: 4 });
    else if (ext === ".webp") pipe = pipe.webp({ quality: 82 });
    else pipe = pipe.jpeg({ quality: 82, mozjpeg: true });
    await pipe.toFile(tmp);
    const newSize = statSync(tmp).size;
    // Never make a file bigger than it already was.
    if (newSize >= size) {
      unlinkSync(tmp);
      before += size;
      after += size;
      continue;
    }
    unlinkSync(f);
    renameSync(tmp, f);
    before += size;
    after += newSize;
    touched++;
    console.log(
      `  ${String(Math.round(size / 1024)).padStart(5)} -> ${String(Math.round(newSize / 1024)).padStart(5)} KB  ${meta.width}px -> ${MAX_W}px  ${f}`,
    );
  } catch (err) {
    try {
      unlinkSync(tmp);
    } catch {}
    skipped++;
  }
}
console.log(`\n  ${touched} resized, ${skipped} skipped, ${files.length} scanned`);
console.log(
  `  ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB  (${((before - after) / 1048576).toFixed(1)} MB saved)`,
);
