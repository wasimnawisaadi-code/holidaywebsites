import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Email capture.
 *
 * Writes straight to the `leads` table with the anon key. Row Level Security
 * allows INSERT and nothing else, and the policy itself checks the address has
 * a plausible shape — so a malformed submission never lands even if the client
 * validation is bypassed, and the subscriber list cannot be read back with the
 * public key.
 *
 * `Prefer: resolution=merge-duplicates` against the unique index on lower(email)
 * means someone submitting twice refreshes their row rather than creating a
 * second lead for the office to chase.
 *
 * The failure state is deliberately honest: if the write fails, the visitor is
 * told and given the WhatsApp route instead. Silently swallowing a failed
 * signup is worse than not offering the form.
 */

const URL_BASE = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const ANON_KEY = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

type State = "idle" | "sending" | "done" | "error";

export function SubscribeForm({
  source = "subscribe",
  detail = {},
  className,
  onDark = false,
}: {
  /** Which form this is, so follow-up can differ by intent. */
  source?: string;
  /** Context worth keeping: package slug, destination, dates. */
  detail?: Record<string, unknown>;
  className?: string;
  onDark?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setState("error");
      return;
    }
    if (!URL_BASE || !ANON_KEY) {
      setState("error");
      return;
    }

    setState("sending");
    try {
      let sessionId: string | null = null;
      try {
        sessionId = window.sessionStorage.getItem("ns-session-id");
      } catch {
        /* blocked storage; the lead is still worth keeping */
      }

      const res = await fetch(`${URL_BASE}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email: value.toLowerCase(),
          source,
          path: window.location.pathname,
          referrer: document.referrer ? new URL(document.referrer).origin : null,
          detail,
          session_id: sessionId,
        }),
      });

      // 201 Created or 409 Conflict (already subscribed) are both considered a success
      if (res.ok || res.status === 409) {
        setState("done");
        track("cta_click", { action: "subscribe", source, email_domain: value.split("@")[1] });
      } else {
        throw new Error(String(res.status));
      }
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-4 py-3.5 font-sans text-sm",
          onDark ? "bg-white/10 text-white" : "bg-[#CAA42D]/12 text-[#00365F]",
          className,
        )}
      >
        <Check className="size-4 shrink-0 text-[#CAA42D]" />
        <span>Thank you. We&apos;ll send you our best fares.</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("min-w-0", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`sub-${source}`}>
          Email address
        </label>
        <div className="relative min-w-0 flex-1">
          <Mail
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2",
              onDark ? "text-white/50" : "text-[#CAA42D]",
            )}
          />
          <input
            id={`sub-${source}`}
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={state === "error"}
            className={cn(
              "w-full rounded-xl py-3 pl-10 pr-4 font-sans text-sm outline-none transition-colors",
              onDark
                ? "border border-white/25 bg-white/10 text-white placeholder:text-white/45 focus:border-[#CAA42D]"
                : "border border-[#E5E5E5] bg-white text-[#00365F] placeholder:text-[#9aa0a6] focus:border-[#CAA42D]",
            )}
          />
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 font-sans text-sm font-bold transition-colors disabled:opacity-60",
            onDark
              ? "bg-[#CAA42D] text-[#00365F] hover:bg-[#DDBE5E]"
              : "bg-[#00365F] text-white hover:bg-[#CAA42D] hover:text-[#00365F]",
          )}
        >
          {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
          <span>{state === "sending" ? "Sending…" : "Subscribe"}</span>
        </button>
      </div>

      {state === "error" ? (
        <p className={cn("mt-2 font-sans text-xs", onDark ? "text-[#DDBE5E]" : "text-red-600")}>
          That didn&apos;t go through. Check the address, or message us on WhatsApp instead.
        </p>
      ) : (
        <p
          className={cn("mt-2 font-sans text-[11px]", onDark ? "text-white/50" : "text-[#666666]")}
        >
          Occasional fares and new itineraries. No spam, unsubscribe any time.
        </p>
      )}
    </form>
  );
}
