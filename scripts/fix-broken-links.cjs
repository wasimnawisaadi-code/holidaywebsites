const fs = require("fs");
// Each broken slug -> the real slug that exists in the data.
const map = {
  "/activities/abu-dhabi-city-tour-with-ferrari-world": "/activities/ferrari-world-abu-dhabi",
  "/activities/ain-dubai-views": "/activities/dubai-frame",
  "/activities/al-mansour-marina-dhow-cruise": "/activities/al-mansour-dhow-cruise",
  "/activities/dubai-frame-tickets": "/activities/dubai-frame",
  "/activities/global-village-entry-ticket": "/activities/global-village-dubai",
  "/activities/louvre-abu-dhabi-tickets": "/activities/louvre-abu-dhabi",
  "/activities/morning-desert-safari-quad-bike": "/activities/morning-desert-safari-with-quad-bike",
  "/activities/the-view-at-the-palm-tickets": "/activities/the-view-at-the-palm",
  "/holidays/georgia-scenic-escape": "/holidays/georgia-mountain-weekender",
};
const files = ["src/components/site/SiteHeader.tsx", "src/components/site/SiteFooter.tsx", "src/routes/deals.tsx"];
let total = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let t = fs.readFileSync(f, "utf8");
  let n = 0;
  for (const [bad, good] of Object.entries(map)) {
    const parts = t.split(bad);
    if (parts.length > 1) { n += parts.length - 1; t = parts.join(good); }
  }
  if (n) { fs.writeFileSync(f, t); console.log(f + ": " + n + " replaced"); total += n; }
}
console.log("total: " + total);
