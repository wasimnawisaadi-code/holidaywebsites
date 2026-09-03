import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Compass, MapPin, Sparkles } from "lucide-react";
import marina from "@/assets/dubai-marina.webp";
import marinaSm from "@/assets/dubai-marina-sm.webp";
import { emirates } from "@/data/catalogue-meta";
import { activitiesLite as inboundActivities } from "@/data/generated/activities-lite";
import { ActivityBrowser } from "@/components/site/ActivityBrowser";
import { Depth } from "@/components/site/Parallax";
import { GoldParticleField } from "@/components/3d/GoldParticleField";
import { ThreeDCard } from "@/components/3d/ThreeDCard";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";

const beyond = emirates.filter((e) => e.name !== "Dubai" && e.name !== "Hatta");
const pool = inboundActivities.filter((e) => e.emirate !== "Dubai" && e.emirate !== "Hatta");

export const Route = createFileRoute("/uae")({
  head: () => ({
    meta: [
      { title: "UAE Tours Beyond Dubai | Nawi Saadi Holidays" },
      {
        name: "description",
        content:
          "Discover the Emirates beyond Dubai: Abu Dhabi icons, Sharjah culture, Ras Al Khaimah adventure, Fujairah beaches and Al Ain day trips, booked on WhatsApp.",
      },
      { property: "og:title", content: "UAE Tours Beyond Dubai | Nawi Saadi Holidays" },
      {
        property: "og:description",
        content: "Emirate by emirate: what to see, what to book and what it costs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/uae") }],
  }),
  component: UaePage,
});

function UaePage() {
  const [active, setActive] = useState(beyond[0]?.name ?? "Abu Dhabi");
  const current = emirates.find((e) => e.name === active);
  const count = inboundActivities.filter((e) => e.emirate === active).length;

  return (
    <div className="pb-24">
      <header className="on-dark relative h-[60vh] min-h-[420px] overflow-hidden">
        <img
          src={marina}
          alt="The UAE coastline at dusk"
          width={1600}
          height={1000}
          loading="eager"
          fetchPriority="high"
          // Bundled imports, so tileImage cannot help: it only knows the
          // /images/destinations paths. Both sizes are imported and the
          // srcset built by hand. 55vw is 430 device pixels on a DPR-2
          // phone, which lands on the 720px file: 37KB instead of 201KB
          // for a backdrop sitting behind a scrim.
          srcSet={`${marinaSm} 720w, ${marina} 1600w`}
          sizes="(max-width: 768px) 55vw, 100vw"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="night-fade absolute inset-0" />
        <GoldParticleField particleCount={40} className="z-10 opacity-70" />

        <div className="relative z-20 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-12 sm:px-8">
          <Depth speed={26}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/50 px-3.5 py-1 text-xs font-semibold tracking-wider text-accent uppercase backdrop-blur-md">
              <Sparkles className="size-3 text-accent" /> Seven Emirates Discovery
            </div>
            <h1 className="text-display mt-3 max-w-3xl text-5xl sm:text-7xl font-bold">
              Beyond <span className="gold-text">Dubai</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-foreground/80">
              Six unique emirates, one vibrant country, and seamless chauffeured day trips between
              them.
            </p>
          </Depth>
        </div>
      </header>

      <section className="mx-auto mt-14 grid max-w-[1400px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <p className="eyebrow">Pick an emirate</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {beyond.map((e) => (
              <button
                key={e.name}
                type="button"
                onClick={() => setActive(e.name)}
                aria-pressed={active === e.name}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300",
                  active === e.name
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "border-border bg-surface/40 text-foreground/80 hover:border-primary/60 hover:text-foreground",
                )}
              >
                {e.name}
              </button>
            ))}
          </div>
          <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
            {current?.blurb}
          </p>
        </div>

        <ThreeDCard className="w-full">
          <div className="rounded-3xl border border-primary/25 bg-gradient-to-b from-surface to-surface/80 p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-accent">
                <MapPin className="size-5" />
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-accent">
                Explore Destination
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-bold">{active}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{current?.blurb}</p>
            <p className="mt-6 text-base font-semibold text-accent">
              {count > 0 ? `${count} experiences available` : "Custom chauffeured tours on request"}
            </p>
            <Link
              to="/plan"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5 text-sm font-medium text-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Plan a bespoke day trip <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </ThreeDCard>
      </section>

      <section className="mx-auto mt-16 max-w-[1400px] px-5 sm:px-8">
        <ActivityBrowser
          pool={pool}
          filterEmirate={active}
          placeholder={`Search activities in ${active}…`}
        />
      </section>
    </div>
  );
}
