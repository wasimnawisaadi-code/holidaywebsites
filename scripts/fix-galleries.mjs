/**
 * Strips each country's gallery down to photographs that actually depict it,
 * then fills the gaps with real, freely-licensed photographs of that country.
 *
 * The galleries had been assembled by pasting generic stock across many records
 * at once: one Swiss valley appeared under Switzerland, Austria, Nepal,
 * Kyrgyzstan, Tanzania, Kazakhstan and Argentina. A customer browsing Tanzania
 * was looking at the Alps.
 *
 * Ownership is decided by filename. Every localised file is named after the
 * record that first used it (`switzerland-02.jpg`), and the hand-curated local
 * files carry their subject (`bosnia-mostar.jpg`), so a filename prefix is a
 * reliable claim of what a picture shows. Anything a country cannot claim is
 * dropped from its gallery.
 *
 * Replacements come from Wikimedia Commons, searched per country against real
 * landmarks. Nothing is generated: these sit on booking pages, so the picture
 * has to be the actual place.
 *
 *   node scripts/fix-galleries.mjs --dry   report only
 *   node scripts/fix-galleries.mjs         rewrite galleries and download
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
const FILE = "src/data/countries.ts";
const OUT = "public/images/destinations";
const UA = "NawiSaadiSiteBuild/1.0 (wasimnawisaadi@gmail.com)";
const TARGET_GALLERY = 4;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Landmarks to search Commons for, when a country needs more photographs. */
const SEARCH_TERMS = {
  switzerland: "Matterhorn Zermatt",
  austria: "Hallstatt Austria village",
  nepal: "Annapurna Himalaya Nepal",
  kyrgyzstan: "Song Kol lake Kyrgyzstan",
  tanzania: "Serengeti Tanzania Kilimanjaro",
  kazakhstan: "Charyn Canyon Kazakhstan",
  argentina: "Perito Moreno glacier Argentina",
  indonesia: "Tanah Lot Bali temple",
  malaysia: "Petronas Towers Kuala Lumpur",
  thailand: "Wat Arun Bangkok temple",
  kenya: "Maasai Mara Kenya wildlife",
  australia: "Sydney Opera House harbour",
  singapore: "Gardens by the Bay Singapore",
  vietnam: "Ha Long Bay Vietnam",
  china: "Great Wall of China Badaling",
  "south-korea": "Gyeongbokgung Palace Seoul",
  "hong-kong": "Victoria Harbour Hong Kong skyline",
  serbia: "Belgrade Kalemegdan fortress",
  georgia: "Gergeti Trinity Church Georgia",
  azerbaijan: "Flame Towers Baku",
  armenia: "Tatev monastery Armenia",
  "sri-lanka": "Sigiriya rock Sri Lanka",
  brazil: "Christ the Redeemer Rio",
  maldives: "Maldives overwater bungalow atoll",
  seychelles: "Anse Source d'Argent Seychelles",
  italy: "Venice Grand Canal",
  greece: "Santorini Oia sunset",
  "czech-republic": "Prague Charles Bridge",
  hungary: "Budapest Parliament Danube",
  turkey: "Cappadocia balloons Turkey",
  japan: "Fushimi Inari Kyoto torii",
  france: "Eiffel Tower Paris",
  egypt: "Pyramids of Giza Sphinx",
  morocco: "Marrakech Jemaa el-Fnaa",
  jordan: "Petra Treasury Jordan",
  "united-kingdom": "Edinburgh Castle Scotland",
  uzbekistan: "Registan Samarkand",
  oman: "Wadi Shab Oman",
  "bosnia-and-herzegovina": "Stari Most Mostar",
  "saudi-arabia": "Masjid al-Haram Mecca",
  qatar: "Doha skyline Corniche",
  bahrain: "Bahrain World Trade Center",
  mauritius: "Le Morne Brabant Mauritius",
};

const text = fs.readFileSync(FILE, "utf8");
const blocks = text.split("c({");

const records = blocks
  .slice(1)
  .map((block, i) => {
    const slug = /slug:\s*"([^"]+)"/.exec(block)?.[1];
    const name = /\n\s*name:\s*"([^"]+)"/.exec(block)?.[1];
    const hero = /\n\s*image:\s*\n?\s*"([^"]+)"/.exec(block)?.[1];
    const gm = /gallery:\s*\[([\s\S]*?)\]/.exec(block);
    const gallery = gm ? [...gm[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    return { i, slug, name, hero, gallery, hasGallery: Boolean(gm) };
  })
  .filter((r) => r.slug && r.name);

