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
 * This crops to the gold architectural mark alone — the part that survives at
 * favicon size — and sets it on brand navy.
 *
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const SRC = "src/assets/logo-ink.png";
const NAVY = { r: 0, g: 54, b: 95, alpha: 1 }; // #00365F
// Measured from the source: the mark occupies the top two-thirds; gold pixel
// density falls to zero below y=213, where the wordmark begins.
const MARK = { left: 73, top: 0, width: 291, height: 213 };

const mark = await sharp(SRC).extract(MARK).png().toBuffer();

/** Mark centred on navy, with breathing room so it survives icon masking. */
async function icon(size, padRatio = 0.18) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const resized = await sharp(mark)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: resized, gravity: "center" }])
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
  ["public/favicon-32.png", await icon(32, 0.12)],
  ["public/apple-touch-icon.png", await icon(180, 0.16)],
  ["public/icon-192.png", await icon(192, 0.18)],
  ["public/icon-512.png", await icon(512, 0.18)],
];
for (const [path, buf] of outputs) {
  fs.writeFileSync(path, buf);
  console.log(`${path.padEnd(32)} ${(buf.length / 1024).toFixed(1)} KB`);
}

const icoBuf = ico([
  { size: 16, data: await icon(16, 0.08) },
  { size: 32, data: await icon(32, 0.12) },
  { size: 48, data: await icon(48, 0.14) },
]);
fs.writeFileSync("public/favicon.ico", icoBuf);
console.log(
  `${"public/favicon.ico".padEnd(32)} ${(icoBuf.length / 1024).toFixed(1)} KB (16+32+48)`,
);
