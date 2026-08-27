import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import heroDubai from "@/assets/hero-dubai.jpg";
import { inboundActivities } from "@/data/inbound";
import { ActivityBrowser } from "@/components/site/ActivityBrowser";
import { Depth } from "@/components/site/Parallax";
import { GoldParticleField } from "@/components/3d/GoldParticleField";
import { ThreeDCard } from "@/components/3d/ThreeDCard";

const pool = inboundActivities.filter((e) => e.emirate === "Dubai" || e.emirate === "Hatta");

export const Route = createFileRoute("/dubai")({
  head: () => ({
    meta: [
      { title: "Dubai Tours, Tickets & Things To Do — from AED 24 | Nawi Saadi" },
      {
        name: "description",
        content:
          "Book Dubai attractions, desert safaris, theme parks, cruises and combo deals with instant WhatsApp confirmation. Dubai experiences from AED 24 per person.",
      },
      {
        property: "og:title",
        content: "Dubai Tours, Tickets & Things To Do | Nawi Saadi Holidays",
      },
      {
        property: "og:description",
        content:
          "Everything to do in Dubai — attractions, desert nights, parks, cruises and combo savers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DubaiPage,
});

function DubaiPage() {
  const cheapest = pool.filter((e) => typeof e.fromPrice === "number" && e.fromPrice < 100).length;

  return (
    <div className="pb-24">
      <header className="on-dark relative h-[65vh] min-h-[440px] overflow-hidden [perspective:1000px]">
        <img
          src={heroDubai}
          alt="Dubai skyline at night"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="kenburns absolute inset-0 size-full object-cover"
        />
        <div className="night-fade absolute inset-0" />
        <GoldParticleField count={45} className="z-10 opacity-75" />

        <div className="relative z-20 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-12 sm:px-8">
          <Depth speed={30}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/50 px-3.5 py-1 text-xs font-semibold tracking-wider text-accent uppercase backdrop-blur-md">
              <Sparkles className="size-3 text-accent" /> Dubai Inbound & Local Attractions
            </div>
            <h1 className="text-display mt-4 max-w-3xl text-5xl sm:text-7xl font-bold">
              Things to do in <span className="gold-text">Dubai</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-foreground/80">
              {pool.length} verified tours, tickets and experiences across Dubai, the red dunes and
              Hatta — {cheapest} under AED 100 with instant WhatsApp voucher confirmation.
            </p>
          </Depth>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="flex flex-wrap gap-3">
            <Link
              to="/deals"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              Deals under AED 100
            </Link>
            <Link
              to="/uae"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/50 px-5 py-2.5 text-sm text-foreground/90 transition-colors hover:border-primary hover:text-accent backdrop-blur-sm"
            >
              Beyond Dubai <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-accent" /> DTCM Official Rates
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="size-4 text-accent" /> 100% Authentic Photos
            </span>
          </div>
        </div>

        <ActivityBrowser
          pool={pool}
          placeholder="Search desert safari, Burj Khalifa, dhow cruise, yacht charter…"
        />
      </section>
    </div>
  );
}
