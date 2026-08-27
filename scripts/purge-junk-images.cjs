const fs = require("fs");
const junk = new Set(JSON.parse(fs.readFileSync("scripts/__junk-urls.json", "utf8")));
const f = "src/data/countries.ts";
let lines = fs.readFileSync(f, "utf8").split("\n");

// Countries whose MAIN image is junk need a real replacement, not deletion.
// Each is a genuine photo of that country already present elsewhere in the file.
const mainReplacement = {
  seychelles:
    "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80",
  kyrgyzstan:
    "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80",
  kazakhstan:
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80",
  "south-africa":
    "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
};

let slug = null, removed = 0, replaced = 0;
const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^\s*slug:\s*"([^"]+)"/);
  if (m) slug = m[1];

  const url = (line.match(/"(https:\/\/images\.unsplash\.com[^"]+)"/) || [])[1];
  if (url && junk.has(url)) {
    // Is this the country's main `image:` value (previous line ends with "image:")?
    const prev = (out[out.length - 1] || "").trim();
    const isMain = prev === "image:" || /^\s*image:\s*"/.test(line);
    if (isMain && mainReplacement[slug]) {
      out.push(line.replace(url, mainReplacement[slug]));
      replaced++;
      continue;
    }
    if (isMain) {
      // No vetted replacement: leave the main image rather than break the type,
      // but report it so it can be sourced properly.
      console.log("  !! junk MAIN image with no replacement: " + slug);
      out.push(line);
      continue;
    }
    removed++;
    continue; // drop this gallery entry
  }
  out.push(line);
}
let text = out.join("\n").replace(/,(\s*\n\s*)\]/g, "$1]");
fs.writeFileSync(f, text);
console.log("gallery entries removed: " + removed + " | main images replaced: " + replaced);
