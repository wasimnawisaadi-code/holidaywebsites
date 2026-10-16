import { useId, useState } from "react";

import { Icon } from "./Icon";
import { readBookingFile, type BookingKind } from "@/lib/booking-ai";
import { uploadDirect } from "@/lib/uploads";

/**
 * "Upload the booking": a ticket or voucher, photo or PDF, read into the form.
 *
 * The parent decides what to fill and reports back how many fields it filled,
 * so the message says what actually changed rather than what was read.
 */
export function BookingAutofill({
  tripId,
  kind,
  available,
  disabled,
  onRead,
}: {
  tripId: string;
  kind: BookingKind;
  available: boolean;
  disabled?: boolean | undefined;
  /** Returns how many form fields were filled from the document. */
  onRead: (fields: Record<string, string>) => number;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const noun = kind === "flight" ? "e-ticket" : "hotel voucher";

  if (!available) return null;

  const read = async (file: File) => {
    if (file.size > 12 * 1024 * 1024) return setError("Choose a file smaller than 12 MB.");
    setBusy(true);
    setError("");
    setMessage("");
    setTranscript("");
    try {
      // trip-docs: a booking is often a PDF, which only that private bucket accepts.
      const upload = await uploadDirect(file, {
        folder: tripId,
        bucket: "trip-docs",
        onProgress: setProgress,
      });
      setProgress(null);
      if (!upload.ok) return setError(upload.reason);
      const result = await readBookingFile({
        data: { tripId, bucket: "trip-docs", path: upload.path, kind },
      });
      if (!result.ok) return setError(result.reason);
      setTranscript(result.rawText);
      const filled = onRead(result.fields);
      setMessage(
        filled
          ? `Filled ${filled} detail${filled === 1 ? "" : "s"} from ${file.name}. Please check them below.${
              result.warning ? ` ${result.warning}` : ""
            }`
          : `Read ${file.name}, but found nothing new to fill. ${result.warning ?? ""}`.trim(),
      );
    } catch {
      setError("The document could not be read. Type the details below instead.");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-navy/25 bg-paper p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-navy">
        <Icon name="file" className="size-4 text-gold-deep" />
        Have the {noun}? Upload it
      </p>
      <p className="mt-1 text-xs text-muted">
        A photo or PDF. We read it and fill in the {kind === "flight" ? "flight" : "dates, room"}{" "}
        details for you. Anything you already typed is kept.
      </p>
      <label
        htmlFor={id}
        className={`mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-white ${
          busy || disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {busy
          ? progress !== null
            ? `Uploading… ${progress}%`
            : "Reading the document…"
          : `Upload ${noun}`}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        disabled={busy || disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void read(file);
        }}
      />
      {message ? (
        <p role="status" className="mt-3 rounded-lg bg-live/10 p-3 text-xs text-live">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-alert/8 p-3 text-xs text-alert">
          {error}
        </p>
      ) : null}
      {transcript ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] font-semibold text-navy">
            Show the text we read
          </summary>
          <pre className="mt-1.5 max-h-48 overflow-auto rounded-lg bg-white p-2 font-mono text-[11px] whitespace-pre-wrap text-ink">
            {transcript}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
