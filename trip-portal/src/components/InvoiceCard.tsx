import { Icon } from "./Icon";
import { balanceOf, money, INVOICE_STATUS_LABELS, type Invoice } from "@/lib/types";

/**
 * An invoice as the customer sees it.
 *
 * The balance is the largest number on the card, because it is the only figure
 * the reader is actually looking for. Everything else — line items, subtotal,
 * what they have already paid — is there to justify it.
 *
 * Two actions: download the PDF (for the employer, the visa file, the bank) and
 * arrange payment. There is no "Pay now" button, because the office takes
 * payment by transfer or at the Deira desk, and a button that looks like it
 * takes a payment but does not invites the customer to try, fail, and ring.
 */
export function InvoiceCard({
  invoice,
  pdfHref,
  onEngage,
}: {
  invoice: Invoice;
  pdfHref?: string | undefined;
  onEngage?: ((event: string, detail: string) => void) | undefined;
}) {
  const balance = balanceOf(invoice);
  const settled = Number(balance) <= 0;

  return (
    <article className="overflow-hidden rounded-3xl border border-hair bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-2.5 border-b border-hair bg-sand px-5 py-4">
        <span className="grid size-9 place-items-center rounded-xl bg-white text-gold-deep">
          <Icon name="receipt" className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-deep uppercase">
            Invoice
          </p>
          <p className="font-mono text-sm font-bold text-navy">{invoice.invoice_number}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
            invoice.status === "paid"
              ? "bg-live/12 text-live"
              : invoice.status === "part_paid"
                ? "bg-gold/20 text-gold-deep"
                : "bg-navy/8 text-navy"
          }`}
        >
          {INVOICE_STATUS_LABELS[invoice.status]}
        </span>
      </header>

      {invoice.items.length ? (
        <div className="overflow-x-auto px-5 pt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hair">
                <th className="py-2 text-left text-[10px] font-semibold tracking-wider text-muted uppercase">
                  Item
                </th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
                  Qty
                </th>
                <th className="py-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-hair last:border-0">
                  <td className="py-2.5 pr-2 text-ink">{item.description}</td>
                  <td className="px-2 py-2.5 text-right text-muted tabular-nums">
                    {Number(item.quantity)}
                  </td>
                  {/* nowrap: on a phone a long description squeezed this column
                      until "AED" and "4,499.97" landed on separate lines. An
                      amount split in two is an amount someone misreads. */}
                  <td className="py-2.5 text-right font-mono whitespace-nowrap text-ink tabular-nums">
                    {money(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="px-5 pt-3 pb-5">
        <dl className="flex flex-col gap-1.5 text-sm">
          <Row label="Subtotal" value={money(invoice.subtotal, invoice.currency)} />
          {Number(invoice.discount) > 0 ? (
            <Row label="Discount" value={`- ${money(invoice.discount, invoice.currency)}`} />
          ) : null}
          <Row label="Total" value={money(invoice.total, invoice.currency)} strong />
          {Number(invoice.amount_paid) > 0 ? (
            <Row label="Paid" value={money(invoice.amount_paid, invoice.currency)} />
          ) : null}
        </dl>

        <div
          className={`mt-4 flex items-baseline justify-between rounded-2xl px-4 py-3.5 ${
            settled ? "bg-live/10" : "bg-paper"
          }`}
        >
          <span className="text-xs font-semibold text-muted uppercase">
            {settled ? "Settled" : "Balance due"}
          </span>
          <span
            className={`font-mono text-xl font-bold whitespace-nowrap tabular-nums ${
              settled ? "text-live" : "text-navy"
            }`}
          >
            {money(settled ? "0" : balance, invoice.currency)}
          </span>
        </div>

        {invoice.due_date && !settled ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Icon name="calendar" className="size-3.5" /> Due by {invoice.due_date}
          </p>
        ) : null}
        {invoice.notes ? (
          <p className="mt-3 text-xs leading-relaxed whitespace-pre-line text-muted">
            {invoice.notes}
          </p>
        ) : null}

        <div className={`mt-4 grid gap-2 ${pdfHref && !settled ? "grid-cols-2" : "grid-cols-1"}`}>
          {pdfHref ? (
            <a
              href={pdfHref}
              download={`${invoice.invoice_number}.pdf`}
              onClick={() => onEngage?.("invoice_download", invoice.invoice_number)}
              className="flex items-center justify-center gap-2 rounded-xl border border-navy/20 bg-white py-3 text-sm font-semibold text-navy transition hover:border-navy"
            >
              <Icon name="download" className="size-4" /> Download PDF
            </a>
          ) : null}
          {!settled ? (
            <a
              href={`https://wa.me/971561228069?text=${encodeURIComponent(
                `Hello Nawi Saadi, I would like to pay invoice ${invoice.invoice_number}.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onEngage?.("invoice_pay_enquiry", invoice.invoice_number)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              <Icon name="chat" className="size-4" /> Arrange payment
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "font-semibold text-navy" : "text-muted"}>{label}</dt>
      <dd
        className={`font-mono whitespace-nowrap tabular-nums ${strong ? "font-bold text-navy" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}
