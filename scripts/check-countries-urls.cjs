const fs = require('fs');

const countriesData = fs.readFileSync('src/data/countries.ts', 'utf8');

// Find all image URLs
const urlRegex = /https:\/\/images\.unsplash\.com\/[^\s"',]+/g;
const allUrls = countriesData.match(urlRegex) || [];

console.log('Total Unsplash images in countries.ts:', allUrls.length);
console.log('Unique images:', new Set(allUrls).size);

const duplicates = [];
const seen = new Set();
allUrls.forEach(url => {
  if (seen.has(url)) {
    duplicates.push(url);
  }
  seen.add(url);
});

console.log('Duplicates count:', duplicates.length);
if (duplicates.length > 0) {
  console.log('Duplicate sample:', duplicates.slice(0, 5));
}
