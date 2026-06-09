import {
  searchParamsToFilters,
  searchParamsToSort,
} from "@/lib/gift-certificate-filters";
import { GiftCertificates } from "@/components/gift-certificates";

interface GiftCertificatesPageProps {
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

/**
 * Reads the dynamic request data (search params) and parses it into filter and
 * sort state, then hands those values to the cached GiftCertificates component.
 * Reading search params makes this dynamic, which is why Home renders it inside
 * a Suspense boundary.
 */
export async function GiftCertificatesPage({
  searchParams,
}: GiftCertificatesPageProps) {
  const params = toURLSearchParams(await searchParams);
  const filters = searchParamsToFilters(params);
  const sort = searchParamsToSort(params);

  return <GiftCertificates filters={filters} sort={sort} />;
}
