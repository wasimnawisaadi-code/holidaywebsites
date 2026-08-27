const fs = require('fs');

console.log('==============================================');
console.log('🔍 FULL DETAILED AUDIT OF EVERY DESTINATION IMAGE');
console.log('==============================================\n');

// 1. Audit Catalogue Packages
console.log('--- 1. HOLIDAY PACKAGES IN CATALOGUE.TS ---');
const catalogue = fs.readFileSync('src/data/catalogue.ts', 'utf8');
const pkgRegex = /"slug":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"destination":\s*"([^"]+)",\s*"country":\s*"([^"]+)"[\s\S]*?"image":\s*"([^"]+)"/g;
let m;
let pkgIndex = 1;
while ((m = pkgRegex.exec(catalogue)) !== null) {
  console.log(`${pkgIndex++}. [${m[4]}] ${m[2]}`);
  console.log(`   Destination: ${m[3]}`);
  console.log(`   Image URL: ${m[5]}`);
}

// 2. Audit All 40 Countries in countries.ts
console.log('\n--- 2. ALL 40 COUNTRIES IN COUNTRIES.TS ---');
const countriesFile = fs.readFileSync('src/data/countries.ts', 'utf8');
const countryBlocks = countriesFile.split(/\n\s*c\(\{/);

countryBlocks.slice(1).forEach((block, idx) => {
  const name = (block.match(/name:\s*"([^"]+)"/) || [])[1] || 'Unknown';
  const region = (block.match(/region:\s*"([^"]+)"/) || [])[1] || 'Unknown';
  const hero = (block.match(/image:\s*\n?\s*"([^"]+)"/) || [])[1] || 'No hero';
  const galleryMatch = block.match(/gallery:\s*\[([\s\S]*?)\]/);
  const gallery = galleryMatch ? (galleryMatch[1].match(/"https:[^"]+"/g) || []) : [];
  
  console.log(`${idx + 1}. [${region}] ${name}`);
  console.log(`   Hero: ${hero}`);
  console.log(`   Gallery (${gallery.length}):`);
  gallery.forEach((g, gi) => console.log(`     (${gi + 1}) ${g}`));
});
