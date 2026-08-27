import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, ShieldCheck, Award, Building2 } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";
import { clamp, prefersReducedMotion } from "@/lib/scroll";

/**
 * Landing hero.
 *
 * Light-first by house rule: cream stock, navy ink, gold as the accent. The only
 * depth is a slow layered parallax on the imagery as you scroll off the hero —
 * three plates moving at different rates, which reads as real depth without the
 * cost of a WebGL context above the fold.
 */

export type HeroPlate = { image: string; label: string; place: string };

export function JourneyHero({ plates }: { plates: HeroPlate[] }) {
  const [y, setY] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setY(clamp(window.scrollY / Math.max(window.innerHeight, 1)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const [a, b, c] = plates;

  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] pt-32 pb-20 sm:pt-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
        {/* Copy */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#CAA42D]" />
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#8F7420]">
              Dubai · Kabul · Jeddah — since {BRAND.founded}
            </p>
          </div>

          <h1 className="mt-5 font-display text-[2.6rem] leading-[1.03] text-[#00365F] sm:text-6xl lg:text-7xl">
            Travel,
            <br />
            <span className="italic text-[#8F7420]">curated for you.</span>
          </h1>

          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-slate-600 sm:text-lg">
            An IATA-accredited agency in Deira arranging worldwide holiday packages — Switzerland,
            Japan, the Maldives, Georgia, Umrah and more — with flights, hotels, transfers and visa
            handling under one roof.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/holidays"
              className="group inline-flex items-center gap-2 rounded-sm bg-[#00365F] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#00365F]"
            >
              <span>Explore holiday packages</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={waLink(
                "Hi Nawi Saadi, I would like help planning a holiday package. Could you send me some options?",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-[#00365F]/25 px-7 py-4 text-sm font-semibold text-[#00365F] transition-colors hover:bg-[#00365F]/5"
            >
              <MessageCircle className="size-4" />
              <span>Talk to a specialist</span>
            </a>
          </div>

          {/* Real credentials — no invented review counts. */}
          <dl className="mt-11 grid max-w-xl grid-cols-1 gap-x-8 gap-y-5 border-t border-[#E5E5E5] pt-7 sm:grid-cols-3">
            {[
              { icon: Award, k: "IATA accredited", v: "Agency since 2009" },
              { icon: ShieldCheck, k: "DTCM approved", v: "Dubai tourism licence" },
              { icon: Building2, k: "Three offices", v: "UAE · Afghanistan · KSA" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="min-w-0">
                <Icon className="size-5 text-[#CAA42D]" />
                <dt className="mt-2.5 font-sans text-[13px] font-semibold text-[#00365F]">{k}</dt>
                <dd className="mt-0.5 font-sans text-xs text-slate-500">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Layered image plates — the depth move */}
        <div className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[560px]" aria-hidden="true">
          {b ? (
            <Plate
              image={b.image}
              label={b.label}
              place={b.place}
              className="right-0 top-0 z-10 h-[70%] w-[54%]"
              offset={y * -96}
              feature
            />
          ) : null}
          {a ? (
            <Plate
              image={a.image}
              label={a.label}
              place={a.place}
              className="left-0 top-[16%] z-20 h-[52%] w-[46%]"
              offset={y * -40}
            />
          ) : null}
          {c ? (
            <Plate
              image={c.image}
              label={c.label}
              place={c.place}
              className="bottom-0 left-[26%] z-30 h-[40%] w-[48%]"
              offset={y * -16}
            />
          ) : null}
        </div>
      </div>

    </section>
  );
}

function Plate({
  image,
  label,
  place,
  className,
  offset,
  feature = false,
}: {
  image: string;
  label: string;
  place: string;
  className: string;
  offset: number;
  feature?: boolean;
}) {
  return (
    <figure
      className={`absolute overflow-hidden rounded-sm bg-slate-100 shadow-[0_24px_60px_-40px_rgba(0,48,88,0.55)] ${className}`}
      style={{ transform: `translate3d(0, ${offset}px, 0)`, willChange: "transform" }}
    >
      <img src={image} alt="" className="size-full object-cover" loading={feature ? "eager" : "lazy"} />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="font-display text-base text-white">{label}</p>
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-white/75">{place}</p>
      </figcaption>
    </figure>
  );
}
