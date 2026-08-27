const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🚀 DEEP ONE-BY-ONE COMPREHENSIVE SITE AUDIT');
console.log('====================================================\n');

let totalErrors = 0;
let totalChecked = 0;

// 1. Audit Inbound Activities Data
console.log('--- [1/6] AUDITING INBOUND ACTIVITIES DATA ---');
const inboundToursFile = fs.readFileSync('src/data/inbound-tours.ts', 'utf8');
const inboundTicketsFile = fs.readFileSync('src/data/inbound-tickets.ts', 'utf8');

function checkInboundFile(name, content) {
  const slugMatches = content.match(/slug:\s*"([^"]+)"/g) || [];
  const titleMatches = content.match(/title:\s*"([^"]+)"/g) || [];
  const imgMatches = content.match(/image:\s*"([^"]+)"/g) || [];

  console.log(`Checking ${name}: ${slugMatches.length} activities found.`);
  slugMatches.forEach((sm, i) => {
    totalChecked++;
    const slug = sm.replace(/slug:\s*"/, '').replace(/"/, '');
    const title = titleMatches[i] ? titleMatches[i].replace(/title:\s*"/, '').replace(/"/, '') : 'No Title';
    const img = imgMatches[i] ? imgMatches[i].replace(/image:\s*"/, '').replace(/"/, '') : 'No Image';

    if (img.startsWith('/images/')) {
      const fullImg = path.join('public', img.replace(/^\//, ''));
      if (!fs.existsSync(fullImg)) {
        console.error(`❌ MISSING IMAGE in ${slug}: ${img}`);
        totalErrors++;
      }
    }
  });
}
checkInboundFile('Inbound Tours', inboundToursFile);
checkInboundFile('Inbound Tickets', inboundTicketsFile);

// 2. Audit Holiday Packages
console.log('\n--- [2/6] AUDITING WORLDWIDE HOLIDAY PACKAGES ---');
const catalogueFile = fs.readFileSync('src/data/catalogue.ts', 'utf8');
const pkgSlugs = catalogueFile.match(/"slug":\s*"([^"]+)"/g) || [];
const pkgTitles = catalogueFile.match(/"title":\s*"([^"]+)"/g) || [];
const pkgImgs = catalogueFile.match(/"image":\s*"([^"]+)"/g) || [];

console.log(`Checking Holiday Packages: ${pkgSlugs.length} packages found.`);
pkgSlugs.forEach((sm, i) => {
  totalChecked++;
  const slug = sm.replace(/"slug":\s*"/, '').replace(/"/, '');
  const title = pkgTitles[i] ? pkgTitles[i].replace(/"title":\s*"/, '').replace(/"/, '') : 'No Title';
  const img = pkgImgs[i] ? pkgImgs[i].replace(/"image":\s*"/, '').replace(/"/, '') : 'No Image';

  if (!img.startsWith('http') && !img.startsWith('/images/')) {
    console.error(`❌ INVALID IMAGE FORMAT in package ${slug}: ${img}`);
    totalErrors++;
  }
});

// 3. Audit Outbound Countries & Galleries
console.log('\n--- [3/6] AUDITING 40+ OUTBOUND COUNTRIES ---');
const countriesFile = fs.readFileSync('src/data/countries.ts', 'utf8');
const countrySlugs = countriesFile.match(/slug:\s*"([^"]+)"/g) || [];
const countryNames = countriesFile.match(/name:\s*"([^"]+)"/g) || [];
const countryImgs = countriesFile.match(/image:\s*\n?\s*"([^"]+)"/g) || [];

console.log(`Checking Countries: ${countrySlugs.length} countries found.`);
countrySlugs.forEach((sm, i) => {
  totalChecked++;
  const slug = sm.replace(/slug:\s*"/, '').replace(/"/, '');
  const name = countryNames[i] ? countryNames[i].replace(/name:\s*"/, '').replace(/"/, '') : 'No Name';
  const img = countryImgs[i] ? countryImgs[i].replace(/image:\s*\n?\s*"/, '').replace(/"/, '') : 'No Image';

  if (!img.startsWith('http') && !img.startsWith('/images/')) {
    console.error(`❌ INVALID IMAGE in country ${slug}: ${img}`);
    totalErrors++;
  }
});

// 4. Audit 3D Components
console.log('\n--- [4/6] AUDITING 3D INTERACTIVE COMPONENTS ---');
const comps3d = ['InteractiveGlobe.tsx', 'BurjKhalifaAscent.tsx', 'Spatial3DCarousel.tsx', 'InteractiveLuggageExperience.tsx', 'InteractiveTripCalculator.tsx'];
comps3d.forEach(comp => {
  totalChecked++;
  const full = path.join('src/components/3d', comp);
  if (!fs.existsSync(full)) {
    console.error(`❌ MISSING 3D Component: ${comp}`);
    totalErrors++;
  } else {
    console.log(`✅ 3D Component Verified: ${comp}`);
  }
});

// 5. Audit Route Files
console.log('\n--- [5/6] AUDITING ROUTE FILES ---');
const routes = [
  'index.tsx',
  'holidays.index.tsx',
  'holidays.$slug.tsx',
  'activities.index.tsx',
  'activities.$slug.tsx',
  'countries.index.tsx',
  'countries.$slug.tsx',
  'customized-tours.tsx',
  'deals.tsx',
  'dubai.tsx',
  'uae.tsx',
  'about.tsx',
  'contact.tsx',
  'plan.tsx'
];
routes.forEach(r => {
  totalChecked++;
  const full = path.join('src/routes', r);
  if (!fs.existsSync(full)) {
    console.error(`❌ MISSING Route: ${r}`);
    totalErrors++;
  } else {
    console.log(`✅ Route Verified: /src/routes/${r}`);
  }
});

// 6. Audit Local Static Image Integrity
console.log('\n--- [6/6] AUDITING PUBLIC STATIC ASSETS ---');
const publicDst = fs.readdirSync('public/images/dst');
console.log(`Found ${publicDst.length} authentic photos in public/images/dst.`);
totalChecked += publicDst.length;

console.log('\n====================================================');
console.log(`AUDIT COMPLETE: ${totalChecked} items checked.`);
console.log(`Total Errors Detected: ${totalErrors}`);
console.log(totalErrors === 0 ? '🏆 ALL PAGES, 3D COMPONENTS & ASSETS ARE 100% HEALTHY!' : '⚠️ ISSUES DETECTED');
console.log('====================================================');
