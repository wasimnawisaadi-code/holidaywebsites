import { createServerFn } from "@tanstack/react-start";

import { icaoIdent } from "./airline-codes";

/**
 * Where a flight actually is right now, from real ADS-B transponder data.
 *
 * Source: the community ADS-B networks adsb.lol and adsb.fi, keyless, asked
 * for one callsign at a time. OpenSky was the first source and worked from a
 * laptop, but it does not answer requests from Vercel's servers at all (every
 * call timed out in production), so it is not used.
 *
 * No session check: the customer page itself has none — the tracking token is
 * the access control, and this returns nothing more sensitive than "where is
 * this flight", which a stranger could ask any flight tracker anyway.
 *
 * What this deliberately does not do: estimate, interpolate or remember a
 * position. A flight not currently broadcasting returns `airborne: false`,
 * never a guessed or stale point.
 */
export type FlightPosition =
  | {
      ok: true;
      airborne: true;
      lat: number;
      lon: number;
      altitudeFt: number;
      speedKmh: number;
      headingDeg: number;
      ageSeconds: number;
    }
  | { ok: true; airborne: false }
  | { ok: false };

type Aircraft = {
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  gs?: number;
  track?: number;
  seen_pos?: number;
};

const SOURCES = [
  (ident: string) => `https://api.adsb.lol/v2/callsign/${ident}`,
  (ident: string) => `https://opendata.adsb.fi/api/v2/callsign/${ident}`,
];

/** Ten customers looking at the same flight cost one lookup per 15 seconds. */
const CACHE_MS = 15_000;
const cache = new Map<string, { at: number; value: FlightPosition }>();
const inFlight = new Map<string, Promise<FlightPosition>>();

/**
 * Both networks answer 429 to a burst (six parallel lookups got four
 * refusals), and adsb.lol refuses requests without a User-Agent naming who is
 * asking. So requests go out one at a time, a little over a second apart.
 */
const USER_AGENT =
  "NawiSaadiTripPortal/1.0 (+https://trip.nawisaadiholidays.com; contact https://www.nawisaadiholidays.com/contact)";
const SPACING_MS = 1_100;
let queue: Promise<unknown> = Promise.resolve();

function spaced(url: string): Promise<Response> {
  const run = queue.then(() =>
    fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6_000) }),
  );
  queue = run.then(
    () => new Promise((r) => setTimeout(r, SPACING_MS)),
    () => new Promise((r) => setTimeout(r, SPACING_MS)),
  );
  return run;
}

async function lookup(ident: string): Promise<FlightPosition> {
  for (const source of SOURCES) {
    try {
      const res = await spaced(source(ident));
      if (!res.ok) continue;
      const data = (await res.json()) as { ac?: Aircraft[] };
      const plane = (data.ac ?? []).find(
        (a) =>
          (a.flight ?? "").trim().toUpperCase() === ident &&
          typeof a.lat === "number" &&
          typeof a.lon === "number" &&
          a.alt_baro !== "ground",
      );
      if (!plane) return { ok: true, airborne: false };
      return {
        ok: true,
        airborne: true,
        lat: plane.lat!,
        lon: plane.lon!,
        altitudeFt: typeof plane.alt_baro === "number" ? Math.round(plane.alt_baro) : 0,
        speedKmh: Math.round((plane.gs ?? 0) * 1.852),
        headingDeg: Math.round(plane.track ?? 0),
        ageSeconds: Math.max(0, Math.round(plane.seen_pos ?? 0)),
      };
    } catch {
      // Try the next network.
    }
  }
  return { ok: false };
}

export const flightPosition = createServerFn({ method: "GET" })
  .validator((flightNumber: string) => flightNumber)
  .handler(async ({ data: flightNumber }): Promise<FlightPosition> => {
    const ident = icaoIdent(flightNumber);
    if (!ident) return { ok: true, airborne: false };
    const hit = cache.get(ident);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
    let pending = inFlight.get(ident);
    if (!pending) {
      pending = lookup(ident).finally(() => inFlight.delete(ident));
      inFlight.set(ident, pending);
    }
    const value = await pending;
    cache.set(ident, { at: Date.now(), value });
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    return value;
  });
