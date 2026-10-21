import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Search, MessageCircle } from "lucide-react";
import { packagesLite } from "@/data/generated/packages-lite";
import { afghanistanImageCredits } from "@/data/afghanistan-image-credits";
import { waLink } from "@/data/catalogue-brand";
import { PackageCard } from "@/components/site/PackageCard";
import { absoluteUrl } from "@/lib/site";

const tours = packagesLite.filter((p) => p.country === "Afghanistan");
const description =
  "Explore 14 Afghanistan tour packages with Nawi Saadi’s Kabul team: Kabul, Bamyan, Band-e-Amir, Herat, Nuristan and Wakhan. 3–15 days, from USD 499 per person.";
export const Route = createFileRoute("/afghanistan")({
  head: () => ({
    meta: [
      { title: "Afghanistan Tour Packages | Nawi Saadi Travel & Tourism" },
      { name: "description", content: description },
      { property: "og:title", content: "Afghanistan Tours | Nawi Saadi" },
      { property: "og:description", content: description },
      { property: "og:image", content: absoluteUrl("/images/afghanistan/band-e-amir.webp") },
      { property: "og:url", content: absoluteUrl("/afghanistan") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/afghanistan") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Afghanistan tour packages",
          numberOfItems: tours.length,
          itemListElement: tours.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: absoluteUrl(`/holidays/${p.slug}`),
          })),
        }),
      },
    ],
  }),
  component: AfghanistanPage,
});

const places = [
  {
    title: "Bamyan & Band-e-Amir",
    image: "band-e-amir",
    text: "Ancient Buddha niches, highland valleys and deep-blue lakes.",
    query: "Bamyan",
  },
  {
    title: "Herat & the Silk Road",
    image: "herat-friday-mosque",
    text: "Tiled courtyards, historic bazaars and Timurid architecture.",
    query: "Herat",
  },
  {
    title: "Nuristan & Wakhan",
    image: "wakhan-mountains",
    text: "Remote valleys, mountain communities and overland journeys.",
    query: "Adventure",
  },
];

