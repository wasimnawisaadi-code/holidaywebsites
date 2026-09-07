/**
 * Google Ads conversion tracking.
 *
 * What was here before: nothing. The site loaded a GTM container and a GA4
 * property, and Google Ads had no tag on the page at all — no `AW-` config, no
 * conversion event, no click-id capture. A campaign could spend its whole
 * budget and Ads would report zero conversions, because nothing on the site
 * ever told it one had happened. Smart bidding cannot learn from that, and
 * neither can a human reading the reports.
 *
 * There is a second, subtler failure this file fixes. `gtag('event', ...)`
 * pushes an `arguments` object into dataLayer — an array-like `["event",
 * "whatsapp_click", {...}]`. GTM's Custom Event trigger matches a plain object
 * carrying an `event` key, which that is not. So the container that was
 * already loading on every page had no way to fire an Ads conversion tag off a
 * WhatsApp click even if someone had built one. Every event now goes into
 * dataLayer in the shape GTM can actually trigger on.
 *
 * Two routes to Google Ads are supported, and only one should be switched on:
 *
 *   1. Direct gtag (the default). Set ADS_ID and the labels below. The
 *      conversion fires from this code, with no GTM console work.
 *   2. GTM. Leave ADS_ID empty and build Conversion Linker + Google Ads
 *      Conversion tags in the container, triggered off the `ns_*` dataLayer
 *      events this file pushes.
 *
 * Running both double-counts every conversion, which inflates the numbers
 * bidding optimises against. `adsId()` returning null is what keeps route 1
 * off, so the guard is a single check rather than a convention to remember.
 */

/**
 * Google Ads customer tag, `AW-XXXXXXXXXX`.
 *
 * Empty until the account is created — Google issues it on the conversion
 * action screen. Nothing Ads-related runs while this is empty, so the site is
 * safe to deploy in this state; it simply reports no conversions, which is
 * exactly what it did before.
 *
 * Committed rather than env-only because it is public by design (it is in the
 * page source of every site running Ads), and because a value that lives in
 * one file cannot be lost by a Vercel environment being re-created. An env
 * override still wins, for a test account.
 */
const ADS_ID = "";

/**
 * Conversion labels, one per action created in Google Ads.
 *
 * Ads shows these as `AW-123456789/AbC-D_efGh12_34-567`. Paste only the part
 * after the slash. An empty label means that conversion is not reported yet —
 * it is skipped silently rather than firing a malformed `send_to`, which Ads
 * discards without telling anyone.
 */
const ADS_LABELS: Record<ConversionAction, string> = {
  whatsapp_lead: "",
  phone_lead: "",
  form_lead: "",
  email_lead: "",
  subscribe: "",
  itinerary_download: "",
};

export type ConversionAction =
  "whatsapp_lead" | "phone_lead" | "form_lead" | "email_lead" | "subscribe" | "itinerary_download";

/**
 * What each conversion is worth, in AED.
 *
 * These are deliberately proxies, not revenue. Nobody books on this site — the
 * sale closes over WhatsApp or in the Deira office days later — so there is no
 * true transaction value to send at the moment of conversion. What Ads needs
 * is a consistent *relative* weighting, so that it learns a completed contact
 * form is worth more attention than a newsletter signup.
 *
 * The ratios below say: a form enquiry that includes a phone number is the
 * most valuable thing a visitor can do, a WhatsApp or phone click is close
 * behind, and an email subscribe is a weak signal worth keeping but not worth
 * bidding hard for.
 *
 * These should be re-based on real numbers once the office has counted how
 * many WhatsApp enquiries turn into bookings and what the average margin is.
 * Until then they are honest guesses and are labelled as such — do not read
 * the "conversion value" column in Ads as revenue.
 */
const CONVERSION_VALUES: Record<ConversionAction, number> = {
  form_lead: 150,
  whatsapp_lead: 100,
  phone_lead: 100,
  email_lead: 60,
  itinerary_download: 30,
  subscribe: 10,
};

export const CONVERSION_CURRENCY = "AED";

/** Reads the tag id, env override first. Null disables the direct gtag route. */
export function adsId(): string | null {
  const build = import.meta.env["VITE_ADS_ID"] as string | undefined;
  const env = typeof process !== "undefined" ? process.env : undefined;
  const id = build || env?.["ADS_ID"] || ADS_ID;
  return id && id.trim() ? id.trim() : null;
}

