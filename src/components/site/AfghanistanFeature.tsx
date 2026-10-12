import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function AfghanistanFeature() {
  return (
    <section className="bg-[#F5F2EA] py-16 sm:py-24" aria-labelledby="afghanistan-feature-title">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Link to="/afghanistan" className="group relative block overflow-hidden rounded-3xl">
          <img
            src="/images/afghanistan/band-e-amir.webp"
            alt="Blue lakes and limestone cliffs at Band-e-Amir in Afghanistan"
            width={1600}
            height={1200}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#00365F]">
            Band-e-Amir · Afghanistan
          </span>
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A641B]">
            New · Operated by our Kabul office
          </p>
          <h2
            id="afghanistan-feature-title"
            className="mt-5 font-display text-4xl leading-tight text-[#00365F] sm:text-5xl"
          >
            Afghanistan,
            <br />
            <span className="italic">a journey into its heart.</span>
          </h2>
          <p className="mt-6 max-w-xl leading-relaxed text-slate-600">
            Historic cities, Silk Road heritage and mountain landscapes. Discover 14 journeys, from
            a three-day introduction to Kabul to the remote Wakhan Corridor and a dedicated
            women-only tour.
          </p>
          <p className="mt-5 text-sm font-semibold text-[#00365F]">
            3–15 days · Groups of up to 8 · From USD 499 per person
          </p>
          <Link
            to="/afghanistan"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#00365F] px-6 py-4 text-sm font-bold text-white hover:bg-[#174e74]"
          >
            Explore Afghanistan Tours <ArrowRight className="size-4" />
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            Departure dates, route access and final arrangements confirmed on enquiry.
          </p>
        </div>
      </div>
    </section>
  );
}
