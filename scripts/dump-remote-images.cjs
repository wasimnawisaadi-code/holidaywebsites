const fs = require("fs");
const src = fs.readFileSync("src/data/countries.ts", "utf8");
const entries = src.split(/\n  c\(\{/).slice(1);
const rows = [];
for (const e of entries) {
  const slug = (e.match(/slug:\s*"([^"]+)"/) || [])[1];
  if (!slug) continue;
  const main = (e.match(/\n\s*image:\s*\n?\s*"([^"]+)"/) || [])[1];
  if (main && main.startsWith("http")) rows.push({ slug, kind: "main", url: main });
  const gal = e.match(/gallery:\s*\[([\s\S]*?)\]/);
  if (gal) {
    [...gal[1].matchAll(/"(https:\/\/[^"]+)"/g)].forEach((m, i) =>
      rows.push({ slug, kind: "gal" + i, url: m[1] })
    );
  }
}
fs.writeFileSync("scripts/__remote-images.json", JSON.stringify(rows, null, 2));
console.log("remote image refs: " + rows.length);
console.log("unique urls: " + new Set(rows.map(r => r.url)).size);
console.log("countries affected: " + new Set(rows.map(r => r.slug)).size);
