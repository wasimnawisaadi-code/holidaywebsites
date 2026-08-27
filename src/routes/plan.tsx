import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { packages, experiences, travelStyles, type TravelStyle } from "@/data/catalogue";
import { PageHero } from "@/components/site/PageHero";
import { PackageCard } from "@/components/site/PackageCard";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan My Trip — Custom Holiday Planning | Nawi Saadi Holidays" },
      {
        name: "description",
        content:
          "Tell us where, when, who's travelling and how you like to travel. We match you with holiday packages and UAE experiences, then tailor the rest.",
      },
      { property: "og:title", content: "Plan My Trip | Nawi Saadi Holidays" },
      {
        property: "og:description",
        content:
          "Interactive trip planner for Dubai holidays, UAE getaways and international journeys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/plan") }],
  }),
  component: PlanPage,
});

const regions = ["Dubai & UAE", "International", "Not sure yet"] as const;

function PlanPage() {
  const [region, setRegion] = useState<(typeof regions)[number]>("International");
  const [style, setStyle] = useState<TravelStyle>("Family");
  const [travellers, setTravellers] = useState(2);
  const [nights, setNights] = useState(5);

  const suggestedPackages = useMemo(() => {
    const pool = packages.filter((p) => {
      if (region === "Dubai & UAE") return p.region === "UAE";
      if (region === "International") return p.region === "International";
      return true;
    });
    const byStyle = pool.filter((p) => p.styles.includes(style));
    const base = (byStyle.length ? byStyle : pool).slice();
    base.sort((a, b) => Math.abs(a.nights - nights) - Math.abs(b.nights - nights));
    return base.slice(0, 3);
  }, [region, style, nights]);

  const suggestedExperiences = useMemo(
    () =>
      experiences
        .filter((e) => e.audience.includes(travellers > 3 ? "Families" : "Couples"))
        .slice(0, 4),
    [travellers],
  );

  return (
    <div className="bg-[#FFFFFF] pb-24 text-[#353844]">
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Trip planner" }]}
        eyebrow="Trip planner"
        title={
          <>
            Build the trip <span className="italic text-[#DDBE5E]">around you</span>
          </>
        }
        intro="Four quick choices and we'll shortlist journeys and experiences. Suggestions are indicative — availability and final pricing are always confirmed by our team before booking."
        image="/images/destinations/georgia-gergeti.jpg"
        imageAlt="Mountain church on a Georgia itinerary"
      />

      <section className="mx-auto mt-12 grid max-w-[1400px] gap-8 px-5 sm:px-8 lg:grid-cols-[420px_1fr]">
        <div className="h-fit border border-[#ded7c9] bg-[#FFFFFF] p-7 lg:sticky lg:top-28">
          <fieldset>
            <legend className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#8b8378] uppercase">Where to</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {regions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={cn(
                    "rounded-sm border px-4 py-2 font-sans text-sm transition-colors",
                    region === r
                      ? "border-[#12293f] bg-[#00365F] text-white"
                      : "border-[#ded7c9] bg-white text-[#4c4741] hover:border-[#c2b9a8]",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#8b8378] uppercase">Travel style</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {travelStyles.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={cn(
                    "rounded-sm border px-3.5 py-1.5 font-sans text-sm transition-colors",
                    style === s
                      ? "border-[#12293f] bg-[#00365F] text-white"
                      : "border-[#ded7c9] bg-white text-[#4c4741] hover:border-[#c2b9a8]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-7 block">
            <span className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#8b8378] uppercase">Travellers — {travellers}</span>
            <input
              type="range"
              min={1}
              max={8}
              value={travellers}
              onChange={(e) => setTravellers(Number(e.target.value))}
              className="mt-3 w-full accent-[#8F7420]"
            />
          </label>

          <label className="mt-5 block">
            <span className="font-sans text-[10px] font-semibold tracking-[0.16em] text-[#8b8378] uppercase">Nights — {nights}</span>
            <input
              type="range"
              min={2}
              max={12}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="mt-3 w-full accent-[#8F7420]"
            />
          </label>

          <Link
            to="/contact"
            className="mt-8 block rounded-sm bg-[#00365F] px-5 py-3.5 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-[#8F7420]"
          >
            Send this to our team
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-2 font-sans text-sm text-[#8b8378]">
            <Sparkles className="size-4 text-[#8F7420]" aria-hidden />
            Suggested for {travellers} {travellers === 1 ? "traveller" : "travellers"} · {nights}{" "}
            nights · {style}
          </div>

          <h2 className="mt-6 font-display text-3xl font-medium">Recommended journeys</h2>
          <div className="mt-6 grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {suggestedPackages.map((p) => (
              <PackageCard key={p.slug} pkg={p} />
            ))}
          </div>

          <h2 className="mt-14 font-display text-3xl font-medium">Experiences to add</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {suggestedExperiences.map((e) => (
              <li key={e.slug} className="border border-[#e3ded4] bg-white p-5">
                <p className="font-display text-lg font-medium">{e.title}</p>
                <p className="mt-1 font-sans text-sm text-[#8b8378]">
                  {e.emirate} · {e.duration}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
