/**
 * Renders every country's gallery as labelled contact sheets for visual review.
 *
 * The existing audits check that no photograph is *shared* between two
 * countries. They cannot check that a photograph actually *depicts* the country
 * it is filed under — a Taj Mahal image named `japan-04.jpg` passes every
 * automated test there is, and shipped on the live Japan page.
 *
 * There is no way around looking. This lays the galleries out in a grid, three
 * countries per sheet, each tile stamped with the country and filename, so a
 * wrong subject is obvious at a glance and can be named precisely.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = "scripts/__sheets";
const TILE_W = 340;
const TILE_H = 210;
const LABEL_H = 26;
const COLS = 4;
const COUNTRIES_PER_SHEET = 3;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const text = fs.readFileSync("src/data/countries.ts", "utf8");

const countries = text
  .split("c({")
  .slice(1)
  .map((block) => {
    const slug = /slug:\s*"([^"]+)"/.exec(block)?.[1];
    const name = /\n\s*name:\s*"([^"]+)"/.exec(block)?.[1];
    const gm = /gallery:\s*\[([\s\S]*?)\]/.exec(block);
    const gallery = gm ? [...gm[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    return slug && name ? { slug, name, gallery } : null;
  })
  .filter((c) => c !== null);

const label = (line1, line2) =>
  Buffer.from(
    `<svg width="${TILE_W}" height="${LABEL_H}">` +
      `<rect width="100%" height="100%" fill="#111"/>` +
      `<text x="6" y="12" font-family="sans-serif" font-size="11" fill="#DDBE5E">${line1}</text>` +
      `<text x="6" y="23" font-family="sans-serif" font-size="10" fill="#fff">${line2}</text>` +
      `</svg>`,
  );

let sheet = 0;
for (let i = 0; i < countries.length; i += COUNTRIES_PER_SHEET) {
  const group = countries.slice(i, i + COUNTRIES_PER_SHEET);
  const tiles = [];
  for (const c of group) {
    for (const img of c.gallery.slice(0, COLS)) {
      tiles.push({ country: c.name, file: path.basename(img), src: "public" + img });
    }
    // Pad each country to a full row so rows never mix two countries.
    while (tiles.length % COLS !== 0) tiles.push(null);
  }

  const rows = Math.ceil(tiles.length / COLS);
  const comp = [];
  for (let t = 0; t < tiles.length; t++) {
    const tile = tiles[t];
    if (!tile) continue;
    const x = (t % COLS) * TILE_W;
    const y = Math.floor(t / COLS) * (TILE_H + LABEL_H);
    try {
      comp.push({
        input: await sharp(tile.src).resize(TILE_W, TILE_H, { fit: "cover" }).toBuffer(),
        left: x,
        top: y,
      });
    } catch {
      continue; // missing file; the label still marks the slot
    }
    comp.push({ input: label(tile.country, tile.file), left: x, top: y + TILE_H });
  }

  sheet++;
  const name = `${OUT}/sheet-${String(sheet).padStart(2, "0")}.png`;
  await sharp({
    create: {
      width: COLS * TILE_W,
      height: rows * (TILE_H + LABEL_H),
      channels: 3,
      background: "#000",
    },
  })
    .composite(comp)
    .png()
    .toFile(name);
  console.log(`${name}  ${group.map((g) => g.name).join(", ")}`);
}

console.log(`\n${sheet} sheet(s) for ${countries.length} countries`);
