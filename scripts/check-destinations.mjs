import { countries, getCountryBySlug } from '../src/data/countries.ts';
import { packages } from '../src/data/catalogue.ts';

console.log('=== COUNTRIES & PACKAGES LINKAGE CHECK ===');
console.log(`Total countries defined: ${countries.length}`);

for (const c of countries) {
  const linkedPackages = packages.filter(p => p.country.toLowerCase() === c.name.toLowerCase() || p.destination.toLowerCase().includes(c.name.toLowerCase()));
  console.log(`- ${c.name.padEnd(20)} [${c.region}] | From AED ${c.fromAed || 'On request'} | Nights: ${c.nights} | Linked Holiday Packages: ${linkedPackages.length}`);
}
