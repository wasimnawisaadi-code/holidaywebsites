import { Fragment } from "react";

const LINK = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])/gi;

/**
 * Text exactly as the office typed it: every line break, blank line, indent,
 * bullet and emoji kept (pre-wrap, not pre-line, which would squash spaces),
 * long words wrapped instead of widening the page, and web addresses made
 * tappable.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(LINK);
  return (
    <p className={`break-words whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-navy underline decoration-gold underline-offset-2"
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </p>
  );
}
