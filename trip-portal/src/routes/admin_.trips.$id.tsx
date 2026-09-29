import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";

import { Icon, type IconName } from "@/components/Icon";
import { LocationPicker, type PickedLocation } from "@/components/LocationPicker";
import { destinationPhoto } from "@/lib/destinations";
import { isLatLng } from "@/lib/geo";
import { deleteTrip } from "@/lib/trip-admin";
import { UUID, uploadDirect } from "@/lib/uploads";
import type { Json } from "@/lib/audit";
import {
  balanceOf,
  money,
  toFils,
  type Amount,
  type Invoice,
  type InvoiceItem,
  BLOCK_KINDS,
  BLOCK_LABELS,
  type Block,
  type BlockKind,
  type BlockPayload,
  type Day,
  type Driver,
  type GuideStep,
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
    // A signed-out read returns a marker rather than throwing. A session that
    // expires mid-shift is routine — twelve hours is one long day at an airport
    // desk — and throwing sent the consultant to "This page didn't load",
    // which reads as the system being broken rather than as "sign in again".
    const { getCookie } = await import("@tanstack/react-start/server");
    const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
    if (!(await sessionFromToken(getCookie(SESSION_COOKIE)))) {
      return { signedOut: true as const };
    }
    const { tripForAdmin } = await import("@/lib/trips");
    const { auditForTrip } = await import("@/lib/audit");
    const { portalBaseUrl } = await import("@/lib/urls");

    // One batch: the trip and its activity only need the id we already hold.
    const [trip, audit] = await Promise.all([tripForAdmin(id), auditForTrip(id, 40)]);
    if (!trip) return null;

    // Covers are signed so the office sees the actual photo it chose, not a
    // storage path. Block photos stay as paths here; the customer preview shows
    // those rendered.
    // Photo guides are signed too: a guide is edited by looking at its photos
    // in order, and a list of file names cannot be reordered by eye.
    const { signedUrl } = await import("@/lib/db");
    const { signBlock } = await import("@/lib/trips");
    const [heroUrl, days] = await Promise.all([
      signedUrl("trip-media", trip.trip.hero_image ?? ""),
      Promise.all(
        trip.days.map(async (d) => ({
          ...d,
          coverUrl: await signedUrl("trip-media", d.cover_image ?? ""),
          steps: await Promise.all(
            d.steps.map(async (st) => ({
              ...st,
              blocks: await Promise.all(
                st.blocks.map((b) => (b.kind === "guide" ? signBlock(b) : Promise.resolve(b))),
              ),
            })),
          ),
        })),
      ),
    ]);
    return { ...trip, trip: { ...trip.trip, heroUrl }, days, audit, base: portalBaseUrl() };
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

/**
 * Shows every hidden day at once. Days were once hidden until ticked one by
 * one, and a whole itinerary went out to a customer as "being prepared"
 * because five boxes had been left unticked.
 */
const showAllDays = createServerFn({ method: "POST" })
  .validator((tripId: string) => tripId)
  .handler(async ({ data: tripId }) => {
    await requireSession();
    if (!UUID.test(tripId)) return { ok: false as const };
    const { update } = await import("@/lib/db");
    await update("trip_days", `trip_id=eq.${tripId}&published=is.false`, { published: true });
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
    // The same for each guide step, whose `url` is a signed link or, straight
    // after an upload, a blob: preview that only exists in this browser tab.
    if (Array.isArray(clean["steps"])) {
      clean["steps"] = (clean["steps"] as GuideStep[]).map((st) => ({
        ...(st.path ? { path: st.path } : {}),
        text: String(st.text ?? "").trim(),
      }));
    }

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
    const allowed = [
      "trip_days",
      "trip_steps",
      "trip_blocks",
      "trip_documents",
      "trip_invoices",
      "trip_invoice_items",
    ];
    if (!allowed.includes(data.table)) return { ok: false as const };
    if (!UUID.test(data.id)) return { ok: false as const };
    const { remove, select, deleteObject } = await import("@/lib/db");

    // Deleting a row used to leave its file in the bucket for good: a voucher
    // "deleted" from a trip still sat in storage, reachable by nobody without a
    // row pointing at it, but not gone. Deleted should mean deleted, so the
    // files a row owns are collected before the row goes and removed after.
    // Days and steps are left to the cascade — their blocks' files are an
    // accepted leak until a trip-level cleanup exists, and are unreachable.
    const files: { bucket: "trip-media" | "trip-docs"; path: string }[] = [];
    if (data.table === "trip_documents") {
      const rows = await select<{ file_path: string }[]>(
        `trip_documents?id=eq.${data.id}&select=file_path`,
      );
      for (const r of rows) if (r.file_path) files.push({ bucket: "trip-docs", path: r.file_path });
    } else if (data.table === "trip_blocks") {
      const rows = await select<{ payload: BlockPayload }[]>(
        `trip_blocks?id=eq.${data.id}&select=payload`,
      );
      for (const r of rows) {
        const p = r.payload ?? {};
        const guide = (p.steps ?? []).map((st) => st.path);
        for (const path of [p.path, p.poster, ...(p.paths ?? []), ...guide]) {
          if (path) files.push({ bucket: "trip-media", path });
        }
      }
    }

    await remove(data.table, `id=eq.${data.id}`);
    // After the row, not before: if the delete fails the file must still exist
    // for the row that still points at it.
    await Promise.all(files.map((f) => deleteObject(f.bucket, f.path)));
    return { ok: true as const };
  });

/* -------------------------------------------------------------------------
 * Trip details, covers, and deleting a trip
 * ---------------------------------------------------------------------- */

const updateTrip = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      title: string;
      destination: string;
      startDate: string;
      endDate: string;
      adults: number;
      children: number;
      emergencyName: string;
      emergencyPhone: string;
      customerName: string;
      customerPhone: string;
      customerWhatsapp: string;
      cancelled: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    if (!UUID.test(data.id)) return { ok: false as const, reason: "Unknown trip." };
    const destination = data.destination.trim();
    const name = data.customerName.trim();
    if (!destination) return { ok: false as const, reason: "Destination is required." };
    if (!name) return { ok: false as const, reason: "Customer name is required." };
    if (!data.startDate || !data.endDate || data.endDate < data.startDate) {
      return {
        ok: false as const,
        reason: "Check the dates — the trip cannot end before it starts.",
      };
    }

    const { select, update, insert } = await import("@/lib/db");
    const rows = await select<{ customer_id: string | null }[]>(
      `trips?id=eq.${data.id}&select=customer_id&limit=1`,
    );
    if (!rows[0]) return { ok: false as const, reason: "Unknown trip." };

    const customer = {
      full_name: name,
      phone: data.customerPhone.trim() || null,
      whatsapp: data.customerWhatsapp.trim() || data.customerPhone.trim() || null,
    };
    let customerId = rows[0].customer_id;
    if (customerId) {
      await update("trip_customers", `id=eq.${customerId}`, customer);
    } else {
      const made = await insert<{ id: string }[]>("trip_customers", customer);
      customerId = made[0]?.id ?? null;
    }

    // Cancelling is a status, not a delete: the trip, its history and its
    // invoices stay on file, and the customer's link stops working at once
    // (the portal refuses a cancelled trip). Whether a trip is upcoming, under
    // way or finished is read from its dates, so un-cancelling needs no guess.
    const status = data.cancelled ? "cancelled" : "confirmed";

    await update("trips", `id=eq.${data.id}`, {
      customer_id: customerId,
      title: data.title.trim() || null,
      destination,
      start_date: data.startDate,
      end_date: data.endDate,
      pax_adults: Math.max(1, Math.min(40, Math.trunc(data.adults) || 1)),
      pax_children: Math.max(0, Math.min(40, Math.trunc(data.children) || 0)),
      emergency_name: data.emergencyName.trim() || null,
      emergency_phone: data.emergencyPhone.trim() || null,
      status,
    });
    return { ok: true as const };
  });

