/**
 * Per-package completeness audit.
 *
 * Catalogue entries hold the card data; package-details-{a,b}.ts hold the
 * long-form detail (overview, gallery, day-by-day). This checks both, verifies
 * every gallery image resolves, and flags remote images that can rot.
 *
 *   node scripts/audit-content.mjs
 */
import { readFileSync, existsSync } from "node:fs";

const cat = readFileSync("src/data/catalogue.ts", "utf8");
const details =
  readFileSync("src/data/package-details-a.ts", "utf8") +
  "\n" +
  readFileSync("src/data/package-details-b.ts", "utf8");

// --- catalogue side -------------------------------------------------------
const slugs = [...cat.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => ({
  slug: m[1],
  at: m.index,
}));

// --- detail side ----------------------------------------------------------
// Each detail entry starts at `"<slug>": {` at two-space indent.
const detailAt = new Map();
for (const m of details.matchAll(/^ {2}"([a-z0-9-]+)":\s*\{/gm)) {
  detailAt.set(m[1], m.index);
}

const problems = [];
const galleryImgs = new Set();

for (const { slug, at } of slugs) {
  const card = cat.slice(at, at + 4000);
  const miss = [];

  if (!/"image":\s*"[^"]+"/.test(card)) miss.push("card:no-image");
  if (!/"priceFrom":\s*\d+/.test(card)) miss.push("card:no-price");

  const dAt = detailAt.get(slug);
  if (dAt === undefined) {
    miss.push("NO DETAIL ENTRY");
  } else {
    // Slice to the next top-level entry so counts stay inside this package.
    const nextStarts = [...detailAt.values()].filter((v) => v > dAt);
    const end = nextStarts.length ? Math.min(...nextStarts) : details.length;
    const body = details.slice(dAt, end);

    const overview = body.match(/"overview":\s*"([^"]*)"/)?.[1] ?? "";
    if (overview.length < 200) miss.push(`thin-overview(${overview.length})`);

    const gal = body.match(/"gallery":\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const imgs = [...gal.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    imgs.forEach((i) => galleryImgs.add(i));
    if (imgs.length < 4) miss.push(`gallery(${imgs.length})`);

    const days = (body.match(/"day":\s*\d+/g) ?? []).length;
    if (days < 3) miss.push(`itinerary(${days} days)`);

    if (!/"inclusions":\s*\[|"includes":\s*\[/.test(body)) miss.push("no-inclusions");
  }

  if (miss.length) problems.push(`${slug.padEnd(30)} ${miss.join(", ")}`);
}

console.log(`${slugs.length} catalogue packages · ${detailAt.size} detail entries\n`);
console.log(problems.length ? "ISSUES:\n" + problems.join("\n") : "All packages complete.");

// --- image resolution -----------------------------------------------------
const localMissing = [];
let remote = 0;
for (const i of galleryImgs) {
  if (i.startsWith("/")) {
    if (!existsSync("public" + i)) localMissing.push(i);
  } else if (i.startsWith("http")) {
    remote++;
  }
}
console.log(
  `\n${galleryImgs.size} gallery images: ${remote} remote, ${galleryImgs.size - remote} local.`,
);
if (localMissing.length) {
  console.log(`MISSING LOCAL (${localMissing.length}):\n` + localMissing.join("\n"));
} else {
  console.log("All local gallery images exist.");
}
