import { GiftCertificatesView } from "@/components/gift-certificates-view";
import { mockGiftCertificates } from "@/data/mock-gift-certificates";
import {
  filterGiftCertificates,
  searchParamsToFilters,
  searchParamsToSort,
  sortGiftCertificates,
} from "@/lib/gift-certificate-filters";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Normalizes Next's searchParams object into a URLSearchParams instance. */
function toURLSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      params.set(key, value[0]);
    }
  }
  return params;
}

export default async function Home({ searchParams }: HomeProps) {
  // Filtering and sorting run here on the server, driven entirely by the URL.
  // When this swaps to a real data source, the same params feed the query.
  const params = toURLSearchParams(await searchParams);
  const filters = searchParamsToFilters(params);
  const sort = searchParamsToSort(params);

  const allGiftCertificates = mockGiftCertificates;
  const visibleGiftCertificates = sortGiftCertificates(
    filterGiftCertificates(allGiftCertificates, filters),
    sort,
  );

  return (
    <GiftCertificatesView
      giftCertificates={visibleGiftCertificates}
      totalCount={allGiftCertificates.length}
      filters={filters}
      sort={sort}
    />
  );
}
