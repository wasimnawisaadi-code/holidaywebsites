import { useState } from "react";
import { PhotoManager } from "./PhotoManager";
import { saveDayGallery } from "@/lib/day-gallery";
import { uploadDirect } from "@/lib/uploads";
import type { Day } from "@/lib/types";

export function DayPhotos({
  day,
  tripId,
  onSaved,
}: {
  day: Day;
  tripId: string;
  onSaved: () => void;
}) {
  const existing = day.steps
    .flatMap((s) => s.blocks)
    .find((b) => b.kind === "gallery" && b.payload.dayGallery)?.payload;
  const [paths, setPaths] = useState(existing?.paths ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <section
      aria-label={`Day ${day.day_number} photos`}
      className="mb-5 rounded-2xl border border-gold/30 bg-sand/40 p-4"
    >
      <h3 className="font-display text-xl text-navy">Day {day.day_number} · Photo gallery</h3>
      <p className="mt-1 mb-3 text-xs text-muted">
        Add up to 20 photos for this day. Reorder them below; customers can tap any photo to view
        the full gallery.
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
        onUpload={async (file) => {
          const result = await uploadDirect(file, { folder: tripId, bucket: "trip-media" });
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
              setDirty(false);
              setMessage("Day photos saved.");
              onSaved();
            } catch {
              setMessage("Could not save. Your selected photos are still here; please retry.");
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save day photos"}
        </button>
        <p role="status" className="text-xs text-muted">
          {message || (dirty ? "Unsaved photo changes" : "")}
        </p>
      </div>
    </section>
  );
}
