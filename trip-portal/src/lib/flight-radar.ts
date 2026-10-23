import { createServerFn } from "@tanstack/react-start";

import { icaoIdent } from "./airline-codes";

/**
 * Where a flight actually is right now, from real ADS-B transponder data.
 *
 * OpenSky Network publishes every aircraft currently reporting its position,
 * free and keyless. No session check: the customer page itself has none —
 * the tracking token is the access control, and this returns nothing more
 * sensitive than "where is this flight", which a stranger could ask any
 * flight tracker anyway.
 *
 * What this deliberately does not do: estimate, interpolate or remember a
 * position. A flight not currently broadcasting returns `airborne: false`,
 * never a guessed or stale point — a customer must never be shown a plane
 * sitting somewhere it is not.
 */
export type FlightPosition =
  | {
      ok: true;
      airborne: true;
      lat: number;
      lon: number;
      altitudeM: number;
      speedKmh: number;
      headingDeg: number;
      ageSeconds: number;
    }
  | { ok: true; airborne: false }
  | { ok: false; reason: string };

type OpenSkyState = [
  string, // icao24
  string | null, // callsign
  string, // origin_country
  number | null, // time_position
  number, // last_contact
  number | null, // longitude
  number | null, // latitude
  number | null, // baro_altitude
  boolean, // on_ground
  number | null, // velocity (m/s)
  number | null, // true_track
  ...unknown[],
];

/**
 * All current states, fetched at most once every CACHE_MS regardless of how
 * many flights on a page ask for one — OpenSky's anonymous quota is shared
 * across this whole app, and a trip with five flights must not spend five
 * times the budget of one. Module-level, so it is shared for as long as this
 * server process stays warm; a cold start just fetches again.
 */
const CACHE_MS = 20_000;
let cached: { at: number; states: OpenSkyState[] } | null = null;
let inFlight: Promise<OpenSkyState[]> | null = null;

async function currentStates(): Promise<OpenSkyState[]> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.states;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const res = await fetch("https://opensky-network.org/api/states/all", {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`OpenSky ${res.status}`);
    const data = (await res.json()) as { states?: OpenSkyState[] };
    const states = data.states ?? [];
    cached = { at: Date.now(), states };
    return states;
  })();
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export const flightPosition = createServerFn({ method: "GET" })
  .validator((flightNumber: string) => flightNumber)
  .handler(async ({ data: flightNumber }): Promise<FlightPosition> => {
    const ident = icaoIdent(flightNumber);
    if (!ident) return { ok: true, airborne: false };

    let states: OpenSkyState[];
    try {
      states = await currentStates();
    } catch {
      return { ok: false, reason: "Live radar is not answering right now." };
    }

    // Callsigns are broadcast space-padded to 8 characters ("UAE394  ").
    const match = states.find((s) => (s[1] ?? "").trim().toUpperCase() === ident);
    if (!match || match[8] /* on_ground */ || match[6] == null || match[5] == null) {
      return { ok: true, airborne: false };
    }
    const [, , , , lastContact, lon, lat, baroAlt, , velocity, track] = match;
    return {
      ok: true,
      airborne: true,
      lat,
      lon,
      altitudeM: Math.round(baroAlt ?? 0),
      speedKmh: Math.round((velocity ?? 0) * 3.6),
      headingDeg: Math.round(track ?? 0),
      ageSeconds: Math.max(0, Math.round(Date.now() / 1000 - lastContact)),
    };
  });
