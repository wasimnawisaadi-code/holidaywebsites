const fs = require('fs');

const content = fs.readFileSync('src/data/countries.ts', 'utf8');

// Regex to extract all countries
const countryBlocks = content.split(/\n\s*c\(\{/);

console.log('Total country entries:', countryBlocks.length - 1);

countryBlocks.slice(1).forEach((block, i) => {
  const nameMatch = block.match(/name:\s*"([^"]+)"/);
  const slugMatch = block.match(/slug:\s*"([^"]+)"/);
  const regionMatch = block.match(/region:\s*"([^"]+)"/);
  const imageMatch = block.match(/image:\s*\n?\s*"([^"]+)"/);
  const galleryMatches = block.match(/gallery:\s*\[([\s\S]*?)\]/);

  const name = nameMatch ? nameMatch[1] : 'Unknown';
  const slug = slugMatch ? slugMatch[1] : 'unknown';
  const region = regionMatch ? regionMatch[1] : 'unknown';
  const image = imageMatch ? imageMatch[1] : 'No image';

  let galleryCount = 0;
  if (galleryMatches) {
    const urls = galleryMatches[1].match(/"https:[^"]+"/g);
    galleryCount = urls ? urls.length : 0;
  }

  console.log(`${i + 1}. [${region}] ${name} (${slug}) -> Hero: ${image.substring(0, 50)}... | Gallery: ${galleryCount} pics`);
});
