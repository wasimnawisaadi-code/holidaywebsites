const fs = require('fs');

const a = fs.readFileSync('src/data/package-details-a.ts', 'utf8');
const b = fs.readFileSync('src/data/package-details-b.ts', 'utf8');

const regex = /https:\/\/images\.unsplash\.com\/[^\s"']+/g;
const allUrls = [...(a.match(regex) || []), ...(b.match(regex) || [])];

console.log('Total Unsplash images in package details:', allUrls.length);
console.log('Unique images:', new Set(allUrls).size);
