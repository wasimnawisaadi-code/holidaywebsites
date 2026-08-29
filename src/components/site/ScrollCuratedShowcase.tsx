import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass, Sparkles, MapPin, Clock, MessageCircle, Star } from "lucide-react";
import { packages, waLink, BRAND } from "@/data/catalogue";

const SHOWCASE_SLUGS = [
  "swiss-alpine-dream",
  "japan-golden-route",
  "maldives-overwater-escape",
  "spain-barcelona-madrid-andalusia",
  "georgia-mountain-weekender",
  "kenya-safari-luxury",
  "salalah-khareef-monsoon",
  "bali-jungle-coast",
];

const SHOWCASE_DATA = [
  {
    slug: "swiss-alpine-dream",
    tagline: "Glacier Express & Jungfraujoch Peak",
    coords: "46.8182° N, 8.2275° E",
    vibe: "Alpine Luxury",
    bestSeason: "Year-Round",
  },
  {
    slug: "japan-golden-route",
    tagline: "Shinkansen Bullet Train & Kyoto Shrines",
    coords: "35.6762° N, 139.6503° E",
    vibe: "Imperial & Modern",
    bestSeason: "Mar – May / Oct – Nov",
  },
  {
    slug: "maldives-overwater-escape",
    tagline: "Lagoon Seaplane & Overwater Villa",
    coords: "3.2028° N, 73.2207° E",
    vibe: "Private Island Paradise",
    bestSeason: "Nov – Apr",
  },
  {
    slug: "spain-barcelona-madrid-andalusia",
    tagline: "Sagrada Família & Flamenco Nights",
    coords: "41.3879° N, 2.1699° E",
    vibe: "Gothic & Mediterranean",
    bestSeason: "Apr – Jun / Sep – Nov",
  },
  {
    slug: "georgia-mountain-weekender",
    tagline: "Caucasus Mountains & Ancient Old Town",
    coords: "41.7151° N, 44.8271° E",
    vibe: "Caucasian Highlands",
    bestSeason: "May – Oct",
  },
  {
    slug: "kenya-safari-luxury",
    tagline: "Big-Five Game Drives & Luxury Tents",
    coords: "1.2921° S, 36.8219° E",
    vibe: "Wild African Savannah",
    bestSeason: "Jul – Oct",
  },
  {
    slug: "salalah-khareef-monsoon",
    tagline: "Misty Waterfalls & Emerald Valleys",
    coords: "17.0151° N, 54.0924° E",
    vibe: "Monsoon Oasis",
    bestSeason: "Jul – Sep",
  },
  {
    slug: "bali-jungle-coast",
    tagline: "Ubud Rice Terraces & Uluwatu Cliffs",
    coords: "8.3405° S, 115.0920° E",
    vibe: "Spiritual Island",
    bestSeason: "Apr – Oct",
  },
];

export function ScrollCuratedShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items = SHOWCASE_DATA.map((item) => {
    const pkg = packages.find((p) => p.slug === item.slug);
    return { ...item, pkg };
  }).filter((i) => i.pkg !== undefined);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    }
  };

  const scrollByAmount = (amount: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#001D36] py-24 sm:py-32 text-white">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#CAA42D]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-[#00558F]/20 blur-[140px]" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#CAA42D] backdrop-blur-md">
              <Compass className="size-3.5" />
              <span>Cinematic Experience Reel</span>
            </div>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.6rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              Journeys Crafted for <span className="italic text-[#CAA42D]">The Discerning</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Swipe or glide through our most requested worldwide escapes — complete with private DXB flights, luxury hotels, chauffeured transfers, and fast-track visas.
            </p>
          </div>

          {/* Navigation buttons & progress */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Explore Reel
              </span>
              <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#CAA42D] transition-all duration-300"
                  style={{ width: `${Math.max(12, scrollProgress)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByAmount(-420)}
                disabled={!canScrollLeft}
                aria-label="Scroll reel left"
                className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/25 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(420)}
                disabled={!canScrollRight}
                aria-label="Scroll reel right"
                className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-[#CAA42D] text-[#00243f] font-bold transition-all hover:bg-[#DDBE5E] disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-lg"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Animated Scroll Track */}
        <div
          ref={containerRef}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map(({ slug, tagline, coords, vibe, bestSeason, pkg }, index) => {
            if (!pkg) return null;
            const enquiryLink = waLink(
              `Hi ${BRAND.short}, I am interested in the ${pkg.title} (${pkg.days}D/${pkg.nights}N, ${pkg.country}). Please share custom pricing, dates, and flight itinerary from Dubai.`,
            );

            return (
              <div
                key={slug}
                className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#CAA42D]/80 hover:bg-white/10 hover:shadow-2xl sm:w-[380px]"
              >
                {/* Photo Aspect */}
                <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-slate-800">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                  {/* Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="rounded-full bg-[#00365F]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {pkg.country}
                    </span>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                      {coords}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#CAA42D]">
                        {vibe}
                      </span>
                      <p className="font-sans text-xs font-semibold text-white/90">
                        Season: {bestSeason}
                      </p>
                    </div>
                    {pkg.priceFrom ? (
                      <span className="rounded-full bg-[#CAA42D] px-3 py-1 text-xs font-extrabold text-[#00243f] shadow-md">
                        From AED {pkg.priceFrom.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 px-1 pb-2">
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#CAA42D]">
                      <Clock className="size-3.5" />
                      {pkg.days} Days / {pkg.nights} Nights
                    </span>
                    <span>•</span>
                    <span className="line-clamp-1">{tagline}</span>
                  </div>

                  <h3 className="mt-2.5 line-clamp-2 font-display text-xl font-bold leading-snug text-white transition-colors group-hover:text-[#CAA42D]">
                    {pkg.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
                    {pkg.intro}
                  </p>

                  {/* Actions */}
                  <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4">
                    <Link
                      to="/holidays/$slug"
                      params={{ slug: pkg.slug }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-[#00243f] transition-all hover:bg-[#CAA42D] hover:text-[#00243f]"
                    >
                      <span>Explore Journey</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <a
                      href={enquiryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask about ${pkg.title} on WhatsApp`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:border-[#CAA42D] hover:bg-[#CAA42D] hover:text-[#00243f]"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
