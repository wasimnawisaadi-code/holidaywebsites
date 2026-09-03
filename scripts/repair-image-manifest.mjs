/**
 * Repoints the gallery manifest at the files that actually exist.
 *
 * An earlier pass converted the photography to WebP and deleted the JPEG
 * originals, but this manifest still named the .jpg files. 168 of its 555
 * entries pointed at nothing — verified against production, where
 * /images/inbound/abu-dhabi-city-tour/img-1.jpg returns 404 while the .webp
 * beside it returns 200. Every activity gallery on the site had holes in it.
 *
 * Nothing is guessed: an entry is only rewritten when the same basename exists
 * in another format in the same folder.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const MANIFEST = "src/data/inbound-images-manifest.json";
const EXTS = [".webp", ".avif", ".jpg", ".jpeg", ".png"];
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

let fixed = 0,
  dropped = 0,
  kept = 0;
for (const [slug, list] of Object.entries(manifest)) {
  const out = [];
  for (const src of list) {
    if (existsSync("public" + src)) {
      out.push(src);
      kept++;
      continue;
    }
    const base = src.replace(/\.[a-z]+$/i, "");
    const alt = EXTS.map((e) => base + e).find((c) => existsSync("public" + c));
    if (alt) {
      out.push(alt);
      fixed++;
    } else {
      dropped++;
      console.log(`  dropped (no file in any format): ${src}`);
    }
  }
  manifest[slug] = out;
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`\n  ${kept} already correct, ${fixed} repointed, ${dropped} dropped`);
