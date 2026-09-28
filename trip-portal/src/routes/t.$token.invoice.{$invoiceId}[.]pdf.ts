import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * A customer's invoice as a PDF: /t/<token>/invoice/<id>.pdf
 *
 * The token is the credential, exactly as for the portal page, and every rule
 * the page applies is applied again in `invoiceForToken` — this URL can be
 * requested on its own, so it cannot rely on the page having checked anything.
 * Anything that does not resolve is a plain 404 with no detail, for the same
 * reason the portal's not-found page gives none: a distinguishable answer turns
 * the URL into a way to test guesses.
 *
 * Server modules are imported inside the handler so none of them can be pulled
 * into a client chunk through this route file.
 */
export const Route = createFileRoute("/t/$token/invoice/{$invoiceId}.pdf")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { invoiceForToken } = await import("@/lib/trips");
        const { buildInvoicePdf } = await import("@/lib/invoice-pdf");
        const { recordView } = await import("@/lib/views");

        const facts = await invoiceForToken(params.token, params.invoiceId);
        if (!facts) {
          return new Response("Not found.", {
            status: 404,
            headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
          });
        }

        const bytes = await buildInvoicePdf({ ...facts, watermark: null });
        // The office sees in the activity feed that the invoice was downloaded —
        // useful when chasing a payment ("they have it, they opened it on Tuesday").
        await recordView(facts.tripId, "invoice_download", facts.invoice.invoice_number);

        return new Response(bytes as unknown as BodyInit, {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `attachment; filename="${facts.invoice.invoice_number}.pdf"`,
            // A financial document for one named person: never cached by a CDN,
            // never indexed.
            "cache-control": "private, no-store",
            "x-robots-tag": "noindex, nofollow",
          },
        });
      },
    },
  },
});
