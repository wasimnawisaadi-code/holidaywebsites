const fs = require("fs");
const read = f => fs.readFileSync(f, "utf8");
const grab = t => new Set([...t.matchAll(/"?slug"?\s*:\s*"([^"]+)"/g)].map(m => m[1]));
const cat = read("src/data/catalogue.ts").split("\n");
const pkg = grab(cat.slice(52, 1782).join("\n"));
const act = grab(read("src/data/inbound-tickets.ts") + read("src/data/inbound-tours.ts"));
const cty = grab(read("src/data/countries.ts"));
const files = [];
(function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = d + "/" + e.name; e.isDirectory() ? w(p) : /\.tsx?$/.test(e.name) && files.push(p); } })("src");
const bad = new Map();
for (const f of files) {
  const t = read(f);
  for (const m of t.matchAll(/["`\/]\/(activities|holidays|countries)\/([a-z0-9-]+)/g)) {
    const kind = m[1], slug = m[2];
    const set = kind === "activities" ? act : kind === "holidays" ? pkg : cty;
    if (!set.has(slug)) {
      const k = "/" + kind + "/" + slug;
      if (!bad.has(k)) bad.set(k, new Set());
      bad.get(k).add(f.replace("src/", ""));
    }
  }
}
console.log("BROKEN LINKS: " + bad.size);
[...bad.entries()].sort().forEach(([k, v]) => console.log("  " + k + "  <- " + [...v].join(", ")));
// image refs
let missImg = 0;
for (const f of [...files, "src/data/inbound-images-manifest.json"]) {
  if (!fs.existsSync(f)) continue;
  for (const m of read(f).matchAll(/["'`](\/images\/[^"'`]+)["'`]/g)) {
    if (!fs.existsSync("public" + m[1])) { console.log("MISSING IMG " + m[1] + " <- " + f); missImg++; }
  }
}
console.log("MISSING IMAGES: " + missImg);
