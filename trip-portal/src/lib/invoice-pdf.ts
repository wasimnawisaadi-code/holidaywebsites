/**
 * Invoice PDFs. Server-only.
 *
 * Built on the server with pdf-lib, the same way the website builds its
 * itinerary sheets: a PDF library in the browser would be a few hundred
 * kilobytes on every portal load for a button most customers press once, and
 * the customer gets a real file for their employer, their visa file or their
 * bank rather than a print dialog.
 *
 * Every figure comes from the invoice row. Nothing is recomputed here — the
 * totals were computed in integer fils when the office saved, and printing a
 * second calculation would create a second answer that could disagree.
 */

if (typeof window !== "undefined") {
  throw new Error("invoice-pdf.ts is server-only.");
}

import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import logoData from "../assets/logo-ink.png?inline";
import { balanceOf, money, INVOICE_STATUS_LABELS, type Invoice } from "./types";

const NAVY = rgb(0, 0.212, 0.373); // #00365F
const GOLD = rgb(0.792, 0.643, 0.176); // #CAA42D
const GOLD_TEXT = rgb(0.561, 0.455, 0.125); // #8F7420 — gold that reads on white
const INK = rgb(0.208, 0.22, 0.267); // #353844
const MUTED = rgb(0.4, 0.4, 0.4); // #666666
const HAIR = rgb(0.898, 0.898, 0.898); // #E5E5E5
const SAND = rgb(0.969, 0.961, 0.945); // #F7F5F1

const A4 = { w: 595.28, h: 841.89 };
const M = 48;
const W = A4.w - M * 2;

export type InvoicePdfInput = {
  invoice: Invoice;
  tripCode: string;
  destination: string;
  startDate: string;
  endDate: string;
  customerName: string | null;
  customerPhone: string | null;
  /** Watermark text for anything that is not a final, issued invoice. */
  watermark?: string | null | undefined;
};

/**
 * pdf-lib's standard fonts are WinAnsi and throw on anything outside it. Curly
 * quotes and dashes are folded to their plain forms and Latin accents kept;
 * anything else (Arabic, Dari, emoji) is dropped rather than allowed to fail the
 * whole document. A name that is entirely in Arabic script therefore cannot be
 * printed with these fonts, and says so instead of printing as a blank.
 */
