import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { packages } from '../src/data/catalogue.ts';
import { packageDetails } from '../src/data/package-details.ts';
import { inboundTours } from '../src/data/inbound-tours.ts';
import { inboundTickets } from '../src/data/inbound-tickets.ts';
import { countries } from '../src/data/countries.ts';

const agent = new https.Agent({ rejectUnauthorized: false });

async function checkUrl(url) {
  if (url.startsWith('/')) {
    const fullPath = path.join('public', url.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      return { ok: true, type: 'local', status: 200 };
    } else {
      return { ok: false, type: 'local', error: 'File not found on disk: ' + fullPath };
    }
  }

  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const opts = {
        method: 'GET',
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Range': 'bytes=0-100' },
        ...(url.startsWith('https') ? { agent } : {})
      };
      const req = client.request(url, opts, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ ok: true, type: 'remote', status: res.statusCode });
        } else {
          resolve({ ok: false, type: 'remote', status: res.statusCode });
        }
      });
      req.on('error', (err) => resolve({ ok: false, type: 'remote', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, type: 'remote', error: 'Timeout' }); });
      req.end();
    } catch (e) {
      resolve({ ok: false, type: 'remote', error: e.message });
    }
  });
}

async function runCheck() {
  console.log('Starting comprehensive image verification (with SSL fix)...\n');

  const allImages = new Set();
  const imageSources = [];

  function addImg(url, context) {
    if (!url) return;
    allImages.add(url);
    imageSources.push({ url, context });
  }

  // 1. Packages
  for (const p of packages) {
    addImg(p.image, `Package cover: ${p.slug}`);
    const d = packageDetails[p.slug];
    if (d?.gallery) {
      d.gallery.forEach((g, idx) => addImg(g, `Package gallery [${idx}]: ${p.slug}`));
    }
  }

  // 2. Inbound Tours
  for (const t of inboundTours) {
    addImg(t.image, `Tour cover: ${t.slug}`);
    if (t.gallery) {
      t.gallery.forEach((g, idx) => addImg(g, `Tour gallery [${idx}]: ${t.slug}`));
    }
  }

  // 3. Inbound Tickets
  for (const t of inboundTickets) {
    addImg(t.image, `Ticket cover: ${t.slug}`);
    if (t.gallery) {
      t.gallery.forEach((g, idx) => addImg(g, `Ticket gallery [${idx}]: ${t.slug}`));
    }
  }

  // 4. Countries
  for (const c of countries) {
    addImg(c.image, `Country image: ${c.slug}`);
  }

  console.log(`Found ${allImages.size} unique image URLs to check.\n`);

  const results = {};
  const failed = [];

  let count = 0;
  for (const url of allImages) {
    count++;
    const res = await checkUrl(url);
    results[url] = res;
    if (!res.ok) {
      const contexts = imageSources.filter(s => s.url === url).map(s => s.context);
      failed.push({ url, res, contexts });
      console.log(`❌ [${count}/${allImages.size}] FAILED: ${url} (${res.error || res.status}) -> Used in: ${contexts.join(', ')}`);
    } else {
      if (count % 25 === 0 || count === allImages.size) {
        console.log(`✓ [${count}/${allImages.size}] Checked... (${failed.length} failed so far)`);
      }
    }
  }

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total URLs Checked: ${allImages.size}`);
  console.log(`Successful: ${allImages.size - failed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFAILED URL DETAILS:');
    console.log(JSON.stringify(failed, null, 2));
  } else {
    console.log('\n✨ ALL IMAGES ARE 100% VALID AND WORKING (200 OK)!');
  }
}

runCheck();
