/**
 * Builds the site's icon set from the brand mark.
 *
 * The site originally shipped one file — a 701x479 PNG copied to favicon.ico,
 * favicon.png and logo.png, all byte-identical. A PNG declared as
 * image/x-icon, a non-square source browsers letterbox, and the full lockup
 * (mark + "NAWI SAADI" + "TRAVEL & TOURISM" + Arabic) squeezed into 32 pixels
 * where the wordmark is a smudge.
 *
 * The first fix recoloured the mark navy for small sizes, on the reasoning that
 * navy-on-white is the highest-contrast pairing the brand owns. It was legible
 * and it was wrong: the logo is gold, so the tab showed a mark nobody
 * recognised as this company.
 *
 * What actually fixes legibility is the crop, not the colour. The full arch is
 * 2.2:1, so fitting it into a square leaves it filling barely a third of the
 * height — about 14 pixels of a 32 pixel icon, which is where the fine strokes
 * disappear. The centre of the arch, the peak and its vertical bars, is nearly
 * square. Cropped to that, the mark fills the icon and the strokes survive, in
 * the brand's own gold.
 *
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const SRC = "src/assets/logo-ink.png";
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

const meta = await sharp(SRC).metadata();

/**
 * The arch alone.
 *
 * The wordmark sits under it; gold pixel density falls to zero below roughly
 * two thirds of the height, so taking the top band and trimming to content
 * isolates the mark without hard-coding a bounding box that a redraw of the
 * logo would invalidate.
 */
const arch = await sharp(SRC)
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.63) })
  .trim({ threshold: 8 })
  .png()
  .toBuffer();
const archMeta = await sharp(arch).metadata();

/** The centre of the arch: near square, so it survives being shrunk to 32px. */
const peakWidth = Math.round(archMeta.width * 0.5);
const peak = await sharp(
  await sharp(arch)
    .extract({
      left: Math.round((archMeta.width - peakWidth) / 2),
      top: 0,
      width: peakWidth,
      height: archMeta.height,
    })
    .png()
    .toBuffer(),
)
  .trim({ threshold: 8 })
  .png()
  .toBuffer();

/** Mark centred on white, in the brand gold, with room for icon masking. */
async function icon(source, size, padRatio) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const glyph = await sharp(source)
    .resize(inner, inner, { fit: "inside", background: CLEAR, kernel: "lanczos3" })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: glyph, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Minimal ICO container. The format accepts PNG payloads directly. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const dir = [];
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    dir.push(e);
  }
  return Buffer.concat([header, ...dir, ...pngs.map((p) => p.data)]);
}

const outputs = [
  // Tab icon: the peak, which is the only crop that reads at this size.
  ["public/favicon-32.png", await icon(peak, 32, 0.05)],
  // Home screen and PWA: room for the whole arch, so show the whole arch.
  ["public/apple-touch-icon.png", await icon(arch, 180, 0.14)],
  ["public/icon-192.png", await icon(arch, 192, 0.14)],
  ["public/icon-512.png", await icon(arch, 512, 0.14)],
];
for (const [path, buf] of outputs) {
  fs.writeFileSync(path, buf);
  console.log(`  ${path.padEnd(32)} ${(buf.length / 1024).toFixed(1)} KB`);
}

const icoBuf = ico([
  { size: 16, data: await icon(peak, 16, 0.03) },
  { size: 32, data: await icon(peak, 32, 0.05) },
  { size: 48, data: await icon(peak, 48, 0.05) },
]);
fs.writeFileSync("public/favicon.ico", icoBuf);
console.log(`  ${"public/favicon.ico".padEnd(32)} ${(icoBuf.length / 1024).toFixed(1)} KB`);
