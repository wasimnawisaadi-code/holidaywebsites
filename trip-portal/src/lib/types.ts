import type { IconName } from "@/components/Icon";

/**
 * Domain types and the progress ladder. Safe on both sides of the wire.
 *
 * This file exists because of a bug worth recording. All of this originally
 * lived in `lib/trips.ts` alongside the database reads — which import `db.ts`,
 * which throws on purpose if it is ever evaluated in a browser. The customer
 * portal needed one small helper from it, so importing it pulled
 * `db.ts` into the client bundle and the page died on hydration with
 * "db.ts is server-only". The guard was working exactly as designed; the import
 * graph was wrong.
 *
 * So the split is by *where the code can run*, not by subject matter: pure data
 * and pure functions here, anything that touches Supabase in `trips.ts`. A
 * component may import from this file freely and from `trips.ts` never.
 */

/* -------------------------------------------------------------------------
 * Timing
 *
 * Where a trip stands is worked out from its dates, not posted by the office.
 * An earlier version had staff step every trip through thirteen progress
 * stages and showed the customer a percentage. Nobody can keep that current
 * for every customer, and a status that says "driver on the way" two days
 * after the trip ended is worse than no status at all. Dates are always right.
 * ---------------------------------------------------------------------- */

/** Today in Dubai as YYYY-MM-DD — the office's calendar, whatever the device clock says. */
export function dubaiToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
}

export type TripTiming =
  | { phase: "upcoming"; daysToGo: number }
  | { phase: "travelling"; day: number; of: number }
  | { phase: "finished" };

export function tripTiming(start: string, end: string, today = dubaiToday()): TripTiming {
  const at = (d: string) => Date.parse(`${d}T00:00:00Z`) / 86_400_000;
  const [now, from, to] = [at(today), at(start), at(end)];
  if (now < from) return { phase: "upcoming", daysToGo: Math.round(from - now) };
  if (now > to) return { phase: "finished" };
  return { phase: "travelling", day: Math.round(now - from) + 1, of: Math.round(to - from) + 1 };
}

/* -------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------- */

export type TripState = "draft" | "confirmed" | "in_progress" | "completed" | "cancelled";

export const BLOCK_KINDS = [
  "text",
  "heading",
  "image",
  "gallery",
  "video",
  "map",
  "driver",
  "hotel",
  "flight",
  "ticket",
  "document",
  "contact",
  "notice",
  "emergency",
  "link",
  "checklist",
  "invoice",
  "guide",
] as const;

export type BlockKind = (typeof BLOCK_KINDS)[number];

/** What the office sees in the "add content" menu, in a sensible order. */
export const BLOCK_LABELS: Record<BlockKind, { label: string; icon: IconName; hint: string }> = {
  text: { label: "Text", icon: "text", hint: "A paragraph of instructions" },
  heading: { label: "Subheading", icon: "heading", hint: "A small heading inside a step" },
  image: { label: "Image", icon: "image", hint: "One photo with a caption" },
  gallery: { label: "Gallery", icon: "images", hint: "Several photos, opened full-screen" },
  video: { label: "Video", icon: "video", hint: "A short clip, e.g. how to find the driver" },
  map: { label: "Location", icon: "pin", hint: "Opens in the customer's maps app" },
  driver: { label: "Driver", icon: "car", hint: "Photo, vehicle, plate, call and WhatsApp" },
  hotel: { label: "Hotel", icon: "hotel", hint: "Check-in, check-out, reference" },
  flight: { label: "Flight", icon: "plane", hint: "Flight number and times" },
  ticket: { label: "Ticket", icon: "ticket", hint: "Attraction ticket or voucher" },
  document: { label: "Document", icon: "file", hint: "A PDF already uploaded to this trip" },
  contact: { label: "Contact", icon: "phone", hint: "A name with call and WhatsApp buttons" },
  notice: { label: "Notice", icon: "alert", hint: "Something they must not miss" },
  emergency: { label: "Emergency", icon: "shield", hint: "Emergency contact panel" },
  link: { label: "Link", icon: "link", hint: "An external link" },
  checklist: { label: "Checklist", icon: "list", hint: "A list of things to bring or do" },
  invoice: { label: "Invoice", icon: "receipt", hint: "A published invoice for this trip" },
  guide: {
    label: "Photo guide",
    icon: "images",
    hint: "Step-by-step photos to a meeting point, e.g. the driver pickup",
  },
};

/**
 * A block's payload.
 *
 * One optional-everything type rather than a discriminated union per kind. The
 * union is more precise and was the first version of this; it turned every
 * render site into a sixteen-branch narrowing exercise whose only purpose was
 * to satisfy a type the database does not enforce anyway, since the column is
 * jsonb. The renderer switches on `kind` once and reads the fields that kind
 * uses.
 *
 * Every field is `?: T | undefined` rather than plain `?: T`. Under
 * `exactOptionalPropertyTypes` those mean different things — plain `?:` permits
 * the key to be absent but forbids writing `undefined` into it — and this object
 * is assembled field by field in the admin form, where clearing an input means
 * writing undefined over a value that was there a moment ago.
 */
