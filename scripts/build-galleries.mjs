/**
 * Replace every remote gallery image with a verified, locally-hosted photograph
 * of the actual destination.
 *
 * The old galleries were Unsplash IDs picked by keyword, and several were plain
 * wrong — Yosemite in the Oman and Egypt galleries, a Balinese temple in Oman,
 * the Dubai skyline in Salalah. Anything remote can also 404 later. This pulls
 * freely-licensed images from Wikimedia Commons for explicit landmark queries,
 * rejects greyscale/artwork/small files, writes 1600px JPEGs into
 * public/images/destinations/, and rewrites the data files.
 *
 *   node scripts/build-galleries.mjs          # fetch + rewrite
 *   node scripts/build-galleries.mjs --dry    # fetch only, no rewrite
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const UA = { "User-Agent": "NawiSaadiSite/1.0 (info@nawisaadi.com)" };
const OUT = "public/images/destinations";
const DRY = process.argv.includes("--dry");
mkdirSync(OUT, { recursive: true });

/** Four explicit landmark queries per package — no generic mood words. */
const PLAN = {
  "baku-wonders": [
    ["Flame Towers Baku night", "baku-flame-towers"],
    ["Maiden Tower Baku Icherisheher", "baku-maiden-tower"],
    ["Heydar Aliyev Center Baku", "baku-heydar-aliyev"],
    ["Gobustan rock art petroglyphs", "baku-gobustan"],
  ],
  "salalah-khareef-monsoon": [
    ["Salalah landscape meadows", "salalah-meadows"],
    ["Wadi Darbat Oman", "salalah-wadi-darbat"],
    ["Sultan Qaboos Mosque Salalah", "salalah-mosque"],
    ["Mughsail beach Oman", "salalah-mughsail"],
  ],
  "umrah-17-nights": [
    ["Al-Masjid an-Nabawi Medina", "umrah-nabawi"],
    ["Masjid al-Haram Mecca", "umrah-haram"],
    ["Abraj Al Bait Mecca", "umrah-clock-tower"],
    ["Quba Mosque Medina", "umrah-quba"],
  ],
  "bosnian-delight": [
    ["Stari Most Mostar bridge", "bosnia-stari-most"],
    ["Sarajevo Bascarsija", "bosnia-sarajevo"],
    ["Kravice waterfalls", "bosnia-kravice"],
    ["Blagaj Tekke Buna", "bosnia-blagaj"],
  ],
  "swiss-alpine-dream": [
    ["Lauterbrunnen valley Switzerland", "swiss-lauterbrunnen"],
    ["Jungfraujoch Sphinx observatory building", "swiss-jungfraujoch"],
    ["Chapel Bridge Lucerne", "swiss-lucerne"],
    ["Matterhorn Zermatt", "swiss-matterhorn"],
  ],
  "maldives-overwater-escape": [
    ["Maldives resort island aerial", "maldives-island"],
    ["Maldives water bungalows", "maldives-villas"],
    ["Maldives beach turquoise lagoon", "maldives-lagoon"],
    ["Male Maldives city", "maldives-male"],
  ],
  "georgia-mountain-weekender": [
    ["Tbilisi old town Narikala", "georgia-tbilisi-old"],
    ["Gergeti Trinity Church Kazbegi", "georgia-gergeti"],
    ["Signagi Georgia town", "georgia-signagi"],
    ["Ananuri fortress Georgia", "georgia-ananuri"],
  ],
  "cappadocia-sky-turkey": [
    ["Cappadocia hot air balloons Goreme", "turkey-balloons"],
    ["Cappadocia fairy chimneys", "turkey-chimneys"],
    ["Hagia Sophia Istanbul exterior", "turkey-hagia-sophia"],
    ["Bosphorus Istanbul bridge", "turkey-bosphorus"],
  ],
  "bali-jungle-coast": [
    ["Pura Ulun Danu Bratan temple", "bali-bratan"],
    ["Tegallalang rice terraces Bali", "bali-tegallalang"],
    ["Tanah Lot temple Bali", "bali-tanah-lot"],
    ["Nusa Penida Kelingking beach", "bali-nusa-penida"],
  ],
  "japan-golden-route": [
    ["Chureito Pagoda Mount Fuji", "japan-chureito"],
    ["Fushimi Inari torii Kyoto", "japan-fushimi"],
    ["Shibuya crossing Tokyo", "japan-shibuya"],
    ["Osaka Castle", "japan-osaka-castle"],
  ],
  "paris-french-riviera": [
    ["Eiffel Tower from Trocadero", "france-eiffel"],
    ["Louvre Pyramid Paris", "france-louvre"],
    ["Nice Promenade des Anglais", "france-nice"],
    ["Monaco Monte Carlo harbour", "france-monaco"],
  ],
  "italy-classic-grand-tour": [
    ["Colosseum Rome 2019", "italy-colosseum"],
    ["Florence Duomo cathedral", "italy-florence"],
    ["Grand Canal Venice", "italy-venice"],
    ["Trevi Fountain Rome", "italy-trevi"],
  ],
  "greece-santorini-athens": [
    ["Oia Santorini blue domes", "greece-oia"],
    ["Parthenon Acropolis Athens", "greece-parthenon"],
    ["Santorini caldera view", "greece-caldera"],
    ["Mykonos windmills", "greece-mykonos"],
  ],
  "egypt-pharaohs-nile": [
    ["Great Sphinx of Giza", "egypt-sphinx"],
    ["Pyramids of Giza panorama", "egypt-pyramids"],
    ["Karnak temple Luxor", "egypt-karnak"],
    ["Abu Simbel temple", "egypt-abu-simbel"],
  ],
};

