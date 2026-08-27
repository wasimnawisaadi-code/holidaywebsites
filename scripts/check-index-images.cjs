const fs = require('fs');
const path = require('path');

const indexCode = fs.readFileSync('src/routes/index.tsx', 'utf8');

// Find all image references in index.tsx
const imgMatches = indexCode.match(/["'](\/images\/[^"']+)["']/g) || [];

console.log('Images in index.tsx:');
imgMatches.forEach(m => {
  const relPath = m.replace(/["']/g, '');
  const fullPath = path.join('public', relPath.replace(/^\//, ''));
  const exists = fs.existsSync(fullPath);
  console.log(`${relPath} -> ${exists ? 'EXISTS' : 'MISSING'}`);
});
