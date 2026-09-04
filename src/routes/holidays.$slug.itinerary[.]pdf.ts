import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { BRAND, offices } from "@/data/catalogue-brand";
import { dayHeadline, flexibilityNotes, showSummary } from "@/lib/itinerary";

/**
 * A downloadable itinerary for one holiday package.
 *
 * Built here rather than in the browser on purpose. A PDF library on the
 * client would be a few hundred kilobytes on the critical path of every
 * package page for a button most visitors never press; in a server route it
 * costs the page nothing and the visitor gets a real file rather than a print
 * dialog to fight with.
 *
 * The catalogue is imported inside the handler so it lands in this route's own
 * chunk rather than the one every page loads.
 *
 * Nothing here is invented. Every line comes from the catalogue: if a package
 * has no price the sheet says "Price on request", and days without a detailed
 * breakdown fall back to the summary itinerary rather than being filled in.
 */

const NAVY = rgb(0, 0.212, 0.373); // #00365F
const GOLD = rgb(0.478, 0.392, 0.106); // #7A641B, the readable gold
const INK = rgb(0.11, 0.14, 0.16);
const MUTED = rgb(0.42, 0.47, 0.51);
const RULE = rgb(0.85, 0.88, 0.9);

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 52;
const CONTENT_W = A4.w - MARGIN * 2;

/**
 * pdf-lib's standard fonts are WinAnsi-encoded and throw on anything outside
 * it. Catalogue copy carries curly quotes, en dashes and the odd accent, so
 * they are folded down rather than allowed to fail the whole document.
 */
function ascii(text: string): string {
  return text
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x20-\x7E\n]/g, "");
}

/** Greedy wrap to a pixel width, since PDF has no line boxes. */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Cursor over a growing document, adding pages as the content needs them. */
class Sheet {
  page: PDFPage;
  y: number;
  pages: PDFPage[] = [];

  constructor(
    private doc: PDFDocument,
    private regular: PDFFont,
    private bold: PDFFont,
  ) {
    this.page = this.newPage();
    this.y = A4.h - MARGIN;
  }

  private newPage(): PDFPage {
    const page = this.doc.addPage([A4.w, A4.h]);
    this.pages.push(page);
    return page;
  }

  /** Breaks to a new page when `needed` points will not fit above the footer. */
  room(needed: number): void {
    if (this.y - needed > MARGIN + 40) return;
    this.page = this.newPage();
    this.y = A4.h - MARGIN;
  }

  text(
    value: string,
    opts: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      gap?: number;
      indent?: number;
    } = {},
  ): void {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.regular;
    const indent = opts.indent ?? 0;
    for (const line of wrap(value, font, size, CONTENT_W - indent)) {
      this.room(size + 4);
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color: opts.color ?? INK,
      });
      this.y -= size + 4;
    }
    this.y -= opts.gap ?? 0;
  }

  rule(gap = 10): void {
    this.room(gap + 6);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: A4.w - MARGIN, y: this.y },
      thickness: 0.75,
      color: RULE,
    });
    this.y -= gap;
  }

  heading(value: string): void {
    this.room(46);
    this.y -= 12;
    this.text(value.toUpperCase(), { size: 9, bold: true, color: GOLD });
    this.y -= 2;
    this.rule(12);
  }

  bullets(items: readonly string[], marker = "-"): void {
    for (const item of items) {
      this.text(`${marker}  ${item}`, { size: 9.5, indent: 8 });
    }
  }
}

