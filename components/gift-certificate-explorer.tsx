"use client";

import { useMemo, useState } from "react";
import type { GiftCertificate } from "@/types";
import { GiftCertificateFiltersPanel } from "@/components/gift-certificate-filters";
import { GiftCertificateTable } from "@/components/gift-certificate-table";
import {
  emptyFilters,
  filterGiftCertificates,
  hasActiveFilters,
  sortGiftCertificates,
  type GiftCertificateFilters,
  type SortableColumn,
  type SortState,
} from "@/lib/gift-certificate-filters";

interface GiftCertificateExplorerProps {
  giftCertificates: GiftCertificate[];
}

const DEFAULT_SORT: SortState = { column: "purchaseDate", direction: "desc" };

/**
 * Client-side container that owns the filter and sort state for the listing
 * and derives the visible rows from the full data set passed in by the server.
 */
export function GiftCertificateExplorer({
  giftCertificates,
}: GiftCertificateExplorerProps) {
  const [filters, setFilters] = useState<GiftCertificateFilters>(emptyFilters);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const visible = useMemo(() => {
    const filtered = filterGiftCertificates(giftCertificates, filters);
    return sortGiftCertificates(filtered, sort);
  }, [giftCertificates, filters, sort]);

  // Clicking a column toggles direction when already active, else selects it.
  function handleSort(column: SortableColumn) {
    setSort((current) =>
      current.column === column
        ? {
            column,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { column, direction: "asc" },
    );
  }

  const filtersActive = hasActiveFilters(filters);

  return (
    <div>
      <GiftCertificateFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
        canReset={filtersActive}
      />

      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        Showing {visible.length} of {giftCertificates.length} certificate
        {giftCertificates.length === 1 ? "" : "s"}
        {filtersActive ? " (filtered)" : ""}.
      </p>

      <GiftCertificateTable
        giftCertificates={visible}
        sort={sort}
        onSort={handleSort}
      />
    </div>
  );
}
