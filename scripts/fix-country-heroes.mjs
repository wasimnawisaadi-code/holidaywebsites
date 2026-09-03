/**
 * Second pass over the country data: fixes hero images that show the wrong
 * country, and fills galleries that are still short.
 *
 * The first pass rewrote galleries but kept every `image` (hero) untouched,
 * which left the worst cases in place — Austria's lead photograph was the
 * Colosseum. A gallery a visitor may never scroll to matters less than the one
 * picture that represents the destination.
 *
 * Commons rate-limits a burst of searches, which is why the first run returned
 * nothing for two thirds of the countries. This one paces the requests and
 * retries, so a country either gets real photographs of itself or is reported
 * as still short — it never silently keeps another country's picture.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FILE = "src/data/countries.ts";
const OUT = "public/images/destinations";
const UA = "NawiSaadiSiteBuild/1.0 (wasimnawisaadi@gmail.com)";
const TARGET = 4;
const PACE_MS = 900;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SEARCH = {
  switzerland: "Matterhorn Zermatt Switzerland",
  austria: "Hallstatt Austria village lake",
  nepal: "Annapurna Himalaya Nepal mountains",
  kyrgyzstan: "Song Kul lake Kyrgyzstan",
  tanzania: "Serengeti Tanzania savanna",
  kazakhstan: "Charyn Canyon Kazakhstan",
  argentina: "Perito Moreno glacier Argentina",
  indonesia: "Tanah Lot temple Bali",
  malaysia: "Petronas Towers Kuala Lumpur",
  thailand: "Wat Arun Bangkok",
  kenya: "Maasai Mara Kenya savanna",
  australia: "Sydney Opera House",
  singapore: "Gardens by the Bay Singapore",
  vietnam: "Ha Long Bay Vietnam",
  china: "Great Wall of China",
  "south-korea": "Gyeongbokgung Palace Seoul",
  "hong-kong": "Victoria Harbour Hong Kong",
  serbia: "Belgrade fortress Serbia",
  georgia: "Gergeti Trinity Church Kazbegi",
  azerbaijan: "Flame Towers Baku",
  armenia: "Tatev monastery Armenia",
  "sri-lanka": "Sigiriya Sri Lanka",
  brazil: "Christ the Redeemer Rio de Janeiro",
  maldives: "Maldives atoll aerial",
  seychelles: "Anse Source d'Argent Seychelles",
  italy: "Venice Grand Canal Italy",
  greece: "Santorini Oia Greece",
  "czech-republic": "Charles Bridge Prague",
  hungary: "Hungarian Parliament Building Budapest",
  turkey: "Cappadocia Turkey",
  japan: "Fushimi Inari Kyoto",
  france: "Eiffel Tower Paris",
  egypt: "Great Sphinx of Giza",
  morocco: "Jemaa el-Fnaa Marrakesh",
  jordan: "Al Khazneh Petra Jordan",
  "united-kingdom": "Edinburgh Castle",
  uzbekistan: "Registan Samarkand",
  oman: "Wadi Shab Oman",
  "bosnia-and-herzegovina": "Stari Most Mostar",
  "saudi-arabia": "Great Mosque of Mecca",
  qatar: "Doha Corniche Qatar",
  bahrain: "Bahrain World Trade Center Manama",
  mauritius: "Le Morne Brabant Mauritius",
  "south-africa": "Table Mountain Cape Town",
  "united-states-of-america": "Grand Canyon Arizona",
  spain: "Sagrada Familia Barcelona",
  portugal: "Belem Tower Lisbon",
  netherlands: "Amsterdam canal houses",
  germany: "Neuschwanstein Castle Bavaria",
  russia: "Saint Basil's Cathedral Moscow",
};

const ALIAS = {
  "bosnia-and-herzegovina": ["bosnia", "mostar", "stari-most", "kravice", "blagaj", "sarajevo"],
  "saudi-arabia": ["umrah", "haram", "nabawi", "quba"],
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

const owns = (slug, img) => {
  const file = (img.split("/").pop() ?? "").toLowerCase();
  const s = slug.toLowerCase();
  if (file.startsWith(s + "-") || file.startsWith(s + ".")) return true;
  return (ALIAS[s] ?? []).some((a) => file.startsWith(a));
};

async function commonsSearch(query) {
  const u =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    "&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size&iiurlwidth=1600";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(u, { headers: { "User-Agent": UA } });
      if (r.status === 429) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      if (!r.ok) return [];
      const j = await r.json();
      return Object.values(j.query?.pages ?? {})
        .map((p) => p.imageinfo?.[0])
        .filter((ii) => ii && ii.width >= 1200 && ii.width > ii.height)
        .map((ii) => ii.thumburl);
    } catch {
      await sleep(1500);
    }
  }
  return [];
}

const text = fs.readFileSync(FILE, "utf8");
const blocks = text.split("c({");

const records = blocks
  .slice(1)
  .map((b) => ({
    slug: /slug:\s*"([^"]+)"/.exec(b)?.[1],
    name: /\n\s*name:\s*"([^"]+)"/.exec(b)?.[1],
    hero: /\n\s*image:\s*\n?\s*"([^"]+)"/.exec(b)?.[1],
    gallery: (() => {
      const g = /gallery:\s*\[([\s\S]*?)\]/.exec(b);
      return g ? [...g[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    })(),
  }))
  .filter((r) => r.slug);

const resolved = new Map();
let heroesFixed = 0;
let added = 0;
const stillShort = [];

for (const r of records) {
  const mine = [...new Set([r.hero, ...r.gallery].filter(Boolean).filter((i) => owns(r.slug, i)))];
  const heroWrong = r.hero ? !owns(r.slug, r.hero) : true;

  if (mine.length < TARGET || heroWrong) {
    const urls = await commonsSearch(SEARCH[r.slug] ?? r.name);
    await sleep(PACE_MS);
    for (const url of urls) {
      if (mine.length >= TARGET) break;
      const name = `${slugify(r.slug)}-p${String(mine.length + 1).padStart(2, "0")}.jpg`;
      const dest = path.join(OUT, name);
      try {
        if (!fs.existsSync(dest)) {
          const res = await fetch(url, { headers: { "User-Agent": UA } });
          if (!res.ok) continue;
          await sharp(Buffer.from(await res.arrayBuffer()))
            .resize({ width: 1600, withoutEnlargement: true })
            .jpeg({ quality: 82, mozjpeg: true, progressive: true })
            .toFile(dest);
          added++;
        }
        mine.push(`/images/destinations/${name}`);
      } catch {
        /* next candidate */
      }
    }
  }

  if (heroWrong && mine.length) heroesFixed++;
  if (!mine.length) stillShort.push(r.name);
  resolved.set(r.slug, mine);
  console.log(
    `  ${(r.name ?? r.slug).padEnd(26)} ${mine.length} image(s)${heroWrong && mine.length ? "  [hero replaced]" : ""}`,
  );
}

// Rewrite: hero becomes the first owned image, gallery is the owned set.
let out = blocks[0];
for (let i = 1; i < blocks.length; i++) {
  let b = blocks[i];
  const slug = /slug:\s*"([^"]+)"/.exec(b)?.[1];
  const list = slug ? resolved.get(slug) : null;
  if (list?.length) {
    b = b.replace(/(\n\s*image:\s*)\n?\s*"[^"]+"/, `$1"${list[0]}"`);
    const rendered = "gallery: [\n" + list.map((g) => `      "${g}",`).join("\n") + "\n    ]";
    b = /gallery:\s*\[[\s\S]*?\]/.test(b)
      ? b.replace(/gallery:\s*\[[\s\S]*?\]/, rendered)
      : b.replace(/(slug:\s*"[^"]+",\n)/, `$1    ${rendered},\n`);
  }
  out += "c({" + b;
}
fs.writeFileSync(FILE, out);

console.log(`\nheroes replaced      ${heroesFixed}`);
console.log(`photographs added    ${added}`);
if (stillShort.length) {
  console.log(`\nNO OWNED PHOTOGRAPH (left unchanged, needs manual sourcing):`);
  stillShort.forEach((s) => console.log("  " + s));
}
