import { useEffect, useRef, useState } from "react";

import { Icon } from "./Icon";

/**
 * Full-screen photo viewer.
 *
 * Exists because the photos in an itinerary are instructions, not decoration:
 * "this is the exit", "this is the kiosk your driver stands beside". A 390px-wide
 * thumbnail of a car park does not answer that; the customer needs to see it
 * large, and to flick between the three angles the office photographed.
 *
 * Keyboard: Esc closes, arrow keys move. Touch: a horizontal swipe moves. Focus
 * goes to the close button on open and back to whatever opened it on close, so
 * a screen-reader or keyboard user is never stranded behind the overlay.
 */
export type LightboxPhoto = { url: string; caption?: string | undefined };

export function Lightbox({
  photos,
  start,
  onClose,
}: {
  photos: LightboxPhoto[];
  start: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const opener = useRef<Element | null>(null);

  const count = photos.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    opener.current = document.activeElement;
    closeRef.current?.focus();
    // Stop the page underneath scrolling while the viewer is open; on iOS a
    // swipe on the photo would otherwise scroll the itinerary behind it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) go(1);
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
    // Mount-only on purpose: the listener reads `count` and calls `go`, both
    // stable for the viewer's lifetime (the photo list does not change while it
    // is open), and re-binding on every index change would re-run the focus and
    // scroll-lock steps above on each swipe.
  }, []);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ? `Photo: ${photo.caption}` : "Photo"}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || count < 2) return;
        if (end - start > 50) go(-1);
        else if (start - end > 50) go(1);
      }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 text-white">
        <span className="font-mono text-xs text-white/70 tabular-nums">
          {count > 1 ? `${index + 1} / ${count}` : ""}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        <img
          src={photo.url}
          alt={photo.caption ?? ""}
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
        />
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="chevronLeft" className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="chevronRight" className="size-6" />
            </button>
          </>
        ) : null}
      </div>

      {photo.caption ? (
        <p className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-sm leading-relaxed text-white/85">
          {photo.caption}
        </p>
      ) : (
        <div className="pb-[max(1.25rem,env(safe-area-inset-bottom))]" />
      )}
    </div>
  );
}
