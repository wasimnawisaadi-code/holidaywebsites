/**
 * Styled itinerary text, stored as plain text with small tags the editor's
 * toolbar inserts: [b]bold[/b], [i]italic[/i], [u]underline[/u],
 * [size=big]…[/size], [font=elegant]…[/font], [color=gold]…[/color].
 *
 * Plain text rather than HTML on purpose: nothing typed into the editor can
 * ever become markup on the customer's page. Every value is looked up in the
 * tables below, so an unknown font or colour is simply ignored.
 */

export const FONTS = {
  modern: { label: "Modern", family: "Inter, system-ui, sans-serif" },
  elegant: { label: "Elegant", family: '"Playfair Display", Georgia, serif' },
  classic: { label: "Classic", family: 'Georgia, "Times New Roman", serif' },
  typewriter: { label: "Typewriter", family: '"Courier New", ui-monospace, monospace' },
  handwritten: { label: "Handwritten", family: '"Caveat", "Segoe Script", cursive' },
} as const;

export const SIZES = {
  small: { label: "Small", size: "0.85em" },
  big: { label: "Big", size: "1.25em" },
  huge: { label: "Huge", size: "1.6em" },
} as const;

export const COLORS = {
  navy: { label: "Navy", value: "#00365f" },
  gold: { label: "Gold", value: "#8f7420" },
  green: { label: "Green", value: "#1b7a53" },
  red: { label: "Red", value: "#a3381f" },
  grey: { label: "Grey", value: "#666666" },
} as const;

export type StyleTag = "b" | "i" | "u" | "size" | "font" | "color";

export type StyledNode =
  | { type: "text"; text: string }
  | { type: "tag"; tag: StyleTag; value: string | undefined; children: StyledNode[] };

const TAG = /\[(\/?)(b|i|u|size|font|color)(?:=([a-z]+))?\]/gi;


/** Accept common pasted formatting without interpreting arbitrary HTML. */
function normalizeFormatting(input: string): string {
  return input
    .replace(/&lt;(\/?(?:b|strong|i|em|u|br|p)\s*\/?)&gt;/gi, "<$1>")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?p>/gi, "")
    .replace(/<(\/?)(b|strong|i|em|u)>/gi, (_, slash, tag) => {
      const name = tag.toLowerCase();
      return '[' + slash + (name === 'strong' ? 'b' : name === 'em' ? 'i' : name) + ']';
    })
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_, stars, underscores) => '[b]' + (stars ?? underscores) + '[/b]');
}

/** Parse known formatting; discard orphan closing tags left by editing. */
export function parseStyled(input: string): StyledNode[] {
  input = normalizeFormatting(input);
  const root: StyledNode[] = [];
  const stack: { tag: StyleTag; value: string | undefined; children: StyledNode[] }[] = [];
  const current = () => (stack.length ? stack[stack.length - 1]!.children : root);
  let at = 0;
  for (const match of input.matchAll(TAG)) {
    const index = match.index ?? 0;
    if (index > at) current().push({ type: "text", text: input.slice(at, index) });
    at = index + match[0].length;
    const closing = match[1];
    const tag = match[2]!.toLowerCase() as StyleTag;
    const value = match[3]?.toLowerCase();
    if (!closing) {
      stack.push({ tag, value, children: [] });
      continue;
    }
    const open = stack.map((s) => s.tag).lastIndexOf(tag);
    if (open < 0) {
      continue;
    }
    while (stack.length > open) {
      const done = stack.pop()!;
      current().push({ type: "tag", ...done });
    }
  }
  if (at < input.length) current().push({ type: "text", text: input.slice(at) });
  while (stack.length) {
    const done = stack.pop()!;
    current().push({ type: "tag", ...done });
  }
  return root;
}

/** The words alone, for WhatsApp messages and one-line summaries. */
export function plainText(input: string | null | undefined): string {
  return normalizeFormatting(input ?? "").replace(TAG, "");
}

export const usesHandwriting = (input: string) => input.includes("[font=handwritten]");
