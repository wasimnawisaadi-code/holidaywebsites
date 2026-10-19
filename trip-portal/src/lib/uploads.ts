import { createServerFn } from "@tanstack/react-start";

import { requireSession } from "./session";

/**
 * Uploads, shared by the itinerary editor and the drivers page.
 *
 * The file goes from the browser straight to Supabase Storage on a one-time
 * ticket; see `signedUploadUrl` in lib/db.ts for why it cannot pass through a
 * server function (Vercel's 4.5 MB request cap). The server decides where a file
 * may go and signs a ticket for exactly that path; the browser only sends bytes.
 */

/** Mirrors the bucket configuration in migration 0002, so a refusal is explained up front. */
export const BUCKETS = {
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

export type Bucket = keyof typeof BUCKETS;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The one non-trip folder a ticket may point at. Photos only. */
const DRIVERS_FOLDER = "drivers";

export const createUploadTicket = createServerFn({ method: "POST" })
  .validator(
    (input: {
      folder: string;
      bucket: string;
      fileName: string;
      contentType: string;
      size: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireSession();

    // The folder becomes the first segment of the storage path, so it is held
    // to exactly a trip's UUID or the drivers folder. Anything else — "../", a
    // slash, an empty string — could steer the upload somewhere it should not go.
    const isDrivers = data.folder === DRIVERS_FOLDER;
    if (!isDrivers && !UUID.test(data.folder)) {
      return { ok: false as const, reason: "Unknown upload location." };
    }

    const bucket = data.bucket as Bucket;
    const rules = BUCKETS[bucket];
    if (!rules) return { ok: false as const, reason: "Unknown upload type." };

    // Checked here as well as by storage, because storage refuses only after the
    // whole file has been sent. A 180 MB video rejected after two minutes of
    // uploading is two wasted minutes; this says no before a byte moves.
    const type = data.contentType.toLowerCase();
    if (isDrivers && (bucket !== "trip-media" || !type.startsWith("image/"))) {
      return {
        ok: false as const,
        reason: "A driver photo must be an image (JPEG, PNG, WebP, HEIC).",
      };
    }
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
    // carrying a slash would write outside the folder, and one carrying spaces
    // or Arabic script breaks the signed-URL path.
    const safe =
      data.fileName
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[-.]+/, "")
        .slice(-80) || "file";
    const path = `${data.folder}/${Date.now()}-${safe}`;

    const { signedUploadUrl } = await import("./db");
    const uploadUrl = await signedUploadUrl(bucket, path);
    if (!uploadUrl)
      return { ok: false as const, reason: "Storage did not issue an upload ticket." };
    return { ok: true as const, uploadUrl, path };
  });

/**
 * Sends a file straight to storage, reporting progress.
 *
 * XMLHttpRequest rather than fetch, deliberately: fetch has no upload-progress
 * event, and a 40 MB video on office wifi is a minute of a frozen-looking screen
 * without one. People close the tab during that minute.
 */
export async function uploadDirect(
  original: File,
  opts: { folder: string; bucket: Bucket; onProgress?: (pct: number) => void },
): Promise<{ ok: true; path: string } | { ok: false; reason: string }> {
  // Photos for the itinerary are shrunk first; documents never are, because
  // the booking reader needs every pixel of a voucher.
  const file = opts.bucket === "trip-media" ? await shrinkPhoto(original) : original;
  const ticket = await createUploadTicket({
    data: {
      folder: opts.folder,
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

/** Longest side of a stored photo. Sharp on a 3x phone screen and a desktop banner. */
const MAX_SIDE = 2000;
/** Below this, a photo is already small enough to send as it is. */
const SMALL_ENOUGH = 350 * 1024;

/**
 * Resizes a photo in the browser before it is uploaded.
 *
 * Office staff upload straight from phones and stock libraries: a 986KB
 * WebP and a 599KB stock JPEG were on one customer's first screen, sent at
 * full size from storage in Seoul to a phone in Dubai. This caps the longest
 * side at 2000px and re-encodes as WebP, which typically lands between 150KB
 * and 400KB with no visible loss at the sizes the portal shows.
 *
 * Anything it cannot decode (HEIC on most browsers, video) or that would not
 * get smaller is uploaded untouched, so this can only ever save bytes.
 */
async function shrinkPhoto(file: File): Promise<File> {
  const type = (file.type || guessType(file.name)).toLowerCase();
  if (!/^image\/(jpeg|png|webp|avif)$/.test(type)) return file;
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SMALL_ENOUGH) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  }
}
