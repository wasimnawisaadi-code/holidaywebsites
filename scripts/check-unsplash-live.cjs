const fs = require("fs");
const t = fs.readFileSync("src/data/countries.ts", "utf8");
const urls = [...new Set([...t.matchAll(/https:\/\/images\.unsplash\.com[^"]*/g)].map(m => m[0]))];
console.log("unique remote URLs: " + urls.length);
(async () => {
  const dead = [];
  let done = 0;
  await Promise.all(urls.map(async u => {
    try {
      const r = await fetch(u, { method: "HEAD", redirect: "follow" });
      if (!r.ok) dead.push(r.status + "  " + u);
    } catch (e) {
      dead.push("ERR  " + u);
    }
    done++;
  }));
  console.log("checked " + done);
  console.log("\nDEAD (" + dead.length + "):");
  dead.forEach(d => console.log("  " + d));
})();