/** `AW-123/label` for one action, or null when the action is not configured. */
export function sendTo(action: ConversionAction): string | null {
  const id = adsId();
  const label = ADS_LABELS[action];
  if (!id || !label) return null;
  return `${id}/${label}`;
}

export function conversionValue(action: ConversionAction): number {
  return CONVERSION_VALUES[action] ?? 0;
}

// ---------------------------------------------------------------------------
// Click id capture
// ---------------------------------------------------------------------------

/**
 * Why the click id is stored rather than read at conversion time.
 *
 * A visitor lands on `/holidays/maldives-overwater?gclid=abc`, reads for four
 * minutes, clicks through to `/contact`, and submits the form there. By then
 * the URL carries no gclid — it was on the landing page and nowhere since. Any
 * code that looks for it at the moment of conversion finds nothing.
 *
 * That matters for one specific and valuable thing: offline conversion import.
 * This agency's real conversion is not the WhatsApp click, it is the booking
 * that closes days later over chat. Uploading those back to Ads requires the
 * gclid of the click that produced the lead, and the only chance to capture it
 * is the moment the visitor arrives. Stored on the lead row, it turns a
 * WhatsApp enquiry into a traceable sale weeks after the fact.
 *
 * 90 days, because that is the Google Ads click-to-conversion window for
 * offline import. A click id older than that is rejected on upload, so keeping
 * it longer only invites a confusing failure.
 */
const CLICK_STORE_KEY = "ns-click-attribution";
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export type ClickAttribution = {
  /** Google Ads click id, on a normal search or shopping click. */
  gclid?: string;
  /** iOS web-to-app click id; replaces gclid when Safari ITP applies. */
  gbraid?: string;
  /** App-to-web click id. Present instead of gclid for some placements. */
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** The keyword Ads matched, when {keyword} is in the tracking template. */
  keyword?: string;
  /** The page the ad click landed on — which ad group sent them where. */
  landing_page?: string;
  /** Epoch ms, so the 90-day window can be enforced on read. */
  captured_at?: number;
};

const CLICK_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "keyword",
] as const;

/**
 * Records the ad click that started this visit, if there was one.
 *
 * Called once from the analytics tracker on mount. Deliberately does not
 * overwrite an existing record with an empty one: a visitor who arrives from
 * an ad and then navigates for ten minutes must keep the gclid from the click
 * that paid for them, not lose it to the next page load.
 *
 * A *new* ad click does overwrite, because the most recent paid click is the
 * one Ads will attribute against.
 */
export function captureClickIds(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: ClickAttribution = {};
    for (const key of CLICK_PARAMS) {
      const value = params.get(key);
      // 512 is well beyond any real gclid and stops a crafted URL from
      // filling localStorage.
      if (value) found[key] = value.slice(0, 512);
    }
    if (Object.keys(found).length === 0) return;

    found.landing_page = window.location.pathname.slice(0, 200);
    found.captured_at = Date.now();
    window.localStorage.setItem(CLICK_STORE_KEY, JSON.stringify(found));
  } catch {
    /* private mode, blocked storage, malformed URL — never worth a throw */
  }
}

