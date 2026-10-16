import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { LocationPicker, type PickedLocation } from "./LocationPicker";
import { PhotoManager } from "./PhotoManager";
import {
  saveQuickActivity,
  type QuickActivityDraft,
  type QuickActivityKind,
} from "@/lib/quick-activity";
import { uploadDirect } from "@/lib/uploads";
import type { Driver } from "@/lib/types";

const choices: { kind: QuickActivityKind; label: string; hint: string; icon: IconName }[] = [
  { kind: "activity", label: "Activity", hint: "Sightseeing, meals or free time", icon: "pin" },
  { kind: "flight", label: "Flight", hint: "Route, times and booking", icon: "plane" },
  { kind: "hotel", label: "Hotel stay", hint: "Check-in and room details", icon: "hotel" },
  { kind: "transfer", label: "Transfer", hint: "Pickup, drop-off and driver", icon: "car" },
];

export function QuickActivity({
  dayId,
  dayNumber,
  date,
  tripId,
  drivers,
  onSaved,
  onPendingChange,
}: {
  dayId: string;
  dayNumber: number;
  date: string | null;
  tripId: string;
  drivers: Driver[];
  onSaved: () => void | Promise<void>;
  onPendingChange?: ((pending: boolean) => void) | undefined;
}) {
  const [kind, setKind] = useState<QuickActivityKind | null>(null);
  const [message, setMessage] = useState("");
  return (
    <section
      aria-label={`Add to day ${dayNumber}`}
      className="mb-5 rounded-2xl border border-navy/15 bg-sand/40 p-4"
    >
      <div className="mb-3">
        <h3 className="font-display text-xl text-navy">Build day {dayNumber}</h3>
        <p className="mt-1 text-xs text-muted">
          Choose what happens next. Add the time, details and photos in one place.
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [paths, setPaths] = useState<string[]>([]);
  const [place, setPlace] = useState<PickedLocation>({ name: "" });
  const [dirty, setDirty] = useState(false);
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
  const choice = choices.find((item) => item.kind === kind)!;
  const field = (name: string, label: string, placeholder = "", type = "text", value?: string) => (
    <label className="block text-xs font-semibold text-navy">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        maxLength={500}
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
      />
    </label>
  );
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
          title: value("title"),
          time: value("time"),
          duration: value("duration"),
          location: place.name,
          latitude: place.lat,
          longitude: place.lng,
          description: value("description"),
          paths,
          fields: Object.fromEntries(
            Array.from(form.entries()).map(([key, val]) => [key, String(val)]),
          ),
        };
        setBusy(true);
        setError("");
        try {
          await saveQuickActivity({ data: draft });
        } catch {
          setError(
            "We couldn’t finish saving. Your details are still here. Retry to finish this same activity without adding a duplicate.",
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
        <label className="block text-xs font-semibold text-navy">
          Title <span className="text-muted">(required)</span>
          <input
            name="title"
            required
            maxLength={200}
            autoFocus
            placeholder={
              kind === "hotel"
                ? "Check in at your hotel"
                : kind === "flight"
                  ? "Flight to Dubai"
                  : kind === "transfer"
                    ? "Airport pickup"
                    : "Explore the old town"
            }
            className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-gold"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {field("time", "Timeline time", "09:00, or on arrival")}
          {field("duration", "Duration", "About 1 hour")}
        </div>
        <div className="mt-3">
          <LocationPicker
            value={place}
            onChange={(next) => {
              setPlace(next);
              setDirty(true);
            }}
          />
        </div>
        {kind !== "activity" ? (
          <div className="mt-4 rounded-xl border border-hair bg-white/70 p-3">
            <p className="mb-3 text-xs font-bold text-navy">{choice.label} details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {kind === "flight" ? (
                <>
                  {field("airline", "Airline", "Emirates")}
                  {field("flightNumber", "Flight number", "EK 500")}
                  {field("date", "Flight date", "", "date", date ?? "")}
                  {field("reference", "Booking reference")}
                  {field("fromAirport", "From airport", "DXB · Dubai")}
                  {field("toAirport", "To airport", "BOM · Mumbai")}
                  {field("departTime", "Departure · local time", "10:30")}
                  {field("arriveTime", "Arrival · local time", "15:00")}
                  {field("terminal", "Terminal")}
                  {field("baggage", "Baggage allowance", "23 kg per person")}
                </>
              ) : kind === "hotel" ? (
                <>
                  {field("name", "Hotel name", "Full property name")}
                  {field("address", "Hotel address", "Street and city")}
                  {field("checkIn", "Check-in", "", "date", date ?? "")}
                  {field("checkOut", "Check-out", "", "date")}
                  {field("roomType", "Room / meal plan", "Deluxe room · breakfast included")}
                  {field("guests", "Guests", "2 adults")}
                  {field("reference", "Booking reference")}
                  {field("phone", "Hotel phone", "+971…", "tel")}
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
                </>
              )}
            </div>
          </div>
        ) : null}
        <label
          htmlFor={`${id}-instructions`}
          className="mt-4 block text-xs font-semibold text-navy"
        >
          Plan and instructions · one point per line
        </label>
        <textarea
          id={`${id}-instructions`}
          name="description"
          rows={4}
          maxLength={6000}
          placeholder={"Meet in the hotel lobby\nVisit the waterfront\nFree time for lunch"}
          className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </fieldset>
      <details className="mt-3 rounded-xl border border-hair bg-white p-3">
        <summary className="cursor-pointer text-xs font-semibold text-navy">
          Photos for this activity {paths.length ? `· ${paths.length}` : "(optional)"}
        </summary>
        <div className="mt-3">
          <PhotoManager
            paths={paths}
            urls={{}}
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
        </div>
      </details>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-alert/8 p-3 text-xs leading-relaxed text-alert"
        >
          {error}
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
