import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

import { flightPosition, type FlightPosition } from "@/lib/flight-radar";

/**
 * Where this flight actually is, right now — a live radar built from the
 * flight number already on the booking, not a link the customer has to
 * follow elsewhere.
 *
 * Checked every 20 seconds, only around the day of the flight and only while
 * the card is actually on screen (the hidden print copy of the itinerary
 * never asks). The plane appears only once real ADS-B data confirms it is
 * airborne; before departure or after landing this says so plainly. If the
 * data source does not answer, the radar steps aside and the "Open full
 * tracker" link below remains.
 */
export function FlightRadar({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date?: string | undefined;
}) {
  const [state, setState] = useState<FlightPosition | null>(null);
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Worked out after mount: the server's clock and the customer's can sit on
  // different days, and the page must hydrate the same either way.
  const [onDay, setOnDay] = useState<boolean | null>(null);
  useEffect(() => setOnDay(nearFlightDay(date)), [date]);

  useEffect(() => {
    const el = box.current;
    if (!el || !onDay) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(Boolean(entry?.isIntersecting)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onDay]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    const check = async () => {
      try {
        const result = await flightPosition({ data: flightNumber });
        if (!cancelled) setState(result);
      } catch {
        if (!cancelled) setState({ ok: false });
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [flightNumber, visible]);

  if (onDay === null) return null;
  if (!onDay) {
    return (
      <p className="px-5 py-3 text-center text-[11px] text-muted">
        The live radar switches on here on the day of your flight.
      </p>
    );
  }
  // One wrapper for every state, so the visibility observer keeps watching the
  // same element as the content inside it changes.
  return (
    <div ref={box} className="min-h-px">
      <RadarState state={state} />
    </div>
  );
}

function RadarState({ state }: { state: FlightPosition | null }) {
  if (!state) {
    return (
      <div className="flex items-center gap-2 px-5 py-4 text-xs text-muted">
        <span aria-hidden="true" className="ns-shimmer size-2 rounded-full bg-gold" />
        Checking live radar…
      </div>
    );
  }
  if (!state.ok) return null;
  if (!state.airborne) {
    return (
      <p className="px-5 py-3 text-center text-[11px] text-muted">
        Not currently showing on live radar — most flights only appear here once airborne.
      </p>
    );
  }
  return <LiveMap {...state} />;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * True from the day before the flight to the day after (a long-haul flight
 * lands the next day), or when the date cannot be read — then the radar is
 * simply tried. Dates arrive as typed: "13 Nov 2026" or "2026-11-13".
 */
function nearFlightDay(date?: string): boolean {
  if (!date) return true;
  let at = NaN;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  const typed = /(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?,?\s+(\d{4})/.exec(date);
  if (iso) at = Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  else if (typed) {
    const month = MONTHS.indexOf(typed[2]!.toLowerCase());
    if (month >= 0) at = Date.UTC(Number(typed[3]), month, Number(typed[1]));
  }
  if (Number.isNaN(at)) return true;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.abs(at - today) <= 86_400_000;
}

function LiveMap({
  lat,
  lon,
  altitudeFt,
  speedKmh,
  headingDeg,
  ageSeconds,
}: Extract<FlightPosition, { airborne: true }>) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const marker = useRef<Leaflet.Marker | null>(null);
  const lib = useRef<typeof Leaflet | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [L] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
        if (cancelled || !box.current) return;
        const m = L.map(box.current, {
          scrollWheelZoom: false,
          dragging: !window.matchMedia("(pointer: coarse)").matches,
          attributionControl: true,
          zoomControl: true,
        }).setView([lat, lon], 7, { animate: false });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          referrerPolicy: "origin",
        }).addTo(m);
        m.attributionControl.setPrefix(false);
        marker.current = L.marker([lat, lon], { icon: planeIcon(L, headingDeg) }).addTo(m);
        lib.current = L;
        map.current = m;
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
      lib.current = null;
    };
    // Built once; the effect below moves the existing marker rather than
    // rebuilding the map, so the view does not jump every 20-second refresh.
  }, []);

  useEffect(() => {
    if (!ready || !marker.current || !map.current || !lib.current) return;
    marker.current.setLatLng([lat, lon]);
    marker.current.setIcon(planeIcon(lib.current, headingDeg));
    map.current.panTo([lat, lon], { animate: true });
  }, [ready, lat, lon, headingDeg]);

  return (
    <div className="border-t border-dashed border-hair">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-live uppercase">
          <span aria-hidden="true" className="ns-pulse size-2 rounded-full bg-live" />
          Live radar
        </p>
        <p className="text-[10px] text-muted">
          Updated {ageSeconds < 60 ? `${ageSeconds}s` : `${Math.round(ageSeconds / 60)}m`} ago
        </p>
      </div>
      <div className="relative isolate h-48 overflow-hidden bg-paper">
        <div
          ref={box}
          role="region"
          aria-label="Live flight position"
          className="absolute inset-0 z-0"
        />
        {!ready && !failed ? (
          <div aria-hidden="true" className="ns-shimmer absolute inset-0 z-10" />
        ) : null}
        {failed ? (
          <p className="absolute inset-0 z-10 grid place-items-center p-4 text-center text-xs text-muted">
            The live map couldn&apos;t load here.
          </p>
        ) : null}
      </div>
      <dl className="grid grid-cols-3 gap-3 px-5 py-4">
        {[
          ["Altitude", `${altitudeFt.toLocaleString("en")} ft`],
          ["Speed", `${speedKmh.toLocaleString("en")} km/h`],
          ["Heading", `${headingDeg}°`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] tracking-wide text-muted uppercase">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-navy">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="px-5 pb-4 text-[10px] text-muted">
        Live position from real aircraft transponder data (adsb.lol / adsb.fi, ODbL). Refreshes
        automatically.
      </p>
    </div>
  );
}

/**
 * The plane icon, rotated to the aircraft's real heading. Built as HTML
 * rather than an image so the rotation is a plain CSS transform. The path's
 * own nose points roughly north-east at rest (it is the same glyph used for
 * the "plane" icon elsewhere in this app), hence the extra -45deg to zero it
 * before applying the real heading.
 */
function planeIcon(L: typeof Leaflet, headingDeg: number): Leaflet.DivIcon {
  return L.divIcon({
    className: "ns-plane-marker",
    html: `<span class="ns-plane-wrap" style="transform:rotate(${headingDeg - 45}deg)"><svg viewBox="0 0 24 24" width="26" height="26" fill="#00365F" stroke="#ffffff" stroke-width="1"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}
