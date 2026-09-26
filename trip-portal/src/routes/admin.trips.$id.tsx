import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

import type { Json } from "@/lib/views";
import {
  BLOCK_KINDS,
  BLOCK_LABELS,
  stageMeta,
  type Block,
  type BlockKind,
  type BlockPayload,
  type Day,
  type Driver,
  type ProgressEntry,
  type Step,
  type Trip,
  type TripDocument,
} from "@/lib/types";

/**
 * The itinerary editor — the page builder the office uses instead of ringing a
 * developer.
 *
 * Structure mirrors how a travel day is actually described on the phone:
 *
 *     Day 1  →  Step 1 "Airport arrival"  →  blocks (text, photo, video, map…)
 *                Step 2 "Meet your driver" →  blocks (driver card, video…)
 *
 * The day/step split is what makes reordering tractable: a day is reshuffled by
 * moving three steps, not fourteen loose blocks. Content lives in blocks so a
 * new kind of content never needs a migration.
 */

/* -------------------------------------------------------------------------
 * Server functions. Each re-checks the session — see the note in admin.tsx.
 * ---------------------------------------------------------------------- */

async function requireSession(): Promise<{ email: string }> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
  const session = await sessionFromToken(getCookie(SESSION_COOKIE));
  if (!session) throw new Error("Not signed in.");
  return { email: session.email };
}

const loadTrip = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireSession();
    const { tripForAdmin } = await import("@/lib/trips");
    const { viewsForTrip, auditForTrip } = await import("@/lib/views");
    const { portalBaseUrl } = await import("@/lib/urls");

    const trip = await tripForAdmin(id);
    if (!trip) return null;
    return {
      ...trip,
      views: await viewsForTrip(id, 60),
      audit: await auditForTrip(id, 40),
      base: portalBaseUrl(),
    };
  });

const saveDay = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      tripId: string;
      dayNumber: number;
      title: string;
      date: string;
      summary: string;
      published: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { insert, update } = await import("@/lib/db");
    const row = {
      trip_id: data.tripId,
      day_number: data.dayNumber,
      title: data.title.trim() || `Day ${data.dayNumber}`,
      // An empty date string is not a null date. PostgREST rejects "" for a
      // date column with a 400, which surfaced as "save did nothing" — the
      // office would edit a day, press save, and watch it silently fail.
      date: data.date || null,
      summary: data.summary.trim() || null,
      published: data.published,
    };
    if (data.id) await update("trip_days", `id=eq.${data.id}`, row);
    else await insert("trip_days", row);
    return { ok: true as const };
  });

const saveStep = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      dayId: string;
      stepNumber: number;
      title: string;
      description: string;
      timeLabel: string;
      duration: string;
      locationName: string;
      latitude: string;
      longitude: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { insert, update } = await import("@/lib/db");

    // Coordinates arrive as strings from a text input. Number("") is 0, which
    // would silently drop a pin in the Gulf of Guinea, so an empty field has to
    // become null rather than a number.
    const num = (v: string): number | null => {
      const t = v.trim();
      if (!t) return null;
      const n = Number(t);
      return Number.isFinite(n) ? n : null;
    };

    const row = {
      trip_day_id: data.dayId,
      step_number: data.stepNumber,
      title: data.title.trim() || `Step ${data.stepNumber}`,
      description: data.description.trim() || null,
      time_label: data.timeLabel.trim() || null,
      duration: data.duration.trim() || null,
      location_name: data.locationName.trim() || null,
      latitude: num(data.latitude),
      longitude: num(data.longitude),
    };
    if (data.id) await update("trip_steps", `id=eq.${data.id}`, row);
    else await insert("trip_steps", row);
    return { ok: true as const };
  });

const saveBlock = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      stepId: string;
      position: number;
      kind: string;
      payload: Record<string, unknown>;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { insert, update } = await import("@/lib/db");

    // Strip the render-time fields before writing. `url`, `urls` and `posterUrl`
    // are signed URLs resolved on read; persisting them would store a link that
    // expires in six hours and then serve it to a customer forever.
    const clean = { ...data.payload };
    delete clean["url"];
    delete clean["urls"];
    delete clean["posterUrl"];

    const row = {
      trip_step_id: data.stepId,
      position: data.position,
      kind: data.kind,
      payload: clean,
    };
    if (data.id) await update("trip_blocks", `id=eq.${data.id}`, row);
    else await insert("trip_blocks", row);
    return { ok: true as const };
  });

const deleteRow = createServerFn({ method: "POST" })
  .validator((input: { table: string; id: string }) => input)
  .handler(async ({ data }) => {
    await requireSession();
    // An allowlist, not the caller's string. Without it this endpoint deletes
    // any row in any table for anyone who can reach it — including `trips`
    // itself, which cascades away a customer's whole itinerary.
    const allowed = ["trip_days", "trip_steps", "trip_blocks", "trip_documents"];
    if (!allowed.includes(data.table)) return { ok: false as const };
    const { remove } = await import("@/lib/db");
    await remove(data.table, `id=eq.${data.id}`);
    return { ok: true as const };
  });

