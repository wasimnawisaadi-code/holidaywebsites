import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

// Source paragraphs are extracted from the 14 Word documents supplied by the Kabul office.
const docs = JSON.parse(
  readFileSync("source-content/afghanistan/documents.json", "utf8").replace(/^\uFEFF/, ""),
);
const photo = (id) => `/images/afghanistan/${id}.webp`;
// File order is fixed by filename in documents.json; unique slugs distinguish the two 7-day tours.
const definitions = [
  [
    "afghanistan-grand-cultural-10-days",
    ["Kabul", "Ghazni", "Kandahar", "Herat", "Bamyan", "Band-e-Amir"],
    ["herat-friday-mosque", "band-e-amir", "bamyan-valley", "kabul-babur-gardens"],
  ],
  [
    "afghanistan-silk-road-10-days",
    ["Kabul", "Bamyan", "Band-e-Amir", "Mazar-i-Sharif", "Herat"],
    ["mazar-blue-mosque", "herat-friday-mosque", "band-e-amir", "bamyan-valley"],
  ],
  [
    "afghanistan-grand-cultural-12-days",
    ["Kabul", "Ghazni", "Kandahar", "Herat", "Bamyan", "Band-e-Amir", "Mazar-i-Sharif", "Balkh"],
    ["herat-friday-mosque", "mazar-blue-mosque", "band-e-amir", "bamyan-valley"],
  ],
  [
    "afghanistan-grand-heritage-14-days",
    [
      "Kabul",
      "Bamyan",
      "Band-e-Amir",
      "Yakawlang",
      "Firuzkuh",
      "Jam",
      "Chisht-e-Sharif",
      "Herat",
      "Kandahar",
      "Mazar-i-Sharif",
      "Balkh",
    ],
    ["minaret-of-jam", "herat-friday-mosque", "mazar-blue-mosque", "band-e-amir"],
  ],
  [
    "afghanistan-beyond-the-roads-15-days",
    [
      "Kabul",
      "Ghazni",
      "Bamyan",
      "Band-e-Amir",
      "Yakawlang",
      "Chaghcharan",
      "Jam",
      "Herat",
      "Maymana",
      "Mazar-i-Sharif",
      "Samangan",
    ],
    ["minaret-of-jam", "bamyan-valley", "herat-friday-mosque", "band-e-amir"],
  ],
  [
    "afghanistan-grand-silk-road-15-days",
    [
      "Kabul",
      "Bamyan",
      "Band-e-Amir",
      "Mazar-i-Sharif",
      "Samangan",
      "Balkh",
      "Herat",
      "Kandahar",
      "Ghazni",
    ],
    ["mazar-blue-mosque", "herat-friday-mosque", "band-e-amir", "kabul-babur-gardens"],
  ],
  [
    "afghanistan-nuristan-7-days",
    ["Kabul", "Jalalabad", "Kunar", "Parun", "Nuristan"],
    ["nuristan-river", "kabul-babur-gardens"],
  ],
  [
    "afghanistan-hidden-highlands-6-days",
    ["Kabul", "Bamyan", "Band-e-Amir", "Ghazni"],
    ["band-e-amir", "bamyan-valley", "kabul-babur-gardens"],
  ],
  [
    "afghanistan-heritage-8-days",
    ["Kabul", "Bamyan", "Band-e-Amir", "Herat"],
    ["herat-friday-mosque", "band-e-amir", "bamyan-valley", "kabul-babur-gardens"],
  ],
  ["afghanistan-discover-kabul-3-days", ["Kabul"], ["kabul-babur-gardens"]],
  [
    "afghanistan-northern-discovery-7-days",
    ["Kabul", "Mazar-i-Sharif", "Balkh", "Bamyan", "Band-e-Amir"],
    ["mazar-blue-mosque", "band-e-amir", "bamyan-valley", "kabul-babur-gardens"],
    "Northern Afghanistan – 7 Days of Discovery",
  ],
  [
    "afghanistan-kabul-bamyan-herat-7-days",
    ["Kabul", "Bamyan", "Band-e-Amir", "Herat"],
    ["bamyan-valley", "herat-friday-mosque", "band-e-amir", "kabul-babur-gardens"],
    "Kabul, Bamyan & Herat – 7 Days of Discovery",
  ],
  [
    "afghanistan-womens-journey-15-days",
    [
      "Kabul",
      "Bamyan",
      "Band-e-Amir",
      "Firoz Koh",
      "Jam",
      "Herat",
      "Helmand",
      "Kandahar",
      "Ghazni",
      "Mazar-i-Sharif",
      "Samangan",
      "Balkh",
    ],
    ["herat-friday-mosque", "minaret-of-jam", "bamyan-valley", "mazar-blue-mosque"],
  ],
  [
    "afghanistan-wakhan-expedition-12-days",
    ["Kabul", "Faizabad", "Baharak", "Ishkashim", "Khandud", "Qala-e-Panj", "Sarhad-e Broghil"],
    ["wakhan-mountains", "kabul-babur-gardens"],
  ],
];
const packages = [];
const details = {};
for (const [index, doc] of docs.entries()) {
  const p = doc.paragraphs.map((s) => s.trim());
  const [slug, route, images, title] = definitions[index];
  const match = p[1].match(/(\d+) Days.*Max (\d+).*\$(\d+)/);
  assert.ok(match, doc.file);
  const [, days, maxGroup, price] = match.map((v, i) => (i ? Number(v) : v));
  const firstDay = p.findIndex((s) => /^Day\s+\d+\s*[—–:]/.test(s));
  const hi = p.indexOf("Tour Highlights");
  const includeStart = p.findIndex((s) => /^(Cost Includes|What’s Included)$/.test(s));
  const excludeStart = p.findIndex((s) => /^(Cost Excludes|What’s Not Included)$/.test(s));
  assert.ok(firstDay > hi && hi > 0 && excludeStart > includeStart, doc.file);
  const inclusions = p
    .slice(includeStart + 1, excludeStart)
    .filter((s) => !s.startsWith("Your journey is designed"));
  const exclusions = p
    .slice(excludeStart + 1)
    .filter((s) => !s.startsWith("The following expenses"))
    .slice(0, 4);
  assert.equal(inclusions.length, 8, doc.file);
  assert.equal(exclusions.length, 4, doc.file);
  const introParagraphs = p
    .slice(3, hi)
    .filter((s) => s.length > 100 && !/If this (package|itinerary)/.test(s));
  // The women-only source contains a longer introduction: preserve it in its overview.
  const overview = introParagraphs.join("\n\n").replace("TourismExperience", "Tourism. Experience");
  const highlights = p
    .slice(hi + 1, firstDay)
    .filter((s) => !/Itinerary$/.test(s))
    .map((s) =>
      s.endsWith("and orga")
        ? "Enjoy professional guiding, transportation, accommodation and meals"
        : s,
    );
  const itinerary = [];
  for (let pos = firstDay; pos < includeStart; pos++) {
    const header = p[pos].match(/^Day\s+(\d+)\s*[—–:]\s*(.+)$/);
    if (!header) continue;
    const content = [];
    while (pos + 1 < includeStart && !/^Day\s+\d+\s*[—–:]/.test(p[pos + 1])) {
      pos++;
      if (p[pos] !== "Includes & Excludes") content.push(p[pos]);
    }
    const mealLine = content.find((s) => s.startsWith("Meals:"));
    const meals =
      mealLine
        ?.replace(/^Meals:\s*/, "")
        .split(/Overnight:|Departure:/)[0]
        .trim() || "Three daily meals and drinking water; arrival/departure meals depend on timing";
    const activities = content.flatMap((s) =>
      s.startsWith("Meals:")
        ? s
            .match(/(Overnight:|Departure:)(.*)/)
            ?.slice(1)
            .join(" ")
          ? [
              s
                .match(/(Overnight:|Departure:)(.*)/)
                .slice(1)
                .join(" "),
            ]
          : []
        : [s],
    );
    itinerary.push({
      day: Number(header[1]),
      title: header[2],
      summary: "",
      activities,
      meals,
      transport: content.some((s) => /\bflight\b/i.test(s))
        ? "Private ground transport; domestic flight arrangements and cost to be confirmed"
        : "Private 4WD vehicle; walking as described",
    });
  }
  assert.equal(itinerary.length, days, doc.file);
  assert.deepEqual(
    itinerary.map((d) => d.day),
    Array.from({ length: days }, (_, i) => i + 1),
  );
  const remote = /wakhan|nuristan|beyond-the-roads|grand-heritage-14|womens/.test(slug);
  const notes = [
    {
      title: "Season & group size",
      body: `Spring and summer departures, with a maximum of ${maxGroup} travellers. Dates and departure availability are confirmed by the Kabul team.`,
    },
    {
      title: "Price & booking",
      body: `Advertised starting price: USD ${price.toLocaleString("en-US")} per person. Request a written quotation for your dates, group and room arrangements. International flights, visa fees, insurance and personal expenses are excluded.`,
    },
    {
      title: "Domestic flights",
      body: "Where a domestic flight appears in the itinerary, its schedule, availability and inclusion in the final price must be confirmed with the Kabul office before booking.",
    },
    {
      title: "Permits & access",
      body: "The package includes a letter of invitation and required local permits. Site visits, road journeys and activities remain subject to permissions, local access, weather and operating conditions. Confirm the final route before booking.",
    },
    {
      title: "Accommodation & connectivity",
      body: remote
        ? "Packages are based on 3–4-star hotels. Accommodation in remote areas must be confirmed for each overnight stop; do not assume the same hotel standard throughout. Local SIM and Wi-Fi access depend on coverage and availability."
        : "Packages are based on 3–4-star hotels. Hotel names, room occupancy and availability are confirmed in your quotation. Local SIM and Wi-Fi access depend on coverage and availability.",
    },
  ];
  if (slug.includes("womens"))
    notes.push({
      title: "Women-only journey",
      body: "This women-only journey is planned with female guides and opportunities to meet Afghan women. Community visits and access to individual sites must be confirmed by the Kabul office for the departure; experiences depend on local permission and availability.",
    });
  const pkg = {
    slug,
    title: title || p[0],
    destination: route.join(" · "),
    country: "Afghanistan",
    region: "International",
    days,
    nights: days - 1,
    styles: remote ? ["Adventure", "Cultural", "Mountain"] : ["Cultural", "Historical", "Nature"],
    priceStatus: "from",
    priceFrom: price,
    currency: "USD",
    maxGroupSize: maxGroup,
    image: photo(images[0]),
    intro: introParagraphs[0]?.replace("TourismExperience", "Tourism. Experience") || overview,
    story: overview,
    highlights,
    itinerary,
    inclusions,
    exclusions,
    route,
    isNew: true,
    seasonal: "Spring / Summer",
  };
  packages.push(pkg);
  details[slug] = {
    overview,
    gallery: images.map(photo),
    dayBlocks: [],
    accommodation: {
      category: "3–4-star hotels, subject to confirmation",
      roomType: "Room type and occupancy confirmed in your quotation",
      mealPlan: "Three daily meals and drinking water; see daily itinerary",
      note: notes[4].body,
    },
    transportation: [
      "Private 4WD vehicle",
      "Airport transfers as described in the itinerary",
      "Domestic flights where listed: schedule and cost to be confirmed",
    ],
    importantInfo: notes,
    faqs: [
      { q: "When does this tour operate?", a: notes[0].body },
      {
        q: "What does the advertised price include?",
        a: `${inclusions.join(". ")}. Final arrangements are confirmed in your written quotation.`,
      },
      {
        q: "Are international and domestic flights included?",
        a: "International flights are excluded. Any domestic flight shown in the itinerary must be confirmed separately for availability and inclusion in your final quotation.",
      },
      {
        q: "Are visa fees included?",
        a: "Visa fees are excluded. The package includes a letter of invitation and required local permits; confirm application requirements with the team before booking.",
      },
      {
        q: "Can the itinerary be customised?",
        a: "Contact our team with your dates, interests and preferred pace. The Kabul office will confirm a tailored route, permissions, accommodation and price.",
      },
    ],
  };
}
packages.sort((a, b) => a.days - b.days || a.priceFrom - b.priceFrom);
writeFileSync(
  "src/data/afghanistan-packages.ts",
  `// Imported from the Kabul office tour documents, 8 October 2026.\nimport type { HolidayPackage } from './catalogue-meta';\nexport const afghanistanPackages: HolidayPackage[] = ${JSON.stringify(packages, null, 2)};\n`,
);
writeFileSync(
  "src/data/afghanistan-details.ts",
  `// Full itineraries retain source wording; operational clarifications are labelled.\nimport type { PackageDetail } from './package-detail-types';\nexport const afghanistanDetails: Record<string, PackageDetail> = ${JSON.stringify(details, null, 2)};\n`,
);
console.log(
  `Imported ${packages.length} packages and ${packages.reduce((n, p) => n + p.itinerary.length, 0)} itinerary days.`,
);
