const fs = require("fs");
const f = "src/data/catalogue.ts";
const lines = fs.readFileSync(f, "utf8").split("\n");
const byLine = {
  277: "/images/destinations/hero-umrah.jpg",          // umrah-17-nights
  515: "/images/destinations/hero-switzerland.jpg",    // swiss-alpine-dream
  653: "/images/destinations/hero-maldives.jpg",       // maldives-overwater-escape
  864: "/images/destinations/turkey-balloons.jpg",     // cappadocia-sky-turkey
  978: "/images/destinations/hero-bali.jpg",           // bali-jungle-coast
  1106: "/images/destinations/hero-japan.jpg",         // japan-golden-route
  1259: "/images/destinations/france-eiffel.jpg",      // paris-french-riviera
  1398: "/images/destinations/hero-italy.jpg",         // italy-classic-grand-tour
  1540: "/images/destinations/greece-oia.jpg",         // greece-santorini-athens
};
// find the 10th (egypt) dynamically
lines.forEach((l, i) => {
  if (l.includes("photo-1503177119275")) byLine[i + 1] = "/images/destinations/egypt-pyramids.jpg";
});
let n = 0;
for (const [ln, img] of Object.entries(byLine)) {
  const i = Number(ln) - 1;
  if (!lines[i] || !lines[i].includes("unsplash")) {
    console.log("!! line " + ln + " is not an unsplash image line: " + (lines[i] || "").trim().slice(0, 60));
    continue;
  }
  if (!fs.existsSync("public" + img)) {
    console.log("!! missing local file " + img);
    continue;
  }
  lines[i] = '    "image": "' + img + '",';
  n++;
  console.log("line " + ln + " -> " + img);
}
fs.writeFileSync(f, lines.join("\n"));
const t = lines.join("\n");
console.log("\nswapped: " + n + " | remaining unsplash in catalogue.ts: " + (t.match(/unsplash/g) || []).length);
