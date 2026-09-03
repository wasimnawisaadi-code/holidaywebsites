import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Magnet } from "@/components/site/Magnet";
import { BRAND, waLink } from "@/data/catalogue-brand";
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

/**
 * Whether this visitor should be sent 2.5MB of decorative footage at all.
 *
 * The clips are `muted` and `aria-hidden` — they carry no information. The
 * poster is the hero, and on PageSpeed's throttled 4G profile the video was
 * competing with it for bandwidth and pushing LCP past six seconds.
 *
 * Save-Data is an explicit request not to be charged for this. A connection
 * reporting 2g or slow-2g cannot afford it either, and reduced-motion means
 * the visitor asked for less movement, not more.
 */
function wantsVideo(): boolean {
  if (prefersReducedMotion()) return false;
  const c = (
    navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (c?.saveData) return false;
  if (c?.effectiveType === "2g" || c?.effectiveType === "slow-2g") return false;
  return true;
}

/** 854x480 behind a heavy scrim on a phone, 1280x720 on anything larger. */
function sourceFor(src: string): string {
  if (typeof window === "undefined") return src;
  return window.innerWidth < 768 ? src.replace(/\.mp4$/, "-sm.mp4") : src;
}

export function CinematicHero({ clips }: { clips: HeroClip[] }) {
  const [index, setIndex] = useState(0);
  const [scrolled, setScrolled] = useState(0);
  const frame = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /**
   * The video src is empty until this turns on.
   *
   * Nothing about the hero needs the footage to be there at first paint: the
   * poster fills the same box and is what LCP measures. Holding the video back
   * until the page has loaded takes it off the critical path entirely, so the
   * headline and the poster get the whole connection to themselves.
   */
  const [videoSrcs, setVideoSrcs] = useState<string[]>([]);
  useEffect(() => {
    if (!wantsVideo()) return;
    const start = () => setVideoSrcs(clips.map((c) => sourceFor(c.src)));
    // `load` has already fired if we mounted late; requestIdleCallback then
    // waits for the main thread to be free rather than adding to the jam.
    const idle = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    const kick = () => (idle ? idle(start, { timeout: 2500 }) : window.setTimeout(start, 900));
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });
    return () => window.removeEventListener("load", kick);
  }, [clips]);

  // Advance on the clip's own `ended` event rather than a fixed timer, so the
  // cut always lands at the end of the footage regardless of its duration.
  // With a single clip there is nothing to cut to, so it simply loops.
  const single = clips.length === 1;

  useEffect(() => {
    if (!clips.length || !videoSrcs.length) return;
    const el = videoRefs.current[index];
    if (!el) return;
    el.currentTime = 0;
    const play = el.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
    if (single) return;
    const next = () => setIndex((i) => (i + 1) % clips.length);
    el.addEventListener("ended", next);
    return () => el.removeEventListener("ended", next);
  }, [index, clips.length, single, videoSrcs.length]);

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

  // The min-height is what actually protects the copy on a short screen. The
  // copy block is bottom-anchored, so when the viewport is shorter than the
  // fixed header plus the copy, the copy overflows *upward* past any padding
  // and slides under the nav — measured at a 90px collision on 1280x600 and
  // only 10px of clearance at 1280x720. Raising the floor from 620px to 760px
  // means the hero is simply taller than a short window and scrolls, which is
  // ordinary behaviour, instead of colliding.
  return (
    <section className="relative h-[100svh] min-h-[760px] w-full overflow-hidden bg-[#04121f]">
      {/* Footage */}
      <div className="absolute inset-0">
        {clips.map((clip, i) => (
          <video
            key={clip.src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            {...(videoSrcs[i] ? { src: videoSrcs[i] } : {})}
            // Only the clip on screen gets a poster.
            //
            // A <video poster> is fetched immediately regardless of `preload`,
            // so both posters were downloading on first paint — 337KB, of
            // which one is behind an opacity-0 layer nobody can see. On a
            // throttled phone that half was competing for bandwidth with the
            // half the LCP actually measures. The second clip gets its poster
            // once the footage has been allowed to load, which is well after
            // anything that matters to first paint.
            {...(i === index || videoSrcs.length ? { poster: clip.poster } : {})}
            muted
            playsInline
            // "none", not "auto". The first clip used to preload in full, which
            // on a throttled connection meant 2.6MB downloading in parallel
            // with the poster that LCP actually measures.
            preload="none"
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
      {/*
        The top padding reserves the height of the fixed header (~101px at
        sm and up, ~89px below it). Without it this block is only bottom
        anchored, so on a short laptop — 1280x600, or 1366x768 at 125%
        Windows scaling — the copy grew upward until the eyebrow and the
        "Travel," headline ran underneath the logo and the nav. It measured
        as a 90px overlap at 1280x600 and left just 10px of clearance at
        1280x720, which is not clearance at all.
      */}
      <div
        // The reservation has to cover the header AND the parallax lift below,
        // not just the header. The copy rises by up to 60px as the page scrolls
        // while the header simultaneously turns opaque, so 116px of padding put
        // the eyebrow at 56px — underneath an 85px bar — and "WORLDWIDE
        // HOLIDAYS SINCE 2009" was sliced in half. 85 + 60 + a little air.
        className="relative flex h-full flex-col justify-end pt-[152px] sm:pt-[168px]"
        style={{
          transform: `translate3d(0, ${scrolled * -60}px, 0)`,
          opacity: 1 - scrolled * 0.85,
          willChange: "transform, opacity",
        }}
      >
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-10 sm:px-8 sm:pb-20">
          <p
            className="rise-in font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-[#DDBE5E]"
            style={{ animationDelay: "0.14s" }}
          >
            Worldwide holidays since {BRAND.founded}
          </p>

          {/* Fluid to the viewport rather than stepped at breakpoints, so the
              headline holds the same proportion of the frame on any screen.
              Each line sits in its own overflow-hidden box and slides up from
              below, which reads as type being set rather than fading in. */}
          <h1 className="mt-5 max-w-5xl font-display leading-[0.94] text-white [font-size:clamp(3rem,9.5vw,8rem)]">
            <span className="block overflow-hidden">
              <span
                className="block rise-in"
                style={{ animationDelay: "0.26s", ["--rise" as string]: "100%" }}
              >
                Travel,
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="block italic rise-in text-[#DDBE5E]"
                style={{ animationDelay: "0.38s", ["--rise" as string]: "100%" }}
              >
                curated for you.
              </span>
            </span>
          </h1>

          <p
            className="rise-in mt-6 max-w-xl font-sans text-base leading-relaxed text-white/75 sm:text-lg"
            style={{ animationDelay: "0.62s" }}
          >
            Worldwide holiday packages arranged end to end from our Deira office. Flights, hotels,
            transfers and visas handled by one team.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <div className="pop-in" style={{ animationDelay: "0.78s" }}>
              <Magnet padding={70} strength={4}>
                <Link
                  to="/holidays"
                  className="group inline-flex items-center gap-2 rounded-sm bg-[#CAA42D] px-8 py-4 font-sans text-sm font-semibold text-[#04121f] transition-colors hover:bg-[#DDBE5E]"
                >
                  <span>Explore holiday packages</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnet>
            </div>
            <div className="pop-in" style={{ animationDelay: "0.86s" }}>
              <Magnet padding={70} strength={4}>
                <a
                  href={waLink(
                    "Hi Nawi Saadi, I'm planning a holiday from Dubai and would like some options. Where do you suggest for my budget?",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass inline-flex items-center gap-2 rounded-sm px-8 py-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <MessageCircle className="size-4" />
                  <span>Talk to a specialist</span>
                </a>
              </Magnet>
            </div>
          </div>

          {/* Footer rail: credentials, clip indicator, phone. */}
          <div
            className="rise-in mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/15 pt-6"
            style={{ animationDelay: "1s" }}
          >
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 font-sans text-xs text-white/70">
              {/* Two accreditations and the city. The office count and the
                  Afghanistan GSA line were repeated again in the strip below
                  and in the closing band; they are stated once, in the footer. */}
              <li>IATA accredited</li>
              <li>DTCM approved</li>
              <li className="hidden sm:list-item">Deira, Dubai</li>
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
