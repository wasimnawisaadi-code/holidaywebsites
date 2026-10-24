import { useEffect, useId, useRef, useState } from "react";

import { guessType, importPhotoFromLink, uploadDirect } from "@/lib/uploads";

/**
 * One photo, such as the driver's face or the car: choose a file, or paste a
 * copied photo or its web address into the box.
 */
export function SinglePhoto({
  label,
  folder,
  path,
  url,
  onChange,
  onBusy,
}: {
  label: string;
  folder: string;
  path: string | undefined;
  /** The saved photo's signed URL, for the preview. */
  url?: string | null | undefined;
  onChange: (path: string | undefined) => void;
  onBusy?: ((busy: boolean) => void) | undefined;
}) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const owned = useRef<string | null>(null);
  const inFlight = useRef(false);
  const previewPath = useRef<string | undefined>(undefined);
  useEffect(
    () => () => {
      if (owned.current) URL.revokeObjectURL(owned.current);
    },
    [],
  );

  const run = async (task: () => Promise<{ path: string; preview: string | null } | string>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    onBusy?.(true);
    setError("");
    try {
      const result = await task();
      if (typeof result === "string") setError(result);
      else {
        if (owned.current) URL.revokeObjectURL(owned.current);
        owned.current = result.preview?.startsWith("blob:") ? result.preview : null;
        setPreview(result.preview);
        previewPath.current = result.path;
        onChange(result.path);
      }
    } catch {
      setError("The photo could not be added. Try again; if it keeps failing, reload the page.");
    } finally {
      inFlight.current = false;
      setBusy(false);
      onBusy?.(false);
    }
  };

  const fromFile = (file: File) =>
    run(async () => {
      if (!(file.type || guessType(file.name)).startsWith("image/"))
        return "Choose a photo (JPEG, PNG, WebP).";
      const result = await uploadDirect(file, { folder, bucket: "trip-media" });
      return result.ok ? { path: result.path, preview: URL.createObjectURL(file) } : result.reason;
    });
  const fromLink = (address: string) =>
    run(async () => {
      const result = await importPhotoFromLink({ data: { folder, url: address } });
      return result.ok ? { path: result.path, preview: result.url } : result.reason;
    });

  const shown = path ? (previewPath.current === path ? preview || url : url) : null;
  return (
    <div
      className="rounded-xl border border-hair bg-white p-3"
      onPaste={(e) => {
        if (inFlight.current) {
          e.preventDefault();
          return;
        }
        const file = e.clipboardData.files[0];
        const text = e.clipboardData.getData("text").trim();
        if (file) {
          e.preventDefault();
          void fromFile(file);
        } else if (/^https?:\/\/\S+$/i.test(text)) {
          e.preventDefault();
          void fromLink(text);
        }
      }}
    >
      <p className="text-xs font-semibold text-navy">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        {shown ? (
          <img src={shown} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-sand text-[10px] text-muted">
            {path ? "Saved" : "No photo"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <label
            htmlFor={id}
            className="inline-flex min-h-10 cursor-pointer items-center rounded-lg bg-navy px-3 text-xs font-semibold text-white"
          >
            {busy ? "Adding…" : path ? "Change photo" : "Choose photo"}
          </label>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={busy}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void fromFile(file);
            }}
          />
          {path ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (owned.current) URL.revokeObjectURL(owned.current);
                owned.current = null;
                previewPath.current = undefined;
                setPreview(null);
                onChange(undefined);
              }}
              className="ml-2 min-h-10 rounded-lg px-2 text-xs font-semibold text-alert"
            >
              Remove
            </button>
          ) : null}
          <input
            aria-label={`${label}: paste a photo or link`}
            placeholder="or click here and Ctrl+V a photo / link"
            disabled={busy}
            onKeyDown={(e) => {
              const value = e.currentTarget.value.trim();
              if (e.key === "Enter" && /^https?:\/\/\S+$/i.test(value)) {
                e.preventDefault();
                e.currentTarget.value = "";
                void fromLink(value);
              }
            }}
            className="mt-2 block min-h-9 w-full rounded-lg border border-hair px-2 text-xs outline-none focus:border-gold"
          />
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-[11px] text-alert">
          {error}
          {error.includes("sign-in expired") ? (
            <a href="/admin" target="_blank" rel="noopener noreferrer" className="ml-2 underline">
              Sign in in a new tab
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
