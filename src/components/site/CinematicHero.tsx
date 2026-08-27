import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";
import { clamp, prefersReducedMotion } from "@/lib/scroll";

/**
 * Full-bleed cinematic hero.
 *
 * One video fills the viewport edge-to-edge; the three clips cross-fade in
 * sequence so the page opens on motion rather than a static plate. Copy sits on
 * the footage behind a bottom-weighted scrim, so the headline stays legible over
 * whichever frame happens to be showing.
 *
 * The previous cream-panel hero read as thin and dated — a big photo pushed to
 * one side of a mostly-empty page. Committing the whole viewport to imagery is
 * what makes it feel like a travel brand rather than a brochure template.
 */

export type HeroClip = { src: string; poster: string; place: string };

export function CinematicHero({ clips }: { clips: HeroClip[] }) {
  const [index, setIndex] = useState(0);
  const [scrolled, setScrolled] = useState(0);
  const frame = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Advance on the clip's own `ended` event rather than a fixed timer, so the
  // cut always lands at the end of the footage regardless of its duration.
  // With a single clip there is nothing to cut to, so it simply loops.
  const single = clips.length === 1;

  useEffect(() => {
    if (!clips.length) return;
    const el = videoRefs.current[index];
    if (!el) return;
    el.currentTime = 0;
    const play = el.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
    if (single) return;
    const next = () => setIndex((i) => (i + 1) % clips.length);
    el.addEventListener("ended", next);
    return () => el.removeEventListener("ended", next);
  }, [index, clips.length, single]);

  // Gentle rise on the copy as the hero scrolls away.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setScrolled(clamp(window.scrollY / Math.max(window.innerHeight, 1)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const current = clips[index];

  return (
    <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-[#04121f]">
      {/* Footage */}
      <div className="absolute inset-0">
        {clips.map((clip, i) => (
          <video
            key={clip.src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={clip.src}
            poster={clip.poster}
            muted
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            aria-hidden="true"
            className={
              "absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-out " +
              (i === index ? "opacity-100" : "opacity-0")
            }
          />
        ))}
        {/* Scrim: dark at the foot where the copy sits, clear at the top so the
            footage is never fully muted. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04121f] via-[#04121f]/45 to-[#04121f]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04121f]/70 via-transparent to-transparent" />
      </div>

      {/* Copy */}
      <div
        className="relative flex h-full flex-col justify-end"
        style={{
          transform: `translate3d(0, ${scrolled * -60}px, 0)`,
          opacity: 1 - scrolled * 0.85,
          willChange: "transform, opacity",
        }}
      >
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-14 sm:px-8 sm:pb-20">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-[#DDBE5E]">
            Dubai · Kabul · Jeddah — since {BRAND.founded}
          </p>

          <h1 className="mt-5 max-w-4xl font-display text-[3rem] leading-[0.98] text-white sm:text-7xl lg:text-[5.5rem]">
            Travel,
            <br />
            <span className="italic text-[#DDBE5E]">curated for you.</span>
          </h1>

          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-white/75 sm:text-lg">
            Worldwide holiday packages arranged end to end from our Deira office — flights, hotels,
            transfers and visas handled by one team.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/holidays"
              className="group inline-flex items-center gap-2 rounded-sm bg-[#CAA42D] px-8 py-4 font-sans text-sm font-semibold text-[#04121f] transition-colors hover:bg-[#DDBE5E]"
            >
              <span>Explore holiday packages</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={waLink("Hi Nawi Saadi, I'd like help planning a holiday package.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-white/35 px-8 py-4 font-sans text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <MessageCircle className="size-4" />
              <span>Talk to a specialist</span>
            </a>
          </div>

          {/* Footer rail: credentials, clip indicator, phone. */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/15 pt-6">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 font-sans text-xs text-white/70">
              <li>IATA accredited agency</li>
              <li className="hidden sm:list-item">flydubai GSA — Afghanistan</li>
              <li>DTCM approved</li>
              <li className="hidden lg:list-item">Offices in three countries</li>
            </ul>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2" aria-hidden="true">
                {clips.map((clip, i) => (
                  <button
                    key={clip.src}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${clip.place}`}
                    className={
                      "h-0.5 transition-all duration-500 " +
                      (i === index ? "w-10 bg-[#CAA42D]" : "w-5 bg-white/35 hover:bg-white/60")
                    }
                  />
                ))}
                {current ? (
                  <span className="ml-2 font-sans text-[11px] uppercase tracking-[0.2em] text-white/60">
                    {current.place}
                  </span>
                ) : null}
              </div>

              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="hidden items-center gap-2 font-sans text-sm font-semibold text-white transition-colors hover:text-[#DDBE5E] sm:flex"
              >
                <Phone className="size-4 text-[#CAA42D]" />
                {BRAND.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