/**
 * Sets or clears the cover photo of the trip or of one day.
 *
 * The path must sit inside this trip's own storage folder — the upload ticket
 * only ever issues such paths, and this refuses anything else, so a cover can
 * never be pointed at another customer's photo. A replaced photo is deleted, so
 * swapping covers five times does not leave four orphans in the bucket.
 */
const setCover = createServerFn({ method: "POST" })
  .validator(
    (input: { target: "trip" | "day"; tripId: string; dayId?: string; path: string | null }) =>
      input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    if (!UUID.test(data.tripId)) return { ok: false as const };
    if (data.path && !data.path.startsWith(`${data.tripId}/`)) return { ok: false as const };
    const { select, update, deleteObject } = await import("@/lib/db");

    if (data.target === "trip") {
      const rows = await select<{ hero_image: string | null }[]>(
        `trips?id=eq.${data.tripId}&select=hero_image&limit=1`,
      );
      await update("trips", `id=eq.${data.tripId}`, { hero_image: data.path });
      const old = rows[0]?.hero_image;
      if (old && old !== data.path) await deleteObject("trip-media", old);
      return { ok: true as const };
    }

    if (!data.dayId || !UUID.test(data.dayId)) return { ok: false as const };
    const rows = await select<{ cover_image: string | null }[]>(
      `trip_days?id=eq.${data.dayId}&trip_id=eq.${data.tripId}&select=cover_image&limit=1`,
    );
    if (!rows[0]) return { ok: false as const };
    await update("trip_days", `id=eq.${data.dayId}`, { cover_image: data.path });
    const old = rows[0].cover_image;
    if (old && old !== data.path) await deleteObject("trip-media", old);
    return { ok: true as const };
  });

/* -------------------------------------------------------------------------
 * Invoices
 * ---------------------------------------------------------------------- */

/**
 * Creates an invoice with the next number in this year's sequence.
 *
 * The number comes from a database function rather than being counted in
 * JavaScript, because two consultants pressing "New invoice" at the same moment
 * would otherwise both read the same maximum and mint the same number — and
 * `invoice_number` is unique, so the second one would simply fail with a
 * constraint error nobody could explain.
 */
const createInvoice = createServerFn({ method: "POST" })
  .validator((tripId: string) => tripId)
  .handler(async ({ data: tripId }) => {
    const { email } = await requireSession();
    const { insert, select } = await import("@/lib/db");

    // PostgREST returns a scalar function's result as a bare JSON value — the
    // string itself — not as `[{ next_invoice_number: "…" }]`. The first version
    // of this read `numbered?.[0]?.next_invoice_number`, which is always
    // undefined against a scalar, so every invoice silently fell through to the
    // timestamp fallback below and the sequence never advanced. Both shapes are
    // accepted so a future change of the function to `returns table` does not
    // reintroduce the same silent failure.
    const numbered = await select<unknown>("rpc/next_invoice_number").catch(() => null);
    const fromRpc =
      typeof numbered === "string"
        ? numbered
        : Array.isArray(numbered)
          ? (numbered[0] as { next_invoice_number?: string } | undefined)?.next_invoice_number
          : undefined;
    const number =
      fromRpc && /^NSI-\d{4}-\d+$/.test(fromRpc)
        ? fromRpc
        : // Fallback if the RPC is unavailable: a timestamp is ugly but unique,
          // and a usable invoice with an odd number beats no invoice at all.
          //
          // The "T" is deliberate. The fallback used to be four digits, exactly
          // the shape of a real sequence number — so nothing, not a test and not
          // a person reading the invoice, could tell that numbering had broken.
          // It had, silently, for every invoice (see the note above). Now a
          // fallback number announces itself.
          `NSI-${new Date().getFullYear()}-T${Date.now().toString().slice(-6)}`;

    const rows = await insert<{ id: string }[]>("trip_invoices", {
      trip_id: tripId,
      invoice_number: number,
      currency: "AED",
      status: "draft",
      created_by: email,
    });
    return { ok: true as const, id: rows?.[0]?.id ?? null, number };
  });

const saveInvoice = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      status: string;
      currency: string;
      issuedDate: string;
      dueDate: string;
      discount: string;
      amountPaid: string;
      notes: string;
      published: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { update, select } = await import("@/lib/db");

    // Totals are recomputed from the stored line items on every save, so the
    // figure the customer sees can never drift from the lines that justify it —
    // nobody types a total. The arithmetic runs here on the server in integer
    // fils (see toFils): summing raw amounts as doubles is how an invoice ends up
    // showing 4699.969999999999.
    const items = await select<{ amount: Amount }[]>(
      `trip_invoice_items?invoice_id=eq.${data.id}&select=amount`,
    );
    const subtotalFils = items.reduce((sum, i) => sum + toFils(i.amount), 0);
    const discountFils = Math.max(0, toFils(data.discount));
    const totalFils = Math.max(0, subtotalFils - discountFils);

    const paidFils = Math.max(0, toFils(data.amountPaid));
    /*
     * The status is derived, never chosen, except for cancellation.
     *
     * The office decides two things: whether the customer can see the invoice,
     * and whether it is cancelled. Everything else is arithmetic. An earlier
     * version let the office pick any status from a dropdown and kept "draft" if
     * it was left there — so ticking "show to customer" and recording a payment,
     * without also touching the dropdown, showed the customer an invoice badged
     * DRAFT with money already paid against it. A visible draft is a
     * contradiction, and so is "paid in full" with a balance outstanding; neither
     * can be expressed now.
     */
    const status =
      data.status === "void"
        ? "void"
        : !data.published
          ? "draft"
          : paidFils <= 0
            ? "sent"
            : paidFils >= totalFils
              ? "paid"
              : "part_paid";

    await update("trip_invoices", `id=eq.${data.id}`, {
      status,
      currency: data.currency.toUpperCase().slice(0, 3) || "AED",
      issued_date: data.issuedDate || null,
      due_date: data.dueDate || null,
      subtotal: (subtotalFils / 100).toFixed(2),
      discount: (discountFils / 100).toFixed(2),
      total: (totalFils / 100).toFixed(2),
      amount_paid: (paidFils / 100).toFixed(2),
      notes: data.notes.trim().slice(0, 2000) || null,
      published: data.published,
    });
    return { ok: true as const };
  });

