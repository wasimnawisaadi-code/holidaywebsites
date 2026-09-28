/**
 * A photograph for a trip that has no cover of its own yet.
 *
 * The office can upload a cover for every trip and every day, and that always
 * wins. This is only the fallback, so a trip created in thirty seconds at the
 * counter still opens on a real picture of where the customer is going rather
 * than an empty navy block.
 *
 * The photos are the agency's own, copied from the website. The match is on the
 * destination text the office typed, earliest keyword in the list first, so
 * "Dubai + Abu Dhabi" opens on Dubai. A destination with no honest match gets
 * the Dubai skyline — the agency's home — and never a picture of somewhere the
 * customer is not going: an Umrah trip does not open on a mosque in Abu Dhabi.
 *
 * Client-safe: no server imports.
 */

const MATCHES: [RegExp, string][] = [
  [/maldives/i, "dest-maldives"],
  [/\bbali\b|indonesia/i, "dest-bali"],
  [/thailand|phuket|bangkok|krabi|pattaya/i, "dest-thailand"],
  [/turkey|t[üu]rkiye|istanbul|cappadocia|antalya/i, "dest-turkey"],
  [/georgia|tbilisi|batumi/i, "dest-georgia"],
  [/azerbaijan|baku|gabala/i, "dest-azerbaijan"],
  [/egypt|cairo|luxor|sharm|hurghada/i, "dest-egypt"],
  [/japan|tokyo|kyoto|osaka/i, "dest-japan"],
  [/switzerland|swiss|zurich|geneva|interlaken|lucerne/i, "dest-switzerland"],
  [/morocco|marrakech|casablanca/i, "dest-morocco"],
  [/singapore/i, "dest-singapore"],
  [/kenya|tanzania|zanzibar|safari|south africa|cape town|mauritius|seychelles/i, "dest-africa"],
  [
    /europe|france|paris|italy|rome|spain|barcelona|london|united kingdom|\buk\b|germany|austria|vienna|prague|czech|hungary|budapest|greece|netherlands|amsterdam|portugal|lisbon/i,
    "dest-europe",
  ],
  [/dubai/i, "hero-dubai"],
  [/abu dhabi/i, "uae-mosque"],
];

const FALLBACK = "hero-dubai";

/** Full-size photo path for a destination, served from /destinations. */
export function destinationPhoto(destination: string | null | undefined, small = false): string {
  const text = destination ?? "";
  const hit = MATCHES.find(([re]) => re.test(text))?.[1] ?? FALLBACK;
  return `/destinations/${hit}${small ? "-sm" : ""}.webp`;
}
