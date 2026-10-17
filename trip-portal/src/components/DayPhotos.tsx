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
  // Saved automatically: a short pause after the last change, and never
  // while a file is still uploading. Nobody has to remember a Save button.
  const saveNow = useRef<() => Promise<void>>(async () => {});
  saveNow.current = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveDayGallery({ data: { dayId: day.id, tripId, paths } });
      // A loader refresh may have arrived while these edits were dirty. It is
      // older than the save that just succeeded, so do not apply it.
      lastSyncedPaths.current = persistedPaths;
      setDirty(false);
      setMessage(
        paths.length
          ? `Saved · ${paths.length} photo${paths.length === 1 ? "" : "s"} in the day ${day.day_number} slideshow.`
          : "Saved · no banner photos for this day.",
      );
      try {
        await onSaved();
      } catch {
        setMessage("Saved. Refresh this page to see the latest preview.");
      }
    } catch {
      setMessage("Could not save the photos. They are still here; change anything to retry.");
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    if (!dirty || uploading || saving) return;
    const timer = window.setTimeout(() => void saveNow.current(), 700);
    return () => window.clearTimeout(timer);
  }, [dirty, uploading, saving, paths]);

  return (
    <section
      aria-label={`Day ${day.day_number} photos`}
      className="mb-5 rounded-2xl border border-gold/30 bg-sand/40 p-4"
    >
      <h3 className="font-display text-xl text-navy">Day {day.day_number} · Banner photos</h3>
      <p className="mt-1 mb-3 text-xs text-muted">
        Click <strong>Choose Files</strong> and select several photos at once (up to 20). They play
        as a slideshow at the top of day {day.day_number}; the first is the cover. Saved
        automatically.
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
      <p role="status" className="mt-2 text-xs text-muted">
        {uploading ? "Uploading… keep this page open." : saving ? "Saving…" : message}
      </p>
    </section>
  );
}
