import { createFileRoute, Link, useRouter, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";

import type { Json } from "@/lib/views";
import {
  balanceOf,
  money,
  toFils,
  type Amount,
  type Invoice,
  type InvoiceItem,
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
    const { viewsForTrip, auditForTrip } = await import("@/lib/views");
    const { portalBaseUrl } = await import("@/lib/urls");

    // One batch: the trip and its activity only need the id we already hold.
    const [trip, views, audit] = await Promise.all([
      tripForAdmin(id),
      viewsForTrip(id, 60),
      auditForTrip(id, 40),
    ]);
    if (!trip) return null;
    return { ...trip, views, audit, base: portalBaseUrl() };
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
        for (const path of [p.path, p.poster, ...(p.paths ?? [])]) {
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
 * The file goes from the browser straight to Supabase Storage; see
 * signedUploadUrl in lib/db.ts for why it cannot pass through this function.
 * These two server functions never touch the bytes. One decides where a file
 * may go and signs a ticket for exactly that place; the other records a
 * document once it has landed.
 * ---------------------------------------------------------------------- */

/** Mirrors the bucket configuration in 0002, so a refusal is explained up front. */
const BUCKETS = {
  "trip-media": {
    maxBytes: 200 * 1024 * 1024,
    types: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/heic",
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ],
  },
  "trip-docs": {
    maxBytes: 25 * 1024 * 1024,
    types: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  },
} as const;

type Bucket = keyof typeof BUCKETS;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createUploadTicket = createServerFn({ method: "POST" })
  .validator(
    (input: {
      tripId: string;
      bucket: string;
      fileName: string;
      contentType: string;
      size: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();

    // The trip id becomes the first segment of the storage path, so it is held
    // to the exact shape of a UUID. Anything else — "../", a slash, an empty
    // string — could otherwise steer the upload outside the trip's own folder.
    if (!UUID.test(data.tripId)) return { ok: false as const, reason: "Unknown trip." };

    const bucket = data.bucket as Bucket;
    const rules = BUCKETS[bucket];
    if (!rules) return { ok: false as const, reason: "Unknown upload type." };

    // Checked here as well as by storage, because storage's refusal arrives as
    // an opaque error after the whole file has been sent. A 180 MB video that
    // is rejected after two minutes of uploading is a wasted two minutes; this
    // says no before a byte moves, and says why.
    const type = data.contentType.toLowerCase();
    if (!(rules.types as readonly string[]).includes(type)) {
      return {
        ok: false as const,
        reason:
          bucket === "trip-docs"
            ? "Documents must be a PDF or an image (JPEG, PNG, WebP)."
            : "Use a photo (JPEG, PNG, WebP, HEIC) or a video (MP4, MOV, WebM).",
      };
    }
    if (!Number.isFinite(data.size) || data.size <= 0) {
      return { ok: false as const, reason: "That file is empty." };
    }
    if (data.size > rules.maxBytes) {
      return {
        ok: false as const,
        reason: `That file is ${Math.ceil(data.size / 1048576)} MB. The limit is ${
          rules.maxBytes / 1048576
        } MB — try trimming the clip or exporting at a lower resolution.`,
      };
    }

    // The server chooses the name; the browser only suggests one. A filename
    // carrying a slash would write outside the trip's prefix, and one carrying
    // spaces or Arabic script breaks the signed-URL path.
    const safe =
      data.fileName
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[-.]+/, "")
        .slice(-80) || "file";
    const path = `${data.tripId}/${Date.now()}-${safe}`;

    const { signedUploadUrl } = await import("@/lib/db");
    const uploadUrl = await signedUploadUrl(bucket, path);
    if (!uploadUrl)
      return { ok: false as const, reason: "Storage did not issue an upload ticket." };
    return { ok: true as const, uploadUrl, path };
  });

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

/**
 * Sends a file straight to storage, reporting progress.
 *
 * XMLHttpRequest rather than fetch, deliberately: fetch has no upload-progress
 * event, and a 40 MB video on office wifi is a minute of a frozen-looking
 * screen without one. People close the tab during that minute.
 */
async function uploadDirect(
  file: File,
  opts: { tripId: string; bucket: Bucket; onProgress?: (pct: number) => void },
): Promise<{ ok: true; path: string } | { ok: false; reason: string }> {
  const ticket = await createUploadTicket({
    data: {
      tripId: opts.tripId,
      bucket: opts.bucket,
      fileName: file.name,
      // Some phones hand over HEIC or MOV with an empty type; infer it from the
      // extension rather than refusing a perfectly good file.
      contentType: file.type || guessType(file.name),
      size: file.size,
    },
  });
  if (!ticket.ok) return { ok: false, reason: ticket.reason };

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || guessType(file.name));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, path: ticket.path });
      else resolve({ ok: false, reason: `Upload refused by storage (${xhr.status}).` });
    };
    xhr.onerror = () => resolve({ ok: false, reason: "The connection dropped during upload." });
    xhr.send(file);
  });
}

function guessType(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    pdf: "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

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
  invoices: Invoice[];
  base: string;
};

function Editor() {
  const data = Route.useLoaderData() as LoaderData;
  const { trip, days, documents, drivers, progress, invoices, views, audit, base } = data;
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

  const [tab, setTab] = useState<"itinerary" | "documents" | "invoices" | "activity">("itinerary");
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
        <nav className="flex gap-1 rounded-xl border border-hair bg-white p-1">
          {(
            [
              ["itinerary", `Itinerary (${days.length} days)`],
              ["documents", `Documents (${documents.length})`],
              ["invoices", `Invoices (${invoices.length})`],
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
            invoices={invoices}
            onChange={refresh}
          />
        ) : null}

        {tab === "documents" ? (
          <DocumentsTab trip={trip} documents={documents} onChange={refresh} />
        ) : null}

        {tab === "invoices" ? (
          <InvoicesTab trip={trip} invoices={invoices} onChange={refresh} />
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

  return (
    <div className="mt-5 flex flex-col gap-4">
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
  const descriptionId = useId();

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

  const upload = async (file: File, field: "path" | "poster" | "gallery") => {
    setProgress(0);
    setUploadError("");
    const result = await uploadDirect(file, {
      tripId,
      bucket: "trip-media",
      onProgress: setProgress,
    });
    setProgress(null);
    if (!result.ok) {
      setUploadError(result.reason);
      return;
    }
    // Functional update: a gallery upload finishing after another one must
    // append to the latest list, not to the one captured when it started.
    if (field === "gallery") {
      setPayload((p) => ({ ...p, paths: [...(p.paths ?? []), result.path] }));
    } else if (field === "poster") set({ poster: result.path });
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
            <label htmlFor={`${uid}-text`} className="block text-xs font-semibold text-navy">
              Text
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
            <label htmlFor={`${uid}-driver`} className="block text-xs font-semibold text-navy">
              Driver
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
                No drivers on file yet. Add them in Supabase → trip_drivers, then they appear here.
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
            tripId: trip.id,
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
