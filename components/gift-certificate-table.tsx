"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Flex,
  Link,
  Table,
  Text,
  type TableColumn,
  type TableSortDirection,
} from "@bigcommerce/big-design";
import type { GiftCertificate, GiftCertificateStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
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
const STATUS_VARIANT: Record<
  GiftCertificateStatus,
  "success" | "warning" | "secondary" | "danger"
> = {
  Active: "success",
  Pending: "warning",
  Expired: "secondary",
  Disabled: "danger",
};

/**
 * Listing rendered with BigDesign's Table. Sorting is controlled by the URL
 * (via the parent); the certificate code links through to the detail view.
 */
export function GiftCertificateTable({
  giftCertificates,
  sort,
  onSort,
}: GiftCertificateTableProps) {
  const router = useRouter();

  const columns: Array<TableColumn<GiftCertificate>> = [
    {
      hash: "code",
      header: "Certificate #",
      isSortable: true,
      render: (gc) => {
        const href = `/gift-certificates/${gc.id}`;
        return (
          <Link
            href={href}
            onClick={(event) => {
              event.preventDefault();
              router.push(href);
            }}
          >
            {gc.code}
          </Link>
        );
      },
    },
    {
      hash: "status",
      header: "Status",
      isSortable: true,
      render: (gc) => (
        <Badge label={gc.status} variant={STATUS_VARIANT[gc.status]} />
      ),
    },
    {
      hash: "originalAmount",
      header: "Original Value",
      align: "right",
      isSortable: true,
      render: (gc) => formatCurrency(gc.originalAmount, gc.currencyCode),
    },
    {
      hash: "balance",
      header: "Balance",
      align: "right",
      isSortable: true,
      render: (gc) => formatCurrency(gc.balance, gc.currencyCode),
    },
    {
      hash: "recipientName",
      header: "Recipient",
      isSortable: true,
      render: (gc) => gc.recipient.name,
    },
    {
      hash: "recipientEmail",
      header: "Recipient Email",
      isSortable: true,
      render: (gc) => gc.recipient.email,
    },
    {
      hash: "purchaseDate",
      header: "Purchased",
      isSortable: true,
      render: (gc) => formatDate(gc.purchaseDate),
    },
    {
      hash: "actions",
      header: "",
      hideHeader: true,
      align: "right",
      render: (gc) => <GiftCertificateActionsMenu giftCertificate={gc} />,
    },
  ];

  return (
    <Table
      keyField="id"
      itemName="gift certificates"
      columns={columns}
      items={giftCertificates}
      sortable={{
        columnHash: sort.column,
        direction: sort.direction === "asc" ? "ASC" : "DESC",
        onSort: (columnHash, direction: TableSortDirection) => {
          onSort(
            columnHash as SortableColumn,
            direction === "ASC" ? "asc" : "desc",
          );
        },
      }}
      emptyComponent={
        <Flex justifyContent="center" padding="xLarge">
          <Text color="secondary60">
            No gift certificates match your filters.
          </Text>
        </Flex>
      }
    />
  );
}
