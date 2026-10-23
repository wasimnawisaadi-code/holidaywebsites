import { useRef, useState, type TextareaHTMLAttributes } from "react";

import { RichText } from "./RichText";
import { COLORS, FONTS, SIZES, plainText, type StyleTag } from "@/lib/text-format";

/**
 * A textarea with a font toolbar: font, size, bold, italic, underline and
 * colour. Select words and click to style them; click with nothing selected
 * to style the whole text. A preview shows exactly what the customer sees.
 *
 * Drop-in for <textarea>: it works whether the parent reads the value with
 * `onChange` or from the form on submit, because each change is written into
 * the element and announced with a real input event.
 */
export function FormatTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const box = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(String(props.value ?? props.defaultValue ?? ""));
  const shown = props.value !== undefined ? String(props.value) : text;

  const write = (next: string, selectFrom: number, selectTo: number) => {
    const el = box.current;
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(el, next);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    setText(next);
    el.focus();
    el.setSelectionRange(selectFrom, selectTo);
  };

  /** Wraps the selection (or everything) in a tag; the same tag around it is replaced, not doubled. */
  const apply = (tag: StyleTag, value?: string) => {
    const el = box.current;
    if (!el) return;
    const all = el.value;
    let from = el.selectionStart;
    let to = el.selectionEnd;
    if (from === to) {
      from = 0;
      to = all.length;
    }
    if (from === to) return;
    const open = `[${tag}${value ? `=${value}` : ""}]`;
    const close = `[/${tag}]`;
    // Already wrapped in this tag: swap its value, or remove it if clicked again.
    const existing = new RegExp(`^\\[${tag}(?:=[a-z]+)?\\]([\\s\\S]*)\\[\\/${tag}\\]$`);
    const inner = existing.exec(all.slice(from, to));
    if (inner) {
      const same = all.slice(from, to).startsWith(open);
      const replacement = same ? inner[1]! : `${open}${inner[1]}${close}`;
      write(all.slice(0, from) + replacement + all.slice(to), from, from + replacement.length);
      return;
    }
    const replacement = `${open}${all.slice(from, to)}${close}`;
    write(all.slice(0, from) + replacement + all.slice(to), from, from + replacement.length);
  };

  const clear = () => {
    const el = box.current;
    if (!el) return;
    const all = el.value;
    let from = el.selectionStart;
    let to = el.selectionEnd;
    if (from === to) {
      from = 0;
      to = all.length;
    }
    const cleaned = plainText(all.slice(from, to));
    write(all.slice(0, from) + cleaned + all.slice(to), from, from + cleaned.length);
  };

  const styled = shown !== plainText(shown);
  const button =
    "grid min-h-9 min-w-9 place-items-center rounded-md border border-hair bg-white px-2 text-xs text-navy transition hover:border-gold";

  return (
    <div className="mt-1.5">
      <div
        role="toolbar"
        aria-label="Text style"
        className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-b-0 border-hair bg-paper p-1.5"
      >
        <select
          aria-label="Font"
          value=""
          onChange={(e) => {
            if (e.target.value) apply("font", e.target.value);
          }}
          className="min-h-9 rounded-md border border-hair bg-white px-2 text-xs text-navy"
        >
          <option value="">Font…</option>
          {Object.entries(FONTS).map(([key, f]) => (
            <option key={key} value={key} style={{ fontFamily: f.family }}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Size"
          value=""
          onChange={(e) => {
            if (e.target.value) apply("size", e.target.value);
          }}
          className="min-h-9 rounded-md border border-hair bg-white px-2 text-xs text-navy"
        >
          <option value="">Size…</option>
          {Object.entries(SIZES).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => apply("b")}
          className={`${button} font-bold`}
          title="Bold"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => apply("i")}
          className={`${button} italic`}
          title="Italic"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => apply("u")}
          className={`${button} underline`}
          title="Underline"
          aria-label="Underline"
        >
          U
        </button>
        <span className="mx-0.5 h-6 w-px bg-hair" aria-hidden="true" />
        {Object.entries(COLORS).map(([key, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => apply("color", key)}
            title={c.label}
            aria-label={`Colour ${c.label}`}
            className="grid size-9 place-items-center rounded-md border border-hair bg-white hover:border-gold"
          >
            <span className="size-4 rounded-full" style={{ background: c.value }} />
          </button>
        ))}
        <button type="button" onClick={clear} className={button} title="Remove styles">
          Clear style
        </button>
      </div>
      <textarea
        {...props}
        ref={box}
        onInput={(e) => {
          setText(e.currentTarget.value);
          props.onInput?.(e);
        }}
        className={`${props.className ?? ""} !mt-0 rounded-t-none`}
      />
      <p className="mt-1 text-[11px] text-muted">
        Select words, then pick a font, size, style or colour. Nothing selected styles the whole
        text.
      </p>
      {styled ? (
        <div className="mt-2 rounded-lg border border-dashed border-gold/50 bg-white p-3">
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-gold-deep uppercase">
            Customer sees
          </p>
          <RichText text={shown} className="text-[15px] leading-relaxed text-ink" />
        </div>
      ) : null}
    </div>
  );
}
