/**
 * Airline IATA code -> ICAO code, for the carriers this agency is likely to
 * book. Printed tickets and the booking reader use the IATA code ("EK394");
 * both the external flight-tracker link and the live radar below need the
 * ICAO one ("UAE394") — FlightAware's URL does not resolve the IATA form
 * directly, and ADS-B callsigns broadcast by the aircraft are ICAO too.
 * Confirmed by typing "EK394" into FlightAware's own search box and watching
 * it resolve client-side to /live/flight/UAE394.
 *
 * An airline not listed here still gets a real search or an honest "not
 * found" rather than a guessed code.
 */
export const AIRLINE_ICAO: Record<string, string> = {
  EK: "UAE", // Emirates
  FZ: "FDB", // flydubai
  EY: "ETD", // Etihad Airways
  QR: "QTR", // Qatar Airways
  SV: "SVA", // Saudia
  TK: "THY", // Turkish Airlines
  G9: "ABY", // Air Arabia
  PC: "PGT", // Pegasus Airlines
  RJ: "RJA", // Royal Jordanian
  KU: "KAC", // Kuwait Airways
  GF: "GFA", // Gulf Air
  WY: "OMA", // Oman Air
  UL: "ALK", // SriLankan Airlines
  PK: "PIA", // Pakistan International Airlines
  "6E": "IGO", // IndiGo
  AI: "AIC", // Air India
  VJ: "VJC", // VietJet Air
  VN: "HVN", // Vietnam Airlines
  TG: "THA", // Thai Airways
  MH: "MAS", // Malaysia Airlines
  SQ: "SIA", // Singapore Airlines
  CX: "CPA", // Cathay Pacific
  MS: "MSR", // EgyptAir
  BA: "BAW", // British Airways
  LH: "DLH", // Lufthansa
  AF: "AFR", // Air France
  KL: "KLM", // KLM
};

/**
 * "EK 394" -> "UAE394": the ICAO ident ADS-B networks and FlightAware use, built
 * from a printed flight number. Null when the airline is not in the table
 * above — callers fall back to a real search rather than a wrong guess.
 */
export function icaoIdent(flightNumber: string): string | null {
  const clean = flightNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  // The IATA airline code is 2 letters, or 1 letter + 1 digit (e.g. "6E"
  // IndiGo) — check both lengths against the table before giving up.
  for (const len of [2, 3]) {
    const code = clean.slice(0, len);
    const icao = AIRLINE_ICAO[code];
    if (icao) return `${icao}${clean.slice(len)}`;
  }
  return null;
}
