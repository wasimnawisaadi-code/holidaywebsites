const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = getAllFiles('src', ['.ts', '.tsx']);
let totalLocalImgs = 0;
let missingLocalImgs = [];

srcFiles.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const matches = code.match(/["'](\/images\/[^"']+)["']/g) || [];
  matches.forEach(m => {
    totalLocalImgs++;
    const rel = m.replace(/["']/g, '');
    const full = path.join('public', rel.replace(/^\//, ''));
    if (!fs.existsSync(full)) {
      missingLocalImgs.push({ file: file.replace(/\\/g, '/'), img: rel });
    }
  });
});

console.log('=== COMPREHENSIVE IMAGE AUDIT ===');
console.log('Total Local Image References in Codebase:', totalLocalImgs);
console.log('Missing / Broken Images:', missingLocalImgs.length);
if (missingLocalImgs.length > 0) {
  console.log('Missing items:', missingLocalImgs);
} else {
  console.log('PERFECT! 100% of all local images exist on disk!');
}