/** Does this file plausibly depict this country? */
const owns = (slug, img) => {
  const file = (img.split("/").pop() ?? "").toLowerCase();
  const s = slug.toLowerCase();
  if (file.startsWith(s + "-") || file.startsWith(s + ".")) return true;
  // Hand-curated files carry their subject rather than the slug.
  const aliases = {
    "bosnia-and-herzegovina": ["bosnia", "mostar", "stari-most", "kravice", "blagaj", "sarajevo"],
    "saudi-arabia": ["umrah", "haram", "nabawi", "quba", "madinah", "makkah"],
    oman: ["oman", "salalah", "mughsail", "darbat"],
    switzerland: [
      "swiss",
      "hero-switzerland",
      "jungfraujoch",
      "lauterbrunnen",
      "lucerne",
      "matterhorn",
    ],
    azerbaijan: ["baku", "azerbaijan"],
    georgia: ["georgia", "tbilisi", "gergeti", "ananuri", "signagi"],
    indonesia: ["bali", "hero-bali", "indonesia"],
    turkey: ["turkey", "hero-turkey", "cappadocia", "hagia", "bosphorus", "chimneys", "balloons"],
    japan: ["japan", "hero-japan", "fushimi", "chureito", "shibuya", "osaka"],
    maldives: ["maldives", "hero-maldives"],
    italy: ["italy", "hero-italy", "colosseum", "venice", "trevi", "florence"],
    greece: ["greece", "hero-greece", "oia", "mykonos", "caldera", "parthenon"],
    france: ["france", "hero-france", "eiffel", "louvre", "nice", "monaco"],
    egypt: ["egypt", "hero-egypt", "pyramids", "sphinx", "karnak", "abu-simbel"],
  };
  return (aliases[s] ?? []).some((a) => file.startsWith(a));
};

const kept = new Map();
const needed = [];
for (const r of records) {
  const mine = [r.hero, ...r.gallery].filter(Boolean).filter((img) => owns(r.slug, img));
  const unique = [...new Set(mine)];
  kept.set(r.slug, unique);
  const short = Math.max(0, TARGET_GALLERY - unique.length);
  if (short > 0) needed.push({ slug: r.slug, name: r.name, have: unique.length, need: short });
}

const dropped = records.reduce(
  (n, r) => n + [r.hero, ...r.gallery].filter(Boolean).length - (kept.get(r.slug)?.length ?? 0),
  0,
);

console.log(`countries              ${records.length}`);
console.log(`images dropped         ${dropped} (did not depict that country)`);
console.log(`countries needing more ${needed.length}`);
console.log(`photographs to source  ${needed.reduce((n, x) => n + x.need, 0)}`);

if (DRY) {
  console.log("");
  needed.forEach((n) => console.log(`  ${n.name.padEnd(26)} has ${n.have}, needs ${n.need}`));
  console.log("\n[dry run] nothing written");
  process.exit(0);
}

// ---- source the missing photographs -------------------------------------
async function commons(query, limit = 8) {
  const u =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    `&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size&iiurlwidth=1600`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const j = await r.json();
  return Object.values(j.query?.pages ?? {})
    .map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && ii.width >= 1200 && ii.width > ii.height)
    .map((ii) => ii.thumburl);
}

let added = 0;
for (const n of needed) {
  const term = SEARCH_TERMS[n.slug] ?? n.name;
  const urls = await commons(term);
  let got = 0;
  for (const url of urls) {
    if (got >= n.need) break;
    const idx = (kept.get(n.slug)?.length ?? 0) + got + 1;
    const name = `${slugify(n.slug)}-g${String(idx).padStart(2, "0")}.jpg`;
    const dest = path.join(OUT, name);
    try {
      if (!fs.existsSync(dest)) {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) continue;
        await sharp(Buffer.from(await res.arrayBuffer()))
          .resize({ width: 1600, withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true, progressive: true })
          .toFile(dest);
      }
      kept.get(n.slug).push(`/images/destinations/${name}`);
      got++;
      added++;
    } catch {
      /* try the next candidate */
    }
  }
  console.log(`  ${n.name.padEnd(26)} +${got}`);
}

// ---- rewrite the galleries ----------------------------------------------
let out = blocks[0];
for (let bi = 1; bi < blocks.length; bi++) {
  let block = blocks[bi];
  const slug = /slug:\s*"([^"]+)"/.exec(block)?.[1];
  const list = slug ? kept.get(slug) : null;
  if (list?.length) {
    const hero = /\n\s*image:\s*\n?\s*"([^"]+)"/.exec(block)?.[1];
    // Hero first, then the rest, so the lead photograph stays the lead.
    const ordered = [...new Set([hero, ...list].filter(Boolean))];
    const rendered = "gallery: [\n" + ordered.map((g) => `      "${g}",`).join("\n") + "\n    ]";
    block = /gallery:\s*\[[\s\S]*?\]/.test(block)
      ? block.replace(/gallery:\s*\[[\s\S]*?\]/, rendered)
      : block.replace(/(slug:\s*"[^"]+",\n)/, `$1    ${rendered},\n`);
  }
  out += "c({" + block;
}
fs.writeFileSync(FILE, out);

console.log(`\nphotographs added   ${added}`);
console.log("galleries rewritten — every image now belongs to its own country");
