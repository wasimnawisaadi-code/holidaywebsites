# Afghanistan tour collection

Content source: 14 Word documents supplied by the Kabul office, dated 8 October 2026.
`documents.json` retains their paragraph text. Original Word files remain local.

Run `node scripts/import-afghanistan.mjs` to rebuild the full package/detail data,
then `node scripts/generate-lite-data.mjs` to rebuild listing data.

The import verifies the 14 documents, eight inclusions and four exclusions per
package, and 141 sequential itinerary days. The two similarly titled seven-day
tours have distinct route-based display names and slugs. Prices are interpreted
as USD from the source dollar amounts; no exchange-rate conversion is applied.

Operational points requiring confirmation in the final customer quotation:

- Domestic flights appear in itineraries but not explicitly in the inclusions.
- Remote tours list 3–4-star hotels without identifying every overnight property.
- Women's community visits and individual site access depend on local permissions.
- Some flights and optional activities are explicitly conditional in the source.
- Nights are calculated as trip days minus one, including overnight travel where listed.

These qualifications appear on the collection page and package booking notes.
The itinerary paragraphs preserve the original daily descriptions and conditions.

`image-choices.json` records the selected real destination photographs.
`image-candidates.json` retains only their Wikimedia license/source metadata.
`src/data/afghanistan-image-credits.ts` powers public attribution under
`/afghanistan#photo-credits`, linked from the footer.
Images are resized and converted to WebP, with no generated destination imagery.

Verification: `node scripts/verify-afghanistan.mjs http://127.0.0.1:5201`
checks all 14 detail pages and PDF downloads, day counts, pricing currencies,
image files, sitemap entries and an existing AED-priced package.
