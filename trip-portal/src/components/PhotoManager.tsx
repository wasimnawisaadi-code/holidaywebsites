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
  onUpload: (file: File, onProgress?: (percent: number) => void) => Promise<string | null>;
  onBusy: (busy: boolean) => void;
}) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, percent: 0, name: "" });
  const [failed, setFailed] = useState<{ file: File; reason: string }[]>([]);
  const [notice, setNotice] = useState("");
  const owned = useRef<string[]>([]);
  const mounted = useRef(true);
  const uploading = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owned.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const upload = async (files: File[]) => {
    if (!files.length || uploading.current || disabled) return;
    setError("");
    setNotice("");
    if (paths.length + files.length > 20) {
      setError(
        `There is room for ${20 - paths.length} more photos. Select fewer files, or remove a photo first.`,
      );
      return;
    }
    uploading.current = true;
    setBusy(true);
    onBusy(true);
    const failures = failed.filter(({ file }) => !files.includes(file));
    setFailed([...failures]);
    const next = [...paths];
    let added = 0;
    try {
      for (const [index, file] of files.entries()) {
        if (!mounted.current) break;
        setProgress({ done: index, total: files.length, percent: 0, name: file.name });
        try {
          const type = photoType(file);
          if (!type || !file.size || file.size > 12 * 1024 * 1024) {
            throw new Error("Use a non-empty JPEG, PNG, WebP or AVIF photo up to 12 MB.");
          }
          // The storage ticket also includes a timestamp. A random suffix protects
          // same-name uploads from different tabs started in the same millisecond.
          const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
          const stem = file.name.slice(0, extension ? -extension.length : undefined).slice(0, 30);
          const uniqueFile = new File([file], `${stem}-${crypto.randomUUID()}${extension}`, {
            type,
            lastModified: file.lastModified,
          });
          const path = await onUpload(uniqueFile, (percent) => {
            if (mounted.current) setProgress((current) => ({ ...current, percent }));
          });
          if (!path) throw new Error("Upload did not complete. Please retry.");
          if (!mounted.current) break;
          if (!next.includes(path)) {
            next.push(path);
            added += 1;
            const url = URL.createObjectURL(file);
            owned.current.push(url);
            setPreviews((current) => ({ ...current, [path]: url }));
            // Keep each successful file immediately, even if a later one fails.
            onChange([...next]);
          }
        } catch (cause) {
          failures.push({
            file,
            reason: cause instanceof Error ? cause.message : "Upload failed. Please retry.",
          });
        }
        if (mounted.current)
          setProgress((current) => ({ ...current, done: index + 1, percent: 0 }));
      }
    } finally {
      uploading.current = false;
      if (mounted.current) {
        setFailed([...failures]);
        setNotice(added ? `${added} photo${added === 1 ? "" : "s"} added to your collection.` : "");
        setBusy(false);
        onBusy(false);
      }
    }
  };
  const move = (index: number, to: number) => {
    const next = [...paths];
    const [path] = next.splice(index, 1);
    if (path) next.splice(to, 0, path);
    onChange(next);
  };
  const remove = (index: number) => {
    const path = paths[index];
    const preview = path ? previews[path] : undefined;
    if (preview) {
      URL.revokeObjectURL(preview);
      owned.current = owned.current.filter((url) => url !== preview);
      setPreviews((current) => {
        const next = { ...current };
        delete next[path!];
        return next;
      });
    }
    onChange(paths.filter((_, i) => i !== index));
  };
  return (
    <div className="rounded-xl border border-hair bg-paper p-3" aria-busy={busy}>
      <p className="text-xs font-semibold text-navy">Photo collection · {paths.length} / 20</p>
      <p className="mt-1 text-xs text-muted">
        The first photo leads this gallery. Select several photos together, then put them in the
        order your customer should see them.
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
            <div className="flex flex-wrap items-center gap-1 p-2 text-[11px] font-semibold text-navy">
              {i === 0 ? (
                <span className="inline-flex min-h-10 items-center px-2 text-gold-deep">
                  Gallery cover
                </span>
              ) : (
                <button
                  type="button"
                  disabled={disabled || busy}
                  onClick={() => move(i, 0)}
                  aria-label={`Make photo ${i + 1} the gallery cover`}
                  className="min-h-10 rounded-lg px-2 hover:bg-paper focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
                >
                  Make cover
                </button>
              )}
              <button
                type="button"
                aria-label={`Move photo ${i + 1} earlier`}
                disabled={disabled || busy || i === 0}
                onClick={() => move(i, i - 1)}
                className="min-h-10 min-w-10 rounded-lg border border-hair hover:bg-paper focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                aria-label={`Move photo ${i + 1} later`}
                disabled={disabled || busy || i === paths.length - 1}
                onClick={() => move(i, i + 1)}
                className="min-h-10 min-w-10 rounded-lg border border-hair hover:bg-paper focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
              >
                →
              </button>
              <button
                type="button"
                disabled={disabled || busy}
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => remove(i)}
                className="min-h-10 rounded-lg px-2 text-alert hover:bg-paper focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
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
            ? `Uploading photos · ${progress.done} of ${progress.total} processed`
            : "Add photos"}
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={disabled || busy || paths.length >= 20}
          className="mt-2 block min-h-11 w-full text-xs file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:font-semibold file:text-white disabled:opacity-50"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void upload(files);
          }}
        />
      </label>
      {busy ? (
        <div className="mt-3">
          <progress
            className="h-2 w-full accent-navy"
            value={progress.done + (progress.done < progress.total ? progress.percent / 100 : 0)}
            max={progress.total || 1}
            aria-label="Photo upload progress"
          />
          <p className="mt-1 truncate text-xs text-muted">
            {progress.name} · {progress.percent}%
          </p>
        </div>
      ) : notice ? (
        <p role="status" className="mt-3 text-xs text-navy">
          {notice}
        </p>
      ) : null}
      {failed.length ? (
        <div className="mt-3 rounded-xl border border-alert/20 bg-white p-3">
          <p role="alert" className="text-xs font-semibold text-alert">
            {failed.length} photo{failed.length === 1 ? "" : "s"} could not be uploaded. Successful
            uploads are kept.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {failed.map(({ file, reason }, index) => (
              <li key={`${file.name}-${index}`} className="break-words">
                {file.name}: {reason}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => void upload(failed.map(({ file }) => file))}
            className="mt-3 min-h-10 rounded-lg border border-hair px-3 text-xs font-semibold text-navy disabled:opacity-40"
          >
            Retry failed photos
          </button>
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => setFailed([])}
            className="mt-3 ml-2 min-h-10 rounded-lg px-3 text-xs font-semibold text-muted disabled:opacity-40"
          >
            Dismiss failed files
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function photoType(file: File): string | undefined {
  const accepted = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (file.type) return accepted.includes(file.type) ? file.type : undefined;
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
  };
  return types[extension];
}
