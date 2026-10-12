import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";

const path = "source-content/afghanistan/image-candidates.json";
const queries = [
  "Kabul Babur gardens",
  "Bamyan valley",
  "Herat Friday Mosque",
  "Mazar Sharif Blue Mosque",
  "Nuristan valley",
  "Wakhan landscape",
  "Minaret Jam",
  "Band-e Amir lake",
];
if (process.argv[2] === "search") {
  const result = [];
  for (const query of queries) {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "4",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "1600",
      format: "json",
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error(`${response.status}: ${query}`);
    const data = await response.json();
    const images = Object.values(data.query?.pages ?? {}).map((p) => ({
      title: p.title,
      ...p.imageinfo[0],
    }));
    result.push({ query, images });
    console.log(
      query,
      images.map((i) => ({ title: i.title, license: i.extmetadata.LicenseShortName?.value })),
    );
  }
  writeFileSync(path, JSON.stringify(result, null, 2));
} else {
  const choices = JSON.parse(readFileSync("source-content/afghanistan/image-choices.json", "utf8"));
  const candidates = JSON.parse(readFileSync(path, "utf8"));
  mkdirSync("public/images/afghanistan", { recursive: true });
  const credits = [];
  for (const choice of choices) {
    const found = candidates.flatMap((c) => c.images).find((i) => i.title === choice.title);
    if (!found) throw new Error(`Missing ${choice.title}`);
    if (
      !existsSync(`public/images/afghanistan/${choice.id}.webp`) ||
      process.argv.includes(`--refresh=${choice.id}`)
    ) {
      const response = await fetch(found.url);
      if (!response.ok) throw new Error(`${response.status}: ${choice.title}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      await sharp(bytes)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(`public/images/afghanistan/${choice.id}.webp`);
    }
    const strip = (s) => (s || "").replace(/<[^>]*>/g, "").trim();
    credits.push({
      image: `/images/afghanistan/${choice.id}.webp`,
      alt: choice.alt,
      author: strip(found.extmetadata.Artist?.value),
      license: strip(found.extmetadata.LicenseShortName?.value),
      licenseUrl: found.extmetadata.LicenseUrl?.value || found.descriptionurl,
      source: found.descriptionurl,
      changes: "Resized and converted to WebP; displayed with cropping.",
    });
    console.log(`Saved ${choice.id}`);
  }
  writeFileSync(
    "src/data/afghanistan-image-credits.ts",
    `// Licensed destination photography; retained attribution and source links.\nexport const afghanistanImageCredits = ${JSON.stringify(credits, null, 2)};\n`,
  );
}
