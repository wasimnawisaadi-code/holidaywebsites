import { useEffect, useState } from "react";

const BUILD = /\/assets\/index-[\w-]+\.js/;

function loadedBuild(): string | null {
  for (const link of Array.from(
    document.querySelectorAll("link[rel=modulepreload], script[src]"),
  )) {
    const match = BUILD.exec(link.getAttribute("href") ?? link.getAttribute("src") ?? "");
    if (match) return match[0];
  }
  return null;
}

/**
 * Tells someone with the page open that a newer version of the portal is live.
 *
 * Each release renames the server's endpoints, so a page opened before a
 * release can no longer save or upload: every attempt fails with a vague
 * error until the page is reloaded. This compares the build the page was
 * loaded with against the one the server now sends — when the tab regains
 * focus, every few minutes, and straight away after any failed server call —
 * and offers a reload instead of leaving people to retry a dead page.
 */
export function UpdateNotice() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const mine = loadedBuild();
    if (!mine) return;
    let checking = false;
    const check = async () => {
      if (checking) return;
      checking = true;
      try {
        const res = await fetch("/", { cache: "no-store" });
        const live = BUILD.exec(await res.text())?.[0];
        if (live && live !== mine) setStale(true);
      } catch {
        // Offline or the server is busy; the next check will tell.
      } finally {
        checking = false;
      }
    };

    const original = window.fetch;
    window.fetch = async (...args) => {
      const res = await original(...args);
      const url = String(args[0] instanceof Request ? args[0].url : args[0]);
      if (url.includes("/_serverFn/") && !res.ok) void check();
      return res;
    };
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => void check(), 3 * 60_000);
    return () => {
      window.fetch = original;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, []);

  if (!stale) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-gold px-4 py-3 text-center text-sm font-semibold text-navy shadow-lg"
    >
      <span>
        The portal was just updated. Copy anything you are typing, then reload to keep saving.
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white"
      >
        Reload now
      </button>
    </div>
  );
}