export const Route = createFileRoute("/holidays/$slug/itinerary.pdf")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [{ packages }, { packageDetail }] = await Promise.all([
          import("@/data/catalogue"),
          import("@/data/package-details"),
        ]);
        const pkg = packages.find((p) => p.slug === params.slug);
        // A plain 404, not notFound(). That helper is for a route rendering a
        // React not-found component; thrown inside a server handler it escapes
        // as an unhandled error and the request 500s, which tells a crawler the
        // server is broken rather than that the package does not exist.
        if (!pkg) {
          return new Response("No such package.", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        const detail = packageDetail(params.slug);

        const doc = await PDFDocument.create();
        const regular = await doc.embedFont(StandardFonts.Helvetica);
        const bold = await doc.embedFont(StandardFonts.HelveticaBold);
        const sheet = new Sheet(doc, regular, bold);

        // --- masthead -----------------------------------------------------
        sheet.text(BRAND.name.toUpperCase(), { size: 8.5, bold: true, color: GOLD });
        sheet.y -= 6;
        sheet.text(pkg.title, { size: 19, bold: true, color: NAVY });
        sheet.y -= 2;

        const price =
          pkg.priceStatus === "from" && pkg.priceFrom
            ? `From AED ${pkg.priceFrom.toLocaleString("en-US")} per person`
            : "Price on request";
        sheet.text(`${pkg.country}  |  ${pkg.days} days / ${pkg.nights} nights  |  ${price}`, {
          size: 10,
          color: MUTED,
        });
        sheet.rule(16);

        // --- overview -----------------------------------------------------
        const overview = detail?.overview ?? pkg.intro;
        if (overview) {
          sheet.text(overview, { size: 10, gap: 6 });
        }

        if (pkg.route?.length) {
          sheet.heading("Route");
          sheet.text(pkg.route.join("  >  "), { size: 10, bold: true, color: NAVY });
        }

        if (pkg.highlights?.length) {
          sheet.heading("Highlights");
          sheet.bullets(pkg.highlights);
        }

        // --- day by day ---------------------------------------------------
        if (pkg.itinerary?.length) {
          sheet.heading(`Day by day  (${pkg.itinerary.length} days)`);
          for (const day of pkg.itinerary) {
            // Keep a day's title with at least its first lines of body.
            sheet.room(70);
            const blocks = detail?.dayBlocks?.find((b) => b.day === day.day);
            sheet.text(`Day ${day.day}: ${dayHeadline(day.title, blocks?.morning)}`, {
              size: 11,
              bold: true,
              color: NAVY,
            });
            if (showSummary(day.summary, Boolean(blocks))) {
              sheet.text(day.summary, { size: 9.5 });
            }
            if (blocks) {
              for (const [label, value] of [
                ["Morning", blocks.morning],
                ["Afternoon", blocks.afternoon],
                ["Evening", blocks.evening],
                ["Overnight", blocks.overnight],
              ] as const) {
                if (value) sheet.text(`${label}:  ${value}`, { size: 9, indent: 8, color: MUTED });
              }
            } else if (day.activities?.length) {
              sheet.bullets(day.activities);
            }

            const meals = blocks?.meals ?? day.meals;
            if (meals) sheet.text(`Meals:  ${meals}`, { size: 9, indent: 8, color: MUTED });
            if (day.transport) {
              sheet.text(`Transport:  ${day.transport}`, { size: 9, indent: 8, color: MUTED });
            }
            sheet.y -= 8;
          }
        }

        // --- what is and is not included ------------------------------------
        const inclusions = detail?.inclusions?.length ? detail.inclusions : pkg.inclusions;
        if (inclusions?.length) {
          sheet.heading("Included");
          sheet.bullets(inclusions);
        }

        const exclusions = detail?.exclusions?.length ? detail.exclusions : pkg.exclusions;
        if (exclusions?.length) {
          sheet.heading("Not included");
          sheet.bullets(exclusions);
        }

        if (detail?.importantInfo?.length) {
          sheet.heading("Good to know");
          for (const note of detail.importantInfo) {
            sheet.text(note.title, { size: 9.5, bold: true });
            sheet.text(note.body, { size: 9.5, indent: 8, color: MUTED });
          }
        }

        // --- how to book ------------------------------------------------------
        const dubai = offices.find((o) => o.city === "Dubai");
        const notes = flexibilityNotes(pkg);
        sheet.heading("Flights, and changing anything on this itinerary");
        sheet.text(notes.flights, { size: 9.5 });
        sheet.text(notes.tailorMade, { size: 9.5, gap: 4 });
        sheet.text(
          "Prices are a lead-in fare and move with the season, the airline and the hotel chosen. " +
            "Tell us your dates and we will confirm a firm quotation.",
          { size: 9.5, color: MUTED, gap: 6 },
        );
        sheet.text(`WhatsApp / phone:  ${BRAND.phone}`, { size: 10, bold: true, color: NAVY });
        sheet.text(`Email:  ${BRAND.email}`, { size: 10 });
        sheet.text(`Web:  www.nawisaadiholidays.com`, { size: 10 });
        if (dubai) sheet.text(`Office:  ${dubai.address}`, { size: 10 });

        // --- footer on every page ---------------------------------------------
        const stamp = new Date().toISOString().slice(0, 10);
        sheet.pages.forEach((page, i) => {
          page.drawLine({
            start: { x: MARGIN, y: MARGIN + 22 },
            end: { x: A4.w - MARGIN, y: MARGIN + 22 },
            thickness: 0.75,
            color: RULE,
          });
          page.drawText(ascii(`${BRAND.name}  ·  Issued ${stamp}`), {
            x: MARGIN,
            y: MARGIN + 8,
            size: 8,
            font: regular,
            color: MUTED,
          });
          const label = `Page ${i + 1} of ${sheet.pages.length}`;
          page.drawText(label, {
            x: A4.w - MARGIN - regular.widthOfTextAtSize(label, 8),
            y: MARGIN + 8,
            size: 8,
            font: regular,
            color: MUTED,
          });
        });

        doc.setTitle(`${ascii(pkg.title)} - Itinerary`);
        doc.setAuthor(BRAND.name);
        doc.setSubject(`${pkg.days} day / ${pkg.nights} night holiday in ${pkg.country}`);
        doc.setCreator(BRAND.name);

        const bytes = await doc.save();
        return new Response(bytes as unknown as BodyInit, {
          headers: {
            "Content-Type": "application/pdf",
            // `attachment` so the button downloads rather than opening a
            // viewer the visitor then has to back out of.
            "Content-Disposition": `attachment; filename="${params.slug}-itinerary.pdf"`,
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
