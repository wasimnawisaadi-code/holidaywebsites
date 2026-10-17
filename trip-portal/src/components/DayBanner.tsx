import { useRef, useState } from "react";

import { Icon } from "./Icon";
import { Lightbox, type LightboxPhoto } from "./Lightbox";

/**
 * The picture at the top of a day: one photo, or a slideshow of the day's
 * photos that the traveller swipes (or taps the arrows) through, with a
 * counter and dots, and opens full-screen with a tap.
 *
 * A native horizontal scroll with snap points rather than a script-driven
 * carousel: swiping on a phone then feels like every other photo strip on the
 * phone, and nothing breaks if a script is slow to load.
 */
export function DayBanner({ photos, label }: { photos: LightboxPhoto[]; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  if (!photos.length) return null;
  const many = photos.length > 1;

  const go = (to: number) => {
    const el = track.current;
    if (!el) return;
    const next = (to + photos.length) % photos.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-paper shadow-md">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        style={{ aspectRatio: "16 / 9" }}
        aria-roledescription={many ? "carousel" : undefined}
        aria-label={label}
      >
        {photos.map((photo, i) => (
          <button
            key={`${photo.url}-${i}`}
            type="button"
            onClick={() => setViewer(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <img
              src={photo.url}
              alt={photo.caption ?? ""}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="size-full object-cover"
            />
            {photo.caption ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/75 to-transparent px-4 pt-8 pb-3 text-left text-sm font-semibold text-white">
                {photo.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {many ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-navy shadow backdrop-blur hover:bg-white"
          >
            <Icon name="chevronLeft" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-navy shadow backdrop-blur hover:bg-white"
          >
            <Icon name="chevronRight" className="size-5" />
          </button>
          <span className="absolute top-3 right-3 rounded-full bg-navy/75 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums">
            {index + 1} / {photos.length}
          </span>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={`dot-${photo.url}-${i}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}

      {viewer !== null ? (
        <Lightbox photos={photos} start={viewer} onClose={() => setViewer(null)} />
      ) : null}
    </div>
  );
}
