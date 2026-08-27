const fs = require("fs");
const src = fs.readFileSync("src/data/countries.ts", "utf8");
// Split on each c({ ... }) entry
const entries = src.split(/\n  c\(\{/).slice(1);
const norm = s => s.toLowerCase().replace(/[^a-z]/g, "");
const alias = {
  "unitedkingdom": ["uk", "britain", "london", "scotland", "england"],
  "czechrepublic": ["czech", "prague"],
  "indonesia": ["bali", "ubud", "jakarta"],
  "srilanka": ["srilanka", "colombo", "kandy", "sigiriya"],
  "southkorea": ["korea", "seoul"],
  "hongkong": ["hongkong", "hk"],
  "southafrica": ["southafrica", "capetown", "safrica"],
  "unitedstates": ["usa", "us", "newyork", "america"],
  "uae": ["dubai", "uae", "abudhabi"],
};
let bad = 0, total = 0;
for (const e of entries) {
  const slug = (e.match(/slug:\s*"([^"]+)"/) || [])[1];
  if (!slug) continue;
  const imgs = [...e.matchAll(/"(\/images\/[^"]+)"/g)].map(m => m[1]);
  const remote = [...e.matchAll(/"(https:\/\/[^"]+)"/g)].length;
  const keys = alias[norm(slug)] ?? [norm(slug)];
  for (const img of imgs) {
    total++;
    const file = norm(img.split("/").pop());
    if (!keys.some(k => file.includes(norm(k)))) {
      console.log("  MISMATCH  " + slug.padEnd(18) + img);
      bad++;
    }
  }
  if (remote) console.log("  (remote)  " + slug.padEnd(18) + remote + " unsplash url(s)");
}
console.log("\nlocal country images checked: " + total + " | mismatched: " + bad);
