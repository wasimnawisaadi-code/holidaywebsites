const fs = require("fs");
const f = "src/routes/index.tsx";
let t = fs.readFileSync(f, "utf8");

t = t.replace(
  'import { JourneyHero, type HeroPlate } from "@/components/site/JourneyHero";\nimport { HolidayArc, type ArcCard } from "@/components/3d/HolidayArc";',
  'import { CinematicHero, type HeroClip } from "@/components/site/CinematicHero";\nimport { PackageFilm, type FilmSlide } from "@/components/site/PackageFilm";'
);

// Swap the Hero implementation.
const oldHero = t.match(/function Hero\(\) \{[\s\S]*?\n\}\n/);
if (oldHero) {
  t = t.replace(oldHero[0], `function Hero() {
  const clips: HeroClip[] = [
    { src: "/videos/world-hero.mp4", poster: "/images/destinations/hero-switzerland.jpg", place: "Worldwide" },
    { src: "/videos/dubai-hero.mp4", poster: "/images/dst/view-at-the-top-burj-khalifa-at-the-top-1.webp", place: "Dubai" },
    { src: "/videos/travel-hero.mp4", poster: "/images/destinations/hero-maldives.jpg", place: "Escapes" },
  ];
  return <CinematicHero clips={clips} />;
}
`);
}

// Swap FeaturedArc -> FeaturedFilm.
const oldArc = t.match(/function FeaturedArc\(\) \{[\s\S]*?\n\}\n/);
if (oldArc) {
  t = t.replace(oldArc[0], `function FeaturedFilm() {
  const slides = useMemo<FilmSlide[]>(
    () =>
      packages.map((p) => ({
        slug: p.slug,
        country: p.country,
        title: p.title,
        nights: \`\${p.nights} nights\`,
        price: priceLabel(p),
        image: p.image,
        blurb: p.intro,
      })),
    [],
  );

  return <PackageFilm slides={slides} />;
}
`);
}
t = t.replace("<FeaturedArc />", "<FeaturedFilm />");

fs.writeFileSync(f, t);
console.log("rewired");
console.log("HolidayArc refs left: " + (t.match(/HolidayArc|ArcCard|JourneyHero|HeroPlate/g) || []).length);
