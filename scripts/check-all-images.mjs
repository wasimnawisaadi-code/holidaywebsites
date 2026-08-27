import fs from 'fs';
import path from 'path';
import { packages } from '../src/data/catalogue.ts';
import { packageDetails } from '../src/data/package-details.ts';
import { inboundTours } from '../src/data/inbound-tours.ts';
import { inboundTickets } from '../src/data/inbound-tickets.ts';
import { countries } from '../src/data/countries.ts';

let brokenLocal = 0;
function checkLocal(url, context) {
  if (url.startsWith('/')) {
    const full = path.join('public', url.replace(/^\//, ''));
    if (!fs.existsSync(full)) {
      console.error(`❌ BROKEN LOCAL IMAGE [${context}]: ${url} -> ${full}`);
      brokenLocal++;
    }
  }
}

console.log('Checking all local and remote images...');

// 1. Packages
for (const p of packages) {
  checkLocal(p.image, `Package cover ${p.slug}`);
  const d = packageDetails[p.slug];
  if (d?.gallery) {
    for (const g of d.gallery) {
      checkLocal(g, `Package gallery ${p.slug}`);
    }
  }
}

// 2. Inbound Tours
for (const t of inboundTours) {
  checkLocal(t.image, `Tour cover ${t.slug}`);
  if (t.gallery) {
    for (const g of t.gallery) {
      checkLocal(g, `Tour gallery ${t.slug}`);
    }
  }
}

// 3. Inbound Tickets
for (const t of inboundTickets) {
  checkLocal(t.image, `Ticket cover ${t.slug}`);
  if (t.gallery) {
    for (const g of t.gallery) {
      checkLocal(g, `Ticket gallery ${t.slug}`);
    }
  }
}

// 4. Countries
for (const c of countries) {
  checkLocal(c.image, `Country image ${c.slug}`);
}

console.log(`\nLocal image check complete: ${brokenLocal} broken local images.`);
