import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { BRAND, waLink } from "@/data/catalogue";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp button.
 */
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
      href={waLink(message ?? `Hi ${BRAND.short}, I'd like to enquire about a holiday.`)}
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
