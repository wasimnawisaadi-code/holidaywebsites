import https from 'https';

const testUrls = [
  { name: 'jordan', url: 'https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1200&q=80' },
  { name: 'hong-kong', url: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80' },
  { name: 'serbia', url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80' }
];

const agent = new https.Agent({ rejectUnauthorized: false });

for (const t of testUrls) {
  const req = https.request(t.url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-100' }, agent }, (res) => {
    console.log(`${t.name}: Status ${res.statusCode} (${res.statusCode === 200 || res.statusCode === 206 ? 'OK ✅' : 'FAIL ❌'})`);
  });
  req.on('error', (e) => console.error(`${t.name} error:`, e.message));
  req.end();
}
