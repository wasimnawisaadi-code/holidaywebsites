const fs = require('fs');
const path = require('path');

function findFiles(dir, search) {
  const results = [];
  function recurse(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        recurse(full);
      } else if (e.name.toLowerCase().includes(search.toLowerCase())) {
        results.push(full.replace(/\\/g, '/').replace(/^public/, ''));
      }
    }
  }
  recurse(dir);
  return results;
}

console.log('Burj Khalifa images:', findFiles('public/images', 'burj').slice(0, 8));
console.log('Desert Safari images:', findFiles('public/images', 'safari').slice(0, 8));
console.log('Lotus / Yacht images:', findFiles('public/images', 'lotus').slice(0, 8));
console.log('Museum Future images:', findFiles('public/images', 'museum').slice(0, 8));
console.log('Ferrari World images:', findFiles('public/images', 'ferrari').slice(0, 8));
console.log('Ain Dubai images:', findFiles('public/images', 'ain').slice(0, 8));
console.log('Atlantis images:', findFiles('public/images', 'aquaventure').slice(0, 8));
console.log('Fountain images:', findFiles('public/images', 'fountain').slice(0, 8));
