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
export function AnalyticsTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
        const textParam = href.includes("text=") ? decodeURIComponent(href.split("text=")[1] ?? "") : "";
        track("whatsapp_click", {
          context: window.location.pathname,
          label,
          intent: textParam,
          href: href.slice(0, 500),
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
