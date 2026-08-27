import { regionalDestinations } from '../src/components/site/RegionalDestinationsGrid.tsx';
import { countries } from '../src/data/countries.ts';
import { packages } from '../src/data/catalogue.ts';

console.log('=== REGIONAL DESTINATIONS COVERAGE AUDIT ===');
const countrySlugs = countries.map(c => c.slug);
const packageSlugs = packages.map(p => p.slug);

let total = 0;
let missing = 0;

for (const group of regionalDestinations) {
  console.log(`\nRegion: ${group.region}`);
  for (const item of group.countries) {
    total++;
    const link = item.link;
    let isValid = false;
    if (link.startsWith('/countries/')) {
      const slug = link.replace('/countries/', '');
      isValid = countrySlugs.includes(slug);
    } else if (link.startsWith('/holidays/')) {
      const slug = link.replace('/holidays/', '');
      isValid = packageSlugs.includes(slug);
    }
    if (!isValid) {
      console.error(`❌ Broken destination link: ${item.name} -> ${link}`);
      missing++;
    } else {
      console.log(`✓ ${item.name.padEnd(25)} -> ${link}`);
    }
  }
}

console.log(`\nCoverage check: ${total - missing}/${total} valid destination links.`);
