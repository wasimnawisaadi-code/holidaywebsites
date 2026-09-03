import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue-brand";
import { cn } from "@/lib/utils";

/**
 * Turns the page someone is reading into the first line of their message.
 *
 * This button follows a visitor across every page of the site and always sent
 * the same sentence: "I'd like to enquire about a holiday." A consultant
 * receiving that has to open with "which holiday?", and the visitor has to
 * explain what they were already looking at — which is exactly the friction
 * the button exists to remove.
 *
 * The path already says what they were reading, so the message says it too.
 */
function contextualMessage(pathname: string): string {
  const title = (slug: string) =>
    slug
      .split("-")
      .map((w) => (w.length > 2 ? w[0]!.toUpperCase() + w.slice(1) : w))
      .join(" ");

  const pkg = /^\/holidays\/([^/?#]+)/.exec(pathname);
  if (pkg?.[1]) {
    return `Hi ${BRAND.short}, I'm looking at the ${title(pkg[1])} package. Could you send me dates and a price from Dubai?`;
  }

  const country = /^\/countries\/([^/?#]+)/.exec(pathname);
  if (country?.[1]) {
    return `Hi ${BRAND.short}, I'm interested in a holiday to ${title(country[1])}. What do you have?`;
  }

  const activity = /^\/activities\/([^/?#]+)/.exec(pathname);
  if (activity?.[1]) {
    return `Hi ${BRAND.short}, I'd like to book ${title(activity[1])}. Is it available and what does it cost?`;
  }

  if (pathname.startsWith("/deals")) {
    return `Hi ${BRAND.short}, I saw your current deals. Which ones are still available?`;
  }
  if (pathname.startsWith("/customized-tours") || pathname.startsWith("/plan")) {
    return `Hi ${BRAND.short}, I'd like a trip planned around my own dates and budget. Can you help?`;
  }
  if (
    pathname.startsWith("/activities") ||
    pathname.startsWith("/dubai") ||
    pathname.startsWith("/uae")
  ) {
    return `Hi ${BRAND.short}, I'd like to book something in Dubai. What do you recommend?`;
  }
  return `Hi ${BRAND.short}, I'm planning a holiday from Dubai. Could someone help me with options?`;
}

export function WhatsAppFab({ message }: { message?: string }) {
  const [shown, setShown] = useState(false);
  const pathname = useRouterState({ select: (s) => s?.location?.pathname ?? "" });

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={waLink(message ?? contextualMessage(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      // Kept in the DOM and faded so the transition has something to animate;
      // pointer-events are dropped while hidden so it cannot be clicked or
      // tabbed to before it appears.
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={cn(
        "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#00365F] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#CAA42D] hover:text-[#00365F]",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <MessageCircle className="size-5" aria-hidden />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