/**
 * Media upload.
 *
 * Takes FormData so the file never round-trips through base64 in JSON, which
 * would inflate a 40MB video to 54MB and blow the serverless body limit.
 */
const uploadFile = createServerFn({ method: "POST" })
  .validator((form: FormData) => form)
  .handler(async ({ data: form }) => {
    await requireSession();
    const { uploadObject, insert } = await import("@/lib/db");

    const file = form.get("file");
    const tripId = String(form.get("tripId") ?? "");
    const bucket = String(form.get("bucket") ?? "trip-media") as "trip-media" | "trip-docs";
    if (!(file instanceof File) || !tripId) {
      return { ok: false as const, reason: "No file received." };
    }

    // The stored name is sanitised rather than trusted. A filename carrying a
    // slash would write outside the trip's prefix, and one carrying spaces or
    // Arabic characters breaks the signed-URL path.
    const safe = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(-80);
    const path = `${tripId}/${Date.now()}-${safe}`;

    const result = await uploadObject(
      bucket,
      path,
      await file.arrayBuffer(),
      file.type || "application/octet-stream",
    );
    if (!result.ok) return { ok: false as const, reason: result.error ?? "Upload failed." };

    // A document also gets a row, so it can be attached to a block by name and
    // listed in the customer's Documents section.
    if (bucket === "trip-docs") {
      const rows = await insert<{ id: string }[]>("trip_documents", {
        trip_id: tripId,
        name: file.name.slice(0, 120),
        file_path: path,
        doc_type: file.type.includes("pdf") ? "PDF" : "Image",
        visibility: "always",
        bytes: file.size,
      });
      return { ok: true as const, path, documentId: rows?.[0]?.id ?? null };
    }

    return { ok: true as const, path, documentId: null };
  });

/* -------------------------------------------------------------------------
 * Route
 * ---------------------------------------------------------------------- */

export const Route = createFileRoute("/admin/trips/$id")({
  loader: async ({ params }) => {
    const data = await loadTrip({ data: params.id });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    // Cast because the loader throws notFound() on a missing trip, which widens
    // loaderData to {} at the type level even though it is this shape whenever
    // head() actually runs.
    meta: [
      {
        title: `${(loaderData as LoaderData | undefined)?.trip.trip_code ?? "Trip"} · Nawi Saadi operations`,
      },
    ],
  }),
  component: Editor,
});

type LoaderData = {
  trip: Trip;
  days: Day[];
  documents: TripDocument[];
  progress: ProgressEntry[];
  drivers: Driver[];
  views: { id: number; created_at: string; event: string; detail: string | null }[];
  audit: {
    id: number;
    created_at: string;
    table_name: string;
    action: string;
    changes: Record<string, Json>;
    actor: string | null;
  }[];
  base: string;
};

