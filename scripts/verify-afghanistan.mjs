import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { afghanistanPackages } from "../src/data/afghanistan-packages.ts";
import { afghanistanDetails } from "../src/data/afghanistan-details.ts";
import { priceLabel, priceParts } from "../src/data/catalogue-meta.ts";

const origin = process.argv[2] || "http://127.0.0.1:5201";
assert.equal(afghanistanPackages.length, 14);
assert.equal(new Set(afghanistanPackages.map((p) => p.slug)).size, 14);
assert.equal(
  afghanistanPackages.reduce((sum, p) => sum + p.itinerary.length, 0),
  141,
);
assert.equal(priceLabel({ priceStatus: "from", priceFrom: 1899 }), "From AED 1,899");
assert.equal(priceLabel({ priceStatus: "on-request" }), "Price on Request");
const landing = await (await fetch(`${origin}/afghanistan`)).text();
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
for (const pkg of afghanistanPackages) {
  assert.equal(pkg.itinerary.length, pkg.days);
  assert.deepEqual(
    pkg.itinerary.map((d) => d.day),
    Array.from({ length: pkg.days }, (_, i) => i + 1),
  );
  assert.equal(pkg.currency, "USD");
  assert.equal(pkg.maxGroupSize, 8);
  assert.equal(pkg.inclusions.length, 8);
  assert.equal(pkg.exclusions.length, 4);
  assert.ok(priceParts(pkg).amount.startsWith("USD "));
  for (const img of afghanistanDetails[pkg.slug].gallery)
    assert.ok(existsSync(`public${img}`), img);
  assert.ok(landing.includes(`/holidays/${pkg.slug}`));
  assert.ok(sitemap.includes(`/holidays/${pkg.slug}`));
  const page = await fetch(`${origin}/holidays/${pkg.slug}`);
  assert.equal(page.status, 200, pkg.slug);
  const html = await page.text();
  assert.ok(html.includes("USD"), pkg.slug);
  assert.ok(html.includes('"priceCurrency":"USD"'), `${pkg.slug} schema currency`);
  const response = await fetch(`${origin}/holidays/${pkg.slug}/itinerary.pdf`);
  assert.equal(response.status, 200, `${pkg.slug} PDF`);
  assert.ok(response.headers.get("content-type")?.includes("application/pdf"));
  const pdf = await PDFDocument.load(await response.arrayBuffer());
  assert.ok(pdf.getPageCount() >= 2);
  console.log(
    `PASS ${pkg.slug}: ${pkg.days} days, USD ${pkg.priceFrom}, ${pdf.getPageCount()} PDF pages`,
  );
}
assert.ok(sitemap.includes("/afghanistan"));
const oldPage = await (await fetch(`${origin}/holidays/baku-wonders`)).text();
assert.ok(oldPage.includes('"priceCurrency":"AED"'));
assert.ok(oldPage.includes("From AED"));
console.log(
  "PASS all 14 pages/PDFs, source counts, currencies, assets, sitemap and existing AED package.",
);
