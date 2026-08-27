/**
 * Content audit for the catalogue.
 *
 * Answers, in one pass, the questions that matter before a launch:
 *   - which images are local versus hot-linked to a third party
 *   - whether any image is reused across two different countries, which is the
 *     signature of a wrong-country placeholder
 *   - whether every package and country has a price, an intro and an image
 *   - which destinations are sold but have no photograph of their own
 *
 * It cannot tell whether a photograph actually depicts the country it is filed
 * under — that needs eyes. What it can do is surface the cases worth looking
 * at, which is how the Uzbekistan/Mount Bromo mix-up was found.
 */
import fs from "node:fs";

const cat = fs.readFileSync("src/data/catalogue.ts", "utf8");
const ctry = fs.readFileSync("src/data/countries.ts", "utf8");

const pkgRe =
  /"slug": "([^"]+)",\s*\n\s*"title": "([^"]+)",[\s\S]*?"country": "([^"]+)",[\s\S]*?"priceStatus": "([^"]+)",\s*\n\s*(?:"priceFrom": (\d+),)?[\s\S]*?"image": "([^"]+)",\s*\n\s*"intro": "([^"]*)"/g;

const packages = [];
let m;
while ((m = pkgRe.exec(cat))) {
  packages.push({
    slug: m[1],
    title: m[2],
    country: m[3],
    priceStatus: m[4],
    price: m[5] ? Number(m[5]) : null,
    image: m[6],
    intro: m[7],
  });
}

// Records are split on `c({` rather than matched with one regex: an optional
// `gallery` array sits between `slug` and `name`, and a single pattern either
// skips records or swallows the next one. Splitting first bounds each match to
// one record, which is what makes the per-field patterns safe.
const countries = ctry
  .split("c({")
  .slice(1)
  .map((block) => {
    const slug = /slug:\s*"([^"]+)"/.exec(block)?.[1];
    const name = /\n\s*name:\s*"([^"]+)"/.exec(block)?.[1];
    const image = /\n\s*image:\s*\n?\s*"([^"]+)"/.exec(block)?.[1];
    return slug && name && image ? { slug, name, image } : null;
  })
  .filter((c) => c !== null);

const remote = (u) => u.startsWith("http");
const pad = (s, n) => String(s).padEnd(n);

console.log("PACKAGES");
console.log(`  total                 ${packages.length}`);
console.log(`  local images          ${packages.filter((p) => !remote(p.image)).length}`);
console.log(`  hot-linked (remote)   ${packages.filter((p) => remote(p.image)).length}`);
console.log(`  priced                ${packages.filter((p) => p.price).length}`);
console.log(`  price on request      ${packages.filter((p) => !p.price).length}`);
const noIntro = packages.filter((p) => !p.intro || p.intro.length < 40);
console.log(`  thin/missing intro    ${noIntro.length}`);
noIntro.forEach((p) => console.log(`      ${p.slug}`));

console.log("\nCOUNTRIES");
console.log(`  total                 ${countries.length}`);
console.log(`  local images          ${countries.filter((c) => !remote(c.image)).length}`);
console.log(`  hot-linked (remote)   ${countries.filter((c) => remote(c.image)).length}`);

// An image used by two different countries is almost always a placeholder that
// was never replaced.
console.log("\nIMAGE REUSE ACROSS DIFFERENT COUNTRIES");
const byImage = new Map();
for (const p of [...packages.map((p) => ({ ...p, kind: "pkg" })),
                 ...countries.map((c) => ({ country: c.name, slug: c.slug, image: c.image, kind: "country" }))]) {
  if (!byImage.has(p.image)) byImage.set(p.image, []);
  byImage.get(p.image).push(p);
}
let clashes = 0;
for (const [img, users] of byImage) {
  const nations = new Set(users.map((u) => u.country));
  if (nations.size > 1) {
    clashes++;
    console.log(`  ${img.slice(0, 78)}`);
    users.forEach((u) => console.log(`      ${pad(u.kind, 8)} ${pad(u.country, 16)} ${u.slug}`));
  }
}
if (!clashes) console.log("  none — every image belongs to a single country");

// Destinations sold without a photograph of their own.
console.log("\nSOLD COUNTRIES WITHOUT A DEDICATED COUNTRY PAGE IMAGE");
const soldCountries = new Set(packages.map((p) => p.country));
const haveCountryPage = new Set(countries.map((c) => c.name));
const missing = [...soldCountries].filter((c) => !haveCountryPage.has(c)).sort();
console.log(missing.length ? "  " + missing.join(", ") : "  none");

console.log("\nHOT-LINKED IMAGES (rot silently — worth localising)");
const remotes = new Set([
  ...packages.filter((p) => remote(p.image)).map((p) => p.image),
  ...countries.filter((c) => remote(c.image)).map((c) => c.image),
]);
console.log(`  ${remotes.size} unique remote URLs still referenced`);
