import { useEffect, useId, useRef, useState } from "react";
import { BookingAutofill } from "./BookingAutofill";
import { FormatTextarea } from "./FormatTextarea";
import { HotelFinder, type PickedHotel } from "./HotelFinder";
import { Icon, type IconName } from "./Icon";
import { LocationPicker, type PickedLocation } from "./LocationPicker";
import { PhotoManager } from "./PhotoManager";
import { TransferDriverFields } from "./TransferDriverFields";
import { bookingCapabilities } from "@/lib/booking-ai";
import { nightsBetween, toIsoDate } from "@/lib/booking-fill";
import { isLatLng } from "@/lib/geo";
import { resolveMapsLink } from "@/lib/places";
import {
  saveQuickActivity,
  type QuickActivityDraft,
  type QuickActivityKind,
} from "@/lib/quick-activity";
import { uploadDirect } from "@/lib/uploads";
import type { Driver } from "@/lib/types";

/** In the order a day happens: arrive, get picked up, check in, go out with the guide. */
export const QUICK_CHOICES: {
  kind: QuickActivityKind;
  label: string;
  hint: string;
  icon: IconName;
}[] = [
  { kind: "flight", label: "Flight", hint: "Upload the e-ticket, we fill the rest", icon: "plane" },
  { kind: "transfer", label: "Transfer", hint: "Pickup, drop-off and driver", icon: "car" },
  {
    kind: "hotel",
    label: "Hotel stay",
    hint: "Paste a hotel link, we add photos and details",
    icon: "hotel",
  },
  {
    kind: "tourguide",
    label: "Tour guide",
    hint: "Guide's name, phone, languages and meeting point",
    icon: "users",
  },
  { kind: "activity", label: "Activity", hint: "Sightseeing, meals or free time", icon: "pin" },
];
const choices = QUICK_CHOICES;

/** Form inputs that are dates; a voucher's printed date is converted before it lands in one. */
const DATE_FIELDS = new Set(["date", "checkIn", "checkOut"]);

/** Hotel facts from Google that ride along with the booking but have no input of their own. */
const HOTEL_EXTRAS = [
  "hotelSummary",
  "hotelAddress",
  "hotelRating",
  "hotelReviewCount",
  "hotelWebsite",
  "hotelMapsUrl",
  "hotelSourceName",
  "hotelFetchedAt",
  "credit",
] as const;

