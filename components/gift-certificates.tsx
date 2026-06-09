import { fetchGiftCertificates } from "@/data/mock-gift-certificates";
import {
  filterGiftCertificates,
  sortGiftCertificates,
  type GiftCertificateFilters,
  type SortState,
} from "@/lib/gift-certificate-filters";
import { GiftCertificatesView } from "@/components/gift-certificates-view";

interface GiftCertificatesProps {
  filters: GiftCertificateFilters;
  sort: SortState;
}

/**
 * Cached data layer for the listing. The `use cache` directive memoizes the
 * (simulated, latency-bearing) fetch keyed by the serializable filter/sort
 * props passed in, so repeating a query is instant while new queries pay the
 * fetch cost. The dynamic request data (search params) is read upstream in
 * GiftCertificatesPage and handed in as props — never read inside this scope.
 */
export async function GiftCertificates({ filters, sort }: GiftCertificatesProps) {
  "use cache";

  const all = await fetchGiftCertificates();
  const visible = sortGiftCertificates(
    filterGiftCertificates(all, filters),
    sort,
  );

  return (
    <GiftCertificatesView
      giftCertificates={visible}
      totalCount={all.length}
      filters={filters}
      sort={sort}
    />
  );
}