function AfghanistanPage() {
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState("all");
  const results = useMemo(
    () =>
      tours.filter((p) => {
        const match = `${p.title} ${p.destination} ${p.styles.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase().trim());
        return (
          match &&
          (duration === "all" ||
            (duration === "short"
              ? p.days <= 7
              : duration === "classic"
                ? p.days >= 8 && p.days <= 12
                : p.days >= 14))
        );
      }),
    [query, duration],
  );
  return (
    <main className="bg-[#FAF9F6] text-[#00365F]">
      <section className="relative isolate overflow-hidden bg-[#00365F] pt-36 pb-20 text-white sm:pt-44 sm:pb-28">
        <img
          src="/images/afghanistan/band-e-amir.webp"
          alt="The deep-blue lakes of Band-e-Amir, Afghanistan"
          width={1600}
          height={1200}
          fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#001b30]/90 via-[#001b30]/65 to-[#001b30]/20" />
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="mb-9 flex gap-2 text-xs text-white/80">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span>Afghanistan Tours</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E8CF80]">
            Nawi Saadi · Afghanistan collection
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] text-white sm:text-7xl">
            Afghanistan.
            <br />
            <span className="italic text-[#E8CF80]">Extraordinary journeys.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Follow the Silk Road through historic cities, discover the blue lakes of Bamyan, or
            journey into the mountains of Nuristan and Wakhan. Planned and operated by our Kabul
            office.
          </p>
          <a
            href="#tour-collection"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#DDBE5E] px-6 py-4 text-sm font-bold text-[#00365F] hover:bg-[#ecd38c]"
          >
            Find your Afghanistan tour <ArrowRight className="size-4" />
          </a>
          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/25 pt-7">
            {[
              ["14", "Tour packages"],
              ["3–15", "Days of discovery"],
              ["8", "Maximum group size"],
              ["USD 499", "Starting price / person"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-xs text-white/75">{label}</dt>
                <dd className="mt-1 font-display text-2xl text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A641B]">
              Culture · Heritage · Adventure
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Many landscapes. Your own journey.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Spring and summer itineraries, local guides and private transport. Choose a short
            cultural introduction or a longer journey through Afghanistan’s regions.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {places.map((place) => (
            <a
              key={place.title}
              href="#tour-collection"
              onClick={() => {
                setQuery(place.query);
                setDuration("all");
              }}
              className="group relative min-h-72 overflow-hidden rounded-2xl bg-[#00365F]"
            >
              <img
                src={`/images/afghanistan/${place.image}.webp`}
                alt={place.title}
                width={800}
                height={600}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <div className="relative flex min-h-72 flex-col justify-end p-6 text-white">
                <h3 className="font-display text-2xl">{place.title}</h3>
                <p className="mt-2 text-sm text-white/85">{place.text}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section
        id="tour-collection"
        className="scroll-mt-28 border-y border-slate-200 bg-white py-16"
      >
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A641B]">
            The complete collection
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Afghanistan tour packages</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
            Starting prices are in US dollars per person. International flights, visa fees,
            insurance and personal expenses are excluded. Our team confirms your final price, route
            and availability before booking.
          </p>
          <div className="my-8 flex flex-col gap-4 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search Afghanistan tours</span>
              <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Kabul, Herat, women, adventure…"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pr-4 pl-12 text-sm focus:outline-2 focus:outline-[#CAA42D]"
              />
            </label>
            <label>
              <span className="sr-only">Tour duration</span>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm sm:w-56"
              >
                <option value="all">All durations</option>
                <option value="short">3–7 days</option>
                <option value="classic">8–12 days</option>
                <option value="long">14–15 days</option>
              </select>
            </label>
          </div>
          <p aria-live="polite" className="mb-5 text-sm text-slate-500">
            {results.length} {results.length === 1 ? "journey" : "journeys"} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((pkg) => (
              <PackageCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
          {!results.length && (
            <div className="rounded-2xl bg-slate-50 p-10 text-center">
              <p>No tours match these filters.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setDuration("all");
                }}
                className="mt-4 font-bold underline"
              >
                Show all 14 tours
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A641B]">
            Local knowledge, personal planning
          </p>
          <h2 className="mt-3 font-display text-3xl">Plan with our Kabul team</h2>
          <p className="mt-5 leading-relaxed text-slate-600">
            Tell us your travel dates, group size and interests. We’ll help you choose an itinerary
            and confirm accommodation, permits, local access and any domestic flights.
          </p>
          <a
            href={waLink(
              "Hi Nawi Saadi, I’m interested in your Afghanistan tours. Please connect me with the team to discuss dates, route availability and a quotation.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-6 py-4 text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" /> Enquire about Afghanistan
          </a>
        </div>
        <div className="rounded-3xl border border-[#dfd6be] bg-[#F5F2EA] p-7 sm:p-9">
          <MapPin className="size-6 text-[#7A641B]" />
          <h3 className="mt-4 font-display text-2xl">Before you book</h3>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
            <li>
              Routes and individual visits depend on local permissions, access, weather and
              operating conditions.
            </li>
            <li>Domestic flight schedules and costs must be confirmed in your quotation.</li>
            <li>
              For Nuristan, Wakhan and remote overland routes, confirm accommodation at every
              overnight stop.
            </li>
            <li>
              The women-only journey is planned with female guides; specific visits and access are
              confirmed for each departure.
            </li>
          </ul>
        </div>
      </section>
      {/* Kept small but kept: the CC BY and CC BY-SA licences on these photos
          require naming the photographer and licence. Public-domain and CC0
          photos need no credit and are left out. */}
      <div
        id="photo-credits"
        className="mx-auto max-w-[1400px] scroll-mt-28 px-5 pb-8 text-[10px] leading-relaxed text-slate-400 sm:px-8"
      >
        <details>
          <summary className="cursor-pointer">Photo credits</summary>
          <ul className="mt-2 space-y-1">
            {afghanistanImageCredits
              .filter((c) => c.license.startsWith("CC BY"))
              .map((c) => (
                <li key={c.image}>
                  <a
                    className="underline"
                    href={c.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.author}
                  </a>{" "}
                  ·{" "}
                  <a
                    className="underline"
                    href={c.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.license}
                  </a>{" "}
                  · resized and cropped
                </li>
              ))}
          </ul>
        </details>
      </div>
    </main>
  );
}