export function QuickActivity({
  dayId,
  dayNumber,
  date,
  tripId,
  drivers,
  onSaved,
  onPendingChange,
  request,
}: {
  dayId: string;
  dayNumber: number;
  date: string | null;
  tripId: string;
  drivers: Driver[];
  onSaved: () => void | Promise<void>;
  onPendingChange?: ((pending: boolean) => void) | undefined;
  /** Open a form from outside, e.g. the day's "Hotel missing" chip. `nonce` makes repeats count. */
  request?: { kind: QuickActivityKind; nonce: number } | undefined;
}) {
  const [kind, setKind] = useState<QuickActivityKind | null>(null);
  const [message, setMessage] = useState("");
  const box = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!request) return;
    // Never replace a form that is already open; its details may be unsaved.
    setKind((current) => current ?? request.kind);
    setMessage("");
    box.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [request]);
  return (
    <section
      ref={box}
      aria-label={`Add to day ${dayNumber}`}
      className="scroll-mt-24 rounded-2xl border border-navy/15 bg-sand/40 p-4"
    >
      <div className="mb-3">
        <h3 className="font-display text-xl text-navy">Add to day {dayNumber}</h3>
        <p className="mt-1 text-xs text-muted">
          Pick what to add. Links, tickets and vouchers fill the details for you.
        </p>
      </div>
      {kind ? (
        <QuickActivityForm
          key={kind}
          kind={kind}
          tripId={tripId}
          dayId={dayId}
          date={date}
          drivers={drivers}
          onPendingChange={onPendingChange}
          onCancel={async (saveAttempted) => {
            setKind(null);
            if (saveAttempted) {
              setMessage("Review this day before adding again; some details may have saved.");
              try {
                await onSaved();
              } catch {
                setMessage("Reload this page to review any saved details before adding again.");
              }
            }
          }}
          onSaved={async () => {
            setKind(null);
            setMessage("Added to this day’s itinerary.");
            try {
              await onSaved();
            } catch {
              setMessage("Activity saved. Reload this page to see the updated itinerary.");
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {choices.map((choice) => (
            <button
              key={choice.kind}
              type="button"
              onClick={() => {
                setKind(choice.kind);
                setMessage("");
              }}
              className="rounded-xl border border-hair bg-white p-3 text-left transition hover:border-gold hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              <Icon name={choice.icon} className="mb-2 size-5 text-gold-deep" />
              <strong className="block text-sm text-navy">+ {choice.label}</strong>
              <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                {choice.hint}
              </span>
            </button>
          ))}
        </div>
      )}
      {message ? (
        <p role="status" className="mt-3 text-xs text-live">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function QuickActivityForm({
  kind,
  tripId,
  dayId,
  date,
  drivers,
  onSaved,
  onCancel,
  onPendingChange,
}: {
  kind: QuickActivityKind;
  tripId: string;
  dayId: string;
  date: string | null;
  drivers: Driver[];
  onSaved: () => void | Promise<void>;
  onCancel: (saveAttempted: boolean) => void | Promise<void>;
  onPendingChange?: ((pending: boolean) => void) | undefined;
}) {
  const id = useId();
  const requestId = useRef("");
  const [busy, setBusy] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const uploading = activeUploads > 0;
  const setUploading = (active: boolean) =>
    setActiveUploads((count) => Math.max(0, count + (active ? 1 : -1)));
  const [error, setError] = useState("");
  const [paths, setPaths] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [place, setPlace] = useState<PickedLocation>({ name: "" });
  const [dirty, setDirty] = useState(false);

  // Every input is controlled, so a hotel lookup or a voucher can fill it.
  // `initial` remembers the defaults (the day's date) so a voucher's own date
  // may replace a default the office never touched.
  const initial = useRef<Record<string, string>>(
    kind === "flight" ? { date: date ?? "" } : kind === "hotel" ? { checkIn: date ?? "" } : {},
  );
  const [values, setValues] = useState<Record<string, string>>(initial.current);
  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setDirty(true);
  };
  /** Title written by the form itself; replaced by the next suggestion unless the office edited it. */
  const autoTitle = useRef("");

  // Google facts with no input of their own (rating, summary, credit…).
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [pickedHotel, setPickedHotel] = useState("");
  const [hotelSeed, setHotelSeed] = useState("");
  const googlePaths = useRef<string[]>([]);

  const [capabilities, setCapabilities] = useState({ reader: false, hotelLookup: false });
  useEffect(() => {
    if (kind !== "hotel" && kind !== "flight") return;
    let alive = true;
    void bookingCapabilities({})
      .then((value) => {
        if (alive) setCapabilities({ reader: value.reader, hotelLookup: value.hotelLookup });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [kind]);

  const pending = dirty || busy || uploading;
  const pendingCallback = useRef(onPendingChange);
  pendingCallback.current = onPendingChange;
  useEffect(() => {
    pendingCallback.current?.(pending);
  }, [pending]);
  useEffect(() => () => pendingCallback.current?.(false), []);
  useEffect(() => {
    if (!pending) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [pending]);

  /** Suggests a title unless the office has written their own. */
  const suggestTitle = (title: string) => {
    if (!title) return;
    const previous = autoTitle.current;
    autoTitle.current = title;
    setValues((current) =>
      !current["title"] || current["title"] === previous ? { ...current, title } : current,
    );
  };

  /** The hotel chosen in the finder fills everything it knows. */
  /**
   * A pasted Google Maps link: kept as the hotel's "Map" button for the
   * customer, and read for its pin, so the day's map shows the hotel too.
   */
  const [mapsNote, setMapsNote] = useState("");
  const pinFromMapsLink = async (raw: string) => {
    const link = webAddress(raw);
    setValue("hotelMapsUrl", link);
    setMapsNote("");
    if (!link) return;
    try {
      const hit = await resolveMapsLink({ data: link });
      if (!hit.ok) return setMapsNote(hit.reason);
      setPlace((current) => ({
        name: current.name || values["name"] || hit.name || "Hotel",
        lat: hit.lat,
        lng: hit.lng,
      }));
      setMapsNote("Pin set on the map from this link.");
    } catch {
      setMapsNote(
        "Saved as the hotel's map link. The pin could not be read; set it on the map below.",
      );
    }
  };

  const applyHotel = (hotel: PickedHotel) => {
    const d = hotel.details;
    setValues((current) => ({
      ...current,
      name: d.name ?? current["name"] ?? "",
      address: d.address ?? current["address"] ?? "",
      phone: d.phone || current["phone"] || "",
      hotelWebsite: d.hotelWebsite || current["hotelWebsite"] || "",
      hotelMapsUrl: d.hotelMapsUrl || current["hotelMapsUrl"] || "",
    }));
    if (d.name) suggestTitle(`Check in at ${d.name}`);
    if (hotel.lat !== null && hotel.lng !== null && isLatLng(hotel.lat, hotel.lng)) {
      setPlace({ name: d.name ?? "", lat: hotel.lat, lng: hotel.lng });
    }
    // Replace the previous hotel's Google photos; keep anything the office uploaded.
    const previousGoogle = googlePaths.current;
    googlePaths.current = hotel.paths;
    setPaths((current) => [
      ...hotel.paths,
      ...current.filter((path) => !previousGoogle.includes(path) && !hotel.paths.includes(path)),
    ]);
    setPhotoUrls((current) => ({
      ...current,
      ...Object.fromEntries(
        hotel.paths.flatMap((path, i) => (hotel.urls[i] ? [[path, hotel.urls[i]!]] : [])),
      ),
    }));
    const next: Record<string, string> = {};
    for (const key of HOTEL_EXTRAS) {
      const value = d[key];
      if (typeof value === "string" && value) next[key] = value.slice(0, 500);
    }
    setExtras(next);
    setPickedHotel(d.name ?? "Hotel selected");
    setDirty(true);
  };

  /** A voucher or ticket was read: fill what is empty (or still a default). */
  const fillFromDocument = (fields: Record<string, string>): number => {
    const year = Number((date ?? "").slice(0, 4)) || new Date().getFullYear();
    const accepted: Record<string, string> = {};
    for (const [key, raw] of Object.entries(fields)) {
      const value = DATE_FIELDS.has(key) ? toIsoDate(raw, year) : raw.trim();
      if (value) accepted[key] = value.slice(0, 500);
    }
    const isOpen = (key: string, current: Record<string, string>) =>
      !current[key] || current[key] === initial.current[key];
    let filled = 0;
    setValues((current) => {
      const next = { ...current };
      for (const [key, value] of Object.entries(accepted)) {
        if (isOpen(key, current)) next[key] = value;
      }
      return next;
    });
    for (const key of Object.keys(accepted)) if (isOpen(key, values)) filled += 1;

    if (kind === "flight") {
      const route = [accepted["fromAirport"], accepted["toAirport"]].filter(Boolean).join(" → ");
      const number = accepted["flightNumber"];
      if (number || route) suggestTitle(["Flight", number, route].filter(Boolean).join(" · "));
      if (accepted["departTime"] && !values["time"]) setValue("time", accepted["departTime"]);
    }
    if (kind === "hotel" && accepted["name"]) {
      suggestTitle(`Check in at ${accepted["name"]}`);
      // Look the hotel up straight away, so its photos and pin follow the voucher.
      if (!pickedHotel)
        setHotelSeed([accepted["name"], accepted["address"]].filter(Boolean).join(", "));
    }
    if (filled) setDirty(true);
    return filled;
  };

  const choice = choices.find((item) => item.kind === kind)!;
  const field = (name: string, label: string, placeholder = "", type = "text") => (
    <label className="block text-xs font-semibold text-navy">
      {label}
      <input
        name={name}
        type={type}
        value={values[name] ?? ""}
        onChange={(e) => setValue(name, e.target.value)}
        placeholder={placeholder}
        maxLength={500}
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
      />
    </label>
  );
  const nights = kind === "hotel" ? nightsBetween(values["checkIn"], values["checkOut"]) : null;

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy || uploading) return;
        const form = new FormData(event.currentTarget);
        if (!requestId.current) requestId.current = crypto.randomUUID();
        const value = (name: string) => String(form.get(name) ?? "");
        const draft: QuickActivityDraft = {
          requestId: requestId.current,
          tripId,
          dayId,
          kind,
          title:
            value("title") ||
            (kind === "tourguide" && value("name") ? `Tour with ${value("name")}` : ""),
          time: value("time"),
          duration: value("duration"),
          location: place.name,
          latitude: place.lat,
          longitude: place.lng,
          description: value("description"),
          paths,
          fields: {
            ...(kind === "hotel" ? extras : {}),
            ...Object.fromEntries(
              Array.from(form.entries()).map(([key, val]) => [key, String(val)]),
            ),
          },
        };
        setBusy(true);
        setError("");
        try {
          const result = await saveQuickActivity({ data: draft });
          if (!result.ok) {
            setError(result.reason);
            setBusy(false);
            return;
          }
        } catch {
          setError(
            "We couldn’t finish saving. Your details are still here. Retry to finish this same activity without adding a duplicate; if it keeps failing, copy your text and reload the page.",
          );
          setBusy(false);
          return;
        }
        setDirty(false);
        setBusy(false);
        pendingCallback.current?.(false);
        await onSaved();
      }}
    >
      <fieldset disabled={busy || uploading} className="min-w-0">
        <legend className="mb-4 text-sm font-bold text-navy">
          New {choice.label.toLowerCase()}
        </legend>

        {kind === "hotel" || kind === "flight" ? (
          <div className="mb-5 grid gap-3">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gold-deep uppercase">
              Start here · the details fill themselves
            </p>
            {kind === "hotel" ? (
              <HotelFinder
                tripId={tripId}
                available={capabilities.hotelLookup}
                disabled={busy}
                seed={hotelSeed}
                pickedName={pickedHotel || undefined}
                onPick={applyHotel}
              />
            ) : null}
            <BookingAutofill
              tripId={tripId}
              kind={kind}
              available={capabilities.reader}
              disabled={busy}
              onRead={fillFromDocument}
            />
          </div>
        ) : null}

        <label className="block text-xs font-semibold text-navy">
          Title{" "}
          <span className="text-muted">
            {kind === "tourguide" ? "(optional: “Tour with <guide>” if empty)" : "(required)"}
          </span>
          <input
            name="title"
            required={kind !== "tourguide"}
            maxLength={200}
            autoFocus={kind !== "hotel" && kind !== "flight"}
            value={values["title"] ?? ""}
            onChange={(e) => setValue("title", e.target.value)}
            placeholder={
              kind === "hotel"
                ? "Check in at your hotel"
                : kind === "flight"
                  ? "Flight to Dubai"
                  : kind === "transfer"
                    ? "Airport pickup"
                    : kind === "tourguide"
                      ? "Old city walking tour"
                      : "Explore the old town"
            }
            className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {field("time", "Timeline time", "09:00, or on arrival")}
          {field("duration", "Duration", "About 1 hour")}
        </div>
        {kind !== "activity" ? (
          <div className="mt-4 rounded-xl border border-hair bg-white/70 p-3">
            <p className="mb-3 text-xs font-bold text-navy">{choice.label} details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {kind === "flight" ? (
                <>
                  {field("airline", "Airline", "Emirates")}
                  {field("flightNumber", "Flight number", "EK 500")}
                  {field("date", "Flight date", "", "date")}
                  {field("reference", "Booking reference")}
                  {field("fromAirport", "From airport", "DXB · Dubai")}
                  {field("toAirport", "To airport", "BOM · Mumbai")}
                  {field("departTime", "Departure · local time", "10:30")}
                  {field("arriveTime", "Arrival · local time", "15:00")}
                  {field("terminal", "Terminal")}
                  {field("seat", "Seat", "12A")}
                  {field("baggage", "Baggage allowance", "23 kg per person")}
                </>
              ) : kind === "hotel" ? (
                <>
                  {field("name", "Hotel name", "Full property name")}
                  {field("address", "Hotel address", "Street and city")}
                  {field("checkIn", "Check-in date", "", "date")}
                  {field("checkInTime", "Check-in time", "14:00")}
                  <div>
                    {field("checkOut", "Check-out date", "", "date")}
                    {nights ? (
                      <p className="mt-1 text-[11px] font-semibold text-live">
                        {nights} night{nights === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>
                  {field("checkOutTime", "Check-out time", "12:00")}
                  {field("roomType", "Room / meal plan", "Deluxe room · breakfast included")}
                  {field("rooms", "Number of rooms", "2")}
                  {field("guests", "Guests", "2 adults")}
                  {field("confirmationNumber", "Hotel confirmation number", "From the hotel")}
                  {field("reference", "Booking reference", "Your booking / voucher number")}
                  {field("phone", "Hotel phone", "+971…", "tel")}
                  <label className="block text-xs font-semibold text-navy">
                    Hotel website
                    <input
                      name="hotelWebsite"
                      value={values["hotelWebsite"] ?? ""}
                      onChange={(e) => setValue("hotelWebsite", e.target.value)}
                      onBlur={(e) => setValue("hotelWebsite", webAddress(e.target.value))}
                      placeholder="https://www.ihg.com/…"
                      maxLength={500}
                      className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-navy">
                    Hotel location · Google Maps link
                    <input
                      name="hotelMapsUrl"
                      value={values["hotelMapsUrl"] ?? ""}
                      onChange={(e) => setValue("hotelMapsUrl", e.target.value)}
                      onBlur={(e) => void pinFromMapsLink(e.target.value)}
                      placeholder="https://maps.app.goo.gl/…"
                      maxLength={500}
                      className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
                    />
                    {mapsNote ? (
                      <span className="mt-1 block text-[11px] font-normal text-muted">
                        {mapsNote}
                      </span>
                    ) : null}
                  </label>
                </>
              ) : kind === "tourguide" ? (
                <>
                  <label className="block text-xs font-semibold text-navy">
                    Guide’s name <span className="text-muted">(required)</span>
                    <input
                      name="name"
                      required
                      maxLength={500}
                      value={values["name"] ?? ""}
                      onChange={(e) => setValue("name", e.target.value)}
                      placeholder="Mr Ahmed Karimi"
                      className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
                    />
                  </label>
                  {field("languages", "Languages", "English, Arabic, Urdu")}
                  {field("phone", "Phone", "+971…", "tel")}
                  {field("whatsapp", "WhatsApp (if different)", "+971…", "tel")}
                  <label className="block text-xs font-semibold text-navy sm:col-span-2">
                    Meeting instructions
                    <FormatTextarea
                      name="text"
                      rows={2}
                      maxLength={2000}
                      value={values["text"] ?? ""}
                      onChange={(e) => setValue("text", e.target.value)}
                      placeholder="Your guide waits in the hotel lobby at 09:00 holding a Nawi Saadi sign."
                      className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
                    />
                  </label>
                </>
              ) : (
                <>
                  {field("pickupTime", "Pickup time", "Same as timeline time if blank")}
                  {field("pickupLocation", "Meeting point", "Terminal 3, arrivals exit")}
                  {field("dropoffLocation", "Drop-off", "Hotel name and address")}
                  <label className="block text-xs font-semibold text-navy">
                    Driver
                    <select
                      name="driverId"
                      className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal"
                    >
                      <option value="">Assign later</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.full_name}
                          {driver.vehicle ? ` · ${driver.vehicle}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  {field("transferNotes", "Meeting instructions", "Look for your name on the sign")}
                  <TransferDriverFields
                    tripId={tripId}
                    values={values}
                    set={(patch) => {
                      setValues((current) => {
                        const next = { ...current };
                        for (const [key, value] of Object.entries(patch)) next[key] = value ?? "";
                        return next;
                      });
                      setDirty(true);
                    }}
                    onBusy={setUploading}
                  />
                </>
              )}
            </div>
            {kind === "hotel" && extras["hotelSummary"] ? (
              <p className="mt-3 rounded-lg bg-paper p-3 text-xs leading-relaxed text-muted">
                <strong className="text-navy">About the hotel · </strong>
                {extras["hotelSummary"]}
                {extras["hotelRating"] ? ` · ★ ${extras["hotelRating"]}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-3">
          <LocationPicker
            value={place}
            onChange={(next) => {
              setPlace(next);
              setDirty(true);
            }}
          />
        </div>
        <label
          htmlFor={`${id}-instructions`}
          className="mt-4 block text-xs font-semibold text-navy"
        >
          Plan and instructions · one point per line
        </label>
        <FormatTextarea
          id={`${id}-instructions`}
          name="description"
          rows={4}
          maxLength={6000}
          placeholder={
            kind === "hotel"
              ? "Show your passport at reception\nBreakfast is served 7–10 am in the main restaurant\nCheck-out is at 12:00"
              : kind === "flight"
                ? "Be at the airport 3 hours before departure\nOnline check-in opens 48 hours before\nKeep your passport in your hand luggage"
                : "Meet in the hotel lobby\nVisit the waterfront\nFree time for lunch"
          }
          className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </fieldset>
      <details
        className="mt-3 rounded-xl border border-hair bg-white p-3"
        open={kind === "hotel" && paths.length > 0 ? true : undefined}
      >
        <summary className="cursor-pointer text-xs font-semibold text-navy">
          {kind === "hotel"
            ? "Hotel photos"
            : kind === "tourguide"
              ? "Photos of the tour or the guide"
              : "Photos for this activity"}{" "}
          {paths.length ? `· ${paths.length}` : "(optional)"}
        </summary>
        <div className="mt-3">
          <PhotoManager
            linkFolder={tripId}
            paths={paths}
            urls={photoUrls}
            disabled={busy}
            onBusy={setUploading}
            onChange={(next) => {
              setPaths(next);
              setDirty(true);
            }}
            onUpload={async (file, onProgress) => {
              const result = await uploadDirect(file, {
                folder: tripId,
                bucket: "trip-media",
                ...(onProgress ? { onProgress } : {}),
              });
              if (!result.ok) throw new Error(result.reason);
              return result.path;
            }}
          />
          {kind === "hotel" && extras["credit"] ? (
            <p className="mt-2 text-[10px] text-muted">{extras["credit"]}</p>
          ) : null}
        </div>
      </details>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-alert/8 p-3 text-xs leading-relaxed text-alert"
        >
          {error}
          {error.includes("sign-in expired") ? (
            <a href="/admin" target="_blank" rel="noopener noreferrer" className="ml-2 underline">
              Sign in in a new tab
            </a>
          ) : null}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || uploading}
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : uploading ? "Uploading photos…" : "Add to itinerary"}
        </button>
        <button
          type="button"
          disabled={busy || uploading}
          onClick={() => {
            const saveAttempted = Boolean(requestId.current);
            const prompt = saveAttempted
              ? "Some details may already have saved. Close and review this day before adding again?"
              : "Discard this activity’s unsaved details?";
            if (!dirty || window.confirm(prompt)) {
              setDirty(false);
              pendingCallback.current?.(false);
              void onCancel(saveAttempted);
            }
          }}
          className="rounded-xl border border-hair bg-white px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-50"
        >
          Cancel
        </button>
        <span className="text-[11px] text-muted">Appears in this day’s timeline after saving.</span>
      </div>
    </form>
  );
}

/** "www.hotel.com" → "https://www.hotel.com"; empty stays empty; a full address is kept. */
function webAddress(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  return /^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`;
}
