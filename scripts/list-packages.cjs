const fs = require('fs');
const path = require('path');

const catalogue = fs.readFileSync('src/data/catalogue.ts', 'utf8');

// Simple regex to extract slug, title, country, image
const packageRegex = /"slug":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"destination":\s*"([^"]+)",\s*"country":\s*"([^"]+)"[\s\S]*?"image":\s*"([^"]+)"/g;

let match;
const packages = [];
while ((match = packageRegex.exec(catalogue)) !== null) {
  packages.push({
    slug: match[1],
    title: match[2],
    destination: match[3],
    country: match[4],
    image: match[5]
  });
}

console.log('Total packages:', packages.length);
packages.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.country}] ${p.title} -> ${p.image.substring(0, 60)}...`);
});
