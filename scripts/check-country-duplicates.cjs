const fs = require('fs');

const content = fs.readFileSync('src/data/countries.ts', 'utf8');
const countryBlocks = content.split(/\n\s*c\(\{/);

console.log('Checking all 40 country galleries:');

countryBlocks.slice(1).forEach((b, i) => {
  const name = (b.match(/name:\s*"([^"]+)"/) || [])[1] || 'Unknown';
  const slug = (b.match(/slug:\s*"([^"]+)"/) || [])[1] || 'Unknown';
  const galleryMatch = b.match(/gallery:\s*\[([\s\S]*?)\]/);
  
  if (galleryMatch) {
    const urls = galleryMatch[1].match(/"https:[^"]+"/g) || [];
    const unique = new Set(urls);
    if (urls.length !== unique.size) {
      console.log(`⚠️ Country [${name}] has duplicate gallery images (${unique.size}/${urls.length})`);
    }
  } else {
    console.log(`⚠️ Country [${name}] is missing a gallery property!`);
  }
});
console.log('Country gallery check finished.');
