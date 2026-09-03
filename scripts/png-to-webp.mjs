/**
 * Converts the gallery's PNG photographs to WebP.
 *
 * PNG is lossless, which is right for a logo and wrong for a photograph: seven
 * of them were costing 4.8MB between them, one at 1.4MB on its own. The same
 * pictures as WebP are a fraction of that with no difference anyone can see on
 * a phone.
 *
 * Every reference lives in one manifest, so the rename is safe to do wholesale.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, statSync, unlinkSync, existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join, sep as SEP } from "node:path";

const MANIFEST = "src/data/inbound-images-manifest.json";
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

const pngs = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.toLowerCase().endsWith(".png")) pngs.push(p.split(SEP).join("/"));
  }
})("public/images/inbound");

let before = 0,
  after = 0;
const renamed = new Map();
for (const png of pngs) {
  const webp = png.replace(/\.png$/i, ".webp");
  if (existsSync(webp)) {
    console.log(`  skip (webp already exists): ${png}`);
    continue;
  }
  const size = statSync(png).size;
  await sharp(png).webp({ quality: 82, effort: 5 }).toFile(webp);
  const newSize = statSync(webp).size;
  if (newSize >= size) {
    unlinkSync(webp);
    continue;
  }
  unlinkSync(png);
  before += size;
  after += newSize;
  renamed.set("/" + png.replace(/^public\//, ""), "/" + webp.replace(/^public\//, ""));
  console.log(
    `  ${String(Math.round(size / 1024)).padStart(5)} -> ${String(Math.round(newSize / 1024)).padStart(4)} KB  ${png.split("/").slice(-2).join("/")}`,
  );
}

let rewritten = 0;
for (const [slug, list] of Object.entries(manifest)) {
  manifest[slug] = list.map((src) => {
    const to = renamed.get(src);
    if (to) {
      rewritten++;
      return to;
    }
    return src;
  });
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`\n  ${renamed.size} converted, ${rewritten} manifest references rewritten`);
console.log(`  ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB`);
