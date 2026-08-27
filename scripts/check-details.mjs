import fs from "fs";

const catalogue = fs.readFileSync("src/data/catalogue.ts", "utf8");
const pA = fs.readFileSync("src/data/package-details-a.ts", "utf8");
const pB = fs.readFileSync("src/data/package-details-b.ts", "utf8");

const packageSlugs = [...catalogue.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const detailsSlugs = [...pA.matchAll(/"([^"]+)":\s*{/g), ...pB.matchAll(/"([^"]+)":\s*{/g)].map(
  (m) => m[1],
);

console.log("Total packages:", packageSlugs.length);
console.log("Total detail entries:", detailsSlugs.length);

const missing = packageSlugs.filter((s) => !detailsSlugs.includes(s));
console.log("Missing detail entries:", missing);
