import fs from 'fs';
import path from 'path';

console.log('=== AUDITING ALL INBOUND PUBLIC IMAGES ON DISK ===');

const baseDir = 'public/images/inbound';
const subdirs = fs.readdirSync(baseDir);

const dirToFileMap = {};

for (const dir of subdirs) {
  const fullDir = path.join(baseDir, dir);
  if (fs.statSync(fullDir).isDirectory()) {
    const files = fs.readdirSync(fullDir).filter(f => !f.startsWith('.'));
    // Sort files naturally (img-1, img-2, img-3...)
    files.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
    dirToFileMap[dir] = files;
  }
}

console.log(`Found ${Object.keys(dirToFileMap).length} image directories in public/images/inbound/`);

// Now let's check all references in src/
const targetFiles = [
  'src/data/inbound-tickets.ts',
  'src/data/inbound-tours.ts',
  'src/data/inbound-images-manifest.json',
  'src/data/catalogue.ts',
  'src/routes/index.tsx',
  'src/routes/dubai.tsx',
  'src/routes/uae.tsx',
  'src/routes/deals.tsx',
  'src/routes/activities.$slug.tsx',
  'src/routes/activities.index.tsx'
];

let totalFixed = 0;

for (const relPath of targetFiles) {
  if (!fs.existsSync(relPath)) continue;
  let content = fs.readFileSync(relPath, 'utf8');
  let original = content;

  // Regex to match /images/inbound/folder/file.ext
  const matches = [...content.matchAll(/\/images\/inbound\/([a-z0-9-]+)\/([a-z0-9._-]+)/gi)];

  for (const m of matches) {
    const fullMatch = m[0];
    const folder = m[1];
    const filename = m[2];

    const actualFiles = dirToFileMap[folder];
    if (!actualFiles) {
      console.warn(`[${relPath}] Unknown folder: ${folder}`);
      continue;
    }

    if (!actualFiles.includes(filename)) {
      // Find the best match (e.g. img-1.webp if img-1.jpg requested)
      const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
      const matchingActual = actualFiles.find(f => f.startsWith(baseName + '.')) || actualFiles[0];

      if (matchingActual) {
        const fixedPath = `/images/inbound/${folder}/${matchingActual}`;
        content = content.replaceAll(fullMatch, fixedPath);
        console.log(`FIX in ${relPath}: ${fullMatch} -> ${fixedPath}`);
        totalFixed++;
      } else {
        console.error(`Cannot find any image for: ${fullMatch}`);
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(relPath, content, 'utf8');
    console.log(`Updated file: ${relPath}`);
  }
}

console.log(`\nFixed ${totalFixed} broken image path references across the codebase!`);
