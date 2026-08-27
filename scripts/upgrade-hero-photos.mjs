/**
 * Replaces the three lowest-resolution package photographs with high-resolution
 * freely-licensed originals from Wikimedia Commons.
 *
 * hero-bali, hero-italy and hero-japan were 1000x1333 — noticeably soft in the
 * editorial spread on the landing page, where a package image is rendered close
 * to full width. Everything else in the folder is 1600px.
 *
 * Real photographs, deliberately. These sit on a licensed travel agency's
 * booking pages: a customer chooses an itinerary from the picture, so it has to
 * be the actual place. Each candidate below is chosen to match the itinerary the
 * package sells, not just the country.
 */
import fs from "node:fs";
import sharp from "sharp";

const UA = "NawiSaadiSiteBuild/1.0 (wasimnawisaadi@gmail.com)";
const OUT = "public/images/destinations";
const WIDTH = 1600;

/**
 * Candidates are ordered; the first that downloads and is genuinely larger than
 * what we already have wins. Commons occasionally reorganises a file, so a
 * single URL is a single point of failure.
 */
const TARGETS = [
  {
    file: "hero-bali.jpg",
    itinerary: "Ubud · Tegallalang · Nusa Penida · Seminyak",
    candidates: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Tegallalang_Rice_Terraces_Bali_1.jpg/1920px-Tegallalang_Rice_Terraces_Bali_1.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tegallalang_rice_terraces_SF0001.jpg/1920px-Tegallalang_rice_terraces_SF0001.jpg",
    ],
    credit: "Tegallalang rice terraces, Ubud, Bali — Wikimedia Commons",
  },
  {
    file: "hero-italy.jpg",
    itinerary: "Rome · Vatican · Florence · Pisa · Venice",
    candidates: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1920px-Colosseo_2020.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Cathedral_Santa_Maria_del_Fiore_%28Florence%29.jpg/1920px-Cathedral_Santa_Maria_del_Fiore_%28Florence%29.jpg",
    ],
    credit: "Colosseum, Rome — Wikimedia Commons",
  },
  {
    file: "hero-japan.jpg",
    itinerary: "Tokyo · Mt. Fuji · Hakone · Kyoto · Osaka",
    candidates: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Chureito_Pagoda_and_Mount_Fuji_20241022.jpg/1920px-Chureito_Pagoda_and_Mount_Fuji_20241022.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Chureito_Pagoda_and_Mount_Fuji_%2844951842365%29.jpg/1920px-Chureito_Pagoda_and_Mount_Fuji_%2844951842365%29.jpg",
    ],
    credit: "Chureito Pagoda and Mount Fuji — Wikimedia Commons",
  },
];

const applied = [];

for (const t of TARGETS) {
  const dest = `${OUT}/${t.file}`;
  const before = fs.existsSync(dest) ? (await sharp(dest).metadata()).width ?? 0 : 0;

  let done = false;
  for (const url of t.candidates) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) {
        console.log(`  ${t.file}: HTTP ${res.status} — trying next candidate`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf).metadata();
      if ((meta.width ?? 0) <= before) {
        console.log(`  ${t.file}: candidate is not larger (${meta.width}px) — skipping`);
        continue;
      }
      await sharp(buf)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 84, mozjpeg: true, progressive: true })
        .toFile(dest);
      const after = (await sharp(dest).metadata()).width;
      const kb = Math.round(fs.statSync(dest).size / 1024);
      console.log(`  ${t.file}: ${before}px -> ${after}px (${kb}KB)`);
      applied.push({ ...t, url });
      done = true;
      break;
    } catch (err) {
      console.log(`  ${t.file}: ${err.message} — trying next candidate`);
    }
  }
  if (!done) console.log(`  ${t.file}: NO CANDIDATE SUCCEEDED — left as-is`);
}

// Record provenance alongside the images already credited there.
if (applied.length) {
  const creditsPath = `${OUT}/CREDITS.txt`;
  const existing = fs.existsSync(creditsPath) ? fs.readFileSync(creditsPath, "utf8") : "";
  const block =
    "\n\nHigh-resolution replacements for three soft 1000x1333 originals.\n" +
    "Freely licensed, via Wikimedia Commons.\n\n" +
    applied.map((a) => `${a.file}\n    ${a.credit}\n    itinerary: ${a.itinerary}`).join("\n\n") +
    "\n";
  fs.writeFileSync(creditsPath, existing.trimEnd() + block);
  console.log(`\ncredits updated for ${applied.length} file(s)`);
}
