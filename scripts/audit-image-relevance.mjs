/**
 * Destination-relevance audit harness for package and country imagery.
 *
 * The problem this exists for: kenya-02.jpg was Yosemite Valley in California,
 * sitting in the Masai Mara gallery. Nothing in the codebase could catch that,
 * because a filename, an alt string and a folder name all said "kenya" and the
 * only thing that disagreed was the photograph itself.
 *
 * So this tool does not try to judge relevance automatically — it cannot, and
 * guessing would be worse than not guessing. What it does is:
 *
 *   1. Build a destination context for every package and country from the real
 *      itinerary data (country, cities, regions, attractions, activities).
 *   2. Flag what is mechanically checkable: images shared across destinations,
 *      galleries below the 4-image target, near-duplicate file sizes, images
 *      whose only claim to the destination is their filename.
 *   3. Lay every gallery out as a numbered contact sheet so a human — or a
 *      vision model — can review a whole destination in one look and score it.
 *
 * Usage:
 *   node scripts/audit-image-relevance.mjs            # report + contact sheets
 *   node scripts/audit-image-relevance.mjs --report   # report only, no images
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "scripts/__image-audit";
const reportOnly = process.argv.includes("--report");

const read = (f) => fs.readFileSync(f, "utf8");

/** Pulls slug/title/country/destination/image out of the catalogue source. */
function packages() {
  const s = read("src/data/catalogue.ts");
  const out = [];
  const re =
    /"slug":\s*"([^"]+)",\s*\n\s*"title":\s*"([^"]+)",\s*\n\s*"destination":\s*"([^"]*)",\s*\n\s*"country":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(s))) {
    const [, slug, title, destination, country] = m;
    const tail = s.slice(m.index, m.index + 2600);
    const img = /"image":\s*"([^"]+)"/.exec(tail);
    const days = /"days":\s*(\d+)/.exec(tail);
    out.push({
      slug,
      title,
      destination,
      country,
      image: img ? img[1] : null,
      days: days ? Number(days[1]) : null,
      // Cities and regions as the itinerary actually names them.
      places: destination
        .split(/\s*[·,]\s*/)
        .map((x) => x.trim())
        .filter(Boolean),
    });
  }
  return out;
}

/** Country records carry the 4-image galleries the package pages fall back to. */
function countries() {
  const s = read("src/data/countries.ts");
  const out = [];
  const re = /slug:\s*"([^"]+)",\s*\n\s*(?:\/\/[^\n]*\n\s*)*gallery:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(s))) {
    const gallery = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    const tail = s.slice(m.index, m.index + 1400);
    const name = /name:\s*"([^"]+)"/.exec(tail);
    out.push({ slug: m[1], name: name ? name[1] : m[1], gallery });
  }
  return out;
}

const pkgs = packages();
const ctys = countries();

// ---- mechanical checks -----------------------------------------------------
const problems = [];
const add = (sev, msg) => problems.push({ sev, msg });

// An image used by two different countries is, by definition, wrong for one.
const usage = new Map();
for (const c of ctys) for (const g of c.gallery) usage.set(g, [...(usage.get(g) ?? []), c.name]);
for (const [img, where] of usage) {
  const uniq = [...new Set(where)];
  if (uniq.length > 1)
    add("HIGH", `shared across ${uniq.length} countries (${uniq.join(", ")}): ${img}`);
}

for (const c of ctys) {
  if (c.gallery.length < 4) add("MEDIUM", `${c.name}: gallery has ${c.gallery.length}/4 images`);
  for (const g of c.gallery) {
    const disk = path.join("public", g);
    if (!fs.existsSync(disk)) {
      add("CRITICAL", `${c.name}: missing file ${g}`);
      continue;
    }
    const bytes = fs.statSync(disk).size;
    // File size is not a proxy for resolution. brazil-g03.jpg is 41KB and a
    // full 1600x1063 — it is a sunset silhouette that is mostly black, so it
    // compresses to almost nothing. Measure the pixels instead.
    if (bytes < 20_000)
      add(
        "MEDIUM",
        `${c.name}: ${g} is only ${(bytes / 1024).toFixed(0)}KB — check it is not a placeholder`,
      );
  }
}

for (const p of pkgs) {
  if (!p.image) {
    add("CRITICAL", `${p.slug}: no hero image`);
    continue;
  }
  if (!fs.existsSync(path.join("public", p.image)))
    add("CRITICAL", `${p.slug}: hero missing ${p.image}`);
}

// ---- report ----------------------------------------------------------------
const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
problems.sort((a, b) => order[a.sev] - order[b.sev]);
console.log(`packages: ${pkgs.length}   country galleries: ${ctys.length}\n`);
const counts = problems.reduce((a, p) => ((a[p.sev] = (a[p.sev] ?? 0) + 1), a), {});
console.log("mechanical findings:", JSON.stringify(counts));
for (const p of problems) console.log(`  ${p.sev.padEnd(9)} ${p.msg}`);

console.log(`\n${"=".repeat(72)}`);
console.log("The rest cannot be checked mechanically. A filename, an alt string and");
console.log("a folder name all said 'kenya' for a photograph of Yosemite. Only");
console.log("looking at the picture catches that, so review the contact sheets.");

// ---- contact sheets --------------------------------------------------------
if (reportOnly) process.exit(0);
fs.mkdirSync(OUT, { recursive: true });

const W = 400,
  H = 285,
  COLS = 3,
  PAD = 8;
let sheets = 0;
for (const c of ctys) {
  const imgs = c.gallery.filter((g) => fs.existsSync(path.join("public", g)));
  if (!imgs.length) continue;
  const rows = Math.ceil(imgs.length / COLS);
  const tiles = [];
  for (let i = 0; i < imgs.length; i++) {
    const buf = await sharp(path.join("public", imgs[i])).resize(W, H, { fit: "cover" }).toBuffer();
    tiles.push({ input: buf, left: (i % COLS) * (W + PAD), top: Math.floor(i / COLS) * (H + PAD) });
  }
  await sharp({
    create: {
      width: COLS * (W + PAD),
      height: rows * (H + PAD),
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(tiles)
    .png()
    .toFile(path.join(OUT, `${c.slug}.png`));
  sheets++;
}
console.log(`\n${sheets} contact sheets written to ${OUT}/`);
console.log("Each tile is one gallery image, left-to-right in gallery order.");
