import { useEffect, useRef, useState } from "react";

export function PhotoManager({
  paths,
  urls,
  disabled,
  onChange,
  onUpload,
  onBusy,
}: {
  paths: string[];
  urls: Record<string, string>;
  disabled: boolean;
  onChange: (paths: string[]) => void;
  onUpload: (file: File) => Promise<string | null>;
  onBusy: (busy: boolean) => void;
}) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const owned = useRef<string[]>([]);
  useEffect(() => () => owned.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const move = (index: number, to: number) => {
    const next = [...paths];
    const [path] = next.splice(index, 1);
    if (path) next.splice(to, 0, path);
    onChange(next);
  };
  return (
    <div className="rounded-xl border border-hair bg-paper p-3">
      <p className="text-xs font-semibold text-navy">Photo collection · {paths.length}</p>
      <p className="mt-1 text-xs text-muted">
        The first photo is the cover. Add several, choose a cover, or change the order.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {paths.map((path, i) => (
          <div key={path} className="overflow-hidden rounded-xl border border-hair bg-white">
            {previews[path] || urls[path] ? (
              <img
                src={previews[path] || urls[path]}
                alt={`Itinerary photo ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-24 w-full object-cover"
              />
            ) : (
              <div className="grid h-24 place-items-center bg-sand text-xs text-muted">
                Photo {i + 1} · saved
              </div>
            )}
            <div className="flex flex-wrap gap-2 p-2 text-[11px] font-semibold text-navy">
              {i === 0 ? (
                <span className="text-gold-deep">Cover</span>
              ) : (
                <button type="button" disabled={disabled || busy} onClick={() => move(i, 0)}>
                  Make cover
                </button>
              )}
              <button
                type="button"
                aria-label={`Move photo ${i + 1} earlier`}
                disabled={disabled || busy || i === 0}
                onClick={() => move(i, i - 1)}
                className="disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                aria-label={`Move photo ${i + 1} later`}
                disabled={disabled || busy || i === paths.length - 1}
                onClick={() => move(i, i + 1)}
                className="disabled:opacity-30"
              >
                →
              </button>
              <button
                type="button"
                disabled={disabled || busy}
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => onChange(paths.filter((_, n) => n !== i))}
                className="text-alert"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="mt-3 block text-xs font-semibold text-navy">
        <span role="status" aria-live="polite">
          {busy
            ? `Uploading photos · ${progress.done} of ${progress.total} complete`
            : "Add photos"}
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={disabled || busy}
          className="mt-2 block w-full text-xs"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            setError("");
            if (paths.length + files.length > 20) {
              setError("Keep each collection to 20 photos or fewer.");
              return;
            }
            if (
              files.some(
                (f) =>
                  !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(f.type) ||
                  f.size > 12 * 1024 * 1024,
              )
            ) {
              setError("Use JPEG, PNG, WebP or AVIF photos up to 12 MB each.");
              return;
            }
            setBusy(true);
            setProgress({ done: 0, total: files.length });
            onBusy(true);
            const added: string[] = [];
            try {
              for (const file of files) {
                const path = await onUpload(file);
                if (!path) {
                  setError(
                    "Upload stopped. Completed photos have been kept; please retry the remaining photos.",
                  );
                  break;
                }
                added.push(path);
                setProgress({ done: added.length, total: files.length });
                const url = URL.createObjectURL(file);
                owned.current.push(url);
                setPreviews((p) => ({ ...p, [path]: url }));
              }
            } catch {
              setError("Some photos could not be uploaded. Completed uploads have been kept.");
            } finally {
              onChange([...paths, ...added]);
              setBusy(false);
              onBusy(false);
            }
          }}
        />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
