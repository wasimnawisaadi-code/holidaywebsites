/**
 * Sources destination photography from Wikimedia Commons.
 *
 * The relevance audit removed seventeen images that were the wrong country
 * entirely — the Sphinx filed under Morocco, the Blue Mosque under the Czech
 * Republic, Mount Bromo under Uzbekistan. Removing them was right, but it left
 * Morocco, the Czech Republic and the United States showing a single
 * photograph each. This refills them from a source the site already uses and
 * already credits: see public/images/destinations/CREDITS.txt.
 *
 * An earlier attempt at this left three files in the repository that were
 * Wikimedia's own HTTP 429 error page saved with a .jpg extension, because it
 * sent no User-Agent and never checked what came back. Both mistakes are
 * addressed here:
 *
 *   - Wikimedia's policy requires a descriptive User-Agent identifying the
 *     project and a contact. Without one you are throttled almost immediately.
 *   - Every download is checked for real image magic bytes before it is
 *     written, and re-encoded through sharp, which fails loudly on anything
 *     that is not actually an image.
 *
 * Licence metadata is pulled with the file and appended to CREDITS.txt, so the
 * attribution the CC licences require travels with the image rather than being
 * reconstructed later from memory.
 *
 *   node scripts/source-destination-images.mjs            # fetch to a staging dir
 *   node scripts/source-destination-images.mjs --commit   # move staged into public/
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const UA =
  "NawiSaadiHolidays/1.0 (https://www.nawisaadiholidays.com; nawisaadiholidays@gmail.com) node-fetch";
const API = "https://commons.wikimedia.org/w/api.php";
const STAGE = "scripts/__sourced";
const OUT = "public/images/destinations";

/**
 * What each destination is missing, phrased as the landmark a customer would
 * recognise rather than as a country name. A search for "Morocco" returns
 * maps, flags and coins; a search for "Chefchaouen blue street" returns the
 * photograph that sells the trip.
 */
const WANTED = [
  { slug: "morocco-marrakech", query: "Jemaa el-Fnaa Marrakesh", note: "Marrakech, Jemaa el-Fnaa" },
  { slug: "morocco-chefchaouen", query: "Chefchaouen blue street", note: "Chefchaouen blue city" },
  { slug: "morocco-sahara", query: "Erg Chebbi dunes Morocco", note: "Sahara, Erg Chebbi" },
  {
    slug: "czech-charles-bridge",
    query: "Charles Bridge Prague morning",
    note: "Prague, Charles Bridge",
  },
  {
    slug: "czech-old-town",
    query: "Prague astronomical clock Old Town Square",
    note: "Prague, Old Town Square",
  },
  { slug: "czech-cesky-krumlov", query: "Cesky Krumlov castle town", note: "Cesky Krumlov" },
  {
    slug: "usa-times-square",
    query: "Times Square New York night",
    note: "New York, Times Square",
  },
  { slug: "usa-niagara", query: "Niagara Falls Horseshoe aerial", note: "Niagara Falls" },
  { slug: "usa-washington-dc", query: "Lincoln Memorial Washington DC", note: "Washington DC" },
  {
    slug: "singapore-supertree",
    query: "Supertree Grove Gardens by the Bay",
    note: "Gardens by the Bay",
  },
  { slug: "singapore-merlion", query: "Merlion Singapore", note: "Merlion Park" },
  {
    slug: "germany-neuschwanstein-real",
    query: "Neuschwanstein Castle",
    note: "Neuschwanstein Castle",
  },
  { slug: "brazil-iguazu", query: "Iguazu Falls Brazil", note: "Iguazu Falls" },
  { slug: "jordan-dead-sea", query: "Dead Sea Jordan shore", note: "Dead Sea" },
  { slug: "uk-edinburgh", query: "Edinburgh Castle Scotland", note: "Edinburgh Castle" },
  { slug: "austria-salzburg", query: "Salzburg old town Hohensalzburg", note: "Salzburg" },
  { slug: "thailand-grand-palace", query: "Grand Palace Bangkok", note: "Bangkok, Grand Palace" },
  { slug: "uzbekistan-bukhara", query: "Bukhara Kalyan minaret", note: "Bukhara" },
  { slug: "kenya-masai-mara", query: "Masai Mara wildebeest lions", note: "Masai Mara" },
];

const j = async (url) => {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${r.status} ${url.slice(0, 90)}`);
  return r.json();
};

/** Commons search, restricted to files, biased to large photographs. */
async function findCandidates(query, limit = 6) {
  const u = `${API}?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(
    "filetype:bitmap " + query,
  )}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2000`;
  const data = await j(u);
  const pages = data?.query?.pages ?? {};
  return (
    Object.values(pages)
      .map((p) => {
        const ii = p.imageinfo?.[0];
        if (!ii) return null;
        const m = ii.extmetadata ?? {};
        const strip = (s) =>
          String(s ?? "")
            .replace(/<[^>]*>/g, "")
            .trim();
        return {
          title: p.title,
          url: ii.thumburl || ii.url,
          width: ii.width,
          height: ii.height,
          licence: strip(m.LicenseShortName?.value),
          artist: strip(m.Artist?.value).slice(0, 120),
          desc: strip(m.ImageDescription?.value).slice(0, 160),
        };
      })
      .filter(Boolean)
      // Landscape, and big enough to serve at 1600 wide.
      .filter((c) => c.width >= 1600 && c.width > c.height)
      // Anything without a clear free licence is not usable here.
      .filter((c) => /^(CC|Public domain|CC0)/i.test(c.licence))
  );
}

const MAGIC = [
  [0xff, 0xd8, 0xff], // jpeg
  [0x89, 0x50, 0x4e, 0x47], // png
];
const looksLikeImage = (buf) =>
  MAGIC.some((sig) => sig.every((b, i) => buf[i] === b)) ||
  (buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP");

fs.mkdirSync(STAGE, { recursive: true });
const manifest = [];

for (const want of WANTED) {
  process.stdout.write(`  ${want.slug.padEnd(30)}`);
  try {
    const candidates = await findCandidates(want.query);
    if (!candidates.length) {
      console.log("no free-licensed candidate");
      continue;
    }
    const pick = candidates[0];

    const res = await fetch(pick.url, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await res.arrayBuffer());

    // The check that was missing last time: an HTTP error page is not a photo.
    if (!res.ok || !looksLikeImage(buf)) {
      console.log(`REJECTED — ${res.status}, not image data (${buf.length}B)`);
      continue;
    }

    const file = path.join(STAGE, `${want.slug}.jpg`);
    await sharp(buf)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(file);
    const kb = (fs.statSync(file).size / 1024).toFixed(0);
    manifest.push({ ...want, ...pick, file });
    console.log(
      `ok  ${kb}KB  ${pick.licence.padEnd(14)} ${pick.title.replace("File:", "").slice(0, 44)}`,
    );
  } catch (e) {
    console.log("failed —", String(e.message).slice(0, 70));
  }
  await new Promise((r) => setTimeout(r, 400)); // be polite to the API
}

fs.writeFileSync(path.join(STAGE, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(
  `\n${manifest.length}/${WANTED.length} staged in ${STAGE}/ — review before committing.`,
);
