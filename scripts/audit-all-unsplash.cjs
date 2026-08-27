const fs = require('fs');

function extractUrlsWithContext(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];
  
  lines.forEach((line, i) => {
    const match = line.match(/https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)/);
    if (match) {
      // Find nearby country/title context
      const contextLines = lines.slice(Math.max(0, i - 8), Math.min(lines.length, i + 8)).join(' ');
      const titleMatch = contextLines.match(/title|name|slug/i);
      results.push({
        file: filePath,
        line: i + 1,
        photoId: match[1],
        url: match[0],
        snippet: line.trim()
      });
    }
  });
  return results;
}

const allUrls = [
  ...extractUrlsWithContext('src/data/catalogue.ts'),
  ...extractUrlsWithContext('src/data/countries.ts'),
  ...extractUrlsWithContext('src/components/3d/InteractiveGlobe.tsx'),
  ...extractUrlsWithContext('src/components/3d/ScrollStoryEngine.tsx'),
  ...extractUrlsWithContext('src/routes/index.tsx'),
];

console.log('Total Unsplash image usages:', allUrls.length);

const uniquePhotos = new Map();
allUrls.forEach(u => {
  if (!uniquePhotos.has(u.photoId)) {
    uniquePhotos.set(u.photoId, []);
  }
  uniquePhotos.get(u.photoId).push(`${u.file}:${u.line}`);
});

console.log('Unique Unsplash photo IDs:', uniquePhotos.size);
Array.from(uniquePhotos.entries()).forEach(([id, occurrences], index) => {
  console.log(`${index + 1}. photo-${id} (Used in ${occurrences.length} places: ${occurrences[0]})`);
});
