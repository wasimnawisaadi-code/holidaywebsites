import { useEffect, useRef, useState } from "react";
import { PhotoManager } from "./PhotoManager";
import { saveDayGallery } from "@/lib/day-gallery";
import { uploadDirect } from "@/lib/uploads";
import type { Day } from "@/lib/types";

export function DayPhotos({
  day,
  tripId,
  onSaved,
  onPendingChange,
}: {
  day: Day;
  tripId: string;
  onSaved: () => void | Promise<void>;
  onPendingChange?: (pending: boolean) => void;
}) {
  const existing = day.steps
    .flatMap((s) => s.blocks)
    .find((b) => b.kind === "gallery" && b.payload.dayGallery)?.payload;
  const [paths, setPaths] = useState(existing?.paths ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const pending = dirty || uploading || saving;
  const persistedPaths = JSON.stringify(existing?.paths ?? []);
  const lastSyncedPaths = useRef(persistedPaths);
  useEffect(() => {
    // Route invalidation keeps this editor mounted. Accept refreshed saved paths
    // only after they actually change, never overwrite an in-progress collection
    // with the old loader result between save completion and refresh completion.
    if (pending || lastSyncedPaths.current === persistedPaths) return;
    lastSyncedPaths.current = persistedPaths;
    setPaths(existing?.paths ?? []);
  }, [pending, persistedPaths, existing?.paths]);
  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);
  useEffect(() => {
    if (!pending) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [pending]);
  return (
    <section
      aria-label={`Day ${day.day_number} photos`}
      className="mb-5 rounded-2xl border border-gold/30 bg-sand/40 p-4"
    >
      <h3 className="font-display text-xl text-navy">Day {day.day_number} · Banner slideshow</h3>
      <p className="mt-1 mb-3 text-xs text-muted">
        Select up to 20 photos at once. They play as a slideshow at the top of day {day.day_number}:
        customers swipe through them, or tap one to see it full-screen. The first photo is the
        cover. Put them in order, then save.
      </p>
      <PhotoManager
        paths={paths}
        urls={Object.fromEntries(
          (existing?.paths ?? []).map((path, i) => [path, existing?.urls?.[i] ?? ""]),
        )}
        disabled={saving}
        onBusy={setUploading}
        onChange={(next) => {
          setPaths(next);
          setDirty(true);
          setMessage("");
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
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving || uploading || !dirty}
          onClick={async () => {
            setSaving(true);
            setMessage("");
            try {
              await saveDayGallery({ data: { dayId: day.id, tripId, paths } });
              // A loader refresh may have arrived while these edits were dirty.
              // It is older than the save that just succeeded, so do not apply it
              // if the follow-up refresh fails.
              lastSyncedPaths.current = persistedPaths;
              setDirty(false);
              setMessage("Day photos saved.");
              try {
                await onSaved();
              } catch {
                setMessage("Day photos saved. Refresh this page to see the latest preview.");
              }
            } catch {
              setMessage("Could not save. Your selected photos are still here; please retry.");
            } finally {
              setSaving(false);
            }
          }}
          className="min-h-11 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save day photos"}
        </button>
        <p role="status" className="text-xs text-muted">
          {message ||
            (uploading
              ? "Keep this page open while photos upload."
              : dirty
                ? "Unsaved photo changes — save to update the customer’s gallery."
                : "")}
        </p>
      </div>
    </section>
  );
}
