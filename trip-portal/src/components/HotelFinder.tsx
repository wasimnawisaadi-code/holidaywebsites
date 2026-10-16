import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "./Icon";
import { importHotel, searchHotels, type HotelCandidate, type HotelImport } from "@/lib/booking-ai";

export type PickedHotel = Extract<HotelImport, { ok: true }>;

/**
 * Find the hotel: paste any link or type a name, pick from the photos.
 *
 * This replaced a row of empty boxes the office had to fill one by one. One
 * input takes whatever they have: a Google Maps share link, a Booking.com,
 * Agoda, Expedia or TripAdvisor page, the hotel's own website, or a name.
 * Google answers with up to five hotels, each with a photo, stars and address,
 * and one click fills the name, address, phone, map pin and photos.
 *
 * It is a div, not a form: it sits inside the activity form, and a nested form
 * would submit the whole activity on Enter.
 */
export function HotelFinder({
  tripId,
  available,
  disabled,
  seed,
  pickedName,
  onPick,
}: {
  tripId: string;
  /** False when the server has no Places key. The panel explains instead of failing. */
  available: boolean;
  disabled?: boolean | undefined;
  /** A search to run on arrival, e.g. the hotel name read from a voucher. */
  seed?: string | undefined;
  /** The hotel already chosen, so the panel can show it instead of a blank search. */
  pickedName?: string | undefined;
  onPick: (hotel: PickedHotel) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<HotelCandidate[]>([]);
  const [understood, setUnderstood] = useState("");
  const [error, setError] = useState("");
  const [changing, setChanging] = useState(false);
  // Only the latest search may paint results; an older, slower one is dropped.
  const latest = useRef(0);

  const run = async (text: string) => {
    const q = text.trim();
    if (!q || searching) return;
    const ticket = ++latest.current;
    setSearching(true);
    setError("");
    setCandidates([]);
    setUnderstood("");
    try {
      const result = await searchHotels({ data: q });
      if (ticket !== latest.current) return;
      if (result.ok) {
        setCandidates(result.candidates);
        setUnderstood(result.understood);
      } else setError(result.reason);
    } catch {
      if (ticket === latest.current) setError("Google did not answer. Try again in a moment.");
    } finally {
      if (ticket === latest.current) setSearching(false);
    }
  };

  const choose = async (candidate: HotelCandidate) => {
    setImporting(candidate.placeId);
    setError("");
    try {
      const result = await importHotel({ data: { tripId, placeId: candidate.placeId } });
      if (!result.ok) return setError(result.reason);
      onPick(result);
      setCandidates([]);
      setUnderstood("");
      setQuery("");
      setChanging(false);
    } catch {
      setError("That hotel could not be added. Try again.");
    } finally {
      setImporting(null);
    }
  };

  // A voucher was read: search for the hotel on it straight away.
  const lastSeed = useRef("");
  useEffect(() => {
    const s = seed?.trim();
    if (!s || !available || s === lastSeed.current) return;
    lastSeed.current = s;
    setQuery(s);
    setChanging(true);
    void run(s);
    // `run` is deliberately left out: a new seed, not a re-render, starts a search.
  }, [seed, available]);

  if (!available) {
    return (
      <div className="rounded-2xl border border-hair bg-sand/60 p-4 text-xs leading-relaxed text-gold-deep">
        <p className="font-semibold text-navy">Find the hotel automatically</p>
        <p className="mt-1">
          Hotel search is not connected on this server yet. Ask your administrator to add
          GOOGLE_MAPS_API_KEY. Until then, type the hotel details below.
        </p>
      </div>
    );
  }

  if (pickedName && !changing) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-live/30 bg-live/5 p-4">
        <span className="grid size-9 place-items-center rounded-full bg-live text-white">
          <Icon name="check" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">{pickedName}</p>
          <p className="text-[11px] text-muted">
            Name, address, phone, map pin and photos are filled in below. Check them, then add the
            booking dates.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setChanging(true)}
          className="min-h-10 rounded-lg border border-hair bg-white px-3 text-xs font-semibold text-navy disabled:opacity-50"
        >
          Change hotel
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-gold/50 bg-white p-4">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold text-navy">
        <Icon name="search" className="size-4 text-gold-deep" />
        Find the hotel
      </label>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Paste any hotel link (Google Maps, Booking.com, Agoda, Expedia, TripAdvisor or the hotel’s
        website) or type its name and city.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onPaste={(e) => {
            // A pasted link is a complete answer; search without waiting for a click.
            const text = e.clipboardData.getData("text").trim();
            if (/^https?:\/\//i.test(text)) {
              e.preventDefault();
              setQuery(text);
              void run(text);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void run(query);
            }
          }}
          placeholder="https://maps.app.goo.gl/…  or  Atlantis The Palm, Dubai"
          className="min-h-11 w-full min-w-0 flex-1 rounded-lg border border-hair px-3 text-sm outline-none focus:border-gold"
        />
        <button
          type="button"
          disabled={disabled || searching || query.trim().length < 3}
          onClick={() => void run(query)}
          className="min-h-11 rounded-lg bg-navy px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {searching ? "Searching…" : "Find hotel"}
        </button>
      </div>
      {pickedName ? (
        <button
          type="button"
          onClick={() => {
            setChanging(false);
            setCandidates([]);
            setError("");
          }}
          className="mt-2 text-[11px] font-semibold text-muted"
        >
          Keep {pickedName}
        </button>
      ) : null}

      {searching ? (
        <p role="status" className="mt-3 text-xs text-muted">
          Looking up the hotel on Google…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-alert/8 p-3 text-xs text-alert">
          {error}
        </p>
      ) : null}

      {candidates.length ? (
        <div className="mt-4">
          <p className="text-[11px] text-muted">
            Searched Google for <strong className="text-navy">“{understood}”</strong>. Pick the
            right hotel:
          </p>
          <ul className="mt-2 grid gap-2">
            {candidates.map((c) => {
              const busy = importing === c.placeId;
              return (
                <li key={c.placeId}>
                  <button
                    type="button"
                    disabled={disabled || importing !== null}
                    onClick={() => void choose(c)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition hover:border-gold hover:bg-paper disabled:opacity-60 ${
                      c.likely ? "border-gold/60 bg-gold/5" : "border-hair bg-white"
                    }`}
                  >
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-16 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid h-16 w-20 shrink-0 place-items-center rounded-lg bg-sand">
                        <Icon name="hotel" className="size-5 text-gold-deep" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="truncate text-sm text-navy">{c.name}</strong>
                        {c.likely ? (
                          <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">
                            Best match
                          </span>
                        ) : null}
                      </span>
                      {c.rating !== null ? (
                        <span className="mt-0.5 block text-[11px] text-gold-deep">
                          ★ {c.rating.toFixed(1)}
                          {c.reviews ? ` · ${c.reviews.toLocaleString("en")} reviews` : ""}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        {c.address}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white">
                      {busy ? "Adding…" : "Use this"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {importing ? (
            <p role="status" className="mt-2 text-[11px] text-muted">
              Saving the hotel’s photos to this trip…
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
