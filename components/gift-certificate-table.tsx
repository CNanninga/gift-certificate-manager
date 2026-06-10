"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GiftCertificate, GiftCertificateStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge, type BadgeVariant } from "@/components/ui";
import { GiftCertificateActionsMenu } from "@/components/gift-certificate-actions-menu";
import type {
  SortableColumn,
  SortDirection,
  SortState,
} from "@/lib/gift-certificate-filters";

interface GiftCertificateTableProps {
  giftCertificates: GiftCertificate[];
  sort: SortState;
  onSort: (column: SortableColumn, direction: SortDirection) => void;
}

/** Badge color per lifecycle status. */
const STATUS_VARIANT: Record<GiftCertificateStatus, BadgeVariant> = {
  Active: "success",
  Pending: "warning",
  Expired: "secondary",
  Disabled: "danger",
};

interface ColumnDef {
  hash: SortableColumn | "actions";
  header: string;
  sortable: boolean;
  align?: "left" | "right" | "center";
  render: (gc: GiftCertificate) => ReactNode;
}

/**
 * Listing rendered as a plain HTML table with Tailwind styling. Sorting is
 * controlled by the URL (via the parent): clicking a sortable header toggles
 * direction when it's already the active column, otherwise sorts ascending.
 */
export function GiftCertificateTable({
  giftCertificates,
  sort,
  onSort,
}: GiftCertificateTableProps) {
  const router = useRouter();

  const columns: ColumnDef[] = [
    {
      hash: "code",
      header: "Certificate #",
      sortable: true,
      render: (gc) => (
        <Link
          href={`/gift-certificates/${gc.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {gc.code}
        </Link>
      ),
    },
    {
      hash: "status",
      header: "Status",
      sortable: true,
      render: (gc) => (
        <Badge label={gc.status} variant={STATUS_VARIANT[gc.status]} />
      ),
    },
    {
      hash: "originalAmount",
      header: "Original Value",
      sortable: true,
      align: "right",
      render: (gc) => formatCurrency(gc.originalAmount, gc.currencyCode),
    },
    {
      hash: "balance",
      header: "Balance",
      sortable: true,
      align: "right",
      render: (gc) => formatCurrency(gc.balance, gc.currencyCode),
    },
    {
      hash: "recipientName",
      header: "Recipient",
      sortable: true,
      render: (gc) => gc.recipient.name,
    },
    {
      hash: "recipientEmail",
      header: "Recipient Email",
      sortable: true,
      render: (gc) => gc.recipient.email,
    },
    {
      hash: "hasRegisteredCustomer",
      header: "Registered Customer",
      sortable: true,
      align: "center",
      render: (gc) => (
        <Badge
          label={gc.recipient.isRegisteredCustomer ? "Yes" : "No"}
          variant={gc.recipient.isRegisteredCustomer ? "success" : "secondary"}
        />
      ),
    },
    {
      hash: "purchaseDate",
      header: "Purchased",
      sortable: true,
      render: (gc) => formatDate(gc.purchaseDate),
    },
    {
      hash: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: (gc) => <GiftCertificateActionsMenu giftCertificate={gc} />,
    },
  ];

  function handleHeaderClick(column: SortableColumn) {
    const nextDirection: SortDirection =
      sort.column === column && sort.direction === "asc" ? "desc" : "asc";
    onSort(column, nextDirection);
  }

  const alignClass = (align?: "left" | "right" | "center") =>
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  if (giftCertificates.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        No gift certificates match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((column) => {
              const isSorted =
                column.sortable && sort.column === column.hash;
              const arrow = isSorted
                ? sort.direction === "asc"
                  ? " ▲"
                  : " ▼"
                : "";
              return (
                <th
                  key={column.hash}
                  scope="col"
                  className={`px-3 py-3 font-semibold text-slate-600 ${alignClass(column.align)}`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleHeaderClick(column.hash as SortableColumn)
                      }
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      {column.header}
                      <span className="text-xs">{arrow}</span>
                    </button>
                  ) : (
                    <span className="sr-only">{column.header || "Actions"}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {giftCertificates.map((gc) => (
            <tr
              key={gc.id}
              className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              onClick={() => router.push(`/gift-certificates/${gc.id}`)}
            >
              {columns.map((column) => (
                <td
                  key={column.hash}
                  className={`px-3 py-3 text-slate-700 ${alignClass(column.align)}`}
                  onClick={
                    column.hash === "code" || column.hash === "actions"
                      ? (event) => event.stopPropagation()
                      : undefined
                  }
                >
                  {column.render(gc)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
