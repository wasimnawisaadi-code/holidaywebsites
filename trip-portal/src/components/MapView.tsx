import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

/**
 * A real map, drawn in the page.
 *
 * Leaflet over OpenStreetMap, not an embedded Google map: an embed needs a paid
 * API key billed per load, and every customer opening their trip would be a
 * load. The map here is for seeing where things are — the route through a day,
 * which side of the terminal the pickup is on. Turn-by-turn directions are
 * still handed to the customer's own maps app (see Directions.tsx), which does
 * that job better than any embed.
 *
 * Leaflet touches `window` the moment it is imported, so it is loaded inside an
 * effect, on the client only, and only by pages that actually show a map — the
 * forty kilobytes never reach a trip with no pins on it.
 */

export type MapPoint = {
  lat: number;
  lng: number;
  label?: string | undefined;
  /** Drawn inside the pin. Omitted for a single unnumbered place. */
  number?: number | undefined;
};

const DUBAI = { lat: 25.2048, lng: 55.2708 };

export function MapView({
  points,
  route = false,
  editable = false,
  onPick,
  label,
  className = "h-56",
  framed = true,
}: {
  points: MapPoint[];
  /** Join the points in order with the brand's gold line. */
  route?: boolean;
  /** One draggable pin; tapping the map moves it there. Admin only. */
  editable?: boolean;
  onPick?: ((p: { lat: number; lng: number }) => void) | undefined;
  label: string;
  className?: string;
  /** False when the map sits flush inside a card that already has a border. */
  framed?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const lib = useRef<typeof Leaflet | null>(null);
  const layer = useRef<Leaflet.LayerGroup | null>(null);
  // The latest callback, read at event time. Leaflet's handlers are bound once
  // on mount, and a handler that closed over the first render's onPick would
  // keep writing into a form state that has since moved on.
  const pick = useRef(onPick);
  pick.current = onPick;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    void (async () => {
      try {
        const [L] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
        if (cancelled || !box.current) return;
        const touch = window.matchMedia("(pointer: coarse)").matches;
        const m = L.map(box.current, {
          // The page scrolls, not the map. A map that grabs the wheel or a
          // one-finger swipe traps a customer halfway down their itinerary;
          // on a phone, two fingers still pan and zoom it.
          scrollWheelZoom: false,
          dragging: editable || !touch,
          attributionControl: true,
          zoomControl: true,
        });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          className: "ns-tiles",
          // The portal sends no referrer at all (vercel.json), but the tile
          // servers refuse requests without one. The origin only — never the
          // path, which holds the customer's private token.
          referrerPolicy: "origin",
        }).addTo(m);
        m.attributionControl.setPrefix(false);

        m.on("click", (e: Leaflet.LeafletMouseEvent) => {
          if (editable) pick.current?.({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) });
        });

        lib.current = L;
        map.current = m;
        layer.current = L.layerGroup().addTo(m);
        observer = new ResizeObserver(() => m.invalidateSize());
        observer.observe(box.current);
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      layer.current = null;
    };
    // Built once. Points are drawn by the effect below, so a moved pin does not
    // tear down and rebuild the whole map.
  }, []);

  // Serialised so that a parent re-rendering with an equal-but-new array does
  // not refit the view while someone is looking at it.
  const key = JSON.stringify(points.map((p) => [p.lat, p.lng, p.number ?? null, p.label ?? null]));

  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    const group = layer.current;
    if (!ready || !L || !m || !group) return;
    group.clearLayers();

    const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    for (const p of valid) {
      const marker = L.marker([p.lat, p.lng], {
        icon: pinIcon(L, p.number),
        draggable: editable,
        keyboard: true,
        title: p.label ?? "",
        alt: p.label ?? "Location",
        riseOnHover: true,
      });
      if (p.label) marker.bindTooltip(p.label, { direction: "top", offset: [0, -38] });
      if (editable) {
        marker.on("dragend", () => {
          const ll = marker.getLatLng();
          pick.current?.({ lat: round(ll.lat), lng: round(ll.lng) });
        });
      }
      marker.addTo(group);
    }

    if (route && valid.length > 1) {
      const line = valid.map((p) => [p.lat, p.lng] as [number, number]);
      // Two strokes: a soft wide one underneath so the gold reads on both a
      // pale street and a dark park, and the dashed line that draws itself.
      L.polyline(line, { color: "#ffffff", weight: 7, opacity: 0.9, interactive: false }).addTo(
        group,
      );
      L.polyline(line, {
        color: "#caa42d",
        weight: 3.5,
        opacity: 1,
        dashArray: "8 8",
        className: "ns-route",
        interactive: false,
      }).addTo(group);
    }

    if (valid.length === 1) {
      const only = valid[0]!;
      // Close enough to see which entrance; far enough to see the road to it.
      m.setView([only.lat, only.lng], editable ? 17 : 15, { animate: false });
    } else if (valid.length > 1) {
      m.fitBounds(L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number])), {
        padding: [36, 36],
        maxZoom: 16,
        animate: false,
      });
    } else {
      m.setView([DUBAI.lat, DUBAI.lng], 11, { animate: false });
    }
  }, [ready, key, route, editable]);

  return (
    <div
      className={`relative isolate overflow-hidden bg-paper ${framed ? "rounded-2xl border border-hair" : ""} ${className}`}
    >
      <div ref={box} role="region" aria-label={label} className="absolute inset-0 z-0" />
      {!ready && !failed ? (
        <div aria-hidden="true" className="ns-shimmer absolute inset-0 z-10" />
      ) : null}
      {failed ? (
        <p className="absolute inset-0 z-10 grid place-items-center p-4 text-center text-xs text-muted">
          The map couldn&apos;t load here — the directions buttons still work.
        </p>
      ) : null}
    </div>
  );
}

/** Six decimals is about ten centimetres — more than enough, and tidy to store. */
function round(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/**
 * The brand pin: a navy teardrop with a gold ring and a white number. Built as
 * HTML rather than Leaflet's default PNG marker, which is a generic blue that
 * says "embedded map widget" and needs image files resolved at build time.
 */
function pinIcon(L: typeof Leaflet, n: number | undefined): Leaflet.DivIcon {
  return L.divIcon({
    className: "ns-pin-wrap",
    html: `<span class="ns-pin"><span class="ns-pin-label">${n ?? ""}</span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    tooltipAnchor: [0, -4],
  });
}