/** The stored attribution, or null when there is none or it has expired. */
export function storedClickIds(): ClickAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLICK_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClickAttribution;
    if (!parsed.captured_at || Date.now() - parsed.captured_at > NINETY_DAYS_MS) {
      window.localStorage.removeItem(CLICK_STORE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** True when this visit, or a recent one, came from a paid Google click. */
export function fromPaidClick(): boolean {
  const stored = storedClickIds();
  return Boolean(stored?.gclid || stored?.gbraid || stored?.wbraid);
}

// ---------------------------------------------------------------------------
// dataLayer
// ---------------------------------------------------------------------------

type DataLayerObject = Record<string, unknown>;

function dataLayer(): DataLayerObject[] | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { dataLayer?: DataLayerObject[] };
  // Created if absent rather than skipped. GTM's own snippet creates it, but
  // an event fired before gtm.js has parsed would otherwise be dropped; GTM
  // replays whatever is already in the array when it initialises.
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  return w.dataLayer;
}

/**
 * Pushes an event GTM can trigger on.
 *
 * Namespaced `ns_` so the container's triggers cannot be confused by GA4's own
 * automatic pushes, and so someone opening the GTM console can see at a glance
 * which events come from this site's code.
 */
export function pushEvent(name: string, params: DataLayerObject = {}): void {
  try {
    dataLayer()?.push({ event: `ns_${name}`, ...params });
  } catch {
    /* measurement must never break the page */
  }
}

// ---------------------------------------------------------------------------
// Enhanced conversions
// ---------------------------------------------------------------------------

/**
 * Hands Google the identity a lead gave us, so a conversion can be matched to
 * the click even when cookies were not available.
 *
 * This is the single highest-leverage setting for a lead-generation account on
 * a small budget: it recovers conversions that would otherwise go unattributed
 * on iOS and in any browser blocking third-party storage. With a budget of a
 * few clicks a day, losing a third of the conversion signal is the difference
 * between bidding on data and bidding on noise.
 *
 * gtag hashes these with SHA-256 in the browser before anything is sent — the
 * raw address never reaches Google. That is a property of the tag, not a claim
 * this comment can enforce, which is why only fields the visitor deliberately
 * typed into an enquiry form are passed, and never anything inferred.
 *
 * Phone numbers must be E.164 or Google discards the match silently.
 */
export function setUserData(identity: {
  email?: string | null | undefined;
  phone?: string | null | undefined;
}): void {
  if (typeof window === "undefined") return;
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g !== "function") return;

    const data: Record<string, string> = {};
    const email = identity.email?.trim().toLowerCase();
    // Placeholder addresses are minted by the forms when a visitor gives only
    // a phone number (`custom-tour-1712...@lead.nawisaadiholidays.com`). They
    // match nothing and would only dilute the signal.
    if (
      email &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
      !email.endsWith("@lead.nawisaadiholidays.com")
    ) {
      data["email"] = email;
    }
    const phone = normalisePhone(identity.phone);
    if (phone) data["phone_number"] = phone;

    if (Object.keys(data).length === 0) return;
    g("set", "user_data", data);
  } catch {
    /* never let measurement break a form submission */
  }
}

/**
 * Best-effort E.164.
 *
 * The enquiry forms accept whatever someone types, and in the UAE that is
 * usually a local `05x` number. Google needs a country code, and a number
 * without one is dropped rather than guessed at on their side — so the common
 * UAE shapes are normalised here and anything genuinely ambiguous is returned
 * as null rather than mangled into a wrong number.
 */
function normalisePhone(input?: string | null): string | null {
  if (!input) return null;
  const digits = input.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits.length >= 8 ? digits : null;
  // 00971... — the international prefix used across the Gulf.
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  // 971561228069
  if (digits.startsWith("971")) return `+${digits}`;
  // 0561228069 -> +971561228069. Only for the UAE mobile shape; a bare
  // 9-or-fewer-digit string could be anything and is left alone.
  if (digits.startsWith("05") && digits.length === 10) return `+971${digits.slice(1)}`;
  return null;
}

// ---------------------------------------------------------------------------
// Reporting a conversion
// ---------------------------------------------------------------------------

/**
 * One gesture, one conversion.
 *
 * The "Send brief on WhatsApp" button on /customized-tours writes a lead row
 * *and* opens WhatsApp. That is a single decision by a single visitor, but it
 * travels through two independent code paths and would report two Ads
 * conversions — a form_lead and a whatsapp_lead — from one click. Bidding
 * would then see roughly double the leads that exist on the pages that happen
 * to do both, and shift budget towards them for no reason.
 *
 * A short window is the right shape of fix because the ambiguity is genuinely
 * temporal: two lead actions from one human 1.5 seconds apart is not a thing
 * that happens, while two code paths reacting to one click within the same
 * frame is routine.
 */
const CONVERSION_GAP_MS = 1500;
let lastConversionAt = 0;

/**
 * Fires one Google Ads conversion.
 *
 * No-ops when the tag or the label is unset, which is the state the site ships
 * in until the Ads account exists. Wrapped, because a conversion that throws
 * would take the click handler — and therefore the visitor's WhatsApp
 * message — down with it.
 */
export function reportConversion(action: ConversionAction, extra: DataLayerObject = {}): void {
  if (typeof window === "undefined") return;
  const target = sendTo(action);
  if (!target) return;

  const now = Date.now();
  if (now - lastConversionAt < CONVERSION_GAP_MS) return;
  lastConversionAt = now;

  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g !== "function") return;
    g("event", "conversion", {
      send_to: target,
      value: conversionValue(action),
      currency: CONVERSION_CURRENCY,
      // Deduplicates a conversion counted twice — a double-clicked WhatsApp
      // button, or a form resubmitted after a back-navigation.
      transaction_id: `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...extra,
    });
  } catch {
    /* see above */
  }
}
