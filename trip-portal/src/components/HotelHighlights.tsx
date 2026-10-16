import type { BlockPayload } from "@/lib/types";

function webLink(value?: string) {
  try {
    const url = new URL(value ?? "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function HotelHighlights({ hotel }: { hotel: BlockPayload }) {
  const website = webLink(hotel.hotelWebsite);
  const maps = webLink(hotel.hotelMapsUrl);
  if (!hotel.hotelSummary && !hotel.hotelRating && !hotel.hotelAddress && !website) return null;
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
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-navy">
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-hair bg-white px-3 py-2"
          >
            Hotel website ↗
          </a>
        ) : null}
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-hair bg-white px-3 py-2"
          >
            Explore on Google Maps ↗
          </a>
        ) : null}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        Source: Google Maps{hotel.hotelSourceName ? ` · ${hotel.hotelSourceName}` : ""}
        {hotel.hotelReviewCount ? ` · ${hotel.hotelReviewCount} reviews` : ""}
        {hotel.hotelFetchedAt ? ` · Retrieved ${hotel.hotelFetchedAt}` : ""}. Details and ratings
        may change.
      </p>
    </section>
  );
}
