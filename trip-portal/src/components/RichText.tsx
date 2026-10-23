import { Fragment, useEffect, type CSSProperties, type ReactNode } from "react";

import {
  COLORS,
  FONTS,
  SIZES,
  parseStyled,
  usesHandwriting,
  type StyledNode,
} from "@/lib/text-format";

const LINK = /(https?:\/\/[^\s<>"'[\]]+[^\s<>"'.,;:!?)[\]])/gi;

/**
 * Text exactly as the office typed it: every line break, blank line, indent,
 * bullet and emoji kept (pre-wrap, not pre-line, which would squash spaces),
 * long words wrapped instead of widening the page, web addresses made
 * tappable, and the fonts, sizes and colours chosen with the editor's
 * toolbar (see lib/text-format.ts).
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const handwriting = usesHandwriting(text);
  useEffect(() => {
    if (handwriting) loadHandwritingFont();
  }, [handwriting]);
  return (
    <p className={`break-words whitespace-pre-wrap ${className}`}>{render(parseStyled(text))}</p>
  );
}

function render(nodes: StyledNode[]): ReactNode {
  return nodes.map((node, i) => {
    if (node.type === "text") return <Fragment key={i}>{linkify(node.text)}</Fragment>;
    const children = render(node.children);
    switch (node.tag) {
      case "b":
        return (
          <strong key={i} className="font-bold">
            {children}
          </strong>
        );
      case "i":
        return <em key={i}>{children}</em>;
      case "u":
        return (
          <span key={i} className="underline underline-offset-2">
            {children}
          </span>
        );
      default: {
        const style: CSSProperties = {};
        if (node.tag === "font" && node.value && node.value in FONTS)
          style.fontFamily = FONTS[node.value as keyof typeof FONTS].family;
        if (node.tag === "font" && node.value === "handwritten") style.fontSize = "1.2em";
        if (node.tag === "size" && node.value && node.value in SIZES) {
          style.fontSize = SIZES[node.value as keyof typeof SIZES].size;
          style.lineHeight = 1.35;
        }
        if (node.tag === "color" && node.value && node.value in COLORS)
          style.color = COLORS[node.value as keyof typeof COLORS].value;
        return (
          <span key={i} style={style}>
            {children}
          </span>
        );
      }
    }
  });
}

function linkify(text: string): ReactNode {
  const parts = text.split(LINK);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
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
  );
}

/** The handwriting font is fetched only by pages whose text uses it. */
function loadHandwritingFont() {
  if (typeof document === "undefined" || document.getElementById("ns-font-caveat")) return;
  const link = document.createElement("link");
  link.id = "ns-font-caveat";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap";
  document.head.appendChild(link);
}
