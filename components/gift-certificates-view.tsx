"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { GiftCertificate } from "@/types";
import { Panel } from "@/components/ui";
import { GiftCertificateFiltersPanel } from "@/components/gift-certificate-filters";
import { GiftCertificateTable } from "@/components/gift-certificate-table";
import {
  emptyFilters,
  hasActiveFilters,
  toSearchParams,
  type GiftCertificateFilters,
  type SortableColumn,
  type SortDirection,
  type SortState,
} from "@/lib/gift-certificate-filters";

interface GiftCertificatesViewProps {
  /** Rows already filtered and sorted on the server. */
  giftCertificates: GiftCertificate[];
  /** Total number of certificates before filtering. */
  totalCount: number;
  /** Current filter state, parsed from the URL on the server. */
  filters: GiftCertificateFilters;
  /** Current sort state, parsed from the URL on the server. */
  sort: SortState;
}

/** Delay before text edits hit the URL, to avoid a round-trip per keystroke. */
const FILTER_DEBOUNCE_MS = 300;

/**
 * Top-level client view for the listing page. Owns the page chrome (header)
 * and the filter/sort interactions. It does not filter or sort itself;
 * instead it translates UI interactions into URL changes, and the server
 * re-renders the rows. The URL is the single source of truth.
 */
export function GiftCertificatesView({
  giftCertificates,
  totalCount,
  filters,
  sort,
}: GiftCertificatesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Local mirror of the filter form so inputs stay responsive while the
  // server re-filters in the background.
  const [draft, setDraft] = useState<GiftCertificateFilters>(filters);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync the form when the server sends new state (e.g. back/forward nav).
  // Adjusting state during render is React's recommended way to reset state in
  // response to a prop change, avoiding an extra effect pass.
  const filtersKey = JSON.stringify(filters);
  const [syncedKey, setSyncedKey] = useState(filtersKey);
  if (filtersKey !== syncedKey) {
    setSyncedKey(filtersKey);
    setDraft(filters);
  }

  // Clean up any pending debounce on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function pushParams(
    nextFilters: GiftCertificateFilters,
    nextSort: SortState,
  ) {
    const queryString = toSearchParams(nextFilters, nextSort).toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function handleFiltersChange(next: GiftCertificateFilters) {
    setDraft(next);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      pushParams(next, sort);
    }, FILTER_DEBOUNCE_MS);
  }

  function handleReset() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setDraft(emptyFilters);
    pushParams(emptyFilters, sort);
  }

  // The table computes the next direction and reports it to us.
  function handleSort(column: SortableColumn, direction: SortDirection) {
    // Flush any pending filter edit alongside the sort so nothing is lost.
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pushParams(draft, { column, direction });
  }

  return (
    <main className="bg-slate-50 px-4 py-6 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Gift Certificates
          </h1>
          <p className="mt-1 text-slate-500">
            View, sort, and filter gift certificates purchased on your store.
          </p>
        </header>

        <GiftCertificateFiltersPanel
          filters={draft}
          onChange={handleFiltersChange}
          onReset={handleReset}
          canReset={hasActiveFilters(draft)}
        />

        <Panel>
          <p className="mb-4 text-sm text-slate-500">
            Showing {giftCertificates.length} of {totalCount} certificate
            {totalCount === 1 ? "" : "s"}
            {hasActiveFilters(filters) ? " (filtered)" : ""}.
          </p>

          <div
            className="transition-opacity duration-150"
            style={{ opacity: isPending ? 0.6 : 1 }}
          >
            <GiftCertificateTable
              giftCertificates={giftCertificates}
              sort={sort}
              onSort={handleSort}
            />
          </div>
        </Panel>
      </div>
    </main>
  );
}
