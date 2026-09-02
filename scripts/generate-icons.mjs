/**
 * Builds the site's icon set from the brand mark.
 *
 * The site shipped one file — a 701x479 PNG copied to favicon.ico, favicon.png
 * and logo.png, all byte-identical. Three problems with that: a PNG declared as
 * image/x-icon, a non-square source that browsers letterbox, and the full
 * lockup (mark + "NAWI SAADI" + "TRAVEL & TOURISM" + Arabic) squeezed into
 * 32 pixels, where the wordmark is an illegible smudge. There was also no
 * apple-touch-icon, so an iOS home-screen bookmark fell back to a screenshot.
 *
 * Two treatments of the same mark, chosen by size.
 *
 * Gold line-art on navy collapses into a muddy triangle at 32px — the strokes
 * are thinner than a pixel and merge, and neither thickening nor sharpening
 * recovers them. Contrast is the only thing that helps, and the highest
 * contrast available is the mark in navy on white: no coloured tile, just the
 * logo. A gold tile was tried and read as a loud gold square in the tab rather
 * than as a mark.
 *
 * Large sizes keep the mark the right way round on navy, because at 180px and
 * above there is resolution enough for the fine strokes to read properly and
 * that is the logo as it is actually drawn.
 *
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const SRC = "src/assets/logo-ink.png";
const NAVY = { r: 0, g: 54, b: 95, alpha: 1 }; // #00365F
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
// Measured from the source: the mark occupies the top two-thirds; gold pixel
// density falls to zero below y=213, where the wordmark begins.
const MARK = { left: 73, top: 0, width: 291, height: 213 };

const mark = await sharp(SRC).extract(MARK).png().toBuffer();

/** The architectural mark, centred on navy with room for icon masking. */
async function markIcon(size, padRatio = 0.18) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const resized = await sharp(mark)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * The mark alone, in navy, on white. No tile colour, nothing added.
 *
 * Every gold pixel of the source becomes solid navy and everything else
 * becomes transparent, over a white ground. Navy on white is the highest
 * contrast pairing available from the brand's own colours, which is the only
 * thing that keeps a line-art mark legible at 16 pixels.
 */
async function invertedMarkIcon(size) {
  const { data, info } = await sharp(SRC)
    .extract(MARK)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = data[i * channels + 3];
    // The same gold test used to find the mark's bounding box.
    const isMark = a > 40 && r > 110 && g > 80 && r - b > 45;
    out[i * 4] = 0;
    out[i * 4 + 1] = 54;
    out[i * 4 + 2] = 95;
    out[i * 4 + 3] = isMark ? 255 : 0;
  }

  const inner = Math.round(size * 0.96);
  // Encode to PNG before resizing: sharp will not resize a raw buffer and
  // then hand it back without a declared output format.
  const glyph = await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3",
    })
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
  // Small: the mark alone in navy on white, which is the only version that reads here.
  ["public/favicon-32.png", await invertedMarkIcon(32)],
  // Large: the real mark, which has the resolution to carry it.
  ["public/apple-touch-icon.png", await markIcon(180, 0.16)],
  ["public/icon-192.png", await markIcon(192, 0.18)],
  ["public/icon-512.png", await markIcon(512, 0.18)],
];
for (const [path, buf] of outputs) {
  fs.writeFileSync(path, buf);
  console.log(`${path.padEnd(32)} ${(buf.length / 1024).toFixed(1)} KB`);
}

const icoBuf = ico([
  { size: 16, data: await invertedMarkIcon(16) },
  { size: 32, data: await invertedMarkIcon(32) },
  { size: 48, data: await invertedMarkIcon(48) },
]);
fs.writeFileSync("public/favicon.ico", icoBuf);
console.log(
  `${"public/favicon.ico".padEnd(32)} ${(icoBuf.length / 1024).toFixed(1)} KB (16+32+48)`,
);
