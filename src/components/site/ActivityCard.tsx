import { Link } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { inboundFrom, type InboundActivity } from "@/data/inbound";
import { waLink, BRAND } from "@/data/catalogue";
import { tileImage } from "@/lib/img";

export function ActivityCard({ a, eager = false }: { a: InboundActivity; eager?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-amber-400">
      <Link
        to="/activities/$slug"
        params={{ slug: a.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
      >
        <img
          src={a.image}
          {...tileImage(a.image, "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 92vw")}
          alt={`${a.title}, ${a.emirate}`}
          loading={eager ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          onError={(e) => {
            // Fall back to a local plate rather than a remote Unsplash URL —
            // the remote one rots silently and fails offline.
            const img = e.currentTarget;
            if (img.dataset["fallback"]) return;
            img.dataset["fallback"] = "1";
            img.src = "/images/dst/dubai-frame-8828bac1-eaa9-4779-92aa-213b78b87a5c.webp";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

        {a.badge ? (
          <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 font-sans text-[10px] font-black tracking-wider text-[#00365F] uppercase shadow-md">
            {a.badge}
          </span>
        ) : (
          <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[10px] font-bold text-amber-300 backdrop-blur-md">
            Official E-Ticket
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-200">
            <Clock className="size-3.5 text-amber-400" />
            {a.duration}
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <MapPin className="size-3.5" />
            {a.emirate}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold text-[#00365F] leading-snug group-hover:text-[#CAA42D] transition-colors">
          <Link to="/activities/$slug" params={{ slug: a.slug }} className="line-clamp-2">
            {a.title}
          </Link>
        </h3>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block font-sans text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
              From
            </span>
            <span className="font-display text-xl font-black text-[#00365F]">{inboundFrom(a)}</span>
          </div>

          <a
            href={waLink(`Hi ${BRAND.short}, I would like to book tickets for ${a.title}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#00365F] px-4 py-2.5 font-sans text-xs font-bold text-white shadow-md transition-all hover:bg-[#CAA42D] hover:text-[#00365F] hover:scale-105"
          >
            <MessageCircle className="size-3.5 text-[#25D366]" />
            <span>Book</span>
          </a>
        </div>
      </div>
    </article>
  );
}
