import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/**
 * Destination card with a pixel-dissolve hover.
 *
 * On hover a grid of small tiles scales up over the photograph on a diagonal
 * stagger, so the overlay assembles corner-to-corner rather than fading as one
 * flat wash, and the caption reads over a settled ground. Leaving reverses the
 * stagger from the opposite corner, so it un-builds instead of snapping off.
 *
 * The whole overlay is `pointer-events-none`: the tiles sit above the image but
 * must never intercept the pointer, or crossing a tile boundary would register
 * as leaving the card and the animation would flicker.
 */

const COLS = 10;
const ROWS = 7;

export type PixelCard = {
  slug: string;
  title: string;
  country: string;
  meta: string;
  price: string;
  priceLabel: string;
  image: string;
};

export function PixelRevealCard({ card, index }: { card: PixelCard; index: number }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      to="/holidays/$slug"
      params={{ slug: card.slug }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#F8F8F8]"
    >
      <img
        src={card.image}
        alt={card.title}
        decoding="async"
        loading={index < 3 ? "eager" : "lazy"}
        className="absolute inset-0 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
      />

      {/* Pixel-dissolve overlay */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            // Diagonal stagger in from the top-left, out from the bottom-right.
            const delayIn = (row + col) * 18;
            const delayOut = (ROWS - row + (COLS - col)) * 12;
            return (
              <span
                key={`${row}-${col}`}
                className="absolute bg-[#00365F]/85 transition-[transform,opacity] duration-[250ms] ease-out"
                style={{
                  left: `${(col * 100) / COLS}%`,
                  top: `${(row * 100) / ROWS}%`,
                  // A hair over the exact cell size closes the sub-pixel seams
                  // that otherwise show as a grid of hairlines over the photo.
                  width: `${100 / COLS + 0.4}%`,
                  height: `${100 / ROWS + 0.4}%`,
                  transform: hover ? "scale(1)" : "scale(0)",
                  opacity: hover ? 1 : 0,
                  transitionDelay: `${hover ? delayIn : delayOut}ms`,
                }}
              />
            );
          }),
        )}
      </div>

      {/* Country badge */}
      <span className="absolute left-4 top-4 z-20 bg-white px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[#00365F]">
        {card.country}
      </span>

      {/* Info plate */}
      <div className="absolute bottom-0 left-0 z-20 max-w-[78%] bg-white px-4 pb-3 pt-2.5">
        <p className="font-display text-[clamp(1.05rem,1.5vw,1.4rem)] font-normal leading-tight text-[#00365F]">
          {card.title}
        </p>
        <div className="mt-1.5 flex items-center gap-4">
          <span className="font-sans text-[12px] text-[#666666]">{card.meta}</span>
          <span className="font-sans text-[12px] font-semibold text-[#00365F]">{card.price}</span>
        </div>
      </div>

      {/* Corner action, mirroring the reference's plus button */}
      <span className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center border border-white/50 text-white transition-colors group-hover:border-[#CAA42D] group-hover:bg-[#CAA42D] group-hover:text-[#00365F]">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
