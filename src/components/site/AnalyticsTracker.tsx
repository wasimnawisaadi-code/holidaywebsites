import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { track, analyticsEnabled } from "@/lib/analytics";

/**
 * Site-wide event capture. Renders nothing.
 *
 * Mounted once in the root so every route is covered without each page having
 * to remember to log anything — the failure mode of per-page tracking is that
 * the page nobody instrumented is the one you needed data on.
 *
 * Captured here:
 *   - a page view on every client-side navigation, with the previous path
 *   - every WhatsApp, phone and email click, anywhere on the site, by
 *     delegating from the document rather than wiring each link
 *   - scroll depth at 25/50/75/100%, once per page
 *   - time on page, sent when the tab is hidden or closed
 *
 * Click capture uses a single delegated listener in the capture phase, so it
 * still fires for a link that navigates away immediately, and it works for
 * links added later by any component.
 */
/**
 * Which kind of page an enquiry came from, as a value rather than a path the
 * dashboard has to parse again.
 */
function pageType(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/holidays/")) return "package";
  if (path.startsWith("/countries/")) return "country";
  if (path.startsWith("/activities/")) return "activity";
  return path.split("/")[1] || "home";
}

/** The package, country or activity slug, when the path carries one. */
function slugOf(path: string): string {
  const m = /^\/(?:holidays|countries|activities)\/([^/?#]+)/.exec(path);
  return m?.[1] ?? "";
}

export function AnalyticsTracker() {
  const pathname = useRouterState({ select: (s) => s?.location?.pathname ?? "" });
  const previous = useRef<string | null>(null);
  const enteredAt = useRef<number>(Date.now());
  const depthsSent = useRef<Set<number>>(new Set());

  // ---- page views -------------------------------------------------------
  useEffect(() => {
    if (!analyticsEnabled()) return;

    track("page_view", { from: previous.current, title: document.title });

    // A route-specific event as well, so the dashboard can answer "which
    // packages get looked at" without parsing paths.
    const pkg = /^\/holidays\/([^/]+)/.exec(pathname)?.[1];
    const country = /^\/countries\/([^/]+)/.exec(pathname)?.[1];
    const activity = /^\/activities\/([^/]+)/.exec(pathname)?.[1];
    if (pkg) track("package_view", { slug: pkg });
    else if (country) track("country_view", { slug: country });
    else if (activity) track("activity_view", { slug: activity });

    previous.current = pathname;
    enteredAt.current = Date.now();
    depthsSent.current = new Set();
  }, [pathname]);

  // ---- delegated click capture -----------------------------------------
  useEffect(() => {
    if (!analyticsEnabled()) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      // Trim to something readable in a dashboard; some CTAs wrap an icon plus
      // two lines of copy.
      const label = (link.textContent ?? "").trim().slice(0, 80);

      if (href.includes("wa.me") || href.includes("whatsapp")) {
        // The prefilled message is the single most valuable thing this site
        // records: it is the customer's own statement of what they want,
        // captured at the moment they decide to ask. It was being read with
        // `href.split("text=")[1]`, which swallows any parameter that happens
        // to follow `text=` and mis-decodes a message containing an ampersand.
        // Parsing the URL properly is both correct and shorter.
        let intent = "";
        let phone = "";
        try {
          const url = new URL(href, window.location.origin);
          intent = url.searchParams.get("text") ?? "";
          // wa.me/<number> — which line the enquiry was routed to.
          phone = url.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
        } catch {
          /* a malformed href should not lose the event */
        }

        // The message is written as "Key: value" lines by waLink() callers, so
        // the office can be shown the enquiry as fields rather than as a wall
        // of text they have to re-read in the dashboard.
        const fields: Record<string, string> = {};
        for (const line of intent.split("\n")) {
          const at = line.indexOf(":");
          if (at < 1) continue;
          const key = line.slice(0, at).trim().toLowerCase();
          const value = line.slice(at + 1).trim();
          if (key && value && key.length < 24) fields[key] = value.slice(0, 160);
        }

        track("whatsapp_click", {
          context: window.location.pathname,
          label,
          // Full message, not a 90-character preview. This is the payload the
          // whole analytics table exists to capture.
          intent: intent.slice(0, 1500),
          fields,
          phone,
          // What the visitor was looking at, as structured values rather than
          // a path to be parsed again in the dashboard.
          page_type: pageType(window.location.pathname),
          slug: slugOf(window.location.pathname),
          title: document.title,
        });
        return;
      }
      if (href.startsWith("tel:")) {
        track("phone_click", { label, number: href.replace("tel:", "") });
        return;
      }
      if (href.startsWith("mailto:")) {
        track("email_click", { label });
        return;
      }
      if (/^https?:\/\//.test(href) && !href.includes(window.location.host)) {
        track("outbound_click", { href: href.slice(0, 200), label });
      }
    };

    // Capture phase: a link that unloads the page still reports first.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // ---- scroll depth -----------------------------------------------------
  useEffect(() => {
    if (!analyticsEnabled()) return;

    let raf = 0;
    const read = () => {
      raf = 0;
      const scrollable = document.body.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.round((window.scrollY / scrollable) * 100);
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark && !depthsSent.current.has(mark)) {
          depthsSent.current.add(mark);
          track("scroll_depth", { depth: mark, path: window.location.pathname });
        }
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // ---- time on page -----------------------------------------------------
  useEffect(() => {
    if (!analyticsEnabled()) return;

    const send = () => {
      const seconds = Math.round((Date.now() - enteredAt.current) / 1000);
      // Sub-second hits are bounces or prefetches; they add noise, not signal.
      if (seconds < 2) return;
      track("page_view", { phase: "exit", seconds, path: window.location.pathname });
    };

    // `visibilitychange` is the only event reliably delivered on mobile when a
    // tab is backgrounded or the browser is killed; `beforeunload` is not.
    const onHidden = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [pathname]);

  return null;
}
