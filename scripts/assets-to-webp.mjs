/**
 * Converts the bundled hero and tile photography to WebP.
 *
 * An earlier pass converted public/images to WebP and stopped there.
 * src/assets was missed entirely: 27 JPEGs, 4.4MB between them, imported as
 * modules so they never showed up in a scan of the public folder.
 *
 * hero-dubai.jpg is 252KB and is the largest contentful paint on /dubai,
 * measured at 9.4 seconds on a throttled phone.
 *
 * Writes `<name>.webp` at the original size and `<name>-sm.webp` at 720px, and
 * rewrites the imports. The JPEGs are deleted — nothing else references them.
 */
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const DIR = "src/assets";
const jpegs = readdirSync(DIR).filter((f) => /\.jpe?g$/i.test(f));

let before = 0;
let after = 0;
const renamed = new Map();

for (const f of jpegs) {
  const src = `${DIR}/${f}`;
  const base = f.replace(/\.jpe?g$/i, "");
  const out = `${DIR}/${base}.webp`;
  const sm = `${DIR}/${base}-sm.webp`;
  const size = statSync(src).size;

  await sharp(src).webp({ quality: 82, effort: 5 }).toFile(out);
  await sharp(src)
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(sm);

  const newSize = statSync(out).size;
  if (newSize >= size) {
    unlinkSync(out);
    unlinkSync(sm);
    console.log(`  kept as jpeg (webp was larger): ${f}`);
    continue;
  }

  unlinkSync(src);
  before += size;
  after += newSize + statSync(sm).size;
  renamed.set(`@/assets/${f}`, `@/assets/${base}.webp`);
  console.log(
    `  ${String(Math.round(size / 1024)).padStart(4)} -> ${String(Math.round(newSize / 1024)).padStart(3)} KB` +
      ` (+${String(Math.round(statSync(sm).size / 1024)).padStart(3)} KB at 720px)  ${f}`,
  );
}

// Rewrite every import that named a JPEG.
let touched = 0;
for (const file of execSync("git ls-files src", { encoding: "utf8" }).trim().split("\n")) {
  if (!/\.(tsx?|ts)$/.test(file)) continue;
  const raw = readFileSync(file);
  const crlf = raw.includes("\r\n");
  let s = raw.toString("utf8").replace(/\r\n/g, "\n");
  const orig = s;
  for (const [from, to] of renamed) s = s.split(from).join(to);
  if (s !== orig) {
    writeFileSync(file, crlf ? s.replace(/\n/g, "\r\n") : s, "utf8");
    touched++;
  }
}

console.log(`\n  ${renamed.size} converted, ${touched} files had imports rewritten`);
console.log(`  ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB (both sizes together)`);