function winAnsi(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function printable(text: string | null | undefined, fallback: string): string {
  const out = winAnsi(text);
  if (out) return out;
  return text && text.trim() ? fallback : "";
}

/** Greedy wrap to a width in points, since PDF has no line boxes. */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const para of winAnsi(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function longDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function buildInvoicePdf(input: InvoicePdfInput): Promise<Uint8Array> {
  const { invoice } = input;
  const doc = await PDFDocument.create();
  doc.setTitle(`Invoice ${invoice.invoice_number}`);
  doc.setAuthor("Nawi Saadi Travel & Tourism");
  doc.setCreator("Nawi Saadi Trip Portal");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const logo = await doc.embedPng(dataUrlBytes(logoData));

  const pages: PDFPage[] = [];
  let page = addPage(doc, pages, logo, input.watermark, bold);
  let y = A4.h - M;

  const text = (
    s: string,
    x: number,
    yy: number,
    opts: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      align?: "left" | "right";
    } = {},
  ) => {
    const size = opts.size ?? 10;
    const font = opts.font ?? regular;
    const str = winAnsi(s);
    const width = font.widthOfTextAtSize(str, size);
    page.drawText(str, {
      x: opts.align === "right" ? x - width : x,
      y: yy,
      size,
      font,
      color: opts.color ?? INK,
    });
  };

  /** Starts a new page if fewer than `need` points remain. */
  const ensure = (need: number) => {
    if (y - need < M + 40) {
      page = addPage(doc, pages, logo, input.watermark, bold);
      y = A4.h - M - 70;
    }
  };

  // ---- header: logo left, the word INVOICE and its facts right ----------
  const logoH = 52;
  const logoW = (logo.width / logo.height) * logoH;
  page.drawImage(logo, { x: M, y: y - logoH, width: logoW, height: logoH });

  text("INVOICE", A4.w - M, y - 18, { size: 24, font: bold, color: NAVY, align: "right" });
  text(invoice.invoice_number, A4.w - M, y - 36, {
    size: 12,
    font: mono,
    color: GOLD_TEXT,
    align: "right",
  });
  y -= logoH + 22;

  page.drawRectangle({ x: M, y, width: W, height: 2, color: GOLD });
  y -= 26;

  // ---- from / bill to / facts ----------------------------------------------
  const col2 = M + W * 0.36;
  const col3 = M + W * 0.7;
  text("FROM", M, y, { size: 7.5, font: bold, color: GOLD_TEXT });
  text("BILL TO", col2, y, { size: 7.5, font: bold, color: GOLD_TEXT });
  text("DETAILS", col3, y, { size: 7.5, font: bold, color: GOLD_TEXT });
  y -= 15;

  const from = [
    "Nawi Saadi Travel & Tourism",
    "Millenium Building, Naif Road",
    "Deira, Dubai, UAE",
    "+971 56 122 8069",
    "nawisaadiholidays@gmail.com",
  ];
  const billTo = [
    printable(input.customerName, "(name in non-Latin script)") || "-",
    input.customerPhone ?? "",
    `Trip ${input.tripCode}`,
    printable(input.destination, input.tripCode),
    `${longDate(input.startDate)} - ${longDate(input.endDate)}`,
  ].filter(Boolean);
  const facts: [string, string][] = [
    ["Issued", longDate(invoice.issued_date)],
    ["Due", invoice.due_date ? longDate(invoice.due_date) : "On receipt"],
    ["Status", INVOICE_STATUS_LABELS[invoice.status]],
    ["Currency", invoice.currency],
  ];

  const rows = Math.max(from.length, billTo.length, facts.length);
  for (let i = 0; i < rows; i++) {
    const f = from[i];
    if (f) text(f, M, y, { size: 9, font: i === 0 ? bold : regular, color: i === 0 ? NAVY : INK });
    const b = billTo[i];
    if (b) {
      const clipped = wrap(b, i === 0 ? bold : regular, 9, col3 - col2 - 10)[0] ?? "";
      text(clipped, col2, y, {
        size: 9,
        font: i === 0 ? bold : regular,
        color: i === 0 ? NAVY : INK,
      });
    }
    const fact = facts[i];
    if (fact) {
      text(fact[0], col3, y, { size: 8.5, color: MUTED });
      text(fact[1], A4.w - M, y, { size: 8.5, font: bold, align: "right" });
    }
    y -= 13.5;
  }
  y -= 16;

  // ---- line items --------------------------------------------------------
  const cQty = M + W * 0.6;
  const cUnit = M + W * 0.8;
  const cAmt = A4.w - M;
  const descW = W * 0.52;

  const header = () => {
    page.drawRectangle({ x: M, y: y - 8, width: W, height: 24, color: SAND });
    text("DESCRIPTION", M + 10, y, { size: 7.5, font: bold, color: GOLD_TEXT });
    text("QTY", cQty, y, { size: 7.5, font: bold, color: GOLD_TEXT, align: "right" });
    text("UNIT PRICE", cUnit, y, { size: 7.5, font: bold, color: GOLD_TEXT, align: "right" });
    text("AMOUNT", cAmt - 10, y, { size: 7.5, font: bold, color: GOLD_TEXT, align: "right" });
    y -= 26;
  };
  header();

  if (!invoice.items.length) {
    text("No line items.", M + 10, y, { size: 9.5, color: MUTED });
    y -= 20;
  }
  for (const item of invoice.items) {
    const lines = wrap(item.description, regular, 9.5, descW);
    const h = Math.max(1, lines.length) * 12.5 + 10;
    if (y - h < M + 40) {
      ensure(h + 30);
      header();
    }
    lines.forEach((l, i) => text(l, M + 10, y - i * 12.5, { size: 9.5 }));
    text(String(Number(item.quantity)), cQty, y, { size: 9.5, align: "right" });
    text(money(item.unit_price, invoice.currency), cUnit, y, {
      size: 9.5,
      font: mono,
      align: "right",
    });
    text(money(item.amount, invoice.currency), cAmt - 10, y, {
      size: 9.5,
      font: mono,
      align: "right",
    });
    y -= h;
    page.drawLine({
      start: { x: M, y: y + 5 },
      end: { x: A4.w - M, y: y + 5 },
      thickness: 0.6,
      color: HAIR,
    });
  }
  y -= 12;

  // ---- totals ------------------------------------------------------------
  ensure(140);
  const tLabel = M + W * 0.55;
  const total = (label: string, value: string, strong = false) => {
    text(label, tLabel, y, {
      size: strong ? 10.5 : 9.5,
      font: strong ? bold : regular,
      color: strong ? NAVY : MUTED,
    });
    text(value, cAmt - 10, y, {
      size: strong ? 10.5 : 9.5,
      font: strong ? bold : mono,
      color: strong ? NAVY : INK,
      align: "right",
    });
    y -= strong ? 17 : 15;
  };
  total("Subtotal", money(invoice.subtotal, invoice.currency));
  if (Number(invoice.discount) > 0)
    total("Discount", `- ${money(invoice.discount, invoice.currency)}`);
  total("Total", money(invoice.total, invoice.currency), true);
  if (Number(invoice.amount_paid) > 0) total("Paid", money(invoice.amount_paid, invoice.currency));

  const balance = balanceOf(invoice);
  const settled = Number(balance) <= 0;
  y -= 6;
  page.drawRectangle({
    x: tLabel - 12,
    y: y - 12,
    width: A4.w - M - tLabel + 12,
    height: 34,
    color: settled ? rgb(0.9, 0.96, 0.93) : NAVY,
  });
  text(settled ? "SETTLED" : "BALANCE DUE", tLabel, y, {
    size: 9,
    font: bold,
    color: settled ? rgb(0.106, 0.478, 0.325) : GOLD,
  });
  text(money(settled ? "0" : balance, invoice.currency), cAmt - 10, y - 1, {
    size: 13,
    font: bold,
    color: settled ? rgb(0.106, 0.478, 0.325) : rgb(1, 1, 1),
    align: "right",
  });
  y -= 44;

  // ---- notes ---------------------------------------------------------------
  if (invoice.notes) {
    const lines = wrap(invoice.notes, regular, 9, W);
    ensure(lines.length * 12 + 30);
    text("NOTES", M, y, { size: 7.5, font: bold, color: GOLD_TEXT });
    y -= 14;
    for (const l of lines) {
      ensure(14);
      text(l, M, y, { size: 9, color: INK });
      y -= 12;
    }
  }

  // ---- footer on every page ------------------------------------------------
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: M, y: M + 18 },
      end: { x: A4.w - M, y: M + 18 },
      thickness: 0.6,
      color: HAIR,
    });
    const footer =
      "Nawi Saadi Travel & Tourism  ·  IATA accredited  ·  DTCM approved  ·  Since 2009";
    p.drawText(winAnsi(footer), { x: M, y: M + 4, size: 7.5, font: regular, color: MUTED });
    const n = `Page ${i + 1} of ${pages.length}`;
    p.drawText(n, {
      x: A4.w - M - regular.widthOfTextAtSize(n, 7.5),
      y: M + 4,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  });

  return doc.save();
}

/**
 * A new page, with the watermark drawn first so everything else sits on top of
 * it. A draft or cancelled invoice must not be mistakable for a real one when
 * printed, forwarded or attached to a visa application.
 */
function addPage(
  doc: PDFDocument,
  pages: PDFPage[],
  _logo: PDFImage,
  watermark: string | null | undefined,
  bold: PDFFont,
): PDFPage {
  const page = doc.addPage([A4.w, A4.h]);
  pages.push(page);
  if (watermark) {
    const size = 96;
    const w = bold.widthOfTextAtSize(watermark, size);
    page.drawText(watermark, {
      x: A4.w / 2 - (w / 2) * Math.cos(Math.PI / 6),
      y: A4.h / 2 - (w / 2) * Math.sin(Math.PI / 6),
      size,
      font: bold,
      color: rgb(0.9, 0.3, 0.2),
      opacity: 0.12,
      rotate: degrees(30),
    });
  }
  return page;
}
