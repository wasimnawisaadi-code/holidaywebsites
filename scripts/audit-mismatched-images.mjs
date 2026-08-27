import { packages } from '../src/data/catalogue.ts';
import { packageDetails } from '../src/data/package-details.ts';
import { countries } from '../src/data/countries.ts';
import { inboundTours } from '../src/data/inbound-tours.ts';
import { inboundTickets } from '../src/data/inbound-tickets.ts';

console.log('=== 1. HOLIDAY PACKAGES: TITLE & IMAGE AUDIT ===');
for (const p of packages) {
  const d = packageDetails[p.slug];
  console.log(`\nPackage: [${p.slug}] "${p.title}"`);
  console.log(`  Country: ${p.country} | Destination: ${p.destination}`);
  console.log(`  Cover Image: ${p.image}`);
  if (d?.gallery) {
    console.log(`  Gallery (${d.gallery.length}):`);
    d.gallery.forEach((g, idx) => console.log(`    [${idx}] ${g}`));
  }
}

console.log('\n=== 2. COUNTRIES: NAME & GALLERY AUDIT ===');
for (const c of countries) {
  console.log(`\nCountry: [${c.slug}] "${c.name}" (${c.region})`);
  console.log(`  Cover Image: ${c.image}`);
  if (c.gallery) {
    console.log(`  Gallery (${c.gallery.length}):`);
    c.gallery.forEach((g, idx) => console.log(`    [${idx}] ${g}`));
  }
}
