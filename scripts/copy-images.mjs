import fs from "fs";
import path from "path";

const srcRoot = "DST Website Pictures";
const destRoot = "public/images/inbound";

if (!fs.existsSync("public/images")) fs.mkdirSync("public/images", { recursive: true });
if (!fs.existsSync(destRoot)) fs.mkdirSync(destRoot, { recursive: true });

function sanitize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const manifest = {};

function processDir(dirPath, relativeCategory = "") {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      const nextCategory = relativeCategory ? `${relativeCategory}/${item.name}` : item.name;
      processDir(fullPath, nextCategory);
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext)) {
        const catKey = sanitize(relativeCategory || "general");
        if (!manifest[catKey]) manifest[catKey] = [];

        const safeDir = path.join(destRoot, catKey);
        if (!fs.existsSync(safeDir)) fs.mkdirSync(safeDir, { recursive: true });

        const fileIndex = manifest[catKey].length + 1;
        const targetFileName = `img-${fileIndex}${ext}`;
        const targetPath = path.join(safeDir, targetFileName);

        fs.copyFileSync(fullPath, targetPath);
        manifest[catKey].push(`/images/inbound/${catKey}/${targetFileName}`);
      }
    }
  }
}

processDir(srcRoot);

fs.writeFileSync("src/data/inbound-images-manifest.json", JSON.stringify(manifest, null, 2));
console.log("Categories processed:", Object.keys(manifest).length);
let totalImgs = 0;
for (const k in manifest) {
  totalImgs += manifest[k].length;
}
console.log("Total images copied:", totalImgs);
