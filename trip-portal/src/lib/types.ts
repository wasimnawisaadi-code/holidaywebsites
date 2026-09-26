/**
 * Domain types and the progress ladder. Safe on both sides of the wire.
 *
 * This file exists because of a bug worth recording. All of this originally
 * lived in `lib/trips.ts` alongside the database reads — which import `db.ts`,
 * which throws on purpose if it is ever evaluated in a browser. The customer
 * portal needs `stageMeta` to render a status label, so importing it pulled
 * `db.ts` into the client bundle and the page died on hydration with
 * "db.ts is server-only". The guard was working exactly as designed; the import
 * graph was wrong.
 *
 * So the split is by *where the code can run*, not by subject matter: pure data
 * and pure functions here, anything that touches Supabase in `trips.ts`. A
 * component may import from this file freely and from `trips.ts` never.
 */

/* -------------------------------------------------------------------------
 * Progress
 *
 * The ordered ladder is declared once and drives three things: the dropdown the
 * office picks from, the bar the customer watches, and the percentage in the
 * admin list. Deriving all three from one array is what stops the portal
 * claiming a trip is 60% done while the admin says 40%.
 *
 * `customerLabel` is separate from `label` on purpose. The office thinks in
 * operational states; a customer reads "Your driver is on the way", not
 * "driver_on_the_way". Keeping both here keeps customer-facing wording out of
 * the JSX, where it would drift between screens.
 * ---------------------------------------------------------------------- */

export const PROGRESS_STAGES = [
  { id: "booked", label: "Booked", customerLabel: "Booking confirmed", group: "Before you travel" },
  {
    id: "documents_ready",
    label: "Documents ready",
    customerLabel: "Your documents are ready",
    group: "Before you travel",
  },
  {
    id: "driver_assigned",
    label: "Driver assigned",
    customerLabel: "Your driver is assigned",
    group: "Transfer",
  },
  {
    id: "driver_on_the_way",
    label: "Driver on the way",
    customerLabel: "Your driver is on the way",
    group: "Transfer",
  },
  {
    id: "driver_arrived",
    label: "Driver arrived",
    customerLabel: "Your driver has arrived",
    group: "Transfer",
  },
  {
    id: "customer_picked_up",
    label: "Customer picked up",
    customerLabel: "You have been picked up",
    group: "Transfer",
  },
  {
    id: "transfer_started",
    label: "Transfer started",
    customerLabel: "On the way to your hotel",
    group: "Transfer",
  },
  {
    id: "destination_reached",
    label: "Destination reached",
    customerLabel: "You have arrived",
    group: "Transfer",
  },
  {
    id: "checked_in",
    label: "Checked in",
    customerLabel: "Checked in at your hotel",
    group: "During the trip",
  },
  {
    id: "activity_in_progress",
    label: "Activity in progress",
    customerLabel: "Your activity is under way",
    group: "During the trip",
  },
  {
    id: "activity_complete",
    label: "Activity complete",
    customerLabel: "Activity complete",
    group: "During the trip",
  },
  {
    id: "departure_transfer",
    label: "Departure transfer",
    customerLabel: "Departure transfer arranged",
    group: "Departure",
  },
  {
    id: "trip_complete",
    label: "Trip complete",
    customerLabel: "Trip complete — thank you",
    group: "Departure",
  },
] as const;

export type ProgressStage = (typeof PROGRESS_STAGES)[number]["id"];

export function stageMeta(id: string) {
  return PROGRESS_STAGES.find((s) => s.id === id) ?? null;
}

/**
 * How far along a trip is, 0–100.
 *
 * Derived from the ladder's index rather than from how many days have elapsed,
 * because a trip's days are not evenly weighted — the airport transfer on day
 * one carries most of the customer's anxiety and almost none of the duration.
 */
export function stagePercent(id: string | null | undefined): number {
  if (!id) return 0;
  const index = PROGRESS_STAGES.findIndex((s) => s.id === id);
  if (index < 0) return 0;
  return Math.round(((index + 1) / PROGRESS_STAGES.length) * 100);
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
] as const;

export type BlockKind = (typeof BLOCK_KINDS)[number];

/** What the office sees in the "add content" menu, in a sensible order. */
export const BLOCK_LABELS: Record<BlockKind, { label: string; icon: string; hint: string }> = {
  text: { label: "Text", icon: "📝", hint: "A paragraph of instructions" },
  heading: { label: "Subheading", icon: "🔠", hint: "A small heading inside a step" },
  image: { label: "Image", icon: "📷", hint: "One photo with a caption" },
  gallery: { label: "Gallery", icon: "🖼", hint: "Several photos in a grid" },
  video: { label: "Video", icon: "🎥", hint: "A short clip, e.g. how to find the driver" },
  map: { label: "Location", icon: "📍", hint: "Opens in the customer's maps app" },
  driver: { label: "Driver", icon: "🚗", hint: "Photo, vehicle, plate, call and WhatsApp" },
  hotel: { label: "Hotel", icon: "🏨", hint: "Check-in, check-out, reference" },
  flight: { label: "Flight", icon: "✈️", hint: "Flight number and times" },
  ticket: { label: "Ticket", icon: "🎟", hint: "Attraction ticket or voucher" },
  document: { label: "Document", icon: "📄", hint: "A PDF already uploaded to this trip" },
  contact: { label: "Contact", icon: "📞", hint: "A name with call and WhatsApp buttons" },
  notice: { label: "Notice", icon: "⚠️", hint: "Something they must not miss" },
  emergency: { label: "Emergency", icon: "🆘", hint: "Emergency contact panel" },
  link: { label: "Link", icon: "🔗", hint: "An external link" },
  checklist: { label: "Checklist", icon: "✅", hint: "A list of things to bring or do" },
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

export type ProgressEntry = {
  id: number;
  stage: ProgressStage;
  note: string | null;
  created_at: string;
  driver_id: string | null;
  visible: boolean;
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

export type CustomerTrip = {
  trip: Trip;
  days: Day[];
  drivers: Driver[];
  documents: TripDocument[];
  progress: ProgressEntry[];
  currentStage: ProgressStage | null;
  percent: number;
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
  current_stage: ProgressStage | null;
  current_stage_at: string | null;
  portal_opens: number;
  last_seen_at: string | null;
  day_count: number;
  published_day_count: number;
};
