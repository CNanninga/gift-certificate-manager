import type { GiftCertificate } from "@/types";
import { formatCurrency } from "@/lib/format";

interface GiftCertificateTooltipProps {
  giftCertificate: GiftCertificate;
  /** Viewport coordinates (fixed positioning) for the tooltip's top-left. */
  x: number;
  y: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

/**
 * Floating summary shown while hovering a row. Rendered into a portal with
 * fixed positioning so it is never clipped by the table container, and made
 * non-interactive so it doesn't interfere with the pointer.
 */
export function GiftCertificateTooltip({
  giftCertificate: gc,
  x,
  y,
}: GiftCertificateTooltipProps) {
  return (
    <div
      role="tooltip"
      style={{ left: x, top: y }}
      className="pointer-events-none fixed z-50 w-72 rounded-lg border border-zinc-200 bg-white p-3 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      <dl className="space-y-1.5">
        <Row
          label="Original amount"
          value={formatCurrency(gc.originalAmount, gc.currencyCode)}
        />
        <Row
          label="Current balance"
          value={formatCurrency(gc.balance, gc.currencyCode)}
        />
      </dl>

      <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />

      <dl className="space-y-1.5">
        <Row label="Sender" value={gc.sender.name} />
        <Row label="Sender email" value={gc.sender.email} />
        <Row label="Recipient" value={gc.recipient.name} />
        <Row label="Recipient email" value={gc.recipient.email} />
      </dl>
    </div>
  );
}
