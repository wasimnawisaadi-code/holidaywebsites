const fs = require("fs");
// Country/place keywords -> what the filename should plausibly contain.
const t = fs.readFileSync("src/data/catalogue.ts", "utf8").split("\n").slice(52, 1782).join("\n");
const re = /"slug":\s*"([^"]+)"[\s\S]*?"country":\s*"([^"]+)"[\s\S]*?"image":\s*"([^"]+)"/g;
const norm = s => s.toLowerCase().replace(/[^a-z]/g, "");
const alias = {
  "saudiarabia": ["umrah", "makkah", "madinah", "haram", "nabawi", "saudi"],
  "bosniaandherzegovina": ["bosnia", "mostar", "sarajevo", "kravice", "blagaj", "starimost"],
  "indonesia": ["bali", "ubud", "seminyak", "tanahlot", "bratan", "tegallalang", "nusapenida"],
  "azerbaijan": ["baku", "azerbaijan", "gabala", "gobustan", "flame", "maiden", "heydar"],
  "oman": ["oman", "salalah"],
  "unitedarabemirates": ["dubai", "uae", "abudhabi", "burj"],
};
let m, rows = [], bad = 0;
while ((m = re.exec(t))) {
  const [, slug, country, image] = m;
  const file = norm(image.split("/").pop());
  const key = norm(country);
  const keys = alias[key] ?? [key];
  const hit = keys.some(k => file.includes(norm(k)));
  rows.push({ slug, country, image, hit });
  if (!hit) bad++;
}
console.log("=== PACKAGE HERO IMAGES (" + rows.length + ") ===");
rows.forEach(r => console.log((r.hit ? "  ok   " : "  MISMATCH? ") + r.country.padEnd(24) + r.image));
console.log("\nunmatched: " + bad);
