import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";

const REGIONS = [
  {
    name: "Europe",
    tagline: "Alps, Mediterranean coast & imperial capitals",
    count: "15 Destinations",
    fromPrice: "3,890",
    image: "/images/destinations/hero-switzerland.jpg",
    slugs: ["switzerland", "france", "italy", "spain", "germany", "netherlands", "greece", "austria"],
  },
  {
    name: "Asia & Far East",
    tagline: "Cherry blossoms, tropical islands & ancient temples",
    count: "12 Destinations",
    fromPrice: "2,490",
    image: "/images/destinations/hero-japan.jpg",
    slugs: ["japan", "indonesia", "maldives", "thailand", "singapore", "malaysia", "vietnam", "south-korea"],
  },
  {
    name: "Eurasia & Caucasus",
    tagline: "Silk Road cities, cave towns & mountain valleys",
    count: "7 Destinations",
    fromPrice: "1,899",
    image: "/images/destinations/georgia-tbilisi.jpg",
    slugs: ["georgia", "azerbaijan", "armenia", "kazakhstan", "uzbekistan", "turkey"],
  },
  {
    name: "Middle East & GCC",
    tagline: "Khareef mist, spiritual Umrah & futuristic skylines",
    count: "4 Destinations",
    fromPrice: "1,490",
    image: "/images/destinations/oman-salalah.jpg",
    slugs: ["oman", "saudi-arabia", "qatar", "bahrain"],
  },
  {
    name: "Africa & Safari",
    tagline: "Big-5 game drives, coral atolls & pyramid wonders",
    count: "6 Destinations",
    fromPrice: "4,790",
    image: "/images/destinations/kenya-01.jpg",
    slugs: ["kenya", "tanzania", "south-africa", "mauritius", "seychelles", "egypt", "morocco"],
  },
];

export function RegionalExplorer() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CAA42D]">
              <Compass className="size-4" />
              <span>Worldwide Directory</span>
            </div>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.08] tracking-tight text-[#00365F]">
              Explore by <span className="italic text-[#8F7420]">Global Region</span>
            </h2>
          </div>
          <Link
            to="/countries"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-[#00365F] transition-colors hover:border-[#00365F] hover:bg-slate-50 shadow-xs"
          >
            <span>View All 50 Countries</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {REGIONS.map((r) => (
            <Link
              key={r.name}
              to="/countries"
              className="group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={r.image}
                alt={r.name}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00243f] via-[#00243f]/40 to-black/20 transition-opacity group-hover:from-[#00243f]/95" />

              <div className="relative z-10">
                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {r.count}
                </span>
              </div>

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-[#CAA42D]">
                  From AED {r.fromPrice}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-white">
                  {r.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-200">
                  {r.tagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#CAA42D] group-hover:underline">
                  <span>Browse countries</span>
                  <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
