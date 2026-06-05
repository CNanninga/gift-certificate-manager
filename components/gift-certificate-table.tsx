import type { GiftCertificate } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { RegisteredCustomerBadge } from "@/components/registered-customer-badge";

interface GiftCertificateTableProps {
  giftCertificates: GiftCertificate[];
}

const columnHeaderClasses =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

const cellClasses = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

/**
 * Central listing of all gift certificates. Read-only for this phase; rows
 * will eventually link through to a detail/management view.
 */
export function GiftCertificateTable({
  giftCertificates,
}: GiftCertificateTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th scope="col" className={columnHeaderClasses}>
              Certificate #
            </th>
            <th scope="col" className={`${columnHeaderClasses} text-right`}>
              Balance
            </th>
            <th scope="col" className={columnHeaderClasses}>
              Recipient
            </th>
            <th scope="col" className={columnHeaderClasses}>
              Recipient Email
            </th>
            <th scope="col" className={`${columnHeaderClasses} text-center`}>
              Registered Customer
            </th>
            <th scope="col" className={columnHeaderClasses}>
              Purchased
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {giftCertificates.map((gc) => (
            <tr
              key={gc.id}
              className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <td className={`${cellClasses} font-mono font-medium text-zinc-900 dark:text-zinc-100`}>
                {gc.code}
              </td>
              <td className={`${cellClasses} text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-100`}>
                {formatCurrency(gc.balance, gc.currencyCode)}
              </td>
              <td className={cellClasses}>{gc.recipient.name}</td>
              <td className={cellClasses}>
                <a
                  href={`mailto:${gc.recipient.email}`}
                  className="text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {gc.recipient.email}
                </a>
              </td>
              <td className={`${cellClasses} text-center`}>
                <RegisteredCustomerBadge value={gc.hasRegisteredCustomer} />
              </td>
              <td className={`${cellClasses} whitespace-nowrap`}>
                {formatDate(gc.purchaseDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
