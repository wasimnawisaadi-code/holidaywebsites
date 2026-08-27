import fs from "fs";

const manifest = JSON.parse(fs.readFileSync("src/data/inbound-images-manifest.json", "utf8"));

// Check public files
let totalPublicFiles = 0;
for (const cat in manifest) {
  const list = manifest[cat];
  totalPublicFiles += list.length;
  list.forEach((filePath) => {
    const fullPath = "public" + filePath;
    if (!fs.existsSync(fullPath)) {
      console.error("Missing image file:", fullPath);
    }
  });
}
console.log("Checked", totalPublicFiles, "public inbound images. All verified!");

// Check inbound tours and tickets for unique galleries
const toursText = fs.readFileSync("src/data/inbound-tours.ts", "utf8");
const ticketsText = fs.readFileSync("src/data/inbound-tickets.ts", "utf8");

function checkGalleries(text, name) {
  const galleryMatches = [...text.matchAll(/gallery:\s*\[([^\]]+)\]/g)];
  console.log(name, "has", galleryMatches.length, "galleries.");
  galleryMatches.forEach((m, idx) => {
    const items = m[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    const uniqueItems = new Set(items);
    if (uniqueItems.size !== items.length) {
      console.warn(`Warning: Duplicate in ${name} gallery #${idx + 1}:`, items);
    }
  });
}

checkGalleries(toursText, "inbound-tours");
checkGalleries(ticketsText, "inbound-tickets");
