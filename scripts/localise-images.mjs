/**
 * Downloads every hot-linked image into the repo and rewrites the references.
 *
 * Remote images rot without warning: three Unsplash URLs on this site died in
 * August and nobody noticed until a page rendered a grey box. Anything the site
 * depends on should live in the repo.
 *
 * Filenames are derived from the record that uses the image — country slug plus
 * a role — so the folder stays readable and a wrong-country image is obvious by
 * name alone. Where one URL is used by several records the first name wins and
 * the rest point at it, which also collapses duplicates.
 *
 * Downloads are resized to 1600px on the long edge and re-encoded, matching the
 * treatment already applied to the rest of public/images.
 *
 *   node scripts/localise-images.mjs --dry    inventory only, writes nothing
 *   node scripts/localise-images.mjs          download and rewrite
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
const OUT_DIR = "public/images/destinations";
const MAX_EDGE = 1600;
const QUALITY = 82;

const FILES = [
  "src/data/countries.ts",
  "src/data/catalogue.ts",
  "src/data/inbound-tours.ts",
  "src/data/inbound-tickets.ts",
  "src/data/package-details.ts",
  "src/data/package-details-a.ts",
  "src/data/package-details-b.ts",
].filter((f) => fs.existsSync(f));

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Walks a data file and pairs every remote URL with the nearest preceding
 * `slug:` or `"slug":`, which is the record it belongs to. Reading backwards
 * from the URL is what lets a generic filename become `japan-03.jpg`.
 */
function collect(file) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");
  const found = [];
  let currentSlug = "unknown";
  let counter = new Map();

  for (const line of lines) {
    const slugMatch = /(?:^|\s)"?slug"?:\s*"([^"]+)"/.exec(line);
    if (slugMatch?.[1]) currentSlug = slugMatch[1];

    const urls = line.match(/https:\/\/images\.unsplash\.com\/[^"'\s)]+/g);
    if (!urls) continue;
    for (const url of urls) {
      const n = (counter.get(currentSlug) ?? 0) + 1;
      counter.set(currentSlug, n);
      found.push({ file, url, slug: currentSlug, index: n });
    }
  }
  return found;
}

const all = FILES.flatMap(collect);

// One URL can appear in several records; the first sighting names the file.
const byUrl = new Map();
for (const hit of all) {
  if (!byUrl.has(hit.url)) byUrl.set(hit.url, hit);
}

console.log(`remote references : ${all.length}`);
console.log(`unique URLs       : ${byUrl.size}`);
console.log(`files touched     : ${FILES.length}`);

if (DRY) {
  const perFile = new Map();
  for (const h of all) perFile.set(h.file, (perFile.get(h.file) ?? 0) + 1);
  console.log("");
  for (const [f, n] of perFile) console.log(`  ${String(n).padStart(4)}  ${f}`);
  console.log("\n[dry run] nothing downloaded");
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const mapping = new Map(); // url -> /images/destinations/<name>
let ok = 0;
let failed = 0;
const failures = [];

for (const [url, hit] of byUrl) {
  const base = `${slugify(hit.slug)}-${String(hit.index).padStart(2, "0")}`;
  const name = `${base}.jpg`;
  const dest = path.join(OUT_DIR, name);

  if (fs.existsSync(dest)) {
    mapping.set(url, `/images/destinations/${name}`);
    ok++;
    continue;
  }

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    let pipe = sharp(buf).rotate();
    if (Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE) {
      pipe = pipe.resize({
        width: (meta.width ?? 0) >= (meta.height ?? 0) ? MAX_EDGE : undefined,
        height: (meta.height ?? 0) > (meta.width ?? 0) ? MAX_EDGE : undefined,
        withoutEnlargement: true,
      });
    }
    await pipe.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true }).toFile(dest);
    mapping.set(url, `/images/destinations/${name}`);
    ok++;
    if (ok % 10 === 0) console.log(`  downloaded ${ok}/${byUrl.size}`);
  } catch (err) {
    failed++;
    failures.push(`${hit.slug}  ${url.slice(0, 70)}  ${err.message}`);
  }
}

console.log(`\ndownloaded : ${ok}`);
console.log(`failed     : ${failed}`);
failures.forEach((f) => console.log("  " + f));

// Rewrite every reference. A URL that failed to download keeps its remote
// value — a broken local path would be worse than a remote one that still works.
let rewritten = 0;
for (const file of FILES) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [url, local] of mapping) {
    if (text.includes(url)) {
      text = text.split(url).join(local);
      rewritten++;
    }
  }
  if (text !== before) fs.writeFileSync(file, text);
}

const remaining = FILES.reduce(
  (n, f) => n + (fs.readFileSync(f, "utf8").match(/images\.unsplash\.com/g) ?? []).length,
  0,
);

const bytes = fs
  .readdirSync(OUT_DIR)
  .reduce((t, f) => t + fs.statSync(path.join(OUT_DIR, f)).size, 0);

console.log(`\nreferences rewritten     : ${rewritten}`);
console.log(`remote refs still in src : ${remaining}`);
console.log(`destinations folder      : ${(bytes / 1048576).toFixed(1)}MB`);
