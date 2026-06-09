import { fetchGiftCertificates } from "@/data/mock-gift-certificates";
import type {
  GiftCertificateFilters,
  SortState,
} from "@/lib/gift-certificate-filters";
import { GiftCertificatesView } from "@/components/gift-certificates-view";

interface GiftCertificatesProps {
  filters: GiftCertificateFilters;
  sort: SortState;
}

/**
 * Cached data layer for the listing. The `use cache` directive memoizes the
 * fetch keyed by the serializable filter/sort props, so repeating a query is
 * instant while a new query pays the fetch cost. Filtering and sorting are
 * applied inside the fetch (as a real query would), not after the fact. The
 * dynamic request data (search params) is read upstream in GiftCertificatesPage
 * and handed in as props — never read inside this cached scope.
 */
export async function GiftCertificates({ filters, sort }: GiftCertificatesProps) {
  // "use cache";

  const { items, totalCount } = await fetchGiftCertificates(filters, sort);

  return (
    <GiftCertificatesView
      giftCertificates={items}
      totalCount={totalCount}
      filters={filters}
      sort={sort}
    />
  );
}