const REJECT =
  /\b(sign|signpost|plaque|schild|map|plan|diagram|logo|flag|coat of arms|engraving|lithograph|drawing|painting|postcard|stamp|print|sketch|illustration|portrait|banknote|coin|seal|chart|graph|poster)\b/i;

/** Reject near-greyscale scans and artwork reproductions. */
async function isColourPhoto(buf) {
  const { data } = await sharp(buf)
    .resize(48, 48, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sat = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 3) {
    const mx = Math.max(data[i], data[i + 1], data[i + 2]);
    const mn = Math.min(data[i], data[i + 1], data[i + 2]);
    sat += mx - mn;
    n++;
  }
  return sat / n > 14;
}

async function search(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    "&gsrlimit=10&gsrnamespace=6&prop=imageinfo&iiprop=url|size&iiurlwidth=2000&format=json";
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return [];
  const json = await res.json();
  return Object.values(json?.query?.pages ?? [])
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
    .filter((x) => x.info && x.info.width >= 1400 && !REJECT.test(x.title));
}

async function fetchOne(query, name) {
  const file = `${OUT}/${name}.jpg`;
  if (existsSync(file)) return `/images/destinations/${name}.jpg`;

  for (const cand of await search(query)) {
    try {
      const res = await fetch(cand.info.thumburl, { headers: UA });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!(await isColourPhoto(buf))) continue;
      await sharp(buf)
        .resize(1600, 1067, { fit: "cover", position: "centre" })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(file);
      console.log(`  ${name.padEnd(24)} <- ${cand.title.slice(5, 60)}`);
      return `/images/destinations/${name}.jpg`;
    } catch {
      /* try the next candidate */
    }
  }
  console.log(`  ${name.padEnd(24)} !! no usable result for "${query}"`);
  return null;
}

const resolved = {};
for (const [slug, entries] of Object.entries(PLAN)) {
  console.log(`\n${slug}`);
  const paths = [];
  for (const [query, name] of entries) {
    const p = await fetchOne(query, name);
    if (p) paths.push(p);
  }
  resolved[slug] = paths;
}

if (DRY) {
  console.log("\n--dry: data files untouched.");
  process.exit(0);
}

// ---- rewrite the gallery arrays -----------------------------------------
for (const f of ["src/data/package-details-a.ts", "src/data/package-details-b.ts"]) {
  let src = readFileSync(f, "utf8");
  const at = new Map();
  for (const m of src.matchAll(/^ {2}"([a-z0-9-]+)":\s*\{/gm)) at.set(m[1], m.index);

  // Rewrite from the bottom up so earlier indices stay valid.
  for (const slug of [...at.keys()].reverse()) {
    const paths = resolved[slug];
    if (!paths?.length) continue;
    const start = at.get(slug);
    const galMatch = src.slice(start).match(/"gallery":\s*\[[\s\S]*?\]/);
    if (!galMatch) continue;
    const body = paths.map((p) => `      "${p}"`).join(",\n");
    const replacement = `"gallery": [\n${body}\n    ]`;
    const absStart = start + galMatch.index;
    src = src.slice(0, absStart) + replacement + src.slice(absStart + galMatch[0].length);
  }
  writeFileSync(f, src);
  console.log(`rewrote ${f}`);
}
