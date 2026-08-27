import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();

async function getImageMeta(relPath) {
  if (!relPath) return { exists: false, error: "empty" };
  const cleanPath = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  const fullPath = path.join(root, "public", cleanPath);
  if (!fs.existsSync(fullPath)) {
    return { exists: false, fullPath };
  }
  try {
    const meta = await sharp(fullPath).metadata();
    const stat = fs.statSync(fullPath);
    return {
      exists: true,
      width: meta.width,
      height: meta.height,
      format: meta.format,
      sizeKb: Math.round(stat.size / 1024),
      fullPath,
    };
  } catch (err) {
    return { exists: true, error: err.message, fullPath };
  }
}

async function auditPackages() {
  console.log("\n==================== 1. CATALOGUE PACKAGES ====================");
  const cat = fs.readFileSync("src/data/catalogue.ts", "utf8");
  // parse packages array from TS
  const pkgBlocks = cat.split(/{\s*"id":\s*"/).slice(1);
  console.log(`Found ${pkgBlocks.length} package blocks`);

  const list = [];
  for (const b of pkgBlocks) {
    const id = b.split('"')[0];
    const slug = /"slug":\s*"([^"]+)"/.exec(b)?.[1] || "";
    const title = /"title":\s*"([^"]+)"/.exec(b)?.[1] || "";
    const country = /"country":\s*"([^"]+)"/.exec(b)?.[1] || "";
    const city = /"city":\s*"([^"]+)"/.exec(b)?.[1] || "";
    const image = /"image":\s*"([^"]+)"/.exec(b)?.[1] || "";
    
    const meta = await getImageMeta(image);
    list.push({ id, slug, title, country, city, image, meta });
    console.log(`[PKG] ${slug.padEnd(30)} | ${country.padEnd(16)} | ${meta.exists ? `${meta.width}x${meta.height} (${meta.sizeKb}KB)` : "MISSING!"} | img: ${image}`);
  }
  return list;
}

async function auditCountries() {
  console.log("\n==================== 2. COUNTRIES & GALLERIES ====================");
  const ctry = fs.readFileSync("src/data/countries.ts", "utf8");
  const blocks = ctry.split("c({").slice(1);
  console.log(`Found ${blocks.length} countries`);

  const list = [];
  for (const b of blocks) {
    const slug = /slug:\s*"([^"]+)"/.exec(b)?.[1] || "";
    const name = /\n\s*name:\s*"([^"]+)"/.exec(b)?.[1] || "";
    const image = /\n\s*image:\s*\n?\s*"([^"]+)"/.exec(b)?.[1] || "";
    const galleryMatch = /gallery:\s*\[([\s\S]*?)\]/.exec(b);
    const gallery = galleryMatch ? [...galleryMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]) : [];
    
    const heroMeta = await getImageMeta(image);
    const galleryMeta = await Promise.all(gallery.map(g => getImageMeta(g)));
    
    list.push({ slug, name, image, heroMeta, gallery, galleryMeta });
    const missingCount = [heroMeta, ...galleryMeta].filter(m => !m.exists).length;
    console.log(`[CTRY] ${slug.padEnd(25)} | Hero: ${heroMeta.exists ? `${heroMeta.width}x${heroMeta.height}` : "MISSING"} | Gal: ${gallery.length} imgs (${missingCount} missing) | Lead: ${image}`);
  }
  return list;
}

async function auditInbound() {
  console.log("\n==================== 3. INBOUND (DUBAI/UAE TOURS & TICKETS) ====================");
  if (fs.existsSync("src/data/inbound-tickets.ts")) {
    const tickets = fs.readFileSync("src/data/inbound-tickets.ts", "utf8");
    const imgMatches = [...tickets.matchAll(/image:\s*"([^"]+)"/g)].map(m => m[1]);
    console.log(`Inbound tickets total images referenced: ${imgMatches.length}`);
    let missing = 0;
    for (const img of imgMatches) {
      const meta = await getImageMeta(img);
      if (!meta.exists) {
        console.log(`  MISSING TICKET IMG: ${img}`);
        missing++;
      }
    }
    console.log(`  Tickets missing images: ${missing}`);
  }
  
  if (fs.existsSync("src/data/inbound-tours.ts")) {
    const tours = fs.readFileSync("src/data/inbound-tours.ts", "utf8");
    const imgMatches = [...tours.matchAll(/image:\s*"([^"]+)"/g)].map(m => m[1]);
    console.log(`Inbound tours total images referenced: ${imgMatches.length}`);
    let missing = 0;
    for (const img of imgMatches) {
      const meta = await getImageMeta(img);
      if (!meta.exists) {
        console.log(`  MISSING TOUR IMG: ${img}`);
        missing++;
      }
    }
    console.log(`  Tours missing images: ${missing}`);
  }
}

async function main() {
  await auditPackages();
  await auditCountries();
  await auditInbound();
}

main().catch(console.error);