export type BlockPayload = {
  text?: string | undefined;
  heading?: string | undefined;
  caption?: string | undefined;
  /** Storage path inside trip-media — never a URL. Signed at render time. */
  path?: string | undefined;
  paths?: string[] | undefined;
  /** Resolved from `path` when the trip is read; never stored. */
  url?: string | null | undefined;
  urls?: (string | null)[] | undefined;
  poster?: string | undefined;
  posterUrl?: string | null | undefined;
  label?: string | undefined;
  href?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  locationName?: string | undefined;
  driverId?: string | undefined;
  documentId?: string | undefined;
  invoiceId?: string | undefined;
  /**
   * Photo-guide steps, in order. `path` is a storage path; `url` is filled in
   * when the trip is read (signed), never stored.
   */
  steps?: GuideStep[] | undefined;
  items?: string[] | undefined;
  name?: string | undefined;
  phone?: string | undefined;
  whatsapp?: string | undefined;
  reference?: string | undefined;
  checkIn?: string | undefined;
  checkOut?: string | undefined;
  flightNumber?: string | undefined;
  departure?: string | undefined;
  arrival?: string | undefined;
  tone?: "info" | "warning" | "critical" | undefined;
};

export type GuideStep = {
  path?: string | undefined;
  url?: string | null | undefined;
  text: string;
};

export type Block = {
  id: string;
  position: number;
  kind: BlockKind;
  payload: BlockPayload;
};

export type Step = {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  time_label: string | null;
  duration: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  blocks: Block[];
};

export type Day = {
  id: string;
  day_number: number;
  date: string | null;
  title: string;
  summary: string | null;
  cover_image: string | null;
  coverUrl?: string | null;
  published: boolean;
  steps: Step[];
};

export type Driver = {
  id: string;
  full_name: string;
  photo: string | null;
  photoUrl?: string | null;
  phone: string | null;
  whatsapp: string | null;
  vehicle: string | null;
  plate_number: string | null;
  languages: string | null;
};

export type TripDocument = {
  id: string;
  name: string;
  file_path: string;
  doc_type: string | null;
  visibility: "always" | "requires_verification" | "staff_only";
  position: number;
  url?: string | null;
};

export type Trip = {
  id: string;
  trip_code: string;
  title: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  status: TripState;
  tracking_token: string;
  published_at: string | null;
  hero_image: string | null;
  heroUrl?: string | null;
  pax_adults: number;
  pax_children: number;
  emergency_name: string | null;
  emergency_phone: string | null;
  customer: { full_name: string; phone: string | null; whatsapp: string | null } | null;
};

/* -------------------------------------------------------------------------
 * Invoices
 *
 * How money moves, stated precisely because an earlier version of this comment
 * got it wrong. The columns are Postgres numeric(12,2), which is exact. PostgREST
 * serialises numeric as a JSON *number* — `"subtotal": 1234.35`, not
 * `"1234.35"` — so on arrival every amount has passed through a JavaScript
 * double. That is harmless for storage and display: a two-decimal amount below
 * a trillion always round-trips through a double to the same nearest value.
 *
 * It is not harmless for arithmetic. 0.1 + 0.2 is 0.30000000000000004, and
 * subtracting two ordinary invoice amounts can leave 0.009999999999990905 on the
 * screen. So nothing here does arithmetic on the raw values: `balanceOf` and the
 * server's totals convert to integer fils first, subtract integers, and convert
 * back once. The type is `number | string` so that a PostgREST configured to
 * send numeric as strings would still work unchanged.
 * ---------------------------------------------------------------------- */

export type InvoiceStatus = "draft" | "sent" | "part_paid" | "paid" | "void";

/** An amount as it arrives over the wire. See the note above. */
export type Amount = number | string;

export type InvoiceItem = {
  id: string;
  position: number;
  description: string;
  quantity: Amount;
  unit_price: Amount;
  amount: Amount;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  currency: string;
  status: InvoiceStatus;
  issued_date: string;
  due_date: string | null;
  subtotal: Amount;
  discount: Amount;
  total: Amount;
  amount_paid: Amount;
  notes: string | null;
  published: boolean;
  items: InvoiceItem[];
};

/** Integer fils (hundredths) from an amount, the only safe unit for arithmetic. */
export function toFils(v: Amount | null | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Awaiting payment",
  part_paid: "Part paid",
  paid: "Paid in full",
  void: "Cancelled",
};

/** Balance outstanding, in integer fils so the subtraction is exact. */
export function balanceOf(invoice: Pick<Invoice, "total" | "amount_paid">): string {
  const diff = toFils(invoice.total) - toFils(invoice.amount_paid);
  return (diff / 100).toFixed(2);
}

/** "AED 4,499.00" — grouped, two decimals, never locale-surprising. */
export function money(amount: string | number, currency = "AED"): string {
  const n = Number(amount || 0);
  if (!Number.isFinite(n)) return `${currency} 0.00`;
  return `${currency} ${n.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type CustomerTrip = {
  trip: Trip;
  days: Day[];
  drivers: Driver[];
  documents: TripDocument[];
  invoices: Invoice[];
};

export type TripOverview = {
  id: string;
  trip_code: string;
  title: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  status: TripState;
  tracking_token: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_whatsapp: string | null;
  day_count: number;
  published_day_count: number;
  invoice_count: number;
  balance_due: string;
};
