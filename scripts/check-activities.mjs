import fs from "fs";

const t1 = fs.readFileSync("src/data/inbound-tours.ts", "utf8");
const t2 = fs.readFileSync("src/data/inbound-tickets.ts", "utf8");
const manifest = JSON.parse(fs.readFileSync("src/data/inbound-images-manifest.json", "utf8"));

const getSlugs = (content) => {
  const matches = content.match(/slug:\s*"([^"]+)"/g) || [];
  return matches.map((m) => m.replace(/slug:\s*"|"/g, ""));
};

const tourSlugs = getSlugs(t1);
const ticketSlugs = getSlugs(t2);

console.log("Tours Slugs:", tourSlugs);
console.log("Ticket Slugs:", ticketSlugs);
console.log("Manifest Categories:", Object.keys(manifest));
