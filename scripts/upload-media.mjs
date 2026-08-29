/**
 * Uploads images to the Supabase `media` bucket.
 *
 * Intended for photographs added after launch — a new package image that
 * should appear without a redeploy. The repo's own destination photography
 * stays on Vercel's CDN, which serves it with immutable caching at no egress
 * cost; Supabase's free tier allows 5GB of egress a month, and routing an
 * image-heavy travel site through it would be slower and eventually billable.
 *
 * Uses the service role key, so this only ever runs locally or in CI, never in
 * the browser. Storage policies deliberately grant no anon write.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/upload-media.mjs <file-or-dir> [--prefix packages] [--dry]
 *
 * Every file is re-encoded before upload with the same treatment as the rest of
 * public/images — 1600px long edge, progressive JPEG — so a 6MB camera original
 * does not become a 6MB download.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , target, ...rest] = process.argv;
const DRY = rest.includes("--dry");
const prefixIdx = rest.indexOf("--prefix");
const PREFIX = prefixIdx >= 0 ? rest[prefixIdx + 1] : "uploads";

const URL_BASE = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
const SERVICE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const BUCKET = "media";
const MAX_EDGE = 1600;

if (!target) {
  console.error("usage: node scripts/upload-media.mjs <file-or-dir> [--prefix name] [--dry]");
  process.exit(1);
}
if (!URL_BASE || !SERVICE_KEY) {
  console.error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      "Never commit these — export them for the command, or use .env.local.",
  );
  process.exit(1);
}

const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

const collect = (p) => {
  const st = fs.statSync(p);
  if (st.isFile()) return IMAGE.test(p) ? [p] : [];
  return fs
    .readdirSync(p)
    .flatMap((f) => collect(path.join(p, f)));
};

const files = collect(target);
if (!files.length) {
  console.error(`No images found at ${target}`);
  process.exit(1);
}

console.log(`${files.length} image(s) -> ${BUCKET}/${PREFIX}/`);
if (DRY) {
  files.forEach((f) => console.log("  " + f));
  console.log("\n[dry run] nothing uploaded");
  process.exit(0);
}

let ok = 0;
let failed = 0;
let bytesIn = 0;
let bytesOut = 0;

for (const file of files) {
  const name = path.basename(file).replace(IMAGE, ".jpg").toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const objectPath = `${PREFIX}/${name}`;

  try {
    const input = fs.readFileSync(file);
    bytesIn += input.length;

    const meta = await sharp(input).metadata();
    let pipe = sharp(input).rotate();
    if (Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE) {
      pipe = pipe.resize({
        width: (meta.width ?? 0) >= (meta.height ?? 0) ? MAX_EDGE : undefined,
        height: (meta.height ?? 0) > (meta.width ?? 0) ? MAX_EDGE : undefined,
        withoutEnlargement: true,
      });
    }
    const out = await pipe.jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
    const outMeta = await sharp(out).metadata();
    bytesOut += out.length;

    // upsert so re-running replaces rather than erroring on a duplicate name.
    const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${objectPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
        "cache-control": "public, max-age=31536000, immutable",
      },
      body: out,
    });

    if (!res.ok) {
      failed++;
      console.log(`  FAIL ${objectPath}  ${res.status} ${(await res.text()).slice(0, 120)}`);
      continue;
    }

    // Record it so the admin media list has alt text and dimensions without
    // having to probe the bucket.
    await fetch(`${URL_BASE}/rest/v1/media`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        path: objectPath,
        alt: "",
        width: outMeta.width,
        height: outMeta.height,
        bytes: out.length,
        uploaded_by: "cli",
      }),
    }).catch(() => {
      /* the object is uploaded; the index row is a convenience */
    });

    ok++;
    console.log(`  ok   ${objectPath}  ${Math.round(out.length / 1024)}KB`);
  } catch (err) {
    failed++;
    console.log(`  FAIL ${file}  ${err.message}`);
  }
}

const mb = (n) => (n / 1048576).toFixed(1) + "MB";
console.log(`\nuploaded ${ok}, failed ${failed}`);
console.log(`source ${mb(bytesIn)} -> stored ${mb(bytesOut)}`);
console.log(`public URL pattern: ${URL_BASE}/storage/v1/object/public/${BUCKET}/${PREFIX}/<name>.jpg`);
