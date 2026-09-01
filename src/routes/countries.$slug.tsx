import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  MessageCircle,
  Moon,
  Plane,
  ShieldCheck,
  Sparkles,
  Stamp,
} from "lucide-react";
import { countries } from "@/data/countries";
import { BRAND, packages, priceLabel, waLink } from "@/data/catalogue";
import { PackageCard } from "@/components/site/PackageCard";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { metaDescription } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/countries/$slug")({
  loader: ({ params }) => {
    const country = countries.find((c) => c.slug === params.slug);
    if (!country) throw notFound();
    return { country };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Destination not found" }, { name: "robots", content: "noindex" }] };
    }
    const { country } = loaderData;
    const title = `${country.name} Holiday Packages from Dubai | ${BRAND.short}`;
    const description = metaDescription(
      `${country.name} tour packages from Dubai: ${country.tagline}. ${country.nights} itineraries with flights, hotels, transfers and visa assistance by Nawi Saadi Travel & Tourism.`,
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: absoluteUrl(`/countries/${params.slug}`) },
        { property: "og:image", content: absoluteUrl(country.image) },
        { name: "twitter:image", content: absoluteUrl(country.image) },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/countries/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              {
                "@type": "ListItem",
                position: 2,
                name: "Destinations",
                item: absoluteUrl("/countries"),
              },
              { "@type": "ListItem", position: 3, name: country.name },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: country.name,
            description: country.blurb,
            touristType: "Holiday travellers from the UAE",
          }),
        },
      ],
    };
  },
  component: CountryPage,
  notFoundComponent: CountryNotFound,
});

function CountryNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-40 pb-24 text-center">
      <h1 className="text-display text-4xl">Destination not found</h1>
      <Link
        to="/countries"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
      >
        Browse all destinations
      </Link>
    </div>
  );
}

