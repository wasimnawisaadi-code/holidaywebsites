import { createFileRoute, Link } from "@tanstack/react-router";
import { countries, countriesByRegion, countryRegions } from "@/data/countries";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { TiltCard } from "@/components/site/Parallax";
import hero from "@/assets/dest-europe.jpg";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/countries/")({
  head: () => ({
    meta: [
      { title: "Holiday Destinations from Dubai — 40+ Countries | Nawi Saadi" },
      {
        name: "description",
        content:
          "Browse holiday packages from Dubai to 40+ countries across Europe, Asia, Africa, Eurasia, Australia and the Americas. Visa help, flights and hotels included.",
      },
      { property: "og:title", content: "Holiday Destinations from Dubai — 40+ Countries" },
      {
        property: "og:description",
        content: "Europe, Asia, Africa, Eurasia and beyond — holiday packages built from Dubai.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/countries") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/countries") }],
  }),
  component: CountriesIndex,
});

function CountriesIndex() {
  return (
    <main>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Destinations" }]}
        eyebrow="Destinations"
        title={
          <>
            Where do you <span className="italic text-[#DDBE5E]">want to go?</span>
          </>
        }
        intro="Forty-plus countries, all planned from Dubai — flights, hotels, visas and transfers arranged in one package."
        image={hero}
        imageAlt="Paris rooftops at sunset"
        stats={[{ value: `${countries.length}+`, label: "Countries" }]}
      />

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        {countryRegions.map((region) => (
          <div key={region} className="mb-14">
            <Reveal>
              <h2 className="text-display text-2xl sm:text-3xl">{region}</h2>
            </Reveal>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {countriesByRegion(region).map((c) => (
                <Reveal key={c.slug}>
                  <TiltCard className="h-full">
                    <Link
                      to="/countries/$slug"
                      params={{ slug: c.slug }}
                      className="group block h-full overflow-hidden rounded-3xl border border-border bg-card"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={c.image}
                          alt={`${c.name} holiday packages from Dubai`}
                          decoding="async"
                          loading="lazy"
                          width={1280}
                          height={853}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {c.isNew ? (
                          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                            New
                          </span>
                        ) : null}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold">{c.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
                        <p className="mt-3 text-sm font-medium text-accent">
                          {c.fromAed
                            ? `From AED ${c.fromAed.toLocaleString()}`
                            : "Price on request"}
                          <span className="text-muted-foreground"> · {c.nights}</span>
                        </p>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
