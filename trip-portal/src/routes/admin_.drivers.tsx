import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";

import { Icon } from "@/components/Icon";
import { requireSession } from "@/lib/session";
import { UUID, uploadDirect } from "@/lib/uploads";

/**
 * Drivers — the one list every trip's driver cards are drawn from.
 *
 * Before this page existed, a driver could only be added by typing a row into
 * Supabase's table editor, which meant the office could not do it at all. A row
 * per driver rather than per trip, because the same driver works many trips and
 * re-typing a plate number each time is how a wrong plate reaches a customer
 * standing in a car park.
 *
 * `admin_` keeps this page out of the /admin dashboard's route tree; see the
 * note on the trip editor route.
 */

type DriverRow = {
  id: string;
  full_name: string;
  photo: string | null;
  photoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  vehicle: string | null;
  plate_number: string | null;
  languages: string | null;
  active: boolean;
};

const loadDrivers = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
  if (!(await sessionFromToken(getCookie(SESSION_COOKIE)))) return { signedOut: true as const };

  const { select, signedUrl } = await import("@/lib/db");
  const rows = await select<Omit<DriverRow, "photoUrl">[]>(
    "trip_drivers?select=id,full_name,photo,phone,whatsapp,vehicle,plate_number,languages,active&order=active.desc,full_name.asc",
  );
  const drivers: DriverRow[] = await Promise.all(
    rows.map(async (d) => ({ ...d, photoUrl: await signedUrl("trip-media", d.photo ?? "") })),
  );
  return { drivers };
});

const saveDriver = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      fullName: string;
      phone: string;
      whatsapp: string;
      vehicle: string;
      plate: string;
      languages: string;
      active: boolean;
      photo?: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    const name = data.fullName.trim();
    if (!name) return { ok: false as const, reason: "The driver's name is required." };
    if (data.id && !UUID.test(data.id)) return { ok: false as const, reason: "Unknown driver." };
    // A photo path must be one the drivers upload ticket produced.
    if (data.photo && !data.photo.startsWith("drivers/")) {
      return { ok: false as const, reason: "Invalid photo." };
    }

    const { insert, update, select, deleteObject } = await import("@/lib/db");
    const row: Record<string, unknown> = {
      full_name: name.slice(0, 120),
      phone: data.phone.trim() || null,
      whatsapp: data.whatsapp.trim() || data.phone.trim() || null,
      vehicle: data.vehicle.trim() || null,
      // Plates are read at a glance off a moving car, so they are stored the way
      // they are painted: upper case, single spaces.
      plate_number: data.plate.trim().toUpperCase().replace(/\s+/g, " ") || null,
      languages: data.languages.trim() || null,
      active: data.active,
    };
    if (data.photo !== undefined) row["photo"] = data.photo;

    if (data.id) {
      let oldPhoto: string | null = null;
      if (data.photo !== undefined) {
        const cur = await select<{ photo: string | null }[]>(
          `trip_drivers?id=eq.${data.id}&select=photo&limit=1`,
        );
        oldPhoto = cur[0]?.photo ?? null;
      }
      await update("trip_drivers", `id=eq.${data.id}`, row);
      if (oldPhoto && oldPhoto !== data.photo) await deleteObject("trip-media", oldPhoto);
    } else {
      await insert("trip_drivers", row);
    }
    return { ok: true as const };
  });

/**
 * Deletes a driver and their photo.
 *
 * Progress entries that named the driver keep their history (the foreign key is
 * `on delete set null`), and any driver card already placed in an itinerary
 * simply stops rendering — the portal treats a missing driver as nothing to
 * show, never as an error. For a driver who has left but whose trips are still
 * running, deactivating is the gentler choice, and the page says so.
 */
const deleteDriver = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireSession();
    if (!UUID.test(id)) return { ok: false as const };
    const { select, remove, deleteObject } = await import("@/lib/db");
    const cur = await select<{ photo: string | null }[]>(
      `trip_drivers?id=eq.${id}&select=photo&limit=1`,
    );
    await remove("trip_drivers", `id=eq.${id}`);
    if (cur[0]?.photo) await deleteObject("trip-media", cur[0].photo);
    return { ok: true as const };
  });

