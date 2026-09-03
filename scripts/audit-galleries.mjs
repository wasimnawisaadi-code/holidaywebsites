/**
 * Finds photographs shared between the galleries of different countries.
 *
 * The earlier content audit only compared each country's single hero `image`.
 * The `gallery` arrays were never checked, and that is where the real damage
 * was: the same Unsplash URL had been pasted into several countries at once, so
 * Thailand's gallery showed Ha Long Bay, Morocco's showed Petra, and Kazakhstan's
 * showed Hong Kong harbour.
 *
 * A photograph appearing under two different countries is always wrong. One of
 * them is showing a customer a place they are not being sold.
 *
 * Reports every clash and, for each, which country the file is actually named
 * after — that is usually the one it belongs to.
 */
import fs from "node:fs";

const text = fs.readFileSync("src/data/countries.ts", "utf8");

const records = text
  .split("c({")
  .slice(1)
  .map((block) => {
    const slug = /slug:\s*"([^"]+)"/.exec(block)?.[1];
    const name = /\n\s*name:\s*"([^"]+)"/.exec(block)?.[1];
    const hero = /\n\s*image:\s*\n?\s*"([^"]+)"/.exec(block)?.[1];
    const galleryBlock = /gallery:\s*\[([\s\S]*?)\]/.exec(block)?.[1] ?? "";
    const gallery = [...galleryBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    return slug && name ? { slug, name, hero, gallery } : null;
  })
  .filter((r) => r !== null);

// image path -> set of country names using it (hero or gallery)
const usage = new Map();
for (const r of records) {
  for (const img of [r.hero, ...r.gallery].filter(Boolean)) {
    if (!usage.has(img)) usage.set(img, new Set());
    usage.get(img).add(r.name);
  }
}

const clashes = [...usage.entries()]
  .filter(([, countries]) => countries.size > 1)
  .sort((a, b) => b[1].size - a[1].size);

console.log(`countries        ${records.length}`);
console.log(`distinct images  ${usage.size}`);
console.log(`shared images    ${clashes.length}`);
console.log("");

if (!clashes.length) {
  console.log("No photograph is shared between two countries.");
  process.exit(0);
}

for (const [img, countries] of clashes) {
  const file = img.split("/").pop() ?? img;
  // The filename carries the country it was first filed under, which is the
  // best available hint at where it actually belongs.
  const named = file
    .replace(/-\d+\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");
  console.log(`${file}`);
  console.log(`    used by : ${[...countries].join(", ")}`);
  console.log(`    named   : ${named}`);
}

console.log(`\n${clashes.length} image(s) appear under more than one country.`);
process.exit(1);
