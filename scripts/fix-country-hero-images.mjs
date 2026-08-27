/**
 * Points country hero images at the correct local photographs.
 *
 * countries.ts carried the same wrong-country Unsplash URLs already fixed in
 * catalogue.ts: Uzbekistan showed Mount Bromo (Indonesia), Armenia showed
 * Mount Fuji, Sri Lanka showed a Maldives breakfast tray. Same photo IDs, same
 * bug, second file.
 */
import fs from "node:fs";
const file = "src/data/countries.ts";
let s = fs.readFileSync(file, "utf8");

const MAP = {
  uzbekistan: "/images/destinations/uzbekistan-registan.jpg",
  armenia: "/images/destinations/armenia-yerevan-ararat.jpg",
  "sri-lanka": "/images/destinations/sri-lanka-nine-arch.jpg",
  kazakhstan: "/images/destinations/kazakhstan-charyn.jpg",
  tanzania: "/images/destinations/tanzania-serengeti.jpg",
};

let n = 0;
for (const [slug, img] of Object.entries(MAP)) {
  const at = s.indexOf(`slug: "${slug}"`);
  if (at < 0) { console.log("no country:", slug); continue; }
  const k = s.indexOf("image:", at);
  if (k < 0) { console.log("no image field:", slug); continue; }
  const q1 = s.indexOf('"', k);
  const q2 = s.indexOf('"', q1 + 1);
  const old = s.slice(q1 + 1, q2);
  if (old.startsWith("/images/")) { console.log(slug, "already local"); continue; }
  s = s.slice(0, q1 + 1) + img + s.slice(q2);
  console.log(slug.padEnd(12), "->", img);
  n++;
}
fs.writeFileSync(file, s);
console.log("updated:", n);
