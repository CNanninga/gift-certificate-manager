"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/router";
import { Box, H1, Panel, Text } from "@bigcommerce/big-design";
import type { GiftCertificate } from "@/types";
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
    // Build a next/router query object from the serialized filter/sort params.
    // Pushing a `{ pathname, query }` object re-runs getServerSideProps, which
    // re-filters/sorts on the server — the URL stays the source of truth.
    const params = toSearchParams(nextFilters, nextSort);
    const query: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
    startTransition(() => {
      router.replace({ pathname: router.pathname, query }, undefined, {
        scroll: false,
      });
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

  // BigDesign's Table computes the next direction and reports it to us.
  function handleSort(column: SortableColumn, direction: SortDirection) {
    // Flush any pending filter edit alongside the sort so nothing is lost.
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pushParams(draft, { column, direction });
  }

  return (
    <Box backgroundColor="secondary20" padding={{ mobile: "medium", tablet: "xLarge" }}>
      <Box style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Box marginBottom="large">
          <H1 marginBottom="xSmall">Gift Certificates</H1>
          <Text color="secondary60" marginBottom="none">
            View, sort, and filter gift certificates purchased on your store.
          </Text>
        </Box>

        <GiftCertificateFiltersPanel
          filters={draft}
          onChange={handleFiltersChange}
          onReset={handleReset}
          canReset={hasActiveFilters(draft)}
        />

        <Panel>
          <Text color="secondary60">
            Showing {giftCertificates.length} of {totalCount} certificate
            {totalCount === 1 ? "" : "s"}
            {hasActiveFilters(filters) ? " (filtered)" : ""}.
          </Text>

          <Box
            style={{
              opacity: isPending ? 0.6 : 1,
              transition: "opacity 150ms ease",
            }}
          >
            <GiftCertificateTable
              giftCertificates={giftCertificates}
              sort={sort}
              onSort={handleSort}
            />
          </Box>
        </Panel>
      </Box>
    </Box>
  );
}