function CountryPage() {
  const { country } = Route.useLoaderData();
  const [shot, setShot] = useState(0);

  const gallery = country.gallery?.length ? country.gallery : [country.image];

  const related = packages.filter(
    (p) =>
      p.country.toLowerCase() === country.name.toLowerCase() ||
      p.destination.toLowerCase().includes(country.name.toLowerCase()) ||
      (country.name === "Indonesia (Bali)" && p.slug === "bali-jungle-coast"),
  );

  const enquiry = waLink(
    `Hi ${BRAND.short}, I'd like to book a tailor-made ${country.name} holiday package . Please share available departure cities, dates, hotel categories, and custom rates.`,
  );

  return (
    <div className="pb-24">
      {/* Editorial Luxury Country Hero */}
      <section className="on-dark relative h-[68vh] min-h-[460px] w-full overflow-hidden bg-[#00365F]">
        <img
          src={country.image}
          alt={`${country.name}: ${country.tagline}`}
          width={1600}
          height={1000}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="size-full scale-105 object-cover brightness-75 transition-transform duration-1000"
        />
        <div className="night-fade absolute inset-0 bg-gradient-to-t from-[#00365F] via-[#00365F]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-5 pb-14 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#CAA42D] backdrop-blur-md">
            <Globe className="size-3.5" />
            <span>{country.region} Region</span>
          </div>
          <h1 className="text-display mt-3 max-w-3xl text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white">
            {country.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">{country.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#00365F]/80 px-4 py-2 text-white backdrop-blur-md">
              <Moon className="size-4 text-[#CAA42D]" aria-hidden /> {country.nights}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#00365F]/80 px-4 py-2 text-white backdrop-blur-md">
              <CalendarDays className="size-4 text-[#CAA42D]" aria-hidden /> Best Season:{" "}
              {country.bestTime}
            </span>
            {country.fromAed ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#CAA42D] px-4 py-2 text-[#00243f] font-bold shadow-md">
                From AED {country.fromAed.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Interactive 4-Photo Destination Gallery */}
      <div className="mx-auto mt-8 max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-3 lg:grid-cols-[2.2fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img
              src={gallery[shot] ?? country.image}
              alt={`${country.name}, view ${shot + 1}`}
              width={1600}
              height={1000}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
              Photo {shot + 1} of {gallery.length}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
            {gallery.slice(0, 4).map((g, i) => (
              <button
                key={`${g}-${i}`}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Show ${country.name} photo ${i + 1}`}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-2xl ring-2 transition-all cursor-pointer bg-slate-100",
                  shot === i
                    ? "ring-[#00365F] shadow-md scale-102"
                    : "ring-transparent hover:ring-[#00365F]/40 opacity-80 hover:opacity-100",
                )}
              >
                <img
                  src={g}
                  alt=""
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  decoding="async"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white backdrop-blur-xs">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Booking Box */}
      <section className="mx-auto mt-14 grid max-w-[1400px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-3xl font-extrabold text-[#00365F] sm:text-4xl">
            About Traveling to {country.name}
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">{country.blurb}</p>

          <h3 className="mt-10 text-2xl font-bold text-[#00365F]">
            Trip Highlights &amp; Must-See Sights
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {country.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm border border-slate-200"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-[#CAA42D]" aria-hidden />
                <span className="font-semibold text-slate-800">{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[#CAA42D]/30 bg-[#CAA42D]/5 p-5">
            <Stamp className="mt-0.5 size-6 shrink-0 text-[#CAA42D]" aria-hidden />
            <div>
              <p className="font-bold text-[#00365F]">Visa Requirements for UAE Residents</p>
              <p className="mt-1 text-sm text-slate-700">{country.visa}</p>
              <p className="mt-1 text-xs text-slate-500">
                * Our Dubai IATA team provides full documentation preparation, translation, and
                appointment assistance.
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Plan This Journey
            </span>
            <p className="text-display mt-2 text-3xl font-extrabold text-[#00365F]">
              {country.fromAed
                ? `From AED ${country.fromAed.toLocaleString()}`
                : "Price on request"}
            </p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Per person, indicative rate. Includes flights from Dubai DXB, verified 4★/5★
              accommodations, private airport transfers, and guided sightseeing.
            </p>
            <a
              href={enquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00365F] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-102 hover:bg-[#00365F]"
            >
              <MessageCircle className="size-4 text-[#CAA42D]" aria-hidden />
              <span>Enquire on WhatsApp</span>
            </a>
            <Link
              to="/customized-tours"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Customize Itinerary Online
            </Link>
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#CAA42D]" /> Planned by our IATA Dubai
                Consultants
              </p>
              <p className="flex items-center gap-2">
                <Plane className="size-4 text-[#CAA42D]" /> Direct DXB flydubai &amp; Emirates
                Connections
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* Linked Holiday Packages Section */}
      {related.length > 0 ? (
        <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#CAA42D]">
              Curated Packages
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-[#00365F] sm:text-4xl">
              {country.name} Itineraries
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <PackageCard pkg={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#00365F] text-[#CAA42D] mb-4">
              <Sparkles className="size-6" />
            </span>
            <h3 className="text-2xl font-extrabold text-[#00365F] sm:text-3xl">
              Bespoke {country.name} Holidays Built Around You
            </h3>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-slate-600 leading-relaxed">
              We design private custom holidays to {country.name} every week. Choose your departure
              date, duration, preferred hotel stars, and private guided excursions — our Dubai team
              handles everything end-to-end.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={enquiry}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00365F] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#00365F]"
              >
                <MessageCircle className="size-4 text-[#CAA42D]" />
                <span>Get Instant WhatsApp Quote</span>
              </a>
              <Link
                to="/customized-tours"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <span>Interactive Trip Planner</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* More regional destinations.
          Cards rather than a row of name pills: a bare country name gives a
          reader nothing to choose on, so each one now carries its photograph,
          typical trip length and entry price — the three things that actually
          decide whether it is worth a click. */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-[#00365F] sm:text-3xl">
            More {country.region} destinations
          </h2>
          <Link
            to="/countries"
            className="group inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#00365F] transition-colors hover:text-[#8F7420]"
          >
            <span>All destinations</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {countries
            .filter((c) => c.region === country.region && c.slug !== country.slug)
            .slice(0, 8)
            .map((c) => (
              <li key={c.slug} className="min-w-0">
                <Link
                  to="/countries/$slug"
                  params={{ slug: c.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CAA42D] hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F8F8F8]">
                    <img
                      src={c.image}
                      alt={c.name}
                      decoding="async"
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-display text-lg leading-snug text-[#00365F] transition-colors group-hover:text-[#8F7420]">
                      {c.name}
                    </p>
                    <p className="mt-1 line-clamp-2 font-sans text-xs leading-relaxed text-[#666666]">
                      {c.tagline}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <span className="font-sans text-xs text-[#666666]">{c.nights}</span>
                      <span className="font-display text-base font-bold text-[#00365F]">
                        {typeof c.fromAed === "number"
                          ? `AED ${c.fromAed.toLocaleString()}`
                          : "On request"}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
