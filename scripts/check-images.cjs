const fs = require('fs');
const path = require('path');

function check() {
  const inboundTours = fs.readFileSync(path.resolve('src/data/inbound-tours.ts'), 'utf8');
  const inboundTickets = fs.readFileSync(path.resolve('src/data/inbound-tickets.ts'), 'utf8');

  const regex = /["']\/images\/([^"']+)["']/g;
  let match;
  let totalChecked = 0;
  let missing = [];
  let found = 0;

  const allText = inboundTours + '\n' + inboundTickets;
  while ((match = regex.exec(allText)) !== null) {
    totalChecked++;
    const fullPath = path.join('public/images', match[1]);
    if (fs.existsSync(fullPath)) {
      found++;
    } else {
      missing.push(match[1]);
    }
  }

  console.log('Checked image references:', totalChecked);
  console.log('Found on disk:', found);
  console.log('Missing count:', missing.length);
  if (missing.length > 0) {
    console.log('Sample missing:', missing.slice(0, 10));
  }
}

check();
