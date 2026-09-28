import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * The office's copy of any invoice as a PDF: /admin/invoices/<id>.pdf
 *
 * Staff only — the session is checked here, not assumed from the page that
 * linked to it, because a URL can always be opened directly. Unlike the
 * customer's route this serves drafts and cancelled invoices too, which is the
 * point: the office previews a draft before sending it. Those carry a DRAFT or
 * CANCELLED watermark across every page so a preview can never be mistaken for
 * the real thing once it has been forwarded.
 *
 * `admin_` keeps this out of the /admin page's route tree; see the note on the
 * trip editor route.
 */
export const Route = createFileRoute("/admin_/invoices/{$invoiceId}.pdf")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getCookie } = await import("@tanstack/react-start/server");
        const { sessionFromToken, SESSION_COOKIE } = await import("@/lib/auth");
        if (!(await sessionFromToken(getCookie(SESSION_COOKIE)))) {
          return new Response(null, { status: 302, headers: { location: "/admin" } });
        }

        const { invoiceForAdmin } = await import("@/lib/trips");
        const { buildInvoicePdf } = await import("@/lib/invoice-pdf");
        const facts = await invoiceForAdmin(params.invoiceId);
        if (!facts) return new Response("Not found.", { status: 404 });

        const watermark =
          facts.invoice.status === "void"
            ? "CANCELLED"
            : facts.invoice.status === "draft" || !facts.invoice.published
              ? "DRAFT"
              : null;
        const bytes = await buildInvoicePdf({ ...facts, watermark });

        return new Response(bytes as unknown as BodyInit, {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            // Inline for the office: they are checking it, not filing it.
            "content-disposition": `inline; filename="${facts.invoice.invoice_number}.pdf"`,
            "cache-control": "private, no-store",
            "x-robots-tag": "noindex, nofollow",
          },
        });
      },
    },
  },
});