const saveInvoiceItem = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      invoiceId: string;
      position: number;
      description: string;
      quantity: string;
      unitPrice: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { insert, update } = await import("@/lib/db");

    const qty = Math.max(0, Number(data.quantity) || 0);
    const unitFils = Math.max(0, toFils(data.unitPrice));
    // The unit price becomes integer fils before multiplying, and the product is
    // rounded once. Multiplying the raw double instead — 3 x 1499.99 is
    // 4499.969999999999 — happens to round correctly here, but any code that
    // truncates, or sums several such products before rounding, drifts by a fils
    // and the invoice stops agreeing with its own lines.
    const amount = (Math.round(qty * unitFils) / 100).toFixed(2);
    const unit = unitFils / 100;

    const row = {
      invoice_id: data.invoiceId,
      position: data.position,
      description: data.description.trim().slice(0, 300) || "Item",
      quantity: qty.toFixed(2),
      unit_price: unit.toFixed(2),
      amount,
    };
    if (data.id) await update("trip_invoice_items", `id=eq.${data.id}`, row);
    else await insert("trip_invoice_items", row);
    return { ok: true as const };
  });

/* -------------------------------------------------------------------------
 * Uploads
 *
 * The file goes from the browser straight to Supabase Storage; the ticket and
 * the transfer live in lib/uploads.ts, shared with the drivers page. What stays
 * here is trip-specific: recording a document once its file has landed.
 * ---------------------------------------------------------------------- */

/** Records a document once its file is in storage. */
const registerDocument = createServerFn({ method: "POST" })
  .validator(
    (input: { tripId: string; path: string; name: string; contentType: string; size: number }) =>
      input,
  )
  .handler(async ({ data }) => {
    await requireSession();
    // The path must be one this trip's ticket could have produced. Without the
    // check, a document row could point at another trip's voucher, and the
    // portal would sign it for the wrong customer.
    if (!UUID.test(data.tripId) || !data.path.startsWith(`${data.tripId}/`)) {
      return { ok: false as const };
    }
    const { insert } = await import("@/lib/db");
    await insert("trip_documents", {
      trip_id: data.tripId,
      name: data.name.slice(0, 120),
      file_path: data.path,
      doc_type: data.contentType.includes("pdf") ? "PDF" : "Image",
      visibility: "always",
      bytes: Math.round(data.size),
    });
    return { ok: true as const };
  });

/* -------------------------------------------------------------------------
 * Route
 * ---------------------------------------------------------------------- */

/**
 * `admin_` rather than `admin`, and the underscore is load-bearing.
 *
 * TanStack's flat-file routing nests `admin.trips.$id.tsx` *inside* the
 * `/admin` route, rendering it through the dashboard's <Outlet />. The dashboard
 * has no Outlet — it is a page, not a layout — so the URL changed to
 * /admin/trips/… while the dashboard went on rendering and the editor never
 * appeared. No error, no warning; "Edit itinerary" simply did nothing. The
 * trailing underscore keeps the URL at /admin/trips/$id but detaches the route
 * from the /admin layout, which is what an independent page needs.
 */
