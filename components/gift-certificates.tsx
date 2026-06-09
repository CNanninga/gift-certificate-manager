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
 * Data layer for the listing. Fetches keyed by the filter/sort props. Filtering
 * and sorting are applied inside the fetch (as a real query would), not after
 * the fact. The dynamic request data (search params) is read upstream in
 * GiftCertificatesPage and handed in as props.
 */
export async function GiftCertificates({ filters, sort }: GiftCertificatesProps) {
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
