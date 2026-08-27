const fs = require("fs");
const f = "src/data/countries.ts";
let lines = fs.readFileSync(f, "utf8").split("\n");

// Which local plate is wrong for which country. Only these get touched.
const wrongFor = {
  serbia: ["georgia-tbilisi.jpg", "bosnia-mostar.jpg"],
  armenia: ["georgia-tbilisi.jpg", "azerbaijan-baku.jpg"],
  uzbekistan: ["azerbaijan-baku.jpg"],
  azerbaijan: ["georgia-tbilisi.jpg"],
};

// Walk the file, tracking which country entry we are inside.
let currentSlug = null;
const removed = [];
const out = [];
for (const line of lines) {
  const s = line.match(/^\s*slug:\s*"([^"]+)"/);
  if (s) currentSlug = s[1];
  const bad = currentSlug && wrongFor[currentSlug];
  if (bad && bad.some(b => line.includes(b))) {
    // Drop this gallery entry entirely rather than substitute another
    // country's photo — a shorter honest gallery beats a padded wrong one.
    removed.push(currentSlug + "  <-  " + line.trim());
    continue;
  }
  out.push(line);
}
let text = out.join("\n");
// Tidy any trailing comma left dangling inside a gallery array.
text = text.replace(/,(\s*\n\s*)\]/g, "$1]");
fs.writeFileSync(f, text);
console.log("removed " + removed.length + " wrong-country image entries:");
removed.forEach(r => console.log("  " + r));
