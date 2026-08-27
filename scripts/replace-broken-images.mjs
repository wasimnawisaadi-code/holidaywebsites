import fs from 'fs';
import path from 'path';

const replacements = [
  {
    old: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
    new: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    old: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    new: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
  },
  {
    old: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    new: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    old: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80",
    new: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80"
  }
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.mjs') || entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const r of replacements) {
        if (content.includes(r.old)) {
          content = content.replaceAll(r.old, r.new);
          changed = true;
          console.log(`Replaced broken URL in: ${fullPath}`);
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log('Processing src directory...');
processDir('src');
console.log('Processing scripts directory...');
processDir('scripts');
console.log('Replacement complete!');