function Editor() {
  const data = Route.useLoaderData() as LoaderData;
  const { trip, days, documents, drivers, progress, views, audit, base } = data;
  const router = useRouter();
  const refresh = () => router.invalidate();

  const [tab, setTab] = useState<"itinerary" | "documents" | "activity">("itinerary");
  const url = `${base}/t/${trip.tracking_token}`;

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-navy px-5 py-4 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
          <div className="min-w-0">
            <Link to="/admin" className="text-[11px] text-gold">
              ← All trips
            </Link>
            <h1 className="mt-1 truncate font-display text-xl leading-tight">
              {trip.customer?.full_name ?? trip.destination}
            </h1>
            <p className="font-mono text-[11px] text-white/65">
              {trip.trip_code} · {trip.start_date} → {trip.end_date}
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto rounded-lg bg-gold px-4 py-2 text-xs font-bold text-navy"
          >
            Preview as customer
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <nav className="flex gap-1 rounded-xl border border-hair bg-white p-1">
          {(
            [
              ["itinerary", `Itinerary (${days.length} days)`],
              ["documents", `Documents (${documents.length})`],
              ["activity", "Activity & history"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                tab === id ? "bg-navy text-white" : "text-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "itinerary" ? (
          <ItineraryTab
            trip={trip}
            days={days}
            drivers={drivers}
            documents={documents}
            onChange={refresh}
          />
        ) : null}

        {tab === "documents" ? (
          <DocumentsTab trip={trip} documents={documents} onChange={refresh} />
        ) : null}

        {tab === "activity" ? (
          <ActivityTab views={views} audit={audit} progress={progress} />
        ) : null}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Itinerary
 * ---------------------------------------------------------------------- */

function ItineraryTab({
  trip,
  days,
  drivers,
  documents,
  onChange,
}: {
  trip: Trip;
  days: Day[];
  drivers: Driver[];
  documents: TripDocument[];
  onChange: () => void;
}) {
  const [addingDay, setAddingDay] = useState(false);

  return (
    <div className="mt-5 flex flex-col gap-4">
      {days.map((day) => (
        <DayCard
          key={day.id}
          trip={trip}
          day={day}
          drivers={drivers}
          documents={documents}
          onChange={onChange}
        />
      ))}

      {addingDay ? (
        <DayForm
          tripId={trip.id}
          dayNumber={days.length + 1}
          onDone={() => {
            setAddingDay(false);
            onChange();
          }}
          onCancel={() => setAddingDay(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingDay(true)}
          className="rounded-2xl border-2 border-dashed border-hair bg-white py-4 text-sm font-bold text-navy hover:border-gold"
        >
          + Add day {days.length + 1}
        </button>
      )}
    </div>
  );
}

function DayCard({
  trip,
  day,
  drivers,
  documents,
  onChange,
}: {
  trip: Trip;
  day: Day;
  drivers: Driver[];
  documents: TripDocument[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [addingStep, setAddingStep] = useState(false);
  const [open, setOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-2xl border border-hair bg-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-hair bg-paper p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold-deep uppercase">
            Day {day.day_number}
            {day.date ? ` · ${day.date}` : ""}
          </span>
          <span className="mt-0.5 block truncate font-display text-lg text-navy">{day.title}</span>
        </button>

        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
            day.published ? "bg-live/12 text-live" : "bg-gold/18 text-gold-deep"
          }`}
        >
          {day.published ? "Live" : "Draft"}
        </span>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-lg border border-hair bg-white px-3 py-1.5 text-xs font-semibold text-navy"
        >
          {editing ? "Close" : "Edit day"}
        </button>
      </header>

      {editing ? (
        <div className="border-b border-hair p-4">
          <DayForm
            tripId={trip.id}
            day={day}
            dayNumber={day.day_number}
            onDone={() => {
              setEditing(false);
              onChange();
            }}
            onCancel={() => setEditing(false)}
            onDelete={async () => {
              if (!window.confirm(`Delete day ${day.day_number} and everything in it?`)) return;
              await deleteRow({ data: { table: "trip_days", id: day.id } });
              onChange();
            }}
          />
        </div>
      ) : null}

      {open ? (
        <div className="p-4">
          {day.summary ? (
            <p className="mb-4 text-sm leading-relaxed text-muted">{day.summary}</p>
          ) : null}

          <ol className="flex flex-col gap-3">
            {day.steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                dayId={day.id}
                drivers={drivers}
                documents={documents}
                tripId={trip.id}
                onChange={onChange}
              />
            ))}
          </ol>

          {addingStep ? (
            <div className="mt-3 rounded-xl border border-hair bg-paper p-4">
              <StepForm
                dayId={day.id}
                stepNumber={day.steps.length + 1}
                onDone={() => {
                  setAddingStep(false);
                  onChange();
                }}
                onCancel={() => setAddingStep(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingStep(true)}
              className="mt-3 w-full rounded-xl border border-dashed border-hair py-3 text-xs font-bold text-navy hover:border-gold"
            >
              + Add step {day.steps.length + 1}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function DayForm({
  tripId,
  day,
  dayNumber,
  onDone,
  onCancel,
  onDelete,
}: {
  tripId: string;
  day?: Day;
  dayNumber: number;
  onDone: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        await saveDay({
          data: {
            ...(day ? { id: day.id } : {}),
            tripId,
            dayNumber: Number(f.get("dayNumber") ?? dayNumber),
            title: String(f.get("title") ?? ""),
            date: String(f.get("date") ?? ""),
            summary: String(f.get("summary") ?? ""),
            published: f.get("published") === "on",
          },
        });
        setBusy(false);
        onDone();
      }}
      className="rounded-xl border border-hair bg-paper p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[100px_1fr_170px]">
        <SmallField
          label="Day #"
          name="dayNumber"
          type="number"
          defaultValue={String(dayNumber)}
          min="1"
        />
        <SmallField
          label="Title"
          name="title"
          defaultValue={day?.title ?? ""}
          required
          placeholder="Arrival in Dubai"
        />
        <SmallField label="Date" name="date" type="date" defaultValue={day?.date ?? ""} />
      </div>

      <label className="mt-3 block text-xs font-semibold text-navy" htmlFor="day-summary">
        Summary shown under the day title
      </label>
      <textarea
        id="day-summary"
        name="summary"
        rows={2}
        defaultValue={day?.summary ?? ""}
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />

      <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-navy">
        <input
          type="checkbox"
          name="published"
          defaultChecked={day?.published ?? false}
          className="size-4 accent-[#00365F]"
        />
        <span>Show this day to the customer</span>
      </label>
      <p className="mt-1 text-[11px] text-muted">
        Leave unticked while you are still writing. Unpublished days are invisible in the
        customer&apos;s portal — they do not appear as a gap.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save day"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hair bg-white px-4 py-2 text-xs font-semibold text-navy"
        >
          Cancel
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-lg border border-alert/40 px-4 py-2 text-xs font-semibold text-alert"
          >
            Delete day
          </button>
        ) : null}
      </div>
    </form>
  );
}

function StepCard({
  step,
  dayId,
  drivers,
  documents,
  tripId,
  onChange,
}: {
  step: Step;
  dayId: string;
  drivers: Driver[];
  documents: TripDocument[];
  tripId: string;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState<BlockKind | null>(null);

  return (
    <li className="rounded-xl border border-hair bg-paper">
      <div className="flex flex-wrap items-center gap-3 p-3.5">
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-navy font-mono text-[11px] font-bold text-white"
        >
          {step.step_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-navy">{step.title}</p>
          <p className="truncate text-[11px] text-muted">
            {[step.time_label, step.duration, step.location_name].filter(Boolean).join(" · ") ||
              "No time or location set"}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-muted">
          {step.blocks.length} {step.blocks.length === 1 ? "block" : "blocks"}
        </span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded-lg border border-hair bg-white px-3 py-1.5 text-xs font-semibold text-navy"
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {editing ? (
        <div className="border-t border-hair p-3.5">
          <StepForm
            dayId={dayId}
            step={step}
            stepNumber={step.step_number}
            onDone={() => {
              setEditing(false);
              onChange();
            }}
            onCancel={() => setEditing(false)}
            onDelete={async () => {
              if (!window.confirm(`Delete step "${step.title}" and its content?`)) return;
              await deleteRow({ data: { table: "trip_steps", id: step.id } });
              onChange();
            }}
          />
        </div>
      ) : null}

      {/* ---- blocks ---- */}
      <div className="border-t border-hair p-3.5">
        <div className="flex flex-col gap-2">
          {step.blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              stepId={step.id}
              tripId={tripId}
              drivers={drivers}
              documents={documents}
              onChange={onChange}
            />
          ))}
        </div>

        {adding ? (
          <div className="mt-3 rounded-lg border border-gold bg-white p-3.5">
            <BlockForm
              stepId={step.id}
              tripId={tripId}
              kind={adding}
              position={step.blocks.length}
              drivers={drivers}
              documents={documents}
              onDone={() => {
                setAdding(null);
                onChange();
              }}
              onCancel={() => setAdding(null)}
            />
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
              Add content
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {BLOCK_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setAdding(kind)}
                  title={BLOCK_LABELS[kind].hint}
                  className="rounded-lg border border-hair bg-white px-2.5 py-1.5 text-[11px] font-semibold text-navy hover:border-gold"
                >
                  <span aria-hidden="true">{BLOCK_LABELS[kind].icon}</span>{" "}
                  {BLOCK_LABELS[kind].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function StepForm({
  dayId,
  step,
  stepNumber,
  onDone,
  onCancel,
  onDelete,
}: {
  dayId: string;
  step?: Step;
  stepNumber: number;
  onDone: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        await saveStep({
          data: {
            ...(step ? { id: step.id } : {}),
            dayId,
            stepNumber: Number(f.get("stepNumber") ?? stepNumber),
            title: String(f.get("title") ?? ""),
            description: String(f.get("description") ?? ""),
            timeLabel: String(f.get("timeLabel") ?? ""),
            duration: String(f.get("duration") ?? ""),
            locationName: String(f.get("locationName") ?? ""),
            latitude: String(f.get("latitude") ?? ""),
            longitude: String(f.get("longitude") ?? ""),
          },
        });
        setBusy(false);
        onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
        <SmallField
          label="Step #"
          name="stepNumber"
          type="number"
          defaultValue={String(stepNumber)}
          min="1"
        />
        <SmallField
          label="Title"
          name="title"
          defaultValue={step?.title ?? ""}
          required
          placeholder="Meet your driver"
        />
      </div>

      <label className="mt-3 block text-xs font-semibold text-navy" htmlFor={`sd-${dayId}`}>
        Description
      </label>
      <textarea
        id={`sd-${dayId}`}
        name="description"
        rows={3}
        defaultValue={step?.description ?? ""}
        placeholder="After collecting your luggage, proceed to Exit 2."
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SmallField
          label="Time"
          name="timeLabel"
          defaultValue={step?.time_label ?? ""}
          placeholder="14:30, or 'on arrival'"
        />
        <SmallField
          label="Duration"
          name="duration"
          defaultValue={step?.duration ?? ""}
          placeholder="about 45 minutes"
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_120px]">
        <SmallField
          label="Location name"
          name="locationName"
          defaultValue={step?.location_name ?? ""}
          placeholder="DXB Terminal 3, Exit 2"
        />
        <SmallField
          label="Latitude"
          name="latitude"
          defaultValue={step?.latitude?.toString() ?? ""}
          placeholder="25.2532"
        />
        <SmallField
          label="Longitude"
          name="longitude"
          defaultValue={step?.longitude?.toString() ?? ""}
          placeholder="55.3657"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save step"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hair bg-white px-4 py-2 text-xs font-semibold text-navy"
        >
          Cancel
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-lg border border-alert/40 px-4 py-2 text-xs font-semibold text-alert"
          >
            Delete step
          </button>
        ) : null}
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------
 * Blocks
 * ---------------------------------------------------------------------- */

function BlockRow({
  block,
  stepId,
  tripId,
  drivers,
  documents,
  onChange,
}: {
  block: Block;
  stepId: string;
  tripId: string;
  drivers: Driver[];
  documents: TripDocument[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const meta = BLOCK_LABELS[block.kind];

  return (
    <div className="rounded-lg border border-hair bg-white">
      <div className="flex items-center gap-2.5 p-2.5">
        <span aria-hidden="true" className="shrink-0 text-sm">
          {meta?.icon ?? "▫"}
        </span>
        <span className="shrink-0 text-[11px] font-bold text-navy">
          {meta?.label ?? block.kind}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-muted">
          {summarise(block, drivers, documents)}
        </span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded border border-hair px-2 py-1 text-[10px] font-semibold text-navy"
        >
          {editing ? "Close" : "Edit"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm("Delete this block?")) return;
            await deleteRow({ data: { table: "trip_blocks", id: block.id } });
            onChange();
          }}
          aria-label="Delete block"
          className="shrink-0 rounded border border-alert/35 px-2 py-1 text-[10px] font-semibold text-alert"
        >
          ✕
        </button>
      </div>

      {editing ? (
        <div className="border-t border-hair p-3">
          <BlockForm
            stepId={stepId}
            tripId={tripId}
            kind={block.kind}
            block={block}
            position={block.position}
            drivers={drivers}
            documents={documents}
            onDone={() => {
              setEditing(false);
              onChange();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

/** A one-line preview, so the office can scan a step without opening each block. */
function summarise(block: Block, drivers: Driver[], documents: TripDocument[]): string {
  const p = block.payload ?? {};
  switch (block.kind) {
    case "text":
    case "notice":
    case "emergency":
      return (p.heading ?? p.text ?? "").slice(0, 90) || "empty";
    case "heading":
      return p.heading ?? p.text ?? "empty";
    case "image":
    case "video":
      return p.path ? (p.caption ?? p.label ?? p.path.split("/").pop() ?? "") : "no file chosen";
    case "gallery":
      return `${p.paths?.length ?? 0} images`;
    case "map":
      return (
        p.locationName ?? (p.latitude != null ? `${p.latitude}, ${p.longitude}` : "no location")
      );
    case "driver":
      return drivers.find((d) => d.id === p.driverId)?.full_name ?? "no driver chosen";
    case "document":
      return documents.find((d) => d.id === p.documentId)?.name ?? "no document chosen";
    case "checklist":
      return `${p.items?.length ?? 0} items`;
    default:
      return p.name ?? p.label ?? p.reference ?? p.flightNumber ?? "—";
  }
}

/**
 * The block editor.
 *
 * One component that shows only the fields the chosen kind uses, rather than
 * sixteen near-identical components. The payload is assembled from whichever
 * inputs rendered, so a field that is not shown is simply absent rather than
 * being written as an empty string — which matters because the renderer tests
 * for presence, not for truthiness.
 */
function BlockForm({
  stepId,
  tripId,
  kind,
  block,
  position,
  drivers,
  documents,
  onDone,
  onCancel,
}: {
  stepId: string;
  tripId: string;
  kind: BlockKind;
  block?: Block;
  position: number;
  drivers: Driver[];
  documents: TripDocument[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const existing = block?.payload ?? {};
  const [payload, setPayload] = useState<BlockPayload>(existing);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Not Partial<BlockPayload>: under exactOptionalPropertyTypes, Partial lets a
  // key be absent but not explicitly undefined — and clearing a coordinate field
  // means writing undefined over it. This mapped type allows both.
  const set = (patch: { [K in keyof BlockPayload]?: BlockPayload[K] | undefined }) =>
    setPayload((p) => ({ ...p, ...patch }));

  const upload = async (file: File, field: "path" | "poster" | "gallery") => {
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.set("file", file);
    form.set("tripId", tripId);
    form.set("bucket", "trip-media");
    const result = await uploadFile({ data: form });
    setUploading(false);
    if (!result.ok) {
      setUploadError(result.reason ?? "Upload failed.");
      return;
    }
    if (field === "gallery") set({ paths: [...(payload.paths ?? []), result.path] });
    else if (field === "poster") set({ poster: result.path });
    else set({ path: result.path });
  };

  const needs = FIELDS[kind];

  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.12em] text-gold-deep uppercase">
        {BLOCK_LABELS[kind].icon} {BLOCK_LABELS[kind].label}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{BLOCK_LABELS[kind].hint}</p>

      <div className="mt-3 flex flex-col gap-3">
        {needs.includes("heading") ? (
          <Inline
            label="Heading"
            value={payload.heading ?? ""}
            onChange={(v) => set({ heading: v })}
          />
        ) : null}

        {needs.includes("text") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">Text</label>
            <textarea
              rows={3}
              value={payload.text ?? ""}
              onChange={(e) => set({ text: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-hair px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
        ) : null}

        {needs.includes("file") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">
              {kind === "video" ? "Video file" : "Image file"}
            </label>
            {payload.path ? (
              <p className="mt-1 font-mono text-[11px] break-all text-live">✓ {payload.path}</p>
            ) : null}
            <input
              type="file"
              accept={kind === "video" ? "video/*" : "image/*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file, "path");
              }}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-xs"
            />
          </div>
        ) : null}

        {needs.includes("gallery") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">Images</label>
            {(payload.paths ?? []).map((p, i) => (
              <p
                key={p + i}
                className="mt-1 flex items-center gap-2 font-mono text-[11px] text-live"
              >
                <span className="min-w-0 flex-1 truncate">✓ {p}</span>
                <button
                  type="button"
                  onClick={() =>
                    set({ paths: (payload.paths ?? []).filter((_, idx) => idx !== i) })
                  }
                  className="shrink-0 text-alert"
                >
                  remove
                </button>
              </p>
            ))}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file, "gallery");
                e.target.value = "";
              }}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-xs"
            />
          </div>
        ) : null}

        {needs.includes("poster") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">
              Cover image for the video (optional)
            </label>
            {payload.poster ? (
              <p className="mt-1 font-mono text-[11px] break-all text-live">✓ {payload.poster}</p>
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file, "poster");
              }}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-xs"
            />
          </div>
        ) : null}

        {needs.includes("caption") ? (
          <Inline
            label="Caption"
            value={payload.caption ?? ""}
            onChange={(v) => set({ caption: v })}
          />
        ) : null}
        {needs.includes("label") ? (
          <Inline label="Label" value={payload.label ?? ""} onChange={(v) => set({ label: v })} />
        ) : null}
        {needs.includes("href") ? (
          <Inline
            label="Link URL"
            value={payload.href ?? ""}
            onChange={(v) => set({ href: v })}
            placeholder="https://…"
          />
        ) : null}
        {needs.includes("name") ? (
          <Inline label="Name" value={payload.name ?? ""} onChange={(v) => set({ name: v })} />
        ) : null}
        {needs.includes("phone") ? (
          <Inline
            label="Phone"
            value={payload.phone ?? ""}
            onChange={(v) => set({ phone: v })}
            placeholder="+971…"
          />
        ) : null}
        {needs.includes("whatsapp") ? (
          <Inline
            label="WhatsApp"
            value={payload.whatsapp ?? ""}
            onChange={(v) => set({ whatsapp: v })}
            placeholder="+971…"
          />
        ) : null}
        {needs.includes("reference") ? (
          <Inline
            label="Reference / booking number"
            value={payload.reference ?? ""}
            onChange={(v) => set({ reference: v })}
          />
        ) : null}
        {needs.includes("hotelDates") ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Inline
              label="Check in"
              value={payload.checkIn ?? ""}
              onChange={(v) => set({ checkIn: v })}
              placeholder="28 Sep, 15:00"
            />
            <Inline
              label="Check out"
              value={payload.checkOut ?? ""}
              onChange={(v) => set({ checkOut: v })}
              placeholder="3 Oct, 12:00"
            />
          </div>
        ) : null}
        {needs.includes("flight") ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Inline
              label="Flight no."
              value={payload.flightNumber ?? ""}
              onChange={(v) => set({ flightNumber: v })}
              placeholder="FZ 331"
            />
            <Inline
              label="Departure"
              value={payload.departure ?? ""}
              onChange={(v) => set({ departure: v })}
              placeholder="KBL 08:15"
            />
            <Inline
              label="Arrival"
              value={payload.arrival ?? ""}
              onChange={(v) => set({ arrival: v })}
              placeholder="DXB 11:05"
            />
          </div>
        ) : null}
        {needs.includes("location") ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px]">
            <Inline
              label="Location name"
              value={payload.locationName ?? ""}
              onChange={(v) => set({ locationName: v })}
            />
            <Inline
              label="Latitude"
              value={payload.latitude?.toString() ?? ""}
              onChange={(v) => set(v.trim() ? { latitude: Number(v) } : { latitude: undefined })}
            />
            <Inline
              label="Longitude"
              value={payload.longitude?.toString() ?? ""}
              onChange={(v) => set(v.trim() ? { longitude: Number(v) } : { longitude: undefined })}
            />
          </div>
        ) : null}
        {needs.includes("driver") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">Driver</label>
            <select
              value={payload.driverId ?? ""}
              onChange={(e) => set({ driverId: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">— choose a driver —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                  {d.vehicle ? ` · ${d.vehicle}` : ""}
                  {d.plate_number ? ` · ${d.plate_number}` : ""}
                </option>
              ))}
            </select>
            {!drivers.length ? (
              <p className="mt-1 text-[11px] text-gold-deep">
                No drivers on file yet. Add them in Supabase → trip_drivers, then they appear here.
              </p>
            ) : null}
          </div>
        ) : null}
        {needs.includes("document") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">Document</label>
            <select
              value={payload.documentId ?? ""}
              onChange={(e) => set({ documentId: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">— choose a document —</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {!documents.length ? (
              <p className="mt-1 text-[11px] text-gold-deep">
                Upload a PDF in the Documents tab first.
              </p>
            ) : null}
          </div>
        ) : null}
        {needs.includes("tone") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">How urgent is this?</label>
            <select
              value={payload.tone ?? "info"}
              onChange={(e) => set({ tone: e.target.value as BlockPayload["tone"] })}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="info">Information — blue</option>
              <option value="warning">Important — gold</option>
              <option value="critical">Critical — red</option>
            </select>
          </div>
        ) : null}
        {needs.includes("items") ? (
          <div>
            <label className="block text-xs font-semibold text-navy">
              Checklist items, one per line
            </label>
            <textarea
              rows={4}
              value={(payload.items ?? []).join("\n")}
              onChange={(e) =>
                set({
                  items: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-hair px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
        ) : null}
      </div>

      {uploading ? <p className="mt-3 text-xs text-gold-deep">Uploading…</p> : null}
      {uploadError ? (
        <p role="alert" className="mt-3 rounded bg-alert/8 p-2 text-xs text-alert">
          {uploadError}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={busy || uploading}
          onClick={async () => {
            setBusy(true);
            await saveBlock({
              data: {
                ...(block ? { id: block.id } : {}),
                stepId,
                position,
                kind,
                payload: payload as Record<string, unknown>,
              },
            });
            setBusy(false);
            onDone();
          }}
          className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save block"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hair bg-white px-4 py-2 text-xs font-semibold text-navy"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Which inputs each block kind needs.
 *
 * A table rather than sixteen conditionals scattered through the form. Adding a
 * field to a kind is a one-line change here, which is the point.
 */
const FIELDS: Record<BlockKind, string[]> = {
  text: ["text"],
  heading: ["heading"],
  image: ["file", "caption"],
  gallery: ["gallery", "caption"],
  video: ["file", "poster", "label", "caption"],
  map: ["location"],
  driver: ["driver"],
  hotel: ["name", "hotelDates", "reference", "phone", "text"],
  flight: ["flight", "reference", "text"],
  ticket: ["name", "reference", "label", "text"],
  document: ["document"],
  contact: ["name", "phone", "whatsapp", "text"],
  notice: ["heading", "text", "tone"],
  emergency: ["heading", "text", "name", "phone"],
  link: ["label", "href"],
  checklist: ["heading", "items"],
};

function Inline({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-navy">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-hair px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}

function SmallField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  const id = `sf-${name}-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-navy">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Documents
 * ---------------------------------------------------------------------- */

function DocumentsTab({
  trip,
  documents,
  onChange,
}: {
  trip: Trip;
  documents: TripDocument[];
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="mt-5 rounded-2xl border border-hair bg-white p-5">
      <h2 className="font-display text-lg text-navy">Documents</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Vouchers, tickets, visas and insurance. Stored in a private bucket — the customer&apos;s
        portal serves them as links that expire after a few hours, so a voucher forwarded into a
        group chat stops working rather than staying public forever.
      </p>

      <input
        type="file"
        accept="application/pdf,image/*"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          setError("");
          const form = new FormData();
          form.set("file", file);
          form.set("tripId", trip.id);
          form.set("bucket", "trip-docs");
          const result = await uploadFile({ data: form });
          setUploading(false);
          e.target.value = "";
          if (!result.ok) setError(result.reason ?? "Upload failed.");
          else onChange();
        }}
        className="mt-4 w-full rounded-lg border border-dashed border-hair bg-paper px-3 py-4 text-sm"
      />
      {uploading ? <p className="mt-2 text-xs text-gold-deep">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="mt-2 rounded bg-alert/8 p-2 text-xs text-alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-hair bg-paper p-3"
          >
            <span aria-hidden="true">📄</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
              {doc.name}
            </span>
            <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
              {doc.visibility === "staff_only" ? "staff only" : doc.visibility}
            </span>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Delete "${doc.name}"?`)) return;
                await deleteRow({ data: { table: "trip_documents", id: doc.id } });
                onChange();
              }}
              className="shrink-0 rounded border border-alert/35 px-2 py-1 text-[10px] font-semibold text-alert"
            >
              Delete
            </button>
          </div>
        ))}
        {!documents.length ? (
          <p className="rounded-lg bg-paper p-4 text-center text-xs text-muted">
            No documents uploaded yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Activity
 * ---------------------------------------------------------------------- */

function ActivityTab({
  views,
  audit,
  progress,
}: {
  views: LoaderData["views"];
  audit: LoaderData["audit"];
  progress: ProgressEntry[];
}) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-hair bg-white p-5">
        <h2 className="font-display text-lg text-navy">What the customer has looked at</h2>
        <p className="mt-1 text-xs text-muted">
          Newest first. Dubai time. The customer is told in their portal that the office can see
          this.
        </p>
        <ol className="mt-4 flex flex-col gap-2">
          {views.map((v) => (
            <li key={v.id} className="flex gap-3 border-b border-hair pb-2 last:border-0">
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                {clock(v.created_at)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-navy">{humanEvent(v.event)}</span>
                {v.detail ? (
                  <span className="block truncate text-[11px] text-muted">{v.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
          {!views.length ? (
            <li className="rounded-lg bg-paper p-4 text-center text-xs text-muted">
              The customer has not opened their link yet.
            </li>
          ) : null}
        </ol>
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-hair bg-white p-5">
          <h2 className="font-display text-lg text-navy">Progress history</h2>
          <ol className="mt-4 flex flex-col gap-2.5">
            {progress.map((p) => (
              <li key={p.id} className="flex gap-3 border-b border-hair pb-2 last:border-0">
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                  {clock(p.created_at)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-navy">
                    {stageMeta(p.stage)?.label ?? p.stage}
                  </span>
                  {!p.visible ? (
                    <span className="ml-1.5 rounded bg-paper px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted">
                      internal
                    </span>
                  ) : null}
                  {p.note ? <span className="block text-[11px] text-muted">{p.note}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-hair bg-white p-5">
          <h2 className="font-display text-lg text-navy">Change history</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Recorded by the database itself, so nothing can edit this trip without appearing here.
          </p>
          <ol className="mt-4 flex flex-col gap-2">
            {audit.map((a) => (
              <li key={a.id} className="border-b border-hair pb-2 text-[11px] last:border-0">
                <span className="font-mono tabular-nums text-muted">{clock(a.created_at)}</span>{" "}
                <span className="font-semibold text-navy">
                  {a.action} {a.table_name.replace("trip_", "")}
                </span>
                {a.actor ? <span className="text-muted"> by {a.actor}</span> : null}
                <span className="mt-0.5 block truncate text-muted">
                  {describeChange(a.changes)}
                </span>
              </li>
            ))}
            {!audit.length ? (
              <li className="rounded-lg bg-paper p-4 text-center text-xs text-muted">
                No changes recorded yet.
              </li>
            ) : null}
          </ol>
        </section>
      </div>
    </div>
  );
}

function clock(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const EVENT_WORDS: Record<string, string> = {
  open: "Opened the portal",
  day: "Viewed a day",
  video: "Watched a video",
  map: "Opened a location",
  document_open: "Opened a document",
  driver_call: "Called the driver",
  driver_whatsapp: "WhatsApped the driver",
  help_whatsapp: "WhatsApped the office",
  help_call: "Called the office",
  emergency_call: "Used the emergency number",
  link: "Followed a link",
};

function humanEvent(event: string): string {
  return EVENT_WORDS[event] ?? event.replace(/_/g, " ");
}

/**
 * Renders one audit entry's diff as a sentence.
 *
 * The trigger stores `{ field: { from, to } }` for an update and `{ new: {...} }`
 * for an insert. Showing the first two changed fields is enough to recognise the
 * edit — the case this exists for is "who changed Exit 2 to Exit 3", which is
 * legible in exactly this form.
 */
function describeChange(changes: Record<string, Json>): string {
  if (!changes || typeof changes !== "object") return "";
  if ("new" in changes) return "created";
  if ("old" in changes) return "deleted";

  const parts: string[] = [];
  for (const [field, value] of Object.entries(changes)) {
    if (parts.length >= 2) break;
    if (value && typeof value === "object" && "from" in value && "to" in value) {
      const v = value as { from: unknown; to: unknown };
      parts.push(`${field}: ${trim(v.from)} → ${trim(v.to)}`);
    }
  }
  return parts.join(" · ");
}

function trim(v: unknown): string {
  if (v === null || v === undefined) return "empty";
  const s = String(v);
  return s.length > 40 ? `${s.slice(0, 40)}…` : s;
}