export const Route = createFileRoute("/admin_/drivers")({
  loader: async () => {
    const data = await loadDrivers();
    if ("signedOut" in data) throw redirect({ to: "/admin" });
    return data;
  },
  head: () => ({ meta: [{ title: "Drivers · Nawi Saadi operations" }] }),
  component: DriversPage,
});

function DriversPage() {
  const { drivers } = Route.useLoaderData() as { drivers: DriverRow[] };
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const refresh = () => router.invalidate();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hair bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-hair px-3 py-1.5 text-xs font-semibold text-navy hover:border-gold"
          >
            <Icon name="chevronLeft" className="size-3.5" /> All trips
          </Link>
          <img src="/brand/logo-ink.webp" alt="Nawi Saadi" className="ml-auto h-9 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.22em] text-gold-deep uppercase">
              <span className="h-px w-10 bg-gold" /> Operations
            </p>
            <h1 className="mt-2 font-display text-4xl text-navy">
              Your <span className="text-gold-deep italic">drivers</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Add a driver once; pick them on any trip. Customers see the photo, vehicle, plate and
              one-tap call and WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            {adding ? "Cancel" : "+ Add driver"}
          </button>
        </div>

        {adding ? (
          <div className="mt-6">
            <DriverForm
              onDone={async () => {
                setAdding(false);
                await refresh();
              }}
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {drivers.map((d) => (
            <DriverTile key={d.id} driver={d} onChange={refresh} />
          ))}
        </div>
        {!drivers.length && !adding ? (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-hair bg-white p-10 text-center">
            <Icon name="car" className="mx-auto size-10 text-gold-deep" />
            <p className="mt-3 font-display text-xl text-navy">No drivers yet</p>
            <p className="mt-1 text-sm text-muted">
              Add your first driver, then choose them in any trip&apos;s itinerary.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function DriverTile({
  driver,
  onChange,
}: {
  driver: DriverRow;
  onChange: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="sm:col-span-2">
        <DriverForm
          driver={driver}
          onDone={async () => {
            setEditing(false);
            await onChange();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md ${
        driver.active ? "border-hair" : "border-dashed border-hair opacity-70"
      }`}
    >
      <div className="flex items-center gap-4 p-5">
        {driver.photoUrl ? (
          <img
            src={driver.photoUrl}
            alt={driver.full_name}
            className="size-20 shrink-0 rounded-2xl object-cover ring-2 ring-gold/40"
          />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-sand text-gold-deep">
            <Icon name="car" className="size-8" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl text-navy">{driver.full_name}</p>
          <p className="truncate text-sm text-muted">{driver.vehicle ?? "No vehicle set"}</p>
          {driver.plate_number ? (
            <p className="mt-1.5 inline-block rounded-md border-2 border-ink/80 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-ink">
              {driver.plate_number}
            </p>
          ) : null}
        </div>
        {!driver.active ? (
          <span className="self-start rounded-full bg-paper px-2.5 py-1 text-[10px] font-bold text-muted uppercase">
            Inactive
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hair px-5 py-3 text-xs text-muted">
        {driver.phone ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="phone" className="size-3.5 text-gold-deep" /> {driver.phone}
          </span>
        ) : null}
        {driver.languages ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="globe" className="size-3.5 text-gold-deep" /> {driver.languages}
          </span>
        ) : null}
        <span className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-hair px-3 py-1.5 font-semibold text-navy hover:border-gold"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (
                !window.confirm(
                  `Delete ${driver.full_name}? Any itinerary showing this driver's card will stop showing it. To keep them on past trips, edit and untick "Active" instead.`,
                )
              )
                return;
              await deleteDriver({ data: driver.id });
              await onChange();
            }}
            className="rounded-lg border border-hair px-3 py-1.5 font-semibold text-muted hover:border-alert hover:text-alert"
          >
            Delete
          </button>
        </span>
      </div>
    </article>
  );
}

function DriverForm({
  driver,
  onDone,
  onCancel,
}: {
  driver?: DriverRow;
  onDone: () => void | Promise<void>;
  onCancel?: () => void;
}) {
  const uid = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<{ path: string | null; preview: string | null } | undefined>(
    undefined,
  );
  const [progress, setProgress] = useState<number | null>(null);

  const preview = photo ? photo.preview : (driver?.photoUrl ?? null);

  const field = (
    name: string,
    label: string,
    value: string | null | undefined,
    placeholder = "",
  ) => (
    <div>
      <label htmlFor={`${uid}-${name}`} className="block text-xs font-semibold text-navy">
        {label}
      </label>
      <input
        id={`${uid}-${name}`}
        name={name}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-hair bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gold"
      />
    </div>
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        const result = await saveDriver({
          data: {
            ...(driver ? { id: driver.id } : {}),
            fullName: String(f.get("fullName") ?? ""),
            phone: String(f.get("phone") ?? ""),
            whatsapp: String(f.get("whatsapp") ?? ""),
            vehicle: String(f.get("vehicle") ?? ""),
            plate: String(f.get("plate") ?? ""),
            languages: String(f.get("languages") ?? ""),
            active: f.get("active") === "on",
            ...(photo !== undefined ? { photo: photo.path } : {}),
          },
        });
        setBusy(false);
        if (!result.ok) {
          setError(result.reason);
          return;
        }
        await onDone();
      }}
      className="rounded-3xl border border-gold/50 bg-white p-6 shadow-sm"
    >
      <h2 className="font-display text-2xl text-navy">{driver ? "Edit driver" : "New driver"}</h2>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="size-20 rounded-2xl object-cover ring-2 ring-gold/40"
          />
        ) : (
          <span className="grid size-20 place-items-center rounded-2xl bg-sand text-gold-deep">
            <Icon name="camera" className="size-7" />
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gold-light">
            {preview ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={progress !== null}
              onChange={async (e) => {
                const file = e.currentTarget.files?.[0];
                e.currentTarget.value = "";
                if (!file) return;
                setProgress(0);
                setError("");
                const result = await uploadDirect(file, {
                  folder: "drivers",
                  bucket: "trip-media",
                  onProgress: setProgress,
                });
                setProgress(null);
                if (!result.ok) {
                  setError(result.reason);
                  return;
                }
                setPhoto({ path: result.path, preview: URL.createObjectURL(file) });
              }}
            />
          </label>
          {preview ? (
            <button
              type="button"
              onClick={() => setPhoto({ path: null, preview: null })}
              className="rounded-xl border border-hair px-4 py-2.5 text-xs font-semibold text-muted hover:text-alert"
            >
              Remove photo
            </button>
          ) : null}
        </div>
        {progress !== null ? (
          <span className="text-xs font-semibold text-gold-deep tabular-nums">
            Uploading… {progress}%
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {field("fullName", "Full name *", driver?.full_name, "Ahmed Khan")}
        {field("vehicle", "Vehicle", driver?.vehicle, "Silver Toyota Hiace")}
        {field("plate", "Plate number", driver?.plate_number, "DXB 12345")}
        {field("languages", "Languages", driver?.languages, "English, Arabic, Urdu")}
        {field("phone", "Phone", driver?.phone, "+971 50 000 0000")}
        {field("whatsapp", "WhatsApp (if different)", driver?.whatsapp)}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          name="active"
          defaultChecked={driver?.active ?? true}
          className="size-4 accent-[#00365F]"
        />
        Active — can be chosen for trips
      </label>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-alert/8 p-3 text-sm text-alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={busy || progress !== null}
          className="rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
        >
          {busy ? "Saving…" : driver ? "Save driver" : "Add driver"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-hair px-5 py-3 text-sm font-semibold text-navy"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
