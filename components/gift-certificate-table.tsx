import type { GiftCertificate } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { RegisteredCustomerBadge } from "@/components/registered-customer-badge";
import type {
  SortableColumn,
  SortState,
} from "@/lib/gift-certificate-filters";

interface GiftCertificateTableProps {
  giftCertificates: GiftCertificate[];
  sort: SortState;
  onSort: (column: SortableColumn) => void;
}

type Align = "left" | "right" | "center";

interface ColumnConfig {
  key: SortableColumn;
  label: string;
  align: Align;
}

const COLUMNS: ColumnConfig[] = [
  { key: "code", label: "Certificate #", align: "left" },
  { key: "balance", label: "Balance", align: "right" },
  { key: "recipientName", label: "Recipient", align: "left" },
  { key: "recipientEmail", label: "Recipient Email", align: "left" },
  { key: "hasRegisteredCustomer", label: "Registered Customer", align: "center" },
  { key: "purchaseDate", label: "Purchased", align: "left" },
];

const alignClasses: Record<Align, string> = {
  left: "text-left justify-start",
  right: "text-right justify-end",
  center: "text-center justify-center",
};

const cellClasses = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortState["direction"];
}) {
  if (!active) {
    // Reserve space so sorting doesn't shift the header; reveal on hover.
    return (
      <span className="text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600">
        ↕
      </span>
    );
  }
  return (
    <span className="text-zinc-700 dark:text-zinc-200">
      {direction === "asc" ? "▲" : "▼"}
    </span>
  );
}

/**
 * Central listing of all gift certificates. Column headers act as sort
 * controls; the parent owns the sort state and the ordering of rows.
 */
export function GiftCertificateTable({
  giftCertificates,
  sort,
  onSort,
}: GiftCertificateTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            {COLUMNS.map((column) => {
              const active = sort.column === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={`group flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 ${alignClasses[column.align]}`}
                  >
                    {column.label}
                    <SortIndicator active={active} direction={sort.direction} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {giftCertificates.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                No gift certificates match your filters.
              </td>
            </tr>
          ) : (
            giftCertificates.map((gc) => (
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
