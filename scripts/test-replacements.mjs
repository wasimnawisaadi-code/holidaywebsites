import https from 'https';

const testUrls = [
  { name: 'baku', url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80' },
  { name: 'japan', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
  { name: 'italy', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'hungary', url: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80' }
];

const agent = new https.Agent({ rejectUnauthorized: false });

for (const t of testUrls) {
  const req = https.request(t.url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-100' }, agent }, (res) => {
    console.log(`${t.name}: Status ${res.statusCode} (${res.statusCode === 200 || res.statusCode === 206 ? 'OK ✅' : 'FAIL ❌'})`);
  });
  req.on('error', (e) => console.error(`${t.name} error:`, e.message));
  req.end();
}
