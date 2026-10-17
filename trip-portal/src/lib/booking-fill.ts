/**
 * Small, pure helpers for filling a booking form from what a voucher says.
 * Safe on both sides of the wire.
 */

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const month = (word: string): number | undefined =>
  MONTHS[word.toLowerCase().slice(0, 4)] ?? MONTHS[word.toLowerCase().slice(0, 3)];

function iso(y: number, m: number, d: number): string | null {
  if (y < 100) y += 2000;
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d)
    return null;
  return back.toISOString().slice(0, 10);
}

/**
 * A printed date as YYYY-MM-DD, or null when it cannot be read with certainty.
 *
 * Vouchers print dates every way there is: "2026-09-28", "28/09/2026",
 * "28 Sep 2026", "Sep 28, 2026", "Mon, 28 September". Numeric dates are read
 * day-first, as they are printed in the UAE and most of the world, unless the
 * second number cannot be a month. A date without a year takes `year`.
 */
export function toIsoDate(raw: string | undefined, year?: number): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;

  let m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return iso(+m[1]!, +m[2]!, +m[3]!);

  m = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s);
  if (m) {
    const [a, b, y] = [+m[1]!, +m[2]!, +m[3]!];
    return b > 12 ? iso(y, a, b) : iso(y, b, a);
  }

  m = /(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})\.?,?[\s-]+(\d{4})/.exec(s);
  if (m && month(m[2]!)) return iso(+m[3]!, month(m[2]!)!, +m[1]!);

  m = /([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/.exec(s);
  if (m && month(m[1]!)) return iso(+m[3]!, month(m[1]!)!, +m[2]!);

  if (year) {
    m = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})/.exec(s);
    if (m && month(m[2]!)) return iso(year, month(m[2]!)!, +m[1]!);
    m = /([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/.exec(s);
    if (m && month(m[1]!)) return iso(year, month(m[1]!)!, +m[2]!);
  }
  return null;
}

/** Nights between two YYYY-MM-DD dates, or null when they do not make a stay. */
export function nightsBetween(checkIn?: string, checkOut?: string): number | null {
  if (!checkIn || !checkOut) return null;
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const n = Math.round((b - a) / 86_400_000);
  return n > 0 && n < 120 ? n : null;
}
