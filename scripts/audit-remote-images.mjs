/**
 * Every remote image URL referenced from src/ is a production 404 waiting to
 * happen. This HEADs each unique one and reports the dead ones.
 *
 *   node scripts/audit-remote-images.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name)) files.push(p);
  }
})("src");

const urls = new Map(); // url -> Set(file)
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/https:\/\/images\.unsplash\.com\/[^"'`\s)]+/g)) {
    if (!urls.has(m[0])) urls.set(m[0], new Set());
    urls.get(m[0]).add(file);
  }
}

console.log(`Checking ${urls.size} unique remote images...\n`);

const dead = [];
const list = [...urls.keys()];
const CONCURRENCY = 12;

let cursor = 0;
async function worker() {
  while (cursor < list.length) {
    const url = list[cursor++];
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (!res.ok) dead.push({ url, status: res.status });
    } catch (e) {
      dead.push({ url, status: e.code ?? "NETWORK" });
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

if (!dead.length) {
  console.log("All remote images resolve.");
} else {
  console.log(`DEAD (${dead.length}):\n`);
  for (const { url, status } of dead) {
    console.log(`  [${status}] ${url}`);
    for (const f of urls.get(url)) console.log(`      ${f}`);
  }
}
