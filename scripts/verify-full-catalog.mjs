import { packages } from '../src/data/catalogue.ts';
import { packageDetails } from '../src/data/package-details.ts';
import { inboundTours } from '../src/data/inbound-tours.ts';
import { inboundTickets } from '../src/data/inbound-tickets.ts';
import { countries } from '../src/data/countries.ts';

console.log('=== 1. HOLIDAY PACKAGES & DETAIL AUDIT ===');
console.log(`Total packages in catalogue: ${packages.length}`);
console.log(`Total detailed package configs: ${Object.keys(packageDetails).length}`);

let issues = 0;
for (const p of packages) {
  const d = packageDetails[p.slug];
  if (!d) {
    console.error(`❌ MISSING DETAIL for slug: ${p.slug} (${p.title})`);
    issues++;
    continue;
  }
  const itDays = p.itinerary?.length || 0;
  const blockDays = d.dayBlocks?.length || 0;
  const gallery = d.gallery?.length || 0;
  const incs = (d.inclusions || p.inclusions)?.length || 0;
  const excs = (d.exclusions || p.exclusions)?.length || 0;
  const faqs = d.faqs?.length || 0;

  if (itDays !== p.days || blockDays !== p.days) {
    console.warn(`⚠️ Day count mismatch for ${p.slug}: package.days=${p.days}, itinerary=${itDays}, dayBlocks=${blockDays}`);
    issues++;
  }
  if (gallery < 3) {
    console.warn(`⚠️ Gallery has fewer than 3 images for ${p.slug}: ${gallery}`);
    issues++;
  }
  console.log(`✓ ${p.slug.padEnd(28)} | ${p.days}D/${p.nights}N | Gallery: ${gallery} | Inclusions: ${incs} | FAQs: ${faqs}`);
}

console.log('\n=== 2. INBOUND TOURS AUDIT ===');
console.log(`Total tours: ${inboundTours.length}`);
for (const t of inboundTours) {
  if (!t.image || !t.gallery || t.gallery.length === 0) {
    console.error(`❌ Tour ${t.slug} has missing image or gallery`);
    issues++;
  }
  if (!t.fromPrice) {
    console.warn(`⚠️ Tour ${t.slug} has no fromPrice`);
  }
}

console.log('\n=== 3. INBOUND TICKETS AUDIT ===');
console.log(`Total tickets: ${inboundTickets.length}`);
for (const t of inboundTickets) {
  if (!t.image || !t.gallery || t.gallery.length === 0) {
    console.error(`❌ Ticket ${t.slug} has missing image or gallery`);
    issues++;
  }
  if (!t.fromPrice) {
    console.warn(`⚠️ Ticket ${t.slug} has no fromPrice`);
  }
}

console.log('\n=== 4. DESTINATION COUNTRIES AUDIT ===');
console.log(`Total countries: ${countries.length}`);
for (const c of countries) {
  if (!c.image) {
    console.error(`❌ Country ${c.slug} missing image`);
    issues++;
  }
}

console.log(`\nAudit finished with ${issues} total issues flagged.`);