export const Route = createFileRoute("/admin_/trips/$id")({
  loader: async ({ params }) => {
    const data = await loadTrip({ data: params.id });
    if (data && "signedOut" in data) throw redirect({ to: "/admin" });
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
  drivers: Driver[];
  audit: {
    id: number;
    created_at: string;
    table_name: string;
    action: string;
    changes: Record<string, Json>;
    actor: string | null;
  }[];
  invoices: Invoice[];
  base: string;
};

function Editor() {
  const data = Route.useLoaderData() as LoaderData;
  const { trip, days, documents, drivers, invoices, audit, base } = data;
  const router = useRouter();

  /*
   * Every save ends in a refresh, and the editor is inert until it lands.
   *
   * Without this, a save's own button re-enabled the moment the write returned,
   * while the screen still showed the data from before it — for as long as the
   * reload took. That read as "my change didn't save", and it let the next
   * action start while the previous reload was still in flight. Two reloads in
   * flight can land in either order, and when the older one lands last it paints
   * stale data over the newer: an invoice that was created, and then was not on
   * the screen. Holding the page until the reload arrives makes the order the
   * office sees the order that happened.
   */
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await router.invalidate();
    } finally {
      setRefreshing(false);
    }
  };

  const [tab, setTab] = useState<"itinerary" | "details" | "documents" | "invoices" | "activity">(
    "itinerary",
  );
  const url = `${base}/t/${trip.tracking_token}`;
  const cover = trip.heroUrl ?? destinationPhoto(trip.destination);

  const tabs: [typeof tab, string, IconName][] = [
    ["itinerary", `Itinerary · ${days.length} ${days.length === 1 ? "day" : "days"}`, "calendar"],
    ["details", "Trip details", "globe"],
    ["documents", `Documents · ${documents.length}`, "file"],
    ["invoices", `Invoices · ${invoices.length}`, "receipt"],
    ["activity", "Edit history", "clock"],
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* The trip's own photograph, so every screen of the editor shows which
          customer and which place is being worked on. */}
      <header className="relative isolate overflow-hidden text-white">
        <img src={cover} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/90 via-navy-deep/65 to-navy-deep/20"
        />
        <div className="mx-auto max-w-5xl px-5 pt-5 pb-7">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/25"
            >
              <Icon name="chevronLeft" className="size-3.5" /> All trips
            </Link>
            <img src="/brand/logo-white.webp" alt="Nawi Saadi" className="h-8 w-auto" />
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-5">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-gold-light">{trip.trip_code}</p>
              <h1 className="mt-1 truncate font-display text-3xl leading-tight sm:text-4xl">
                {trip.customer?.full_name ?? trip.destination}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="globe" className="size-4 text-gold-light" /> {trip.destination}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" className="size-4 text-gold-light" /> {trip.start_date} →{" "}
                  {trip.end_date}
                </span>
                {trip.status === "cancelled" ? (
                  <span className="rounded-full bg-alert px-2.5 py-0.5 text-[11px] font-bold uppercase">
                    Cancelled
                  </span>
                ) : !trip.published_at ? (
                  <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-navy uppercase">
                    Draft — not visible yet
                  </span>
                ) : (
                  <span className="rounded-full bg-live px-2.5 py-0.5 text-[11px] font-bold uppercase">
                    Live for customer
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(url)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold backdrop-blur hover:bg-white/25"
              >
                <Icon name="link" className="size-4" /> Copy link
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-navy hover:bg-gold-light"
              >
                <Icon name="arrowRight" className="size-4" /> Preview as customer
              </a>
            </div>
          </div>
        </div>
      </header>

      {refreshing ? (
        <p
          role="status"
          className="sticky top-0 z-10 bg-gold px-5 py-1.5 text-center text-xs font-bold text-navy"
        >
          Saving…
        </p>
      ) : null}

      <main
        aria-busy={refreshing}
        className={`mx-auto max-w-5xl px-5 py-6 transition-opacity ${
          refreshing ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-hair bg-white p-1.5 shadow-sm">
          {tabs.map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                tab === id ? "bg-navy text-white shadow" : "text-navy hover:bg-sand"
              }`}
            >
              <Icon name={icon} className="size-3.5" />
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
            invoices={invoices}
            onChange={refresh}
          />
        ) : null}

        {tab === "details" ? <TripDetailsTab trip={trip} onChange={refresh} /> : null}

        {tab === "documents" ? (
          <DocumentsTab trip={trip} documents={documents} onChange={refresh} />
        ) : null}

        {tab === "invoices" ? (
          <InvoicesTab trip={trip} invoices={invoices} onChange={refresh} />
        ) : null}

        {tab === "activity" ? <ActivityTab audit={audit} /> : null}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Trip details — edit everything set at creation, the cover, and delete
 * ---------------------------------------------------------------------- */

function TripDetailsTab({ trip, onChange }: { trip: Trip; onChange: () => void | Promise<void> }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  const uploadCover = async (file: File) => {
    setProgress(0);
    setUploadError("");
    const result = await uploadDirect(file, {
      folder: trip.id,
      bucket: "trip-media",
      onProgress: setProgress,
    });
    if (!result.ok) {
      setProgress(null);
      setUploadError(result.reason);
      return;
    }
    await setCover({ data: { target: "trip", tripId: trip.id, path: result.path } });
    setProgress(null);
    await onChange();
  };

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          setSaved(false);
          const result = await updateTrip({
            data: {
              id: trip.id,
              title: String(f.get("title") ?? ""),
              destination: String(f.get("destination") ?? ""),
              startDate: String(f.get("startDate") ?? ""),
              endDate: String(f.get("endDate") ?? ""),
              adults: Number(f.get("adults") ?? 1),
              children: Number(f.get("children") ?? 0),
              emergencyName: String(f.get("emergencyName") ?? ""),
              emergencyPhone: String(f.get("emergencyPhone") ?? ""),
              customerName: String(f.get("customerName") ?? ""),
              customerPhone: String(f.get("customerPhone") ?? ""),
              customerWhatsapp: String(f.get("customerWhatsapp") ?? ""),
              cancelled: f.get("cancelled") === "on",
            },
          });
          setBusy(false);
          if (!result.ok) {
            setError(result.reason);
            return;
          }
          setSaved(true);
          await onChange();
        }}
        className="rounded-3xl border border-hair bg-white p-6 shadow-sm"
      >
        <h2 className="font-display text-2xl text-navy">Trip details</h2>
        <p className="mt-1 text-sm text-muted">
          Everything set when the trip was created. Changes show on the customer&apos;s link as soon
          as you save.
        </p>

        <fieldset className="mt-6">
          <legend className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            Customer
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <SmallField
              label="Full name"
              name="customerName"
              defaultValue={trip.customer?.full_name ?? ""}
              required
            />
            <SmallField
              label="Phone"
              name="customerPhone"
              defaultValue={trip.customer?.phone ?? ""}
            />
            <SmallField
              label="WhatsApp"
              name="customerWhatsapp"
              defaultValue={trip.customer?.whatsapp ?? ""}
            />
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            Trip
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <SmallField
              label="Title shown to the customer"
              name="title"
              defaultValue={trip.title ?? ""}
              placeholder="Five nights in the UAE"
            />
            <SmallField
              label="Destination"
              name="destination"
              defaultValue={trip.destination}
              required
            />
            <SmallField
              label="Start date"
              name="startDate"
              type="date"
              defaultValue={trip.start_date}
              required
            />
            <SmallField
              label="End date"
              name="endDate"
              type="date"
              defaultValue={trip.end_date}
              required
            />
            <SmallField
              label="Adults"
              name="adults"
              type="number"
              defaultValue={String(trip.pax_adults)}
              min="1"
            />
            <SmallField
              label="Children"
              name="children"
              type="number"
              defaultValue={String(trip.pax_children)}
              min="0"
            />
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            Emergency line shown to the customer
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <SmallField
              label="Name"
              name="emergencyName"
              defaultValue={trip.emergency_name ?? ""}
              placeholder="Nawi Saadi 24/7 desk"
            />
            <SmallField
              label="Phone"
              name="emergencyPhone"
              defaultValue={trip.emergency_phone ?? ""}
              placeholder="+971 56 122 8069"
            />
          </div>
        </fieldset>

        <label className="mt-6 flex items-start gap-2.5 rounded-2xl border border-alert/25 bg-alert/5 p-4 text-sm">
          <input
            type="checkbox"
            name="cancelled"
            defaultChecked={trip.status === "cancelled"}
            className="mt-0.5 size-4 accent-[#a3381f]"
          />
          <span>
            <span className="font-semibold text-alert">Trip cancelled</span>
            <span className="mt-0.5 block text-xs text-muted">
              The customer&apos;s link stops working. Everything is kept on file and you can undo
              this at any time.
            </span>
          </span>
        </label>

        {error ? (
          <p role="alert" className="mt-4 rounded-xl bg-alert/8 p-3 text-sm text-alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="mt-4 rounded-xl bg-live/10 p-3 text-sm text-live">
            Saved.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save trip details"}
        </button>
      </form>

      <div className="flex flex-col gap-5">
        <section className="overflow-hidden rounded-3xl border border-hair bg-white shadow-sm">
          <img
            src={trip.heroUrl ?? destinationPhoto(trip.destination)}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="p-5">
            <h3 className="font-semibold text-navy">Cover photo</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {trip.heroUrl
                ? "The first thing your customer sees when they open their link."
                : `Showing the standard photo for "${trip.destination}". Upload your own — the hotel, the view, the family's first stop.`}
            </p>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-sm font-semibold text-navy hover:bg-gold-light">
              <Icon name="camera" className="size-4" />
              {trip.heroUrl ? "Change cover photo" : "Upload cover photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={progress !== null}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (file) void uploadCover(file);
                }}
              />
            </label>
            {trip.heroUrl ? (
              <button
                type="button"
                onClick={async () => {
                  await setCover({ data: { target: "trip", tripId: trip.id, path: null } });
                  await onChange();
                }}
                className="mt-2 w-full rounded-xl border border-hair py-2 text-xs font-semibold text-muted hover:text-alert"
              >
                Remove and use the standard photo
              </button>
            ) : null}
            {progress !== null ? <UploadBar pct={progress} /> : null}
            {uploadError ? (
              <p role="alert" className="mt-2 rounded-lg bg-alert/8 p-2 text-xs text-alert">
                {uploadError}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-alert/30 bg-white p-5">
          <h3 className="font-semibold text-alert">Delete this trip</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Removes the itinerary, updates, documents, invoices and every uploaded photo and video,
            permanently. The customer&apos;s link stops working. To keep a record instead, tick
            &ldquo;Trip cancelled&rdquo;.
          </p>
          <button
            type="button"
            onClick={async () => {
              const typed = window.prompt(
                `This cannot be undone. Type the trip reference ${trip.trip_code} to delete it.`,
              );
              if (typed?.trim().toUpperCase() !== trip.trip_code.toUpperCase()) return;
              const result = await deleteTrip({ data: trip.id });
              if (result.ok) await navigate({ to: "/admin" });
            }}
            className="mt-4 w-full rounded-xl border border-alert/50 py-2.5 text-sm font-semibold text-alert hover:bg-alert hover:text-white"
          >
            Delete trip permanently
          </button>
        </section>
      </div>
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
  invoices,
  onChange,
}: {
  trip: Trip;
  days: Day[];
  drivers: Driver[];
  documents: TripDocument[];
  invoices: Invoice[];
  onChange: () => void;
}) {
  const [addingDay, setAddingDay] = useState(false);
  const [showing, setShowing] = useState(false);
  const hidden = days.filter((d) => !d.published).length;

  return (
    <div className="mt-5 flex flex-col gap-4">
      {hidden ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold bg-gold/10 p-4"
        >
          <Icon name="alert" className="size-5 shrink-0 text-gold-deep" />
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-navy">
            <strong>
              {hidden === days.length ? "Every day is" : `${hidden} of ${days.length} days are`}{" "}
              hidden from your customer.
            </strong>{" "}
            {hidden === days.length
              ? "Their link says “Your itinerary is being prepared” until a day is shown."
              : "Hidden days don't appear on their link."}
          </p>
          <button
            type="button"
            disabled={showing}
            onClick={async () => {
              setShowing(true);
              try {
                await showAllDays({ data: trip.id });
                onChange();
              } finally {
                setShowing(false);
              }
            }}
            className="rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {showing ? "Showing…" : "Show all days to the customer"}
          </button>
        </div>
      ) : null}

      {days.map((day) => (
        <DayCard
          key={day.id}
          trip={trip}
          day={day}
          drivers={drivers}
          documents={documents}
          invoices={invoices}
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
  invoices,
  onChange,
}: {
  trip: Trip;
  day: Day;
  drivers: Driver[];
  documents: TripDocument[];
  invoices: Invoice[];
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
          <DayCover tripId={trip.id} day={day} onChange={onChange} />

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
                invoices={invoices}
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

/**
 * The photo for one day — shown on the customer's day selector and above that
 * day's plan. Optional; a day without one falls back to the trip's destination
 * photo on the selector and simply has no banner.
 */
function DayCover({
  tripId,
  day,
  onChange,
}: {
  tripId: string;
  day: Day;
  onChange: () => void | Promise<void>;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setProgress(0);
    setError("");
    const result = await uploadDirect(file, {
      folder: tripId,
      bucket: "trip-media",
      onProgress: setProgress,
    });
    if (!result.ok) {
      setProgress(null);
      setError(result.reason);
      return;
    }
    await setCover({ data: { target: "day", tripId, dayId: day.id, path: result.path } });
    setProgress(null);
    await onChange();
  };

  return (
    <div className="mb-4">
      {day.coverUrl ? (
        <div className="relative overflow-hidden rounded-2xl">
          <img src={day.coverUrl} alt="" className="aspect-[16/6] w-full object-cover" />
          <div className="absolute right-2 bottom-2 flex gap-1.5">
            <label className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-navy shadow hover:bg-white">
              Change photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={progress !== null}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (file) void upload(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={async () => {
                await setCover({ data: { target: "day", tripId, dayId: day.id, path: null } });
                await onChange();
              }}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-alert shadow hover:bg-white"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-hair bg-sand py-4 text-xs font-semibold text-gold-deep hover:border-gold">
          <Icon name="camera" className="size-4" />
          Add a photo for day {day.day_number}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={progress !== null}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (file) void upload(file);
            }}
          />
        </label>
      )}
      {progress !== null ? <UploadBar pct={progress} /> : null}
      {error ? (
        <p role="alert" className="mt-2 rounded-lg bg-alert/8 p-2 text-xs text-alert">
          {error}
        </p>
      ) : null}
    </div>
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
  // Per-instance: editing Day 1 while adding Day 2 puts two of these forms on
  // screen at once, and a fixed id would point both labels at the first form.
  const summaryId = useId();

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

      <label className="mt-3 block text-xs font-semibold text-navy" htmlFor={summaryId}>
        Summary shown under the day title
      </label>
      <textarea
        id={summaryId}
        name="summary"
        rows={2}
        defaultValue={day?.summary ?? ""}
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />

      <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-navy">
        <input
          type="checkbox"
          name="published"
          defaultChecked={day?.published ?? true}
          className="size-4 accent-[#00365F]"
        />
        <span>Show this day to the customer</span>
      </label>
      <p className="mt-1 text-[11px] text-muted">
        Ticked, the day appears on the customer&apos;s link as soon as you save. Untick it only to
        keep a day hidden while you are still writing it.
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
  invoices,
  tripId,
  onChange,
}: {
  step: Step;
  dayId: string;
  drivers: Driver[];
  documents: TripDocument[];
  invoices: Invoice[];
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
        {isLatLng(step.latitude, step.longitude) ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-live/10 px-2 py-0.5 text-[10px] font-bold text-live">
            <Icon name="pin" className="size-3" /> On the map
          </span>
        ) : null}
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
              invoices={invoices}
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
              invoices={invoices}
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-white px-2.5 py-1.5 text-[11px] font-semibold text-navy hover:border-gold"
                >
                  <Icon name={BLOCK_LABELS[kind].icon} className="size-3.5 text-gold-deep" />
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
  const descriptionId = useId();
  const [place, setPlace] = useState<PickedLocation>({
    name: step?.location_name ?? "",
    lat: step?.latitude ?? undefined,
    lng: step?.longitude ?? undefined,
  });

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
            locationName: place.name,
            // Half a pin is no pin: a latitude without its longitude would
            // put the customer's map somewhere on the equator.
            latitude: isLatLng(place.lat, place.lng) ? String(place.lat) : "",
            longitude: isLatLng(place.lat, place.lng) ? String(place.lng) : "",
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

      <label className="mt-3 block text-xs font-semibold text-navy" htmlFor={descriptionId}>
        Description
      </label>
      <textarea
        id={descriptionId}
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
      <div className="mt-3">
        <LocationPicker value={place} onChange={setPlace} inputName="locationName" />
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
  invoices,
  onChange,
}: {
  block: Block;
  stepId: string;
  tripId: string;
  drivers: Driver[];
  documents: TripDocument[];
  invoices: Invoice[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const meta = BLOCK_LABELS[block.kind];

  return (
    <div className="rounded-lg border border-hair bg-white">
      <div className="flex items-center gap-2.5 p-2.5">
        <span aria-hidden="true" className="shrink-0 text-sm">
          {meta ? <Icon name={meta.icon} className="size-4 text-gold-deep" /> : null}
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
            invoices={invoices}
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
    case "invoice":
      return p.invoiceId ? "invoice attached" : "no invoice chosen";
    case "checklist":
      return `${p.items?.length ?? 0} items`;
    case "guide": {
      const n = p.steps?.length ?? 0;
      return `${p.heading ? `${p.heading} · ` : ""}${n} photo ${n === 1 ? "step" : "steps"}${
        isLatLng(p.latitude, p.longitude) ? " · meeting point pinned" : ""
      }`;
    }
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
  invoices,
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
  invoices: Invoice[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const existing = block?.payload ?? {};
  const [payload, setPayload] = useState<BlockPayload>(existing);
  const [busy, setBusy] = useState(false);
  // null when idle, otherwise 0-100. One value, so the Save button and the
  // progress text can never disagree about whether an upload is running.
  const [progress, setProgress] = useState<number | null>(null);
  const uploading = progress !== null;
  const [uploadError, setUploadError] = useState("");

  // Not Partial<BlockPayload>: under exactOptionalPropertyTypes, Partial lets a
  // key be absent but not explicitly undefined — and clearing a coordinate field
  // means writing undefined over it. This mapped type allows both.
  const uid = useId();
  const set = (patch: { [K in keyof BlockPayload]?: BlockPayload[K] | undefined }) =>
    setPayload((p) => ({ ...p, ...patch }));

  const store = async (file: File): Promise<string | null> => {
    setProgress(0);
    setUploadError("");
    const result = await uploadDirect(file, {
      folder: tripId,
      bucket: "trip-media",
      onProgress: setProgress,
    });
    setProgress(null);
    if (!result.ok) {
      setUploadError(result.reason);
      return null;
    }
    return result.path;
  };

  const upload = async (file: File, field: "path" | "poster" | "gallery") => {
    const path = await store(file);
    if (!path) return;
    // Functional update: a gallery upload finishing after another one must
    // append to the latest list, not to the one captured when it started.
    if (field === "gallery") {
      setPayload((p) => ({ ...p, paths: [...(p.paths ?? []), path] }));
    } else if (field === "poster") set({ poster: path });
    else set({ path });
  };

  const needs = FIELDS[kind];

  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-gold-deep uppercase">
        <Icon name={BLOCK_LABELS[kind].icon} className="size-3.5" /> {BLOCK_LABELS[kind].label}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{BLOCK_LABELS[kind].hint}</p>

      <div className="mt-3 flex flex-col gap-3">
        {needs.includes("heading") ? (
          <Inline
            label={kind === "guide" ? "Guide title" : "Heading"}
            value={payload.heading ?? ""}
            onChange={(v) => set({ heading: v })}
            {...(kind === "guide" ? { placeholder: "How to find your driver at Terminal 3" } : {})}
          />
        ) : null}

        {needs.includes("text") ? (
          <div>
            <label htmlFor={`${uid}-text`} className="block text-xs font-semibold text-navy">
              {kind === "guide" ? "Introduction (optional)" : "Text"}
            </label>
            <textarea
              id={`${uid}-text`}
              rows={3}
              value={payload.text ?? ""}
              onChange={(e) => set({ text: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-hair px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
        ) : null}

        {needs.includes("file") ? (
          <div>
            <label htmlFor={`${uid}-file`} className="block text-xs font-semibold text-navy">
              {kind === "video" ? "Video file" : "Image file"}
            </label>
            {payload.path ? (
              <p className="mt-1 font-mono text-[11px] break-all text-live">✓ {payload.path}</p>
            ) : null}
            <input
              id={`${uid}-file`}
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

        {needs.includes("guide") ? (
          <GuideStepsEditor
            steps={payload.steps ?? []}
            update={(fn) => setPayload((p) => ({ ...p, steps: fn(p.steps ?? []) }))}
            store={store}
            busy={uploading}
          />
        ) : null}

        {needs.includes("gallery") ? (
          <div>
            <label htmlFor={`${uid}-gallery`} className="block text-xs font-semibold text-navy">
              Images
            </label>
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
              id={`${uid}-gallery`}
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
            <label htmlFor={`${uid}-poster`} className="block text-xs font-semibold text-navy">
              Cover image for the video (optional)
            </label>
            {payload.poster ? (
              <p className="mt-1 font-mono text-[11px] break-all text-live">✓ {payload.poster}</p>
            ) : null}
            <input
              id={`${uid}-poster`}
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
          <LocationPicker
            nameLabel={kind === "guide" ? "Meeting point (the last stop)" : "Location name"}
            namePlaceholder={
              kind === "guide"
                ? "Terminal 3 car park, level 1, pillar B4"
                : "DXB Terminal 3, Exit 2"
            }
            value={{
              name: payload.locationName ?? "",
              lat: payload.latitude,
              lng: payload.longitude,
            }}
            onChange={(v) =>
              set({ locationName: v.name || undefined, latitude: v.lat, longitude: v.lng })
            }
          />
        ) : null}
        {needs.includes("driver") ? (
          <div>
            <label htmlFor={`${uid}-driver`} className="block text-xs font-semibold text-navy">
              {kind === "guide" ? "Driver waiting there (optional)" : "Driver"}
            </label>
            <select
              id={`${uid}-driver`}
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
                No drivers on file yet. Add them on the Drivers page, then they appear here.
              </p>
            ) : null}
          </div>
        ) : null}
        {needs.includes("document") ? (
          <div>
            <label htmlFor={`${uid}-document`} className="block text-xs font-semibold text-navy">
              Document
            </label>
            <select
              id={`${uid}-document`}
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
        {needs.includes("invoice") ? (
          <div>
            <label htmlFor={`${uid}-invoice`} className="block text-xs font-semibold text-navy">
              Invoice
            </label>
            <select
              id={`${uid}-invoice`}
              value={payload.invoiceId ?? ""}
              onChange={(e) => set({ invoiceId: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">— choose an invoice —</option>
              {invoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoice_number} · {money(i.total, i.currency)}
                  {i.published ? "" : " (draft)"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted">
              The customer only sees it here if the invoice itself is published. Every published
              invoice already appears in their Payment section, so use this only to put one inside a
              particular day.
            </p>
          </div>
        ) : null}

        {needs.includes("tone") ? (
          <div>
            <label htmlFor={`${uid}-tone`} className="block text-xs font-semibold text-navy">
              How urgent is this?
            </label>
            <select
              id={`${uid}-tone`}
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
            <label htmlFor={`${uid}-items`} className="block text-xs font-semibold text-navy">
              Checklist items, one per line
            </label>
            <textarea
              id={`${uid}-items`}
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

      {uploading ? <UploadBar pct={progress ?? 0} /> : null}
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
  invoice: ["invoice"],
  guide: ["heading", "text", "guide", "location", "driver"],
};

/**
 * The steps of a photo guide: one photo and one line of instruction each.
 *
 * Photos can be chosen several at a time, because that is how the office has
 * them — a colleague walks the route once, photographs each turn, and sends
 * the lot. They are added in file-name order, which on every phone camera is
 * the order they were taken, and can be reordered with the arrows after.
 */
function GuideStepsEditor({
  steps,
  update,
  store,
  busy,
}: {
  steps: GuideStep[];
  update: (fn: (steps: GuideStep[]) => GuideStep[]) => void;
  store: (file: File) => Promise<string | null>;
  busy: boolean;
}) {
  const id = useId();

  const addPhotos = async (files: File[]) => {
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
    // One at a time: the upload bar shows one file's progress, and a failed
    // file stops the batch at the step it failed on instead of leaving holes.
    for (const file of sorted) {
      const path = await store(file);
      if (!path) return;
      update((list) => [...list, { path, url: URL.createObjectURL(file), text: "" }]);
    }
  };

  const replacePhoto = async (index: number, file: File) => {
    const path = await store(file);
    if (!path) return;
    update((list) =>
      list.map((st, i) => (i === index ? { ...st, path, url: URL.createObjectURL(file) } : st)),
    );
  };

  const move = (index: number, by: number) =>
    update((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      if (item) next.splice(index + by, 0, item);
      return next;
    });

  return (
    <div>
      <p className="text-xs font-semibold text-navy">Photo steps, in walking order</p>
      <p className="mt-0.5 text-[11px] text-muted">
        One photo per turn or landmark, with one line saying what to do there.
      </p>

      {steps.length ? (
        <ol className="mt-2 flex flex-col gap-2">
          {steps.map((st, i) => (
            <li
              key={`${st.path ?? "text"}-${i}`}
              className="flex gap-3 rounded-lg border border-hair bg-paper p-2.5"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-white">
                {st.url ? (
                  <img src={st.url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-[10px] text-muted">
                    {st.path ? "Photo" : "No photo"}
                  </span>
                )}
                <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-full bg-navy text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor={`${id}-step-${i}`} className="sr-only">
                  Step {i + 1} instruction
                </label>
                <textarea
                  id={`${id}-step-${i}`}
                  rows={2}
                  value={st.text}
                  onChange={(e) => {
                    const text = e.target.value;
                    update((list) => list.map((x, j) => (j === i ? { ...x, text } : x)));
                  }}
                  placeholder={
                    i === 0
                      ? "After customs, walk out through Exit 2"
                      : "Turn left and walk past the coffee shop"
                  }
                  className="w-full rounded-lg border border-hair bg-white px-2.5 py-1.5 text-sm outline-none focus:border-gold"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-hair bg-white px-2 py-1 text-[10px] font-semibold text-navy hover:border-gold">
                    <Icon name="camera" className="size-3" />
                    {st.path ? "Replace photo" : "Add photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={busy}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        e.currentTarget.value = "";
                        if (file) void replacePhoto(i, file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move step ${i + 1} up`}
                    className="rounded border border-hair bg-white p-1 text-navy disabled:opacity-30"
                  >
                    <Icon name="arrowUp" className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === steps.length - 1}
                    aria-label={`Move step ${i + 1} down`}
                    className="rounded border border-hair bg-white p-1 text-navy disabled:opacity-30"
                  >
                    <Icon name="arrowDown" className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => update((list) => list.filter((_, j) => j !== i))}
                    aria-label={`Remove step ${i + 1}`}
                    className="ml-auto rounded border border-alert/35 bg-white p-1 text-alert"
                  >
                    <Icon name="trash" className="size-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gold/60 bg-sand px-3 py-3 text-xs font-bold text-navy hover:border-gold">
          <Icon name="camera" className="size-4 text-gold-deep" />
          {busy ? "Uploading…" : "Add photos — choose several at once"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
              if (files.length) void addPhotos(files);
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => update((list) => [...list, { text: "" }])}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-hair bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-gold"
        >
          <Icon name="plus" className="size-3.5" /> Step without a photo
        </button>
      </div>
    </div>
  );
}

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
  // useId, not a hand-built id: stable across server and client render, and
  // unique per instance even when two blocks share a field name.
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-navy">
        {label}
      </label>
      <input
        id={id}
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
  money,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  /**
   * An amount in dirhams and fils. Use this rather than `type="number"`.
   *
   * A bare number input defaults to step="1", and the browser then treats any
   * price with fils as invalid — 1499.99 is refused with "the two nearest valid
   * values are 1499 and 1500" and the form silently declines to submit. Every
   * money field on the invoice screen shipped that way: no line item or discount
   * with fils could be saved. `money` sets the step, forbids negatives, and asks
   * phones for a decimal keypad.
   */
  money?: boolean;
}) {
  // Previously `sf-${name}-${Math.random()…}`, which renders one id on the
  // server and a different one in the browser — a hydration mismatch, and a
  // label pointing at an id that no longer exists after hydration.
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-navy">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={money ? "number" : type}
        step={money ? "0.01" : undefined}
        inputMode={money ? "decimal" : undefined}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={money ? "0" : min}
        className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}

/**
 * Upload progress. A real percentage, because a 40 MB video on office wifi takes
 * long enough that a static "Uploading…" reads as frozen, and a frozen-looking
 * page is one people close.
 */
function UploadBar({ pct }: { pct: number }) {
  return (
    <div className="mt-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-xs font-semibold text-gold-deep">
        <span>{pct >= 100 ? "Finishing…" : "Uploading…"}</span>
        <span className="font-mono tabular-nums">{pct}%</span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Upload progress"
      >
        <div
          className="h-full rounded-full bg-gold transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
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
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inputId = useId();

  return (
    <div className="mt-5 rounded-2xl border border-hair bg-white p-5">
      <h2 className="font-display text-lg text-navy">Documents</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Vouchers, tickets, visas and insurance. Stored in a private bucket — the customer&apos;s
        portal serves them as links that expire after a few hours, so a voucher forwarded into a
        group chat stops working rather than staying public forever.
      </p>

      <label htmlFor={inputId} className="mt-4 block text-xs font-semibold text-navy">
        Upload a document (PDF or image, up to 25 MB)
      </label>
      <input
        id={inputId}
        type="file"
        accept="application/pdf,image/*"
        disabled={progress !== null}
        onChange={async (e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          setProgress(0);
          setError("");
          const result = await uploadDirect(file, {
            folder: trip.id,
            bucket: "trip-docs",
            onProgress: setProgress,
          });
          if (result.ok) {
            const saved = await registerDocument({
              data: {
                tripId: trip.id,
                path: result.path,
                name: file.name,
                contentType: file.type || "application/pdf",
                size: file.size,
              },
            });
            if (!saved.ok) setError("The file uploaded but could not be recorded. Try again.");
          } else {
            setError(result.reason);
          }
          setProgress(null);
          input.value = "";
          if (result.ok) onChange();
        }}
        className="mt-1.5 w-full rounded-lg border border-dashed border-hair bg-paper px-3 py-4 text-sm"
      />
      {progress !== null ? <UploadBar pct={progress} /> : null}
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
            <Icon name="file" className="size-4 shrink-0 text-gold-deep" />
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
 * Invoices
 * ---------------------------------------------------------------------- */

function InvoicesTab({
  trip,
  invoices,
  onChange,
}: {
  trip: Trip;
  invoices: Invoice[];
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="rounded-2xl border border-hair bg-white p-5">
        <h2 className="font-display text-lg text-navy">Invoices</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          An invoice stays a draft until you tick &ldquo;Show to customer&rdquo;, so you can price a
          trip up without the customer watching you do it. Totals are recalculated from the line
          items every time you save — you never type the total yourself.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await createInvoice({ data: trip.id });
            setBusy(false);
            onChange();
          }}
          className="mt-4 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? "Creating…" : "+ New invoice"}
        </button>
      </div>

      {invoices.map((invoice) => (
        <InvoiceEditor key={invoice.id} invoice={invoice} onChange={onChange} />
      ))}
    </div>
  );
}

function InvoiceEditor({ invoice, onChange }: { invoice: Invoice; onChange: () => void }) {
  const uid = useId();
  const [busy, setBusy] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const balance = balanceOf(invoice);

  return (
    <section className="overflow-hidden rounded-2xl border border-hair bg-white">
      <header className="flex flex-wrap items-center gap-2.5 border-b border-hair bg-paper p-4">
        <span className="font-mono text-sm font-bold text-navy">{invoice.invoice_number}</span>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
            invoice.published ? "bg-live/12 text-live" : "bg-gold/18 text-gold-deep"
          }`}
        >
          {invoice.published ? "Visible to customer" : "Draft"}
        </span>
        <span className="ml-auto font-mono text-sm font-bold tabular-nums text-navy">
          {money(invoice.total, invoice.currency)}
        </span>
        {Number(balance) > 0 ? (
          <span className="font-mono text-xs tabular-nums text-alert">
            {money(balance, invoice.currency)} due
          </span>
        ) : (
          <span className="text-xs font-semibold text-live">settled</span>
        )}
      </header>

      {/* ---- line items ---- */}
      <div className="p-4">
        <h3 className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
          Line items
        </h3>
        <div className="mt-2.5 flex flex-col gap-2">
          {invoice.items.map((item) => (
            <InvoiceItemRow
              key={item.id}
              item={item}
              invoiceId={invoice.id}
              currency={invoice.currency}
              onChange={onChange}
            />
          ))}
          {!invoice.items.length ? (
            <p className="rounded-lg bg-paper p-3 text-center text-xs text-muted">
              No items yet. Add one — flights, hotel, transfers, visa.
            </p>
          ) : null}
        </div>

        {addingItem ? (
          <div className="mt-2.5 rounded-lg border border-gold bg-paper p-3">
            <InvoiceItemForm
              invoiceId={invoice.id}
              position={invoice.items.length}
              onDone={() => {
                setAddingItem(false);
                onChange();
              }}
              onCancel={() => setAddingItem(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingItem(true)}
            className="mt-2.5 w-full rounded-lg border border-dashed border-hair py-2.5 text-xs font-bold text-navy hover:border-gold"
          >
            + Add line item
          </button>
        )}
      </div>

      {/* ---- totals and status ---- */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          await saveInvoice({
            data: {
              id: invoice.id,
              status: String(f.get("status") ?? "sent"),
              currency: String(f.get("currency") ?? "AED"),
              issuedDate: String(f.get("issuedDate") ?? ""),
              dueDate: String(f.get("dueDate") ?? ""),
              discount: String(f.get("discount") ?? "0"),
              amountPaid: String(f.get("amountPaid") ?? "0"),
              notes: String(f.get("notes") ?? ""),
              published: f.get("published") === "on",
            },
          });
          setBusy(false);
          onChange();
        }}
        className="border-t border-hair bg-paper p-4"
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <SmallField label="Currency" name="currency" defaultValue={invoice.currency} />
          <SmallField
            label="Issued"
            name="issuedDate"
            type="date"
            defaultValue={invoice.issued_date}
          />
          <SmallField
            label="Due"
            name="dueDate"
            type="date"
            defaultValue={invoice.due_date ?? ""}
          />
          <div>
            <label htmlFor={`${uid}-status`} className="block text-xs font-semibold text-navy">
              Invoice is
            </label>
            {/* Only the decision the office actually makes. Payment status is
                worked out from the amounts; see saveInvoice. */}
            <select
              id={`${uid}-status`}
              name="status"
              defaultValue={invoice.status === "void" ? "void" : "active"}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="active">Active</option>
              <option value="void">Cancelled</option>
            </select>
          </div>
          <SmallField
            label="Discount"
            name="discount"
            money
            defaultValue={Number(invoice.discount).toFixed(2)}
          />
          <SmallField
            label="Amount paid"
            name="amountPaid"
            money
            defaultValue={Number(invoice.amount_paid).toFixed(2)}
          />
        </div>

        <label htmlFor={`${uid}-notes`} className="mt-3 block text-xs font-semibold text-navy">
          Notes shown on the invoice
        </label>
        <textarea
          id={`${uid}-notes`}
          name="notes"
          rows={2}
          defaultValue={invoice.notes ?? ""}
          placeholder="Bank transfer details, payment deadline, what the price excludes."
          className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        />

        <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-navy">
          <input
            type="checkbox"
            name="published"
            defaultChecked={invoice.published}
            className="size-4 accent-[#00365F]"
          />
          <span>Show this invoice to the customer</span>
        </label>
        <p className="mt-1 text-[11px] text-muted">
          The customer sees &ldquo;Awaiting payment&rdquo;, &ldquo;Part paid&rdquo; or &ldquo;Paid
          in full&rdquo; — worked out from the line items and the amount paid, so it is always
          right. You only record the payment; you never set the status by hand.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save invoice"}
          </button>
          <a
            href={`/admin/invoices/${invoice.id}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-white px-4 py-2 text-xs font-semibold text-navy hover:border-navy"
          >
            <Icon name="download" className="size-3.5" /> PDF
            {invoice.published ? "" : " (draft)"}
          </a>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm(`Delete invoice ${invoice.invoice_number}?`)) return;
              await deleteRow({ data: { table: "trip_invoices", id: invoice.id } });
              onChange();
            }}
            className="ml-auto rounded-lg border border-alert/40 px-4 py-2 text-xs font-semibold text-alert"
          >
            Delete invoice
          </button>
        </div>
      </form>
    </section>
  );
}

function InvoiceItemRow({
  item,
  invoiceId,
  currency,
  onChange,
}: {
  item: InvoiceItem;
  invoiceId: string;
  currency: string;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-lg border border-gold bg-paper p-3">
        <InvoiceItemForm
          invoiceId={invoiceId}
          item={item}
          position={item.position}
          onDone={() => {
            setEditing(false);
            onChange();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-hair bg-paper p-2.5">
      <span className="min-w-0 flex-1 truncate text-sm text-ink">{item.description}</span>
      <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
        {Number(item.quantity)} × {money(item.unit_price, currency)}
      </span>
      <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-navy">
        {money(item.amount, currency)}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 rounded border border-hair bg-white px-2 py-1 text-[10px] font-semibold text-navy"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={async () => {
          await deleteRow({ data: { table: "trip_invoice_items", id: item.id } });
          onChange();
        }}
        aria-label="Delete line item"
        className="shrink-0 rounded border border-alert/35 px-2 py-1 text-[10px] font-semibold text-alert"
      >
        ✕
      </button>
    </div>
  );
}

function InvoiceItemForm({
  invoiceId,
  item,
  position,
  onDone,
  onCancel,
}: {
  invoiceId: string;
  item?: InvoiceItem;
  position: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        await saveInvoiceItem({
          data: {
            ...(item ? { id: item.id } : {}),
            invoiceId,
            position,
            description: String(f.get("description") ?? ""),
            quantity: String(f.get("quantity") ?? "1"),
            unitPrice: String(f.get("unitPrice") ?? "0"),
          },
        });
        setBusy(false);
        onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_90px_130px]">
        <SmallField
          label="Description"
          name="description"
          defaultValue={item?.description ?? ""}
          required
          placeholder="Return flights, Dubai – Tbilisi"
        />
        <SmallField
          label="Qty"
          name="quantity"
          money
          defaultValue={item ? String(Number(item.quantity)) : "1"}
        />
        <SmallField
          label="Unit price"
          name="unitPrice"
          money
          defaultValue={item ? Number(item.unit_price).toFixed(2) : "0"}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hair bg-white px-4 py-2 text-xs font-semibold text-navy"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------
 * Activity
 * ---------------------------------------------------------------------- */

function ActivityTab({ audit }: { audit: LoaderData["audit"] }) {
  return (
    <div className="mt-5 max-w-3xl">
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
              <span className="mt-0.5 block truncate text-muted">{describeChange(a.changes)}</span>
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
