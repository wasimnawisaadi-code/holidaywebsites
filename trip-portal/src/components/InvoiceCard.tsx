import { balanceOf, money, INVOICE_STATUS_LABELS, type Invoice } from "@/lib/types";

/**
 * An invoice as the customer sees it.
 *
 * The balance is the largest number on the card, because it is the only figure
 * the reader is actually looking for. Everything else — line items, subtotal,
 * what they have already paid — is there to justify it.
 *
 * No payment button. The office takes payment by transfer or in the Deira
 * office, and a "Pay now" control that does not actually take a payment is
 * worse than none: it invites the customer to try, fail, and then ring to ask
 * why. The WhatsApp link is honest about what happens next.
 */
export function InvoiceCard({
  invoice,
  onEngage,
}: {
  invoice: Invoice;
  onEngage?: ((event: string, detail: string) => void) | undefined;
}) {
  const balance = balanceOf(invoice);
  const settled = Number(balance) <= 0;

  return (
    <article className="overflow-hidden rounded-xl border border-hair bg-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-hair bg-paper px-4 py-3">
        <span className="font-mono text-xs font-bold text-navy">{invoice.invoice_number}</span>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
            invoice.status === "paid"
              ? "bg-live/12 text-live"
              : invoice.status === "part_paid"
                ? "bg-gold/18 text-gold-deep"
                : "bg-navy/8 text-navy"
          }`}
        >
          {INVOICE_STATUS_LABELS[invoice.status]}
        </span>
        <span className="ml-auto text-[11px] text-muted">Issued {invoice.issued_date}</span>
      </header>

      {invoice.items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hair">
                <th className="px-4 py-2 text-left text-[10px] font-semibold tracking-wider text-muted uppercase">
                  Item
                </th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-hair last:border-0">
                  <td className="px-4 py-2.5 text-ink">{item.description}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">
                    {Number(item.quantity)}
                  </td>
                  {/* nowrap: on a phone a long description squeezed this column
                      until "AED" and "4,499.97" landed on separate lines. An
                      amount split in two is an amount someone misreads. */}
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap tabular-nums text-ink">
                    {money(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="border-t border-hair px-4 py-3">
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
          className={`mt-3 flex items-baseline justify-between rounded-lg px-3.5 py-3 ${
            settled ? "bg-live/10" : "bg-navy/6"
          }`}
        >
          <span className="text-xs font-semibold text-muted uppercase">
            {settled ? "Settled" : "Balance due"}
          </span>
          <span
            className={`font-mono text-lg font-bold whitespace-nowrap tabular-nums ${
              settled ? "text-live" : "text-navy"
            }`}
          >
            {money(settled ? "0" : balance, invoice.currency)}
          </span>
        </div>

        {invoice.due_date && !settled ? (
          <p className="mt-2 text-xs text-muted">Due by {invoice.due_date}</p>
        ) : null}
        {invoice.notes ? (
          <p className="mt-2.5 text-xs leading-relaxed whitespace-pre-line text-muted">
            {invoice.notes}
          </p>
        ) : null}

        {!settled ? (
          <a
            href={`https://wa.me/971561228069?text=${encodeURIComponent(
              `Hello Nawi Saadi, I would like to pay invoice ${invoice.invoice_number}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onEngage?.("invoice_pay_enquiry", invoice.invoice_number)}
            className="mt-3 block rounded-lg bg-gold py-2.5 text-center text-xs font-bold text-navy"
          >
            Arrange payment on WhatsApp
          </a>
        ) : null}
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
