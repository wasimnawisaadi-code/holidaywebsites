import { useEffect, useId, useMemo, useState } from "react";

import { Icon } from "./Icon";
import { tripMessage, whatsappHref, type MessageOptions } from "@/lib/trip-message";
import type { Day, Driver, Trip } from "@/lib/types";

/**
 * "Send trip details": the whole trip as one WhatsApp message.
 *
 * The office used to retype flights and hotels into a chat by hand. This writes
 * the message from the itinerary itself, day by day, so what the customer
 * reads in WhatsApp matches their link. The text stays editable before sending.
 */
export function SendTripDetails({
  trip,
  days,
  drivers,
  link,
}: {
  trip: Trip;
  days: Day[];
  drivers: Driver[];
  link: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<MessageOptions>({ references: true, plan: true });
  const generated = useMemo(
    () => tripMessage(trip, days, drivers, link, options),
    [trip, days, drivers, link, options],
  );
  const [text, setText] = useState(generated);
  const [copied, setCopied] = useState(false);
  // A fresh draft whenever the itinerary or the options change.
  useEffect(() => setText(generated), [generated]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const number = trip.customer?.whatsapp || trip.customer?.phone;
  const shown = days.filter((d) => d.published).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-navy hover:bg-sand"
      >
        <Icon name="chat" className="size-4" /> Send trip details
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/60 p-0 text-ink sm:items-center sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start gap-3 border-b border-hair p-5">
              <div className="min-w-0 flex-1">
                <p id={`${id}-title`} className="font-display text-2xl leading-tight text-navy">
                  Send trip details
                </p>
                <p className="mt-1 text-xs text-muted">
                  {trip.customer?.full_name ?? "Customer"}
                  {number ? ` · ${number}` : " · no WhatsApp number on file"} · {shown} of{" "}
                  {days.length} days included (hidden days are left out)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full border border-hair text-navy"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 border-b border-hair px-5 py-3 text-xs text-navy">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.plan}
                  onChange={(e) => setOptions((o) => ({ ...o, plan: e.target.checked }))}
                />
                Include each day’s activities
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.references}
                  onChange={(e) => setOptions((o) => ({ ...o, references: e.target.checked }))}
                />
                Include booking references
              </label>
            </div>

            <label htmlFor={`${id}-text`} className="sr-only">
              Message
            </label>
            <textarea
              id={`${id}-text`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-72 flex-1 resize-none bg-paper p-5 font-mono text-[12px] leading-relaxed text-ink outline-none"
            />

            <div className="flex flex-wrap items-center gap-2 border-t border-hair p-4">
              <a
                href={whatsappHref(number, text)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-live px-5 text-sm font-bold text-white"
              >
                <Icon name="chat" className="size-4" />
                {number ? "Send on WhatsApp" : "Open WhatsApp"}
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2500);
                  } catch {
                    setCopied(false);
                  }
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-hair px-4 text-sm font-semibold text-navy"
              >
                <Icon name={copied ? "check" : "file"} className="size-4" />
                {copied ? "Copied" : "Copy message"}
              </button>
              {text !== generated ? (
                <button
                  type="button"
                  onClick={() => setText(generated)}
                  className="text-xs font-semibold text-muted"
                >
                  Undo my edits
                </button>
              ) : null}
              <span className="ml-auto text-[11px] text-muted">
                Email or SMS: copy the message and paste it.
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
