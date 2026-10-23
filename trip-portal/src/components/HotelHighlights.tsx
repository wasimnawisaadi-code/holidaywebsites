import type { BlockPayload } from "@/lib/types";

export function HotelHighlights({ hotel }: { hotel: BlockPayload }) {
  // The website and map links are buttons on the hotel card itself.
  if (!hotel.hotelSummary && !hotel.hotelRating && !hotel.hotelAddress) return null;
  // Facts read from Google carry their source; links the office typed do not.
  const fromGoogle = Boolean(hotel.hotelSourceName || hotel.hotelRating || hotel.hotelFetchedAt);
  return (
    <section
      className="mt-4 rounded-2xl border border-gold/20 bg-sand p-4"
      aria-label="About your hotel"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-display text-lg text-navy">A closer look at your stay</h4>
        {hotel.hotelRating ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gold-deep">
            {hotel.hotelRating} / 5 · Google reviews
          </span>
        ) : null}
      </div>
      {hotel.hotelAddress ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">{hotel.hotelAddress}</p>
      ) : null}
      {hotel.hotelSummary ? (
        <p className="mt-3 text-sm leading-relaxed text-ink">{hotel.hotelSummary}</p>
      ) : null}
      {fromGoogle ? (
        <p className="mt-3 text-[10px] leading-relaxed text-muted">
          Source: Google Maps{hotel.hotelSourceName ? ` · ${hotel.hotelSourceName}` : ""}
          {hotel.hotelReviewCount ? ` · ${hotel.hotelReviewCount} reviews` : ""}
          {hotel.hotelFetchedAt ? ` · Retrieved ${hotel.hotelFetchedAt}` : ""}. Details and ratings
          may change.
        </p>
      ) : null}
    </section>
  );
}
