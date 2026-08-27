/**
 * Unifies every hardcoded colour on the rebuild onto the palette actually used
 * by the owner's live site at nawisaadi.com.
 *
 * Sampled from the live DOM with scripts/scrape-live-brand.mjs, ranked by the
 * screen area each colour really covers:
 *   rgb(255,255,255) #FFFFFF  dominant page ground   (NOT the warm cream the
 *                                                     rebuild had drifted to)
 *   rgb(248,248,248) #F8F8F8  alternating band       (neutral grey, not cream)
 *   rgb(0,54,95)     #00365F  brand navy             (rebuild had #003058)
 *   rgb(202,164,45)  #CAA42D  brand gold             (rebuild had #c8a028)
 *   rgb(102,102,102) #666666  body text
 *   rgb(53,56,68)    #353844  heading / strong text
 *
 * The two brand hues were close enough to look "nearly right" while still
 * making every page disagree with the real site side by side.
 */
import fs from "node:fs";
import path from "node:path";

const MAP = [
  // --- brand hues ---
  ["#003058", "#00365F"], // navy
  ["#00365f", "#00365F"],
  ["#c8a028", "#CAA42D"], // gold
  ["#C8A028", "#CAA42D"],
  ["#a8851f", "#8F7420"], // darker gold, for gold text on white
  ["#A8851F", "#8F7420"],
  ["#dcbf5a", "#DDBE5E"], // lighter gold, for gold text on navy
  ["#DCBF5A", "#DDBE5E"],

  // --- grounds: live site is neutral white + grey, not warm cream ---
  ["#f7f5f1", "#FFFFFF"],
  ["#F7F5F1", "#FFFFFF"],
  ["#FCFDFE", "#F8F8F8"],
  ["#fcfdfe", "#F8F8F8"],
  ["#fbf8f2", "#FFFFFF"],
  ["#e6ded0", "#E5E5E5"], // hairline: warm -> neutral
  ["#E6DED0", "#E5E5E5"],

  // --- ink ---
  ["#1c1a17", "#353844"],
  ["#1C1A17", "#353844"],
];

const dirs = ["src/routes", "src/components/site", "src/components/3d"];
const files = [];
for (const dir of dirs) {
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".tsx")) files.push(path.join(dir, f));
  }
}
files.push("src/styles.css");

let touched = 0;
const counts = {};
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  for (const [from, to] of MAP) {
    if (from === to) continue;
    const parts = s.split(from);
    if (parts.length > 1) counts[from] = (counts[from] || 0) + parts.length - 1;
    s = parts.join(to);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    touched++;
  }
}
console.log("files updated:", touched);
console.log("\nreplacements:");
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log("  ", k.padEnd(10), "->", v);
}
