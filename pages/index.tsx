import type { GetServerSideProps } from "next";
import { fetchGiftCertificates } from "@/data/mock-gift-certificates";
import {
  searchParamsToFilters,
  searchParamsToSort,
  type GiftCertificateFilters,
  type SortState,
} from "@/lib/gift-certificate-filters";
import type { GiftCertificate } from "@/types";
import { GiftCertificatesView } from "@/components/gift-certificates-view";

interface HomeProps {
  giftCertificates: GiftCertificate[];
  totalCount: number;
  filters: GiftCertificateFilters;
  sort: SortState;
}

/**
 * Listing page. The URL is the single source of truth for filter/sort state:
 * the client view updates the query string via next/router, which re-runs
 * `getServerSideProps`, which re-filters and re-sorts on the server. The page
 * component is a thin wrapper around the BigDesign `GiftCertificatesView`.
 */
export default function Home({
  giftCertificates,
  totalCount,
  filters,
  sort,
}: HomeProps) {
  return (
    <GiftCertificatesView
      giftCertificates={giftCertificates}
      totalCount={totalCount}
      filters={filters}
      sort={sort}
    />
  );
}

/** Normalizes Next's `context.query` object into a URLSearchParams instance. */
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context,
) => {
  const params = toURLSearchParams(context.query);
  const filters = searchParamsToFilters(params);
  const sort = searchParamsToSort(params);

  const { items, totalCount } = await fetchGiftCertificates(filters, sort);

  return {
    props: {
      giftCertificates: items,
      totalCount,
      filters,
      sort,
    },
  };
};
