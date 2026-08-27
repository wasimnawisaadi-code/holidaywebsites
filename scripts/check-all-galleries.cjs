const fs = require('fs');

const a = fs.readFileSync('src/data/package-details-a.ts', 'utf8');
const b = fs.readFileSync('src/data/package-details-b.ts', 'utf8');

function checkGalleries(file, content) {
  const blocks = content.split(/"([a-z0-9-]+)":\s*\{/);
  console.log(`Checking ${file}: ${(blocks.length - 1) / 2} packages found.`);
  
  for (let i = 1; i < blocks.length; i += 2) {
    const slug = blocks[i];
    const body = blocks[i + 1];
    const galleryMatch = body.match(/"gallery":\s*\[([\s\S]*?)\]/);
    if (galleryMatch) {
      const urls = galleryMatch[1].match(/"https:[^"]+"/g) || [];
      console.log(`  Package: ${slug} (${urls.length} images)`);
      urls.forEach((u, idx) => {
        console.log(`    [${idx + 1}] ${u}`);
      });
    }
  }
}

checkGalleries('package-details-a.ts', a);
checkGalleries('package-details-b.ts', b);
