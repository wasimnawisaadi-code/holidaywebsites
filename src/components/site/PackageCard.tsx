import { Link } from "@tanstack/react-router";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { priceParts, type HolidayPackage } from "@/data/catalogue";
import { cn } from "@/lib/utils";

export function PackageCard({ pkg, tall }: { pkg: HolidayPackage; tall?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-amber-400">
      <Link
        to="/holidays/$slug"
        params={{ slug: pkg.slug }}
        className={cn(
          "relative block overflow-hidden bg-slate-100",
          tall ? "aspect-[4/3]" : "aspect-[16/10]",
        )}
      >
        <img
          src={pkg.image}
          alt={`${pkg.title}, ${pkg.country} holiday package`}
          decoding="async"
          loading="lazy"
          width={1280}
          height={800}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

        {pkg.isNew && (
          <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 font-sans text-[10px] font-black tracking-wider text-[#00365F] uppercase shadow-md">
            New Package
          </span>
        )}
        {pkg.seasonal && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[10px] font-bold text-amber-300 backdrop-blur-md">
            {pkg.seasonal}
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-200">
            <Clock className="size-3.5 text-amber-400" />
            {pkg.days} Days / {pkg.nights} Nights
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <MapPin className="size-3.5" />
            {pkg.country}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold text-[#00365F] leading-snug group-hover:text-[#CAA42D] transition-colors">
          <Link to="/holidays/$slug" params={{ slug: pkg.slug }} className="line-clamp-2">
            {pkg.title}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-slate-500 truncate">{pkg.destination}</p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block font-sans text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
              {priceParts(pkg).eyebrow}
            </span>
            <span className="font-display text-xl font-black text-[#00365F]">
              {priceParts(pkg).amount}
            </span>
          </div>

          <Link
            to="/holidays/$slug"
            params={{ slug: pkg.slug }}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#00365F] px-3.5 py-2 font-sans text-xs font-bold text-white shadow-sm transition-all hover:bg-[#CAA42D] hover:text-[#00365F]"
          >
            <span>Itinerary</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
